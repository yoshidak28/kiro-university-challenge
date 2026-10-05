/**
 * hiragana.js — ひらがなデータ定義
 *
 * このファイルはデータ定数のみを含みます。
 * SpeechSynthesizer・GojuonTableView モジュールは後のタスクで追加されます。
 */

/**
 * 五十音データの1エントリ
 *
 * @typedef {Object} HiraganaEntry
 * @property {string}      char      - ひらがな1文字 (例: 'あ')
 * @property {string}      row       - 行名 (例: 'あ行')
 * @property {number}      rowIdx    - 列インデックス 0〜9
 *                                     あ行=0, か行=1, さ行=2, た行=3, な行=4,
 *                                     は行=5, ま行=6, や行=7, ら行=8, わ行・ん=9
 * @property {string|null} vowel     - 段名 (例: 'あ')。ん は null
 * @property {number|null} vowelIdx  - 段インデックス 0〜4 (あ=0, い=1, う=2, え=3, お=4)。
 *                                     や行の空欄・ん は null
 */

/**
 * 五十音グリッド構造（縦：段、横：行）
 *
 * 段 ↓ / 行 →   あ行(0) か行(1) さ行(2) た行(3) な行(4) は行(5) ま行(6) や行(7) ら行(8) わ行・ん(9)
 * あ (vowelIdx=0)  あ      か      さ      た      な      は      ま      や      ら      わ
 * い (vowelIdx=1)  い      き      し      ち      に      ひ      み      ─      り      ─
 * う (vowelIdx=2)  う      く      す      つ      ぬ      ふ      む      ゆ      る      ─
 * え (vowelIdx=3)  え      け      せ      て      ね      へ      め      ─      れ      ─
 * お (vowelIdx=4)  お      こ      そ      と      の      ほ      も      よ      ろ      を
 * (特殊)                                                                                  ん
 *
 * 空セル（エントリなし）:
 *   や行 い段 (rowIdx=7, vowelIdx=1)
 *   や行 え段 (rowIdx=7, vowelIdx=3)
 *   わ行 い段・う段・え段 (rowIdx=9, vowelIdx=1/2/3)
 *
 * を: rowIdx=9, vowelIdx=4
 * ん: rowIdx=9, vowel=null, vowelIdx=null
 */

/**
 * 五十音46文字のデータ配列。
 * 行（あ行〜わ行・ん）× 段（あ〜お）の順で格納し、
 * 空セル（や行のい段・え段、わ行のい〜え段）はエントリを持たない。
 *
 * @type {HiraganaEntry[]}
 */
const HIRAGANA_DATA = [
  // ── あ行 (rowIdx=0) ──
  { char: 'あ', row: 'あ行', rowIdx: 0, vowel: 'あ', vowelIdx: 0 },
  { char: 'い', row: 'あ行', rowIdx: 0, vowel: 'い', vowelIdx: 1 },
  { char: 'う', row: 'あ行', rowIdx: 0, vowel: 'う', vowelIdx: 2 },
  { char: 'え', row: 'あ行', rowIdx: 0, vowel: 'え', vowelIdx: 3 },
  { char: 'お', row: 'あ行', rowIdx: 0, vowel: 'お', vowelIdx: 4 },

  // ── か行 (rowIdx=1) ──
  { char: 'か', row: 'か行', rowIdx: 1, vowel: 'あ', vowelIdx: 0 },
  { char: 'き', row: 'か行', rowIdx: 1, vowel: 'い', vowelIdx: 1 },
  { char: 'く', row: 'か行', rowIdx: 1, vowel: 'う', vowelIdx: 2 },
  { char: 'け', row: 'か行', rowIdx: 1, vowel: 'え', vowelIdx: 3 },
  { char: 'こ', row: 'か行', rowIdx: 1, vowel: 'お', vowelIdx: 4 },

  // ── さ行 (rowIdx=2) ──
  { char: 'さ', row: 'さ行', rowIdx: 2, vowel: 'あ', vowelIdx: 0 },
  { char: 'し', row: 'さ行', rowIdx: 2, vowel: 'い', vowelIdx: 1 },
  { char: 'す', row: 'さ行', rowIdx: 2, vowel: 'う', vowelIdx: 2 },
  { char: 'せ', row: 'さ行', rowIdx: 2, vowel: 'え', vowelIdx: 3 },
  { char: 'そ', row: 'さ行', rowIdx: 2, vowel: 'お', vowelIdx: 4 },

  // ── た行 (rowIdx=3) ──
  { char: 'た', row: 'た行', rowIdx: 3, vowel: 'あ', vowelIdx: 0 },
  { char: 'ち', row: 'た行', rowIdx: 3, vowel: 'い', vowelIdx: 1 },
  { char: 'つ', row: 'た行', rowIdx: 3, vowel: 'う', vowelIdx: 2 },
  { char: 'て', row: 'た行', rowIdx: 3, vowel: 'え', vowelIdx: 3 },
  { char: 'と', row: 'た行', rowIdx: 3, vowel: 'お', vowelIdx: 4 },

  // ── な行 (rowIdx=4) ──
  { char: 'な', row: 'な行', rowIdx: 4, vowel: 'あ', vowelIdx: 0 },
  { char: 'に', row: 'な行', rowIdx: 4, vowel: 'い', vowelIdx: 1 },
  { char: 'ぬ', row: 'な行', rowIdx: 4, vowel: 'う', vowelIdx: 2 },
  { char: 'ね', row: 'な行', rowIdx: 4, vowel: 'え', vowelIdx: 3 },
  { char: 'の', row: 'な行', rowIdx: 4, vowel: 'お', vowelIdx: 4 },

  // ── は行 (rowIdx=5) ──
  { char: 'は', row: 'は行', rowIdx: 5, vowel: 'あ', vowelIdx: 0 },
  { char: 'ひ', row: 'は行', rowIdx: 5, vowel: 'い', vowelIdx: 1 },
  { char: 'ふ', row: 'は行', rowIdx: 5, vowel: 'う', vowelIdx: 2 },
  { char: 'へ', row: 'は行', rowIdx: 5, vowel: 'え', vowelIdx: 3 },
  { char: 'ほ', row: 'は行', rowIdx: 5, vowel: 'お', vowelIdx: 4 },

  // ── ま行 (rowIdx=6) ──
  { char: 'ま', row: 'ま行', rowIdx: 6, vowel: 'あ', vowelIdx: 0 },
  { char: 'み', row: 'ま行', rowIdx: 6, vowel: 'い', vowelIdx: 1 },
  { char: 'む', row: 'ま行', rowIdx: 6, vowel: 'う', vowelIdx: 2 },
  { char: 'め', row: 'ま行', rowIdx: 6, vowel: 'え', vowelIdx: 3 },
  { char: 'も', row: 'ま行', rowIdx: 6, vowel: 'お', vowelIdx: 4 },

  // ── や行 (rowIdx=7) — い段・え段は空セルのためエントリなし ──
  { char: 'や', row: 'や行', rowIdx: 7, vowel: 'あ', vowelIdx: 0 },
  { char: 'ゆ', row: 'や行', rowIdx: 7, vowel: 'う', vowelIdx: 2 },
  { char: 'よ', row: 'や行', rowIdx: 7, vowel: 'お', vowelIdx: 4 },

  // ── ら行 (rowIdx=8) ──
  { char: 'ら', row: 'ら行', rowIdx: 8, vowel: 'あ', vowelIdx: 0 },
  { char: 'り', row: 'ら行', rowIdx: 8, vowel: 'い', vowelIdx: 1 },
  { char: 'る', row: 'ら行', rowIdx: 8, vowel: 'う', vowelIdx: 2 },
  { char: 'れ', row: 'ら行', rowIdx: 8, vowel: 'え', vowelIdx: 3 },
  { char: 'ろ', row: 'ら行', rowIdx: 8, vowel: 'お', vowelIdx: 4 },

  // ── わ行・ん (rowIdx=9) — い〜え段は空セルのためエントリなし ──
  { char: 'わ', row: 'わ行', rowIdx: 9, vowel: 'あ', vowelIdx: 0 },
  { char: 'を', row: 'わ行', rowIdx: 9, vowel: 'お', vowelIdx: 4 },
  { char: 'ん', row: 'わ行', rowIdx: 9, vowel: null,  vowelIdx: null },
];

/**
 * 全46文字のひらがな配列（クイズ出題等に使用）。
 *
 * @type {string[]}
 */
const ALL_CHARS = HIRAGANA_DATA.map(e => e.char);

// ─────────────────────────────────────────────────────────────────────────────
// SpeechSynthesizer モジュール
//
// Web Speech API をラップし、日本語音声を非同期で初期化・発話する。
// IIFE ではなくオブジェクトリテラルとして定義し、グローバル定数として公開する。
//
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.8
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SpeechSynthesizer — 日本語音声読み上げモジュール。
 *
 * 使い方:
 *   SpeechSynthesizer.init();   // ページロード時に1度だけ呼ぶ
 *   SpeechSynthesizer.speak('あ');
 */
const SpeechSynthesizer = (() => {
  /** @type {SpeechSynthesis|null} */
  const _synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;

  /** @type {SpeechSynthesisVoice|null} */
  let _jaVoice = null;

  /** `getVoices()` が空を返した際のリトライカウンター */
  let _voiceRetries = 0;

  /**
   * 自然に聞こえることが知られている日本語ボイス名（優先度順）。
   *
   * プラットフォーム別の代表的な高品質ボイス:
   *   - Google 日本語          : Chrome（クラウド合成、自然）
   *   - Kyoko / Otoya          : macOS / iOS の拡張（Enhanced/Premium）ボイス
   *   - Microsoft Nanami/Ayumi : Windows の Neural 系ボイス
   *   - O-ren                  : macOS の多言語ボイス
   *
   * 完全一致ではなく部分一致（includes）で判定するため、
   * "Kyoko (Enhanced)" のような派生名も拾える。
   *
   * @type {string[]}
   */
  const _PREFERRED_VOICE_NAMES = [
    'Google 日本語',
    'Nanami',   // Microsoft Nanami (Neural)
    'Ayumi',
    'Kyoko',    // macOS / iOS（Enhanced があればそちらが優先される）
    'Otoya',
    'O-ren',
    'Hattori',
    'Sayaka',
  ];

  /**
   * 日本語ボイス 1 件の「自然さ」スコアを算出する。
   * スコアが高いほど優先的に選ばれる。
   *
   * 評価軸:
   *   - 既知の高品質ボイス名に一致（優先度順に加点）
   *   - 名前に Enhanced / Premium / Neural / Natural を含む（高品質版の目印）
   *   - リモート（クラウド）合成は自然な傾向があるため加点（localService === false）
   *   - ブラウザがそのロケールの既定とみなすボイス（default === true）
   *
   * @param {SpeechSynthesisVoice} voice
   * @returns {number}
   */
  function _scoreVoice(voice) {
    let score = 0;

    // 既知の高品質ボイス名（リスト先頭ほど高得点）
    const nameIdx = _PREFERRED_VOICE_NAMES.findIndex(
      name => voice.name.includes(name)
    );
    if (nameIdx !== -1) {
      score += 100 + (_PREFERRED_VOICE_NAMES.length - nameIdx) * 10;
    }

    // 高品質版を示すキーワード
    if (/enhanced|premium|neural|natural/i.test(voice.name)) {
      score += 40;
    }

    // リモート（クラウド）合成は一般に自然（MDN: localService）
    if (voice.localService === false) {
      score += 20;
    }

    // ロケール既定ボイス
    if (voice.default) {
      score += 5;
    }

    // ja-JP を ja（地域なし）よりわずかに優先
    if (/^ja[-_]JP$/i.test(voice.lang)) {
      score += 2;
    }

    return score;
  }

  /**
   * ブラウザのボイスリストから、最も自然に聞こえそうな日本語ボイスを選ぶ。
   * Chrome 等では `voiceschanged` 発火前に `getVoices()` が空を返すため、
   * 最大 5 回・200ms 間隔でリトライする。
   *
   * lang が 'ja' で始まるボイスを候補とし（Requirements 2.4）、
   * `_scoreVoice` のスコアが最大のものを採用する。
   * 候補が無ければ null のまま（ブラウザデフォルトを使用）（Requirements 2.5）。
   *
   * @returns {void}
   */
  function _loadVoice() {
    if (!_synth) return;

    const voices = _synth.getVoices();

    if (voices.length === 0 && _voiceRetries < 5) {
      _voiceRetries++;
      setTimeout(_loadVoice, 200);
      return;
    }

    // 日本語ボイスのみを候補にする（Requirements 2.4）
    const jaVoices = voices.filter(v => v.lang && v.lang.startsWith('ja'));

    if (jaVoices.length === 0) {
      _jaVoice = null; // 日本語ボイス無し → ブラウザデフォルト（Requirements 2.5）
      return;
    }

    // スコア最大のボイスを選択（同点時は getVoices() の並び順を維持）
    _jaVoice = jaVoices.reduce((best, v) =>
      _scoreVoice(v) > _scoreVoice(best) ? v : best
    );
  }

  /**
   * SpeechSynthesizer を初期化する。
   * `voiceschanged` イベントと `setTimeout` フォールバックを設定する。
   * ページロード時に 1 度だけ呼び出すこと。
   *
   * @returns {void}
   */
  function init() {
    if (!_synth) {
      // Web Speech API 非対応ブラウザへのサイレントフォールバック
      console.warn('Web Speech API is not supported. Audio features disabled.');
      return;
    }

    // Chrome 等: voiceschanged 発火後に日本語ボイスを取得（Requirements 2.4）
    _synth.onvoiceschanged = _loadVoice;

    // Safari 等: 同期的に getVoices() が返る場合に即取得
    _loadVoice();
  }

  /**
   * 指定テキストを日本語音声で読み上げる。
   * 進行中の発話がある場合は先にキャンセルする（Requirements 1.8）。
   *
   * 発話の完了（または非対応・エラー）を知りたい場合は `onDone` を渡す。
   * `onDone` は以下のいずれかのタイミングで **ちょうど1回** 呼ばれる:
   *   - 発話が正常に終了したとき（utterance の `end` イベント）
   *   - 発話中にエラーが発生したとき（`error` イベント）
   *   - Web Speech API 非対応でサイレントフォールバックするとき（即時・非同期）
   *
   * これにより呼び出し側は「読み上げが終わってから次へ進む」制御ができ、
   * クラウド系ボイスのように発話開始が遅延しても途中で打ち切られない。
   *
   * @param {string} text - 読み上げるテキスト
   * @param {function(): void} [onDone] - 発話完了・エラー・非対応時に1回だけ呼ばれる
   * @returns {void}
   */
  function speak(text, onDone) {
    // onDone を最大1回だけ呼ぶためのガード
    let _finished = false;
    const _done = () => {
      if (_finished) return;
      _finished = true;
      if (typeof onDone === 'function') onDone();
    };

    if (!_synth) {
      // 非対応ブラウザはサイレントフォールバック。
      // 呼び出し側の遷移が止まらないよう onDone は非同期で必ず呼ぶ。
      setTimeout(_done, 0);
      return;
    }

    // 進行中の発話をキャンセルしてから新しい発話を開始（Requirements 1.8）
    _synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 日本語ロケールを設定（Requirements 2.1）
    utterance.lang = 'ja-JP';

    // 子ども向けに遅めのrate（デフォルト 1.0 より低く設定）（Requirements 2.2）
    utterance.rate = 0.8;

    // 子ども向けに明るめのpitch（デフォルト 1.0 より高く設定）（Requirements 2.3）
    utterance.pitch = 1.2;

    // 日本語ボイスが取得できていれば使用（Requirements 2.4）
    // null の場合はブラウザデフォルトを使用（Requirements 2.5）
    if (_jaVoice) {
      utterance.voice = _jaVoice;
    }

    // 発話完了・エラーで onDone を呼ぶ（どちらも遷移を進めてよい）
    utterance.onend   = _done;
    utterance.onerror = _done;

    _synth.speak(utterance);
  }

  // 公開インターフェース
  return {
    init,
    speak,
    /** テスト・デバッグ用: ボイスの自然さスコアを算出する純粋関数 */
    _scoreVoice,
    /** テスト・デバッグ用: 選択中の日本語ボイスを参照する */
    get _jaVoice() { return _jaVoice; },
    /** テスト・デバッグ用: SpeechSynthesis インスタンスを参照する */
    get _synth() { return _synth; },
  };
})();

// ─────────────────────────────────────────────────────────────────────────────
// GojuonTableView モジュール
//
// HIRAGANA_DATA を元に五十音表（<table>）を構築し、コンテナ要素に挿入する。
// 各文字カード（<button>）のクリックで SpeechSynthesizer.speak() を呼び出す。
//
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GojuonTableView — 五十音表レンダリングモジュール。
 *
 * 使い方:
 *   GojuonTableView.render(document.getElementById('gojuon-table'));
 */
const GojuonTableView = (() => {

  /**
   * 五十音表の行（横軸）定義。
   * 表示順は伝統的な五十音の列順に合わせる。
   *
   * @type {{ rowIdx: number, label: string }[]}
   */
  const ROW_DEFS = [
    { rowIdx: 0, label: 'あ行' },
    { rowIdx: 1, label: 'か行' },
    { rowIdx: 2, label: 'さ行' },
    { rowIdx: 3, label: 'た行' },
    { rowIdx: 4, label: 'な行' },
    { rowIdx: 5, label: 'は行' },
    { rowIdx: 6, label: 'ま行' },
    { rowIdx: 7, label: 'や行' },
    { rowIdx: 8, label: 'ら行' },
    { rowIdx: 9, label: 'わ行・ん' },
  ];

  /**
   * 五十音表の段（縦軸）定義（あ〜お）。
   *
   * @type {{ vowelIdx: number, label: string }[]}
   */
  const VOWEL_DEFS = [
    { vowelIdx: 0, label: 'あ' },
    { vowelIdx: 1, label: 'い' },
    { vowelIdx: 2, label: 'う' },
    { vowelIdx: 3, label: 'え' },
    { vowelIdx: 4, label: 'お' },
  ];

  /**
   * カードクリック時のハンドラ。
   * SpeechSynthesizer.speak() を呼び、アニメーションクラスを付与する。
   *
   * @param {HTMLButtonElement} btn  - クリックされたボタン要素
   * @param {string}            char - 対応するひらがな文字
   * @returns {void}
   */
  function _onCardClick(btn, char) {
    // 音声読み上げ（Requirements 1.6）
    SpeechSynthesizer.speak(char);

    // アニメーションクラスを付与してフィードバックを提供（Requirements 1.7）
    // 既存の is-active クラスをいったん除去してから付与することで
    // 連続タップ時もアニメーションが再トリガーされる
    btn.classList.remove('is-active');

    // 1フレーム待ってから付与（アニメーション再トリガーのため）
    requestAnimationFrame(() => {
      btn.classList.add('is-active');
    });

    // アニメーション終了後にクラスを除去
    btn.addEventListener(
      'animationend',
      () => { btn.classList.remove('is-active'); },
      { once: true }
    );
  }

  /**
   * 五十音表を構築してコンテナに挿入する。
   * 呼び出し前にコンテナの内容はクリアされる。
   *
   * @param {HTMLElement} container - 表を挿入する親要素（例: #gojuon-table）
   * @returns {void}
   */
  function render(container) {
    // コンテナをクリア
    container.innerHTML = '';

    // HIRAGANA_DATA を rowIdx × vowelIdx のマップに変換（高速ルックアップ用）
    /** @type {Map<string, HiraganaEntry>} key = "rowIdx,vowelIdx" */
    const entryMap = new Map();
    /** @type {HiraganaEntry|null} ん（vowelIdx=null）は別途保持 */
    let nnEntry = null;

    for (const entry of HIRAGANA_DATA) {
      if (entry.vowelIdx === null) {
        nnEntry = entry; // 「ん」
      } else {
        entryMap.set(`${entry.rowIdx},${entry.vowelIdx}`, entry);
      }
    }

    // ── <table> 構築 ──
    const table = document.createElement('table');
    table.className = 'gojuon-table';
    table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', '五十音表');

    // ── <thead>: 行ヘッダー（あ行〜わ行・ん）──
    // Requirements 1.3: 行ヘッダーラベルを表示
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // 左上の空コーナーセル（段ラベル列用）
    const cornerTh = document.createElement('th');
    cornerTh.className = 'gojuon-corner';
    cornerTh.setAttribute('aria-hidden', 'true');
    headerRow.appendChild(cornerTh);

    for (const rowDef of ROW_DEFS) {
      const th = document.createElement('th');
      th.className = 'gojuon-col-header';
      th.scope = 'col';
      th.textContent = rowDef.label;
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ── <tbody>: 各段（あ〜お）の行 ──
    const tbody = document.createElement('tbody');

    for (const vowelDef of VOWEL_DEFS) {
      const tr = document.createElement('tr');

      // 段ヘッダーセル（あ・い・う・え・お）
      // Requirements 1.3: 段ヘッダーラベルを表示
      const rowTh = document.createElement('th');
      rowTh.className = 'gojuon-row-header';
      rowTh.scope = 'row';
      rowTh.textContent = vowelDef.label;
      tr.appendChild(rowTh);

      // 各行（rowIdx 0〜9）のセルを生成
      for (const rowDef of ROW_DEFS) {
        const td = document.createElement('td');
        td.className = 'hiragana-cell';

        const entry = entryMap.get(`${rowDef.rowIdx},${vowelDef.vowelIdx}`);

        if (entry) {
          // 文字カードボタン（Requirements 1.1, 1.4, 1.5, 1.6, 1.7）
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'hiragana-card';
          btn.textContent = entry.char;
          btn.setAttribute('aria-label', entry.char);

          btn.addEventListener('click', () => {
            _onCardClick(btn, entry.char);
          });

          td.appendChild(btn);
        } else {
          // 空セル（や行のい段・え段、わ行のい〜え段など）
          td.classList.add('hiragana-cell--empty');
          td.setAttribute('aria-hidden', 'true');
        }

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    // ── 「ん」行: わ行・ん 列の最終行に単独配置 ──
    // ん は vowelIdx=null の特殊エントリ。お段の行の後に追加行として配置する。
    if (nnEntry) {
      const nnRow = document.createElement('tr');
      nnRow.className = 'gojuon-row--nn';

      // 段ヘッダー（空）
      const nnRowTh = document.createElement('th');
      nnRowTh.className = 'gojuon-row-header gojuon-row-header--empty';
      nnRowTh.setAttribute('aria-hidden', 'true');
      nnRow.appendChild(nnRowTh);

      // rowIdx 0〜8 は空セル
      for (let i = 0; i < 9; i++) {
        const td = document.createElement('td');
        td.className = 'hiragana-cell hiragana-cell--empty';
        td.setAttribute('aria-hidden', 'true');
        nnRow.appendChild(td);
      }

      // rowIdx=9 のセルに「ん」ボタンを配置
      const nnTd = document.createElement('td');
      nnTd.className = 'hiragana-cell';

      const nnBtn = document.createElement('button');
      nnBtn.type = 'button';
      nnBtn.className = 'hiragana-card';
      nnBtn.textContent = nnEntry.char;
      nnBtn.setAttribute('aria-label', nnEntry.char);

      nnBtn.addEventListener('click', () => {
        _onCardClick(nnBtn, nnEntry.char);
      });

      nnTd.appendChild(nnBtn);
      nnRow.appendChild(nnTd);

      tbody.appendChild(nnRow);
    }

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // 公開インターフェース
  return {
    render,
    /** テスト・デバッグ用: カードクリックハンドラを直接呼び出す */
    _onCardClick,
  };
})();
