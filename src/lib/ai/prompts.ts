import type { WordAnalysisRequest } from '@/types';
import { detectHeteronyms, isHeteronym } from '../heteronyms-detector';

/**
 * 통합 분석 프롬프트 생성 (Phase 1: 통합 질의)
 *
 * 1회 API 호출로 형태소 분석, 음절 분리, 품사별 상세 정보를 처리합니다.
 * US IPA 전용, heteronyms 처리, meanings 배열로 품사별 정보 통합.
 * JSON 형식으로 응답을 받아 파싱 안정성을 확보합니다.
 *
 * @param request - 단어 분석 요청 정보
 * @returns 통합 분석 프롬프트 문자열
 */
export function createAnalysisPrompt(request: WordAnalysisRequest): string {
  const { word, definitions = [], examples = [], phonetics = [] } = request;

  // Heteronym 감지
  const heteronymGroups = detectHeteronyms(word, phonetics);
  const hasHeteronyms = isHeteronym(heteronymGroups);

  let prompt = `Analyze the English word "${word}" and provide a comprehensive linguistic analysis in JSON format.

**CRITICAL REQUIREMENTS:**
- Use **US IPA only** (not UK IPA). For example: /ˈwɔːtər/ (UK) is WRONG, /ˈwɑːtər/ (US) is CORRECT.
- ${
    hasHeteronyms
      ? `**HETERONYM DETECTED**: This word has ${heteronymGroups.length} different pronunciations by part of speech:
${heteronymGroups.map((g) => `  - ${g.partOfSpeech}: ${g.pronunciation}`).join('\n')}
  Provide separate entries for EACH part of speech in meanings[] array.`
      : 'If the word is a **heteronym** (same spelling, different pronunciation/meaning by part of speech), provide separate entries for EACH part of speech in meanings[] array.'
  }

Return a JSON object with the following structure:

{
  "syllables": {
    "word": "${word}",
    "syllables": ["syl", "la", "bles"],
    "formatted": "syl·la·bles",
    "count": 3,
    "source": "ai"
  },
  "morpheme": {
    "word": "${word}",
    "prefixes": [{ "text": "", "meaning": "", "meaningKo": "", "origin": "" }],
    "root": { "text": "", "meaning": "", "meaningKo": "", "origin": "" },
    "suffixes": [{ "text": "", "meaning": "", "meaningKo": "", "origin": "" }],
    "derivations": [],
    "etymology": "",
    "source": "ai"
  },
  "meanings": [
    {
      "partOfSpeech": "noun",
      "ipa": "/ˈwɜrd/ (US IPA)",
      "definitionEn": "English definition",
      "definitionKo": "한국어 정의",
      "examples": [{ "en": "English example", "ko": "한국어 예문" }],
      "synonyms": ["word1", "word2"],
      "antonyms": ["opposite1"]
    }
  ]
}

Requirements:

1. **Syllabification**: Divide the word into syllables as a single result (not an array per part of speech).
   - Return ONE syllables object for the entire word

2. **Morpheme Analysis**: Break down into prefixes, root, and suffixes.
   - Include "origin" field for each part (e.g., "라틴어 per-", "그리스어 logos")
   - Provide meanings in both English and Korean
   - Add etymology field explaining the combined meaning

3. **Meanings (품사별 상세 정보)**: For EACH part of speech, provide:
   - partOfSpeech: Part of speech (e.g., "noun", "verb")
   - ipa: **US IPA notation ONLY** (e.g., "/ˈwɜrd/")
   - definitionEn: English definition
   - definitionKo: Korean translation of the definition
   - examples: Array of example sentences with translations [{ en: "...", ko: "..." }]
   - synonyms: Array of synonyms (max 5)
   - antonyms: Array of antonyms (max 5, empty array if none)

4. **For heteronyms**: Provide separate entries in meanings[] with different IPA for each part of speech.`;

  if (definitions.length > 0) {
    prompt += `\n\nUse these definitions for context: ${definitions.slice(0, 3).join('; ')}`;
  }
  if (examples.length > 0) {
    prompt += `\nUse these examples for context: ${examples.slice(0, 2).join('; ')}`;
  }

  prompt += '\n\nProvide accurate, educational content suitable for English learners. Ensure all Korean translations are natural and clear.';
  prompt += '\n\n**REMINDER**: US IPA only, handle heteronyms with separate meanings[] entries, include origin for all morpheme parts.';

  return prompt;
}
