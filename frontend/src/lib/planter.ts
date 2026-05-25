import type { Hobby } from "@/data/ibuki";
import type { Tables } from "@/lib/database.types";
import { formatRelativeTime, mapLikeCardToHobby } from "@/lib/encounters";
import { supabase } from "@/lib/supabase";

type LikeCardRelation = Tables<"like_cards"> | Tables<"like_cards">[] | null;

type PlanterItemWithCardRow = Tables<"planter_items"> & {
  like_card: LikeCardRelation;
};

type ActionLogRow = Tables<"suki_action_logs">;

export type PlanterGrowth = {
  actionCount: number;
  actionsToNextLevel: number;
  level: number;
  nextLevelProgressPercent: number;
};

export type PlanterActionLogItem = {
  actionType: string;
  actedAt: string;
  actedAtLabel: string;
  id: string;
  notes: string | null;
  title: string;
};

export type PlanterFeedItem = PlanterGrowth & {
  hobby: Hobby;
  id: string;
  lastActionAt: string | null;
  lastActionLabel: string;
  likeCardId: string;
  plantedAt: string;
  plantedAtLabel: string;
};

export type PlanterDetail = {
  item: PlanterFeedItem;
  logs: PlanterActionLogItem[];
};

const ACTIONS_PER_LEVEL = 4;

function normalizeLikeCard(relation: LikeCardRelation): Tables<"like_cards"> | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function deriveGrowth(actionCount: number): PlanterGrowth {
  const normalizedCount = Math.max(0, actionCount);
  const progressWithinLevel = normalizedCount % ACTIONS_PER_LEVEL;

  return {
    actionCount: normalizedCount,
    actionsToNextLevel:
      progressWithinLevel === 0 ? ACTIONS_PER_LEVEL : ACTIONS_PER_LEVEL - progressWithinLevel,
    level: Math.floor(normalizedCount / ACTIONS_PER_LEVEL) + 1,
    nextLevelProgressPercent: Math.round(
      (progressWithinLevel / ACTIONS_PER_LEVEL) * 100,
    ),
  };
}

function mapActionLog(log: ActionLogRow): PlanterActionLogItem {
  return {
    actionType: log.action_type,
    actedAt: log.acted_at,
    actedAtLabel: formatRelativeTime(log.acted_at),
    id: log.id,
    notes: log.notes,
    title: log.title,
  };
}

function buildPlanterFeedItem(
  planterItem: PlanterItemWithCardRow,
  logs: ActionLogRow[],
): PlanterFeedItem | null {
  const likeCard = normalizeLikeCard(planterItem.like_card);
  if (!likeCard) return null;

  const mappedLogs = logs
    .slice()
    .sort((left, right) => right.acted_at.localeCompare(left.acted_at));
  const latestAction = mappedLogs[0] ?? null;
  const growth = deriveGrowth(mappedLogs.length);

  return {
    ...growth,
    hobby: {
      ...mapLikeCardToHobby(likeCard),
      lastSeen: latestAction ? formatRelativeTime(latestAction.acted_at) : "まだアクションなし",
      savedAt: formatRelativeTime(planterItem.planted_at),
    },
    id: planterItem.id,
    lastActionAt: latestAction?.acted_at ?? null,
    lastActionLabel: latestAction ? formatRelativeTime(latestAction.acted_at) : "まだアクションなし",
    likeCardId: planterItem.like_card_id,
    plantedAt: planterItem.planted_at,
    plantedAtLabel: formatRelativeTime(planterItem.planted_at),
  };
}

async function fetchActionLogsForPlanterItems(planterItemIds: string[]) {
  if (planterItemIds.length === 0) {
    return new Map<string, ActionLogRow[]>();
  }

  const { data, error } = await supabase
    .from("suki_action_logs")
    .select("id, planter_item_id, user_id, action_type, title, notes, acted_at, created_at")
    .in("planter_item_id", planterItemIds)
    .order("acted_at", { ascending: false });

  if (error) throw error;

  const logsByPlanterItem = new Map<string, ActionLogRow[]>();

  for (const log of (data ?? []) as ActionLogRow[]) {
    const currentLogs = logsByPlanterItem.get(log.planter_item_id) ?? [];
    currentLogs.push(log);
    logsByPlanterItem.set(log.planter_item_id, currentLogs);
  }

  return logsByPlanterItem;
}

export async function fetchPlanterFeed(userId: string): Promise<PlanterFeedItem[]> {
  const { data, error } = await supabase
    .from("planter_items")
    .select(
      `
        id,
        user_id,
        like_card_id,
        source_saved_card_id,
        source_encounter_id,
        planted_at,
        created_at,
        like_card:like_cards!planter_items_like_card_id_fkey (
          id,
          title,
          category,
          detail,
          photo_url,
          created_at,
          updated_at,
          user_id
        )
      `,
    )
    .eq("user_id", userId)
    .order("planted_at", { ascending: false });

  if (error) throw error;

  const planterItems = (data ?? []) as PlanterItemWithCardRow[];
  const logsByPlanterItem = await fetchActionLogsForPlanterItems(
    planterItems.map((item) => item.id),
  );

  return planterItems
    .map((item) => buildPlanterFeedItem(item, logsByPlanterItem.get(item.id) ?? []))
    .filter((item): item is PlanterFeedItem => item !== null);
}

export async function fetchPlanterDetail(
  planterItemId: string,
  userId: string,
): Promise<PlanterDetail> {
  const { data, error } = await supabase
    .from("planter_items")
    .select(
      `
        id,
        user_id,
        like_card_id,
        source_saved_card_id,
        source_encounter_id,
        planted_at,
        created_at,
        like_card:like_cards!planter_items_like_card_id_fkey (
          id,
          title,
          category,
          detail,
          photo_url,
          created_at,
          updated_at,
          user_id
        )
      `,
    )
    .eq("id", planterItemId)
    .eq("user_id", userId)
    .maybeSingle<PlanterItemWithCardRow>();

  if (error) throw error;
  if (!data) throw new Error("planter item が見つかりませんでした");

  const logsByPlanterItem = await fetchActionLogsForPlanterItems([planterItemId]);
  const logs = logsByPlanterItem.get(planterItemId) ?? [];
  const item = buildPlanterFeedItem(data, logs);

  if (!item) throw new Error("planter item のカード情報を取得できませんでした");

  return {
    item,
    logs: logs.map(mapActionLog),
  };
}

export async function createPlanterItem({
  encounterId,
  likeCardId,
  savedCardId,
  userId,
}: {
  encounterId?: string | null;
  likeCardId: string;
  savedCardId?: string | null;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("planter_items")
    .upsert(
      {
        like_card_id: likeCardId,
        source_encounter_id: encounterId ?? null,
        source_saved_card_id: savedCardId ?? null,
        user_id: userId,
      },
      {
        ignoreDuplicates: false,
        onConflict: "user_id,like_card_id",
      },
    )
    .select("id, user_id, like_card_id, source_saved_card_id, source_encounter_id, planted_at, created_at")
    .single<Tables<"planter_items">>();

  if (error) throw error;
  return data;
}

export async function createPlanterActionLog({
  actionType,
  notes,
  planterItemId,
  title,
  userId,
}: {
  actionType: string;
  notes?: string;
  planterItemId: string;
  title: string;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("suki_action_logs")
    .insert({
      action_type: actionType,
      notes: notes?.trim() || null,
      planter_item_id: planterItemId,
      title: title.trim(),
      user_id: userId,
    })
    .select("id, planter_item_id, user_id, action_type, title, notes, acted_at, created_at")
    .single<ActionLogRow>();

  if (error) throw error;
  return mapActionLog(data);
}
