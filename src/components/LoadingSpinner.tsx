import { Skeleton } from '@/components/ui/skeleton';

/**
 * 로딩 인디케이터 컴포넌트
 *
 * Skeleton 컴포넌트를 사용하여 로딩 상태를 시각적으로 표현합니다.
 * 페이지나 컴포넌트가 데이터를 로딩하는 동안 표시됩니다.
 * Phase 3에서 Suspense fallback으로 사용될 예정입니다.
 *
 * @example
 * ```tsx
 * // 페이지 로딩 상태
 * {isLoading ? <LoadingSpinner /> : <Content />}
 *
 * // Suspense fallback (Phase 3)
 * <Suspense fallback={<LoadingSpinner />}>
 *   <AsyncContent />
 * </Suspense>
 * ```
 */
export function LoadingSpinner() {
  return (
    <div className="space-y-4">
      {/* 제목 영역 */}
      <Skeleton className="h-8 w-48" />
      {/* 부제목 영역 */}
      <Skeleton className="h-4 w-32" />
      {/* 본문 영역 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
