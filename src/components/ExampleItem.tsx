'use client';

import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

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

  const handlePlay = () => {
    play(example);
  };

  return (
    <div className="flex items-start gap-2 mt-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        className="h-6 w-6 p-0 mt-0.5"
        aria-label="예문 재생"
      >
        {isPlaying ? (
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
