import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/SearchInput';
import { RecentSearches } from '@/components/RecentSearches';
import { SearchResult } from '@/components/SearchResult';
import { SearchResultSkeleton } from '@/components/SearchResultSkeleton';

/**
 * 페이지 Props 타입
 */
type Props = {
  params: Promise<{ word: string }>;
};

/**
 * 동적 메타데이터 생성
 *
 * URL 파라미터의 단어를 기반으로 페이지 메타데이터를 생성합니다.
 *
 * @param params - URL 파라미터 (Promise)
 * @returns 페이지 메타데이터
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { word } = await params;
  return {
    title: `${word} | 영어 단어 학습 사전`,
    description: `${word}의 발음, 뜻, 예문을 확인하세요`,
  };
}

/**
 * 검색 결과 페이지 컴포넌트
 *
 * URL 파라미터로 전달된 단어의 검색 결과를 표시합니다.
 * Free Dictionary API를 호출하여 실제 단어 정보, 품사별 정의, 예문을 표시하며,
 * 사이드바에 최근 검색 기록을 배치합니다.
 *
 * @param params - URL 파라미터 (Promise)
 * @returns 검색 결과 페이지
 */
export default async function SearchResultPage({ params }: Props) {
  const { word } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 py-8 px-4">
        {/* 검색 입력창 - 즉시 렌더링 */}
        <div className="mb-6">
          <SearchInput defaultValue={word} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바: 최근 검색 (데스크톱에서만 표시) */}
          <aside className="hidden lg:block">
            <RecentSearches currentWord={word} />
          </aside>

          {/* 메인: 검색 결과 - Suspense로 래핑 */}
          <div className="lg:col-span-3">
            <Suspense fallback={<SearchResultSkeleton />}>
              <SearchResult word={word} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
