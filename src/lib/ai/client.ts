import type { AIProviderConfig, WordAnalysisRequest, WordAnalysisResponse, AIProvider } from '@/types';
import { env } from '@/lib/env';

/**
 * AI 클라이언트 인터페이스
 *
 * 모든 AI 프로바이더가 구현해야 하는 공통 인터페이스입니다.
 * 팩토리 패턴을 통해 프로바이더별 구현체를 생성합니다.
 */
export interface AIClient {
  /**
   * 단어 분석 실행
   *
   * @param request - 단어 분석 요청
   * @returns 분석 결과
   */
  analyzeWord(request: WordAnalysisRequest): Promise<WordAnalysisResponse>;

  /**
   * API 호출 비용 예측
   *
   * @param request - 단어 분석 요청
   * @returns 예상 비용 (USD)
   */
  estimateCost(request: WordAnalysisRequest): number;

  /**
   * AI 프로바이더 이름
   */
  readonly provider: AIProvider;
}

/**
 * AI 클라이언트 팩토리 함수
 *
 * 환경 변수 또는 설정에 따라 적절한 AI 클라이언트를 생성합니다.
 * 지원 프로바이더: OpenAI, Anthropic
 *
 * @param config - AI 프로바이더 설정 (선택적, 기본값은 환경 변수 사용)
 * @returns AI 클라이언트 인스턴스
 * @throws {Error} 알 수 없는 프로바이더인 경우
 *
 * @example
 * ```typescript
 * // 환경 변수 기반 생성
 * const client = createAIClient();
 *
 * // 특정 프로바이더 지정
 * const openaiClient = createAIClient({ provider: 'openai' });
 * const anthropicClient = createAIClient({ provider: 'anthropic' });
 * ```
 */
export function createAIClient(config?: Partial<AIProviderConfig>): AIClient {
  const provider = config?.provider || env.AI_PROVIDER;

  switch (provider) {
    case 'openai': {
      // Dynamic import to avoid loading unused client
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OpenAIClient } = require('./openai-client');
      return new OpenAIClient(config);
    }
    case 'anthropic': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { AnthropicClient } = require('./anthropic-client');
      return new AnthropicClient(config);
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
