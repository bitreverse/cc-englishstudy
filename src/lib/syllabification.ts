import type { SyllabificationResult } from '@/types';

/**
 * AI로 분석된 음절 결과를 SyllabificationResult 형식으로 변환
 *
 * AI API 호출 시 단어를 음절로 분리한 결과를 표준 형식으로 변환합니다.
 * Phase 1부터 AI 전용 음절 분리 시스템을 사용합니다.
 *
 * @param word - 원본 단어
 * @param aiSyllables - AI가 분석한 음절 배열
 * @param partOfSpeech - 품사 (선택적, heteronyms 처리용)
 * @returns 음절 분리 결과
 *
 * @example
 * ```typescript
 * const result = createSyllabificationFromAI('computer', ['com', 'pu', 'ter']);
 * // {
 * //   word: 'computer',
 * //   syllables: ['com', 'pu', 'ter'],
 * //   formatted: 'com·pu·ter',
 * //   count: 3,
 * //   source: 'ai'
 * // }
 * ```
 */
export function createSyllabificationFromAI(
  word: string,
  aiSyllables: string[]
): SyllabificationResult {
  return {
    word,
    syllables: aiSyllables,
    formatted: aiSyllables.join('·'),
    count: aiSyllables.length,
    source: 'ai',
  };
}
