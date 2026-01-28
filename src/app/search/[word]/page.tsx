import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/SearchInput';
import { RecentSearches } from '@/components/RecentSearches';
import { SearchResult } from '@/components/SearchResult';
import { SearchResultSkeleton } from '@/components/SearchResultSkeleton';
import { searchWord } from '@/lib/api';
import type { WordData } from '@/types';

/**
 * 페이지 Props 타입
 */
type Props = {
  params: Promise<{ word: string }>;
};

/**
 * JSON-LD 구조화된 데이터 생성
 *
 * Schema.org의 DefinedTerm 타입으로 단어 정보를 구조화합니다.
 *
 * @param wordData - 단어 데이터
 * @returns JSON-LD 객체
 */
function generateJsonLd(wordData: WordData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: wordData.word,
    description: wordData.meanings[0]?.definitions[0]?.definition || '',
  };
}

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
 * JSON-LD 구조화된 데이터를 포함하여 SEO를 개선합니다.
 *
 * @param params - URL 파라미터 (Promise)
 * @returns 검색 결과 페이지
 */
export default async function SearchResultPage({ params }: Props) {
  const { word } = await params;

  // JSON-LD를 위한 데이터 가져오기 (Next.js가 자동으로 중복 제거)
  const result = await searchWord(word);
  const jsonLd =
    result.success && result.data[0]
      ? generateJsonLd({
          word: result.data[0].word,
          phonetic: result.data[0].phonetic,
          meanings: result.data[0].meanings,
        })
      : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 py-8 px-4">
        {/* JSON-LD 구조화된 데이터 */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {/* 검색 입력창 - 즉시 렌더링 */}
        <div className="mb-6">
          <SearchInput defaultValue={word} />
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4">
          {/* 사이드바: 최근 검색 */}
          <aside className="lg:order-first lg:col-span-1">
            {/* 모바일: 접을 수 있는 섹션 */}
            <details className="lg:hidden border rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-sm">
                최근 검색 기록 ▼
              </summary>
              <div className="mt-4">
                <RecentSearches currentWord={word} />
              </div>
            </details>

            {/* 데스크톱: 항상 표시 */}
            <div className="hidden lg:block">
              <RecentSearches currentWord={word} />
            </div>
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
