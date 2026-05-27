import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth";
import { fetchWithAuth } from "@/lib/api-client";
import type { AsyncState } from "@/lib/types";

export type RecommendedAction = {
  title: string;
  description: string;
  actionType: string;
};

type ActionRecommendationState = AsyncState<RecommendedAction[]>;

type UseActionRecommendationsResult = {
  state: ActionRecommendationState;
  fetchRecommendations: (
    hobbyTitle: string,
    hobbyCategory?: string,
    hobbyDetail?: string,
  ) => Promise<void>;
  reset: () => void;
};

const IDLE_STATE: ActionRecommendationState = { status: "idle" };

export function useActionRecommendations(): UseActionRecommendationsResult {
  const { session } = useAuth();
  const [state, setState] = useState<ActionRecommendationState>(IDLE_STATE);

  const fetchRecommendations = useCallback(
    async (
      hobbyTitle: string,
      hobbyCategory: string = "",
      hobbyDetail: string = "",
    ) => {
      const accessToken = session?.access_token;
      if (!accessToken) {
        setState({ status: "error", message: "セッションが無効です。" });
        return;
      }

      setState({ status: "loading" });

      try {
        const data = await fetchWithAuth<{
          recommendations: { title: string; description: string; action_type: string }[];
        }>(
          "/api/hobby/action-recommend",
          {
            method: "POST",
            body: JSON.stringify({
              hobby_title: hobbyTitle,
              hobby_category: hobbyCategory,
              hobby_detail: hobbyDetail,
            }),
          },
          accessToken,
        );

        const recommendations: RecommendedAction[] = data.recommendations.map((item) => ({
          title: item.title,
          description: item.description,
          actionType: item.action_type,
        }));

        setState({ status: "success", data: recommendations });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "アクション提案の取得に失敗しました。";
        setState({ status: "error", message });
      }
    },
    [session],
  );

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, fetchRecommendations, reset };
}
