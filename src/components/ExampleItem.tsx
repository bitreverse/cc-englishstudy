'use client';

import { useState, useEffect } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';
import { isSpeechSupported } from '@/lib/speech';

/**
 * ExampleItem Props
 */
interface ExampleItemProps {
  /** 재생할 예문 텍스트 */
  example: string;
}

/**
 * 예문 표시 및 재생 컴포넌트
 *
 * 정의의 예문을 표시하고, 작은 재생 버튼을 제공합니다.
 * useSpeech 훅을 사용하여 예문을 음성으로 재생합니다.
 * 각 예문은 독립적으로 재생되며, Web Speech API가 자동으로 중복 재생을 방지합니다.
 *
 * @example
 * ```tsx
 * <ExampleItem example="Hello, everyone." />
 * ```
 */
export function ExampleItem({ example }: ExampleItemProps) {
  const { isPlaying, play } = useSpeech();
  const [isSupported, setIsSupported] = useState(true);

  // 클라이언트에서 TTS 지원 여부 체크
  useEffect(() => {
    setIsSupported(isSpeechSupported());
  }, []);

  const handlePlay = () => {
    play(example);
  };

  // TTS 미지원이면 버튼 비활성화
  const isDisabled = !isSupported;

  return (
    <div className="flex items-start gap-2 mt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        className="h-6 w-6 p-0 mt-0.5"
        aria-label="예문 재생"
        disabled={isDisabled}
        title={isDisabled ? '이 브라우저는 음성 재생을 지원하지 않습니다' : undefined}
      >
        {isDisabled ? (
          <Volume2 className="h-3 w-3" />
        ) : isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </Button>
      <p className="text-sm text-muted-foreground italic flex-1">
        &quot;{example}&quot;
      </p>
    </div>
  );
}
