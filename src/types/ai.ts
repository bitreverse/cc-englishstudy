import { z } from 'zod';
import type { MorphemeAnalysis } from './morpheme';
import type { SyllabificationResult } from './syllable';
import type { MeaningEntry } from './meaning';
import type { Phonetic } from './index';
import { MorphemeAnalysisSchema } from './morpheme';
import { SyllabificationResultSchema } from './syllable';
import { MeaningEntrySchema } from './meaning';

/**
 * AI 프로바이더 타입
 *
 * 지원하는 AI API 제공자를 정의합니다.
 */
export type AIProvider = 'gemini' | 'openai' | 'anthropic';

/**
 * AI 프로바이더 설정 타입
 *
 * AI API 호출에 필요한 설정 정보를 포함합니다.
 */
export interface AIProviderConfig {
  /** AI 프로바이더 ('gemini', 'openai', 'anthropic') */
  provider: AIProvider;
  /** 사용할 모델 (예: 'gemini-2.0-flash-exp', 'gpt-4o-mini', 'claude-3-5-haiku-20241022') */
  model: string;
  /** API 키 */
  apiKey: string;
  /** 최대 토큰 수 (선택적) */
  maxTokens?: number;
}

/**
 * 단어 분석 요청 타입
 *
 * AI API에 전달할 단어 분석 요청 정보를 포함합니다.
 * 통합 프롬프트를 위해 Free Dictionary API의 정의와 예문을 함께 전달합니다.
 */
export interface WordAnalysisRequest {
  /** 분석 대상 단어 */
  word: string;
  /** Free Dictionary API의 정의 배열 (선택적) */
  definitions?: string[];
  /** Free Dictionary API의 예문 배열 (선택적) */
  examples?: string[];
  /** Free Dictionary API의 발음 정보 배열 (선택적) */
  phonetics?: Phonetic[];
}

/**
 * 단어 분석 응답 타입
 *
 * AI API로부터 받은 통합 분석 결과를 포함합니다.
 * 형태소, 음절, 품사별 의미 정보를 한 번의 API 호출로 제공합니다.
 */
export interface WordAnalysisResponse {
  /** 형태소 분석 결과 */
  morpheme: MorphemeAnalysis;
  /** 음절 분리 결과 */
  syllables: SyllabificationResult;
  /** 품사별 상세 정보 배열 */
  meanings: MeaningEntry[];
}

/**
 * API 사용 통계 타입
 *
 * 월별 API 사용량과 예상 비용을 추적합니다.
 */
export interface APIUsageStats {
  /** 총 API 호출 횟수 */
  totalCalls: number;
  /** 예상 누적 비용 (USD) */
  estimatedCost: number;
  /** 월별 예산 한도 (USD) */
  monthlyBudget: number;
  /** 마지막 월별 리셋 시점 (YYYY-MM 형식) */
  lastResetMonth: string;
}

/**
 * WordAnalysisResponse Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const WordAnalysisResponseSchema = z.object({
  morpheme: MorphemeAnalysisSchema,
  syllables: SyllabificationResultSchema,
  meanings: z.array(MeaningEntrySchema),
});
