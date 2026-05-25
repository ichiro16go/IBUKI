import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth";
import { hobbies } from "@/data/ibuki";

export type RecommendedHobby = {
  hobbyId: string;
  reason: string;
};

type RecommendationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; recommendations: RecommendedHobby[] }
  | { status: "error"; message: string };

type UseHobbyRecommendationsResult = {
  state: RecommendationState;
  recommend: (existingHobbyIds?: string[]) => Promise<void>;
  reset: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const IDLE_STATE: RecommendationState = { status: "idle" };

export function useHobbyRecommendations(): UseHobbyRecommendationsResult {
  const { session } = useAuth();
  const [state, setState] = useState<RecommendationState>(IDLE_STATE);

  const recommend = useCallback(
    async (existingHobbyIds: string[] = []) => {
      const providerToken = session?.provider_token;

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
            existing_hobby_ids: existingHobbyIds,
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
          recommendations: Array<{ hobby_id: string; reason: string }>;
        };

        const recommendations: RecommendedHobby[] = data.recommendations
          .filter((item) => hobbies.some((h) => h.id === item.hobby_id))
          .map((item) => ({ hobbyId: item.hobby_id, reason: item.reason }));

        setState({ status: "success", recommendations });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "おすすめの取得に失敗しました。";
        setState({ status: "error", message });
      }
    },
    [session],
  );

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, recommend, reset };
}
