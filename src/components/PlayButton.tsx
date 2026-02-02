'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { isSpeechSupported } from '@/lib/speech';

/**
 * PlayButton Props
 */
interface PlayButtonProps {
  /** 재생할 텍스트 (필수) */
  text: string;
  /** 재생할 오디오 파일 URL (선택적) */
  audioUrl?: string;
  /** 재생 시작 시 실행될 콜백 (선택적) */
  onPlay?: () => void;
}

/**
 * 음성 재생 버튼 컴포넌트
 *
 * 오디오 파일 재생과 Web Speech API(TTS)를 통합한 버튼 컴포넌트입니다.
 * 오디오 URL이 있으면 오디오 파일을 재생하고, 없으면 TTS로 텍스트를 읽어줍니다.
 * 재생 중일 때는 Pause 아이콘을, 정지 상태에서는 Play 아이콘을 표시합니다.
 *
 * @example
 * ```tsx
 * // 오디오 파일과 함께 사용
 * <PlayButton text="hello" audioUrl="https://example.com/audio.mp3" />
 *
 * // TTS만 사용 (오디오 URL 없음)
 * <PlayButton text="hello" />
 *
 * // 재생 시작 콜백과 함께 사용
 * <PlayButton
 *   text="hello"
 *   audioUrl="https://example.com/audio.mp3"
 *   onPlay={() => console.log('재생 시작')}
 * />
 * ```
 */
export function PlayButton({ text, audioUrl, onPlay }: PlayButtonProps) {
  const { isPlaying, play } = useSpeech();
  // 클라이언트에서 TTS 지원 여부 체크 (lazy 초기화)
  const [isSupported] = useState(() => isSpeechSupported());

  const handleClick = () => {
    // 콜백 실행
    if (onPlay) {
      onPlay();
    }

    // 음성 재생 (오디오 우선, TTS 폴백)
    play(text, audioUrl);
  };

  // 오디오 URL이 없고 TTS도 미지원이면 버튼 비활성화
  const isDisabled = !audioUrl && !isSupported;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label={isPlaying ? '재생 중' : '음성 재생'}
      disabled={isDisabled}
      title={isDisabled ? '이 브라우저는 음성 재생을 지원하지 않습니다' : undefined}
    >
      {isDisabled ? (
        <Volume2 className="h-4 w-4" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
