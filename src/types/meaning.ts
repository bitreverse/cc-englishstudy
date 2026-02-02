import { z } from 'zod';

/**
 * 예시문 타입
 *
 * 영어 예문과 한국어 번역을 포함합니다.
 */
export interface MeaningExample {
  /** 영어 예문 */
  en: string;
  /** 한국어 번역 */
  ko: string;
}

/**
 * 품사별 상세 정보 타입
 *
 * AI API를 통해 분석된 단어의 품사별 정의, 발음, 예시문, 유의어, 반의어 정보를 나타냅니다.
 */
export interface MeaningEntry {
  /** 품사 (예: "verb", "noun", "adjective") */
  partOfSpeech: string;
  /** US IPA 발음 기호 (예: "/pərˈmɪt/") */
  ipa: string;
  /** 영어 정의 */
  definitionEn: string;
  /** 한국어 정의 */
  definitionKo: string;
  /** 예시문 배열 */
  examples: MeaningExample[];
  /** 유의어 배열 */
  synonyms: string[];
  /** 반의어 배열 */
  antonyms: string[];
}

/**
 * MeaningExample Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const MeaningExampleSchema = z.object({
  en: z.string(),
  ko: z.string(),
});

/**
 * MeaningEntry Zod 스키마
 *
 * 런타임 타입 검증을 위한 스키마입니다.
 */
export const MeaningEntrySchema = z.object({
  partOfSpeech: z.string(),
  ipa: z.string(),
  definitionEn: z.string(),
  definitionKo: z.string(),
  examples: z.array(MeaningExampleSchema),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
});
