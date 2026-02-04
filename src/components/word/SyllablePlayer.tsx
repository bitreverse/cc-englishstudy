'use client';

/**
 * 음절 재생 컴포넌트
 *
 * 단어의 음절을 박스 버튼 형태로 표시하고 각 음절을 클릭하면 발음을 재생합니다.
 * 각 음절은 철자와 IPA 발음을 함께 표시합니다.
 *
 * 기능:
 * - 음절별 철자 + IPA 표시
 * - 음절 클릭 시 해당 음절 발음 재생
 * - 로딩/에러 상태 표시
 *
 * @module components/word/SyllablePlayer
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import type { SyllableInfo } from '@/types/syllable';

/**
 * SyllablePlayer Props
 */
interface SyllablePlayerProps {
  /** 발음할 단어 */
  word: string;
  /** 품사 (heteronym 구분용) */
  partOfSpeech: string;
  /** 전체 단어 IPA 발음 기호 */
  fullIpa: string;
  /** 음절 상세 정보 배열 (철자 + IPA) */
  syllables: SyllableInfo[];
  /** 전체 발음 개수 (heteronym 구분용) */
  totalPronunciations?: number;
  /** 발음 순서 인덱스 (0부터 시작, 색상 결정용) */
  pronunciationIndex?: number;
}

/**
 * SyllablePlayer 컴포넌트
 *
 * 음절별로 철자와 IPA를 함께 표시하고 클릭 시 발음을 재생합니다.
 *
 * @example
 * ```tsx
 * <SyllablePlayer
 *   word="computer"
 *   partOfSpeech="noun"
 *   fullIpa="/kəmˈpjuːtər/"
 *   syllables={[
 *     { text: "com", ipa: "kəm" },
 *     { text: "pu", ipa: "ˈpjuː" },
 *     { text: "ter", ipa: "tər" }
 *   ]}
 * />
 * ```
 */
export function SyllablePlayer({
  word,
  partOfSpeech,
  fullIpa,
  syllables,
  totalPronunciations = 1,
  pronunciationIndex = 0,
}: SyllablePlayerProps) {
  const {
    isLoading,
    error,
    play,
    stop,
    isItemPlaying,
    clearError,
  } = useTTS();

  // 현재 재생 중인 음절 인덱스
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  /**
   * 발음 순서별 색상 매핑
   *
   * Heteronym(다중 발음)인 경우 발음 순서별로 다른 색상을 적용하여
   * 시각적으로 구분합니다.
   *
   * @param index - 발음 순서 인덱스 (0부터 시작)
   * @returns Tailwind CSS 색상 클래스
   */
  const getColorClass = (index: number): string => {
    // 단일 발음인 경우 검정색
    if (totalPronunciations === 1) {
      return 'text-foreground';
    }

    // 다중 발음인 경우 발음 순서별 색상
    const colors = [
      'text-blue-600 dark:text-blue-400',      // 1st pronunciation
      'text-green-600 dark:text-green-400',    // 2nd pronunciation
      'text-purple-600 dark:text-purple-400',  // 3rd pronunciation
      'text-orange-600 dark:text-orange-400',  // 4th pronunciation
      'text-red-600 dark:text-red-400',        // 5th pronunciation
    ];

    return colors[index] || colors[0];
  };

  // 현재 발음의 색상 클래스
  const colorClass = getColorClass(pronunciationIndex || 0);

  /**
   * 음절 재생 핸들러
   *
   * 각 음절의 IPA를 사용하여 정확한 발음을 생성합니다.
   */
  const handlePlaySyllable = (syllable: SyllableInfo, index: number) => {
    const syllableKey = `${word}_${partOfSpeech}_syllable_${index}`;

    // 이미 재생 중이면 중지
    if (isItemPlaying(word, partOfSpeech, syllableKey)) {
      stop();
      setPlayingIndex(null);
      return;
    }

    // 새로운 음절 재생
    setPlayingIndex(index);

    // 음절 IPA를 사용하여 TTS 요청
    // phoneme 파라미터로 음절의 IPA를 전달
    play({
      word: syllable.text,
      partOfSpeech,
      ipa: `/${syllable.ipa}/`, // 슬래시 포함하여 표준 형식으로 전달
      phoneme: syllable.ipa.replace(/[ˈˌ]/g, ''), // 강세 기호 제거한 순수 IPA
    });
  };

  /**
   * 전체 단어 발음 재생 핸들러
   *
   * TTS API는 word, ipa 파라미터를 사용합니다.
   * phoneme은 개별 음소(음절)용이므로 전체 단어에는 전달하지 않습니다.
   * partOfSpeech는 클라이언트 측 캐시 키 식별용으로만 사용됩니다.
   */
  const handlePlayFullWord = () => {
    const fullWordKey = `${word}_${partOfSpeech}_full`;

    // 이미 재생 중이면 중지
    if (isItemPlaying(word, partOfSpeech, fullWordKey)) {
      stop();
      return;
    }

    // 전체 단어 발음 재생
    // TTS API 스키마: { word: string, ipa: string, phoneme?: string }
    // phoneme은 생략 (전체 단어에는 ipa만 사용)
    play({
      word,
      ipa: fullIpa,
      partOfSpeech, // 클라이언트 측 캐시 키 식별용
    });
  };

  const fullWordKey = `${word}_${partOfSpeech}_full`;
  const isFullWordPlaying = isItemPlaying(word, partOfSpeech, fullWordKey);
  const isFullWordLoading = isFullWordPlaying && isLoading;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* 음절 버튼 그룹 + 전체 단어 발음 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 음절 버튼들 */}
          {syllables.map((syllable, index) => {
            const syllableKey = `${word}_${partOfSpeech}_syllable_${index}`;
            const isSyllablePlaying = isItemPlaying(word, partOfSpeech, syllableKey);
            const isSyllableLoading = isSyllablePlaying && isLoading;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSyllablePlaying ? 'default' : 'outline'}
                    size="sm"
                    className="h-auto px-3 py-2 flex flex-col items-center gap-1 min-w-[60px]"
                    onClick={() => handlePlaySyllable(syllable, index)}
                    disabled={isLoading && !isSyllableLoading}
                    aria-label={`음절 ${syllable.text} 발음 재생`}
                  >
                    {isSyllableLoading && (
                      <Loader2 className="h-3 w-3 animate-spin mb-1" />
                    )}
                    <span className={`text-sm font-medium ${colorClass}`}>
                      {syllable.text}
                    </span>
                    <span className={`text-xs font-mono ${colorClass}`}>
                      /{syllable.ipa}/
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>음절 [{syllable.text}] 발음 재생</p>
                  <p className="text-xs text-muted-foreground">IPA: /{syllable.ipa}/</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* 전체 단어 발음 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isFullWordPlaying ? 'default' : 'secondary'}
                size="sm"
                className="h-auto px-4 py-2 flex flex-col items-center gap-1 min-w-[80px] border-2"
                onClick={handlePlayFullWord}
                disabled={isLoading && !isFullWordLoading}
                aria-label={`전체 단어 ${word} 발음 재생`}
              >
                {isFullWordLoading && (
                  <Loader2 className="h-3 w-3 animate-spin mb-1" />
                )}
                <span className={`text-sm font-semibold ${colorClass}`}>
                  {word}
                </span>
                <span className={`text-xs font-mono ${colorClass}`}>
                  {fullIpa}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>전체 단어 [{word}] 발음 재생</p>
              <p className="text-xs text-muted-foreground">IPA: {fullIpa}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-xs"
              onClick={clearError}
            >
              닫기
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
