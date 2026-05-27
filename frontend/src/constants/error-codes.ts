/**
 * PostgREST エラーコード定数。
 * 参照: https://postgrest.org/en/stable/references/errors.html
 */
export const PGRST = {
  /** .single() クエリで行が見つからなかった */
  NOT_FOUND: "PGRST116",
  /** .single() クエリで複数行が返された */
  MULTIPLE_ROWS: "PGRST103",
} as const;
