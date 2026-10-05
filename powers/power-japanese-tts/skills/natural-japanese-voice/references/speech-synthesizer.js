/**
 * speech-synthesizer.js — 日本語音声読み上げモジュール（参照実装）
 *
 * このファイルは japanese-tts Power の 3 スキルを 1 つにまとめた、
 * コピーしてそのまま使える最小実装の例です。
 *   - natural-japanese-voice : 自然な日本語ボイスの選択（scoreVoice / loadVoice）
 *   - speech-text-rules      : 読み上げ用テキストは呼び出し側で助詞を直してから渡す
 *   - speech-flow-control    : cancel→speak と onDone（onend/onerror）での完了通知
 *
 * ランタイム依存なし・ビルド不要。ES Module ではなくオブジェクトリテラル（IIFE）で
 * 公開するため、file:// でもそのまま動作します。
 *
 * 使い方:
 *   SpeechSynthesizer.init();                 // ページロード時に 1 度だけ
 *   SpeechSynthesizer.speak('こんにちわ');     // 読み上げ（助詞は発音どおりに）
 *   SpeechSynthesizer.speak('つぎえ', () => {  // 完了を待って次へ
 *     goToNext();
 *   });
 */
var SpeechSynthesizer = (function () {
  var _synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var _jaVoice = null;
  var _voiceRetries = 0;

  // 自然に聞こえることが知られている日本語ボイス名（優先度順・部分一致で判定）
  var _PREFERRED_VOICE_NAMES = [
    'Google 日本語', // Chrome のクラウド合成
    'Nanami',        // Microsoft Nanami (Neural)
    'Ayumi',
    'Kyoko',         // macOS / iOS（Enhanced があればそちらが優先される）
    'Otoya',
    'O-ren',
    'Hattori',
    'Sayaka',
  ];

  // 日本語ボイス 1 件の「自然さ」スコア。高いほど優先。
  function _scoreVoice(voice) {
    var score = 0;

    var nameIdx = -1;
    for (var i = 0; i < _PREFERRED_VOICE_NAMES.length; i++) {
      if (voice.name.indexOf(_PREFERRED_VOICE_NAMES[i]) !== -1) {
        nameIdx = i;
        break;
      }
    }
    if (nameIdx !== -1) {
      score += 100 + (_PREFERRED_VOICE_NAMES.length - nameIdx) * 10;
    }

    if (/enhanced|premium|neural|natural/i.test(voice.name)) score += 40; // 高品質版の目印
    if (voice.localService === false) score += 20;                        // クラウド合成は自然
    if (voice.default) score += 5;                                        // ロケール既定
    if (/^ja[-_]JP$/i.test(voice.lang)) score += 2;                       // ja-JP を優先

    return score;
  }

  // ボイス一覧を取得して最良の日本語ボイスを選ぶ（空なら最大 5 回リトライ）
  function _loadVoice() {
    if (!_synth) return;

    var voices = _synth.getVoices();
    if (voices.length === 0 && _voiceRetries < 5) {
      _voiceRetries++;
      setTimeout(_loadVoice, 200);
      return;
    }

    var jaVoices = voices.filter(function (v) {
      return v.lang && v.lang.indexOf('ja') === 0;
    });
    if (jaVoices.length === 0) {
      _jaVoice = null; // 日本語ボイス無し → ブラウザ既定へフォールバック
      return;
    }

    _jaVoice = jaVoices.reduce(function (best, v) {
      return _scoreVoice(v) > _scoreVoice(best) ? v : best;
    });
  }

  // ページロード時に 1 度だけ呼ぶ
  function init() {
    if (!_synth) {
      // Web Speech API 非対応ブラウザ → 音声は無効、他機能は継続
      if (window.console) console.warn('Web Speech API is not supported. Audio disabled.');
      return;
    }
    _synth.onvoiceschanged = _loadVoice; // Chrome 系: 後から発火
    _loadVoice();                        // Safari 系: 同期取得
  }

  /**
   * text を日本語で読み上げる。
   * @param {string} text  読み上げる文字列（助詞は発音どおりに直してから渡す）
   * @param {function():void} [onDone]  完了・エラー・非対応時に 1 回だけ呼ばれる
   */
  function speak(text, onDone) {
    var finished = false;
    function done() {
      if (finished) return;        // 二重発火ガード
      finished = true;
      if (typeof onDone === 'function') onDone();
    }

    if (!_synth) {
      setTimeout(done, 0);         // 非対応: 非同期で必ず呼び、遷移を止めない
      return;
    }

    _synth.cancel();               // 進行中の発話をキャンセル

    var u = new SpeechSynthesisUtterance(text);
    u.lang  = 'ja-JP';
    u.rate  = 0.8;                 // やや遅め（用途に応じて調整）
    u.pitch = 1.2;                 // やや高め（用途に応じて調整）
    if (_jaVoice) u.voice = _jaVoice;

    u.onend   = done;              // 正常終了
    u.onerror = done;             // エラーでも遷移は進めてよい

    _synth.speak(u);
  }

  return { init: init, speak: speak, _scoreVoice: _scoreVoice };
})();
