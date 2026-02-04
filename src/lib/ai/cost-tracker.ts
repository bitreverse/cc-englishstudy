import type { APIUsageStats } from '@/types';
import { env } from '@/lib/env';

/**
 * AI API 비용 추적 클래스
 *
 * 월별 API 호출 횟수와 예상 비용을 추적하고, 예산 초과 여부를 감지합니다.
 * 서버 메모리에 상태를 유지하며, 매월 자동으로 리셋됩니다.
 */
class CostTracker {
  private usage: APIUsageStats = {
    totalCalls: 0,
    estimatedCost: 0,
    monthlyBudget: env.AI_MONTHLY_BUDGET,
    lastResetMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
  };

  /**
   * AI 모델별 토큰당 비용 (USD per 1M tokens)
   */
  private readonly COSTS: Record<string, { input: number; output: number }> = {
    'gpt-4o': {
      input: 2.50,
      output: 10.0,
    },
    'gpt-4o-mini': {
      input: 0.15,
      output: 0.6,
    },
    'claude-3-5-sonnet-20241022': {
      input: 3.0,
      output: 15.0,
    },
    'gemini-2.0-flash-exp': {
      input: 0.10,
      output: 0.40,
    },
    'gemini-1.5-flash': {
      input: 0.075,
      output: 0.30,
    },
  };

  /**
   * API 호출 추적 및 비용 계산
   *
   * @param model - AI 모델 이름 (예: 'gpt-4o', 'gpt-4o-mini')
   * @param inputTokens - 입력 토큰 수
   * @param outputTokens - 출력 토큰 수
   */
  trackCall(model: string, inputTokens: number, outputTokens: number): void {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 월이 바뀌면 리셋
    if (currentMonth !== this.usage.lastResetMonth) {
      this.reset(currentMonth);
    }

    const cost = this.calculateCost(model, inputTokens, outputTokens);
    this.usage.totalCalls++;
    this.usage.estimatedCost += cost;
  }

  /**
   * 토큰 수에 따른 비용 계산
   *
   * @param model - AI 모델 이름
   * @param inputTokens - 입력 토큰 수
   * @param outputTokens - 출력 토큰 수
   * @returns 예상 비용 (USD)
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs = this.COSTS[model];
    if (!costs) {
      // 모델을 찾을 수 없으면 gpt-4o-mini 기본값 사용
      console.warn(`[CostTracker] Unknown model "${model}", using gpt-4o-mini costs`);
      return (inputTokens * 0.15) / 1000000 + (outputTokens * 0.6) / 1000000;
    }
    return (inputTokens * costs.input) / 1000000 + (outputTokens * costs.output) / 1000000;
  }

  /**
   * 예산 초과 여부 확인
   *
   * @returns 예산 초과 시 true
   */
  isBudgetExceeded(): boolean {
    return this.usage.estimatedCost >= this.usage.monthlyBudget;
  }

  /**
   * 예산 경고 여부 확인 (80% 도달)
   *
   * @returns 예산의 80%에 도달했을 경우 true
   */
  isBudgetWarning(): boolean {
    return this.usage.estimatedCost >= this.usage.monthlyBudget * 0.8;
  }

  /**
   * 현재 사용량 통계 조회
   *
   * @returns API 사용 통계
   */
  getStats(): APIUsageStats {
    return { ...this.usage };
  }

  /**
   * 월별 사용량 리셋
   *
   * @param newMonth - 새 월 (YYYY-MM 형식)
   */
  private reset(newMonth: string): void {
    this.usage = {
      totalCalls: 0,
      estimatedCost: 0,
      monthlyBudget: env.AI_MONTHLY_BUDGET,
      lastResetMonth: newMonth,
    };
  }

  /**
   * 예상 호출 비용 계산 (실제 호출 전 예측용)
   *
   * @param model - AI 모델 이름
   * @param estimatedInputTokens - 예상 입력 토큰 수
   * @param estimatedOutputTokens - 예상 출력 토큰 수
   * @returns 예상 비용 (USD)
   */
  estimateCost(
    model: string,
    estimatedInputTokens: number = 200,
    estimatedOutputTokens: number = 500
  ): number {
    return this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const costTracker = new CostTracker();
