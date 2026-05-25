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
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const configuredRedirectUrl = process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL?.trim();

type AuthUrlPayload =
  | { type: "error"; message: string }
  | { type: "pkce"; code: string }
  | { type: "implicit"; accessToken: string; refreshToken: string }
  | { type: "unknown" };

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  completeAuthSessionFromUrl: (url: string) => Promise<boolean>;
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

  const code = params.code;
  if (code) {
    return { type: "pkce", code };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    return { type: "implicit", accessToken, refreshToken };
  }

  return { type: "unknown" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      if (payload.type === "error") {
        throw new Error(payload.message);
      }

      if (payload.type === "pkce") {
        const { error } = await supabase.auth.exchangeCodeForSession(payload.code);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.setSession({
          access_token: payload.accessToken,
          refresh_token: payload.refreshToken,
        });
        if (error) throw error;
      }

      processedAuthUrlsRef.current.add(url);
      return true;
    })();

    inFlightAuthRequestsRef.current.set(url, request);

    try {
      return await request;
    } finally {
      inFlightAuthRequestsRef.current.delete(url);
    }
  }, []);

  const signInWithOAuth = async (provider: "google" | "apple") => {
    const redirectUrl = getAuthRedirectUrl();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("No OAuth URL returned");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type !== "success") {
      return false;
    }

    const didComplete = await completeAuthSessionFromUrl(result.url);

    if (!didComplete) {
      throw new Error("認証結果を処理できませんでした。もう一度お試しください。");
    }

    return true;
  };

  const signInWithGoogle = () => signInWithOAuth("google");

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signInWithGoogle,
        completeAuthSessionFromUrl,
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
