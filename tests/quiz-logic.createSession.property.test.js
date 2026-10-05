/**
 * Property 6: クイズセッションで出題文字に重複がない
 *
 * design.md:
 *   For any 難易度設定を用いて QuizLogic.createSession() を実行した場合、
 *   生成された QuizSession.selectedChars の配列には
 *   いかなる重複も存在してはならない。
 *
 * Validates: Requirements 5.1
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loadAppGlobals } from './loadAppGlobals.js';

const { QuizLogic, DIFFICULTY_CONFIG } = loadAppGlobals();

describe('QuizLogic.createSession — Property 6: 出題文字の重複なし', () => {
  it('selectedChars に重複が存在しない（全難易度・多数の乱数シードで検証）', () => {
    // Feature: hiragana-learning-app, Property 6: クイズセッションで出題文字に重複がない
    fc.assert(
      fc.property(
        fc.constantFrom('easy', 'normal', 'hard'),
        // 乱数生成関数を差し替えて多様なシャッフル結果を網羅する。
        // 0 <= value < 1 の列を生成し、呼び出しごとに順に消費する。
        fc.array(fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }), {
          minLength: 64,
          maxLength: 256,
        }),
        (difficulty, randomValues) => {
          let i = 0;
          // rng は Fisher-Yates が必要とする回数だけ呼ばれる。
          // 値を使い切った場合は循環させて不足を防ぐ。
          const rng = function () {
            const v = randomValues[i % randomValues.length];
            i++;
            return v;
          };

          const session = QuizLogic.createSession(difficulty, rng);

          // 重複がない <=> Set のサイズが配列長と一致する
          const unique = new Set(session.selectedChars);
          return unique.size === session.selectedChars.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('selectedChars の長さが難易度ごとの questionCount と一致する', () => {
    ['easy', 'normal', 'hard'].forEach(function (difficulty) {
      const session = QuizLogic.createSession(difficulty);
      expect(session.selectedChars.length).toBe(
        DIFFICULTY_CONFIG[difficulty].questionCount
      );
      // デフォルト rng でも重複なしであることを確認
      expect(new Set(session.selectedChars).size).toBe(
        session.selectedChars.length
      );
    });
  });
});
