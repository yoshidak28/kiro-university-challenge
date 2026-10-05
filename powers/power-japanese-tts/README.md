# japanese-tts Power

ブラウザの Web Speech API（`window.speechSynthesis` / `SpeechSynthesisUtterance`）で
**日本語を自然に読み上げる**ためのノウハウをまとめた Kiro Power です。
ひらがな学習アプリの開発で得た知見を、ほかのプロジェクトでも再利用できる形にしています。

## 含まれるスキル

| スキル | 内容 |
|---|---|
| `natural-japanese-voice` | 自然に聞こえる日本語ボイスの選び方（スコアリング／`voiceschanged` リトライ／`rate`・`pitch` 調整）。参照実装 `references/speech-synthesizer.js` 付き。 |
| `speech-text-rules` | 読み上げ用テキストの助詞ルール（「は」→「わ」、「へ」→「え」）。画面表示用と音声用の文字列を分ける。 |
| `speech-flow-control` | 読み上げ完了を待ってから次へ進める発話フロー制御（`cancel`→`speak`、`onend`/`onerror`、最小/最大待ち時間ガード、非対応フォールバック）。 |

## 要点（3 つのコツ）

1. **声の選び方** — 既定ボイスに任せず、`lang` が `ja` で始まるボイスの中から
   高品質ボイス名・`Enhanced/Neural` 等のキーワード・クラウド合成かどうかで
   スコアリングして最良を選ぶ。候補が無ければ既定にフォールバックする。
2. **助詞「は」→「わ」** — 読み上げ用の文は発音どおりに書く。助詞の「は」「へ」だけを
   「わ」「え」に直す（語頭・語中は置き換えない）。画面表示用とは別の変数にする。
3. **読み終わるのを待つ** — 固定ディレイで次へ進めると発話が途切れる。`onend`/`onerror`
   で完了を検知し、最小表示時間と最大待ち時間（フェイルセーフ）を併用して遷移する。

## インストールと使い方

このリポジトリ内のローカル Power として読み込めます。

1. Kiro の Powers パネルを開く
2. **Add Custom Power** → **Import power from a folder**
3. このフォルダ（`plugin.json` がある `powers/power-japanese-tts/`）を選択
4. 会話の中で `keywords`（例: 「Web Speech API」「音声合成」「読み上げ」「日本語 TTS」）に
   触れると、関連スキルが自動的に活性化します。

## ライセンス

MIT
