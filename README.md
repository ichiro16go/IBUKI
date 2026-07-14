<div id="top"></div>

## 使用技術一覧

<p style="display: inline">
  <!-- フロントエンド -->
  <img src="https://img.shields.io/badge/-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/-React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/-Expo-000020.svg?logo=expo&style=for-the-badge">
  <img src="https://img.shields.io/badge/-TypeScript-3178C6.svg?logo=typescript&style=for-the-badge&logoColor=white">
  <!-- バックエンド(FW / 言語) -->
  <img src="https://img.shields.io/badge/-FastAPI-009688.svg?logo=fastapi&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-Python-F2C63C.svg?logo=python&style=for-the-badge">
  <img src="https://img.shields.io/badge/-uv-DE5FE9.svg?logo=uv&style=for-the-badge&logoColor=white">
  <!-- データ / 認証 -->
  <img src="https://img.shields.io/badge/-Supabase-3ECF8E.svg?logo=supabase&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-PostgreSQL-4169E1.svg?logo=postgresql&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-OpenAI-412991.svg?logo=openai&style=for-the-badge&logoColor=white">
  <!-- インフラ / ツール -->
  <img src="https://img.shields.io/badge/-ngrok-1F1E37.svg?logo=ngrok&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-githubactions-2088FF.svg?logo=github-actions&style=for-the-badge&logoColor=white">
</p>

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)
5. [トラブルシューティング](#トラブルシューティング)

<br />
<div align="right">
    <a href="./HACKATHON.md"><strong>ハッカソン提出ドキュメント »</strong></a>
</div>
<br />
<div align="right">
    <a href="./docs/supabase-development.md"><strong>Supabase 開発ガイド »</strong></a>
</div>
<br />

## プロダクト名

Ibuki — 偶発的な "suki" を育てるアプリ

## プロジェクトについて

現代の SNS や動画プラットフォームは、ユーザーの行動履歴をもとにコンテンツを最適化するアルゴリズムによって運営されており、思いがけない趣味や価値観との偶然の出会いが失われている。

Ibuki は、リアルな「すれ違い」を起点に知らなかった趣味と出会い、調べる・触れるアクションを通じてそれを育てていく体験を提供するモバイルアプリである。

- **frontend**: Expo (React Native) 製のモバイルアプリ
- **backend**: FastAPI 製の API サーバー（OpenAI・Google API 連携）
- **supabase**: 認証・データベース（PostgreSQL）・Edge Functions

  <p align="left">
    <br />
    <a href="./HACKATHON.md"><strong>プロダクト詳細（プロダクト概要・課題・ターゲット） »</strong></a>
    <br />
    <br />

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境

| 言語・フレームワーク | バージョン    |
| -------------------- | ------------- |
| Python               | 3.12 以上     |
| FastAPI              | 0.115.0 以上  |
| React                | 19.1.0        |
| React Native         | 0.81.5        |
| Expo SDK             | 54            |
| TypeScript           | 5.9.2         |
| Supabase CLI         | 2.101.0       |
| PostgreSQL           | Supabase 提供 |

その他のパッケージのバージョンは `backend/pyproject.toml` と `frontend/package.json` を参照してください

<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構成

```
❯ tree -a -I "node_modules|.git|.venv|.expo|__pycache__|.ruff_cache" -L 2
.
├── .github
│   ├── ISSUE_TEMPLATE
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows
├── AI_USAGE_LOG.md
├── HACKATHON.md
├── LICENSE
├── Makefile
├── README.md
├── backend
│   ├── .env.example
│   ├── pyproject.toml
│   ├── src
│   └── uv.lock
├── docs
│   ├── design
│   ├── marketing
│   ├── meeting_log
│   ├── orientation_slide
│   ├── reference
│   ├── requirement_definition.md
│   └── supabase-development.md
├── frontend
│   ├── .env.example
│   ├── app.json
│   ├── eas.json
│   ├── eslint.config.js
│   ├── metro.config.js
│   ├── package.json
│   ├── src
│   └── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── supabase
    ├── config.toml
    ├── functions
    ├── migrations
    └── seed.sql
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

事前に以下をインストールしておくこと。

- [uv](https://docs.astral.sh/uv/)（バックエンド）
- Node.js / npm（フロントエンド）
- [ngrok](https://ngrok.com/)（実機からバックエンドへ接続する場合）

### 環境変数ファイルの作成

`backend/.env.example` と `frontend/.env.example` を元に、それぞれ `.env` を作成する（[環境変数の一覧](#環境変数の一覧)を参照）。

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 依存関係のインストール

```
make install
```

### バックエンドの起動

FastAPI の開発サーバーを起動する（http://127.0.0.1:8000 ）。

```
make backend
```

### フロントエンドの起動

Expo の開発サーバーを起動する。表示された QR コードを Expo Go アプリで読み込むか、`i` / `a` でシミュレータを起動する。

実機と PC が同じ Wi-Fi にいる場合（LAN 接続・高速）:

```
make frontend
```

実機が別ネットワークにいる場合（ngrok 経由の tunnel 接続・低速）:

```
make frontend-tunnel
```

### 動作確認

http://127.0.0.1:8000/docs にアクセスし、FastAPI の Swagger UI が表示されれば成功。

### 環境変数の一覧

#### backend/.env

| 変数名               | 役割                                                    | 例                                        |
| -------------------- | ------------------------------------------------------- | ----------------------------------------- |
| OPENAI_API_KEY       | OpenAI API のキー                                       | sk-...                                     |
| CORS_ORIGINS         | CORS で許可するオリジン（カンマ区切り。未設定は全拒否） | http://localhost:8081,https://example.com |
| SUPABASE_URL         | Supabase プロジェクトの URL                             | https://your-project-ref.supabase.co      |
| SUPABASE_ANON_KEY    | Supabase の anon キー                                   | your-anon-key                             |
| GOOGLE_CLIENT_ID     | Google OAuth のクライアント ID                          |                                           |
| GOOGLE_CLIENT_SECRET | Google OAuth のクライアントシークレット                 |                                           |

#### frontend/.env

| 変数名                        | 役割                          | 例                                   |
| ----------------------------- | ----------------------------- | ------------------------------------ |
| EXPO_PUBLIC_SUPABASE_URL      | Supabase プロジェクトの URL   | https://your-project-ref.supabase.co |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase の anon キー         | your-anon-key                        |
| EXPO_PUBLIC_API_URL           | バックエンド API のベース URL | http://127.0.0.1:8000                |

### コマンド一覧

| Make                    | 実行する処理                                   | 元のコマンド                                                                                    |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| make install            | フロント・バックエンドの依存関係をインストール | cd backend && uv sync --dev<br>cd frontend && npm ci                                             |
| make backend            | FastAPI 開発サーバーを 8000 番で起動           | cd backend && uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000                    |
| make tunnel             | ngrok で 8000 番ポートを公開                   | ngrok http 8000                                                                                 |
| make frontend           | Expo 開発サーバーを tunnel モードで起動        | cd frontend && npx expo start --tunnel                                                          |
| make format             | フロントを Prettier、バックエンドを Ruff で整形 | npm run format --prefix frontend<br>cd backend && uv run ruff format .                           |
| make supabase-login     | Supabase CLI で認証                            | npx supabase login                                                                             |
| make supabase-init      | ローカルの supabase/config.toml を作成         | npx supabase init                                                                              |
| make supabase-link      | リモートプロジェクトにリンク                   | npx supabase link --project-ref ...                                                            |
| make supabase-start     | ローカル Supabase コンテナを起動               | npx supabase start                                                                             |
| make supabase-stop      | ローカル Supabase コンテナを停止               | npx supabase stop                                                                              |
| make supabase-migration | マイグレーションを作成（name=... を指定）       | npx supabase migration new $(name)                                                             |
| make supabase-db-push   | ローカルのマイグレーションをリンク先へ反映     | npx supabase db push                                                                           |
| make supabase-db-reset  | マイグレーションからローカル DB をリセット     | npx supabase db reset                                                                          |
| make supabase-types     | DB の TypeScript 型を生成                      | npx supabase gen types typescript --linked --schema public > frontend/src/lib/database.types.ts |

### 実機からバックエンドへ接続する場合

実機の Expo Go からローカルのバックエンドへ接続するには、別ターミナルで `make tunnel` を実行し、発行された ngrok の URL を `frontend/.env` の `EXPO_PUBLIC_API_URL` に設定する。

## トラブルシューティング

### .env: no such file or directory

`.env` ファイルがありません。[環境変数の一覧](#環境変数の一覧)を参考に `backend/.env`・`frontend/.env` を作成してください。

### uv: command not found

uv がインストールされていません。[公式ドキュメント](https://docs.astral.sh/uv/)を参考にインストールしてください。

### Expo Go でアプリが読み込めない / API に接続できない

実機からローカルのバックエンドへは直接届きません。`make tunnel` で ngrok を起動し、その URL を `frontend/.env` の `EXPO_PUBLIC_API_URL` に設定してください。

### CORS エラーが発生する

`backend/.env` の `CORS_ORIGINS` に、フロントエンドのオリジン（Expo の場合は `http://localhost:8081` など）が含まれているか確認してください。未設定の場合はすべて拒否されます。

### CommandError: ngrok tunnel took too long to connect

`make frontend-tunnel` で ngrok のトンネル確立がタイムアウトした場合のエラーです。実機と PC が同じ Wi-Fi にいるなら `make frontend`（LAN 接続）で起動してください。別ネットワークの実機で tunnel が必要な場合は、通信環境を変えて再試行するか、時間をおいて再実行してください。

<p align="right">(<a href="#top">トップへ</a>)</p>
