/**
 * Free Dictionary API 응답 타입
 * @see https://dictionaryapi.dev/
 *
 * API는 단어 검색 시 배열을 반환합니다.
 * 각 요소는 단어의 다양한 의미와 발음 정보를 포함합니다.
 */
export interface DictionaryResponse {
  /** 검색된 단어 */
  word: string;
  /** 일반적인 발음 기호 (IPA) - 선택적 */
  phonetic?: string;
  /** 발음 정보 배열 (여러 발음이 있을 수 있음) */
  phonetics: Phonetic[];
  /** 단어의 어원 - 선택적 */
  origin?: string;
  /** 품사별 의미 배열 */
  meanings: Meaning[];
}

/**
 * 발음 정보 타입
 *
 * IPA 발음 기호와 오디오 파일 URL을 포함합니다.
 */
export interface Phonetic {
  /** IPA 발음 기호 - 선택적 */
  text?: string;
  /** 음성 파일 URL - 선택적 (빈 문자열일 수 있음) */
  audio?: string;
  /** 품사 정보 (선택적) */
  partOfSpeech?: string;
}

/**
 * 품사별 의미 타입
 *
 * 단어의 품사(noun, verb, adjective 등)와
 * 해당 품사에서의 정의들을 포함합니다.
 */
export interface Meaning {
  /** 품사 (예: "noun", "verb", "adjective") */
  partOfSpeech: string;
  /** 해당 품사의 정의 배열 */
  definitions: Definition[];
}

/**
 * 개별 정의 타입
 *
 * 단어의 구체적인 정의와 예문, 유의어, 반의어를 포함합니다.
 */
export interface Definition {
  /** 정의 내용 */
  definition: string;
  /** 사용 예시 문장 - 선택적 */
  example?: string;
  /** 유의어 배열 */
  synonyms: string[];
  /** 반의어 배열 */
  antonyms: string[];
}

/**
 * 애플리케이션 내부에서 사용하는 단어 데이터 타입
 *
 * API 응답을 간소화하여 필요한 정보만 추출한 타입입니다.
 */
export interface WordData {
  /** 단어 */
  word: string;
  /** 발음 기호 - 선택적 */
  phonetic?: string;
  /** 품사별 의미 배열 */
  meanings: Meaning[];
}

/**
 * 최근 검색 기록 타입
 *
 * 사용자가 검색한 단어와 검색 시간을 저장합니다.
 * localStorage에 저장되어 검색 이력을 관리합니다.
 */
export interface RecentSearch {
  /** 검색한 단어 */
  word: string;
  /** 검색 시간 (Unix timestamp) */
  timestamp: number;
}

/**
 * API 검색 결과 타입 (Discriminated Union)
 *
 * 성공과 실패를 명확히 구분하여 타입 안정성을 제공합니다.
 */
export type SearchResult =
  | { success: true; data: DictionaryResponse[] }
  | { success: false; error: 'NOT_FOUND' | 'NETWORK_ERROR' };

// Phase 1: 단어 구조 분석 + 한글 번역 타입
export * from './syllable';
export * from './morpheme';
export * from './meaning';
export * from './ai';
