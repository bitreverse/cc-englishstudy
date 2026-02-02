import { z } from 'zod';
import OpenAI from 'openai';
import type { AIProviderConfig, WordAnalysisRequest, WordAnalysisResponse } from '@/types';
import { WordAnalysisResponseSchema } from '@/types/ai';
import { env } from '@/lib/env';
import { createAnalysisPrompt } from './prompts';
import { costTracker } from './cost-tracker';
import type { AIClient } from './client';

/**
 * OpenAI API 클라이언트
 *
 * GPT-4o-mini 모델을 사용하여 단어 분석을 수행합니다.
 * JSON 모드를 사용하여 파싱 안정성을 확보합니다.
 */
export class OpenAIClient implements AIClient {
  private client: OpenAI;
  readonly provider = 'openai' as const;

  constructor(config?: Partial<AIProviderConfig>) {
    const apiKey = config?.apiKey || env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({
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
      const response = await this.client.chat.completions.create({
        model: env.AI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a linguistic analysis expert specializing in English word structure, phonics, morphology, and translation to Korean. Provide accurate, educational content in JSON format.',
          },
          {
            role: 'user',
            content: createAnalysisPrompt(request),
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500, // 증가: 전체 JSON 응답을 받기 위해
        temperature: 0.3, // 일관성을 위해 낮은 온도 설정
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI API');
      }

      // 비용 추적 (모델명 전달)
      const usage = response.usage;
      if (usage) {
        costTracker.trackCall(env.AI_MODEL, usage.prompt_tokens, usage.completion_tokens);
      }

      // JSON 파싱 및 Zod 검증
      try {
        const parsed = JSON.parse(content);

        // Zod 검증 추가
        const validated = WordAnalysisResponseSchema.parse(parsed);

        return validated;
      } catch (parseError) {
        // 파싱 또는 검증 에러
        console.error('[OpenAI JSON Parse/Validation Error]');
        console.error('Response content:', content);
        console.error('Error:', parseError);

        // Zod 검증 에러인 경우 상세 정보 로깅
        if (parseError instanceof z.ZodError) {
          console.error('Validation errors:', parseError.issues);
        }

        throw parseError;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * API 호출 비용 예측
   *
   * GPT-4o 요금 기준 (2026-01 기준):
   * - Input: $2.50 per 1M tokens
   * - Output: $10.00 per 1M tokens
   *
   * @param request - 단어 분석 요청
   * @returns 예상 비용 (USD)
   */
  estimateCost(_request: WordAnalysisRequest): number {
    // 평균 토큰 수 예측
    const estimatedInputTokens = 200; // 프롬프트 + 단어 정보
    const estimatedOutputTokens = 1500; // max_tokens 설정값

    return costTracker.estimateCost(env.AI_MODEL, estimatedInputTokens, estimatedOutputTokens);
  }
}
