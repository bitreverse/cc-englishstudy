import { NextResponse } from 'next/server';
import { AnalysisCache } from '@/lib/analysis-cache';

/**
 * 캐시 관리 API (개발 전용)
 */
export async function GET() {
  const stats = AnalysisCache.getStats();
  return NextResponse.json({
    stats,
    message: 'Use DELETE method to clear cache',
  });
}

/**
 * 캐시 초기화 API
 */
export async function DELETE() {
  const sizeBefore = AnalysisCache.size();
  AnalysisCache.clear();
  const sizeAfter = AnalysisCache.size();

  return NextResponse.json({
    success: true,
    message: 'Cache cleared',
    deletedCount: sizeBefore - sizeAfter,
  });
}
