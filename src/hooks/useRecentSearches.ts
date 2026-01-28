'use client';

import { useState, useEffect, useCallback } from 'react';
import { RecentSearch } from '@/types';
import { STORAGE_KEYS, MAX_RECENT_SEARCHES } from '@/lib/constants';

/**
 * localStorage에 안전하게 접근하는 헬퍼 함수
 *
 * SSR 환경에서는 window 객체가 없으므로 null을 반환합니다.
 *
 * @returns localStorage 객체 또는 null
 */
function safeLocalStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * 최근 검색 기록 관리 훅
 *
 * localStorage를 활용하여 사용자의 최근 검색 기록을 관리합니다.
 * SSR 호환성을 위해 useEffect에서만 localStorage에 접근하며,
 * 초기 렌더링 시에는 빈 배열을 반환하여 hydration mismatch를 방지합니다.
 *
 * 커스텀 이벤트를 통해 컴포넌트 간 상태 동기화를 지원합니다.
 *
 * @returns 검색 기록 관리 객체
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  // 컴포넌트 마운트 시 localStorage에서 검색 기록 로드
  useEffect(() => {
    // 초기 로드 - localStorage와 동기화하는 정당한 사용 사례
    const storage = safeLocalStorage();
    if (storage) {
      try {
        const stored = storage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
        if (stored) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load searches:', error);
      }
    }

    // 다른 컴포넌트에서 검색 기록이 업데이트되었을 때 다시 로드
    const handleStorageUpdate = () => {
      const storage = safeLocalStorage();
      if (storage) {
        try {
          const stored = storage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
          if (stored) {
            setSearches(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Failed to load searches:', error);
        }
      }
    };

    window.addEventListener('recent-searches-updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('recent-searches-updated', handleStorageUpdate);
    };
  }, []);

  /**
   * 새로운 검색어를 기록에 추가
   *
   * - 중복된 검색어가 있으면 제거 후 최상단에 추가
   * - 최대 MAX_RECENT_SEARCHES개까지만 저장
   * - localStorage에 자동 저장
   * - 커스텀 이벤트 발생시켜 다른 컴포넌트에 알림
   *
   * @param word - 검색한 단어
   */
  const addSearch = useCallback((word: string) => {
    const storage = safeLocalStorage();
    if (!storage) return;

    try {
      // 현재 저장된 검색 기록 로드
      const stored = storage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      const currentSearches: RecentSearch[] = stored ? JSON.parse(stored) : [];

      // 중복 제거 후 최상단에 새 검색어 추가, 최대 개수 제한
      const newSearches = [
        { word, timestamp: Date.now() },
        ...currentSearches.filter(s => s.word !== word)
      ].slice(0, MAX_RECENT_SEARCHES);

      // localStorage에 저장
      storage.setItem(
        STORAGE_KEYS.RECENT_SEARCHES,
        JSON.stringify(newSearches)
      );

      // 상태 업데이트
      setSearches(newSearches);

      // 다른 컴포넌트에 변경 사항 알림
      window.dispatchEvent(new CustomEvent('recent-searches-updated'));
    } catch (error) {
      console.error('Failed to save searches:', error);
    }
  }, []);

  /**
   * 모든 검색 기록 삭제
   *
   * 상태와 localStorage 모두 초기화하고, 다른 컴포넌트에 알립니다.
   */
  const clearSearches = useCallback(() => {
    setSearches([]);
    const storage = safeLocalStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
      // 다른 컴포넌트에 변경 사항 알림
      window.dispatchEvent(new CustomEvent('recent-searches-updated'));
    }
  }, []);

  return { searches, addSearch, clearSearches };
}
