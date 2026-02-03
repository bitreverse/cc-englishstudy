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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* 음절 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">음절:</span>
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
                    <span className="text-sm font-medium">{syllable.text}</span>
                    <span className="text-xs text-muted-foreground font-mono">
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
        </div>

        {/* 전체 IPA 표시 */}
        <div className="text-xs text-muted-foreground ml-14">
          전체 발음: {fullIpa}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 ml-14 text-xs text-destructive">
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
