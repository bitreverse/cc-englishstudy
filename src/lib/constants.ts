/**
 * Free Dictionary API 엔드포인트
 * @see https://dictionaryapi.dev/
 */
export const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * 음성 재생 속도 옵션
 *
 * 사용 가능한 재생 속도: 0.5배속, 0.75배속, 1배속, 1.25배속, 1.5배속
 */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;

/**
 * PlaybackSpeed 타입
 * PLAYBACK_SPEEDS 배열의 요소 타입
 */
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

/**
 * 최대 검색 기록 저장 수
 *
 * localStorage에 저장할 최근 검색 기록의 최대 개수
 */
export const MAX_RECENT_SEARCHES = 10;

/**
 * localStorage 키 상수
 *
 * 애플리케이션에서 사용하는 localStorage 키들을 관리합니다.
 */
export const STORAGE_KEYS = {
  /** 최근 검색 기록 저장 키 */
  RECENT_SEARCHES: 'recent-searches',
} as const;

/**
 * 에러 메시지 상수
 *
 * 사용자에게 표시할 에러 메시지들을 중앙에서 관리합니다.
 */
export const ERROR_MESSAGES = {
  /** 단어를 찾을 수 없을 때 (404) */
  WORD_NOT_FOUND: '단어를 찾을 수 없습니다.',
  /** 네트워크 오류 발생 시 */
  NETWORK_ERROR: '오류가 발생했습니다. 다시 시도해주세요.',
  /** 잘못된 입력 형식 (영어 알파벳 외 문자) */
  INVALID_INPUT: '영어 알파벳만 입력 가능합니다.',
  /** 빈 입력값 */
  EMPTY_INPUT: '단어를 입력해주세요.',
} as const;
