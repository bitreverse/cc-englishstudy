/**
 * TTS API 엔드포인트 (Google Cloud TTS)
 *
 * Google Cloud Text-to-Speech API를 사용하여 단어의 정확한 발음 오디오를 생성합니다.
 * SSML <phoneme> 태그로 IPA 발음 기호를 직접 전달하여
 * Heteronym(동철이음어)의 정확한 발음을 보장합니다.
 *
 * POST /api/tts
 * Body: { word, ipa, phoneme? }
 * Response: audio/mpeg (MP3 바이너리)
 *
 * @module api/tts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSSML, synthesizeSpeech } from '@/lib/google-tts-client';
import { TTSCache } from '@/lib/tts-cache';

/**
 * 요청 본문 Zod 스키마
 *
 * 입력 검증을 위한 스키마입니다.
 */
const TTSRequestSchema = z.object({
  /** 발음할 단어 */
  word: z.string().min(1).max(100),
  /** IPA 발음 기호 (필수) */
  ipa: z.string().min(1),
  /** 개별 음소 (Phonics별 발음용, 선택적)
   * 복합 음소 허용 (이중모음, r-colored vowels 등, 최대 3자)
   * 예: 'ɜːr', 'aɪ', 'tʃ'
   */
  phoneme: z.string().min(1).max(10).optional(),
  /** 캐시 무시 (신고 후 재생성 시) */
  skipCache: z.boolean().optional(),
});

/**
 * Rate Limiting을 위한 간단한 카운터
 *
 * IP 기반으로 분당 요청 수를 제한합니다.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // 분당 최대 요청 수
const RATE_WINDOW = 60 * 1000; // 1분 (밀리초)

/**
 * Rate Limit 체크
 *
 * @param ip - 클라이언트 IP 주소
 * @returns 제한 초과 여부
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

/**
 * TTS API POST 핸들러
 *
 * Google Cloud TTS API를 호출하여 발음 오디오를 생성합니다.
 * 캐시가 있으면 캐시에서 반환하고, 없으면 새로 생성합니다.
 *
 * **Heteronym 해결:**
 * IPA 발음 기호를 직접 SSML <phoneme> 태그로 전달하여
 * 품사에 관계없이 정확한 발음을 생성합니다.
 *
 * 예:
 * - record (noun): { word: "record", ipa: "/ˈrɛkərd/" }
 * - record (verb): { word: "record", ipa: "/rɪˈkɔrd/" }
 *
 * @param request - Next.js 요청 객체
 * @returns MP3 오디오 응답
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 요청 본문 파싱 및 검증
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const parsed = TTSRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 유효하지 않습니다.', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { word, ipa, phoneme, skipCache } = parsed.data;

    // 디버깅 로그: 요청 파라미터
    console.info('[TTS API] 요청:', {
      word,
      ipa,
      phoneme: phoneme || '(없음)',
      skipCache: !!skipCache,
    });

    // 캐시 확인 (skipCache가 아닌 경우)
    if (!skipCache) {
      const cached = await TTSCache.get(word, ipa, phoneme);
      if (cached) {
        console.info('[TTS API] 캐시 히트:', { word, ipa, phoneme });
        return new NextResponse(new Uint8Array(cached), {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400', // 24시간
            'X-Cache': 'HIT',
          },
        });
      }
    }

    // SSML 생성
    const ssml = buildSSML(word, ipa, phoneme);

    // 디버깅 로그: SSML 확인
    console.info('[TTS API] SSML 생성:', {
      word,
      ipa,
      phoneme: phoneme || '(없음)',
      ssml,
    });

    // Google Cloud TTS API 호출
    const audioBuffer = await synthesizeSpeech(ssml);

    // 캐시에 저장
    await TTSCache.set(word, audioBuffer, ipa, phoneme);

    // MP3 응답 반환
    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
        'X-TTS-IPA': encodeURIComponent(ipa),
        'X-TTS-SSML': encodeURIComponent(ssml),
      },
    });
  } catch (error) {
    console.error('[TTS API Error]', error);

    // 에러 응답
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'TTS 생성에 실패했습니다.', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'TTS 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
