# LLMデイリーノートサマリー機能 設計案

## 1. 機能概要

- ユーザーがUI上で期間を選択
- 選択期間内のデイリーノートを自動で収集
- LLM（大規模言語モデル）で要約を生成
- 要約結果を新規ノートまたは既存ノートに記載
- 今後、デイリーノート以外のノート種別にも拡張可能な設計

## 2. UI設計

- サイドバーまたはタブ内に「サマリー」パネルを追加
- 期間選択UI（カレンダー/日付ピッカー）
- サマリー対象ノート種別の選択（将来的な拡張用）
- 「要約を生成」ボタン
- 生成結果のプレビュー表示
- 「ノートに挿入」ボタン

## 3. 処理フロー

1. 期間・ノート種別の選択
2. 対象ノートの収集
3. ノート内容をLLMに送信し要約生成
4. 要約結果をプレビュー
5. ユーザーがノートへ挿入を選択
6. ノートに要約を追記または新規作成

## 4. モジュール構成（例）

- `SummaryView`（UI/タブ管理）
- `NoteCollector`（ノート収集・フィルタリング）
- `LLMSummarizer`（LLM API連携・要約生成のインターフェース）
  - `summarize(text: string, options?: object): Promise<string>` などの共通メソッドを定義
- 各プロバイダ用の実装クラス（例: `OpenAISummarizer`, `AnthropicSummarizer` など）
- `SummarizerFactory`（設定や選択に応じて適切なLLMSummarizerインスタンスを返す）
- `SummaryInserter`（ノートへの挿入処理）
- `settings.ts`（APIキーやプロバイダ選択・デフォルト設定管理）

## 5. 拡張性

- ノート種別の追加（タグ/フォルダ/カスタムクエリ対応）
- サマリー方式の切り替え（要約/箇条書き/抽出など）
- LLMプロバイダの切り替え（インターフェース＋ファクトリパターンで柔軟に対応）

---

### LLMプロバイダ切り替えの柔軟性向上ポイント/Users/k-yoshida/workspace/obsidian-reflectify/design-docs/llm_summary.md

1. **インターフェースの定義**
    - 例: `LLMSummarizer` インターフェースで `summarize(text: string, options?: object): Promise<string>` を定義
2. **各プロバイダごとの実装クラス**
    - OpenAI, Anthropic, Azure, ローカルLLMなど、各プロバイダごとに実装
3. **ファクトリ or DI（依存性注入）**
    - 設定やユーザー選択に応じて利用するプロバイダのインスタンスを生成・切り替え
4. **設定画面でプロバイダ選択**
    - UI上でプロバイダやAPIキー、パラメータを選択・保存できるようにする

#### TypeScriptでのイメージ

```ts
// インターフェース
export interface LLMSummarizer {
  summarize(text: string, options?: object): Promise<string>;
}

// OpenAI用
export class OpenAISummarizer implements LLMSummarizer { /* ... */ }

// Anthropic用
export class AnthropicSummarizer implements LLMSummarizer { /* ... */ }

// ファクトリ
export function createSummarizer(provider: string, config: object): LLMSummarizer { /* ... */ }
```
