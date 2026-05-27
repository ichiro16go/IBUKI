/**
 * 後方互換re-exportバレル。
 * 既存の `import { ... } from "@/lib/encounters"` を壊さないために維持する。
 * 新規コードは encounter-mappers / encounter-api から直接インポートすること。
 */
export * from "./encounter-mappers";
export * from "./encounter-api";
