/**
 * TTS API 엔드포인트
 *
 * OpenAI TTS API를 사용하여 단어의 정확한 발음 오디오를 생성합니다.
 * Heteronym(동철이음어)의 경우 품사별 문맥을 제공하여
 * 정확한 발음을 유도합니다.
 *
 * POST /api/tts
 * Body: { word, partOfSpeech?, ipa?, phoneme? }
 * Response: audio/mpeg (MP3 바이너리)
 *
 * @module api/tts
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { TTSCache } from '@/lib/tts-cache';

/**
 * 요청 본문 Zod 스키마
 *
 * 입력 검증을 위한 스키마입니다.
 */
const TTSRequestSchema = z.object({
  /** 발음할 단어 */
  word: z.string().min(1).max(100),
  /** 품사 (heteronym 구분용) */
  partOfSpeech: z.string().optional(),
  /** IPA 발음 기호 */
  ipa: z.string().optional(),
  /** 개별 음소 (Phonics별 발음용) */
  phoneme: z.string().max(50).optional(),
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
 * IPA 자음(Consonant) 음소별 발음 가이드
 *
 * 각 IPA 자음에 대해 TTS가 정확한 자음 소리만 내도록
 * 프롬프트 텍스트를 매핑합니다.
 *
 * 참고: https://us.letterland.com/pages/letter-sounds
 * - 자음은 모음 없이 자음 소리만 발음해야 합니다.
 * - 예: 'p' = /p/ (NOT "pee"), 'b' = /b/ (NOT "bee")
 */
const CONSONANT_PHONEME_GUIDE: Record<string, { example: string; guide: string }> = {
  'p': { example: 'pit', guide: 'puh' },
  'b': { example: 'bit', guide: 'buh' },
  't': { example: 'tip', guide: 'tuh' },
  'd': { example: 'dip', guide: 'duh' },
  'k': { example: 'kit', guide: 'kuh' },
  'g': { example: 'get', guide: 'guh' },
  'f': { example: 'fit', guide: 'fff' },
  'v': { example: 'van', guide: 'vvv' },
  's': { example: 'sit', guide: 'sss' },
  'z': { example: 'zip', guide: 'zzz' },
  'h': { example: 'hat', guide: 'hhh' },
  'm': { example: 'mat', guide: 'mmm' },
  'n': { example: 'net', guide: 'nnn' },
  'l': { example: 'lip', guide: 'lll' },
  'r': { example: 'red', guide: 'rrr' },
  'w': { example: 'wet', guide: 'wuh' },
  'j': { example: 'yes', guide: 'yuh' },
  'θ': { example: 'thin', guide: 'thh' },
  'ð': { example: 'this', guide: 'thh' },
  'ʃ': { example: 'ship', guide: 'shh' },
  'ʒ': { example: 'vision', guide: 'zhh' },
  'tʃ': { example: 'chip', guide: 'chh' },
  'dʒ': { example: 'jam', guide: 'juh' },
  'ŋ': { example: 'sing', guide: 'nng' },
  'ʰ': { example: 'hat', guide: 'hhh' },
};

/**
 * IPA 모음(Vowel) 음소별 발음 가이드
 *
 * 각 IPA 모음에 대해 TTS가 정확한 모음 소리를 내도록
 * 프롬프트 텍스트를 매핑합니다.
 */
const VOWEL_PHONEME_GUIDE: Record<string, { example: string; guide: string }> = {
  'ɪ': { example: 'bit', guide: 'ih' },
  'iː': { example: 'beat', guide: 'ee' },
  'i': { example: 'happy', guide: 'ee' },
  'ɛ': { example: 'bet', guide: 'eh' },
  'e': { example: 'bed', guide: 'eh' },
  'æ': { example: 'cat', guide: 'aah' },
  'ɑː': { example: 'father', guide: 'aah' },
  'ɑ': { example: 'hot', guide: 'ah' },
  'ɑr': { example: 'car', guide: 'ar' },
  'ɒ': { example: 'lot', guide: 'aw' },
  'ɔː': { example: 'caught', guide: 'aw' },
  'ɔ': { example: 'dog', guide: 'aw' },
  'ɔr': { example: 'or', guide: 'or' },
  'ʊ': { example: 'put', guide: 'oo' },
  'ʊr': { example: 'tour', guide: 'oor' },
  'uː': { example: 'boot', guide: 'oo' },
  'ʌ': { example: 'cup', guide: 'uh' },
  'ə': { example: 'about', guide: 'uh' },
  'ɜː': { example: 'bird', guide: 'ur' },
  'ɜːr': { example: 'bird', guide: 'ur' },
  'ɜr': { example: 'bird', guide: 'ur' },
  'ɜ': { example: 'bird', guide: 'ur' },
  'ər': { example: 'butter', guide: 'er' },
  'ɪr': { example: 'near', guide: 'eer' },
  'ɛr': { example: 'air', guide: 'air' },
  'aɪ': { example: 'bite', guide: 'eye' },
  'aɪr': { example: 'fire', guide: 'ire' },
  'aʊ': { example: 'cow', guide: 'ow' },
  'aʊr': { example: 'hour', guide: 'our' },
  'ɔɪ': { example: 'boy', guide: 'oy' },
  'eɪ': { example: 'bay', guide: 'ay' },
  'oʊ': { example: 'go', guide: 'oh' },
};

/**
 * IPA 음소가 자음인지 판별
 *
 * @param phoneme - 강세 기호가 제거된 IPA 음소
 * @returns 자음이면 true
 */
function isConsonant(phoneme: string): boolean {
  return phoneme in CONSONANT_PHONEME_GUIDE;
}

/**
 * IPA 음소가 모음인지 판별
 *
 * @param phoneme - 강세 기호가 제거된 IPA 음소
 * @returns 모음이면 true
 */
function isVowel(phoneme: string): boolean {
  return phoneme in VOWEL_PHONEME_GUIDE;
}

/**
 * 개별 IPA 음소를 위한 TTS 입력 텍스트 생성
 *
 * 발음 가이드 테이블의 guide 값(예: "puh", "ih")만 직접 전달합니다.
 * 설명 문장 없이 발음 사운드만 재생되도록 합니다.
 *
 * @param phoneme - IPA 음소 (강세 기호 포함 가능)
 * @returns TTS API에 전달할 발음 텍스트 (guide 값만)
 */
function buildPhonemeInput(phoneme: string): string {
  // 강세 기호 제거
  const clean = phoneme.replace(/[ˈˌ]/g, '');

  // 자음 가이드 확인 - guide 값만 전달
  if (isConsonant(clean)) {
    return CONSONANT_PHONEME_GUIDE[clean].guide;
  }

  // 모음 가이드 확인 - guide 값만 전달
  if (isVowel(clean)) {
    return VOWEL_PHONEME_GUIDE[clean].guide;
  }

  // 매핑에 없는 음소는 음소 자체를 전달
  return clean;
}

/**
 * TTS 입력 텍스트 생성
 *
 * 품사 정보를 활용하여 OpenAI TTS가
 * 정확한 발음을 생성하도록 짧은 캐리어 문장을 구성합니다.
 *
 * 중요: 예문(context)은 절대 TTS 입력으로 사용하지 않습니다.
 * 단어만 발음해야 하며, 품사별 짧은 캐리어 문장으로
 * heteronym의 정확한 발음을 유도합니다.
 *
 * @param word - 단어
 * @param partOfSpeech - 품사 (heteronym 구분용)
 * @param phoneme - 개별 음소
 * @returns TTS API에 전달할 입력 텍스트
 */
function buildTTSInput(
  word: string,
  partOfSpeech?: string,
  phoneme?: string
): string {
  // 개별 음소 발음 요청: 음소별 프롬프트 생성
  if (phoneme) {
    return buildPhonemeInput(phoneme);
  }

  // 품사 정보가 있으면 짧은 캐리어 문장으로 정확한 발음 유도
  // (예문 전체를 읽지 않고, 단어만 자연스럽게 발음되도록 유도)
  if (partOfSpeech) {
    // heteronym 대응: 품사에 따른 짧은 캐리어 문장
    const posContext: Record<string, string> = {
      noun: `The ${word}.`,
      verb: `To ${word}.`,
      adjective: `It is ${word}.`,
      adverb: `Do it ${word}.`,
    };

    return posContext[partOfSpeech.toLowerCase()] || word;
  }

  // 기본: 단어만 전달
  return word;
}

/**
 * OpenAI 클라이언트 (싱글톤)
 */
let openaiClient: OpenAI | null = null;

/**
 * OpenAI 클라이언트 가져오기
 *
 * @returns OpenAI 클라이언트 인스턴스
 * @throws API 키가 설정되지 않은 경우
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * TTS API POST 핸들러
 *
 * OpenAI TTS API를 호출하여 발음 오디오를 생성합니다.
 * 캐시가 있으면 캐시에서 반환하고, 없으면 새로 생성합니다.
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

    const { word, partOfSpeech, ipa, phoneme, skipCache } = parsed.data;

    // 디버깅 로그: 요청 파라미터
    console.info('[TTS API] 요청:', {
      word,
      partOfSpeech: partOfSpeech || '(없음)',
      ipa: ipa || '(없음)',
      phoneme: phoneme || '(없음)',
      skipCache: !!skipCache,
    });

    // 캐시 확인 (skipCache가 아닌 경우)
    if (!skipCache) {
      const cached = await TTSCache.get(word, partOfSpeech, phoneme);
      if (cached) {
        console.info('[TTS API] 캐시 히트:', { word, partOfSpeech, phoneme });
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

    // OpenAI TTS API 호출
    const client = getOpenAIClient();
    const input = buildTTSInput(word, partOfSpeech, phoneme);

    // 디버깅 로그: TTS 입력 텍스트 확인
    console.info('[TTS API] TTS 입력 생성:', {
      word,
      partOfSpeech: partOfSpeech || '(없음)',
      phoneme: phoneme || '(없음)',
      generatedInput: input,
    });

    const response = await client.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input,
      response_format: 'mp3',
      speed: 0.9, // 학습용이므로 약간 느리게
    });

    // 응답을 Buffer로 변환
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 캐시에 저장
    await TTSCache.set(word, buffer, partOfSpeech, phoneme);

    // MP3 응답 반환
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
        'X-TTS-Input': encodeURIComponent(input),
        'X-TTS-IPA': ipa ? encodeURIComponent(ipa) : '',
      },
    });
  } catch (error) {
    console.error('[TTS API Error]', error);

    // OpenAI API 에러 처리
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'TTS 생성에 실패했습니다.', code: error.status },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'TTS 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
