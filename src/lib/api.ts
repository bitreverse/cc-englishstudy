import type { DictionaryResponse, SearchResult } from '@/types';
import { API_BASE_URL } from './constants';

/**
 * Free Dictionary API로 단어 검색
 *
 * @param word - 검색할 영어 단어
 * @returns 검색 결과 (성공/실패 구분)
 *
 * @example
 * ```typescript
 * const result = await searchWord('hello');
 * if (result.success) {
 *   console.log(result.data[0].word); // 'hello'
 * } else if (result.error === 'NOT_FOUND') {
 *   console.log('단어를 찾을 수 없습니다');
 * } else {
 *   console.log('네트워크 오류가 발생했습니다');
 * }
 * ```
 *
 * @see https://dictionaryapi.dev/
 */
export async function searchWord(word: string): Promise<SearchResult> {
  try {
    const url = `${API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (response.status === 404) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data as DictionaryResponse[] };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: 'NETWORK_ERROR' };
  }
}
