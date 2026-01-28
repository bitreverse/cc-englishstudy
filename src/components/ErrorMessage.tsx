import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorMessage Props
 */
interface ErrorMessageProps {
  /** 에러 제목 (선택적, 기본값: "오류") */
  title?: string;
  /** 에러 메시지 내용 */
  message: string;
}

/**
 * 에러 메시지 컴포넌트
 *
 * Alert 컴포넌트를 사용하여 사용자에게 에러 메시지를 표시합니다.
 * destructive variant를 사용하여 빨간색으로 강조 표시됩니다.
 * AlertCircle 아이콘으로 에러임을 시각적으로 나타냅니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ErrorMessage message="단어를 찾을 수 없습니다." />
 *
 * // 커스텀 제목 사용
 * <ErrorMessage
 *   title="네트워크 오류"
 *   message="서버에 연결할 수 없습니다."
 * />
 * ```
 */
export function ErrorMessage({ title = '오류', message }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
