/**
 * TTS 발음 신고 API 엔드포인트
 *
 * 사용자가 발음 품질 문제를 신고하면
 * 기존 캐시를 무효화하고 재생성을 트리거합니다.
 *
 * POST /api/tts/report
 * Body: { word, ipa, phoneme? }
 * Response: { success: true }
 *
 * @module api/tts/report
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TTSCache } from '@/lib/tts-cache';

/**
 * 신고 요청 Zod 스키마
 */
const ReportRequestSchema = z.object({
  /** 신고 대상 단어 */
  word: z.string().min(1).max(100),
  /** IPA 발음 기호 (필수, 캐시 키 생성용) */
  ipa: z.string().min(1),
  /** 개별 음소 (선택) */
  phoneme: z.string().max(50).optional(),
});

/**
 * 신고 Rate Limiting
 *
 * 동일 IP에서 분당 최대 5회 신고 가능
 */
const reportRateMap = new Map<string, { count: number; resetTime: number }>();
const REPORT_RATE_LIMIT = 5;
const REPORT_RATE_WINDOW = 60 * 1000;

/**
 * 신고 Rate Limit 체크
 */
function isReportRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = reportRateMap.get(ip);

  if (!entry || now > entry.resetTime) {
    reportRateMap.set(ip, { count: 1, resetTime: now + REPORT_RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > REPORT_RATE_LIMIT;
}

/**
 * 발음 신고 POST 핸들러
 *
 * 캐시를 무효화하여 다음 요청 시 새로 생성되도록 합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 성공 응답
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isReportRateLimited(ip)) {
      return NextResponse.json(
        { error: '신고 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 요청 파싱
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const parsed = ReportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    const { word, ipa, phoneme } = parsed.data;

    // 캐시 무효화 (신고 표시)
    TTSCache.report(word, ipa, phoneme);

    // 파일시스템 캐시도 삭제
    await TTSCache.delete(word, ipa, phoneme);

    console.log(
      `[TTS Report] word="${word}" ipa="${ipa}" phoneme="${phoneme || 'N/A'}" ip="${ip}"`
    );

    return NextResponse.json({
      success: true,
      message: '신고가 접수되었습니다. 다음 재생 시 새로 생성됩니다.',
    });
  } catch (error) {
    console.error('[TTS Report Error]', error);
    return NextResponse.json(
      { error: '신고 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
