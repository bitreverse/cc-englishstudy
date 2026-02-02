import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * 번역 정의 타입
 */
interface TranslationDefinition {
  partOfSpeech: string;
  english: string;
  korean: string;
}

/**
 * 번역 예문 타입
 */
interface TranslationExample {
  english: string;
  korean: string;
}

/**
 * 번역 결과 타입
 */
interface TranslationResult {
  word: string;
  definitions: TranslationDefinition[];
  examples: TranslationExample[];
  source: string;
}

/**
 * TranslationDisplay Props
 */
interface TranslationDisplayProps {
  /** 번역 결과 */
  translation: TranslationResult | undefined;
}

/**
 * 한글 번역 결과 표시 컴포넌트
 *
 * 단어의 정의와 예문을 영어와 한국어로 병렬 표시합니다.
 * 품사별로 카드를 분리하여 가독성을 높입니다.
 *
 * @param translation - 번역 결과
 *
 * @example
 * ```tsx
 * <TranslationDisplay
 *   translation={{
 *     word: 'hello',
 *     definitions: [
 *       {
 *         partOfSpeech: 'interjection',
 *         english: 'used as a greeting',
 *         korean: '인사로 사용되는 말'
 *       }
 *     ],
 *     examples: [
 *       {
 *         english: 'Hello, how are you?',
 *         korean: '안녕하세요, 어떻게 지내세요?'
 *       }
 *     ],
 *     source: 'ai'
 *   }}
 * />
 * ```
 */
export function TranslationDisplay({ translation }: TranslationDisplayProps) {
  // 데이터 없음
  if (!translation) {
    return null;
  }

  // 정의가 없고 예문만 있는 경우
  if (translation.definitions.length === 0 && translation.examples.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 정의 번역 */}
      {translation.definitions.length > 0 && (
        <div className="space-y-4">
          {translation.definitions.map((def, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-xl capitalize">
                  {def.partOfSpeech}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* 영문 정의 */}
                  <p className="text-base">{def.english}</p>

                  {/* 한글 번역 */}
                  <p className="text-sm text-muted-foreground">{def.korean}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 예문 번역 */}
      {translation.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {translation.examples.map((example, idx) => (
                <div key={idx} className="space-y-1 pb-4 last:pb-0 border-b last:border-b-0">
                  {/* 영문 예문 */}
                  <p className="italic text-base">&ldquo;{example.english}&rdquo;</p>

                  {/* 한글 번역 */}
                  <p className="text-sm text-muted-foreground ml-4">
                    &ldquo;{example.korean}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 데이터 소스 */}
      <div className="flex justify-end">
        <p className="text-xs text-muted-foreground capitalize">
          Translation source: {translation.source}
        </p>
      </div>
    </div>
  );
}
