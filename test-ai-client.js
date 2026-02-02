/**
 * AI Client 직접 테스트 스크립트
 *
 * Node.js 환경에서 직접 AI 클라이언트를 테스트합니다.
 */

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

console.log('=== 환경 변수 확인 ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '설정됨 (길이: ' + process.env.OPENAI_API_KEY.length + ')' : '미설정');
console.log('AI_PROVIDER:', process.env.AI_PROVIDER || 'openai (기본값)');
console.log('AI_MODEL:', process.env.AI_MODEL || 'gpt-4o-mini (기본값)');
console.log('AI_MONTHLY_BUDGET:', process.env.AI_MONTHLY_BUDGET || '5.0 (기본값)');
console.log('');

async function testAIClient() {
  try {
    console.log('=== AI Client 생성 테스트 ===');

    // 모듈 경로 주의: tsx 사용 시 TypeScript 파일 직접 import
    const { createAIClient } = require('./src/lib/ai/client.ts');

    console.log('AI Client 팩토리 로드 성공');

    const client = createAIClient();
    console.log('AI Client 생성 성공. Provider:', client.provider);
    console.log('');

    console.log('=== 단어 분석 테스트 ===');
    const testWord = 'testing';
    console.log(`테스트 단어: ${testWord}`);

    const result = await client.analyzeWord({
      word: testWord,
      hypherSyllables: ['test', 'ing'],
      verifySyllables: true,
    });

    console.log('분석 결과:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('테스트 실패:', error);
    process.exit(1);
  }
}

testAIClient();
