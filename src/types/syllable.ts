import { z } from 'zod';

/**
 * 음절 분리 결과 타입
 *
 * hypher 라이브러리 또는 AI를 통해 분석된 단어의 음절 정보를 나타냅니다.
 * 음절 수, 분리된 음절 배열, 포맷된 문자열을 포함합니다.
 */
export interface SyllabificationResult {
  /** 분석 대상 단어 */
  word: string;
  /** 분리된 음절 배열 (예: ['hel', 'lo']) */
  syllables: string[];
  /** 포맷된 음절 문자열 (예: 'hel·lo') */
  formatted: string;
  /** 음절 개수 */
  count: number;
  /** 분석 소스 */
  source: 'ai' | 'cache';
}

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
});
