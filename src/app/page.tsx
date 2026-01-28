import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_RECENT_SEARCHES } from '@/lib/mock-data';

/**
 * 홈페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '영어 단어 학습 사전',
  description: '영어 단어를 검색하고 발음, 뜻, 예문을 확인하세요',
};

/**
 * 홈페이지 (검색 페이지)
 *
 * 영어 단어 학습 사전의 메인 페이지입니다.
 * 사용자가 검색할 단어를 입력할 수 있는 검색 인터페이스를 제공하며,
 * 최근 검색 기록을 Card 형태로 표시합니다.
 *
 * @returns 홈페이지 컴포넌트
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">영어 단어 검색</h2>
          <p className="text-muted-foreground mb-8 text-center">
            검색할 영어 단어를 입력하세요
          </p>
          <SearchInput autoFocus />

          {MOCK_RECENT_SEARCHES.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>최근 검색</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {MOCK_RECENT_SEARCHES.map((item) => (
                    <li key={item.word}>
                      <a
                        href={`/search/${item.word}`}
                        className="text-primary hover:underline"
                      >
                        {item.word}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
