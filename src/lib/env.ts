import { z } from 'zod';

/**
 * 환경 변수 스키마 정의
 *
 * zod를 사용하여 런타임에 환경 변수를 검증합니다.
 * Google Gemini, Google Cloud TTS, OpenAI, Anthropic을 지원합니다.
 */
const envSchema = z.object({
  // ============================================
  // AI 프로바이더 설정
  // ============================================

  /** 사용할 AI 프로바이더 (기본값: gemini) */
  AI_PROVIDER: z.enum(['gemini', 'openai', 'anthropic']).default('gemini'),

  /** Google Gemini API 키 (선택적) */
  GOOGLE_API_KEY: z.string().optional(),

  /** Gemini 모델 (기본값: gemini-2.0-flash-exp) */
  GEMINI_MODEL: z.string().default('gemini-2.0-flash-exp'),

  /** OpenAI API 키 (선택적) */
  OPENAI_API_KEY: z.string().optional(),

  /** OpenAI 모델 (기본값: gpt-4o-mini) */
  AI_MODEL: z.string().default('gpt-4o-mini'),

  /** Anthropic API 키 (선택적) */
  ANTHROPIC_API_KEY: z.string().optional(),

  // ============================================
  // Google Cloud TTS 설정
  // ============================================

  /** Google Cloud Service Account 키 파일 경로 */
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  /** Google Cloud Service Account JSON (문자열) */
  GOOGLE_CLOUD_TTS_CREDENTIALS: z.string().optional(),

  /** Google Cloud 프로젝트 ID */
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),

  /** TTS 음성 이름 (기본값: en-US-Neural2-J) */
  GOOGLE_TTS_VOICE_NAME: z.string().default('en-US-Neural2-J'),

  /** TTS 음성 타입 (기본값: WaveNet) */
  GOOGLE_TTS_VOICE_TYPE: z.enum(['Standard', 'WaveNet', 'Neural2']).default('WaveNet'),

  // ============================================
  // 예산 및 비용 관리
  // ============================================

  /** 월별 AI API 예산 한도 (USD, 기본값: 5.00) */
  AI_MONTHLY_BUDGET: z.coerce.number().positive().default(5.0),
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
