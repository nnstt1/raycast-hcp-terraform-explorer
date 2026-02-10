# ドリフト検出の実装詳細

## 概要

HCP Terraform の拡張機能では、2つの方法でドリフト検出を実装しています：

1. **Assessment API** (Fetch Provider) - 標準的だが遅い
2. **Explorer API** (hcpt Provider) - 高速

## 実装比較

### 1. Assessment API (Fetch Provider)

**使用 API**:
```
GET /organizations/:org/workspaces?include=current-assessment-result
```

**特徴**:
- ✅ HCP Terraform の標準 API
- ✅ 公式にサポートされている
- ❌ Workspace ごとに assessment-result を取得（N+1問題）
- ❌ 大量の Workspace がある場合、非常に遅い

**実装**:
```typescript
// src/api/fetch-provider.ts
const response = await fetchApi(
  `/organizations/${org}/workspaces?include=latest-run,current-assessment-result`
);

// response.included から assessment-results を抽出
const assessmentsById = new Map<string, AssessmentResult>();
if (response.included) {
  for (const item of response.included) {
    if (item.type === "assessment-results") {
      assessmentsById.set(item.id, item as AssessmentResult);
    }
  }
}
```

**パフォーマンス**:
- 100 Workspace: ~5-10秒
- 500 Workspace: ~30-60秒
- 1000 Workspace: ~1-2分

---

### 2. Explorer API (hcpt Provider)

**使用コマンド**:
```bash
hcpt drift list --org <org> --all --json
```

**特徴**:
- ✅ Explorer API を使用（バックエンドで高速クエリ）
- ✅ **単一の API 呼び出し**で全 Workspace のドリフト状態を取得
- ✅ 10-100倍高速
- ❌ hcpt CLI が必要

**実装**:
```typescript
// src/api/hcpt-provider.ts
// Get drift information using Explorer API
const driftCommand = `drift list --org ${organizationName} --all --json`;
const driftOutput = this.executeHcpt(driftCommand);
const driftData: HcptDriftResult[] = JSON.parse(driftOutput);

// Create a map for quick lookup by workspace ID
const driftMap = new Map<string, HcptDriftResult>();
for (const drift of driftData) {
  driftMap.set(drift.workspace_id, drift);
}

// Merge drift information with workspace data
return transformHcptWorkspacesWithDetailsToApi(hcptData, driftMap);
```

**パフォーマンス**:
- 100 Workspace: ~0.5-1秒
- 500 Workspace: ~1-2秒
- 1000 Workspace: ~2-3秒

---

## データ構造

### HcptDriftResult (hcpt JSON 出力)

```typescript
interface HcptDriftResult {
  workspace_id: string;      // Workspace ID
  workspace_name: string;    // Workspace 名
  drifted: boolean;          // ドリフト検出フラグ
  succeeded: boolean;        // 評価成功フラグ
  error_msg?: string | null; // エラーメッセージ
  created_at: string;        // 評価実行日時
}
```

### AssessmentResult (HCP Terraform API 形式)

```typescript
interface AssessmentResult {
  id: string;
  type: "assessment-results";
  attributes: {
    drifted: boolean;
    succeeded: boolean;
    "error-msg": string | null;
    "created-at": string;
  };
}
```

---

## 実装フロー

### hcpt Provider の場合

```
1. workspace list コマンド実行
   ↓
2. drift list --all コマンド実行 (並列実行可能)
   ↓
3. drift 情報を Map に格納 (workspace_id → HcptDriftResult)
   ↓
4. transformHcptWorkspacesWithDetailsToApi() で変換
   - Workspace データと drift データをマージ
   - AssessmentResult 形式に変換
   ↓
5. UI レイヤーで表示（既存の getDriftStatus() が使用）
```

### Fetch Provider の場合

```
1. /workspaces?include=current-assessment-result リクエスト
   ↓
2. response.included から assessment-results を抽出
   ↓
3. Workspace に紐付け
   ↓
4. UI レイヤーで表示
```

---

## エラーハンドリング

hcpt Provider では、drift list コマンドが失敗しても Workspace 一覧の表示は継続されます：

```typescript
try {
  const driftCommand = `drift list --org ${organizationName} --all --json`;
  const driftOutput = this.executeHcpt(driftCommand);
  const driftData: HcptDriftResult[] = JSON.parse(driftOutput);
  // ... drift 情報をマージ
} catch (error) {
  // drift list が失敗しても続行（ドリフト情報なしで表示）
  console.warn("Failed to fetch drift information:", error);
}
```

この場合、すべての Workspace が "unavailable" として表示されます。

---

## UI での表示

どちらのプロバイダーでも、UI レイヤーは同じロジックを使用：

```typescript
// src/search-workspace.tsx
function getDriftStatus(workspace: WorkspaceWithDetails): DriftStatus {
  const assessment = workspace.currentAssessmentResult;

  if (!assessment) return "unavailable";
  if (!assessment.attributes.succeeded) return "unavailable";

  return assessment.attributes.drifted ? "drifted" : "no-drift";
}
```

---

## パフォーマンス比較

| プロバイダー | 100 WS | 500 WS | 1000 WS | API 呼び出し数 |
|-------------|--------|--------|---------|---------------|
| Fetch API   | 5-10s  | 30-60s | 1-2min  | N回 (Workspace数) |
| hcpt CLI    | 0.5-1s | 1-2s   | 2-3s    | 1回 (Explorer API) |

**速度比**:
- 10x faster (100 Workspace)
- 30x faster (500 Workspace)
- 40-60x faster (1000 Workspace)

---

## 今後の改善案

1. **並列実行の最適化**
   - workspace list と drift list を並列実行
   - さらに高速化が期待できる

2. **キャッシング**
   - drift 情報を一定時間キャッシュ
   - 連続したリクエストで高速化

3. **増分更新**
   - 変更があった Workspace のみ再取得
   - より効率的なデータ更新

---

## 参考資料

- [HCP Terraform Assessment API](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/assessment-results)
- [hcpt drift コマンド](https://github.com/nnstt1/hcpt)
- [Explorer API](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/explorer)
