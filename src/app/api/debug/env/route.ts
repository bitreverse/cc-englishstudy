import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * 환경 변수 디버깅 API (개발 전용)
 *
 * 환경 변수가 올바르게 로드되는지 확인합니다.
 */
export async function GET() {
  const envDebug = {
    AI_PROVIDER: env.AI_PROVIDER,
    GOOGLE_API_KEY_EXISTS: !!env.GOOGLE_API_KEY,
    GOOGLE_API_KEY_PREFIX: env.GOOGLE_API_KEY?.substring(0, 10),
    GEMINI_MODEL: env.GEMINI_MODEL,
    OPENAI_API_KEY_EXISTS: !!env.OPENAI_API_KEY,
    AI_MONTHLY_BUDGET: env.AI_MONTHLY_BUDGET,
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log('[DEBUG ENV] 환경 변수 확인:', envDebug);

  return NextResponse.json(envDebug);
}
