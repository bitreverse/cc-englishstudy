import { z } from 'zod';

/**
 * 형태소 분석 결과 타입
 *
 * AI API를 통해 분석된 단어의 형태소 구조를 나타냅니다.
 * 접두사, 어근, 접미사, 파생어, 어원 정보를 포함합니다.
 */
export interface MorphemeAnalysis {
  /** 분석 대상 단어 */
  word: string;
  /** 접두사 배열 */
  prefixes: MorphemePart[];
  /** 어근 */
  root: MorphemePart;
  /** 접미사 배열 */
  suffixes: MorphemePart[];
  /** 파생어 목록 */
  derivations: string[];
  /** 어원 정보 (선택적) */
  etymology?: string;
  /** 분석 소스 */
  source: 'ai' | 'cache' | 'fallback';
}

/**
 * 형태소 구성 요소 타입
 *
 * 접두사, 어근, 접미사 등 개별 형태소의 정보를 나타냅니다.
 */
export interface MorphemePart {
  /** 형태소 텍스트 */
  text: string;
  /** 의미 (영문, 선택적) */
  meaning?: string;
  /** 의미 (한글, 선택적) */
  meaningKo?: string;
  /** 어원 언어/출처 (예: "라틴어 per-", 선택적) */
  origin?: string;
}

/**
 * 형태소 분석 API 결과 타입 (Discriminated Union)
 *
 * 성공과 실패를 명확히 구분하여 타입 안정성을 제공합니다.
 */
export type MorphemeResult =
  | { success: true; data: MorphemeAnalysis }
  | { success: false; error: 'BUDGET_EXCEEDED' | 'API_ERROR' | 'NETWORK_ERROR' };

/**
 * MorphemePart Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const MorphemePartSchema = z.object({
  text: z.string(),
  meaning: z.string().optional(),
  meaningKo: z.string().optional(),
  origin: z.string().optional(),
});

/**
 * MorphemeAnalysis Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const MorphemeAnalysisSchema = z.object({
  word: z.string(),
  prefixes: z.array(MorphemePartSchema),
  root: MorphemePartSchema,
  suffixes: z.array(MorphemePartSchema),
  derivations: z.array(z.string()),
  etymology: z.string().optional(),
  source: z.enum(['ai', 'cache', 'fallback']),
});
