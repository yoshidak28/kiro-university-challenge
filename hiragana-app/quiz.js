/**
 * quiz.js — クイズビュー・出題ロジック・スコア管理
 *
 * HIRAGANA_DATA および ALL_CHARS は hiragana.js でグローバル定義されているため、
 * このファイルから直接参照できます。
 *
 * スコープ分離のため IIFE は使用せず、グローバル定数として定義します
 * （ES6 モジュール構文は file:// の CORS 制約を避けるため不使用）。
 */

/* =========================================================
 * 型定義
 * ========================================================= */

/**
 * 難易度設定オブジェクト。
 *
 * @typedef {Object} DifficultyConfig
 * @property {'easy'|'normal'|'hard'} id          - 内部識別子
 * @property {string}                 label        - 表示名 (例: 'かんたん')
 * @property {string}                 description  - 保護者向け説明文 (問題数・範囲)
 * @property {string[]}               charPool     - 出題対象文字の配列
 * @property {number}                 questionCount - 出題数
 */

/**
 * クイズセッション。1回のクイズ全体の状態を保持します。
 *
 * @typedef {Object} QuizSession
 * @property {'easy'|'normal'|'hard'} difficulty   - 選択された難易度
 * @property {string[]}               selectedChars - ランダムに選ばれた出題文字（重複なし）
 * @property {Question[]}             questions      - 生成済み問題配列
 * @property {number}                 currentIndex   - 現在の問題インデックス (0-based)
 * @property {number}                 score          - 現時点の正解数
 */

/**
 * 1問の問題オブジェクト。
 *
 * @typedef {Object} Question
 * @property {string}   correctChar - 正解のひらがな
 * @property {string[]} choices     - 4択の文字配列（順序はランダム）
 */

/* =========================================================
 * DIFFICULTY_CONFIG
 * ========================================================= */

/**
 * 難易度ごとの設定定数。
 *
 * - easy   : あ行〜な行 (rowIdx 0〜4) の 25 文字、10 問
 * - normal : 全 46 文字、15 問
 * - hard   : 全 46 文字、20 問
 *
 * @type {Object.<'easy'|'normal'|'hard', DifficultyConfig>}
 */
const DIFFICULTY_CONFIG = {
  easy: {
    id: 'easy',
    label: 'かんたん',
    description: 'あ行〜な行・10もん',
    // あ行(0)・か行(1)・さ行(2)・た行(3)・な行(4) の 25 文字
    charPool: HIRAGANA_DATA
      .filter(function (e) { return e.rowIdx >= 0 && e.rowIdx <= 4; })
      .map(function (e) { return e.char; }),
    questionCount: 10,
  },
  normal: {
    id: 'normal',
    label: 'ふつう',
    description: 'ぜんぶ・15もん',
    charPool: ALL_CHARS,
    questionCount: 15,
  },
  hard: {
    id: 'hard',
    label: 'むずかしい',
    description: 'ぜんぶ・20もん',
    charPool: ALL_CHARS,
    questionCount: 20,
  },
};

/* =========================================================
 * QuizLogic — 純粋関数モジュール
 * ========================================================= */

/**
 * QuizLogic は副作用なしの純粋関数を提供するモジュールオブジェクトです。
 * テスト容易性を確保するため DOM 操作・グローバル状態変更を含みません。
 *
 * @namespace QuizLogic
 */
const QuizLogic = {
  /**
   * 指定された難易度の設定を返します。
   *
   * @param {'easy'|'normal'|'hard'} difficulty - 難易度識別子
   * @returns {DifficultyConfig} 対応する難易度設定オブジェクト
   * @throws {Error} 不正な difficulty 値が渡された場合
   *
   * @example
   * const config = QuizLogic.getDifficultyConfig('easy');
   * // => { id: 'easy', label: 'かんたん', charPool: [...25文字], questionCount: 10, ... }
   */
  getDifficultyConfig: function (difficulty) {
    var config = DIFFICULTY_CONFIG[difficulty];
    if (!config) {
      throw new Error(
        'getDifficultyConfig: 不正な難易度 "' + difficulty + '" が指定されました。' +
        '"easy", "normal", "hard" のいずれかを指定してください。'
      );
    }
    return config;
  },

  /**
   * 指定された難易度で新しい QuizSession を作成します。
   *
   * Fisher-Yates シャッフルで charPool から questionCount 文字を重複なしで選択します。
   *
   * @param {'easy'|'normal'|'hard'} difficulty - 難易度識別子
   * @param {function(): number} [rng=Math.random] - 乱数生成関数（テスト用に注入可能）
   * @returns {QuizSession} 新しいクイズセッションオブジェクト
   * @throws {Error} 不正な difficulty 値が渡された場合
   *
   * @example
   * const session = QuizLogic.createSession('easy');
   * // => { difficulty: 'easy', selectedChars: [...10文字], questions: [], currentIndex: 0, score: 0 }
   */
  createSession: function (difficulty, rng) {
    var randomFn = typeof rng === 'function' ? rng : Math.random;
    var config = QuizLogic.getDifficultyConfig(difficulty);

    // charPool のコピーを作成して元配列を変更しない
    var pool = config.charPool.slice();
    var count = config.questionCount;

    // Fisher-Yates シャッフルで先頭 count 文字を選択
    for (var i = 0; i < count; i++) {
      // i 以降のランダムなインデックスを選ぶ
      var j = i + Math.floor(randomFn() * (pool.length - i));
      // swap
      var tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    var selectedChars = pool.slice(0, count);

    /** @type {QuizSession} */
    return {
      difficulty: difficulty,
      selectedChars: selectedChars,
      questions: [],
      currentIndex: 0,
      score: 0,
    };
  },
};

/* =========================================================
 * QuizLogic.generateQuestion
 * ========================================================= */

/**
 * 正解文字と全文字リストを受け取り、正解＋3ディストラクターからなる
 * ランダム順の4択 `Question` を生成します。
 *
 * @param {string}   correctChar - 正解のひらがな（`allChars` に含まれている必要があります）
 * @param {string[]} allChars    - ディストラクター候補となる全文字の配列（全46文字相当）
 * @param {function(): number} [rng=Math.random] - 疑似乱数生成関数（テスト差し替え用）
 * @returns {Question} 生成された問題オブジェクト
 * @throws {Error} 100回の試行内にユニークな4択が生成できなかった場合
 *
 * @example
 * const q = QuizLogic.generateQuestion('あ', ALL_CHARS);
 * // q.choices.length === 4
 * // q.choices.includes('あ') === true
 * // new Set(q.choices).size === 4
 */
QuizLogic.generateQuestion = function (correctChar, allChars, rng) {
  var random = (typeof rng === 'function') ? rng : Math.random;
  var MAX_ATTEMPTS = 100;

  // correctChar を除いたディストラクター候補
  var pool = allChars.filter(function (c) { return c !== correctChar; });

  // 3ディストラクターをランダム選択（重複なし）
  var distractors = [];
  var attempts = 0;

  while (distractors.length < 3) {
    if (attempts >= MAX_ATTEMPTS) {
      throw new Error(
        'generateQuestion: ' + MAX_ATTEMPTS + '回の試行内にユニークな4択を生成できませんでした。' +
        'allChars のサイズが不足している可能性があります（現在: ' + allChars.length + '文字）。'
      );
    }
    attempts++;

    var idx = Math.floor(random() * pool.length);
    var candidate = pool[idx];

    if (distractors.indexOf(candidate) === -1) {
      distractors.push(candidate);
    }
  }

  // 正解＋3択を結合してFisher-Yatesシャッフル
  var choices = [correctChar].concat(distractors);

  for (var i = choices.length - 1; i > 0; i--) {
    var j = Math.floor(random() * (i + 1));
    var tmp = choices[i];
    choices[i] = choices[j];
    choices[j] = tmp;
  }

  return {
    correctChar: correctChar,
    choices: choices,
  };
};

/* =========================================================
 * QuizLogic.evaluateAnswer
 * ========================================================= */

/**
 * 回答を評価し、AnswerResult を返します。
 *
 * @param {Question} question       - 現在の問題オブジェクト
 * @param {string}   selectedChar   - ユーザーが選択した文字
 * @returns {AnswerResult}
 *
 * @example
 * const q = { correctChar: 'あ', choices: ['あ', 'い', 'う', 'え'] };
 * QuizLogic.evaluateAnswer(q, 'あ');
 * // => { isCorrect: true, correctChar: 'あ', selectedChar: 'あ' }
 *
 * QuizLogic.evaluateAnswer(q, 'い');
 * // => { isCorrect: false, correctChar: 'あ', selectedChar: 'い' }
 */
QuizLogic.evaluateAnswer = function (question, selectedChar) {
  return {
    isCorrect: question.correctChar === selectedChar,
    correctChar: question.correctChar,
    selectedChar: selectedChar,
  };
};

/* =========================================================
 * QuizLogic.calcResultTier
 * ========================================================= */

/**
 * 正解率からスコア評価ティアを計算します。
 *
 * - 正解率 100%        → 'perfect'
 * - 正解率 70% 以上    → 'good'
 * - 正解率 70% 未満    → 'try-again'
 *
 * @param {number} correct - 正解数（0 ≤ correct ≤ total）
 * @param {number} total   - 総問題数（total > 0）
 * @returns {'perfect'|'good'|'try-again'}
 * @throws {Error} total が 0 以下の場合
 *
 * @example
 * QuizLogic.calcResultTier(10, 10); // => 'perfect'
 * QuizLogic.calcResultTier(7, 10);  // => 'good'
 * QuizLogic.calcResultTier(6, 10);  // => 'try-again'
 */
QuizLogic.calcResultTier = function (correct, total) {
  if (total <= 0) {
    throw new Error(
      'calcResultTier: total は 1 以上の正の整数を指定してください。'
    );
  }
  var rate = correct / total;
  if (rate === 1.0) {
    return 'perfect';
  }
  if (rate >= 0.7) {
    return 'good';
  }
  return 'try-again';
};

/* =========================================================
 * AppState — グローバルアプリ状態
 * ========================================================= */

/**
 * アプリ全体の状態を管理するグローバル定数。
 *
 * @type {Object}
 * @property {'gojuon'|'quiz'}                            activeTab          - 現在アクティブなタブ
 * @property {Object}                                     quiz               - クイズ状態
 * @property {'difficulty'|'playing'|'result'}            quiz.phase         - クイズの現在フェーズ
 * @property {'easy'|'normal'|'hard'|null}                quiz.difficulty    - 選択された難易度
 * @property {QuizSession|null}                           quiz.session       - 現在のクイズセッション
 * @property {boolean}                                    quiz.interactionLocked - 連打防止フラグ
 */
const AppState = {
  activeTab: 'gojuon',
  quiz: {
    phase: 'difficulty',
    difficulty: null,
    session: null,
    interactionLocked: false,
  },
};

/* =========================================================
 * QuizView — クイズ UI モジュール
 * ========================================================= */

/**
 * QuizView は DOM 操作・イベントバインディングを担当するモジュールオブジェクトです。
 *
 * @namespace QuizView
 */
const QuizView = {

  /**
   * 難易度選択画面を表示します。
   *
   * - `#difficulty-screen` を表示し、`#quiz-playing` と `#quiz-result` を非表示にする
   * - `AppState.quiz.phase` を `'difficulty'` に設定する
   * - 3つの難易度ボタン（ラベル＋説明文）を生成・挿入する
   * - ボタンクリック時に `QuizLogic.createSession()` を呼び出してセッションを開始する
   *
   * _Requirements: 4.1, 4.5, 4.6_
   *
   * @returns {void}
   */
  showDifficultyScreen: function () {
    // ── フェーズ状態を更新 ──
    AppState.quiz.phase = 'difficulty';

    // ── 各クイズフェーズの表示切り替え ──
    var difficultyScreen = document.getElementById('difficulty-screen');
    var quizPlaying      = document.getElementById('quiz-playing');
    var quizResult       = document.getElementById('quiz-result');

    difficultyScreen.classList.remove('quiz-phase--hidden');
    quizPlaying.classList.add('quiz-phase--hidden');
    quizResult.classList.add('quiz-phase--hidden');

    // ── 既存コンテンツをクリアして再生成 ──
    difficultyScreen.innerHTML = '';

    // タイトル
    var title = document.createElement('h2');
    title.className = 'difficulty-title';
    title.textContent = 'むずかしさを えらんでね';
    difficultyScreen.appendChild(title);

    // 難易度ボタンコンテナ
    var btnContainer = document.createElement('div');
    btnContainer.className = 'difficulty-buttons';
    difficultyScreen.appendChild(btnContainer);

    // 難易度ごとにボタンを生成（Requirements 4.1, 4.5）
    var difficulties = ['easy', 'normal', 'hard'];

    difficulties.forEach(function (diffId) {
      var config = QuizLogic.getDifficultyConfig(diffId);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'difficulty-btn';
      btn.setAttribute('data-difficulty', diffId);
      btn.setAttribute('aria-label', config.label + ' - ' + config.description);

      // ラベル（かんたん / ふつう / むずかしい）
      var labelEl = document.createElement('span');
      labelEl.className = 'difficulty-btn__label';
      labelEl.textContent = config.label;

      // 説明文（問題数・出題範囲）
      var descEl = document.createElement('span');
      descEl.className = 'difficulty-btn__desc';
      descEl.textContent = config.description;

      btn.appendChild(labelEl);
      btn.appendChild(descEl);

      // クリック時にセッションを開始し最初の問題をレンダリング（Requirements 4.6）
      btn.addEventListener('click', function () {
        AppState.quiz.difficulty = diffId;
        AppState.quiz.session    = QuizLogic.createSession(diffId);
        AppState.quiz.phase      = 'playing';

        // 最初の問題を生成して renderQuestion で開始（タスク 8.2 との整合）
        var firstQuestion = QuizLogic.generateQuestion(
          AppState.quiz.session.selectedChars[0],
          ALL_CHARS
        );
        AppState.quiz.session.questions.push(firstQuestion);
        QuizView.renderQuestion(
          firstQuestion,
          0,
          AppState.quiz.session.selectedChars.length,
          0
        );
      });

      btnContainer.appendChild(btn);
    });
  },

  /**
   * 1問分の問題 UI をレンダリングします。
   *
   * - `#quiz-playing` を表示、`#difficulty-screen` と `#quiz-result` を非表示
   * - 問題番号・スコア・Progress_Bar を更新
   * - 4つの Choice_Button を生成し、クリックで evaluateAnswer → showFeedback を呼び出す
   * - 連打防止フラグ（interactionLocked）をリセットする
   * - 短いディレイ後に SpeechSynthesizer.speak(correctChar) を呼び出す
   *
   * _Requirements: 5.2, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5, 9.3_
   *
   * @param {Question} question - 表示する問題オブジェクト
   * @param {number}   index    - 現在の問題インデックス (0-based)
   * @param {number}   total    - 総問題数
   * @param {number}   score    - 現在の正解数
   * @returns {void}
   */
  renderQuestion: function (question, index, total, score) {
    // ── 連打防止フラグをリセット（Requirements 9.3）──
    AppState.quiz.interactionLocked = false;

    // ── フェーズ表示切り替え ──
    var difficultyScreen = document.getElementById('difficulty-screen');
    var quizPlaying      = document.getElementById('quiz-playing');
    var quizResult       = document.getElementById('quiz-result');

    difficultyScreen.classList.add('quiz-phase--hidden');
    quizPlaying.classList.remove('quiz-phase--hidden');
    quizResult.classList.add('quiz-phase--hidden');

    // ── 問題番号を更新（Requirements 7.1） ──
    var questionCounter = document.getElementById('question-counter');
    questionCounter.textContent = (index + 1) + ' / ' + total;

    // ── スコア表示を更新（Requirements 7.2） ──
    // score = 正解数、index = 回答済み問題数（現問題は未回答なので index を使う）
    var scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = '⭐ ' + score + ' / ' + index;

    // ── Progress_Bar を更新（Requirements 7.3, 7.4, 7.5） ──
    var progressBarFill = document.getElementById('progress-bar-fill');
    var progressBar     = document.getElementById('progress-bar');
    var progressPercent = total > 0 ? (index / total * 100) : 0;
    progressBarFill.style.width = progressPercent + '%';
    progressBar.setAttribute('aria-valuenow', String(index));
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', String(total));

    // ── 問題エリアをクリア（Requirements 5.2） ──
    var questionArea = document.getElementById('question-area');
    var choicesArea  = document.getElementById('choices-area');
    var feedbackArea = document.getElementById('feedback-area');

    questionArea.innerHTML = '';
    choicesArea.innerHTML  = '';
    feedbackArea.innerHTML = '';

    // ── 問題テキスト表示（音声で出題するため視覚的補助として文字を隠す） ──
    // 未就学児向けなので "?" を表示し音声で正解文字を読み上げる
    var questionText = document.createElement('p');
    questionText.className = 'question-text';
    questionText.textContent = 'どの もじかな？';
    questionArea.appendChild(questionText);

    // カウントダウン／音声ヒント表示用の要素
    var questionHint = document.createElement('p');
    questionHint.className = 'question-hint';
    questionHint.setAttribute('aria-live', 'assertive');
    questionHint.setAttribute('aria-label', 'よういはいいかな');
    questionHint.textContent = 'よーい…';
    questionArea.appendChild(questionHint);

    // ── 4つの Choice_Button を生成（Requirements 5.2） ──
    question.choices.forEach(function (charValue) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.setAttribute('data-char', charValue);
      btn.setAttribute('aria-label', charValue);
      btn.textContent = charValue;

      // カウントダウン中は無効化しておく（カウント後に有効化）
      btn.disabled = true;

      // クリックハンドラ（連打防止を含む）（Requirements 9.1, 9.2）
      btn.addEventListener('click', function () {
        // 連打防止: ロック中は無視（Requirements 9.2）
        if (AppState.quiz.interactionLocked) return;
        // 最初のクリックで即ロック（Requirements 9.1）
        AppState.quiz.interactionLocked = true;

        var result = QuizLogic.evaluateAnswer(question, charValue);
        QuizView.showFeedback(result);
      });

      choicesArea.appendChild(btn);
    });

    // ── 「3・2・1」のカウントダウン後に音声読み上げ（Requirements 5.6） ──
    // 子どもがいつ音が出るか分かるよう、問題表示後にカウントダウンを行う。
    // カウントダウンが終わるまでは選択肢を押せない（interactionLocked = true）。
    AppState.quiz.interactionLocked = true;
    QuizView.startCountdown(questionHint, function () {
      // カウント終了: 選択肢を有効化し、正解文字を読み上げる
      AppState.quiz.interactionLocked = false;
      var buttons = choicesArea.querySelectorAll('.choice-btn');
      buttons.forEach(function (b) { b.disabled = false; });

      questionHint.textContent = '🔊';
      questionHint.setAttribute('aria-label', 'おとを きいてね');

      SpeechSynthesizer.speak(question.correctChar);
    });
  },

  /**
   * 「3・2・1」のカウントダウンを表示・読み上げし、終了後に onDone を呼び出します。
   *
   * - 1秒ごとに 3 → 2 → 1 を表示し、各数字を音声で読み上げる
   * - カウント終了後に onDone コールバックを実行する
   *
   * _Requirements: 5.6_
   *
   * @param {HTMLElement} displayEl - カウント数字を表示する要素
   * @param {function(): void} onDone - カウント終了後に呼ばれるコールバック
   * @returns {void}
   */
  startCountdown: function (displayEl, onDone) {
    var counts = [3, 2, 1];
    var i = 0;

    function tick() {
      if (i < counts.length) {
        var n = counts[i];
        displayEl.textContent = String(n);
        displayEl.setAttribute('aria-label', String(n));
        // カウント数字をアニメーション再トリガー
        displayEl.classList.remove('is-counting');
        // reflow を強制してアニメーションを確実に再生
        void displayEl.offsetWidth;
        displayEl.classList.add('is-counting');
        SpeechSynthesizer.speak(String(n));
        i++;
        setTimeout(tick, 1000);
      } else {
        displayEl.classList.remove('is-counting');
        onDone();
      }
    }

    tick();
  },

  /**
   * 回答後のフィードバック UI を表示します。
   *
   * - 全 Choice_Button を disabled に設定する
   * - 正解ボタンに choice-btn--correct クラスを付与する
   * - 不正解の場合、選択ボタンに choice-btn--wrong クラスを付与する
   * - feedback-area にメッセージを設定する
   * - SpeechSynthesizer でフィードバックを読み上げる
   * - 一定時間後に次問または結果画面へ遷移する
   *
   * _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
   *
   * @param {AnswerResult} result - 評価結果オブジェクト
   * @returns {void}
   */
  showFeedback: function (result) {
    var choicesArea  = document.getElementById('choices-area');
    var feedbackArea = document.getElementById('feedback-area');

    // ── 全 Choice_Button を disabled に設定（Requirements 6.5） ──
    var allButtons = choicesArea.querySelectorAll('.choice-btn');
    allButtons.forEach(function (btn) {
      btn.disabled = true;
    });

    // ── 正解ボタンに correct スタイルを付与（Requirements 6.3） ──
    allButtons.forEach(function (btn) {
      if (btn.getAttribute('data-char') === result.correctChar) {
        btn.classList.add('choice-btn--correct');
      }
    });

    // ── 不正解時: 選択ボタンに wrong スタイルを付与（Requirements 6.4） ──
    if (!result.isCorrect) {
      allButtons.forEach(function (btn) {
        if (btn.getAttribute('data-char') === result.selectedChar) {
          btn.classList.add('choice-btn--wrong');
        }
      });
    }

    // ── フィードバックメッセージの設定と音声フィードバック ──
    var feedbackMessage;
    var speechMessage;

    if (result.isCorrect) {
      // 正解フィードバック（Requirements 6.1, 6.6）
      feedbackMessage = '⭐ せいかい！';
      speechMessage   = 'せいかい！すごい！';
    } else {
      // 不正解フィードバック（Requirements 6.2, 6.7）
      // 「ざんねん」は使わない
      var phrases = [
        'もう いちど！ こたえは「' + result.correctChar + '」だよ！',
        'おしい！ こたえは「' + result.correctChar + '」だよ！',
      ];
      // ランダムに選ぶ（子ども向けに変化を持たせる）
      feedbackMessage = phrases[Math.floor(Math.random() * phrases.length)];
      speechMessage   = 'おしい！ こたえわ ' + result.correctChar + ' だよ！';
    }

    feedbackArea.textContent = feedbackMessage;

    // ── スコア・インデックスを先に確定（遷移内容は発話前に決める） ──
    var session = AppState.quiz.session;
    session.score += result.isCorrect ? 1 : 0;
    session.currentIndex++;

    // 次画面へ遷移する処理（1回だけ実行する）
    var advanced = false;
    function advance() {
      if (advanced) return;
      advanced = true;

      if (session.currentIndex < session.selectedChars.length) {
        // 次の問題を生成してレンダリング
        var nextQuestion = QuizLogic.generateQuestion(
          session.selectedChars[session.currentIndex],
          ALL_CHARS
        );
        session.questions.push(nextQuestion);
        QuizView.renderQuestion(
          nextQuestion,
          session.currentIndex,
          session.selectedChars.length,
          session.score
        );
      } else {
        // 全問終了 → 結果画面を表示
        QuizView.showResultScreen(session);
      }
    }

    // ── フィードバックの読み上げ完了を待ってから遷移（Requirements 6.6, 6.7, 6.8） ──
    // 固定ディレイだと、クラウド系ボイスの発話開始遅延により
    // 読み上げ途中で次問カウントダウンの cancel() に打ち切られてしまう。
    // そこで onDone（発話完了）で遷移しつつ、以下のガードを併用する:
    //   - 最小表示時間 MIN_MS: 発話が極端に短くても、子どもがフィードバックを
    //     認識できるよう最低限ここまでは次画面に進めない
    //   - 最大待ち時間 MAX_MS: onend が発火しないブラウザでも固まらないフェイルセーフ
    var MIN_MS = 1200;
    var MAX_MS = 6000;

    var speechDone  = false;
    var minElapsed  = false;

    // 最小表示時間が経過し、かつ発話が完了していたら遷移
    function tryAdvance() {
      if (minElapsed && speechDone) advance();
    }

    setTimeout(function () { minElapsed = true; tryAdvance(); }, MIN_MS);

    // フェイルセーフ: 最大待ち時間を超えたら強制的に遷移
    setTimeout(function () { advance(); }, MAX_MS);

    // 音声フィードバック。完了（または非対応・エラー）で遷移を試みる。
    SpeechSynthesizer.speak(speechMessage, function () {
      speechDone = true;
      tryAdvance();
    });
  },

  /**
   * クイズ結果画面を表示します。
   *
   * - `#quiz-result` を表示し、`#quiz-playing` を非表示にする
   * - 最終スコア比（正解数/総問題数）を表示する
   * - calcResultTier に基づくメッセージ・星アイコンを表示する
   * - 短いディレイ後に結果メッセージを SpeechSynthesizer で読み上げる
   * - リトライボタンで QuizView.showDifficultyScreen() に戻る
   *
   * _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
   *
   * @param {QuizSession} session - 完了したクイズセッション
   * @returns {void}
   */
  showResultScreen: function (session) {
    AppState.quiz.phase = 'result';

    // ── フェーズ表示切り替え（Requirements 8.1） ──
    var quizPlaying = document.getElementById('quiz-playing');
    var quizResult  = document.getElementById('quiz-result');

    quizPlaying.classList.add('quiz-phase--hidden');
    quizResult.classList.remove('quiz-phase--hidden');

    // ── 結果コンテンツをクリアして生成 ──
    quizResult.innerHTML = '';

    var total   = session.selectedChars.length;
    var correct = session.score;
    var tier    = QuizLogic.calcResultTier(correct, total);

    // 評価ティアに応じたメッセージ・星を決定（Requirements 8.3, 8.4, 8.5）
    var stars;
    var message;
    var speechText;

    if (tier === 'perfect') {
      stars      = '⭐⭐⭐';
      message    = '🎉 まんてん！すごい！！';
      speechText = 'まんてん！すごい！！';
    } else if (tier === 'good') {
      stars      = '⭐⭐';
      message    = '👏 よくできました！';
      speechText = 'よくできました！';
    } else {
      stars      = '⭐';
      message    = '😊 またちょうせんしてみよう！';
      speechText = 'またちょうせんしてみよう！';
    }

    // ── 星表示 ──
    var starsEl = document.createElement('p');
    starsEl.className = 'result-stars';
    starsEl.setAttribute('aria-label', stars.length + 'つぼし');
    starsEl.textContent = stars;
    quizResult.appendChild(starsEl);

    // ── スコア表示（Requirements 8.2） ──
    var scoreEl = document.createElement('p');
    scoreEl.className = 'result-score';
    scoreEl.textContent = correct + ' / ' + total;
    quizResult.appendChild(scoreEl);

    // ── 評価メッセージ ──
    var messageEl = document.createElement('p');
    messageEl.className = 'result-message';
    messageEl.textContent = message;
    quizResult.appendChild(messageEl);

    // ── リトライボタン（Requirements 8.7） ──
    var retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'retry-btn';
    retryBtn.textContent = 'もういちど やる！';
    retryBtn.setAttribute('aria-label', 'もういちどやる');
    retryBtn.addEventListener('click', function () {
      QuizView.showDifficultyScreen();
    });
    quizResult.appendChild(retryBtn);

    // ── 短いディレイ後に結果メッセージを音声読み上げ（Requirements 8.6） ──
    setTimeout(function () {
      SpeechSynthesizer.speak(speechText);
    }, 600);
  },

  /**
   * 進捗バーを更新します。
   *
   * @param {number} answered - 回答済み問題数
   * @param {number} total    - 総問題数
   * @returns {void}
   */
  updateProgressBar: function (answered, total) {
    var progressBarFill = document.getElementById('progress-bar-fill');
    var progressBar     = document.getElementById('progress-bar');

    if (!progressBarFill || !progressBar) return;

    var percent = total > 0 ? (answered / total * 100) : 0;
    progressBarFill.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', String(answered));
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', String(total));
  },
};
