import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';

/**
 * Gemini 사용 가능한 모델 목록 확인 API (개발 전용)
 */
export async function GET() {
  try {
    if (!env.GOOGLE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_API_KEY is not set',
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

    // ListModels API 호출 (공식 SDK는 이 메서드를 제공하지 않으므로 직접 fetch)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText,
      }, { status: response.status });
    }

    const data = await response.json();

    // generateContent를 지원하는 모델만 필터링
    const models = data.models
      ?.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods,
      }));

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      generateContentModels: models?.length || 0,
      models: models || [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
