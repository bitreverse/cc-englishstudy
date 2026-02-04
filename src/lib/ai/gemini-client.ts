import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProviderConfig, WordAnalysisRequest, WordAnalysisResponse } from '@/types';
import { WordAnalysisResponseSchema } from '@/types/ai';
import { env } from '@/lib/env';
import { createAnalysisPrompt } from './prompts';
import { costTracker } from './cost-tracker';
import type { AIClient } from './client';

/**
 * Google Gemini API 클라이언트
 *
 * Gemini 2.0 Flash 모델을 사용하여 단어 분석을 수행합니다.
 * JSON 모드를 사용하여 파싱 안정성을 확보합니다.
 */
export class GeminiClient implements AIClient {
  private genAI: GoogleGenerativeAI;
  readonly provider = 'gemini' as const;

  constructor(config?: Partial<AIProviderConfig>) {
    const apiKey = config?.apiKey || env.GOOGLE_API_KEY;

    console.log('[GeminiClient] Constructor 호출');
    console.log('[GeminiClient] config?.apiKey:', config?.apiKey ? '✅ 설정됨' : '❌ 없음');
    console.log('[GeminiClient] env.GOOGLE_API_KEY:', env.GOOGLE_API_KEY ? '✅ 설정됨' : '❌ 없음');
    console.log('[GeminiClient] 최종 apiKey:', apiKey ? `✅ 설정됨 (${apiKey.substring(0, 10)}...)` : '❌ 없음');

    if (!apiKey) {
      console.error('[GeminiClient] ❌ GOOGLE_API_KEY is not configured!');
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log('[GeminiClient] ✅ GoogleGenerativeAI 인스턴스 생성 완료');
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
      console.log('[Gemini] ===== API 호출 시작 =====');
      console.log('[Gemini] 단어:', request.word);
      console.log('[Gemini] 모델:', env.GEMINI_MODEL);

      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3, // 일관성을 위해 낮은 온도 설정
          maxOutputTokens: 1500, // 전체 JSON 응답을 받기 위해
        },
      });

      // System instruction과 user prompt 결합
      const prompt = `You are a linguistic analysis expert specializing in English word structure, phonics, morphology, and translation to Korean. Provide accurate, educational content in JSON format.

${createAnalysisPrompt(request)}`;

      console.log('[Gemini] 프롬프트 길이:', prompt.length);

      const result = await model.generateContent(prompt);
      const response = result.response;

      // 응답 텍스트 추출
      const content = response.text();
      if (!content) {
        throw new Error('No response content from Gemini API');
      }

      console.log('[Gemini] 응답 받음 - 길이:', content.length);
      console.log('[Gemini] 응답 내용 (처음 500자):', content.substring(0, 500));

      // 토큰 사용량 추적
      const usageMetadata = response.usageMetadata;
      if (usageMetadata) {
        const inputTokens = usageMetadata.promptTokenCount || 0;
        const outputTokens = usageMetadata.candidatesTokenCount || 0;
        console.log('[Gemini] 토큰 사용량 - Input:', inputTokens, 'Output:', outputTokens);
        costTracker.trackCall(env.GEMINI_MODEL, inputTokens, outputTokens);
      }

      // JSON 파싱 및 Zod 검증
      try {
        const parsed = JSON.parse(content);
        console.log('[Gemini] JSON 파싱 성공');

        // Zod 검증 추가
        const validated = WordAnalysisResponseSchema.parse(parsed);
        console.log('[Gemini] Zod 검증 성공');
        console.log('[Gemini] meanings 개수:', validated.meanings.length);
        console.log('[Gemini] ===== API 호출 완료 =====');

        return validated;
      } catch (parseError) {
        // 파싱 또는 검증 에러
        console.error('[Gemini] ❌ JSON Parse/Validation Error');
        console.error('[Gemini] Response content:', content);
        console.error('[Gemini] Error:', parseError);

        // Zod 검증 에러인 경우 상세 정보 로깅
        if (parseError instanceof z.ZodError) {
          console.error('[Gemini] Validation errors:', JSON.stringify(parseError.issues, null, 2));
        }

        throw parseError;
      }
    } catch (error) {
      console.error('[Gemini] ❌ API 호출 실패:', error);
      if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * API 호출 비용 예측
   *
   * Gemini 2.0 Flash 요금 기준 (2026-01 기준):
   * - Input: $0.10 per 1M tokens (128k 이하)
   * - Output: $0.40 per 1M tokens (128k 이하)
   *
   * @param request - 단어 분석 요청
   * @returns 예상 비용 (USD)
   */
  estimateCost(_request: WordAnalysisRequest): number {
    // 평균 토큰 수 예측
    const estimatedInputTokens = 200; // 프롬프트 + 단어 정보
    const estimatedOutputTokens = 1500; // max_tokens 설정값

    return costTracker.estimateCost(env.GEMINI_MODEL, estimatedInputTokens, estimatedOutputTokens);
  }
}
