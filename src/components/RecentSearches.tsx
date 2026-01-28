'use client';

import Link from 'next/link';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * RecentSearches 컴포넌트 Props
 */
interface RecentSearchesProps {
  /** 현재 검색 중인 단어 (검색 결과 페이지에서 사용) */
  currentWord?: string;
}

/**
 * 최근 검색 기록 컴포넌트
 *
 * localStorage에 저장된 최근 검색 기록을 Card 형태로 표시합니다.
 * 각 검색어는 클릭 시 해당 검색 결과 페이지로 이동합니다.
 *
 * - 검색 기록이 없으면 null을 반환 (렌더링하지 않음)
 * - currentWord와 일치하는 항목은 굵게 표시
 * - SSR 호환성을 위해 'use client' 지시자 사용
 *
 * @param currentWord - 현재 검색 중인 단어 (선택적)
 * @returns 최근 검색 기록 UI 또는 null
 */
export function RecentSearches({ currentWord }: RecentSearchesProps) {
  const { searches } = useRecentSearches();

  // 검색 기록이 없으면 렌더링하지 않음
  if (searches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">최근 검색</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {searches.map((item) => (
            <li key={item.word}>
              <Link
                href={`/search/${item.word}`}
                className={cn(
                  'text-sm hover:underline',
                  item.word === currentWord
                    ? 'font-bold'
                    : 'text-muted-foreground'
                )}
              >
                {item.word}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
