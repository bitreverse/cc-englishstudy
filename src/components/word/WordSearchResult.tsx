'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SyllablePlayer } from '@/components/word/SyllablePlayer';
import type { WordAnalysisResponse } from '@/types';

/**
 * WordSearchResult Props 인터페이스
 */
interface WordSearchResultProps {
  /** AI 분석 결과 */
  analysis: WordAnalysisResponse | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 메시지 */
  error?: string | null;
  /** 검색된 단어 */
  word: string;
  /** Free Dictionary API의 발음 정보 (오디오 URL 포함) */
  phoneticsWithAudio?: Array<{ text?: string; audio?: string; partOfSpeech?: string }>;
}

/**
 * 통합 단어 검색 결과 컴포넌트
 *
 * UI.md 기반의 새로운 통합 UI 구현
 * - 헤더 (단어 + 음절)
 * - Morpheme Analysis (형태소 분석)
 * - 품사별 상세 정보 + OpenAI TTS 발음 재생
 *
 * @param analysis - AI 분석 결과
 * @param isLoading - 로딩 상태
 * @param error - 에러 메시지
 * @param word - 검색된 단어
 */
export function WordSearchResult({
  analysis,
  isLoading = false,
  error = null,
  word,
}: WordSearchResultProps) {
  // 로딩 상태 UI
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">단어 분석</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          {/* Morpheme Analysis 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* 품사별 섹션 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태 UI
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">단어 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            분석을 불러올 수 없습니다: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 분석 결과가 없는 경우
  if (!analysis) {
    return null;
  }

  const { morpheme, syllables, meanings } = analysis;

  /**
   * 품사명의 첫 글자를 대문자로 변환
   */
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  /**
   * 전체 발음 개수 및 발음 순서 인덱스 맵핑
   *
   * 고유한 IPA 개수로 발음의 개수를 판단하고, 각 IPA의 순서를 추적합니다.
   * - 1개: 단일 발음 (검정색)
   * - 2개 이상: 다중 발음/Heteronym (발음 순서별 색상)
   *
   * 예:
   * - computer: 2개의 meanings이지만 IPA가 동일 → 단일 발음, index=0
   * - permit: 2개의 meanings이고 IPA가 다름 → 다중 발음
   *   - Noun /ˈpɜːrmɪt/: index=0 (파란색)
   *   - Verb /pərˈmɪt/: index=1 (녹색)
   */
  const uniqueIPAs: string[] = [];
  const ipaIndexMap = new Map<string, number>();

  meanings.forEach((m) => {
    if (!ipaIndexMap.has(m.ipa)) {
      ipaIndexMap.set(m.ipa, uniqueIPAs.length);
      uniqueIPAs.push(m.ipa);
    }
  });

  const totalPronunciations = uniqueIPAs.length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 헤더 영역: 단어 + 음절 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{word}</CardTitle>
          {syllables.formatted && (
            <p className="text-lg text-muted-foreground">
              {syllables.formatted}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Morpheme Analysis 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Morpheme Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 접두사 */}
          {morpheme.prefixes.length > 0 && morpheme.prefixes.map((prefix, idx) => (
            <div key={`prefix-${idx}`} className="space-y-1">
              <p className="text-sm font-medium">
                {prefix.text} (Prefix): {prefix.meaningKo}의 뜻을 가진{' '}
                {prefix.origin}
              </p>
            </div>
          ))}

          {/* 어근 */}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {morpheme.root.text} (Root): {morpheme.root.meaningKo}라는 의미의{' '}
              {morpheme.root.origin}에서 유래
            </p>
          </div>

          {/* 접미사 */}
          {morpheme.suffixes.length > 0 && morpheme.suffixes.map((suffix, idx) => (
            <div key={`suffix-${idx}`} className="space-y-1">
              <p className="text-sm font-medium">
                {suffix.text} (Suffix): {suffix.meaningKo}의 뜻을 가진{' '}
                {suffix.origin}
              </p>
            </div>
          ))}

          {/* 어원 */}
          {morpheme.etymology && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                → {morpheme.etymology}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 품사별 섹션 */}
      {meanings.map((meaning, idx) => {
        // 현재 meaning의 발음 순서 인덱스 (색상 결정용)
        const pronunciationIndex = ipaIndexMap.get(meaning.ipa) || 0;

        return (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                {idx + 1}. {capitalize(meaning.partOfSpeech)}
              </CardTitle>

              {/* 음절 발음 재생 (Syllable 구조) */}
              {meaning.ipa && (meaning.syllableDetails || syllables.syllableDetails) && (
                <SyllablePlayer
                  word={word}
                  partOfSpeech={meaning.partOfSpeech}
                  fullIpa={meaning.ipa}
                  syllables={meaning.syllableDetails || syllables.syllableDetails}
                  totalPronunciations={totalPronunciations}
                  pronunciationIndex={pronunciationIndex}
                />
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 영어 정의 */}
              <div>
                <p className="text-sm font-medium text-foreground">
                  <strong>(EN)</strong> {meaning.definitionEn}
                </p>
              </div>

              {/* 한국어 정의 */}
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>(KR)</strong> {meaning.definitionKo}
                </p>
              </div>

              {/* 예문 */}
              {meaning.examples.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-semibold">Examples:</p>
                  {meaning.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="ml-4 space-y-1">
                      <p className="text-sm">{ex.en}</p>
                      <p className="text-xs text-muted-foreground">({ex.ko})</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 유의어 */}
              {meaning.synonyms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm">
                    <span className="font-semibold">Synonyms:</span>{' '}
                    {meaning.synonyms.join(', ')}
                  </p>
                </div>
              )}

              {/* 반의어 */}
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-semibold">Antonyms:</span>{' '}
                  {meaning.antonyms.length > 0
                    ? meaning.antonyms.join(', ')
                    : '(없음)'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
