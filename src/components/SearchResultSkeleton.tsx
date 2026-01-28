import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * 검색 결과 로딩 스켈레톤 컴포넌트
 *
 * API 호출 중 사용자에게 로딩 상태를 시각적으로 표시합니다.
 * 실제 검색 결과 레이아웃과 유사한 구조를 제공하여
 * 레이아웃 시프트를 최소화합니다.
 */
export function SearchResultSkeleton() {
  return (
    <div className="space-y-6" data-slot="skeleton">
      {/* 단어 정보 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="h-5 w-24 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
      </Card>

      {/* 품사별 정의 카드 스켈레톤 (2개) */}
      {[1, 2].map((cardIdx) => (
        <Card key={cardIdx}>
          <CardHeader>
            <div className="h-7 w-20 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3">
              {/* 정의 항목 스켈레톤 (각 3개) */}
              {[1, 2, 3].map((defIdx) => (
                <li key={defIdx} className="space-y-2">
                  {/* 정의 텍스트 */}
                  <div className="space-y-1">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                  {/* 예문 */}
                  <div className="ml-5 space-y-1">
                    <div className="h-4 w-5/6 bg-muted/50 animate-pulse rounded" />
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
