/**
 * loadAppGlobals.js — テスト用ハーネス
 *
 * アプリ本体（hiragana-app/*.js）はグローバル定数として実装されており、
 * ES Module の import/export を持ちません（file:// の CORS 制約回避のため）。
 * そのためテストから直接 import できません。
 *
 * このハーネスはアプリのソースを「無改変のまま」読み込み、Node の vm で
 * 評価して公開グローバル（HIRAGANA_DATA / ALL_CHARS / QuizLogic / DIFFICULTY_CONFIG 等）
 * を取り出します。アプリ側に module.exports を足すことはしません。
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '..', 'hiragana-app');

/**
 * hiragana.js → quiz.js の順で評価し、公開グローバルを返します。
 * （quiz.js は hiragana.js のシンボルに依存するため読み込み順が重要）
 *
 * @returns {{ HIRAGANA_DATA: any[], ALL_CHARS: string[], DIFFICULTY_CONFIG: object, QuizLogic: object }}
 */
export function loadAppGlobals() {
  // Web Speech API 非対応環境を模した最小限の window スタブ。
  // SpeechSynthesizer は 'speechSynthesis' in window が false のとき
  // サイレントにフォールバックするため、音声機能なしで安全に評価できる。
  const sandbox = {
    window: {},
    console: console,
    setTimeout: setTimeout,
    Math: Math,
    Set: Set,
    Map: Map,
    requestAnimationFrame: function () {},
  };

  const context = vm.createContext(sandbox);

  // 各ソースを順に評価する。アプリ側は top-level の `const` で各シンボルを
  // 宣言しているが、top-level の const/let は global オブジェクトのプロパティには
  // ならない。そこで、同一スクリプト内の末尾で明示的に __exports__ へ束ねることで
  // アプリソースを無改変のまま値を取り出す（これはテスト側で付加する epilogue）。
  const EXPORT_NAMES = ['HIRAGANA_DATA', 'ALL_CHARS', 'DIFFICULTY_CONFIG', 'QuizLogic'];

  const sources = ['hiragana.js', 'quiz.js']
    .map((file) => fs.readFileSync(path.join(APP_DIR, file), 'utf8'))
    .join('\n;\n');

  // epilogue: 同一スコープで宣言された const を参照できる位置で束ねる
  const epilogue =
    '\n;globalThis.__appExports__ = { ' +
    EXPORT_NAMES.map((n) => n + ': ' + n).join(', ') +
    ' };\n';

  vm.runInContext(sources + epilogue, context, { filename: 'app-bundle.js' });

  return sandbox.__appExports__;
}
