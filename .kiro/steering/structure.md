# プロジェクト構成・コード規約

## ディレクトリ構成

```
kiro-university-challenge/
├── .kiro/
│   ├── specs/
│   │   └── hiragana-learning-app/   # 仕様（requirements / design / tasks）
│   └── steering/                    # ステアリング（本ファイル群）
│       ├── product.md
│       ├── tech.md
│       ├── structure.md
│       └── speech-text.md           # 読み上げテキストの表記ルール
└── hiragana-app/                    # アプリ本体
    ├── index.html                   # エントリポイント・DOM 構造・初期化スクリプト
    ├── style.css                    # レイアウト・アニメーション・アクセシビリティ
    ├── hiragana.js                  # データ定義・音声・五十音表ビュー
    └── quiz.js                      # クイズのロジックとビュー・アプリ状態
```

## ファイルごとの責務

- **index.html**
  - SPA の骨格、WAI-ARIA 属性つきの DOM 構造。
  - `<script>` でアプリ初期化（`SpeechSynthesizer.init()`・五十音表描画・タブ切り替え）を行う。
  - 読み込み順は `hiragana.js` → `quiz.js`（quiz.js が hiragana.js のシンボルに依存するため）。

- **hiragana.js**
  - `HIRAGANA_DATA`：46文字のデータ配列（`char` / `row` / `rowIdx` / `vowel` / `vowelIdx`）。
  - `ALL_CHARS`：全46文字の配列。
  - `SpeechSynthesizer`：音声読み上げモジュール。
  - `GojuonTableView`：五十音表のレンダリングモジュール。

- **quiz.js**
  - `DIFFICULTY_CONFIG`：難易度ごとの設定（出題範囲・問題数・ラベル）。
  - `QuizLogic`：純粋関数モジュール（`getDifficultyConfig` / `createSession` /
    `generateQuestion` / `evaluateAnswer` / `calcResultTier`）。
  - `AppState`：アプリ全体の状態（アクティブタブ、クイズのフェーズ・難易度・セッション・連打防止フラグ）。
  - `QuizView`：クイズ UI の DOM 操作モジュール（難易度選択・出題・フィードバック・結果・カウントダウン）。

## 命名規約

- データ定数・設定定数：`UPPER_SNAKE_CASE`（例：`HIRAGANA_DATA`、`DIFFICULTY_CONFIG`）。
- モジュール（名前空間オブジェクト）：`PascalCase`（例：`QuizLogic`、`QuizView`、`SpeechSynthesizer`）。
- 関数・変数：`camelCase`。
- 内部専用のプロパティ・メソッド：先頭にアンダースコア（例：`_onCardClick`、`_jaVoice`）。
- CSS クラス：BEM 風（`block__element`、`block--modifier`）。状態クラスは `is-`／`view--`／`quiz-phase--` 等。

## 実装規約

- 新規ロジックは、純粋関数（`QuizLogic` 側）と DOM 操作（`*View` 側）に分けて書く。
- グローバル状態の読み書きは `AppState` 経由で行う。
- 文字列を読み上げる際は、`speech-text.md` のルール（助詞「は」→「わ」、「へ」→「え」）に従い、
  画面表示用と読み上げ用の文字列を別々に用意する。
- 新しい DOM 要素を動的生成する場合は、対応する CSS クラスを `style.css` に定義する。
- アニメーションを追加した場合は、`prefers-reduced-motion` の抑制対象にも含める。

## 仕様（spec）との関係

- 実装は `.kiro/specs/hiragana-learning-app/` の requirements / design / tasks に基づく。
- 仕様に影響する変更を行う場合は、該当する spec ドキュメントも更新する。
