/**
 * 非同期操作の状態を表す汎用判別型ユニオン。
 * 各フックでインラインで定義していたパターンをこの型で統一する。
 */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message?: string };
