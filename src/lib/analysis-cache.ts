import type { WordAnalysisResponse } from '@/types';

/**
 * 캐시 버전
 *
 * Phase 1 v2: hypher 제거, AI 전용 음절 분리 시스템으로 전환
 * - 이전 캐시 데이터(v1)와 호환되지 않음
 * - 버전 변경 시 기존 캐시는 자동으로 무효화됨
 */
const CACHE_VERSION = 'v2';

/**
 * 캐시 항목 타입
 */
interface CacheEntry {
  data: WordAnalysisResponse;
  timestamp: number;
  version: string;
}

/**
 * 서버 메모리 캐시 (Map 기반)
 *
 * Phase 1: 서버 메모리 캐시 (L1)
 * Phase 2: localStorage 캐시 추가 (L2, 클라이언트)
 * Phase 4: Supabase 캐시 추가 (L3, 영구 저장)
 */
const memoryCache = new Map<string, CacheEntry>();

/**
 * 캐시 TTL (Time To Live): 90일
 */
const TTL = 90 * 24 * 60 * 60 * 1000;

/**
 * 단어 분석 결과 캐시 관리 클래스
 *
 * 다층 캐싱 전략을 통해 API 호출을 최소화하고 응답 속도를 향상시킵니다.
 * 80%+ 캐시 히트율을 목표로 합니다.
 */
export class AnalysisCache {
  /**
   * 캐시에서 단어 분석 결과 조회
   *
   * @param word - 검색할 단어
   * @returns 캐시된 분석 결과, 없거나 만료된 경우 null
   */
  static get(word: string): WordAnalysisResponse | null {
    const key = word.toLowerCase().trim();
    const cached = memoryCache.get(key);

    if (!cached) {
      return null;
    }

    // 버전 확인 (v2부터 AI 전용, 이전 버전 무효화)
    if (cached.version !== CACHE_VERSION) {
      memoryCache.delete(key);
      return null;
    }

    // TTL 확인
    if (Date.now() - cached.timestamp > TTL) {
      memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 캐시에 단어 분석 결과 저장
   *
   * @param word - 단어
   * @param data - 분석 결과
   */
  static set(word: string, data: WordAnalysisResponse): void {
    const key = word.toLowerCase().trim();
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    });
  }

  /**
   * 캐시에서 특정 단어 삭제
   *
   * @param word - 삭제할 단어
   */
  static delete(word: string): void {
    const key = word.toLowerCase().trim();
    memoryCache.delete(key);
  }

  /**
   * 전체 캐시 초기화
   */
  static clear(): void {
    memoryCache.clear();
  }

  /**
   * 현재 캐시 크기 조회
   *
   * @returns 캐시된 항목 수
   */
  static size(): number {
    return memoryCache.size;
  }

  /**
   * 만료된 캐시 항목 정리
   *
   * TTL 만료 및 버전 불일치 항목을 삭제합니다.
   *
   * @returns 삭제된 항목 수
   */
  static pruneExpired(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of memoryCache.entries()) {
      if (
        now - entry.timestamp > TTL ||
        entry.version !== CACHE_VERSION
      ) {
        memoryCache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 캐시 통계 조회
   *
   * @returns 캐시 크기, 만료된 항목 수, 버전 불일치 항목 수
   */
  static getStats(): { size: number; expired: number; versionMismatch: number } {
    const now = Date.now();
    let expiredCount = 0;
    let versionMismatchCount = 0;

    for (const entry of memoryCache.values()) {
      if (now - entry.timestamp > TTL) {
        expiredCount++;
      }
      if (entry.version !== CACHE_VERSION) {
        versionMismatchCount++;
      }
    }

    return {
      size: memoryCache.size,
      expired: expiredCount,
      versionMismatch: versionMismatchCount,
    };
  }
}
