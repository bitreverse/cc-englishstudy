import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderConfig, WordAnalysisRequest, WordAnalysisResponse } from '@/types';
import { WordAnalysisResponseSchema } from '@/types/ai';
import { env } from '@/lib/env';
import { createAnalysisPrompt } from './prompts';
import { costTracker } from './cost-tracker';
import type { AIClient } from './client';

/**
 * Anthropic API 클라이언트
 *
 * Claude 3.5 Haiku 모델을 사용하여 단어 분석을 수행합니다.
 * JSON 응답을 파싱하여 구조화된 데이터를 제공합니다.
 */
export class AnthropicClient implements AIClient {
  private client: Anthropic;
  readonly provider = 'anthropic' as const;

  constructor(config?: Partial<AIProviderConfig>) {
    const apiKey = config?.apiKey || env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * 단어 분석 실행
   *
   * @param request - 단어 분석 요청
   * @returns 분석 결과
   * @throws {Error} API 호출 실패 시
   */
  async analyzeWord(request: WordAnalysisRequest): Promise<WordAnalysisResponse> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 500,
        temperature: 0.3, // 일관성을 위해 낮은 온도 설정
        system:
          'You are a linguistic analysis expert specializing in English word structure, phonics, morphology, and translation to Korean. Provide accurate, educational content in JSON format.',
        messages: [
          {
            role: 'user',
            content: createAnalysisPrompt(request),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic API');
      }

      // 비용 추적
      const usage = response.usage;
      if (usage) {
        costTracker.trackCall(this.provider, usage.input_tokens, usage.output_tokens);
      }

      // JSON 추출 (응답에 ```json으로 감싸져 있을 수 있음)
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*\n?/, '').replace(/\n?```$/, '');
      }

      // JSON 파싱 및 Zod 검증
      try {
        const parsed = JSON.parse(jsonText);

        // Zod 검증 추가
        const validated = WordAnalysisResponseSchema.parse(parsed);

        return validated;
      } catch (parseError) {
        // 파싱 또는 검증 에러
        console.error('[Anthropic JSON Parse/Validation Error]');
        console.error('Response content:', jsonText);
        console.error('Error:', parseError);

        // Zod 검증 에러인 경우 상세 정보 로깅
        if (parseError instanceof z.ZodError) {
          console.error('Validation errors:', parseError.issues);
        }

        throw parseError;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * API 호출 비용 예측
   *
   * Claude 3.5 Haiku 요금 기준:
   * - Input: $1.00 per 1M tokens
   * - Output: $5.00 per 1M tokens
   *
   * @param request - 단어 분석 요청
   * @returns 예상 비용 (USD)
   */
  estimateCost(_request: WordAnalysisRequest): number {
    // 평균 토큰 수 예측
    const estimatedInputTokens = 200; // 프롬프트 + 단어 정보
    const estimatedOutputTokens = 500; // max_tokens 설정값

    return costTracker.estimateCost(this.provider, estimatedInputTokens, estimatedOutputTokens);
  }
}
