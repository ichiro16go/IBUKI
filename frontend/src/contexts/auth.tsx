import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const configuredRedirectUrl = process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL?.trim();

type AuthUrlPayload =
  | { type: "error"; message: string }
  | { type: "tokens"; accessToken: string; refreshToken: string }
  | { type: "unknown" };

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  clearAuthError: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getAuthRedirectUrl() {
  return configuredRedirectUrl || makeRedirectUri({ path: "auth-callback" });
}

function parseAuthCallbackUrl(url: string): AuthUrlPayload {
  const { errorCode, params } = QueryParams.getQueryParams(url);

  const errorMessage =
    errorCode || params.error_description || params.error || null;

  if (errorMessage) {
    return { type: "error", message: errorMessage };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    return { type: "tokens", accessToken, refreshToken };
  }

  return { type: "unknown" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const processedAuthUrlsRef = useRef(new Set<string>());
  const inFlightAuthRequestsRef = useRef(new Map<string, Promise<boolean>>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const completeAuthSessionFromUrl = useCallback(async (url: string) => {
    if (!url) return false;
    if (processedAuthUrlsRef.current.has(url)) return true;

    const payload = parseAuthCallbackUrl(url);

    if (payload.type === "unknown") {
      return false;
    }

    const inFlightRequest = inFlightAuthRequestsRef.current.get(url);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request = (async () => {
      setIsLoading(true);
      setAuthError(null);

      if (payload.type === "error") {
        setAuthError(payload.message);
        setIsLoading(false);
        throw new Error(payload.message);
      }

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: payload.accessToken,
          refresh_token: payload.refreshToken,
        });

        if (error) throw error;

        setSession(data.session);
        processedAuthUrlsRef.current.add(url);
        return true;
      } catch (sessionError) {
        const message =
          sessionError instanceof Error
            ? sessionError.message
            : "サインインに失敗しました";
        setAuthError(message);
        throw sessionError;
      } finally {
        setIsLoading(false);
      }
    })();

    inFlightAuthRequestsRef.current.set(url, request);

    try {
      return await request;
    } finally {
      inFlightAuthRequestsRef.current.delete(url);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleUrl = async (url: string) => {
      try {
        await completeAuthSessionFromUrl(url);
      } catch {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      }
    };

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        void handleUrl(initialUrl);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [completeAuthSessionFromUrl]);

  const signInWithOAuth = async (provider: "google") => {
    const redirectUrl = getAuthRedirectUrl();
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          // youtube.readonly lets us read subscriptions, liked videos, and
          // playlists to power AI hobby recommendations.
          scopes: "https://www.googleapis.com/auth/youtube.readonly",
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("No OAuth URL returned");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type !== "success") {
        setIsLoading(false);
        return false;
      }

      const didComplete = await completeAuthSessionFromUrl(result.url);

      if (!didComplete) {
        return true;
      }

      return true;
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "サインインに失敗しました";
      setAuthError(message);
      setIsLoading(false);
      throw authError;
    }
  };

  const signInWithGoogle = () => signInWithOAuth("google");

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        authError,
        signInWithGoogle,
        clearAuthError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
