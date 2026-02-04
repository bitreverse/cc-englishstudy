import { createAIClient } from './ai/client';
import { AnalysisCache } from './analysis-cache';
import { costTracker } from './ai/cost-tracker';
import { detectHeteronyms, isHeteronym } from './heteronyms-detector';
import type {
  WordAnalysisRequest,
  WordAnalysisResponse,
  MorphemeAnalysis,
  SyllabificationResult,
  MeaningEntry,
} from '@/types';

/**
 * 통합 단어 분석 서비스
 *
 * 캐시 우선 전략으로 AI API 호출을 최소화하고,
 * 예산 초과 또는 API 실패 시 폴백 분석을 제공합니다.
 *
 * 처리 순서:
 * 1. 캐시 확인 (서버 메모리)
 * 2. 예산 확인 (월별 한도)
 * 3. AI API 호출 (통합 프롬프트)
 * 4. 결과 캐싱 및 비용 추적
 * 5. 실패 시 폴백 분석
 *
 * @param request - 단어 분석 요청
 * @returns 분석 결과
 */
export async function analyzeWord(
  request: WordAnalysisRequest
): Promise<WordAnalysisResponse> {
  // 1. 캐시 확인 (80%+ 히트율 목표)
  const cached = AnalysisCache.get(request.word);
  if (cached) {
    console.log(`[Cache Hit] ${request.word}`);
    return cached;
  }

  // 2. 예산 확인
  if (costTracker.isBudgetExceeded()) {
    console.warn(
      `[Budget Exceeded] Using fallback for: ${request.word}`
    );
    return getFallbackAnalysis(request);
  }

  // 예산 경고 (80% 도달)
  if (costTracker.isBudgetWarning()) {
    console.warn('[Budget Warning] 80% of monthly budget reached');
  }

  // 3. Heteronyms 감지 (품사별 발음 분리)
  const heteronymGroups = request.phonetics
    ? detectHeteronyms(request.word, request.phonetics)
    : [];
  const hasHeteronyms = isHeteronym(heteronymGroups);

  if (hasHeteronyms) {
    console.log(
      `[Heteronym Detected] ${request.word} - ${heteronymGroups.length} pronunciations`
    );
  }

  // 4. AI API 호출
  try {
    console.log(`[Word Analysis Service] AI API 호출 시작: ${request.word}`);
    const aiClient = createAIClient();
    console.log(`[Word Analysis Service] AI Client 생성됨 - Provider: ${aiClient.provider}`);

    const result = await aiClient.analyzeWord(request);

    // 캐싱 (90일 TTL)
    AnalysisCache.set(request.word, result);

    console.log(`[AI Success] ${request.word} - Provider: ${aiClient.provider}`);
    console.log(`[AI Success] Meanings 개수: ${result.meanings.length}`);

    return result;
  } catch (error) {
    console.error(`[AI Error] ${request.word}:`, error);
    console.error(`[AI Error] 에러 상세:`, error instanceof Error ? error.message : 'Unknown error');
    console.log(`[Fallback] Fallback 분석 사용: ${request.word}`);
    return getFallbackAnalysis(request);
  }
}

/**
 * 폴백 분석 생성
 *
 * AI API가 실패하거나 예산이 초과된 경우,
 * 패턴 매칭 기반 기본 분석을 제공합니다.
 *
 * Phase 1: AI 전용 시스템으로 전환됨에 따라
 * 폴백 시에는 빈 음절 객체와 빈 meanings 배열을 반환합니다.
 *
 * @param request - 단어 분석 요청
 * @returns 기본 분석 결과
 */
function getFallbackAnalysis(request: WordAnalysisRequest): WordAnalysisResponse {
  const morpheme = analyzeWithPatterns(request.word);

  // syllables를 빈 단일 객체로 반환
  const syllables: SyllabificationResult = {
    word: request.word,
    syllables: [],
    formatted: '',
    count: 0,
    source: 'ai',
  };

  // meanings를 빈 배열로 반환
  const meanings: MeaningEntry[] = [];

  return {
    morpheme,
    syllables,
    meanings,
  };
}

/**
 * 패턴 매칭 기반 형태소 분석
 *
 * 일반적인 접두사/접미사 패턴을 사용하여 기본 분석을 수행합니다.
 * AI API를 사용할 수 없을 때의 최소한의 정보를 제공합니다.
 *
 * @param word - 분석할 단어
 * @returns 형태소 분석 결과
 */
function analyzeWithPatterns(word: string): MorphemeAnalysis {
  const normalized = word.toLowerCase();
  const prefixes: { text: string; meaning?: string; meaningKo?: string }[] = [];
  const suffixes: { text: string; meaning?: string; meaningKo?: string }[] = [];

  // 일반적인 접두사 패턴
  const commonPrefixes = [
    { text: 'un', meaning: 'not', meaningKo: '아니다, 반대' },
    { text: 're', meaning: 'again', meaningKo: '다시, 재' },
    { text: 'pre', meaning: 'before', meaningKo: '이전, 미리' },
    { text: 'dis', meaning: 'not, opposite', meaningKo: '불, 반대' },
    { text: 'mis', meaning: 'wrongly', meaningKo: '잘못, 오' },
    { text: 'over', meaning: 'excessive', meaningKo: '과도, 초과' },
    { text: 'under', meaning: 'insufficient', meaningKo: '부족, 미달' },
  ];

  // 일반적인 접미사 패턴
  const commonSuffixes = [
    { text: 'tion', meaning: 'state or action', meaningKo: '상태, 행위' },
    { text: 'ment', meaning: 'result or action', meaningKo: '결과, 행위' },
    { text: 'ness', meaning: 'state or quality', meaningKo: '상태, 성질' },
    { text: 'able', meaning: 'capable of', meaningKo: '할 수 있는' },
    { text: 'ible', meaning: 'capable of', meaningKo: '할 수 있는' },
    { text: 'ful', meaning: 'full of', meaningKo: '가득한' },
    { text: 'less', meaning: 'without', meaningKo: '없는' },
    { text: 'ly', meaning: 'in a manner', meaningKo: '방식으로' },
    { text: 'er', meaning: 'one who', meaningKo: '하는 사람/것' },
    { text: 'est', meaning: 'most', meaningKo: '가장' },
  ];

  let root = normalized;

  // 접두사 확인
  for (const prefix of commonPrefixes) {
    if (normalized.startsWith(prefix.text) && normalized.length > prefix.text.length + 2) {
      prefixes.push(prefix);
      root = root.substring(prefix.text.length);
      break;
    }
  }

  // 접미사 확인 (긴 것부터 확인)
  for (const suffix of commonSuffixes.sort((a, b) => b.text.length - a.text.length)) {
    if (root.endsWith(suffix.text) && root.length > suffix.text.length + 2) {
      suffixes.push(suffix);
      root = root.substring(0, root.length - suffix.text.length);
      break;
    }
  }

  return {
    word,
    prefixes,
    root: { text: root },
    suffixes,
    derivations: [],
    source: 'fallback',
  };
}

