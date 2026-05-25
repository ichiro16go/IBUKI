import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth";

export type RecommendedHobby = {
  nameJa: string;
  nameEn: string;
  tags: string[];
  reason: string;
};

type RecommendationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; recommendations: RecommendedHobby[] }
  | { status: "error"; message: string };

type UseHobbyRecommendationsResult = {
  state: RecommendationState;
  recommend: () => Promise<void>;
  reset: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const IDLE_STATE: RecommendationState = { status: "idle" };

export function useHobbyRecommendations(): UseHobbyRecommendationsResult {
  const { session, providerToken, providerRefreshToken } = useAuth();
  const [state, setState] = useState<RecommendationState>(IDLE_STATE);

  const recommend = useCallback(async () => {
    if (!providerToken) {
      setState({
        status: "error",
        message:
          "YouTubeへのアクセス権限がありません。\nGoogleでサインインし直してください。",
      });
      return;
    }

    setState({ status: "loading" });

    const accessToken = session?.access_token;
    if (!accessToken) {
      setState({
        status: "error",
        message: "セッションが無効です。サインインし直してください。",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/hobby/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          google_access_token: providerToken,
          google_refresh_token: providerRefreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          response.status === 401
            ? "認証エラーが発生しました。サインインし直してください。"
            : `サーバーエラー (${response.status})${errorText ? `: ${errorText}` : ""}`,
        );
      }

      const data = (await response.json()) as {
        recommendations: {
          name_ja: string;
          name_en: string;
          tags: string[];
          reason: string;
        }[];
      };

      const recommendations: RecommendedHobby[] = data.recommendations.map(
        (item) => ({
          nameJa: item.name_ja,
          nameEn: item.name_en,
          tags: item.tags,
          reason: item.reason,
        }),
      );

      setState({ status: "success", recommendations });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "おすすめの取得に失敗しました。";
      setState({ status: "error", message });
    }
  }, [session, providerToken, providerRefreshToken]);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, recommend, reset };
}
