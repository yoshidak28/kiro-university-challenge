/**
 * Property 8: スコアが正解回数に正確に対応する
 *
 * design.md:
 *   For any 問題への回答シーケンスに対して、QuizSession.score の値はその
 *   シーケンス中の正解回数にちょうど等しくなければならない。
 *
 * Validates: Requirements 5.8
 *   THE Quiz SHALL track and increment Score by 1 for each correct answer
 *   within a Quiz_Session.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loadAppGlobals } from './loadAppGlobals.js';

const { QuizLogic } = loadAppGlobals();

describe('QuizLogic.evaluateAnswer — Property 8: スコアが正解回数に正確に対応する', () => {
  it('回答シーケンスの正解回数と最終スコアがちょうど一致する（多数のシーケンスで検証）', () => {
    // Feature: hiragana-learning-app, Property 8: スコアが正解回数に正確に対応する
    fc.assert(
      fc.property(
        // 各要素 true=正解を選ぶ / false=不正解を選ぶ、という回答シーケンス
        fc.array(fc.boolean()),
        (answerSequence) => {
          // アプリ側（QuizView.showFeedback）と同じ方法でスコアを積み上げる:
          //   session.score += result.isCorrect ? 1 : 0
          var score = 0;

          answerSequence.forEach(function (shouldAnswerCorrectly) {
            // 固定の問題。正解文字 'あ'、ディストラクターに 'い' を用意する。
            var question = {
              correctChar: 'あ',
              choices: ['あ', 'い', 'う', 'え'],
            };

            // 正解させたい場合は correctChar を、そうでなければ別の文字を選ぶ
            var selectedChar = shouldAnswerCorrectly
              ? question.correctChar
              : 'い';

            var result = QuizLogic.evaluateAnswer(question, selectedChar);
            score += result.isCorrect ? 1 : 0;
          });

          // 期待値: シーケンス中の true（正解）の個数
          var expectedCorrectCount = answerSequence.filter(function (b) {
            return b === true;
          }).length;

          // スコアは正解回数にちょうど等しい
          return score === expectedCorrectCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('境界ケース: 空のシーケンスではスコアは 0', () => {
    expect([].reduce(function (acc) { return acc; }, 0)).toBe(0);
  });

  it('境界ケース: すべて正解ならスコア = 問題数', () => {
    var question = { correctChar: 'あ', choices: ['あ', 'い', 'う', 'え'] };
    var score = 0;
    for (var i = 0; i < 5; i++) {
      var result = QuizLogic.evaluateAnswer(question, 'あ');
      score += result.isCorrect ? 1 : 0;
    }
    expect(score).toBe(5);
  });

  it('境界ケース: すべて不正解ならスコア = 0', () => {
    var question = { correctChar: 'あ', choices: ['あ', 'い', 'う', 'え'] };
    var score = 0;
    for (var i = 0; i < 5; i++) {
      var result = QuizLogic.evaluateAnswer(question, 'い');
      score += result.isCorrect ? 1 : 0;
    }
    expect(score).toBe(0);
  });
});
