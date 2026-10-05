/**
 * Property 13: スコア評価関数が正しいティアを返す
 *
 * design.md:
 *   For any 正解数 c と総問題数 t（0 <= c <= t、t > 0）において、
 *   QuizLogic.calcResultTier(c, t) は正解率 rate = c / t に応じて
 *   以下のティアを返さなければならない：
 *     - rate === 1.0        のとき 'perfect'
 *     - 0.7 <= rate < 1.0   のとき 'good'
 *     - rate < 0.7          のとき 'try-again'
 *
 * Validates: Requirements 8.3, 8.4, 8.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loadAppGlobals } from './loadAppGlobals.js';

const { QuizLogic } = loadAppGlobals();

/**
 * 正解率から期待されるティアを、実装とは独立に計算する参照関数。
 * @param {number} correct
 * @param {number} total
 * @returns {'perfect'|'good'|'try-again'}
 */
function expectedTier(correct, total) {
  const rate = correct / total;
  if (rate === 1.0) return 'perfect';
  if (rate >= 0.7) return 'good';
  return 'try-again';
}

describe('QuizLogic.calcResultTier — Property 13: スコア評価関数が正しいティアを返す', () => {
  it('正解率に応じて perfect / good / try-again を正しく返す（多数の c, t で検証）', () => {
    // Feature: hiragana-learning-app, Property 13: スコア評価関数が正しいティアを返す
    fc.assert(
      fc.property(
        // t > 0 の正の整数
        fc.integer({ min: 1, max: 100 }),
        // 0 <= c <= t を保証するために [0,1] の割合を total にマップする
        fc.double({ min: 0, max: 1, noNaN: true }),
        (total, ratio) => {
          const correct = Math.round(ratio * total); // 0 <= correct <= total
          const tier = QuizLogic.calcResultTier(correct, total);
          return tier === expectedTier(correct, total);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('境界ケース: 100% は perfect', () => {
    expect(QuizLogic.calcResultTier(10, 10)).toBe('perfect');
    expect(QuizLogic.calcResultTier(1, 1)).toBe('perfect');
  });

  it('境界ケース: ちょうど 70% は good', () => {
    expect(QuizLogic.calcResultTier(7, 10)).toBe('good');
  });

  it('境界ケース: 70% 未満（69%）は try-again', () => {
    expect(QuizLogic.calcResultTier(69, 100)).toBe('try-again');
    expect(QuizLogic.calcResultTier(6, 10)).toBe('try-again');
  });

  it('境界ケース: 0% は try-again', () => {
    expect(QuizLogic.calcResultTier(0, 10)).toBe('try-again');
    expect(QuizLogic.calcResultTier(0, 1)).toBe('try-again');
  });
});
