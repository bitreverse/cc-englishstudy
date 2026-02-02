'use client';

/**
 * TTS(Text-to-Speech) React 훅
 *
 * OpenAI TTS API를 활용한 발음 재생 기능을 React 컴포넌트에서
 * 쉽게 사용할 수 있도록 추상화합니다.
 *
 * 주요 기능:
 * - 단어/음소 발음 재생 및 정지
 * - 로딩/에러 상태 관리
 * - 재생 속도 조절
 * - 발음 품질 신고
 *
 * @module hooks/useTTS
 */

import { useState, useCallback, useRef } from 'react';
import {
  fetchTTSAudio,
  playAudioBuffer,
  stopCurrentAudio,
  reportPronunciation,
} from '@/lib/tts-client';
import type { TTSRequestParams } from '@/lib/tts-client';

/**
 * 현재 재생 중인 항목을 식별하기 위한 타입
 */
export interface PlayingItem {
  /** 재생 중인 단어 */
  word: string;
  /** 재생 중인 품사 */
  partOfSpeech?: string;
  /** 재생 중인 음소 */
  phoneme?: string;
}

/**
 * useTTS 훅 반환 타입
 */
export interface UseTTSReturn {
  /** 현재 재생 중 여부 */
  isPlaying: boolean;
  /** 현재 재생 중인 항목 정보 */
  playingItem: PlayingItem | null;
  /** 오디오 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 신고 처리 중 여부 */
  isReporting: boolean;
  /** 신고 완료 여부 */
  reported: boolean;
  /** 발음 재생 함수 */
  play: (params: TTSRequestParams) => Promise<void>;
  /** 재생 중지 함수 */
  stop: () => void;
  /** 발음 품질 신고 함수 */
  report: (params: Pick<TTSRequestParams, 'word' | 'partOfSpeech' | 'phoneme'>) => Promise<void>;
  /** 특정 항목이 현재 재생 중인지 확인하는 함수 */
  isItemPlaying: (word: string, partOfSpeech?: string, phoneme?: string) => boolean;
  /** 에러 초기화 함수 */
  clearError: () => void;
}

/**
 * TTS 발음 재생 훅
 *
 * OpenAI TTS API를 통해 단어와 음소의 발음을 재생합니다.
 * 캐싱, 에러 처리, 상태 관리를 자동으로 수행합니다.
 *
 * @returns UseTTSReturn 객체
 *
 * @example
 * ```tsx
 * function PronunciationButton({ word, partOfSpeech, ipa }) {
 *   const { isPlaying, isLoading, play, stop } = useTTS();
 *
 *   const handleClick = () => {
 *     if (isPlaying) {
 *       stop();
 *     } else {
 *       play({ word, partOfSpeech, ipa });
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={isLoading}>
 *       {isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingItem, setPlayingItem] = useState<PlayingItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  // AbortController 참조 (재생 취소용)
  const abortRef = useRef(false);

  /**
   * 발음 재생
   *
   * 오디오를 가져와 재생합니다. 이미 재생 중이면 먼저 중지합니다.
   *
   * @param params - TTS 요청 파라미터
   */
  const play = useCallback(async (params: TTSRequestParams) => {
    try {
      // 이전 재생 중지
      stopCurrentAudio();
      abortRef.current = false;

      setIsLoading(true);
      setError(null);
      setPlayingItem({
        word: params.word,
        partOfSpeech: params.partOfSpeech,
        phoneme: params.phoneme,
      });

      // 오디오 데이터 가져오기 (캐시 또는 API)
      const audioData = await fetchTTSAudio(params);

      // 중간에 취소되었으면 중단
      if (abortRef.current) {
        setIsLoading(false);
        setPlayingItem(null);
        return;
      }

      setIsLoading(false);
      setIsPlaying(true);

      // 재생
      await playAudioBuffer(audioData);

      // 재생 완료
      setIsPlaying(false);
      setPlayingItem(null);
    } catch (err) {
      setIsLoading(false);
      setIsPlaying(false);
      setPlayingItem(null);

      if (!abortRef.current) {
        const message = err instanceof Error ? err.message : '발음 재생에 실패했습니다.';
        setError(message);
        console.error('[useTTS] 재생 오류:', err);
      }
    }
  }, []);

  /**
   * 재생 중지
   */
  const stop = useCallback(() => {
    abortRef.current = true;
    stopCurrentAudio();
    setIsPlaying(false);
    setIsLoading(false);
    setPlayingItem(null);
  }, []);

  /**
   * 발음 품질 신고
   *
   * 캐시를 무효화하고 서버에 신고합니다.
   *
   * @param params - 신고 대상 정보
   */
  const report = useCallback(
    async (params: Pick<TTSRequestParams, 'word' | 'partOfSpeech' | 'phoneme'>) => {
      try {
        setIsReporting(true);
        setError(null);

        const success = await reportPronunciation(params);

        if (success) {
          setReported(true);
          // 3초 후 신고 상태 초기화
          setTimeout(() => setReported(false), 3000);
        } else {
          setError('신고 처리에 실패했습니다.');
        }
      } catch {
        setError('신고 처리 중 오류가 발생했습니다.');
      } finally {
        setIsReporting(false);
      }
    },
    []
  );

  /**
   * 특정 항목이 현재 재생 중인지 확인
   */
  const isItemPlaying = useCallback(
    (word: string, partOfSpeech?: string, phoneme?: string): boolean => {
      if (!playingItem) return false;
      return (
        playingItem.word === word &&
        playingItem.partOfSpeech === partOfSpeech &&
        playingItem.phoneme === phoneme
      );
    },
    [playingItem]
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPlaying,
    playingItem,
    isLoading,
    error,
    isReporting,
    reported,
    play,
    stop,
    report,
    isItemPlaying,
    clearError,
  };
}
