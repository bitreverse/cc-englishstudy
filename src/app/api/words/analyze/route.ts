import { NextRequest, NextResponse } from 'next/server';
import { analyzeWord } from '@/lib/word-analysis-service';
import type { WordAnalysisRequest } from '@/types';

/**
 * 단어 분석 API 엔드포인트 (GET)
 *
 * 쿼리 파라미터로 단어를 받아 통합 분석을 수행합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 분석 결과 또는 에러 응답
 *
 * @example
 * GET /api/words/analyze?word=computer
 *
 * 응답:
 * {
 *   success: true,
 *   data: {
 *     morpheme: { ... },
 *     syllables: [{ word: 'computer', syllables: ['com', 'put', 'er'], ... }],
 *     phonics: [{ word: 'computer', phonemes: [...], ... }],
 *     translation: { ... }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get('word');

  // 파라미터 검증
  if (!word) {
    return NextResponse.json(
      { success: false, error: 'Word parameter required' },
      { status: 400 }
    );
  }

  // 단어 유효성 검증 (영문자만 허용)
  if (!/^[a-zA-Z]+$/.test(word)) {
    return NextResponse.json(
      { success: false, error: 'Only English words are supported' },
      { status: 400 }
    );
  }

  try {
    console.log('[API Route GET] ===== 분석 요청 =====');
    console.log('[API Route GET] 단어:', word);

    // 1. 통합 분석 요청 준비
    const analysisRequest: WordAnalysisRequest = {
      word,
    };

    // 2. 통합 분석 수행 (캐시 우선 → AI API → 폴백)
    const result = await analyzeWord(analysisRequest);

    console.log('[API Route GET] 분석 완료');
    console.log('[API Route GET] Morpheme source:', result.morpheme.source);
    console.log('[API Route GET] Meanings 개수:', result.meanings.length);

    // 3. 성공 응답
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error('[API Route GET] ❌ Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST 메서드 지원 (선택적)
 *
 * 복잡한 요청이나 Free Dictionary API 정보를 포함할 때 사용합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 분석 결과 또는 에러 응답
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      word: string;
      definitions?: string[];
      examples?: string[];
      phonetics?: Array<{
        text?: string;
        audio?: string;
        partOfSpeech?: string;
      }>;
    };

    console.log('[API Route POST] ===== 분석 요청 =====');
    console.log('[API Route POST] 단어:', body.word);
    console.log('[API Route POST] Definitions:', body.definitions?.length || 0);
    console.log('[API Route POST] Examples:', body.examples?.length || 0);
    console.log('[API Route POST] Phonetics:', body.phonetics?.length || 0);

    // 파라미터 검증
    if (!body.word) {
      return NextResponse.json(
        { success: false, error: 'Word parameter required' },
        { status: 400 }
      );
    }

    // 단어 유효성 검증
    if (!/^[a-zA-Z]+$/.test(body.word)) {
      return NextResponse.json(
        { success: false, error: 'Only English words are supported' },
        { status: 400 }
      );
    }

    // 통합 분석 요청 (Free Dictionary API 정보 포함)
    const analysisRequest: WordAnalysisRequest = {
      word: body.word,
      definitions: body.definitions,
      examples: body.examples,
      phonetics: body.phonetics,
    };

    const result = await analyzeWord(analysisRequest);

    console.log('[API Route POST] 분석 완료');
    console.log('[API Route POST] Morpheme source:', result.morpheme.source);
    console.log('[API Route POST] Meanings 개수:', result.meanings.length);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API Route POST] ❌ Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
