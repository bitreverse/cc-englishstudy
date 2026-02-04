import { NextResponse } from 'next/server';
import { createAIClient } from '@/lib/ai/client';

/**
 * AI 클라이언트 디버깅 API (개발 전용)
 *
 * AI 클라이언트 생성 및 간단한 단어 분석을 테스트합니다.
 */
export async function GET() {
  const logs: string[] = [];

  try {
    logs.push('[1] AI Client 생성 시작...');
    const client = createAIClient();
    logs.push(`[2] AI Client 생성 성공 - Provider: ${client.provider}`);

    logs.push('[3] 단어 분석 시작: "test"');
    const result = await client.analyzeWord({
      word: 'test',
      definitions: ['a procedure to assess ability'],
      examples: ['I have a test tomorrow'],
    });

    logs.push(`[4] 분석 완료 - Morpheme source: ${result.morpheme.source}`);
    logs.push(`[5] Meanings 개수: ${result.meanings.length}`);

    return NextResponse.json({
      success: true,
      logs,
      result: {
        morphemeSource: result.morpheme.source,
        meaningsCount: result.meanings.length,
        syllables: result.syllables,
      },
    });
  } catch (error) {
    logs.push(`[ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);

    if (error instanceof Error && error.stack) {
      logs.push(`[STACK] ${error.stack.split('\n').slice(0, 5).join('\n')}`);
    }

    return NextResponse.json({
      success: false,
      logs,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
