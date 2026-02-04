'use client';

/**
 * 발음 재생 컴포넌트
 *
 * 단어의 전체 발음과 Phonics(음소)별 개별 발음을 재생하는 UI를 제공합니다.
 * Heteronym(동철이음어)의 경우 품사에 따른 정확한 발음을 지원합니다.
 *
 * 기능:
 * - 전체 IPA 발음 표시 및 재생
 * - Phonics별 발음 기호 표시 및 개별 재생
 * - 발음 품질 신고 ("발음이 이상해요")
 * - 로딩/에러 상태 표시
 *
 * @module components/word/PronunciationPlayer
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
  Volume2,
  Loader2,
  AlertTriangle,
  Check,
  Square,
} from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

/**
 * PronunciationPlayer Props
 */
interface PronunciationPlayerProps {
  /** 발음할 단어 */
  word: string;
  /** 품사 (heteronym 구분용) */
  partOfSpeech: string;
  /** IPA 발음 기호 (예: "/pərˈmɪt/") */
  ipa: string;
}

/**
 * IPA 자음 목록
 *
 * 파열음, 마찰음, 비음, 유음, 반모음, 파찰음 등을 포함합니다.
 * 긴 음소(tʃ, dʒ)가 먼저 매칭되도록 길이 내림차순으로 정렬됩니다.
 */
const IPA_CONSONANTS = [
  'tʃ', 'dʒ', // 파찰음 (2문자를 먼저 검사)
  'p', 'b', 't', 'd', 'k', 'g', // 파열음
  'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', // 마찰음
  'm', 'n', 'ŋ', // 비음
  'l', 'r', // 유음
  'j', 'w', // 반모음
];

/**
 * IPA 모음 목록
 *
 * 단모음, 장모음, 이중모음, r-colored 모음을 포함합니다.
 * 긴 음소가 먼저 매칭되도록 길이 내림차순으로 정렬됩니다.
 */
const IPA_VOWELS = [
  // R-colored vowels (3문자 - 장모음+r)
  'ɜːr', 'ɑːr', 'ɔːr', 'iːr', 'uːr',
  // 장모음 (2문자)
  'iː', 'ɑː', 'ɔː', 'uː', 'ɜː', 'eː',
  // 이중모음 (2문자)
  'aɪ', 'aʊ', 'eɪ', 'oɪ', 'oʊ',
  // 중화 이중모음 (2문자)
  'ɪə', 'eə', 'ʊə',
  // R-colored vowels (2문자 - 단모음+r)
  'ər', 'ɜr', 'ɑr', 'ɔr', 'ɪr', 'ʊr', 'ɛr',
  // 단모음 (1문자)
  'i', 'ɪ', 'e', 'ɛ', 'æ', 'ɑ', 'ɒ', 'ɔ', 'o',
  'ʊ', 'u', 'ʌ', 'ə', 'ɜ',
];

/**
 * IPA 음소가 자음인지 판별
 *
 * @param phoneme - 강세 기호가 포함될 수 있는 IPA 음소
 * @returns 자음이면 'C', 모음이면 'V', 판별 불가시 null
 */
function getPhonemeType(phoneme: string): 'C' | 'V' | null {
  const clean = phoneme.replace(/[ˈˌ]/g, '');

  // 모음 검사 (긴 패턴 먼저)
  for (const v of IPA_VOWELS) {
    if (clean === v) return 'V';
  }

  // 자음 검사 (긴 패턴 먼저)
  for (const c of IPA_CONSONANTS) {
    if (clean === c) return 'C';
  }

  // r-colored 모음 패턴 (ər 등)
  if (clean.endsWith('r') && clean.length >= 2) {
    const base = clean.slice(0, -1);
    for (const v of IPA_VOWELS) {
      if (base === v) return 'V';
    }
  }

  return null;
}

/**
 * IPA 문자열을 Phonics 단위로 분할
 *
 * IPA 표기에서 슬래시를 제거하고 음소별로 분할합니다.
 * 이중 모음, 장모음 기호 등을 고려하여 정확히 분할합니다.
 *
 * @param ipa - IPA 발음 기호 (예: "/pərˈmɪt/")
 * @returns 분할된 음소 배열 (예: ["p", "ər", "ˈm", "ɪ", "t"])
 */
function splitIPAToPhonemes(ipa: string): string[] {
  // 슬래시, 대괄호 제거
  const cleaned = ipa.replace(/[\/\[\]]/g, '').trim();
  if (!cleaned) return [];

  const phonemes: string[] = [];
  let i = 0;

  while (i < cleaned.length) {
    const char = cleaned[i];
    let phoneme = '';

    // 강세 기호는 다음 음소에 붙임
    if (char === 'ˈ' || char === 'ˌ') {
      phoneme = char;
      i++;
      if (i < cleaned.length) {
        phoneme += cleaned[i];
        i++;
      }
    } else {
      phoneme = char;
      i++;
    }

    // 연결 기호, 길이 기호 등을 현재 음소에 포함
    while (i < cleaned.length) {
      const next = cleaned[i];
      // 길이 기호 (ː), 비음화 (̃), r-색채 (˞), 연결호(͡) 등
      if (
        next === 'ː' || next === '̃' || next === '˞' || next === '͡' ||
        next === 'ʰ' || next === 'ʷ' || next === 'ʲ' || next === 'ˠ'
      ) {
        phoneme += next;
        i++;
      }
      // r-colored vowel: 모음 + r 조합 (장모음 포함)
      // ɜːr, ɑːr, ɔːr, ər, ɑr 등
      else if (next === 'r') {
        // 강세 기호를 제거하고 기본 모음만 추출
        const basePhoneme = phoneme.replace(/[ˈˌ]/g, '');
        // r-colored vowel이 될 수 있는 모음 패턴
        // 장모음(ː 포함) 또는 단모음 + r
        const canBeRColored =
          'əɜɑɔɪʊɛ'.includes(basePhoneme.replace('ː', '')) ||
          basePhoneme.match(/^[əɜɑɔɪʊɛ]ː?$/);

        if (canBeRColored) {
          phoneme += next;
          i++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (phoneme.trim()) {
      phonemes.push(phoneme);
    }
  }

  return phonemes;
}

/**
 * PronunciationPlayer 컴포넌트
 *
 * 전체 발음과 Phonics별 개별 발음을 재생하는 통합 UI입니다.
 *
 * @example
 * ```tsx
 * <PronunciationPlayer
 *   word="permit"
 *   partOfSpeech="noun"
 *   ipa="/ˈpɜːrmɪt/"
 * />
 * ```
 */
export function PronunciationPlayer({
  word,
  partOfSpeech,
  ipa,
}: PronunciationPlayerProps) {
  const {
    isLoading,
    error,
    isReporting,
    reported,
    play,
    stop,
    report,
    isItemPlaying,
    clearError,
  } = useTTS();

  // 신고 확인 다이얼로그 상태
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  // IPA를 Phonics 단위로 분할
  const phonemes = splitIPAToPhonemes(ipa);

  /**
   * 전체 발음 재생 핸들러
   *
   * 주의: context(예문)는 절대 전달하지 않습니다.
   * TTS는 단어만 발음해야 하며, 품사 정보만으로 heteronym을 구분합니다.
   */
  const handlePlayFull = () => {
    if (isItemPlaying(word, partOfSpeech)) {
      stop();
      return;
    }

    play({
      word,
      partOfSpeech,
      ipa,
      // context는 전달하지 않음 - 단어만 발음
    });
  };

  /**
   * 개별 Phonics 재생 핸들러
   *
   * 원본 IPA 음소를 phoneme 파라미터로 전달하면
   * 서버 API에서 음소별 프롬프트를 생성하여 정확한 발음을 유도합니다.
   */
  const handlePlayPhoneme = (phoneme: string) => {
    if (isItemPlaying(word, partOfSpeech, phoneme)) {
      stop();
      return;
    }

    // 강세 기호를 제거한 순수 음소를 phoneme으로 전달
    // 서버 API의 buildPhonemeInput에서 음소별 프롬프트를 생성
    const cleanPhoneme = phoneme.replace(/[ˈˌ]/g, '');
    play({
      word,
      partOfSpeech,
      ipa, // IPA는 필수 파라미터
      phoneme: cleanPhoneme,
    });
  };

  /**
   * 발음 신고 핸들러
   */
  const handleReport = async () => {
    setShowReportConfirm(false);
    await report({ word, partOfSpeech });
  };

  // 전체 발음 재생 중 여부
  const isFullPlaying = isItemPlaying(word, partOfSpeech) && !isLoading;
  const isFullLoading = isItemPlaying(word, partOfSpeech) && isLoading;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-2">
        {/* 전체 IPA + 재생 버튼 */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handlePlayFull}
                disabled={isLoading && !isFullLoading}
                aria-label={
                  isFullPlaying ? '재생 중지' : `${word} ${partOfSpeech} 발음 재생`
                }
              >
                {isFullLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFullPlaying ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullPlaying ? '재생 중지' : '전체 발음 재생'}</p>
            </TooltipContent>
          </Tooltip>

          <span className="text-sm text-muted-foreground">
            {ipa}
          </span>

          {/* 신고 버튼 */}
          {!showReportConfirm ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setShowReportConfirm(true)}
                  disabled={isReporting || reported}
                >
                  {reported ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      접수됨
                    </>
                  ) : isReporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      발음이 이상해요
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>발음 품질에 문제가 있으면 신고해주세요</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">정말 신고할까요?</span>
              <Button
                variant="destructive"
                size="sm"
                className="h-5 px-2 text-xs"
                onClick={handleReport}
              >
                네
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs"
                onClick={() => setShowReportConfirm(false)}
              >
                아니오
              </Button>
            </div>
          )}
        </div>

        {/* Phonics별 발음 */}
        {phonemes.length > 1 && (
          <div className="flex flex-wrap items-center gap-1 ml-10">
            <span className="text-xs text-muted-foreground mr-1">Phonics:</span>
            {phonemes.map((phoneme, idx) => {
              // 강세 기호를 제거한 음소로 비교 (play 시 cleanPhoneme을 전달하므로)
              const cleanPhoneme = phoneme.replace(/[ˈˌ]/g, '');
              const isPhonPlaying = isItemPlaying(word, partOfSpeech, cleanPhoneme);
              const isPhonLoading =
                isItemPlaying(word, partOfSpeech, cleanPhoneme) && isLoading;

              const phonemeType = getPhonemeType(phoneme);

              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-0.5">
                      <Button
                        variant={isPhonPlaying ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 px-2 text-xs font-mono"
                        onClick={() => handlePlayPhoneme(phoneme)}
                        disabled={isLoading && !isPhonLoading}
                        aria-label={`음소 ${phoneme} 재생 (${phonemeType === 'C' ? '자음' : phonemeType === 'V' ? '모음' : ''})`}
                      >
                        {isPhonLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        {phoneme}
                      </Button>
                      {phonemeType && (
                        <span
                          className={`text-[10px] font-semibold leading-none ${
                            phonemeType === 'C'
                              ? 'text-blue-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {phonemeType}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      [{phoneme}] {phonemeType === 'C' ? '자음' : phonemeType === 'V' ? '모음' : ''} 발음 재생
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center gap-2 ml-10 text-xs text-destructive">
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
