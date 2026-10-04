# Requirements Document

## Introduction

「ひらがな れんしゅう」は、未就学児（3〜6歳）が保護者の見守りのもとでひらがな46文字を楽しく習得できるブラウザベースのWebアプリです。外部サーバー不要の純粋な HTML/CSS/JavaScript で実装し、タブレット・スマートフォン・PCのいずれでも動作します。アプリは「五十音表」と「クイズ」の2モードで構成され、すべての操作に Web Speech API による日本語音声読み上げを組み合わせることで、文字をまだ読めない子どもでも自立して遊べる設計とします。クイズは難易度を選択でき、子どもの習熟度に合わせた問題数と出題範囲で遊べます。

## Glossary

- **App**: アプリケーション全体（ブラウザ上で動作するシングルページアプリ）
- **Gojuon_Table**: 五十音表ビュー。縦軸に段（あ・い・う・え・お）、横軸に行（あ・か・さ・た・な・は・ま・や・ら・わ）を並べた2次元グリッド形式で46文字を表示する
- **Hiragana_Card**: Gojuon_Table 内の個々の文字カード（ボタン要素）
- **Quiz**: クイズビュー（音声を聞いて対応する文字を4択から選ぶモード）
- **Difficulty**: クイズの難易度。「かんたん」「ふつう」「むずかしい」の3段階
- **Quiz_Session**: 選択された Difficulty に基づく1回のクイズ（問題数と出題範囲は Difficulty によって異なる）
- **Question**: Quiz_Session 内の1問（読み上げ音声＋4択ボタン）
- **Choice_Button**: Question に表示される4つの選択肢ボタンのうちの1つ
- **SpeechSynthesizer**: Web Speech API を利用した日本語読み上げ機能
- **Score**: Quiz_Session 中の正解数カウンター
- **Progress_Bar**: Quiz_Session の進捗を視覚的に示すバー
- **Result_Screen**: Quiz_Session 終了後に表示されるスコアと評価メッセージの画面
- **Difficulty_Screen**: クイズ開始前に Difficulty を選択するための画面

---

## Requirements

### Requirement 1: 五十音表の表示

**User Story:** 保護者として、子どもが46文字すべてを一覧で確認できるようにしたい。そうすることで、特定の文字に興味を持ったときにすぐ探して触れられる。

#### Acceptance Criteria

1. THE App SHALL display all 46 hiragana characters (あ〜ん) as Hiragana_Card elements within the Gojuon_Table.
2. THE Gojuon_Table SHALL arrange Hiragana_Card elements in a two-dimensional grid where columns represent rows of the gojuon (あ行, か行, さ行, た行, な行, は行, ま行, や行, ら行, わ行・ん) and rows represent the vowel order (あ, い, う, え, お).
3. THE Gojuon_Table SHALL display a column header label for each gojuon row (あ行, か行, etc.) and a row header label for each vowel position (あ, い, う, え, お).
4. THE Hiragana_Card SHALL display the hiragana character in a font size large enough to be legible to a preschool-aged child.
5. THE Hiragana_Card SHALL have a tap target size large enough to accommodate preschool-aged children's finger input.
6. WHEN a Hiragana_Card receives a click or touch event, THE App SHALL invoke the SpeechSynthesizer with the character's reading in Japanese.
7. WHEN a Hiragana_Card is activated, THE App SHALL display a visual animation on that card to provide feedback to the child.
8. IF the SpeechSynthesizer is invoked while a previous utterance is active, THEN THE SpeechSynthesizer SHALL cancel the previous utterance before starting the new one.

---

### Requirement 2: 音声読み上げ（SpeechSynthesizer）

**User Story:** 未就学児として、文字をタッチしたときに正しい日本語の発音を聞きたい。そうすることで、文字と音の対応を自然に覚えられる。

#### Acceptance Criteria

1. THE SpeechSynthesizer SHALL use the browser's Web Speech API with Japanese language setting for all speech output.
2. THE SpeechSynthesizer SHALL use a speech rate slow enough to aid comprehension by preschool-aged children.
3. THE SpeechSynthesizer SHALL use a pitch high enough to produce a bright, child-friendly tone.
4. WHEN a Japanese-language voice is available in the browser's voice list, THE SpeechSynthesizer SHALL select a Japanese voice.
5. IF no Japanese-language voice is available, THEN THE SpeechSynthesizer SHALL fall back to the browser's default voice.

---

### Requirement 3: タブナビゲーション

**User Story:** 保護者として、子どもが五十音表とクイズを簡単に切り替えられるようにしたい。そうすることで、学習と遊びをスムーズに行き来できる。

#### Acceptance Criteria

1. THE App SHALL provide exactly 2 tab buttons — one for Gojuon_Table and one for Quiz — in a tab navigation area.
2. WHEN a tab button is clicked, THE App SHALL hide the currently active view and display the view corresponding to the selected tab.
3. WHEN the Quiz tab is selected, THE App SHALL display the Difficulty_Screen before starting a Quiz_Session.
4. THE App SHALL reflect the active tab's selected state with a distinct visual style to indicate the current view.
5. THE App SHALL set `aria-selected="true"` on the active tab button and `aria-selected="false"` on inactive tab buttons for screen reader accessibility.

---

### Requirement 4: クイズ難易度選択

**User Story:** 保護者として、子どもの習熟度に合った難しさでクイズを始めさせたい。そうすることで、簡単すぎず難しすぎないちょうどよいレベルで練習できる。

#### Acceptance Criteria

1. THE App SHALL display the Difficulty_Screen before each Quiz_Session begins, presenting the 3 Difficulty options: かんたん, ふつう, むずかしい.
2. WHEN "かんたん" is selected, THE Quiz_Session SHALL use characters from あ行 through な行 (25 characters) and present a small number of questions suitable for beginners.
3. WHEN "ふつう" is selected, THE Quiz_Session SHALL use all 46 hiragana characters and present a moderate number of questions.
4. WHEN "むずかしい" is selected, THE Quiz_Session SHALL use all 46 hiragana characters and present a larger number of questions than ふつう.
5. THE App SHALL display each Difficulty option with a label and a brief description of its question count and character range so that the parent can guide the child's selection.
6. WHEN a Difficulty is selected on the Difficulty_Screen, THE App SHALL immediately start a Quiz_Session with the corresponding settings.

---

### Requirement 5: クイズの出題ロジック

**User Story:** 未就学児として、聞いた音と同じひらがなを選ぶゲームで遊びたい。そうすることで、楽しみながら文字と音の対応を練習できる。

#### Acceptance Criteria

1. THE Quiz SHALL select the required number of characters from the Difficulty's character pool at random without replacement for each Quiz_Session.
2. THE Quiz SHALL present each Question with exactly 4 Choice_Button elements.
3. THE Quiz SHALL include the correct answer character in the 4 Choice_Button elements for every Question.
4. THE Quiz SHALL include exactly 3 distractor characters selected at random from the full 46-character set, all of which differ from the correct answer.
5. THE Quiz SHALL ensure that all 4 Choice_Button characters within a single Question are distinct.
6. WHEN a new Question is displayed, THE App SHALL invoke the SpeechSynthesizer to read aloud the correct answer's reading automatically after a short delay.
7. THE Quiz SHALL present all Questions for the Quiz_Session and then display the Result_Screen.
8. THE Quiz SHALL track and increment Score by 1 for each correct answer within a Quiz_Session.

---

### Requirement 6: 回答フィードバック

**User Story:** 未就学児として、答えを選んだあとにすぐ正解・不正解を知りたい。そうすることで、どの文字が正しいかをその場で学べる。

#### Acceptance Criteria

1. WHEN a Choice_Button is clicked and the selected character equals the correct answer, THE App SHALL display a positive correct-feedback message (e.g. "⭐ せいかい！") in the feedback area.
2. WHEN a Choice_Button is clicked and the selected character does not equal the correct answer, THE App SHALL display a gentle wrong-feedback message that includes the correct character without using discouraging language (e.g. "もう いちど！ こたえは「{char}」だよ！" or "おしい！ こたえは「{char}」だよ！").
3. WHEN a Choice_Button is clicked, THE App SHALL visually highlight the correct answer Choice_Button with a distinct correct style regardless of whether the selected answer was correct or incorrect.
4. WHEN a Choice_Button is clicked and the selected character does not equal the correct answer, THE App SHALL also apply a distinct wrong style to the selected Choice_Button.
5. WHEN a Choice_Button is clicked, THE App SHALL disable all 4 Choice_Button elements within the current Question to prevent multiple answers.
6. WHEN a correct answer is selected, THE SpeechSynthesizer SHALL read aloud a positive correct-feedback phrase.
7. WHEN an incorrect answer is selected, THE SpeechSynthesizer SHALL read aloud a gentle phrase that includes the correct answer's reading, without using discouraging words.
8. THE App SHALL advance to the next Question after a brief delay following a Choice_Button click.

---

### Requirement 7: 進捗表示

**User Story:** 保護者として、クイズがあと何問残っているかを把握したい。そうすることで、子どもに終了時間を伝えられる。

#### Acceptance Criteria

1. THE App SHALL display a progress indicator showing the current question number and total question count throughout the Quiz_Session.
2. THE App SHALL display a Score indicator showing the current correct count and answered count throughout the Quiz_Session.
3. THE App SHALL display a Progress_Bar that visually represents the proportion of Questions answered out of the total for the Quiz_Session.
4. WHEN a new Question is displayed, THE Progress_Bar SHALL update its visual state to reflect the current progress.
5. THE Progress_Bar SHALL expose appropriate ARIA attributes for screen reader accessibility.

---

### Requirement 8: 結果画面

**User Story:** 未就学児として、クイズが終わったときにどれだけできたかを楽しく知りたい。そうすることで、達成感を得てもう一度挑戦したくなる。

#### Acceptance Criteria

1. WHEN all Questions in a Quiz_Session have been answered, THE App SHALL hide the quiz question area and display the Result_Screen.
2. THE Result_Screen SHALL display the final Score as a ratio of correct answers to total questions.
3. WHEN the correct answer rate is 100%, THE Result_Screen SHALL display a perfect-score message (e.g. "🎉 まんてん！すごい！！") and 3 stars (⭐⭐⭐).
4. WHEN the correct answer rate is 70% or more and less than 100%, THE Result_Screen SHALL display a good-score message (e.g. "👏 よくできました！") and 2 stars (⭐⭐).
5. WHEN the correct answer rate is less than 70%, THE Result_Screen SHALL display an encouraging message (e.g. "😊 またちょうせんしてみよう！") and 1 star (⭐).
6. WHEN the Result_Screen is displayed, THE SpeechSynthesizer SHALL read aloud the result message after a short delay.
7. THE Result_Screen SHALL provide a retry button that, when clicked, hides the Result_Screen and returns to the Difficulty_Screen.

---

### Requirement 9: 連打・二重操作防止

**User Story:** 未就学児として、ボタンを素早く何度もタッチしても誤動作しないでほしい。そうすることで、意図しない操作でゲームが壊れない。

#### Acceptance Criteria

1. THE Quiz SHALL accept only the first Choice_Button interaction per Question and ignore all subsequent interactions until the next Question is displayed.
2. WHILE the App is processing a Choice_Button interaction for the current Question, THE Quiz SHALL ignore all further Choice_Button click events for that Question.
3. THE Quiz SHALL reset its interaction state at the start of each new Question display.

---

### Requirement 10: レスポンシブデザインとアクセシビリティ

**User Story:** 保護者として、タブレット・スマートフォン・PCのどのデバイスでもアプリを正常に使いたい。そうすることで、家や外出先でシームレスに学習させられる。

#### Acceptance Criteria

1. THE App SHALL display correctly on screens with a minimum width of 320px without horizontal scrolling.
2. THE App SHALL use fluid typography so that font sizes scale proportionally between mobile and desktop viewports.
3. THE Hiragana_Card AND THE Choice_Button SHALL each be styled to prevent double-tap zoom on iOS touch devices.
4. THE App SHALL include appropriate ARIA roles and attributes on interactive and dynamic regions to support assistive technologies.
5. WHERE the user's operating system has reduced-motion preferences enabled, THE App SHALL suppress or minimize all CSS animations and transitions.
6. THE App SHALL load and display correctly in the latest versions of Chrome, Safari, and Firefox without requiring a build step or server.

---

### Requirement 11: ファイル構成と依存関係

**User Story:** 開発者として、外部フレームワークや依存パッケージなしにアプリを構成したい。そうすることで、サーバーなしにローカルや GitHub Pages から直接実行できる。

#### Acceptance Criteria

1. THE App SHALL not import or load any external JavaScript framework, CSS framework, or runtime dependency beyond a web font service for typography.
2. WHEN the App's entry point is opened directly in a browser via file protocol or served via a static hosting service, THE App SHALL function fully without a server-side component.
3. THE App SHALL be deployable by placing its files in a public repository without any build or compilation step.
