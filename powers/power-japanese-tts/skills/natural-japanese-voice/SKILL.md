---
name: natural-japanese-voice
description: Web Speech API で最も自然に聞こえる日本語ボイスを選び、話速・ピッチを調整する手順。speechSynthesis / SpeechSynthesisUtterance で日本語（ja-JP）を読み上げるときに使う。
---

# 自然な日本語ボイスを選ぶ

ブラウザ内蔵の音声合成（`window.speechSynthesis`）は、何も指定しないと
ロボット的な既定ボイスで読み上げてしまうことが多い。自然に聞こえる日本語ボイスを
明示的に選ぶことで品質が大きく変わる。この手順はそのための選び方をまとめる。

## 前提となる注意点

- `getVoices()` は Chrome などで**初回に空配列を返す**ことがある。ボイス一覧は
  非同期で読み込まれるため、`voiceschanged` イベントとリトライの両方で取得する。
- 利用できるボイスは**OS・ブラウザ・インストール状況に依存する**。特定のボイス名の
  存在を前提にせず、「あれば使う／なければ既定にフォールバック」で設計する。
- 非対応ブラウザ（`'speechSynthesis' in window` が false）では音声機能を無効にし、
  他の機能は動かし続ける（サイレントフォールバック）。

## 手順

### 1. ボイス一覧を非同期で取得する

`init()` を 1 度だけ呼び、`voiceschanged` と同期取得の両方に備える。

```js
synth.onvoiceschanged = loadVoice; // Chrome 系: 後から発火
loadVoice();                       // Safari 系: 同期的に返ることもある
```

`getVoices()` が空なら、少し待って再取得する（最大 5 回・200ms 間隔が目安）。

```js
const voices = synth.getVoices();
if (voices.length === 0 && retries < 5) {
  retries++;
  setTimeout(loadVoice, 200);
  return;
}
```

### 2. 日本語ボイスだけを候補にする

`lang` が `ja` で始まるものに絞る。候補が 0 件なら `voice` を未指定のままにして
ブラウザ既定にフォールバックする。

```js
const jaVoices = voices.filter(v => v.lang && v.lang.startsWith('ja'));
```

### 3. 「自然さ」でスコアリングして最良を選ぶ

完全一致ではなく部分一致（`includes`）で評価し、派生名（例: `Kyoko (Enhanced)`）も
拾えるようにする。評価軸は次の通り。

- **既知の高品質ボイス名に一致**（優先度順に加点）。代表例:
  - `Google 日本語` … Chrome のクラウド合成、自然
  - `Kyoko` / `Otoya` … macOS / iOS の拡張ボイス
  - `Nanami` / `Ayumi` … Windows の Neural 系
  - `O-ren` / `Hattori` / `Sayaka` … その他の日本語ボイス
- 名前に **`Enhanced` / `Premium` / `Neural` / `Natural`** を含む（高品質版の目印）→ 加点
- **リモート（クラウド）合成**は自然な傾向 → `voice.localService === false` を加点
- **ロケール既定ボイス**（`voice.default === true`）→ 小さく加点
- `ja-JP`（地域つき）を `ja`（地域なし）よりわずかに優先

スコアが最大のボイスを採用する。同点なら `getVoices()` の並び順を維持する。

```js
jaVoice = jaVoices.reduce((best, v) =>
  scoreVoice(v) > scoreVoice(best) ? v : best
);
```

`scoreVoice` の実装例は `references/speech-synthesizer.js` を参照。

### 4. 発話時に話速・ピッチを調整する

未就学児・学習用途では、**話速をやや遅め・ピッチをやや高め**にすると聞き取りやすい。
用途に応じて調整する（デフォルトはどちらも 1.0）。

```js
const u = new SpeechSynthesisUtterance(text);
u.lang  = 'ja-JP'; // 日本語ロケールを明示
u.rate  = 0.8;     // やや遅め（子ども向け）
u.pitch = 1.2;     // やや高め（明るい声）
if (jaVoice) u.voice = jaVoice; // 選んだボイスがあれば使用
synth.speak(u);
```

## チェックリスト

- [ ] `voiceschanged` と同期取得の両方でボイスを拾っているか
- [ ] `getVoices()` が空のときのリトライがあるか
- [ ] `lang.startsWith('ja')` で日本語ボイスに絞っているか
- [ ] 候補 0 件のとき既定ボイスにフォールバックするか
- [ ] 特定ボイス名の存在を前提にしていないか（部分一致＋スコアリング）
- [ ] 非対応ブラウザでサイレントに無効化できているか
