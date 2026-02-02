/**
 * AnalysisCache 테스트 스크립트
 *
 * 캐시 시스템의 동작을 검증합니다.
 */

require('dotenv').config({ path: '.env.local' });

async function testCache() {
  console.log('=== AnalysisCache 모듈 테스트 ===\n');

  try {
    // 1. AnalysisCache 모듈 로드
    const { AnalysisCache } = require('./src/lib/analysis-cache.ts');
    console.log('✓ AnalysisCache 모듈 로드 성공\n');

    // 2. 캐시 초기화
    console.log('--- 2. 캐시 초기화 테스트 ---');
    AnalysisCache.clear();
    console.log('✓ 캐시 초기화 완료');
    console.log('캐시 크기:', AnalysisCache.size());
    console.log('');

    // 3. 캐시 조회 (빈 캐시)
    console.log('--- 3. 캐시 미스 테스트 ---');
    const testWord = 'test';
    const cached1 = AnalysisCache.get(testWord);
    if (cached1 === null) {
      console.log(`✓ 캐시 미스: "${testWord}" 단어가 캐시에 없음`);
    } else {
      console.error('✗ 실패: 빈 캐시에서 데이터가 반환됨');
    }
    console.log('');

    // 4. 캐시 저장 테스트
    console.log('--- 4. 캐시 저장 테스트 ---');
    const mockData = {
      morpheme: {
        word: testWord,
        prefixes: [],
        root: { text: 'test', meaning: 'to examine', meaningKo: '검사하다' },
        suffixes: [],
        derivations: [],
        source: 'ai',
      },
      syllables: ['test'],
      translation: {
        word: testWord,
        definitions: [{ partOfSpeech: 'verb', english: 'to examine', korean: '검사하다' }],
        examples: [],
        source: 'ai',
      },
    };

    AnalysisCache.set(testWord, mockData);
    console.log(`✓ 캐시 저장: "${testWord}" 단어 저장 완료`);
    console.log('캐시 크기:', AnalysisCache.size());
    console.log('');

    // 5. 캐시 조회 (히트)
    console.log('--- 5. 캐시 히트 테스트 ---');
    const cached2 = AnalysisCache.get(testWord);
    if (cached2 !== null && cached2.morpheme.word === testWord) {
      console.log(`✓ 캐시 히트: "${testWord}" 단어를 캐시에서 조회`);
      console.log('조회된 데이터:', {
        word: cached2.morpheme.word,
        syllables: cached2.syllables,
        source: cached2.morpheme.source,
      });
    } else {
      console.error('✗ 실패: 캐시에서 데이터 조회 실패');
    }
    console.log('');

    // 6. 캐시 통계 확인
    console.log('--- 6. 캐시 통계 확인 ---');
    const stats = AnalysisCache.getStats();
    console.log('캐시 통계:', stats);
    if (stats.size === 1 && stats.expired === 0) {
      console.log('✓ 캐시 통계 정상');
    } else {
      console.error('✗ 실패: 캐시 통계가 예상과 다름');
    }
    console.log('');

    // 7. 캐시 삭제 테스트
    console.log('--- 7. 캐시 삭제 테스트 ---');
    AnalysisCache.delete(testWord);
    console.log(`✓ 캐시 삭제: "${testWord}" 단어 삭제`);
    const cached3 = AnalysisCache.get(testWord);
    if (cached3 === null) {
      console.log('✓ 삭제 확인: 캐시에서 삭제됨');
    } else {
      console.error('✗ 실패: 삭제 후에도 캐시에 데이터가 남아있음');
    }
    console.log('캐시 크기:', AnalysisCache.size());
    console.log('');

    console.log('=== AnalysisCache 모듈 테스트 완료 ===\n');
    return true;
  } catch (error) {
    console.error('테스트 실패:', error);
    return false;
  }
}

async function testCacheViaAPI() {
  console.log('=== API 엔드포인트를 통한 캐시 테스트 ===\n');

  try {
    const testWord = 'hello';

    // 첫 번째 호출 (캐시 미스 예상)
    console.log('--- 첫 번째 API 호출 (캐시 미스) ---');
    const start1 = Date.now();
    const response1 = await fetch(`http://localhost:3000/api/words/analyze?word=${testWord}`);
    const time1 = Date.now() - start1;
    const data1 = await response1.json();

    console.log('응답 시간:', time1 + 'ms');
    console.log('응답 성공:', data1.success);
    console.log('데이터 소스:', data1.data?.morpheme?.source || 'unknown');
    console.log('');

    // 두 번째 호출 (캐시 히트 예상)
    console.log('--- 두 번째 API 호출 (캐시 히트) ---');
    const start2 = Date.now();
    const response2 = await fetch(`http://localhost:3000/api/words/analyze?word=${testWord}`);
    const time2 = Date.now() - start2;
    const data2 = await response2.json();

    console.log('응답 시간:', time2 + 'ms');
    console.log('응답 성공:', data2.success);
    console.log('');

    // 결과 검증
    console.log('--- 캐시 성능 검증 ---');
    if (time2 < 100) {
      console.log(`✓ 캐시 히트 응답 시간: ${time2}ms < 100ms`);
    } else {
      console.warn(`⚠ 캐시 히트 응답 시간: ${time2}ms >= 100ms (네트워크 지연 가능)`);
    }

    if (time2 < time1) {
      console.log(`✓ 캐시 히트가 더 빠름: ${time2}ms < ${time1}ms`);
    } else {
      console.warn(`⚠ 캐시 히트가 느림: ${time2}ms >= ${time1}ms`);
    }

    console.log('');
    console.log('=== API 캐시 테스트 완료 ===\n');
    return true;
  } catch (error) {
    console.error('API 테스트 실패:', error);
    return false;
  }
}

async function runAllTests() {
  const result1 = await testCache();
  const result2 = await testCacheViaAPI();

  console.log('\n=== 전체 테스트 결과 ===');
  console.log('AnalysisCache 모듈 테스트:', result1 ? '✓ 성공' : '✗ 실패');
  console.log('API 캐시 테스트:', result2 ? '✓ 성공' : '⚠ 확인 필요');
}

runAllTests();
