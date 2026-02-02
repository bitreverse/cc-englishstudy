/**
 * 캐시 통계 및 성능 테스트
 *
 * 여러 단어를 사용하여 캐시 히트율과 성능을 측정합니다.
 */

require('dotenv').config({ path: '.env.local' });

async function testCacheStatistics() {
  console.log('=== 캐시 통계 및 성능 테스트 ===\n');

  const { AnalysisCache } = require('./src/lib/analysis-cache.ts');

  // 초기화
  AnalysisCache.clear();
  console.log('초기 캐시 상태:', AnalysisCache.getStats());
  console.log('');

  const testWords = ['hello', 'world', 'test', 'cache', 'performance'];
  const timings = [];

  console.log('--- 첫 번째 라운드 (캐시 미스) ---');
  for (const word of testWords) {
    const start = Date.now();
    const response = await fetch(`http://localhost:3000/api/words/analyze?word=${word}`);
    const time = Date.now() - start;
    const data = await response.json();

    timings.push({ word, round: 1, time, source: data.data?.morpheme?.source });
    console.log(`${word}: ${time}ms (source: ${data.data?.morpheme?.source})`);
  }
  console.log('');

  // 캐시 상태 확인
  const stats1 = AnalysisCache.getStats();
  console.log('첫 번째 라운드 후 캐시 상태:', stats1);
  console.log('');

  console.log('--- 두 번째 라운드 (캐시 히트) ---');
  for (const word of testWords) {
    const start = Date.now();
    const response = await fetch(`http://localhost:3000/api/words/analyze?word=${word}`);
    const time = Date.now() - start;
    const data = await response.json();

    timings.push({ word, round: 2, time });
    console.log(`${word}: ${time}ms`);
  }
  console.log('');

  // 캐시 상태 확인
  const stats2 = AnalysisCache.getStats();
  console.log('두 번째 라운드 후 캐시 상태:', stats2);
  console.log('');

  // 성능 분석
  console.log('--- 성능 분석 ---');
  const round1Avg = timings.filter(t => t.round === 1).reduce((sum, t) => sum + t.time, 0) / testWords.length;
  const round2Avg = timings.filter(t => t.round === 2).reduce((sum, t) => sum + t.time, 0) / testWords.length;
  const round2Max = Math.max(...timings.filter(t => t.round === 2).map(t => t.time));

  console.log(`평균 응답 시간 (캐시 미스): ${round1Avg.toFixed(2)}ms`);
  console.log(`평균 응답 시간 (캐시 히트): ${round2Avg.toFixed(2)}ms`);
  console.log(`최대 응답 시간 (캐시 히트): ${round2Max}ms`);
  console.log(`속도 개선: ${(round1Avg / round2Avg).toFixed(2)}배 빠름`);
  console.log('');

  // 검증
  console.log('--- 검증 결과 ---');
  const allCacheHitsUnder100ms = timings.filter(t => t.round === 2).every(t => t.time < 100);
  console.log(`✓ 모든 캐시 히트 응답 시간 < 100ms: ${allCacheHitsUnder100ms ? '성공' : '실패'}`);
  console.log(`✓ 캐시 크기: ${stats2.size}개 (예상: ${testWords.length}개)`);
  console.log(`✓ 만료된 항목: ${stats2.expired}개 (예상: 0개)`);
  console.log('');

  console.log('=== 테스트 완료 ===');
}

testCacheStatistics().catch(console.error);
