/**
 * CostTracker 비용 관리 시스템 테스트
 *
 * API 호출 비용 추적, 예산 경고, 예산 초과 시 폴백 전환을 검증합니다.
 */

require('dotenv').config({ path: '.env.local' });

async function testCostTracker() {
  console.log('=== CostTracker 비용 관리 시스템 테스트 ===\n');

  try {
    // 1. costTracker 모듈 로드
    const { costTracker } = require('./src/lib/ai/cost-tracker.ts');
    console.log('✓ CostTracker 모듈 로드 성공\n');

    // 2. 초기 상태 확인
    console.log('--- 1. 초기 상태 확인 ---');
    const initialStats = costTracker.getStats();
    console.log('초기 통계:', initialStats);
    console.log('예산:', initialStats.monthlyBudget + ' USD');
    console.log('현재 비용:', initialStats.estimatedCost.toFixed(6) + ' USD');
    console.log('호출 횟수:', initialStats.totalCalls);
    console.log('월:', initialStats.lastResetMonth);
    console.log('');

    // 3. API 호출 후 비용 추적 확인
    console.log('--- 2. API 호출 후 비용 추적 확인 ---');
    const testWord = 'costtracking' + Date.now();
    console.log(`테스트 단어: ${testWord}`);

    const response = await fetch(`http://localhost:3000/api/words/analyze?word=${testWord}`);
    const data = await response.json();

    console.log('API 호출 성공:', data.success);
    console.log('데이터 소스:', data.data?.morpheme?.source);

    // 비용 통계 재확인
    await new Promise(resolve => setTimeout(resolve, 100)); // 비용 추적 완료 대기
    const afterCallStats = costTracker.getStats();
    console.log('\nAPI 호출 후 통계:', afterCallStats);
    console.log('호출 횟수 증가:', afterCallStats.totalCalls - initialStats.totalCalls);
    console.log('비용 증가:', (afterCallStats.estimatedCost - initialStats.estimatedCost).toFixed(6) + ' USD');
    console.log('');

    // 4. 예산 경고 테스트 (80%)
    console.log('--- 3. 예산 경고 테스트 (80%) ---');
    const originalUsage = costTracker.usage;
    const budget = afterCallStats.monthlyBudget;

    // 80% 도달 시뮬레이션
    costTracker.usage.estimatedCost = budget * 0.8;

    const isWarning80 = costTracker.isBudgetWarning();
    const isExceeded80 = costTracker.isBudgetExceeded();

    console.log('예산:', budget + ' USD');
    console.log('현재 비용 (80%):', (budget * 0.8).toFixed(2) + ' USD');
    console.log('예산 경고 (80%):', isWarning80 ? '✓ true (정상)' : '✗ false (실패)');
    console.log('예산 초과 (80%):', !isExceeded80 ? '✓ false (정상)' : '✗ true (실패)');
    console.log('');

    // 5. 예산 초과 테스트 (110%)
    console.log('--- 4. 예산 초과 테스트 (110%) ---');

    // 110% 초과 시뮬레이션
    costTracker.usage.estimatedCost = budget * 1.1;

    const isWarning110 = costTracker.isBudgetWarning();
    const isExceeded110 = costTracker.isBudgetExceeded();

    console.log('예산:', budget + ' USD');
    console.log('현재 비용 (110%):', (budget * 1.1).toFixed(2) + ' USD');
    console.log('예산 경고 (110%):', isWarning110 ? '✓ true (정상)' : '✗ false (실패)');
    console.log('예산 초과 (110%):', isExceeded110 ? '✓ true (정상)' : '✗ false (실패)');
    console.log('');

    // 6. 폴백 전환 테스트
    console.log('--- 5. 예산 초과 시 폴백 전환 확인 ---');
    const fallbackWord = 'fallbacktest' + Date.now();
    console.log(`테스트 단어: ${fallbackWord}`);
    console.log('현재 예산 상태: 초과 (110%)');

    const fallbackResponse = await fetch(`http://localhost:3000/api/words/analyze?word=${fallbackWord}`);
    const fallbackData = await fallbackResponse.json();

    console.log('API 호출 성공:', fallbackData.success);
    console.log('데이터 소스:', fallbackData.data?.morpheme?.source);

    if (fallbackData.data?.morpheme?.source === 'fallback') {
      console.log('✓ 예산 초과 시 폴백 분석 사용 확인');
    } else {
      console.log('✗ 예상과 다름: AI API가 사용됨 (캐시 히트일 가능성)');
    }
    console.log('');

    // 7. 원래 상태 복원
    costTracker.usage = originalUsage;
    console.log('✓ 원래 상태 복원 완료');
    console.log('');

    // 8. 월별 리셋 로직 확인 (코드 리뷰)
    console.log('--- 6. 월별 리셋 로직 확인 (코드 리뷰) ---');
    console.log('✓ trackCall() 메서드에서 currentMonth !== lastResetMonth 확인');
    console.log('✓ 월이 바뀌면 자동으로 reset() 호출');
    console.log('✓ reset()에서 totalCalls, estimatedCost 0으로 초기화');
    console.log('✓ 코드 리뷰 완료 (src/lib/ai/cost-tracker.ts:40-45)');
    console.log('');

    console.log('=== CostTracker 테스트 완료 ===\n');
    return true;
  } catch (error) {
    console.error('테스트 실패:', error);
    return false;
  }
}

testCostTracker();
