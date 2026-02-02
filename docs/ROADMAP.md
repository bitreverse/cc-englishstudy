# 영어 단어 학습 사전 고도화 로드맵

> **현재 상태**: MVP 완료 (Phase 1-5 완료) | Phase 1 전면 재구성 진행 중 | **목표**: 사용자 맞춤형 학습 플랫폼으로 진화

## 프로젝트 개요

### 현재까지의 성과 (MVP - 완료)
영어 단어를 검색하고 발음, 뜻, 예문을 확인하여 효과적으로 학습할 수 있는 웹 사전 애플리케이션

**구현 완료 기능:**
- 단어 검색 (Free Dictionary API)
- 발음 정보 표시 (IPA) + 음성 재생 (Web Speech API)
- 품사별 단어 뜻 표시
- 예시 문장 표시 + 음성 재생
- 최근 검색 기록 (localStorage 기반)
- 로딩/에러 상태 처리
- 반응형 디자인 + 접근성 + SEO 최적화

### 고도화 비전
**개인 맞춤형 영어 학습 플랫폼**으로 확장하여 다음을 실현:
1. AI 기반 단어 구조 분석(형태소/음절) + 품사별 상세 정보를 통한 깊이 있는 이해
2. 동형이의어(heteronyms) 처리로 품사별 정확한 발음 제공
3. 단어 뜻과 예시 문장의 한글 번역으로 학습 접근성 향상
4. 사용자별 학습 진도 추적 및 시각화
5. 반복 학습 및 테스트를 통한 장기 기억 강화
6. 어두운 환경에서도 편안한 학습 환경 제공

---

## 기술 스택

### 기존 (MVP)
- **프레임워크**: Next.js 16.1.5 (App Router), React 19.2.3
- **언어**: TypeScript 5.7+
- **스타일링**: Tailwind CSS v4, shadcn/ui (new-york)
- **외부 API**: Free Dictionary API, Web Speech API
- **상태 관리**: React Hooks, localStorage
- **배포**: Vercel

### 신규 (고도화)
- **AI API**: OpenAI GPT-4o (정확성 + 속도 우선) / Anthropic Claude Opus 4.5 (정확성 최우선)
- **음절 분리**: AI API 전용 (hypher 완전 제거)
- **형태소 분석**: OpenAI / Anthropic API 기반 (AI 형태소 분석 + 어원 포함)
- **한글 번역**: OpenAI / Anthropic API (품사별 뜻, 예시 문장 번역)
- **캐시 전략**: 서버 메모리 캐시 + localStorage (무제한)
- **인증**: Supabase Auth
- **데이터베이스**: Supabase PostgreSQL
- **다크모드**: next-themes
- **차트**: Recharts
- **테스트**: Playwright (E2E), Vitest (Unit)

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 완료 표시로 갱신

---

## 개발 단계

### Phase 1: UI 출력 구조 변경 + AI 통합 질의 재구성

> **목표**: Phonics 분석 완전 제거, AI 통합 질의 재설계 (음절 + 형태소 + 품사별 상세 정보), UI.png/UI.md 기반 새로운 출력 구조
> **예상 기간**: 5일
> **변경 사유**: Phonics(음소 분해) 불필요, UI 출력 구조 전면 변경, 품사별 상세 정보(IPA/뜻/예문/유의어/반의어) 통합

#### 주요 변경사항 요약

| 항목 | 기존 | 변경 |
|------|------|------|
| Phonics 분석 | PhonicsAnalysis, Phoneme, grapheme-sounds.ts | **완전 제거** |
| UI 출력 구조 | Word Analysis 카드 (Morpheme/Pronunciation/Syllables) | UI.png 구조 (음절 표시 + Morpheme Analysis + 품사별 섹션) |
| AI 응답 구조 | morpheme + syllables[] + phonics[] + translation | morpheme + syllabification + meanings[] (품사별 IPA/뜻/예문/유의어/반의어) |
| 품사별 정보 | translation.definitions만 | meanings[]: IPA, definitionEn, definitionKo, examples, synonyms, antonyms |
| 발음 재생 | phoneme 개별 재생 (Letterland) | 품사별 전체 단어 발음 재생 (Web Speech API) |
| Heteronyms | phonics[] 배열로 분리 | meanings[] 배열에서 품사별 IPA로 분리 |
| AI 모델 | GPT-4o ($2.50/1M input) | GPT-4o ($2.50/1M input, $50/월 예산 유지) |

#### UI 출력 구조 (UI.png 기준)

```
[단어] (음절 표시: per-mit)

Morpheme Analysis
- per- (Prefix): "완전히, 철저히"의 뜻을 가진 라틴어 계열 접두사
- mit (Root): "보내다"라는 의미의 라틴어 mittere에서 유래
  -> "보내도록 허락하다, 통과시키다"

1. Verb /per'mIt/ (US IPA)  [발음 재생 버튼]
- (EN) To allow something to happen or someone to do something
- (KR) 어떤 일이 일어나거나 누군가가 어떤 행동을 하도록 허락하다
- Example: They didn't permit him to enter the building.
  (그들은 그가 건물에 들어가는 것을 허락하지 않았다.)
- Synonyms: allow, authorize, approve, let, consent
- Antonyms: forbid, prohibit, deny, refuse, ban

2. Noun /'p3r.mIt/ (US IPA)  [발음 재생 버튼]
- (EN) An official document giving someone permission to do something
- (KR) 어떤 행위를 허가하는 공식 문서, 허가증
- Example: You need a parking permit to leave your car here.
  (여기에 차를 세우려면 주차 허가증이 필요하다.)
- Synonyms: license, authorization, certificate, pass
- Antonyms: (None commonly used; possible phrase: without a permit)
```

---

#### Task 1.1: Phonics 완전 제거 + 타입 재설계 - 우선순위

**목표**: PhonicsAnalysis/Phoneme 관련 모든 코드 제거, 새로운 타입 체계(meaning.ts) 설계, 기존 타입 정리

**구현 사항:**

1. **삭제할 파일:**
   - `src/types/phonics.ts` - PhonicsAnalysis, Phoneme 타입 전체
   - `src/lib/grapheme-sounds.ts` - Letterland 발음 매핑 전체
   - `src/components/word/WordAnalysisDisplay.tsx` - 기존 통합 UI (전면 재작성 예정)

2. **새로 생성: `src/types/meaning.ts`** - 품사별 상세 정보 타입
   ```typescript
   /** 품사별 상세 정보 (AI 응답의 핵심 단위) */
   export interface MeaningEntry {
     /** 품사 (예: "verb", "noun", "adjective") */
     partOfSpeech: string;
     /** US IPA 발음 기호 (예: "/per'mIt/") */
     ipa: string;
     /** 영어 정의 */
     definitionEn: string;
     /** 한국어 정의 */
     definitionKo: string;
     /** 예시문 배열 */
     examples: MeaningExample[];
     /** 유의어 배열 */
     synonyms: string[];
     /** 반의어 배열 */
     antonyms: string[];
   }

   /** 예시문 (영어 + 한국어 번역) */
   export interface MeaningExample {
     /** 영어 예문 */
     en: string;
     /** 한국어 번역 */
     ko: string;
   }
   ```

3. **`src/types/syllable.ts` 간소화:**
   - 기존 `SyllabificationResult` 유지 (word, syllables, formatted, count, source)
   - `partOfSpeech` 필드 제거 (음절은 품사별 분리 불필요, 단일 결과)
   - `source` 타입 유지: `'ai' | 'cache'`

4. **`src/types/morpheme.ts` 수정:**
   - `etymology` 필드 타입을 `string`으로 유지 (어원 상세 설명 포함)
   - `MorphemePart`에 `origin?: string` 필드 추가 (각 형태소의 어원 언어/출처)
   - UI.md 기준: "per- (Prefix): '완전히, 철저히'의 뜻을 가진 라틴어 계열 접두사" 형태 지원

5. **`src/types/ai.ts` 재구성:**
   - `WordAnalysisResponse`에서 `phonics` 필드 제거
   - `WordAnalysisResponse`에서 `translation` 필드 제거
   - `WordAnalysisResponse`에 `meanings: MeaningEntry[]` 필드 추가
   - `syllables` 필드를 단일 `SyllabificationResult`로 변경 (배열 아님)
   - 최종 구조:
     ```typescript
     export interface WordAnalysisResponse {
       morpheme: MorphemeAnalysis;
       syllables: SyllabificationResult;
       meanings: MeaningEntry[];
     }
     ```

6. **`src/types/index.ts` 수정:**
   - `export * from './phonics'` 제거
   - `export * from './translation'` 제거 (meanings에 통합)
   - `export * from './meaning'` 추가

**검증 기준:**
- [ ] `src/types/phonics.ts` 파일이 삭제됨
- [ ] `src/lib/grapheme-sounds.ts` 파일이 삭제됨
- [ ] `src/types/meaning.ts` 파일이 생성되고 MeaningEntry, MeaningExample 타입이 정의됨
- [ ] `WordAnalysisResponse`에서 `phonics` 필드가 제거됨
- [ ] `WordAnalysisResponse`에서 `translation` 필드가 제거됨
- [ ] `WordAnalysisResponse`에 `meanings: MeaningEntry[]` 필드가 추가됨
- [ ] `syllables` 필드가 단일 `SyllabificationResult`로 변경됨
- [ ] `MorphemePart`에 `origin` 필드가 추가됨
- [ ] TypeScript 컴파일 에러가 없음 (`npm run build` 통과)

**수동 검증:**
- `src/types/` 디렉토리에 phonics.ts가 없는지 확인
- meaning.ts의 MeaningEntry 인터페이스가 partOfSpeech, ipa, definitionEn, definitionKo, examples, synonyms, antonyms 필드를 포함하는지 확인
- ai.ts의 WordAnalysisResponse가 morpheme, syllables, meanings 3개 필드만 갖는지 확인

**Playwright MCP 테스트 체크리스트:**
- [ ] `npm run build` 실행 후 TypeScript 컴파일 에러 0건 확인
- [ ] 빌드 출력에 phonics, grapheme-sounds 관련 import 에러가 없는지 확인

**관련 파일:**
- 삭제:
  - `src/types/phonics.ts` - PhonicsAnalysis, Phoneme 타입 전체
  - `src/lib/grapheme-sounds.ts` - Letterland 발음 매핑
  - `src/components/word/WordAnalysisDisplay.tsx` - 기존 통합 UI
- 새로 생성:
  - `src/types/meaning.ts` - 품사별 상세 정보 타입
- 수정:
  - `src/types/syllable.ts` - partOfSpeech 필드 제거
  - `src/types/morpheme.ts` - MorphemePart에 origin 필드 추가
  - `src/types/ai.ts` - phonics/translation 제거, meanings 추가, syllables 단일 객체화
  - `src/types/index.ts` - phonics/translation export 제거, meaning export 추가

---

#### Task 1.2: AI 통합 프롬프트 재설계 + API 서비스 수정

**목표**: AI에 1회 질의로 음절/형태소/품사별 상세 정보를 모두 받는 통합 프롬프트 재작성, 서비스 레이어 수정

**구현 사항:**

1. **`src/lib/ai/prompts.ts` 전면 재작성:**
   - Phonics 관련 요청 완전 제거
   - 새로운 통합 프롬프트 구조:
     ```
     단어 "{word}"에 대해 다음을 JSON으로 분석:

     1. syllabification: 음절 분리 (예: "per-mit" 형태)
     2. morpheme: 접두사/어근/접미사 + 각 의미(영문/한글) + 어원 설명
        - etymology: 형태소 조합의 의미 설명 (예: "보내도록 허락하다, 통과시키다")
     3. meanings: 품사별 배열, 각 항목에:
        - partOfSpeech: 품사
        - ipa: US IPA 발음 기호
        - definitionEn: 영어 정의
        - definitionKo: 한국어 정의
        - examples: [{en: "영어 예문", ko: "한국어 번역"}]
        - synonyms: 유의어 배열 (최대 5개)
        - antonyms: 반의어 배열 (최대 5개, 없으면 빈 배열)

     주의: 모든 IPA는 US (미국식) 기준
     주의: heteronym(permit, record 등)의 경우 품사별로 다른 IPA를 반드시 구분
     ```

2. **AI 응답 JSON 스키마 예시:**
   ```json
   {
     "syllables": {
       "word": "permit",
       "syllables": ["per", "mit"],
       "formatted": "per-mit",
       "count": 2,
       "source": "ai"
     },
     "morpheme": {
       "word": "permit",
       "prefixes": [{"text": "per-", "meaning": "through, thoroughly", "meaningKo": "완전히, 철저히", "origin": "라틴어 per-"}],
       "root": {"text": "mit", "meaning": "to send", "meaningKo": "보내다", "origin": "라틴어 mittere"},
       "suffixes": [],
       "derivations": ["permission", "permissible", "permissive"],
       "etymology": "보내도록 허락하다, 통과시키다",
       "source": "ai"
     },
     "meanings": [
       {
         "partOfSpeech": "verb",
         "ipa": "/per'mIt/",
         "definitionEn": "To allow something to happen or someone to do something",
         "definitionKo": "어떤 일이 일어나거나 누군가가 어떤 행동을 하도록 허락하다",
         "examples": [{"en": "They didn't permit him to enter the building.", "ko": "그들은 그가 건물에 들어가는 것을 허락하지 않았다."}],
         "synonyms": ["allow", "authorize", "approve", "let", "consent"],
         "antonyms": ["forbid", "prohibit", "deny", "refuse", "ban"]
       },
       {
         "partOfSpeech": "noun",
         "ipa": "/'p3r.mIt/",
         "definitionEn": "An official document giving someone permission to do something",
         "definitionKo": "어떤 행위를 허가하는 공식 문서, 허가증",
         "examples": [{"en": "You need a parking permit to leave your car here.", "ko": "여기에 차를 세우려면 주차 허가증이 필요하다."}],
         "synonyms": ["license", "authorization", "certificate", "pass"],
         "antonyms": []
       }
     ]
   }
   ```

3. **`src/lib/word-analysis-service.ts` 수정:**
   - `analyzeWord()` 함수의 반환 타입을 새로운 `WordAnalysisResponse`에 맞춤
   - `getFallbackAnalysis()` 수정: `meanings` 빈 배열, `syllables` 빈 객체 반환
   - Phonics 관련 import/로직 완전 제거
   - Heteronyms 감지 로직 유지 (AI 프롬프트에 전달)

4. **`src/lib/ai/openai-client.ts` 수정:**
   - AI 응답 파싱 시 새로운 `meanings[]` 구조 처리
   - `phonics` 파싱 로직 제거
   - `translation` 파싱 로직 제거

5. **`src/lib/ai/anthropic-client.ts` 수정:**
   - 동일하게 새로운 응답 구조에 맞춤

6. **`src/app/api/words/analyze/route.ts` 수정:**
   - 응답 구조를 새로운 `WordAnalysisResponse`에 맞춤
   - Phonics 관련 로직 제거

**검증 기준:**
- [ ] 프롬프트에서 phonics/phoneme 관련 요청이 완전히 제거됨
- [ ] 프롬프트에 meanings[] 구조가 정의됨 (partOfSpeech, ipa, definitionEn, definitionKo, examples, synonyms, antonyms)
- [ ] 프롬프트에 "US IPA only" 명시 확인
- [ ] 프롬프트에 heteronym 처리 로직 포함 확인
- [ ] AI API 호출 시 "permit" 검색 -> verb/noun 2개의 meanings 항목이 각각 다른 IPA를 반환
- [ ] AI API 호출 시 "cat" 검색 -> 1개의 meanings 항목 반환
- [ ] 폴백 분석 시 meanings 빈 배열 반환, 에러 없음
- [ ] 비용 추적기가 GPT-4o 기준으로 정확히 계산

**수동 검증:**
- `/api/words/analyze?word=permit` 호출 시 JSON 응답에 `morpheme`, `syllables`, `meanings` 3개 키만 존재
- `meanings` 배열의 각 항목에 `ipa`, `definitionEn`, `definitionKo`, `examples`, `synonyms`, `antonyms` 포함 확인
- `phonics` 키가 응답에 없는지 확인

**Playwright MCP 테스트 체크리스트:**
- [ ] `/api/words/analyze?word=permit` GET 요청 -> 200 응답, `meanings` 배열에 verb/noun 항목 존재
- [ ] `/api/words/analyze?word=cat` GET 요청 -> 200 응답, `meanings` 배열에 noun 항목 존재
- [ ] `/api/words/analyze?word=record` POST 요청 (phonetics 포함) -> verb/noun IPA 분리 확인
- [ ] 응답 JSON에 `phonics` 키가 존재하지 않는지 확인
- [ ] 응답 JSON의 `syllables`가 단일 객체인지 확인 (배열 아님)

**관련 파일:**
- 수정:
  - `src/lib/ai/prompts.ts` - 통합 프롬프트 전면 재작성 (phonics 제거, meanings 추가)
  - `src/lib/word-analysis-service.ts` - 새로운 응답 구조 처리, phonics 제거
  - `src/lib/ai/openai-client.ts` - 새로운 응답 파싱
  - `src/lib/ai/anthropic-client.ts` - 새로운 응답 파싱
  - `src/app/api/words/analyze/route.ts` - 새로운 응답 구조

---

#### Task 1.3: 불필요 코드 제거 + 의존성 정리

**목표**: Phonics 관련 잔여 코드, 사용하지 않는 컴포넌트/타입/유틸리티 완전 제거, hypher 관련 정리

**구현 사항:**

1. **삭제할 파일:**
   - `src/components/word/MorphemeDisplay.tsx` - 기존 독립 형태소 UI (사용하지 않음)
   - `src/components/word/SyllabificationDisplay.tsx` - 기존 독립 음절 UI (사용하지 않음)
   - `src/types/hypher.d.ts` - hypher 타입 선언 (이미 미사용이나 잔여 확인)
   - `src/types/translation.ts` - 기존 TranslationResult 타입 (meanings에 통합됨)

2. **`src/lib/syllabification.ts` 정리:**
   - `createSyllabificationFromAI()` 함수 유지
   - 불필요 import 제거
   - hypher 관련 잔여 코드 확인 및 제거

3. **`src/lib/heteronyms-detector.ts` 유지:**
   - 기존 로직 유지 (AI 프롬프트에 heteronym 시그널 전달용)
   - `KNOWN_HETERONYMS` 목록 유지

4. **`src/lib/analysis-cache.ts` 수정:**
   - 캐시 타입을 새로운 `WordAnalysisResponse`에 맞춤
   - phonics 관련 캐시 로직 제거

5. **`src/hooks/useAnalysis.ts` 수정:**
   - 반환 타입을 새로운 `WordAnalysisResponse`에 맞춤

6. **`package.json` 정리:**
   - hypher, hyphenation.en-us 의존성이 이미 제거되었는지 확인
   - 불필요 의존성 확인 및 정리

7. **`src/components/SearchResult.tsx` 수정:**
   - `WordAnalysisDisplay` import를 `WordSearchResult`로 변경 (Task 1.4에서 생성)
   - analysis 데이터 전달 구조를 새로운 타입에 맞춤
   - 기존 `translation.definitions` 참조를 `meanings` 참조로 변경
   - 품사별 정의 표시 로직을 새 구조에 맞게 수정

**검증 기준:**
- [ ] 삭제 대상 파일이 모두 제거됨
- [ ] `src/types/phonics.ts`가 존재하지 않음
- [ ] `src/types/translation.ts`가 존재하지 않음
- [ ] `src/lib/grapheme-sounds.ts`가 존재하지 않음
- [ ] 프로젝트 전체에서 `PhonicsAnalysis`, `Phoneme`, `grapheme-sounds` import가 없음
- [ ] 프로젝트 전체에서 `TranslationResult`, `TranslatedDefinition` import가 없음
- [ ] `npm run build` 통과 (컴파일 에러 없음)
- [ ] `npm run lint` 통과 (미사용 import 경고 없음)

**수동 검증:**
- `src/types/` 디렉토리에 phonics.ts, translation.ts가 없는지 확인
- `src/lib/` 디렉토리에 grapheme-sounds.ts가 없는지 확인
- `src/components/word/` 디렉토리에 PhonicsDisplay.tsx, MorphemeDisplay.tsx, SyllabificationDisplay.tsx가 없는지 확인

**Playwright MCP 테스트 체크리스트:**
- [ ] `npm run build` 실행 후 성공 확인
- [ ] 개발 서버 실행 -> 메인 페이지 로드 정상 확인
- [ ] `/search/hello` 접근 -> 에러 없이 페이지 표시 확인 (기존 기능 유지)

**관련 파일:**
- 삭제:
  - `src/components/word/MorphemeDisplay.tsx`
  - `src/components/word/SyllabificationDisplay.tsx`
  - `src/types/hypher.d.ts` (존재 시)
  - `src/types/translation.ts`
- 수정:
  - `src/lib/syllabification.ts` - 불필요 코드 제거
  - `src/lib/analysis-cache.ts` - 새로운 캐시 타입
  - `src/hooks/useAnalysis.ts` - 새로운 반환 타입
  - `src/components/SearchResult.tsx` - 새로운 데이터 구조 대응
  - `package.json` - 불필요 의존성 확인

---

#### Task 1.4: WordSearchResult 통합 UI 컴포넌트 구현

**목표**: UI.png/UI.md 기준의 새로운 검색 결과 UI를 `WordSearchResult.tsx`로 구현

**참고 디자인**: `UI.png`, `UI.md`

**UI 레이아웃 구조:**
```
[단어] (음절 표시: per-mit)             -- 상단 헤더

Morpheme Analysis                       -- 형태소 분석 섹션
- per- (Prefix): "완전히, 철저히"의 뜻을 가진 라틴어 계열 접두사
- mit (Root): "보내다"라는 의미의 라틴어 mittere에서 유래
  -> "보내도록 허락하다, 통과시키다"

1. Verb /per'mIt/ (US IPA) [재생버튼]   -- 품사별 섹션 (반복)
- (EN) To allow something to happen...
- (KR) 어떤 일이 일어나거나...
- Example: They didn't permit him to enter the building.
  (그들은 그가 건물에 들어가는 것을 허락하지 않았다.)
- Synonyms: allow, authorize, approve, let, consent
- Antonyms: forbid, prohibit, deny, refuse, ban

2. Noun /'p3r.mIt/ (US IPA) [재생버튼] -- 두 번째 품사
- (EN) An official document...
- (KR) 어떤 행위를 허가하는...
- Example: You need a parking permit...
  (여기에 차를 세우려면...)
- Synonyms: license, authorization, certificate, pass
- Antonyms: (없음)
```

**구현 사항:**

1. **`src/components/word/WordSearchResult.tsx` 생성 (메인 통합 컴포넌트):**
   - Props: `{ analysis: WordAnalysisResponse | null; isLoading?: boolean; error?: string | null; word: string; }`
   - **헤더 영역**: 단어 + 음절 표시 (예: "per-mit")
     - `analysis.syllables.formatted` 사용
   - **Morpheme Analysis 섹션**:
     - 각 형태소를 리스트로 표시
     - 접두사: "per- (Prefix): '완전히, 철저히'의 뜻을 가진 라틴어 계열 접두사"
     - 어근: "mit (Root): '보내다'라는 의미의 라틴어 mittere에서 유래"
     - 접미사: (있는 경우)
     - etymology 표시: "-> '보내도록 허락하다, 통과시키다'"
   - **품사별 섹션** (meanings 배열 순회):
     - 번호 매기기: "1. Verb", "2. Noun" 등
     - IPA + (US IPA) 레이블 + 발음 재생 버튼
     - (EN) 영어 정의
     - (KR) 한국어 정의
     - Example: 영어 예문 + (한국어 번역)
     - Synonyms: 유의어 나열
     - Antonyms: 반의어 나열 (없으면 표시하지 않거나 "없음" 표기)
   - **로딩 스켈레톤 UI**: 각 섹션별 스켈레톤
   - **에러 상태 UI**: AI 분석 실패 시 graceful 처리
   - **반응형 디자인**: 모바일/태블릿/데스크톱

2. **발음 재생 기능:**
   - Web Speech API 사용 (`src/hooks/useSpeech.ts` 기존 훅 활용)
   - 품사별로 다른 발음 재생 (heteronyms 대응)
   - 발음 재생 버튼: IPA 뒤에 Volume2 아이콘 배치
   - 품사별 `ipa` 값을 참조하여 재생 (실제로는 단어 텍스트를 Web Speech API에 전달)

3. **`src/app/search/[word]/page.tsx` 수정:**
   - `WordAnalysisDisplay` import를 `WordSearchResult`로 변경
   - 기존 품사별 정의 카드 제거 (WordSearchResult 내부에서 통합 표시)
   - 전체 레이아웃:
     ```
     검색 입력창
     +-- 사이드바: 최근 검색
     +-- 메인: WordSearchResult (통합 컴포넌트)
     ```

4. **`src/components/SearchResult.tsx` 수정:**
   - 기존 품사별 정의 카드 렌더링을 `WordSearchResult`에 위임
   - 기존 `WordAnalysisDisplay` 사용 부분을 `WordSearchResult`로 교체
   - AI analysis 데이터를 `WordSearchResult`에 전달

**검증 기준:**
- [ ] `WordSearchResult.tsx`가 생성됨
- [ ] "permit" 검색 시 UI.png과 동일한 구조로 출력됨
- [ ] 음절 표시 (per-mit)가 단어 옆에 정상 표시됨
- [ ] Morpheme Analysis 섹션이 접두사/어근/접미사를 리스트로 표시
- [ ] etymology가 화살표(->) 형태로 표시됨
- [ ] 품사별 섹션이 번호 매기기와 함께 표시 (1. Verb, 2. Noun)
- [ ] 각 품사에 IPA + (US IPA) + 발음 재생 버튼이 표시됨
- [ ] (EN) 영어 정의와 (KR) 한국어 정의가 구분 표시됨
- [ ] Example이 영어 + (한국어 번역) 형태로 표시됨
- [ ] Synonyms/Antonyms가 나열됨
- [ ] 발음 재생 버튼 클릭 시 Web Speech API로 발음 재생
- [ ] heteronym 단어에서 품사별 다른 발음이 재생됨
- [ ] 로딩 스켈레톤이 정상 표시됨
- [ ] AI 분석 실패 시에도 기본 단어 정보는 표시됨
- [ ] 반응형 디자인 정상 (모바일/데스크톱)

**수동 검증:**
- "permit" 검색 -> 2개 품사 섹션 (Verb, Noun) 각각 다른 IPA 표시
- "cat" 검색 -> 1개 품사 섹션 (Noun)
- "record" 검색 -> 2개 품사 섹션 (Verb, Noun) 각각 다른 IPA 표시
- "hello" 검색 -> 감탄사 등 품사에 맞게 표시
- 모바일 뷰포트(375px)에서 레이아웃 깨지지 않는지 확인

**Playwright MCP 테스트 체크리스트:**
- [ ] `/search/permit` 접근 -> "per-mit" 음절 표시 확인
- [ ] `/search/permit` 접근 -> "Morpheme Analysis" 텍스트 존재 확인
- [ ] `/search/permit` 접근 -> "1. Verb" 및 "2. Noun" 텍스트 존재 확인
- [ ] `/search/permit` 접근 -> "(US IPA)" 텍스트 존재 확인
- [ ] `/search/permit` 접근 -> "Synonyms:" 텍스트 존재 확인
- [ ] `/search/cat` 접근 -> 단일 품사 섹션 표시 확인
- [ ] 발음 재생 버튼 클릭 -> 에러 없이 동작 확인
- [ ] 모바일 뷰포트(375x667) -> 레이아웃 정상 확인
- [ ] AI 분석 실패 시뮬레이션 -> 기본 단어 정보 표시 확인

**관련 파일:**
- 새로 생성:
  - `src/components/word/WordSearchResult.tsx` - 메인 통합 UI 컴포넌트
- 수정:
  - `src/components/SearchResult.tsx` - WordSearchResult 통합
  - `src/app/search/[word]/page.tsx` - 레이아웃 수정

---

#### Task 1.5: 통합 테스트 + 엣지 케이스 검증

**목표**: 전체 플로우 E2E 테스트, 다양한 단어 유형별 동작 검증, 에러 핸들링 확인

**구현 사항:**

1. **일반 단어 테스트 (비 heteronym):**
   - "hello" -> 단일 품사, 단일 IPA
   - "computer" -> 다음절 단어, 음절 분리 정확성
   - "beautiful" -> 형용사, 접미사(-ful) 분석
   - "unhappiness" -> 접두사(un-) + 어근(happy) + 접미사(-ness) 완전 분석

2. **Heteronym 테스트:**
   - "permit" -> verb /per'mIt/ vs noun /'p3r.mIt/
   - "record" -> verb /rI'kOrd/ vs noun /'rEkerd/
   - "present" -> verb /prI'zEnt/ vs noun /'prEzent/

3. **발음 재생 테스트:**
   - Web Speech API 발음 재생 버튼 동작 확인
   - 품사별로 다른 발음이 재생되는지 확인

4. **에러 핸들링 테스트:**
   - AI API 실패 시 폴백 동작 확인
   - 예산 초과 시 폴백 전환 확인
   - 네트워크 오류 시 graceful 에러 표시

5. **캐시 테스트:**
   - 서버 메모리 캐시: 동일 단어 재검색 시 캐시 히트
   - localStorage 캐시: 브라우저 새로고침 후 캐시 복원
   - 캐시된 데이터의 새로운 타입(meanings) 정합성

6. **반응형 디자인 테스트:**
   - 모바일 (375px) / 태블릿 (768px) / 데스크톱 (1280px)
   - 긴 단어, 긴 정의, 많은 유의어 시 레이아웃 검증

7. **성능 확인:**
   - AI API 응답 시간 체크 (3초 이내 목표)
   - 캐시 히트 시 즉시 응답 확인

**검증 기준:**
- [ ] 일반 단어 5개 이상 정상 검색 및 표시 확인
- [ ] heteronym 단어 3개 이상 품사별 IPA 분리 확인
- [ ] 발음 재생 버튼 정상 동작 (에러 없음)
- [ ] AI 분석 실패 시 기본 검색 결과 표시 (기존 기능 유지)
- [ ] 예산 초과 시 폴백 분석 정상 전환
- [ ] 서버 메모리 캐시 히트 확인 (콘솔 로그 "[Cache Hit]")
- [ ] 반응형 디자인 3개 뷰포트에서 정상 표시
- [ ] TypeScript 컴파일 에러 없음 (`npm run build`)
- [ ] ESLint 에러 없음 (`npm run lint`)

**수동 검증:**
- 개발 서버에서 5개 이상 다양한 단어 검색 후 UI 확인
- 서버 콘솔에서 "[Cache Hit]", "[AI Success]" 로그 확인
- 브라우저 개발자 도구 Network 탭에서 AI API 응답 시간 확인
- 브라우저 localStorage에서 캐시 데이터 확인

**Playwright MCP 테스트 체크리스트:**
- [ ] `/search/hello` -> 페이지 로드 성공, 품사별 정보 표시
- [ ] `/search/computer` -> 음절 분리 "com-pu-ter" 형태 확인
- [ ] `/search/permit` -> 2개 품사 섹션, 각각 다른 IPA 확인
- [ ] `/search/record` -> 2개 품사 섹션, 각각 다른 IPA 확인
- [ ] `/search/beautiful` -> Morpheme Analysis에 접미사 "-ful" 표시 확인
- [ ] `/search/permit` 재검색 -> 서버 콘솔 "[Cache Hit]" 로그 확인 (또는 응답 시간 단축 확인)
- [ ] 모바일 뷰포트(375x667)에서 `/search/permit` -> 레이아웃 정상
- [ ] 데스크톱 뷰포트(1280x720)에서 `/search/permit` -> 레이아웃 정상
- [ ] 존재하지 않는 단어 `/search/xyzabc` -> 에러 메시지 표시 (기존 기능 유지)

**관련 파일:**
- 참조 (수정 없음, 검증만):
  - `src/components/word/WordSearchResult.tsx`
  - `src/components/SearchResult.tsx`
  - `src/lib/word-analysis-service.ts`
  - `src/lib/ai/prompts.ts`
  - `src/lib/analysis-cache.ts`
  - `src/app/api/words/analyze/route.ts`

---

#### Phase 1 검증 기준 (전체)

**Phonics 제거 확인:**
- [ ] `src/types/phonics.ts` 파일 삭제됨
- [ ] `src/lib/grapheme-sounds.ts` 파일 삭제됨
- [ ] `src/components/word/PhonicsDisplay.tsx` 파일 삭제됨 (존재 시)
- [ ] 프로젝트 전체에서 `PhonicsAnalysis`, `Phoneme`, `getGraphemeSound` 참조 없음
- [ ] AI 프롬프트에서 phonics/phoneme 분석 요청 없음

**타입 및 인터페이스:**
- [ ] `MeaningEntry` 타입이 정의됨 (partOfSpeech, ipa, definitionEn, definitionKo, examples, synonyms, antonyms)
- [ ] `WordAnalysisResponse`가 morpheme + syllables + meanings 구조
- [ ] `SyllabificationResult`가 단일 객체 (배열 아님)
- [ ] TypeScript 컴파일 에러 없음

**AI API:**
- [ ] GPT-4o 모델로 기본 설정 ($50/월 예산)
- [ ] 모든 IPA가 US (미국식) 기준으로 반환됨
- [ ] 통합 프롬프트 1회 호출로 syllables + morpheme + meanings 처리
- [ ] heteronyms 감지 및 품사별 IPA 분리 정상 작동

**UI 출력:**
- [ ] UI.png/UI.md 기준과 동일한 출력 구조
- [ ] 음절 표시 (per-mit) 정상
- [ ] Morpheme Analysis 섹션 정상 (접두사/어근/접미사 + 어원)
- [ ] 품사별 섹션: 번호 + 품사명 + IPA + (US IPA) + 발음 재생 버튼
- [ ] (EN)/(KR) 정의, Example, Synonyms, Antonyms 표시
- [ ] 반응형 디자인 (모바일/데스크톱)

**발음 재생:**
- [ ] Web Speech API 기반 발음 재생 정상
- [ ] 품사별로 다른 발음 재생 (heteronyms)

**Heteronyms:**
- [ ] "permit" 검색 시 verb/noun 다른 IPA 표시
- [ ] "record" 검색 시 verb/noun 다른 IPA 표시
- [ ] 일반 단어는 단일 품사별 정보 정상 표시

**캐시:**
- [ ] 서버 메모리 캐시 정상 작동
- [ ] localStorage 캐시 정상 작동 (무제한)
- [ ] 캐시된 데이터가 새로운 타입 구조와 호환

**통합 테스트:**
- [ ] 검색 결과 페이지에 새로운 UI 구조 정상 표시
- [ ] AI 분석 실패 시 폴백 처리 정상 (기존 기능에 영향 없음)
- [ ] Playwright MCP로 전체 플로우 E2E 테스트 통과
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과

---

### Phase 2: 다크모드 추가

> **목표**: 사용자 경험 개선 - 다크/라이트 테마 전환 기능
> **예상 기간**: 1일
> **이유**: CSS 변수 이미 정의됨, 빠른 성과 가능

#### Task 2.1: next-themes 설정
- `next-themes` 패키지 설치
- `ThemeProvider` 컴포넌트 추가 (`src/components/providers/ThemeProvider.tsx`)
- Root Layout에 통합 (`app/layout.tsx`)

#### Task 2.2: 테마 토글 UI 구현
- `ThemeToggle` 컴포넌트 생성 (`src/components/layout/ThemeToggle.tsx`)
- Header에 토글 버튼 추가
- 아이콘: lucide-react (`Sun`, `Moon`)

#### Task 2.3: 테마 지속성 및 SSR 처리
- localStorage에 사용자 선호도 저장
- Hydration mismatch 방지 (useEffect + mounted 상태)

#### 검증 기준
- [ ] 토글 버튼 클릭 시 즉시 테마 전환
- [ ] 새로고침 시 선택한 테마 유지
- [ ] SSR 안전성 (hydration mismatch 없음)
- [ ] 모든 컴포넌트에서 다크모드 정상 작동

**관련 파일:**
- 새로 생성: `src/components/providers/ThemeProvider.tsx`, `src/components/layout/ThemeToggle.tsx`
- 수정: `src/app/layout.tsx`, `src/components/layout/Header.tsx`

---

### Phase 3: Supabase 설정 + 인증 시스템

> **목표**: 사용자 계정 관리 및 인증 시스템 구축
> **예상 기간**: 2일

#### Task 3.1: Supabase 프로젝트 설정
- Supabase 프로젝트 생성
- 환경 변수 설정 (`.env.local`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `@supabase/supabase-js`, `@supabase/ssr` 패키지 설치

#### Task 3.2: Supabase 클라이언트 설정
- 클라이언트 생성 함수 (`src/lib/supabase/client.ts`)
- 서버 컴포넌트용 클라이언트 (`src/lib/supabase/server.ts`)
- 미들웨어 설정 (`middleware.ts`) - 세션 새로고침

#### Task 3.3: 인증 페이지 구현
- 로그인 페이지 (`app/auth/login/page.tsx`)
  - 이메일/비밀번호 로그인
  - 소셜 로그인 (Google, GitHub - 선택)
- 회원가입 페이지 (`app/auth/signup/page.tsx`)
  - 이메일 인증 플로우
- 로그아웃 기능

#### Task 3.4: 인증 상태 관리
- Auth Provider 컴포넌트 (`src/components/providers/AuthProvider.tsx`)
- 사용자 정보 표시 (Header에 사용자 이름, 프로필 사진)
- 보호된 라우트 (로그인 필요한 페이지)

#### 검증 기준
- [ ] 회원가입 -> 이메일 인증 -> 로그인 플로우 정상 작동
- [ ] 소셜 로그인 정상 작동 (선택 시)
- [ ] 세션 지속성 (새로고침 시 로그인 상태 유지)
- [ ] 미들웨어 리다이렉트 (미로그인 시 /auth/login으로 이동)
- [ ] Playwright MCP로 인증 플로우 E2E 테스트 수행

**관련 파일:**
- 새로 생성:
  - `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
  - `middleware.ts`
  - `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`
  - `src/components/providers/AuthProvider.tsx`
- 수정: `src/app/layout.tsx`, `src/components/layout/Header.tsx`

---

### Phase 4: 데이터베이스 스키마 + 검색 기록 마이그레이션

> **목표**: 사용자별 데이터 저장 및 localStorage -> Supabase 전환
> **예상 기간**: 1일

#### Task 4.1: 데이터베이스 스키마 설계
**테이블 구조:**

```sql
-- 사용자 프로필 (Supabase Auth와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 검색 기록
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  searched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word, searched_at)
);

-- 단어 학습 상태
CREATE TABLE word_learning_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  status TEXT CHECK (status IN ('learning', 'reviewing', 'mastered')),
  last_reviewed_at TIMESTAMP,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- 테스트 결과
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score NUMERIC(5, 2),
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_learning_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 데이터만 읽기/쓰기
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Task 4.2: API 라우트 생성
- `/api/search/history` - 검색 기록 CRUD
  - GET: 최근 검색 조회
  - POST: 검색 기록 저장
  - DELETE: 검색 기록 삭제
- `/api/words/learning-status` - 단어 학습 상태 관리

#### Task 4.3: localStorage -> Supabase 마이그레이션
- `useRecentSearches.ts` 수정
  - localStorage 읽기 (기존 데이터)
  - Supabase에 동기화
  - 로그인 시 자동 마이그레이션
- `SearchTracker.tsx` 수정 (서버 저장)

#### 검증 기준
- [ ] 모든 테이블 및 RLS 정책 생성 완료
- [ ] API 라우트에서 CRUD 작업 정상 작동
- [ ] 검색 시 Supabase에 기록 저장
- [ ] 로그인 시 기존 localStorage 데이터 마이그레이션
- [ ] Playwright MCP를 활용한 API 엔드포인트 통합 테스트

**관련 파일:**
- 새로 생성:
  - `supabase/migrations/001_initial_schema.sql`
  - `app/api/search/history/route.ts`
  - `app/api/words/learning-status/route.ts`
- 수정: `src/hooks/useRecentSearches.ts`, `src/components/SearchTracker.tsx`

---

### Phase 5: 학습 진도 대시보드

> **목표**: 사용자별 학습 통계 및 진도 시각화
> **예상 기간**: 2일

#### Task 5.1: 대시보드 페이지 생성
- `/dashboard` 페이지 (`app/dashboard/page.tsx`)
- 레이아웃: 사이드바 + 메인 콘텐츠

#### Task 5.2: 통계 데이터 API
- `/api/dashboard/stats` - 학습 통계 조회
  - 총 검색 단어 수
  - 학습 중/복습 중/마스터한 단어 수
  - 일별/주별/월별 검색 횟수
  - 최근 학습 단어 목록

#### Task 5.3: 통계 시각화 컴포넌트
- `DashboardStats.tsx` - 요약 카드 (총 단어 수, 학습률 등)
- `SearchActivityChart.tsx` - 시간별 검색 활동 차트 (Recharts 사용)
- `WordStatusPieChart.tsx` - 단어 상태 분포 (학습 중/복습 중/마스터)
- `RecentWordsList.tsx` - 최근 학습 단어 목록

#### Task 5.4: 사이드바 네비게이션
- 대시보드, 검색, 테스트, 설정 메뉴
- 현재 페이지 하이라이트

#### 검증 기준
- [ ] 대시보드에 통계 카드 정상 표시
- [ ] 차트가 실제 데이터 반영
- [ ] 반응형 디자인 (모바일에서도 정상 표시)
- [ ] 로딩/에러 상태 처리

**관련 파일:**
- 새로 생성:
  - `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`
  - `app/api/dashboard/stats/route.ts`
  - `src/components/dashboard/DashboardStats.tsx`
  - `src/components/dashboard/SearchActivityChart.tsx`
  - `src/components/dashboard/WordStatusPieChart.tsx`
  - `src/components/dashboard/RecentWordsList.tsx`
  - `src/components/layout/Sidebar.tsx`

---

### Phase 6: 단어 암기 테스트

> **목표**: 학습한 단어 복습 및 장기 기억 강화
> **예상 기간**: 2일

#### Task 6.1: 테스트 페이지 구현
- `/test` 페이지 (`app/test/page.tsx`)
  - 테스트 시작 화면
  - 난이도 선택 (초급/중급/고급)
  - 문제 수 선택 (10/20/30문제)

#### Task 6.2: 문제 생성 로직
- `/api/test/generate` - 문제 생성 API
  - 사용자의 학습 기록에서 단어 추출
  - 학습 상태별 가중치 (learning > reviewing > mastered)
  - 문제 타입:
    1. 뜻 보고 단어 맞추기 (객관식)
    2. 단어 보고 뜻 맞추기 (객관식)
    3. 발음 듣고 단어 맞추기 (객관식)

#### Task 6.3: 테스트 진행 UI
- `TestQuestion.tsx` - 문제 표시 컴포넌트
- `TestProgress.tsx` - 진행률 표시 (5/20)
- `TestTimer.tsx` - 타이머 (선택)
- 정답/오답 즉시 피드백

#### Task 6.4: 결과 페이지
- `/test/result/[id]` 페이지 (`app/test/result/[id]/page.tsx`)
  - 점수 표시 (80/100)
  - 정답/오답 통계
  - 틀린 문제 복습
  - 결과 공유 (선택)

#### Task 6.5: 학습 상태 업데이트
- 테스트 결과에 따라 `word_learning_status` 업데이트
  - 정답 -> `correct_count++`
  - 오답 -> `incorrect_count++`
  - 3회 연속 정답 -> 상태 변경 (learning -> reviewing -> mastered)

#### 검증 기준
- [ ] 테스트 시작 -> 문제 풀이 -> 결과 확인 플로우 정상 작동
- [ ] 문제가 사용자의 학습 기록 기반으로 생성됨
- [ ] 정답/오답 피드백 즉시 표시
- [ ] 결과가 데이터베이스에 저장됨
- [ ] 학습 상태 자동 업데이트
- [ ] Playwright MCP로 테스트 전체 플로우 E2E 테스트 수행

**관련 파일:**
- 새로 생성:
  - `app/test/page.tsx`
  - `app/test/result/[id]/page.tsx`
  - `app/api/test/generate/route.ts`
  - `app/api/test/submit/route.ts`
  - `src/components/test/TestQuestion.tsx`
  - `src/components/test/TestProgress.tsx`
  - `src/components/test/TestTimer.tsx`
  - `src/components/test/TestResult.tsx`

---

### Phase 7: 최적화 및 배포

> **목표**: 성능 최적화, 보안 강화, 프로덕션 배포
> **예상 기간**: 1일

#### Task 7.1: 성능 최적화
- 이미지 최적화 (Next.js Image 컴포넌트)
- 코드 스플리팅 (동적 import)
- React 렌더링 최적화 (React.memo, useMemo, useCallback)
- Supabase 쿼리 최적화 (인덱싱, 캐싱)

#### Task 7.2: 보안 강화
- 환경 변수 검증 (Zod 사용)
- API Rate Limiting (Upstash Redis + next-rate-limit)
- XSS, CSRF 방어
- Supabase RLS 정책 재검토

#### Task 7.3: 에러 처리 및 모니터링
- Sentry 통합 (에러 추적)
- 에러 바운더리 추가 (`error.tsx`, `global-error.tsx`)
- 분석 도구 (Google Analytics 또는 Vercel Analytics)

#### Task 7.4: Vercel 배포
- 환경 변수 설정 (Vercel Dashboard)
- Supabase 프로덕션 환경 설정
- 도메인 연결 (선택)
- HTTPS 설정 (Vercel 자동)

#### Task 7.5: E2E 테스트 (Playwright)
- 주요 사용자 플로우 테스트:
  1. 회원가입 -> 로그인 -> 검색 -> 로그아웃
  2. 단어 검색 -> Word Analysis 통합 섹션 확인 -> 음성 재생 -> 검색 기록 확인
  3. 대시보드 접속 -> 통계 확인
  4. 테스트 시작 -> 문제 풀이 -> 결과 확인

#### 검증 기준
- [ ] Lighthouse 점수: 성능 90+, 접근성 95+, SEO 100
- [ ] Vercel 배포 성공 (프로덕션 URL 생성)
- [ ] Supabase 프로덕션 DB 연결 정상
- [ ] E2E 테스트 모두 통과
- [ ] 에러 모니터링 활성화

**관련 파일:**
- 새로 생성:
  - `tests/e2e/` - Playwright 테스트 파일
  - `src/lib/env.ts` - 환경 변수 검증
  - `app/error.tsx`, `app/global-error.tsx`
- 수정: `next.config.ts` (Sentry, 환경 변수)

---

## 예상 파일 구조 (고도화 후)

```
src/
+-- app/
|   +-- auth/                     # 인증 페이지
|   |   +-- login/page.tsx
|   |   +-- signup/page.tsx
|   +-- dashboard/                # 대시보드
|   |   +-- page.tsx
|   |   +-- layout.tsx
|   +-- test/                     # 테스트
|   |   +-- page.tsx
|   |   +-- result/[id]/page.tsx
|   +-- api/                      # API 라우트
|   |   +-- search/history/route.ts
|   |   +-- words/
|   |   |   +-- analyze/route.ts        # [Phase 1] AI 통합 분석 API (형태소+음절+품사별 상세+heteronyms)
|   |   |   +-- learning-status/route.ts
|   |   +-- dashboard/stats/route.ts
|   |   +-- test/generate/route.ts
|   |   +-- test/submit/route.ts
|   +-- (기존 페이지들...)
+-- components/
|   +-- providers/                # Context 제공자
|   |   +-- ThemeProvider.tsx
|   |   +-- AuthProvider.tsx
|   +-- dashboard/                # 대시보드 컴포넌트
|   +-- test/                     # 테스트 컴포넌트
|   +-- word/                     # [Phase 1] 단어 분석 컴포넌트
|   |   +-- WordSearchResult.tsx     # 메인 통합 UI (신규 - UI.png 기반)
|   |   +-- TranslationDisplay.tsx   # 한글 번역 UI (유지 또는 WordSearchResult에 통합)
|   +-- (기존 컴포넌트들...)
+-- lib/
|   +-- supabase/                 # Supabase 클라이언트
|   |   +-- client.ts
|   |   +-- server.ts
|   +-- ai/                       # [Phase 1] AI API 클라이언트
|   |   +-- client.ts             # AI 클라이언트 팩토리
|   |   +-- openai-client.ts      # OpenAI 클라이언트 (GPT-4o)
|   |   +-- anthropic-client.ts   # Anthropic 클라이언트 (Claude Opus 4.5)
|   |   +-- prompts.ts            # 프롬프트 템플릿 (US IPA, meanings, heteronyms)
|   |   +-- cost-tracker.ts       # 비용 추적기 (GPT-4o 기준, $50/월)
|   +-- syllabification.ts        # [Phase 1] 음절 분리 유틸리티 (AI 전용)
|   +-- heteronyms-detector.ts    # [Phase 1] 동형이의어 감지 유틸리티
|   +-- word-analysis-service.ts  # [Phase 1] 통합 단어 분석 서비스
|   +-- analysis-cache.ts         # [Phase 1] 캐시 관리자
|   +-- (기존 라이브러리들...)
+-- hooks/
|   +-- useAuth.ts                # 인증 훅
|   +-- useAnalysis.ts            # [Phase 1] 단어 분석 훅
|   +-- (기존 훅들...)
+-- types/
    +-- meaning.ts                # [Phase 1] 품사별 상세 정보 타입 (신규)
    +-- syllable.ts               # [Phase 1] 음절 분리 타입 (source: 'ai' | 'cache')
    +-- morpheme.ts               # [Phase 1] 형태소 분석 타입 (어원 포함)
    +-- ai.ts                     # [Phase 1] AI 프로바이더 공통 타입 (meanings 지원)
    +-- database.ts               # Supabase 타입
    +-- (기존 타입들...)

supabase/
+-- migrations/
    +-- 001_initial_schema.sql

tests/
+-- e2e/
    +-- auth.spec.ts
    +-- search.spec.ts
    +-- word-analysis.spec.ts     # [Phase 1] 단어 분석 테스트 (UI.png 기반 UI + heteronyms)
    +-- dashboard.spec.ts
    +-- test.spec.ts

middleware.ts                     # Next.js 미들웨어 (세션 관리)
```

---

## 품질 체크리스트

### Phase 1: UI 출력 구조 변경 + AI 통합 질의 재구성
- [ ] PhonicsAnalysis, Phoneme 관련 모든 타입/코드 완전 제거
- [ ] grapheme-sounds.ts 파일 삭제됨
- [ ] phonics.ts 타입 파일 삭제됨
- [ ] translation.ts 타입 파일 삭제됨 (meanings에 통합)
- [ ] meaning.ts 신규 타입 파일 생성 (MeaningEntry, MeaningExample)
- [ ] AI 전용 음절 분리 정상 동작 (정확도 95%+)
- [ ] GPT-4o 모델 기본 설정, 월간 예산 $50
- [ ] 모든 IPA가 US (미국식) 기준으로 반환
- [ ] 통합 프롬프트 1회 호출로 syllables + morpheme + meanings 처리
- [ ] meanings에 품사별 IPA, 영어/한국어 정의, 예문, 유의어/반의어 포함
- [ ] heteronyms 감지 및 품사별 다른 IPA 표시 (permit, record 등)
- [ ] UI.png/UI.md 기준 출력 구조 완성
- [ ] 음절 표시 (per-mit) 단어 옆에 정상 표시
- [ ] Morpheme Analysis 섹션 (접두사/어근/접미사 + 어원) 정상 표시
- [ ] 품사별 섹션: 번호 + IPA + (US IPA) + 발음 재생 버튼
- [ ] (EN)/(KR) 정의, Example, Synonyms, Antonyms 표시
- [ ] Web Speech API 품사별 발음 재생 정상
- [ ] 서버 메모리 캐시 정상 동작
- [ ] localStorage 캐시 정상 작동 (무제한)
- [ ] 비용 추적기 정상 (GPT-4o 기준)
- [ ] 예산 초과 시 폴백 분석 전환 및 안내
- [ ] 폴백 분석 정상 동작 (AI 실패 시 패턴 매칭)
- [ ] 검색 결과 페이지 새로운 UI 구조 완성
- [ ] 반응형 디자인 정상 (모바일/데스크톱)
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과
- [ ] Playwright MCP E2E 테스트 통과

### Phase 2: 다크모드
- [ ] 토글 버튼 정상 작동
- [ ] 테마 지속성 (localStorage)
- [ ] SSR 안전성 (hydration mismatch 없음)
- [ ] 모든 페이지에서 다크모드 정상 표시

### Phase 3: 인증 시스템
- [ ] 회원가입/로그인/로그아웃 플로우 정상
- [ ] 이메일 인증 작동 (Supabase)
- [ ] 세션 지속성 (새로고침 시 유지)
- [ ] 보호된 라우트 리다이렉트 정상

### Phase 4: 데이터베이스
- [ ] 모든 테이블 생성 완료
- [ ] RLS 정책 정상 작동 (자신의 데이터만 접근)
- [ ] API 라우트 CRUD 정상
- [ ] localStorage -> Supabase 마이그레이션 성공

### Phase 5: 대시보드
- [ ] 통계 데이터 정확성
- [ ] 차트 정상 렌더링
- [ ] 반응형 디자인
- [ ] 로딩/에러 상태 처리

### Phase 6: 테스트
- [ ] 테스트 시작 -> 결과 확인 플로우 정상
- [ ] 문제 생성 로직 정확성
- [ ] 정답/오답 피드백 정상
- [ ] 학습 상태 자동 업데이트

### Phase 7: 배포
- [ ] Lighthouse 점수 달성
- [ ] E2E 테스트 통과
- [ ] Vercel 배포 성공
- [ ] 에러 모니터링 활성화

---

## 참고 자료

### 기존 문서
- [PRD.md](./PRD.md) - 제품 요구사항 명세
- [ROADMAP_v1.md](./roadmaps/ROADMAP_v1.md) - MVP 개발 로드맵

### 기술 문서 - Phase 1 핵심
- [OpenAI API 문서](https://platform.openai.com/docs) - GPT-4o 모델 API
- [OpenAI 가격 정책](https://openai.com/api/pricing/) - GPT-4o: $2.50/1M input, $10.00/1M output
- [Anthropic API 문서](https://docs.anthropic.com/en/docs) - Claude Opus 4.5 모델 API
- [Anthropic 가격 정책](https://www.anthropic.com/pricing) - 모델별 토큰 비용
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - 품사별 발음 재생
- [Free Dictionary API](https://dictionaryapi.dev/) - Heteronyms phonetics 감지 참고
- UI 참고: `UI.png`, `UI.md` (프로젝트 루트)

### 기술 문서 - 기타
- [Supabase 문서](https://supabase.com/docs)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Recharts](https://recharts.org/)

### Next.js & React
- [Next.js 16 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev/)
- [Vercel 배포 가이드](https://vercel.com/docs)

---

## 마일스톤

| Phase | 내용 | 기간 | 누적 | 완료 목표 |
|-------|------|------|------|----------|
| Phase 1 | UI 출력 구조 변경 + AI 통합 질의 재구성 (Phonics 제거, meanings 통합) | 5일 | 5일 | 2026-02-04 |
| Phase 2 | 다크모드 | 1일 | 6일 | 2026-02-05 |
| Phase 3 | 인증 시스템 | 2일 | 8일 | 2026-02-07 |
| Phase 4 | 데이터베이스 | 1일 | 9일 | 2026-02-08 |
| Phase 5 | 대시보드 | 2일 | 11일 | 2026-02-10 |
| Phase 6 | 단어 암기 테스트 | 2일 | 13일 | 2026-02-12 |
| Phase 7 | 최적화 및 배포 | 1일 | 14일 | 2026-02-13 |

**총 예상 기간: 14일** (약 3주)

---

**마지막 업데이트**: 2026-01-30
**버전**: 4.0 (Phase 1 전면 재구성 - Phonics 완전 제거, UI.png 기반 출력 구조, meanings 통합, heteronyms)
**상태**: Phase 1 전면 재구성 진행 중
