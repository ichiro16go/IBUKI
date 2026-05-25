import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth";

export type RecommendedAction = {
  title: string;
  description: string;
  actionType: string;
};

type ActionRecommendationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; recommendations: RecommendedAction[] }
  | { status: "error" };

type UseActionRecommendationsResult = {
  state: ActionRecommendationState;
  fetchRecommendations: (
    hobbyTitle: string,
    hobbyCategory?: string,
    hobbyDetail?: string,
  ) => Promise<void>;
  reset: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

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
        setState({ status: "error" });
        return;
      }

      setState({ status: "loading" });

      try {
        const response = await fetch(`${API_URL}/api/hobby/action-recommend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            hobby_title: hobbyTitle,
            hobby_category: hobbyCategory,
            hobby_detail: hobbyDetail,
          }),
        });

        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const data = (await response.json()) as {
          recommendations: { title: string; description: string; action_type: string }[];
        };

        const recommendations: RecommendedAction[] = data.recommendations.map((item) => ({
          title: item.title,
          description: item.description,
          actionType: item.action_type,
        }));

        setState({ status: "success", recommendations });
      } catch {
        setState({ status: "error" });
      }
    },
    [session],
  );

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { state, fetchRecommendations, reset };
}
