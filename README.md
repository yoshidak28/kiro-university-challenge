# ひらがな れんしゅう（Hiragana Learning App）

未就学児（3〜6歳）が、保護者の見守りのもとでひらがな46文字を楽しく学べる、ブラウザだけで動く学習Webアプリです。文字をまだ読めない子どもでも、日本語の音声読み上げを頼りに自立して遊べることを重視しています。

**公開 URL:** https://yoshidak28.github.io/kiro-university-challenge/hiragana-app/

> Kiro University Challenge 2026 の提出作品です。仕様（requirements → design → tasks）を先に定義してから実装する Spec 駆動開発で作っています。

---

## アプリの説明

純粋な HTML / CSS / バニラ JavaScript だけで作られており、フレームワーク・ビルドステップ・サーバーサイド処理は一切ありません。`file://` で直接開いても、GitHub Pages などの静的ホスティングに置いても、そのまま完全に動作します。

主な特徴:

- **五十音表** — 46文字を段（あ・い・う・え・お）× 行（あ行〜わ行・ん）の2次元グリッドで表示。文字をタップすると日本語で読み上げます。
- **クイズ** — 音声で読み上げられた文字を4択から当てるゲーム。難易度を選んで遊べます。
- **音声読み上げ** — Web Speech API（`speechSynthesis`）を使用。未就学児向けに話速はやや遅め・ピッチはやや高めに設定。Web Speech API 非対応ブラウザではサイレントにフォールバックし、音声以外の機能は動作を継続します。
- **やさしい UX** — 大きな文字・明るい色・丸みのあるデザイン。不正解でも「おしい！」「もう いちど！」とやさしく励まします。
- **アクセシビリティ** — WAI-ARIA のタブパターン、`aria-live`、`role="progressbar"`、`prefers-reduced-motion` 対応など。
- **レスポンシブ** — タブレット・スマートフォン・PC のいずれでも快適に使えます（最小幅 320px、横スクロールなし）。

### 技術スタック

- 言語: HTML / CSS / バニラ JavaScript（ES5〜ES6 相当）
- 音声: Web Speech API（`window.speechSynthesis` / `SpeechSynthesisUtterance`）
- フォント: Google Fonts「M PLUS Rounded 1c」
- フレームワーク・ライブラリ・ビルドツール: なし（ランタイム依存ゼロ）

### ファイル構成

```
hiragana-app/
├── index.html    エントリポイント・DOM 構造・初期化スクリプト
├── style.css     レイアウト・アニメーション・アクセシビリティ
├── hiragana.js   データ定義・音声（SpeechSynthesizer）・五十音表ビュー
└── quiz.js       クイズのロジック（QuizLogic）とビュー（QuizView）・アプリ状態（AppState）
```

純粋ロジック（出題・採点・評価）は副作用のない純粋関数（`QuizLogic`）として実装し、DOM 操作は View 層（`QuizView` / `GojuonTableView`）に分離しています。グローバル状態は `AppState` に集約しています。読み込み順は `hiragana.js` → `quiz.js`（quiz.js が hiragana.js のシンボルに依存するため）。

---

## 遊び方

### 五十音表

1. 「ごじゅうおんひょう」タブを開く（初期表示）。
2. 気になる文字のカードをタップ／クリックすると、その文字を読み上げます。

### クイズ

1. 「クイズ」タブを開くと、まず難易度選択画面が表示されます。
2. 難易度を選びます。
   - **かんたん** … あ行〜な行（25文字）から出題、10問
   - **ふつう** … 全46文字から出題、15問
   - **むずかしい** … 全46文字から出題、20問
3. 問題が表示されると「3・2・1」のカウントダウンの後に音声が流れます（カウント中は選択肢を押せません）。
4. 読み上げられた文字を4つの選択肢から選びます。
5. 正解・不正解のフィードバックを表示・読み上げし、少し待ってから次の問題へ進みます。
6. 全問終了後、正解率に応じた3段階（⭐ / ⭐⭐ / ⭐⭐⭐）の結果を表示します。リトライボタンで難易度選択に戻れます。

> 画面表示用と読み上げ用の文字列は分けて用意しており、読み上げ用は助詞の「は」→「わ」、「へ」→「え」のように発音どおりに置き換えています（例: 表示「こたえは『あ』だよ！」/ 読み上げ「こたえわ『あ』だよ！」）。

---

## ローカルでの開き方

ビルド不要です。次のどちらでも動きます。

**方法 1: ファイルを直接開く**

`hiragana-app/index.html` をブラウザで開くだけです。

```bash
open hiragana-app/index.html        # macOS
```

**方法 2: 簡易 HTTP サーバーで開く**（音声ボイスの挙動をより本番に近づけたい場合に推奨）

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000/hiragana-app/ を開く
```

---

## テストの実行方法

アプリ本体にランタイム依存はありませんが、純粋ロジック（`QuizLogic`）の検証用に、開発時のみ使う Node ベースのテストを用意しています。[fast-check](https://fast-check.dev/) によるプロパティベーステストを [Vitest](https://vitest.dev/) で実行します。

```bash
npm install   # 初回のみ（fast-check / vitest を取得）
npm test      # vitest run
```

テストはアプリのソースを無改変のまま Node の `vm` で評価して公開グローバルを取り出す仕組み（`tests/loadAppGlobals.js`）になっており、アプリ側に `module.exports` を足していません。各 JS ファイルの構文確認だけなら次でも可能です。

```bash
node --check hiragana-app/hiragana.js
node --check hiragana-app/quiz.js
```

---

## Kiro の機能をどこで・どう使ったか

このプロジェクトは Kiro の各機能を実際の開発フローに組み込んで作りました。以下はチャレンジのレッスンの順番に沿って並べています。

### 1. Spec（仕様駆動開発）

`.kiro/specs/hiragana-learning-app/` に、実装前の合意として requirements → design → tasks を順に作成しました。

- `requirements.md` … EARS 形式の受け入れ基準つき要件（五十音表・音声・クイズ・アクセシビリティなど11要件）。
- `design.md` … アーキテクチャ、モジュール I/F、データモデル、15個の Correctness Property、テスト戦略。
- `tasks.md` … 要件・プロパティに紐づく実装タスク一覧（依存グラフつき）。

### 2. Steering（プロジェクト共通ルール）

`.kiro/steering/` に、常時適用されるプロジェクト規約を置き、Kiro が一貫した方針でコードを書くようにしました。

- `product.md` … プロダクト概要・対象ユーザー・UX 方針。
- `tech.md` … 技術スタックと制約（依存ゼロ・ビルドなし・`file://` 動作・ES Module 不使用など）。
- `structure.md` … ディレクトリ構成・命名規約・ロジックと DOM の分離方針。
- `speech-text.md` … 読み上げテキストの表記ルール（助詞「は」→「わ」、「へ」→「え」）。

### 3. Hooks（イベント連動の自動化）

`.kiro/hooks/node-check-on-save.json` に `PostFileSave` フックを定義し、`.js` ファイルを保存するたびに `node --check` で構文チェックが自動実行されるようにしました。ゼロビルド構成でも壊れたコードを早期に検知できます。

### 4. プロパティベーステスト

design の「Correctness Properties」をそのまま [fast-check](https://fast-check.dev/) のプロパティとして `tests/` に落とし込み、[Vitest](https://vitest.dev/) で実行しています。出題文字の重複なし、生成された問題の構造的正当性、スコアの正確性、評価ティアの境界値などを、具体例ではなくランダム入力で網羅的に検証します。アプリ本体を無改変のまま Node の `vm` で評価するハーネス（`tests/loadAppGlobals.js`）で、ランタイム依存ゼロの構成を崩さずにテストしています。

### 5. Powers（Context7）

読み上げボイスにスコアを付けて最も自然そうなものを選ぶ処理を実装する際に、**Context7 Power** で Web Speech API のボイス選択に関する最新のドキュメント・コード例を調べました。その知見を `SpeechSynthesizer._scoreVoice` に反映しています。具体的には、既知の高品質ボイス名（Google 日本語 / Nanami / Kyoko / Otoya など）への一致、名前に `Enhanced` / `Premium` / `Neural` / `Natural` を含むか、クラウド合成（`localService === false`）か、といった観点で加点し、スコアが最大の日本語ボイスを採用しています。

### 6. MCP（Model Context Protocol）

`.kiro/settings/mcp.json` で Playwright MCP サーバーを設定し、実ブラウザでの E2E 的な通し動作確認に使いました（下記のカスタムエージェントが利用）。

### 7. カスタムエージェント

`.kiro/agents/quiz-playthrough-checker.md` に、クイズの通しプレイと読み上げ文の steering 準拠チェックを行う専任エージェントを定義しました。コードを変更しない読み取り専用の権限設定で、Playwright MCP を使ってブラウザ上で全問プレイし、`SpeechSynthesizer.speak` に渡る文字列が表記ルール（助詞「は／へ」）に沿っているかを検証します。

### ボーナス: 自作 Power（power-japanese-tts）

音声読み上げのノウハウを再利用可能な形にまとめた自作 Power を `powers/power-japanese-tts/` に同梱しています。自然な日本語ボイスの選び方・助詞の読み替えルール・発話完了を待つフロー制御のスキルを提供します。

---

## ライセンス

MIT
