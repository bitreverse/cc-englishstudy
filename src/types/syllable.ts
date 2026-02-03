import { z } from 'zod';

/**
 * 음절 정보 타입
 *
 * 각 음절은 철자(text)와 IPA 발음(ipa)을 함께 포함합니다.
 * 예: { text: "com", ipa: "kəm" }
 */
export interface SyllableInfo {
  /** 음절 철자 (예: "com") */
  text: string;
  /** 음절 IPA 발음 (예: "kəm") */
  ipa: string;
}

/**
 * 음절 분리 결과 타입
 *
 * AI를 통해 분석된 단어의 음절 정보를 나타냅니다.
 * 각 음절의 철자와 IPA 발음을 함께 제공합니다.
 */
export interface SyllabificationResult {
  /** 분석 대상 단어 */
  word: string;
  /** 분리된 음절 배열 (철자만, 하위 호환성 유지) */
  syllables: string[];
  /** 포맷된 음절 문자열 (예: 'hel·lo') */
  formatted: string;
  /** 음절 개수 */
  count: number;
  /** 분석 소스 */
  source: 'ai' | 'cache';
  /** 음절 상세 정보 (철자 + IPA 발음) */
  syllableDetails: SyllableInfo[];
}

/**
 * SyllableInfo Zod 스키마
 */
export const SyllableInfoSchema = z.object({
  text: z.string(),
  ipa: z.string(),
});

/**
 * SyllabificationResult Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const SyllabificationResultSchema = z.object({
  word: z.string(),
  syllables: z.array(z.string()),
  formatted: z.string(),
  count: z.number(),
  source: z.enum(['ai', 'cache']),
  syllableDetails: z.array(SyllableInfoSchema),
});
