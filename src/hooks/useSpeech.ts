'use client';

import { useState, useCallback } from 'react';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/speech';
import type { PlaybackSpeed } from '@/lib/constants';

/**
 * useSpeech 훅 반환 타입
 */
export interface UseSpeechReturn {
  /** 현재 재생 중 여부 */
  isPlaying: boolean;
  /** 현재 재생 속도 */
  playbackRate: PlaybackSpeed;
  /** 재생 속도 설정 함수 */
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  /** 음성 재생 함수 */
  play: (text: string, audioUrl?: string) => void;
  /** 재생 중단 함수 */
  stop: () => void;
}

/**
 * 음성 재생 통합 훅
 *
 * 오디오 파일 재생과 Web Speech API(TTS)를 통합하여 관리합니다.
 * 오디오 파일이 있으면 우선 재생하고, 없으면 TTS를 사용합니다.
 * 재생 속도 조절 기능을 제공합니다.
 *
 * @returns UseSpeechReturn 객체
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isPlaying, playbackRate, setPlaybackRate, play, stop } = useSpeech();
 *
 *   return (
 *     <div>
 *       <button onClick={() => play('Hello', 'audio.mp3')}>
 *         {isPlaying ? 'Playing...' : 'Play'}
 *       </button>
 *       <select value={playbackRate} onChange={(e) => setPlaybackRate(Number(e.target.value))}>
 *         <option value={0.5}>0.5x</option>
 *         <option value={1}>1x</option>
 *         <option value={1.5}>1.5x</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSpeech(): UseSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackSpeed>(1);

  /**
   * 오디오 파일 재생
   */
  const playAudio = useCallback((url: string, rate: number) => {
    const audio = new Audio(url);
    audio.playbackRate = rate;
    setIsPlaying(true);

    audio.play();
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
  }, []);

  /**
   * TTS 재생
   */
  const playTTS = useCallback(async (text: string, rate: number) => {
    try {
      setIsPlaying(true);
      await speak(text, rate);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, []);

  /**
   * 음성 재생 (오디오 우선, TTS 폴백)
   */
  const play = useCallback(
    (text: string, audioUrl?: string) => {
      if (audioUrl && audioUrl !== '') {
        playAudio(audioUrl, playbackRate);
      } else if (isSpeechSupported()) {
        playTTS(text, playbackRate);
      }
    },
    [playbackRate, playAudio, playTTS]
  );

  /**
   * 재생 중단
   */
  const stop = useCallback(() => {
    stopSpeaking();
    setIsPlaying(false);
  }, []);

  return { isPlaying, playbackRate, setPlaybackRate, play, stop };
}
