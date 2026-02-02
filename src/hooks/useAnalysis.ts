'use client';

import { useState, useEffect } from 'react';
import type { WordAnalysisResponse } from '@/types';

/**
 * API 응답 타입
 */
interface AnalysisApiResponse {
  success: boolean;
  data?: WordAnalysisResponse;
  error?: string;
  details?: string;
}

/**
 * useAnalysis 훅 반환 타입
 */
interface UseAnalysisReturn {
  /** 분석 결과 데이터 */
  data: WordAnalysisResponse | null;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 단어 분석 결과를 가져오는 클라이언트 훅
 *
 * /api/words/analyze 엔드포인트를 호출하여 단어 분석 결과를 가져옵니다.
 * 로딩 상태, 에러 처리를 자동으로 관리합니다.
 *
 * @param word - 분석할 단어
 * @returns 분석 결과, 로딩 상태, 에러 정보
 *
 * @example
 * ```tsx
 * function WordAnalysisComponent({ word }: { word: string }) {
 *   const { data, isLoading, error } = useAnalysis(word);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!data) return null;
 *
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 * ```
 */
export function useAnalysis(word: string): UseAnalysisReturn {
  const [data, setData] = useState<WordAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 단어가 비어있으면 요청하지 않음
    if (!word.trim()) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    async function fetchAnalysis() {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(
          `/api/words/analyze?word=${encodeURIComponent(word)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = (await response.json()) as AnalysisApiResponse;

        // 컴포넌트가 언마운트되었으면 상태 업데이트하지 않음
        if (isCancelled) return;

        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error || 'Unknown error');
        }
      } catch (err) {
        if (isCancelled) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Network error');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchAnalysis();

    // Cleanup: 컴포넌트 언마운트 시 진행 중인 요청 취소
    return () => {
      isCancelled = true;
    };
  }, [word]);

  return { data, isLoading, error };
}
