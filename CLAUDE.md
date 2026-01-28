# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

HCP Terraform の Workspace を管理するための Raycast 拡張機能。TypeScript + React で構築。
HCP Terraform API を使用して Workspace の一覧表示、詳細確認、Plan 実行などを行う。

**Raycast Store 公開対象** - このプロジェクトは Raycast Store への公開を前提として開発します。

## 機能要件

### コア機能
1. **Workspace 一覧表示**
   - 指定した Organization 内のすべての Workspace を表示
   - リアルタイムで HCP Terraform API から最新データを取得
   - API Token による認証（Raycast の設定画面で入力）

2. **Organization 設定**
   - 設定画面で Organization 名を明示的に指定
   - 単一の Organization のみサポート（誤操作防止のため）

3. **Workspace 一覧の表示項目（必須）**
   - Workspace 名
   - Latest Run のステータス（Success, Failed, Running など）
   - 最終更新日時
   - ドリフトの発生有無

4. **フィルタリング機能**
   - Run ステータスで絞り込み（成功のみ、失敗のみ、実行中など）
   - ドリフト有無で絞り込み
   - タグで絞り込み（HCP Terraform の Workspace タグ）
   - 名前での検索

5. **Workspace 詳細画面**
   表示する情報：
   - 基本情報（Terraform Version, Working Directory, Auto Apply 設定など）
   - 最新の Run 履歴（直近5-10件）
   - VCS 連携情報（GitHub リポジトリ、ブランチなど）
   - State のメタ情報（Serial, Lineage, 最終更新日時など）

6. **Run 履歴の表示項目（すべて表示）**
   - Run のステータス（Success, Failed, Running など）
   - 実行日時
   - トリガー元（VCS commit, Manual, API など）
   - Plan の結果サマリー（追加/変更/削除のリソース数）
   - 実行者（誰が Run をトリガーしたか）

### アクション機能
Workspace から以下のアクションを実行可能：
1. **HCP Terraform の Web UI で開く** - ブラウザで該当 Workspace のページを開く
2. **Plan を手動トリガー** - Terraform Plan を実行（Apply は安全のため不可）

### 付加機能
- **お気に入り Workspace** - よく使う Workspace をピン留めして素早くアクセス
- **最近アクセスした履歴** - 最近閲覧した Workspace を保存して再アクセス可能

## Raycast Store 公開要件

### メタデータと設定（package.json）
- ✅ `author` フィールドには Raycast アカウントのユーザー名を使用
- ✅ `license` は `MIT` を使用
- ✅ 最新の Raycast API バージョンを使用
- ✅ `platforms` フィールドを適切に設定
- ✅ npm を使用し、`package-lock.json` を含める
- ✅ `npm run build` でエラーなくビルドできることを確認
- ✅ `npm run lint` でコードスタイルチェックを通過

### 命名規則（Apple Style Guide 準拠）
**拡張機能タイトル**
- Title Case を使用
- 例: `HCP Terraform` または `Terraform Cloud`
- 何をする拡張機能かが明確にわかる名前

**拡張機能説明**
- 1文で何をするかを説明
- 簡潔で分かりやすく
- 例: "Manage your HCP Terraform workspaces and trigger plans"

**コマンドタイトル**
- `<verb> <noun>` または `<noun>` の構造
- Title Case を使用
- 冠詞は省略
- 例: `Search Workspaces`, `Workspace Details`

**コマンドサブタイトル**
- コンテキストを追加する場合のみ使用
- サービス名など
- 例: サブタイトル `Terraform Cloud`

### アイコン
- ✅ 512x512px の PNG 形式
- ✅ ライトテーマ・ダークテーマ両方で見やすいデザイン
- ✅ [Icon Generator](https://icon.ray.so/) を使用して作成推奨
- ✅ HashiCorp/Terraform の公式アイコンを使用可能
- ✅ デフォルトの Raycast アイコンは使用不可
- ✅ 未使用のアセットは削除

### README
- ✅ API Token の取得方法を記載
- ✅ Organization 名の設定手順を明記
- ✅ 使い方とサンプルを含める
- ✅ メディアファイルは `/media` フォルダに配置

### カテゴリ
- 必須: 最低1つのカテゴリを設定
- 推奨カテゴリ: `Developer Tools`
- Title Case を使用

### スクリーンショット
- ✅ 最低3枚、最大6枚を用意
- ✅ サイズ: 2000x1250px (16:10 アスペクト比)
- ✅ フォーマット: PNG
- ✅ Raycast の Window Capture 機能を使用（開発モードで）
- ✅ 同じ背景を使用（一貫性）
- ✅ [Raycast Wallpapers](https://www.raycast.com/wallpapers) を使用推奨
- ✅ 機密情報を含めない（Workspace 名、Organization 名など注意）
- ✅ 拡張機能の主要機能を示すコマンドを選択

### CHANGELOG.md
- ✅ ルートフォルダに `CHANGELOG.md` を作成
- ✅ バージョン履歴を記録
- ✅ フォーマット: `## [タイトル] - {PR_MERGE_DATE}`
- ✅ [Keep a Changelog](https://keepachangelog.com/) 形式に従う

例:
```markdown
## [Initial Release] - {PR_MERGE_DATE}

- Search and filter HCP Terraform workspaces
- View workspace details and run history
- Trigger terraform plans manually
- Filter by run status, drift, and tags
- Favorite workspaces for quick access
- Track recently accessed workspaces
```

### UI/UX ガイドライン

**Preferences**
- ✅ [Preferences API](https://developers.raycast.com/api-reference/preferences) を使用
- ✅ API Token と Organization 名は `required: true` を設定
- ❌ 設定用の別コマンドは作成しない

**Action Panel**
- ✅ アクション名は Title Case
- ✅ すべてのアクションにアイコンを設定（統一感）
- ✅ サブメニューがあるアクションには `…` を追加
- 例: `Open in Browser`, `Trigger Plan`, `Copy Workspace ID`

**Navigation**
- ✅ [Navigation API](https://developers.raycast.com/api-reference/user-interface/navigation) を使用
- ✅ 独自のナビゲーションスタックは実装しない
- ✅ `navigationTitle` はネストした画面でのみ使用
- ✅ ルートコマンドでは `navigationTitle` を変更しない

**Empty States**
- ✅ `List.EmptyView` または `Grid.EmptyView` を使用
- ✅ データ取得前は空の配列を表示しない（Loading 状態を使用）
- ✅ 適切なメッセージとアクションを提供
- 例: "No workspaces found. Check your organization name in preferences."

**Text Fields**
- ✅ すべての Text Field と Text Area にプレースホルダーを設定
- ✅ 検索バーには必ずプレースホルダーを設定
- 例: "Search workspaces by name..."

**言語**
- ✅ 米国英語のスペルを使用（英国英語ではない）
- ✅ ローカライゼーションは現在未サポート

**その他**
- ❌ 外部アナリティクスの組み込みは禁止
- ❌ Keychain Access は使用不可

## 開発コマンド
```bash
# 依存関係インストール
npm install

# 開発モードで起動
npm run dev

# ビルド（公開前に必ず実行）
npm run build

# Lint
npm run lint

# Lint + 自動修正
npm run fix-lint

# Raycast Store に公開
npm run publish
```

## アーキテクチャ
```
hcp-terraform/
├── src/
│   ├── workspace-list.ts       # Workspace 一覧コマンド
│   ├── workspace-detail.ts     # Workspace 詳細画面
│   ├── utils/
│   │   ├── hcp-terraform-api.ts # HCP Terraform API クライアント
│   │   ├── favorites.ts        # お気に入り管理
│   │   └── history.ts          # 履歴管理
│   └── types.ts                # TypeScript 型定義
├── assets/
│   ├── icon.png                # 拡張機能アイコン (512x512)
│   └── icon@dark.png           # ダークモードアイコン (オプション)
├── media/                      # README 用メディアファイル
│   ├── screenshot-1.png
│   ├── screenshot-2.png
│   └── screenshot-3.png
├── metadata/                   # Store 用スクリーンショット
│   ├── hcp-terraform-1.png
│   ├── hcp-terraform-2.png
│   └── hcp-terraform-3.png
├── package.json
├── package-lock.json
├── README.md
├── CHANGELOG.md
└── tsconfig.json
```

## 技術スタック

- Raycast API (`@raycast/api`, `@raycast/utils`)
- TypeScript (ES2023)
- HCP Terraform API (REST API)
- ESLint（Raycast 公式設定）

## HCP Terraform API エンドポイント
```
Base URL: https://app.terraform.io/api/v2

# Workspace 一覧取得
GET /organizations/{organization}/workspaces

# Workspace 詳細取得
GET /workspaces/{workspace_id}

# Run 一覧取得
GET /workspaces/{workspace_id}/runs

# Run を作成（Plan トリガー）
POST /runs
```

## 認証

- API Token は Raycast の Preferences で設定
- HTTP Header: `Authorization: Bearer <token>`
- Token のスコープ: 最低限 Workspace の読み取りと Run の作成権限が必要

## データ構造

### Workspace 型
```typescript
interface Workspace {
  id: string;                    // Workspace ID
  attributes: {
    name: string;                // Workspace 名
    'current-run'?: {            // 最新の Run 情報
      status: RunStatus;
    };
    'updated-at': string;        // 最終更新日時（ISO 8601）
    'terraform-version': string; // Terraform バージョン
    'working-directory': string; // Working Directory
    'auto-apply': boolean;       // Auto Apply の有効/無効
    'vcs-repo'?: {               // VCS 連携情報
      identifier: string;        // リポジトリ（例: owner/repo）
      branch: string;            // ブランチ名
      'display-identifier': string;
    };
    'resource-count': number;    // リソース数
    tags?: string[];             // タグ
  };
  relationships: {
    'current-state-version'?: {  // 現在の State バージョン
      data?: {
        id: string;
      };
    };
  };
  driftDetected?: boolean;       // ドリフト検出フラグ（計算で求める）
}
```

### Run 型
```typescript
interface Run {
  id: string;
  attributes: {
    status: RunStatus;           // Success, Failed, Running など
    'created-at': string;        // 実行日時（ISO 8601）
    'trigger-reason': string;    // トリガー元（manual, vcs, api など）
    'plan-resource-additions': number;    // 追加リソース数
    'plan-resource-changes': number;      // 変更リソース数
    'plan-resource-destructions': number; // 削除リソース数
    'created-by'?: {
      username: string;          // 実行者
    };
  };
}

type RunStatus = 
  | 'pending'
  | 'planning'
  | 'planned'
  | 'applying'
  | 'applied'
  | 'errored'
  | 'discarded'
  | 'canceled';
```

### お気に入り・履歴データ型
```typescript
interface FavoriteWorkspace {
  workspaceId: string;
  addedAt: number; // Unix timestamp
}

interface HistoryItem {
  workspaceId: string;
  accessedAt: number; // Unix timestamp
}
```

## UI フロー

1. コマンド起動 → Workspace 一覧画面
2. フィルタリング（ステータス、ドリフト、タグ、検索）
3. Workspace 選択 → 詳細画面を表示
4. アクション実行（Web UI で開く / Plan トリガー）
5. アクセスした Workspace は履歴に自動保存

## 実装の優先順位

### Phase 1（MVP - Store 公開用）
- [ ] プロジェクト初期化と設定
- [ ] package.json の適切な設定（author, license, categories など）
- [ ] 512x512 アイコンの作成（ライト/ダーク対応）
- [ ] HCP Terraform API クライアント実装
- [ ] API Token の設定画面（Organization 名含む、required: true）
- [ ] Workspace 一覧取得と表示
- [ ] 基本的な検索・フィルタリング
- [ ] Web UI で開くアクション
- [ ] Workspace 詳細画面（基本情報のみ）
- [ ] 適切な Empty States の実装
- [ ] README.md の作成（API Token 取得方法含む）
- [ ] CHANGELOG.md の作成
- [ ] スクリーンショット 3-6 枚の作成
- [ ] `npm run build` と `npm run lint` のチェック

### Phase 2
- [ ] Plan 手動トリガー機能
- [ ] Run 履歴の表示
- [ ] VCS 連携情報の表示
- [ ] State メタ情報の表示
- [ ] ドリフト検出ロジック
- [ ] お気に入り機能
- [ ] 履歴機能

### Phase 3
- [ ] Run ステータスでのフィルタリング UI
- [ ] ドリフト有無でのフィルタリング UI
- [ ] タグでのフィルタリング UI
- [ ] エラーハンドリングの強化

### 将来追加検討
- [ ] Run 詳細画面（Plan 結果の詳細表示）
- [ ] Variables 管理
- [ ] Workspace のロック/アンロック
- [ ] 通知機能（Run 失敗時など）

## 設定項目（Raycast Preferences）
```typescript
interface Preferences {
  apiToken: string;        // HCP Terraform API Token（必須）
  organization: string;    // Organization 名（必須）
}
```

## エラーハンドリング

- API Token が未設定の場合 → 設定画面へ誘導
- Organization が未設定の場合 → 設定画面へ誘導
- API Token が無効な場合 → 認証エラーメッセージ
- Organization が存在しない場合 → エラーメッセージ
- ネットワークエラー → リトライ可能なエラー表示
- Rate Limit 超過 → 適切な待機メッセージ

## 注意事項

- HCP Terraform API の Rate Limit に注意（30 requests/second）
- Workspace 数が多い場合はページネーションを考慮
- Plan トリガーは慎重に（誤操作防止のため Apply は非サポート）
- ドリフト検出は State と Current Run の比較ロジックが必要
- API Token は機密情報のため、ログ出力時はマスクする
- ❌ バイナリ依存関係をバンドルしない
- ❌ Keychain Access は使用不可
- ❌ 外部アナリティクスは禁止
- ✅ 米国英語のスペルを使用

## Store 公開前チェックリスト

- [ ] `package.json` の author が Raycast ユーザー名
- [ ] `package.json` の license が MIT
- [ ] 最新の Raycast API バージョンを使用
- [ ] `package-lock.json` が含まれている
- [ ] `npm run build` が成功
- [ ] `npm run lint` が成功
- [ ] 512x512 のアイコンが用意されている
- [ ] README.md が作成されている（API Token 取得手順含む）
- [ ] CHANGELOG.md が作成されている
- [ ] スクリーンショットが 3-6 枚用意されている
- [ ] カテゴリが設定されている
- [ ] すべての命名が Apple Style Guide に準拠
- [ ] すべての Text Field にプレースホルダーがある
- [ ] Empty States が適切に実装されている
- [ ] Navigation API を正しく使用
- [ ] 米国英語のスペルを使用
- [ ] API Token は Preferences で `required: true` に設定

## 参考リンク

- [Raycast API Documentation](https://developers.raycast.com/)
- [Raycast Store Guidelines](https://developers.raycast.com/basics/prepare-an-extension-for-store)
- [HCP Terraform API Documentation](https://developer.hashicorp.com/terraform/cloud-docs/api-docs)
- [Icon Generator](https://icon.ray.so/)
- [Raycast Wallpapers](https://www.raycast.com/wallpapers)
- [Keep a Changelog](https://keepachangelog.com/)
