'use client';

import { useEffect } from 'react';
import { useRecentSearches } from '@/hooks/useRecentSearches';

/**
 * SearchTracker 컴포넌트 Props
 */
interface SearchTrackerProps {
  /** 검색된 단어 */
  word: string;
}

/**
 * 검색 기록 추적 컴포넌트
 *
 * 검색 결과 페이지에서 사용되며, 검색된 단어를 localStorage의 최근 검색 기록에 추가합니다.
 * 렌더링되는 UI는 없으며, 오직 검색 기록 추가 side-effect만 처리합니다.
 *
 * @param word - 검색된 단어
 * @returns null (UI 렌더링 없음)
 */
export function SearchTracker({ word }: SearchTrackerProps) {
  const { addSearch } = useRecentSearches();

  useEffect(() => {
    // 검색어가 유효한 경우에만 검색 기록에 추가
    if (word && word.trim()) {
      addSearch(word);
    }
  }, [word, addSearch]);

  // UI를 렌더링하지 않음
  return null;
}
