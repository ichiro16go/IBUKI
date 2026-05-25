# Team 06 — Engineer Guild Hackathon 2026/05

> **1行ピッチ（30字以内）**： 最適化された「好き」が蔓延る昨今、敢えて無作為な「好き」を拾って育てていこう。

## スクリーンショット

<!-- README先頭の見栄え兼SNS素材。Day2 終了までに最低1枚は貼る -->

| メイン画面 | 主要機能 |
|---|---|
| `docs/screenshot-main.png` を貼る | `docs/screenshot-feature.png` を貼る |

## チーム情報

| 項目 | 内容 |
|---|---|
| チーム名 | 彩吹 |
| プロダクト名 | Ibuki |
| 担当メンター | 未定 |

### メンバー

| GitHub | 氏名 | 大学 / 学部 | 担当役割 |
|---|---|---|---|
| @Kanahe1800 | 今村心香 | University of Victoria, Geomatics | BE |
| @taisei0719 | 永田泰誠 | 大阪大学大学院 情報科学研究科 | FE/BE |
| @yuseiwnl | 森有生 | 慶應義塾大学 経済学部 | Design / FE/ BE|
| @ichiro16go | 宮本一路 | 早稲田大学 基幹理工学部 | PM |

担当役割の凡例：**PM** / **BE**（Backend）/ **FE**（Frontend）/ **Design** / **Infra** / **Data** / その他

## プロダクト概要

> 現代のSNSアルゴリズムは最適化された情報しか届けず、思いがけない趣味との偶然の出会いが失われている。本プロダクトは、リアルな「すれ違い」を起点に知らなかった趣味と出会い、調べる・触れるアクションを通じてそれを育てていく体験を提供するアプリである。

### 解決したい課題

現代のSNSや動画プラットフォームは、ユーザーの行動履歴をもとにコンテンツを最適化するアルゴリズムによって運営されている。これにより、ユーザーは自分がすでに興味を持っているものに近い情報しか受け取れなくなり、思いがけない趣味や価値観との偶然の出会いが失われている。

### ターゲットユーザー

#### メインターゲット：20代〜30代の「刺激不足」を感じている社会人

毎日の通勤時間にSNSやYouTubeを眺めているが、表示されるのは自分の好みに最適化されたコンテンツばかり。
新しい発見や驚きが減り、どこか物足りなさを感じている層。
新しい趣味を持ちたいという欲求はあるが、何から始めればいいかわからない状態にある。

#### サブターゲット：レアな趣味を持つ30代後半のニッチ愛好家

自分の好きなものへの熱量は高いが、周囲に同じ趣味の人が少なく、共有する場がない。
アルゴリズムではリーチできない層に自分の趣味を知ってもらいたいと思っている。
受け取る側ではなく、**発信・共有する側**のユーザーとして、アプリのコンテンツを支える存在。

#### 共通する特徴

- スマートフォンを日常的に持ち歩いている
- 既存のSNSのアルゴリズムに疲れや違和感を感じている
- 「人との繋がり」よりも先に「趣味・コンテンツ」を通じた緩やかな接点を好む

### コア機能

#### 1. すれ違い通信機能

位置情報をもとに、同じ時間・同じ場所にいたユーザーを自動的にマッチングする。
GPS ログを一定間隔でサーバーに送信し、近接していたユーザーを「すれ違い」として記録する。

#### 2. すれ違い趣味表示機能

すれ違ったユーザーが登録している「好き」（趣味・興味）をカード形式で表示する。
アルゴリズムによるレコメンドではなく、偶然の出会いによってのみ新しい趣味が届く。

#### 3. 好き登録機能

自分の趣味・好きなものを「好きカード」として登録する。
趣味は多層構造（例：音楽 → ジャンル → アーティスト → 曲）で細かく設定できる。

## 提出ステータス（運営チェック用 — 各 Day 終了時に記入）

- [ ] **Day1 終了時**：テーマ確定（プロダクト名・解決課題・ターゲットを記入済み）
- [ ] **Day2 終了時**：MVP 動作（デプロイ済み URL が下記「デモ環境」欄に入っている）
- [ ] **Day3 終了時**：提出完了（プレゼン資料 URL / デモ動画 URL / AI 活用ログ完成）

## 提出物チェックリスト（Day3 17:00 提出〆切）

- [ ] 動くデモ（デプロイ済み URL を「デモ環境」欄に記載）
- [ ] ソースコード（このリポに push 済み）
- [ ] [`AI_USAGE_LOG.md`](./AI_USAGE_LOG.md)（AI 活用ログ、開発期間中の追記必須）
- [ ] プレゼン資料（PDF or Slides URL を記載）
- [ ] デモ動画（任意・1 分以内・URL 記載）

## デモ・関連リンク

| 種別 | URL |
|---|---|
| デモ環境 | （Vercel / Render / Netlify 等） |
| プレゼン資料 | （Google Slides / Notion / Speakerdeck） |
| デモ動画 | （YouTube / Loom） |

## 技術スタック

- **フロント**： react native
- **バックエンド**： supabase
- **インフラ**： supabase
- **利用 AI ツール**： claude code

### 使用した外部 API / サービス

| サービス名 | 用途 | プラン | 備考 |
|---|---|---|---|
| 例: OpenAI API | 〜の生成 | Pay-as-you-go | 概算コスト ¥XX |
| | | | |

→ API キー・秘匿情報は `.env`（`.gitignore` 対象）で管理。公開リポ化に備えて漏らさないこと。

## セットアップ手順

```bash
# 依存関係のインストール
make install
```

```bash
# Supabase（初回のみ）
make supabase-login
make supabase-link SUPABASE_PROJECT_REF=<your-project-ref>
make supabase-start
make supabase-db-reset
make supabase-types
```

```bash
# フロントエンド起動
cd frontend
npx expo start --tunnel
```

```bash
# バックエンド起動（必要な場合）
cd backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# ngrok インストール（初回のみ・Homebrew 使用）
brew install ngrok/ngrok/ngrok
```

```bash
# ngrok でバックエンドを外部公開（フロントエンドから実機アクセスする場合）
ngrok http 8000
```

```bash
# 検証環境DB起動
make supabase-start
```

### 開発でよく使うコマンド

| 目的 | コマンド |
|---|---|
| 依存関係インストール | `make install` |
| Supabase CLIログイン | `make supabase-login` |
| Supabaseプロジェクト紐づけ | `make supabase-link SUPABASE_PROJECT_REF=<ref>` |
| Supabaseローカル起動/停止 | `make supabase-start` / `make supabase-stop` |
| migration新規作成 | `make supabase-migration name=<migration_name>` |
| migrationからローカルDB再構築 | `make supabase-db-reset` |
| linked先へmigration反映 | `make supabase-db-push` |
| TypeScript型再生成 | `make supabase-types` |

### Supabase運用ルール（重要）

- 本番Supabaseは直接編集しない。**必ずmigrationを作って管理**する。
- schema変更後は `make supabase-db-reset` と `make supabase-types` を実行する。
- migrationと型ファイルを同じPRでレビューする。

詳細は [`docs/supabase-development.md`](./docs/supabase-development.md) を参照。

### 開発ドキュメント

- Supabase開発フロー: [`docs/supabase-development.md`](./docs/supabase-development.md)
- デザインガイドライン: [`docs/design-guidelines.md`](./docs/design-guidelines.md)

## 既知の問題 / 未実装機能（Day3 審査員向け）

開発期間が短いため、Day3 提出時点で「ここまでやった／ここは諦めた」を正直に書く。
**正直に書くことは減点ではなく加点要素**（自己評価力として審査される）。

- 未実装：（例）多言語対応 — 時間切れのため
- 既知の問題：（例）モバイル Safari でレイアウト崩れあり — 開発機の Chrome では再現せず

## 担当メンター・壁打ち履歴

メンター壁打ちの議事録。スポンサー側が事後に振り返る材料にもなるので、要点だけでも記入する。

| 日時 | メンター | 議論内容（要点） | 採用 / 一部採用 / 不採用 |
|---|---|---|---|
| Day1 14:00 | （例）Mercari 坂本さん | コア機能の絞り込み | 採用 |
| Day2 11:00 |  |  |  |

## AI 活用ログ

審査項目「AI 活用度」の根拠資料 → [`AI_USAGE_LOG.md`](./AI_USAGE_LOG.md)

開発期間中に最低 1 日 3 件以上の追記を目安に。

## 公開許諾（チーム全員合意のうえ記入 — Day3 終了時までに）

提出後の運営側での扱いに関するチーム全員合意です。**いずれも N で構いません（審査に一切影響なし）**。

| 項目 | 許諾 (Y/N) | 補足・条件 |
|---|---|---|
| ① このリポを **Public 化**してよい（コードがすべて公開される） | | |
| ② プロダクト名・スクリーンショット・1行ピッチを **HTV / Mercari の SNS・記事**で掲載してよい | | |
| ③ **スポンサー企業（Mercari, P&G 等）の広報・採用ページ**でプロダクト紹介してよい | | |

## 審査観点（参考）

審査は以下 8 項目で実施されます。実装中に意識すべきポイント：

1. 実用性
2. 創造性
3. UI / UX
4. 技術的挑戦
5. 将来性
6. 完成度
7. プレゼンテーション
8. AI 活用度（→ [`AI_USAGE_LOG.md`](./AI_USAGE_LOG.md) が根拠資料）

## 謝辞（任意）

スポンサー・メンター・運営への一言メッセージを残したい場合はここに記入。

## 運営連絡先

- Slack: `#eg-hackathon-2026-05`（または `#pjt_swe_event`）
- 緊急時: 運営メンバー（Mercari HQ 受付 → 運営呼び出し）
