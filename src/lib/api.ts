import type { DictionaryResponse } from '@/types';
import { API_BASE_URL } from './constants';

/**
 * Free Dictionary API로 단어 검색
 *
 * @param word - 검색할 영어 단어
 * @returns API 응답 데이터 배열 또는 null (단어 미발견 또는 네트워크 오류 시)
 *
 * @example
 * ```typescript
 * const result = await searchWord('hello');
 * if (result) {
 *   console.log(result[0].word); // 'hello'
 * } else {
 *   console.log('단어를 찾을 수 없거나 오류가 발생했습니다');
 * }
 * ```
 *
 * @see https://dictionaryapi.dev/
 */
export async function searchWord(
  word: string
): Promise<DictionaryResponse[] | null> {
  try {
    const url = `${API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (response.status === 404) {
      return null; // 단어 미발견
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data as DictionaryResponse[];
  } catch (error) {
    console.error('Search error:', error);
    return null; // 네트워크 오류 시 null 반환
  }
}
