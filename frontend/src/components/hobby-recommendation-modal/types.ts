import type { RecommendedHobby } from "@/hooks/use-hobby-recommendations";

export type ManualSukiInput = {
  title: string;
  category: string;
  detail: string;
};

export type Props = {
  visible: boolean;
  status: "loading" | "success" | "error" | "idle";
  recommendations?: RecommendedHobby[];
  errorMessage?: string;
  onClose: () => void;
  onAdd?: (hobby: RecommendedHobby) => void;
  onAddManual?: (input: ManualSukiInput) => void | Promise<void>;
  onRequestAiRecommendations?: () => void;
  onRetry?: () => void;
};
