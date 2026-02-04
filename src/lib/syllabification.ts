import type { SyllabificationResult } from '@/types';

/**
 * AI로 분석된 음절 결과를 SyllabificationResult 형식으로 변환
 *
 * AI API 호출 시 단어를 음절로 분리한 결과를 표준 형식으로 변환합니다.
 * Phase 1부터 AI 전용 음절 분리 시스템을 사용합니다.
 *
 * @param word - 원본 단어
 * @param aiSyllables - AI가 분석한 음절 배열 (문자열) 또는 음절 상세 정보 (SyllableInfo)
 * @param partOfSpeech - 품사 (선택적, heteronyms 처리용)
 * @returns 음절 분리 결과
 *
 * @example
 * ```typescript
 * // 문자열 배열로 호출 (IPA 정보 없음)
 * const result1 = createSyllabificationFromAI('computer', ['com', 'pu', 'ter']);
 *
 * // SyllableInfo 배열로 호출 (IPA 정보 포함)
 * const result2 = createSyllabificationFromAI('computer', [
 *   { text: 'com', ipa: 'kəm' },
 *   { text: 'pu', ipa: 'pju' },
 *   { text: 'ter', ipa: 'tər' }
 * ]);
 * ```
 */
export function createSyllabificationFromAI(
  word: string,
  aiSyllables: string[] | import('@/types').SyllableInfo[]
): SyllabificationResult {
  // SyllableInfo 배열인지 확인
  const isSyllableInfoArray = aiSyllables.length > 0 &&
    typeof aiSyllables[0] === 'object' &&
    'text' in aiSyllables[0] &&
    'ipa' in aiSyllables[0];

  let syllables: string[];
  let syllableDetails: import('@/types').SyllableInfo[];

  if (isSyllableInfoArray) {
    // SyllableInfo 배열인 경우
    const syllableInfoArray = aiSyllables as import('@/types').SyllableInfo[];
    syllables = syllableInfoArray.map(s => s.text);
    syllableDetails = syllableInfoArray;
  } else {
    // 문자열 배열인 경우 - IPA 정보를 빈 문자열로 채움
    const syllableStrArray = aiSyllables as string[];
    syllables = syllableStrArray;
    syllableDetails = syllableStrArray.map(text => ({
      text,
      ipa: '', // AI가 IPA 정보를 제공하지 않는 경우 빈 문자열
    }));
  }

  return {
    word,
    syllables,
    formatted: syllables.join('·'),
    count: syllables.length,
    source: 'ai',
    syllableDetails,
  };
}
