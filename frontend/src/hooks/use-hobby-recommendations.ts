import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth";
import { fetchWithAuth } from "@/lib/api-client";
import type { AsyncState } from "@/lib/types";

export type RecommendedHobby = {
  nameJa: string;
  nameEn: string;
  tags: string[];
  reason: string;
};

type RecommendationState = AsyncState<RecommendedHobby[]>;

type UseHobbyRecommendationsResult = {
  state: RecommendationState;
  recommend: () => Promise<void>;
  reset: () => void;
};

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
      const data = await fetchWithAuth<{
        recommendations: {
          name_ja: string;
          name_en: string;
          tags: string[];
          reason: string;
        }[];
      }>(
        "/api/hobby/recommend",
        {
          method: "POST",
          body: JSON.stringify({
            google_access_token: providerToken,
            google_refresh_token: providerRefreshToken,
          }),
        },
        accessToken,
      );

      const recommendations: RecommendedHobby[] = data.recommendations.map(
        (item) => ({
          nameJa: item.name_ja,
          nameEn: item.name_en,
          tags: item.tags,
          reason: item.reason,
        }),
      );

      setState({ status: "success", data: recommendations });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "おすすめの取得に失敗しました。";
      setState({ status: "error", message });
    }
  }, [session, providerToken, providerRefreshToken]);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, recommend, reset };
}
