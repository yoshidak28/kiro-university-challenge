/**
 * Property 7: 生成された問題が構造的に正当である
 *
 * design.md:
 *   For any 正解文字 c と全文字リスト chars を使って
 *   QuizLogic.generateQuestion(c, chars) を呼び出した場合、
 *   生成された Question は以下をすべて満たさなければならない：
 *     - choices の長さがちょうど4である
 *     - choices に c が含まれる
 *     - choices の中に重複がない
 *     - c 以外の3択はすべて c と異なる
 *
 * Validates: Requirements 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loadAppGlobals } from './loadAppGlobals.js';

const { QuizLogic, ALL_CHARS } = loadAppGlobals();

/**
 * seed から well-distributed な 0<=v<1 の列を生成する決定的 PRNG（mulberry32）。
 * Math.random 相当の分布を持つ実際的な乱数源をシードごとに再現するために用いる。
 * （all-zeros のような退化した定数列ではなく、現実的な乱数ストリームを網羅する）
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('QuizLogic.generateQuestion — Property 7: 生成された問題の構造的正当性', () => {
  it('choices.length===4 / c を含む / 重複なし / c 以外はすべて c と異なる（多数の乱数シードで検証）', () => {
    // Feature: hiragana-learning-app, Property 7: 生成された問題が構造的に正当である
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_CHARS),
        // シード整数から現実的な分布を持つ乱数源を生成して多様な
        // 選択・シャッフル結果を網羅する。
        fc.integer({ min: 1, max: 0x7fffffff }),
        (correctChar, seed) => {
          const rng = mulberry32(seed);

          const question = QuizLogic.generateQuestion(correctChar, ALL_CHARS, rng);
          const choices = question.choices;

          // 5.2: choices の長さがちょうど4である
          const hasFourChoices = choices.length === 4;

          // 5.3: choices に正解文字 c が含まれる
          const includesCorrect = choices.indexOf(correctChar) !== -1;

          // 5.4: choices の中に重複がない
          const noDuplicates = new Set(choices).size === choices.length;

          // 5.5: c 以外の3択はすべて c と異なる
          const distractors = choices.filter(function (ch) {
            return ch !== correctChar;
          });
          const distractorsDifferFromCorrect =
            distractors.length === 3 &&
            distractors.every(function (ch) {
              return ch !== correctChar;
            });

          return (
            hasFourChoices &&
            includesCorrect &&
            noDuplicates &&
            distractorsDifferFromCorrect
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  it('デフォルト rng でも代表的な正解文字で構造的に正当な4択を生成する', () => {
    ['あ', 'ん', 'は', 'を'].forEach(function (correctChar) {
      const question = QuizLogic.generateQuestion(correctChar, ALL_CHARS);
      const choices = question.choices;

      expect(choices.length).toBe(4);
      expect(choices).toContain(correctChar);
      expect(new Set(choices).size).toBe(4);

      const distractors = choices.filter(function (ch) {
        return ch !== correctChar;
      });
      expect(distractors.length).toBe(3);
      distractors.forEach(function (ch) {
        expect(ch).not.toBe(correctChar);
      });
    });
  });
});
