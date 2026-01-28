import { PlayButton } from '@/components/PlayButton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ExampleItem } from '@/components/ExampleItem';
import { SearchTracker } from '@/components/SearchTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { convertToWordData } from '@/lib/mock-data';
import { searchWord } from '@/lib/api';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * SearchResult Props
 */
interface SearchResultProps {
  /** 검색할 단어 */
  word: string;
}

/**
 * 검색 결과 컴포넌트 (비동기 서버 컴포넌트)
 *
 * Free Dictionary API를 호출하여 단어의 검색 결과를 표시합니다.
 * Suspense와 함께 사용되어 로딩 상태를 표시할 수 있습니다.
 *
 * @param word - 검색할 단어
 */
export async function SearchResult({ word }: SearchResultProps) {
  // Free Dictionary API 호출
  const result = await searchWord(word);

  // 에러 처리 (early return)
  if (!result.success) {
    const errorMessage = result.error === 'NOT_FOUND'
      ? ERROR_MESSAGES.WORD_NOT_FOUND
      : '오류가 발생했습니다. 다시 시도해주세요.';
    return <ErrorMessage message={errorMessage} />;
  }

  // 이제 result.data가 타입 안전하게 접근 가능
  const wordData = convertToWordData(result.data);

  // 데이터 변환 실패 시 에러 처리
  if (!wordData) {
    return <ErrorMessage message="데이터를 처리할 수 없습니다." />;
  }

  const audioUrl = result.data[0]?.phonetics?.[0]?.audio;

  return (
    <>
      {/* 검색 성공 시 검색 기록에 추가 */}
      <SearchTracker word={word} />

      <div className="space-y-6">
        {/* 단어 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl">{wordData.word}</CardTitle>
              <PlayButton
                text={wordData.word}
                audioUrl={audioUrl}
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
    </>
  );
}
