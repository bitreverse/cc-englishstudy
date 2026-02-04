import { ErrorMessage } from '@/components/ErrorMessage';
import { SearchTracker } from '@/components/SearchTracker';
import { WordSearchResult } from '@/components/word/WordSearchResult';
import { searchWord } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/constants';
import type { WordAnalysisResponse, Phonetic, Meaning } from '@/types';

/**
 * SearchResult Props
 */
interface SearchResultProps {
  /** 검색할 단어 */
  word: string;
}

/**
 * IPA 표기를 정규화하는 헬퍼 함수
 *
 * 슬래시, 공백, 특수 기호를 제거하여 비교 가능한 형태로 변환합니다.
 *
 * @param ipa - IPA 표기 (예: "/pərˈmɪt/" 또는 "pərˈmɪt")
 * @returns 정규화된 IPA (예: "pərmɪt")
 */
function normalizeIPA(ipa: string): string {
  return ipa
    .replace(/[\/\s\(\)]/g, '') // 슬래시, 공백, 괄호 제거
    .replace(/[ˈˌ]/g, '') // 강세 기호 제거 (비교 시)
    .toLowerCase();
}

/**
 * 발음 정보에서 품사를 추론하는 헬퍼 함수 (AI meanings와 매칭)
 *
 * Free Dictionary API의 phonetics.text(IPA)를 AI meanings의 ipa와 매칭하여
 * 정확한 품사를 반환합니다. 매칭 실패 시 첫 번째 품사를 반환합니다.
 *
 * @param phonetic - Free Dictionary API의 발음 정보
 * @param meanings - Free Dictionary API의 품사별 의미 배열
 * @param aiMeanings - AI 분석 결과의 품사별 의미 배열 (IPA 포함)
 * @returns 추론된 품사 (없으면 undefined)
 */
function inferPartOfSpeech(
  phonetic: Phonetic,
  meanings: Meaning[],
  aiMeanings?: { partOfSpeech: string; ipa: string }[]
): string | undefined {
  // AI meanings가 있고 phonetic.text가 있으면 IPA 매칭 시도
  if (aiMeanings && phonetic.text) {
    const normalizedPhonetic = normalizeIPA(phonetic.text);

    // AI meanings의 각 IPA와 비교
    for (const aiMeaning of aiMeanings) {
      const normalizedAiIPA = normalizeIPA(aiMeaning.ipa);

      // 정규화된 IPA가 일치하면 해당 품사 반환
      if (normalizedPhonetic === normalizedAiIPA) {
        return aiMeaning.partOfSpeech;
      }
    }
  }

  // 매칭 실패 시 Free Dictionary API의 첫 번째 품사 반환 (폴백)
  return meanings[0]?.partOfSpeech;
}

/**
 * 검색 결과 컴포넌트 (비동기 서버 컴포넌트)
 *
 * Free Dictionary API를 호출하여 단어의 검색 결과를 표시합니다.
 * Suspense와 함께 사용되어 로딩 상태를 표시할 수 있습니다.
 *
 * @param word - 검색할 단어
 */
export async function SearchResult({ word }: SearchResultProps) {
  // Free Dictionary API 호출
  const result = await searchWord(word);

  // 에러 처리 (early return)
  if (!result.success) {
    const errorMessage = result.error === 'NOT_FOUND'
      ? ERROR_MESSAGES.WORD_NOT_FOUND
      : '오류가 발생했습니다. 다시 시도해주세요.';
    return <ErrorMessage message={errorMessage} />;
  }

  // AI 분석 데이터 가져오기 (비동기)
  // Phase 1: AI 전용 음절 분리 시스템으로 전환
  // POST 방식으로 phonetics 및 품사 정보 포함
  let analysis: WordAnalysisResponse | null = null;
  try {
    // Free Dictionary API의 정의와 예문, 품사 추출
    const definitions: string[] = [];
    const examples: string[] = [];
    const partsOfSpeech = new Set<string>();

    result.data[0]?.meanings?.forEach((meaning) => {
      partsOfSpeech.add(meaning.partOfSpeech);
      meaning.definitions.forEach((def) => {
        definitions.push(def.definition);
        if (def.example) {
          examples.push(def.example);
        }
      });
    });

    // phonetics에 품사 정보 매핑
    // Free Dictionary API는 phonetics에 partOfSpeech를 제공하지 않으므로
    // meanings의 품사 정보를 기반으로 AI가 판단하도록 함
    const phonetics = result.data.flatMap((entry) =>
      entry.phonetics?.map((p) => ({
        text: p.text,
        audio: p.audio,
        // 품사 정보는 AI 프롬프트에서 meanings 기반으로 추론
      })) || []
    ).filter((p) => p.text); // text가 있는 것만 포함

    // POST 요청으로 phonetics 및 품사 정보 포함
    console.log('[SearchResult] ===== AI 분석 요청 시작 =====');
    console.log('[SearchResult] 단어:', word);
    console.log('[SearchResult] Definitions:', definitions.length);
    console.log('[SearchResult] Examples:', examples.length);
    console.log('[SearchResult] Phonetics:', phonetics.length);

    const analysisResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/words/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          definitions: definitions.slice(0, 3), // 최대 3개
          examples: examples.slice(0, 2), // 최대 2개
          phonetics: phonetics,
        }),
        cache: 'no-store', // 개발 중에는 캐시 비활성화 (배포 시 next: { revalidate: 3600 } 사용)
      }
    );

    console.log('[SearchResult] 응답 상태:', analysisResponse.status, analysisResponse.statusText);

    if (analysisResponse.ok) {
      const analysisJson = await analysisResponse.json();
      console.log('[SearchResult] 응답 JSON success:', analysisJson.success);

      if (analysisJson.success) {
        analysis = analysisJson.data;
        console.log('[SearchResult] Analysis meanings 개수:', analysis?.meanings?.length || 0);
      } else {
        console.error('[SearchResult] API returned success: false');
        console.error('[SearchResult] Error:', analysisJson.error);
      }
    } else {
      const errorText = await analysisResponse.text();
      console.error('[SearchResult] API 요청 실패:', analysisResponse.status);
      console.error('[SearchResult] Error response:', errorText);
    }

    console.log('[SearchResult] ===== AI 분석 요청 완료 =====');
  } catch (error) {
    console.error('[SearchResult] ❌ AI analysis fetch error:', error);
    // AI 분석 실패 시 기존 기능에 영향 없음
  }

  // phoneticsWithAudio 준비 (발음 재생용)
  // AI 분석 이후에 준비하여 meanings의 IPA와 매칭
  const phoneticsWithAudio = result.data.flatMap((entry) =>
    entry.phonetics?.map((p) => ({
      text: p.text,
      audio: p.audio,
      partOfSpeech: inferPartOfSpeech(p, entry.meanings, analysis?.meanings),
    })) || []
  ).filter((p) => p.text);

  return (
    <>
      {/* 검색 성공 시 검색 기록에 추가 */}
      <SearchTracker word={word} />

      {/* 통합 단어 분석 (헤더 + 형태소/어원 + 품사별 상세 정보) */}
      <WordSearchResult
        analysis={analysis}
        isLoading={false}
        word={word}
        phoneticsWithAudio={phoneticsWithAudio}
      />
    </>
  );
}
