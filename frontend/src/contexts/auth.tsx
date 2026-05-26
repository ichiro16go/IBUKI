import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const configuredRedirectUrl =
  process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL?.trim();

// Supabase's setSession() does not accept provider_token/provider_refresh_token,
// so they are not present after restoring the Supabase session. We persist them
// ourselves and expose them through the auth context.
const PROVIDER_TOKEN_KEY = "google_provider_token";
const PROVIDER_REFRESH_TOKEN_KEY = "google_provider_refresh_token";

type AuthUrlPayload =
  | { type: "error"; message: string }
  | {
      type: "tokens";
      accessToken: string;
      refreshToken: string;
      providerToken: string | null;
      providerRefreshToken: string | null;
    }
  | { type: "unknown" };

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  /** Google OAuth token — required for YouTube API calls. */
  providerToken: string | null;
  /** Google OAuth refresh token — lets the backend refresh YouTube access. */
  providerRefreshToken: string | null;
  signInWithGoogle: () => Promise<boolean>;
  requestYouTubeAccess: () => Promise<boolean>;
  clearAuthError: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getAuthRedirectUrl() {
  return configuredRedirectUrl || makeRedirectUri({ path: "auth-callback" });
}

async function isSecureStorageAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function getStoredSecret(key: string) {
  if (await isSecureStorageAvailable()) {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue) return secureValue;
  }

  return AsyncStorage.getItem(key);
}

async function setStoredSecret(key: string, value: string) {
  if (await isSecureStorageAvailable()) {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.removeItem(key);
    return;
  }

  await AsyncStorage.setItem(key, value);
}

async function removeStoredSecret(key: string) {
  if (await isSecureStorageAvailable()) {
    await SecureStore.deleteItemAsync(key);
  }

  await AsyncStorage.removeItem(key);
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
    return {
      type: "tokens",
      accessToken,
      refreshToken,
      // provider_token is included in the hash by Supabase for implicit flow
      // but is not stored in the JWT — we must capture it here.
      providerToken: params.provider_token ?? null,
      providerRefreshToken: params.provider_refresh_token ?? null,
    };
  }

  return { type: "unknown" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [providerRefreshToken, setProviderRefreshToken] = useState<
    string | null
  >(null);
  const processedAuthUrlsRef = useRef(new Set<string>());
  const inFlightAuthRequestsRef = useRef(new Map<string, Promise<boolean>>());
  const shouldPersistProviderTokensRef = useRef(false);

  // Restore persisted provider tokens on mount.
  useEffect(() => {
    Promise.all([
      getStoredSecret(PROVIDER_TOKEN_KEY),
      getStoredSecret(PROVIDER_REFRESH_TOKEN_KEY),
    ]).then(([storedProviderToken, storedProviderRefreshToken]) => {
      if (storedProviderToken) setProviderToken(storedProviderToken);
      if (storedProviderRefreshToken) {
        setProviderRefreshToken(storedProviderRefreshToken);
      }
    });
  }, []);

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

    const shouldPersistProviderTokens = shouldPersistProviderTokensRef.current;

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

        if (shouldPersistProviderTokens && payload.providerToken) {
          setProviderToken(payload.providerToken);
          await setStoredSecret(PROVIDER_TOKEN_KEY, payload.providerToken);
        }

        if (shouldPersistProviderTokens && payload.providerRefreshToken) {
          setProviderRefreshToken(payload.providerRefreshToken);
          await setStoredSecret(
            PROVIDER_REFRESH_TOKEN_KEY,
            payload.providerRefreshToken,
          );
        }

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

  const signInWithOAuth = async (
    provider: "google",
    options?: {
      scopes?: string;
      shouldPersistProviderTokens?: boolean;
      queryParams?: Record<string, string>;
    },
  ) => {
    const redirectUrl = getAuthRedirectUrl();
    setIsLoading(true);
    setAuthError(null);
    shouldPersistProviderTokensRef.current =
      options?.shouldPersistProviderTokens ?? false;

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          scopes: options?.scopes,
          queryParams: options?.queryParams,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error("No OAuth URL returned");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );
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
        authError instanceof Error
          ? authError.message
          : "サインインに失敗しました";
      setAuthError(message);
      setIsLoading(false);
      throw authError;
    } finally {
      shouldPersistProviderTokensRef.current = false;
    }
  };

  const signInWithGoogle = () => signInWithOAuth("google");

  const requestYouTubeAccess = () =>
    signInWithOAuth("google", {
      scopes: "https://www.googleapis.com/auth/youtube.readonly",
      shouldPersistProviderTokens: true,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    });

  const signOut = async () => {
    setAuthError(null);
    setProviderToken(null);
    setProviderRefreshToken(null);
    await Promise.all([
      removeStoredSecret(PROVIDER_TOKEN_KEY),
      removeStoredSecret(PROVIDER_REFRESH_TOKEN_KEY),
    ]);
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
        providerToken,
        providerRefreshToken,
        signInWithGoogle,
        requestYouTubeAccess,
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
