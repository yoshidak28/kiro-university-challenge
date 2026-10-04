# 実装計画：ひらがな れんしゅう

## Overview

バニラ HTML / CSS / JavaScript のみで構成する「ひらがな れんしゅう」の実装手順です。外部フレームワーク・ビルドステップは不要で、`file://` プロトコルおよび静的ホスティングで動作します。テストは fast-check（プロパティベース）と Vitest（ユニット）を使用します。

## Tasks

- [x] 1. プロジェクト構造のセットアップとデータ定義
  - [x] 1.1 `index.html` を作成し、DOM 構造・ARIA ロール・タブナビゲーション骨格を定義する
    - タブ領域（`role="tablist"`）、五十音表エリア（`role="tabpanel"`）、クイズエリアを配置
    - `style.css`・`hiragana.js`・`quiz.js` の `<link>` / `<script>` タグを含める
    - _Requirements: 3.1, 3.5, 10.4_
  - [x] 1.2 `hiragana.js` に `HIRAGANA_DATA` 定数（46エントリ）と `ALL_CHARS` 配列を定義する
    - 各エントリに `char`, `row`, `rowIdx`, `vowel`, `vowelIdx` を含める
    - `ん` の `vowel: null, vowelIdx: null` を含めた全46文字を網羅する
    - _Requirements: 1.1, 1.2, 5.1_
  - [ ]* 1.3 `HIRAGANA_DATA` のユニットテストを書く
    - 46エントリ存在すること・各エントリの構造（必須フィールド）が正しいことを検証
    - _Requirements: 1.1_

- [x] 2. SpeechSynthesizer モジュールの実装
  - [x] 2.1 `hiragana.js` に `SpeechSynthesizer` モジュール（IIFE）を実装する
    - `init()` で `voiceschanged` コールバックと `setTimeout` フォールバックを設定
    - `speak(text)` で進行中の発話をキャンセルしてから新しい `SpeechSynthesisUtterance` を生成・発話
    - `SpeechSynthesisUtterance` に `lang = 'ja-JP'`・低めの `rate`・高めの `pitch` を設定
    - `speechSynthesis` 非対応ブラウザへのサイレントフォールバックを実装
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.8_
  - [ ]* 2.2 Property 2 のプロパティテストを書く（発話前に必ず cancel が呼ばれる）
    - **Property 2: 音声が重複しないようキャンセルしてから発話する**
    - **Validates: Requirements 1.8**
  - [ ]* 2.3 Property 3 のプロパティテストを書く（すべての発話に `lang='ja-JP'` が設定される）
    - **Property 3: すべての発話に日本語ロケールが設定される**
    - **Validates: Requirements 2.1**
  - [ ]* 2.4 Property 4 のプロパティテストを書く（日本語ボイスが存在する場合は選択される）
    - **Property 4: 日本語ボイスが存在する場合は日本語ボイスを選択する**
    - **Validates: Requirements 2.4**

- [x] 3. チェックポイント — SpeechSynthesizer の動作確認
  - すべてのテストがパスすることを確認し、疑問があればユーザーに質問する。

- [x] 4. GojuonTableView モジュールの実装（五十音表 UI）
  - [x] 4.1 `hiragana.js` に `GojuonTableView` モジュール（IIFE）を実装する
    - `render(container)` で `HIRAGANA_DATA` から `Hiragana_Card`（`<button>`）を生成し 2D グリッドに配置
    - 行ヘッダー（あ行・か行…）と段ヘッダー（あ・い・う・え・お）ラベルを生成
    - 空セル（や行のい段・え段など）には空の `<td>` を配置
    - クリック／タッチで `SpeechSynthesizer.speak(char)` を呼び出すイベントリスナーを登録
    - アクティブカードへのアニメーションクラスを付与・除去する
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [ ]* 4.2 Property 1 のプロパティテストを書く（カードクリックが正しい文字で音声を起動する）
    - **Property 1: カード操作が正しい文字で音声を起動する**
    - **Validates: Requirements 1.6**

- [x] 5. タブナビゲーションの実装
  - [x] 5.1 `hiragana.js`（または `index.html` インラインスクリプト）にタブ切り替えロジックを実装する
    - タブクリックで現在のビューを非表示・選択ビューを表示
    - クイズタブ選択時は必ず Difficulty_Screen を先に表示
    - `aria-selected` 属性の排他的更新を実装
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]* 5.2 Property 5 のプロパティテストを書く（`aria-selected` の排他的設定）
    - **Property 5: タブ選択で aria-selected が排他的に設定される**
    - **Validates: Requirements 3.5**

- [x] 6. QuizLogic モジュールの実装（純粋関数）
  - [x] 6.1 `quiz.js` に `QuizLogic` モジュール（IIFE）を実装する — `getDifficultyConfig`
    - `DIFFICULTY_CONFIG` 定数（easy/normal/hard の `charPool`・`questionCount`・ラベル・説明）を定義
    - `getDifficultyConfig(difficulty)` を実装
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 6.2 `QuizLogic.createSession(difficulty, rng?)` を実装する
    - 文字プールから重複なしでランダムに `questionCount` 文字を選択
    - `QuizSession` オブジェクトを返す（`selectedChars`・`questions`・`currentIndex`・`score`）
    - _Requirements: 5.1_
  - [ ]* 6.3 Property 6 のプロパティテストを書く（出題文字に重複がない）
    - **Property 6: クイズセッションで出題文字に重複がない**
    - **Validates: Requirements 5.1**
  - [x] 6.4 `QuizLogic.generateQuestion(correctChar, allChars, rng?)` を実装する
    - 正解＋3つの異なるディストラクターを選択し、ランダム順の `choices[4]` を生成
    - 最大試行回数（100回）超過時は例外をスロー
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [ ]* 6.5 Property 7 のプロパティテストを書く（Question の構造的正当性）
    - **Property 7: 生成された問題が構造的に正当である**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
  - [x] 6.6 `QuizLogic.evaluateAnswer(question, selectedChar)` を実装する
    - `AnswerResult`（`isCorrect`・`correctChar`・`selectedChar`）を返す
    - _Requirements: 5.8_
  - [ ]* 6.7 Property 8 のプロパティテストを書く（スコアが正解回数に対応する）
    - **Property 8: スコアが正解回数に正確に対応する**
    - **Validates: Requirements 5.8**
  - [x] 6.8 `QuizLogic.calcResultTier(correct, total)` を実装する
    - `100% → 'perfect'`、`70%以上 → 'good'`、`70%未満 → 'try-again'` を返す
    - _Requirements: 8.3, 8.4, 8.5_
  - [ ]* 6.9 Property 13 のプロパティテストを書く（スコア評価ティアの正確性）
    - **Property 13: スコア評価関数が正しいティアを返す**
    - **Validates: Requirements 8.3, 8.4, 8.5**

- [x] 7. チェックポイント — QuizLogic の動作確認
  - すべてのテストがパスすることを確認し、疑問があればユーザーに質問する。

- [x] 8. QuizView モジュールの実装（クイズ UI）
  - [x] 8.1 `quiz.js` に `QuizView.showDifficultyScreen()` を実装する
    - 3つの難易度ボタン（ラベル＋説明文）を表示
    - ボタンクリックで `QuizLogic.createSession()` を呼び出しセッションを開始
    - _Requirements: 4.1, 4.5, 4.6_
  - [x] 8.2 `QuizView.renderQuestion(question, index, total, score)` を実装する
    - 4つの `Choice_Button` をレンダリング
    - 短いディレイ後に `SpeechSynthesizer.speak(correctChar)` を自動呼び出し
    - Progress_Bar（`aria-valuenow` 付き）・問題番号・スコア表示を更新
    - _Requirements: 5.2, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 8.3 Property 11 のプロパティテストを書く（進捗表示値がセッション状態と一致）
    - **Property 11: 進捗表示値が実際のセッション状態と一致する**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [x] 8.4 `QuizView.showFeedback(result)` を実装する
    - 正解時：正解スタイルを Choice_Button に付与・`SpeechSynthesizer` でフィードバック読み上げ
    - 不正解時：不正解スタイルを選択ボタンに付与・正解ボタンに正解スタイル・正解文字を含むメッセージを読み上げ
    - 4つ全ての Choice_Button を `disabled` に設定
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - [ ]* 8.5 Property 9 のプロパティテストを書く（不正解フィードバックに正解文字が含まれる）
    - **Property 9: 不正解フィードバックに正解文字が含まれる**
    - **Validates: Requirements 6.2**
  - [ ]* 8.6 Property 10 のプロパティテストを書く（選択後に正解ボタンがハイライトされ全ボタンが無効化）
    - **Property 10: 選択後に正解ボタンがハイライトされ全ボタンが無効化される**
    - **Validates: Requirements 6.3, 6.5**

- [x] 9. インタラクションロックと連打防止の実装
  - [x] 9.1 `AppState.quiz.interactionLocked` フラグを `quiz.js` に追加し、Choice_Button クリックハンドラに組み込む
    - 最初のクリックで即座に `interactionLocked = true` に設定
    - 次の Question 表示時に `interactionLocked = false` にリセット
    - CSS `pointer-events: none` との組み合わせを `showFeedback()` 内に実装
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ]* 9.2 Property 14 のプロパティテストを書く（連打防止）
    - **Property 14: 1問につき最初のクリックのみ処理される（連打防止）**
    - **Validates: Requirements 9.1, 9.2**
  - [ ]* 9.3 Property 15 のプロパティテストを書く（新しい問題表示時にインタラクション状態がリセット）
    - **Property 15: 新しい問題表示時にインタラクション状態がリセットされる**
    - **Validates: Requirements 9.3**

- [x] 10. 結果画面の実装
  - [x] 10.1 `QuizView.showResultScreen(session)` を実装する
    - 最終スコア比（正解数/総問題数）を表示
    - `calcResultTier` に基づくメッセージ・星アイコンを表示
    - 短いディレイ後に結果メッセージを `SpeechSynthesizer` で読み上げ
    - リトライボタンで Difficulty_Screen に戻る
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  - [ ]* 10.2 Property 12 のプロパティテストを書く（結果画面のスコア表示が実際の値と一致）
    - **Property 12: 結果画面のスコア表示が実際の値と一致する**
    - **Validates: Requirements 8.2**

- [x] 11. チェックポイント — クイズフロー全体の動作確認
  - すべてのテストがパスすることを確認し、疑問があればユーザーに質問する。

- [x] 12. `style.css` の実装（レイアウト・アニメーション・アクセシビリティ）
  - [x] 12.1 レスポンシブレイアウト・流体タイポグラフィ・タップターゲットサイズを実装する
    - 最小幅 320px での横スクロールなしを CSS Grid / Flexbox で実現
    - `clamp()` / `vw` ベースの流体タイポグラフィを設定
    - `Hiragana_Card` と `Choice_Button` に `min-width: 44px; min-height: 44px` 以上を確保
    - iOS ダブルタップズーム防止のため `touch-action: manipulation` を設定
    - _Requirements: 10.1, 10.2, 10.3, 1.4, 1.5_
  - [x] 12.2 アニメーション・ダークモード・`prefers-reduced-motion` 対応を実装する
    - カードクリック時のアニメーションを CSS で定義
    - `@media (prefers-reduced-motion: reduce)` でアニメーションを抑制
    - _Requirements: 1.7, 10.5_

- [x] 13. コンポーネントの結合と最終統合
  - [x] 13.1 `index.html` で各モジュールを初期化し、アプリ起動フローを完成させる
    - ページロード時に `SpeechSynthesizer.init()` を呼び出す
    - 初期表示は五十音表タブをアクティブにし `GojuonTableView.render()` を実行
    - タブナビゲーション・AppState 管理コードを統合
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.2, 11.3_

- [x] 14. 最終チェックポイント — すべてのテストがパスすることを確認
  - すべてのユニットテストおよびプロパティテストがパスすることを確認し、疑問があればユーザーに質問する。

## Notes

- `*` が付いたサブタスクはオプションです。MVP を優先する場合はスキップできます
- プロパティベーステストには fast-check、ユニットテストには Vitest を使用します
- ES6 モジュール構文（`import/export`）は `file://` での CORS 制約を避けるため使用せず、IIFE でスコープを分離します
- 各タスクは前のタスクの成果物を前提とします。孤立したコードを作らないよう、各ステップで必ず既存コードと結合します

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "6.1"] },
    { "id": 2, "tasks": ["2.1", "6.2"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "6.3", "6.4"] },
    { "id": 4, "tasks": ["4.1", "6.5", "6.6"] },
    { "id": 5, "tasks": ["4.2", "6.7", "6.8"] },
    { "id": 6, "tasks": ["5.1", "6.9"] },
    { "id": 7, "tasks": ["5.2", "8.1"] },
    { "id": 8, "tasks": ["8.2"] },
    { "id": 9, "tasks": ["8.3", "8.4"] },
    { "id": 10, "tasks": ["8.5", "8.6", "9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 12, "tasks": ["10.2", "12.1"] },
    { "id": 13, "tasks": ["12.2"] },
    { "id": 14, "tasks": ["13.1"] }
  ]
}
```
