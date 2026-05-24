# Supabase 開発フロー（コードベース管理）

このプロジェクトは、SupabaseのDB変更をSQL migrationで管理します。  
Studioで本番を直接編集する運用はしません。

## 1. 初回セットアップ（メンバー向け）

前提:

- Docker Desktop（またはDocker Engine）が起動している
- `npx supabase` が使える（Makefile経由で実行可能）

手順:

```bash
# 1) 依存関係
make install

# 2) Supabaseにログイン
make supabase-login

# 3) プロジェクトとリンク（refはPMから共有）
make supabase-link SUPABASE_PROJECT_REF=<your-project-ref>

# 4) ローカルSupabaseを起動
make supabase-start

# 5) migrationからローカルDBを再構築
make supabase-db-reset

# 6) フロント用の型生成
make supabase-types
```

> 既に `supabase/migrations/` に初期migrationがあるため、通常メンバーは `supabase db pull` を実行しません。

## 2. 日々の開発フロー

```bash
# 作業開始時
make supabase-start
make supabase-db-reset
make supabase-types
```

```bash
# 作業終了時
make supabase-stop
```

## 3. DB変更を入れるとき（必須フロー）

```bash
# 1) migration雛形を作る
make supabase-migration name=add_encounter_indexes
```

`supabase/migrations/<timestamp>_add_encounter_indexes.sql` を編集してDDLを書く。

```bash
# 2) migrationからローカル再構築
make supabase-db-reset

# 3) 型更新（frontend利用時）
make supabase-types
```

その後、migrationファイルと型ファイルをコミットする。

## 4. 本番反映

```bash
# リンク済みプロジェクトへ反映
make supabase-db-push
```

`db push` は破壊的変更を含む可能性があるため、必ずチーム合意後に実行する。

## 5. 参考コマンド一覧

| 目的 | コマンド |
|---|---|
| Supabaseログイン | `make supabase-login` |
| プロジェクトリンク | `make supabase-link SUPABASE_PROJECT_REF=<ref>` |
| ローカル起動/停止 | `make supabase-start` / `make supabase-stop` |
| migration作成 | `make supabase-migration name=<name>` |
| ローカルDB再構築 | `make supabase-db-reset` |
| 本番反映 | `make supabase-db-push` |
| TS型生成 | `make supabase-types` |
