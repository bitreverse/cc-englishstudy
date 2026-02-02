import { z } from 'zod';

/**
 * 환경 변수 스키마 정의
 *
 * zod를 사용하여 런타임에 환경 변수를 검증합니다.
 * AI API 키, 프로바이더 선택, 월별 예산 설정을 포함합니다.
 */
const envSchema = z.object({
  /** OpenAI API 키 (선택적) */
  OPENAI_API_KEY: z.string().optional(),
  /** Anthropic API 키 (선택적) */
  ANTHROPIC_API_KEY: z.string().optional(),
  /** 사용할 AI 프로바이더 (기본값: openai) */
  AI_PROVIDER: z.enum(['openai', 'anthropic']).default('openai'),
  /** 사용할 AI 모델 (기본값: gpt-4o) */
  AI_MODEL: z.string().default('gpt-4o'),
  /** 월별 AI API 예산 한도 (USD, 기본값: 50.00) */
  AI_MONTHLY_BUDGET: z.coerce.number().positive().default(50.0),
});

/**
 * 검증된 환경 변수
 *
 * 애플리케이션 시작 시 환경 변수를 검증하고 타입 안전성을 제공합니다.
 */
export const env = envSchema.parse(process.env);

/**
 * 환경 변수 타입
 */
export type Env = z.infer<typeof envSchema>;
