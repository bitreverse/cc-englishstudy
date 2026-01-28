import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchInput } from '@/components/SearchInput';
import { PlayButton } from '@/components/PlayButton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ExampleItem } from '@/components/ExampleItem';
import { SearchTracker } from '@/components/SearchTracker';
import { RecentSearches } from '@/components/RecentSearches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertToWordData } from '@/lib/mock-data';
import { searchWord } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/constants';

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

  // Free Dictionary API 호출
  const response = await searchWord(word);
  const wordData = response ? convertToWordData(response) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 py-8 px-4">
        {/* 검색 성공 시 검색 기록에 추가 */}
        {wordData && <SearchTracker word={word} />}

        {/* 검색 입력창 */}
        <div className="mb-6">
          <SearchInput defaultValue={word} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바: 최근 검색 (데스크톱에서만 표시) */}
          <aside className="hidden lg:block">
            <RecentSearches currentWord={word} />
          </aside>

          {/* 메인: 검색 결과 */}
          <div className="lg:col-span-3">
            {!wordData ? (
              <ErrorMessage message={ERROR_MESSAGES.WORD_NOT_FOUND} />
            ) : (
              <div className="space-y-6">
                {/* 단어 정보 카드 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-3xl">{wordData.word}</CardTitle>
                      <PlayButton
                        text={wordData.word}
                        audioUrl={response?.[0]?.phonetics?.[0]?.audio}
                      />
                    </div>
                    {wordData.phonetic && (
                      <p className="text-muted-foreground">{wordData.phonetic}</p>
                    )}
                  </CardHeader>
                </Card>

                {/* 품사별 정의 목록 */}
                {wordData.meanings.map((meaning, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-xl capitalize">
                        {meaning.partOfSpeech}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-3">
                        {meaning.definitions.map((def, defIdx) => (
                          <li key={defIdx} className="space-y-1">
                            <p>{def.definition}</p>
                            {def.example ? (
                              <ExampleItem example={def.example} />
                            ) : (
                              <p className="text-sm text-muted-foreground ml-5">
                                예문 없음
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
