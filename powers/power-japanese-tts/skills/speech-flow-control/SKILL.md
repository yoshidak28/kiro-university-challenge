---
name: speech-flow-control
description: 読み上げが終わるのを待ってから次の画面・次の発話へ進める発話フロー制御。cancel→speak、onend/onerror での完了通知、最小/最大待ち時間ガード、非対応フォールバックを扱う。固定ディレイで次へ進めて発話が途切れる問題を防ぐ。
---

# 発話完了を待ってから次へ進む

音声の読み上げには時間がかかり、特にクラウド系ボイスは**発話開始が遅延**する。
「固定ディレイ（例: 1.5 秒後）で次へ進む」設計だと、発話が始まる前や途中で
次の `speak()` の `cancel()` に打ち切られてしまう。読み上げの**完了イベントを待って**
から次へ進めるのが正しい。

## 原則

1. 新しい発話の前に、進行中の発話を **`cancel()`** する。
2. 発話の完了は **`utterance.onend`**、失敗は **`utterance.onerror`** で検知する。
3. 完了コールバック（`onDone`）は **ちょうど 1 回だけ** 呼ぶ（二重発火をガード）。
4. 非対応ブラウザでは **非同期で即 `onDone`** を呼び、画面遷移を止めない。
5. UI 遷移には **最小表示時間** と **最大待ち時間（フェイルセーフ）** を併用する。

## 手順

### 1. speak に「完了コールバック」を持たせる

`onDone` は「正常終了」「エラー」「非対応フォールバック」のいずれでも 1 回呼ぶ。

```js
function speak(text, onDone) {
  let finished = false;
  const done = () => {
    if (finished) return;      // 二重発火ガード
    finished = true;
    if (typeof onDone === 'function') onDone();
  };

  if (!synth) {               // 非対応ブラウザ
    setTimeout(done, 0);      // 非同期で必ず呼び、遷移を止めない
    return;
  }

  synth.cancel();             // 進行中の発話をキャンセル
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.onend   = done;           // 正常終了で完了
  u.onerror = done;           // エラーでも完了扱い（遷移は進めてよい）
  synth.speak(u);
}
```

### 2. 「完了を待つ」＋「最小/最大時間ガード」で次へ進める

発話完了だけに頼ると、発話が極端に短い場合に子どもがフィードバックを認識する前に
進んでしまう。逆に `onend` が発火しないブラウザでは永久に止まる。両方を防ぐため、
**最小表示時間**と**最大待ち時間**を組み合わせる。

```js
const MIN_MS = 1200; // これ以前には進まない（認識できる最低時間を確保）
const MAX_MS = 6000; // onend が来なくても必ず進む（フェイルセーフ）

let speechDone = false;
let minElapsed = false;
let advanced   = false;

function advance() {
  if (advanced) return;      // 遷移は 1 回だけ
  advanced = true;
  goToNext();                // 次の問題・次の画面へ
}

function tryAdvance() {
  if (minElapsed && speechDone) advance();
}

setTimeout(() => { minElapsed = true; tryAdvance(); }, MIN_MS);
setTimeout(advance, MAX_MS); // フェイルセーフ

SpeechSynthesizer.speak(message, () => {
  speechDone = true;
  tryAdvance();
});
```

### 3. 次の発話が前の発話を打ち切ることを前提に設計する

遷移先で再び `speak()` を呼ぶと冒頭で `cancel()` が走る。だからこそ「前の発話が
終わってから遷移する」のが重要。遷移内容（スコア加算・次問の選択など）は
**発話を待つ前に確定**しておくと、完了コールバックの中で状態がぶれない。

## よくある失敗

- 固定 `setTimeout` だけで次へ進む → クラウドボイスで発話が途切れる。
- `onDone` を `onend` と `onerror` の両方に付けていない → エラー時に固まる。
- 二重発火ガードがない → 次問が 2 回描画される等の不具合。
- 非対応ブラウザで `onDone` を呼ばない → 音声なし環境で画面が進まない。

## チェックリスト

- [ ] 新しい発話の前に `cancel()` しているか
- [ ] `onend` と `onerror` の両方で完了通知しているか
- [ ] 完了コールバックに二重発火ガードがあるか
- [ ] 非対応ブラウザで非同期に `onDone` を呼んでいるか
- [ ] 最小表示時間と最大待ち時間（フェイルセーフ）を併用しているか
- [ ] 遷移内容を発話待ちの前に確定しているか
