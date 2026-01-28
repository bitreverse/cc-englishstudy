'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '@/lib/constants';

/**
 * SpeedControl Props
 */
interface SpeedControlProps {
  /** 현재 재생 속도 */
  speed: PlaybackSpeed;
  /** 속도 변경 시 실행될 콜백 */
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

/**
 * 재생 속도 조절 컴포넌트
 *
 * 오디오 재생 속도를 조절할 수 있는 Select 컴포넌트입니다.
 * PLAYBACK_SPEEDS 상수에 정의된 속도 중 선택할 수 있습니다.
 * (0.5x, 0.75x, 1x, 1.25x, 1.5x)
 *
 * @example
 * ```tsx
 * const [speed, setSpeed] = useState<PlaybackSpeed>(1);
 *
 * <SpeedControl
 *   speed={speed}
 *   onSpeedChange={setSpeed}
 * />
 * ```
 */
export function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">속도</span>
      <Select
        value={speed.toString()}
        onValueChange={(v) => onSpeedChange(Number(v) as PlaybackSpeed)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLAYBACK_SPEEDS.map((s) => (
            <SelectItem key={s} value={s.toString()}>
              {s}x
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
