# 영어 단어 학습 사전 MVP 개발 로드맵

영어 단어를 검색하고 발음, 뜻, 예문을 확인하여 효과적으로 학습할 수 있는 웹 사전 애플리케이션

## 개요

영어 단어 학습 사전은 영어를 학습하는 전체 연령대 사용자(학생, 직장인, 일반인)를 위한 웹 기반 사전으로 다음 기능을 제공합니다:

- **단어 검색 (F001)**: Free Dictionary API를 활용한 영어 단어 검색
- **발음 학습 (F002, F004)**: IPA 발음 기호 표시 및 음성 재생 (속도 조절 가능)
- **단어 뜻 표시 (F003)**: 품사별 영어 정의 표시
- **예문 학습 (F005, F006)**: 예시 문장 표시 및 음성 재생
- **학습 이력 (F010)**: localStorage 기반 최근 검색 기록 관리
- **사용자 경험 (F011, F012)**: 오류 처리 및 로딩 상태 표시

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.5 (App Router), React 19.2.3 |
| 언어 | TypeScript 5.7+ |
| 스타일링 | Tailwind CSS v4, shadcn/ui (new-york 스타일) |
| 아이콘 | Lucide React |
| 외부 API | Free Dictionary API, Web Speech API |
| 데이터 저장 | localStorage |
| 배포 | Vercel |

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
- 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조
- 초기 상태의 샘플로 `000-sample.md` 참조

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 완료 표시로 변경

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> **목표**: 전체 애플리케이션 구조와 타입 시스템 확립
> **예상 기간**: 0.5일

- **Task 001: 프로젝트 구조 및 라우팅 설정** - 우선순위
  - Next.js App Router 기반 전체 라우트 구조 생성
    - `/` (홈페이지 - 검색 페이지)
    - `/search/[word]` (검색 결과 페이지)
  - 공통 레이아웃 컴포넌트 골격 구현 (Header, Footer)
  - 페이지별 빈 껍데기 파일 생성
  - 메타데이터 설정 (title, description)

- **Task 002: 타입 정의 및 인터페이스 설계**
  - TypeScript 인터페이스 정의 (`src/types/`)
    - `DictionaryResponse`: Free Dictionary API 응답 타입
    - `WordData`: 단어 정보 타입 (word, phonetic, meanings)
    - `Meaning`: 품사별 정의 타입
    - `Definition`: 개별 정의 타입 (definition, example)
    - `Phonetic`: 발음 정보 타입 (text, audio)
    - `RecentSearch`: 최근 검색 기록 타입
  - API 호출 함수 시그니처 정의 (`src/lib/api.ts`)
  - 상수 정의 (`src/lib/constants.ts`)
    - API 엔드포인트
    - 재생 속도 옵션 (0.5x, 0.75x, 1x, 1.25x, 1.5x)
    - 최대 검색 기록 수 (10개)

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> **목표**: 모든 페이지 UI를 더미 데이터로 완성하여 사용자 플로우 검증
> **예상 기간**: 1.5일

- **Task 003: shadcn/ui 컴포넌트 설치 및 공통 컴포넌트 구현** - 우선순위
  - shadcn/ui 컴포넌트 설치
    - Button, Input, Card, Skeleton, Alert, Slider (또는 Select)
  - 커스텀 공통 컴포넌트 구현 (`src/components/`)
    - `SearchInput`: 검색 입력창 컴포넌트
    - `PlayButton`: 음성 재생 버튼 컴포넌트
    - `SpeedControl`: 재생 속도 조절 컴포넌트
    - `LoadingSpinner`: 로딩 인디케이터 컴포넌트
    - `ErrorMessage`: 에러 메시지 컴포넌트
  - 더미 데이터 생성 유틸리티 작성 (`src/lib/mock-data.ts`)

- **Task 004: 홈페이지 (검색 페이지) UI 구현**
  - 기능 범위: F001 (단어 검색), F010 (최근 검색 기록)
  - 페이지 레이아웃 구현
    - 헤더 (로고, 타이틀)
    - 메인 검색 영역 (검색창 자동 포커스, 검색 버튼)
    - 최근 검색 기록 영역 (사이드바 또는 하단)
  - 검색 입력 유효성 검사 UI (영어 알파벳만 허용)
  - 키보드 지원 (Enter 키로 검색)
  - 더미 최근 검색 기록 표시
  - 반응형 디자인 적용 (모바일/태블릿/데스크톱)

- **Task 005: 검색 결과 페이지 UI 구현**
  - 기능 범위: F001-F006, F010-F012
  - 페이지 레이아웃 구현
    - 검색창 (헤더 고정)
    - 최근 검색 기록 (사이드바)
    - 검색 결과 메인 영역
  - 단어 정보 카드 UI
    - 단어 제목 표시
    - IPA 발음 기호 표시 (F002)
    - 단어 음성 재생 버튼 (F004)
    - 재생 속도 조절 컨트롤
  - 품사별 정의 목록 UI (F003)
    - 품사 라벨 (noun, verb, adjective 등)
    - 번호 매기기된 정의 목록
  - 예시 문장 영역 UI (F005, F006)
    - 예문 목록
    - 각 예문별 재생 버튼
    - 예문 재생 속도 조절
  - 로딩 상태 UI (F012)
    - Skeleton 컴포넌트 활용
  - 에러 상태 UI (F011)
    - 단어 미발견 메시지
    - API 오류 메시지
  - 반응형 디자인 적용

---

### Phase 3: 핵심 기능 구현

> **목표**: 실제 API 연동 및 핵심 비즈니스 로직 구현
> **예상 기간**: 2일

- **Task 006: Free Dictionary API 연동** - 우선순위
  - API 호출 함수 구현 (`src/lib/api.ts`)
    - `searchWord(word: string): Promise<DictionaryResponse>`
    - 에러 핸들링 (404, 네트워크 오류)
  - 더미 데이터를 실제 API 호출로 교체
  - API 응답 데이터 파싱 및 정규화
  - 로딩 상태 관리
  - Playwright MCP를 활용한 API 통합 테스트
    - 정상 검색 테스트
    - 존재하지 않는 단어 검색 테스트
    - 네트워크 오류 시나리오 테스트

- **Task 007: 단어 음성 재생 기능 구현 (F004)**
  - Web Speech API 유틸리티 구현 (`src/lib/speech.ts`)
    - `speak(text: string, rate: number): void`
    - `stopSpeaking(): void`
    - `isSpeaking(): boolean`
    - `isSpeechSupported(): boolean`
  - API 오디오 파일 재생 기능 (우선)
    - Free Dictionary API에서 제공하는 mp3 파일 재생
  - Web Speech API 폴백 처리
    - 오디오 파일 없는 경우 TTS 사용
  - 재생/일시정지 상태 관리
  - 재생 속도 조절 기능 (0.5x, 0.75x, 1x, 1.25x, 1.5x)
  - 브라우저 호환성 처리
  - Playwright MCP를 활용한 음성 재생 테스트

- **Task 008: 예문 표시 및 음성 재생 기능 구현 (F005, F006)**
  - 예문 데이터 추출 및 표시 로직
    - API 응답에서 example 필드 추출
    - 예문이 있는 정의만 필터링
  - 예문 없는 경우 처리 ("예문 없음" 메시지)
  - 각 예문별 독립적인 음성 재생
  - 예문 재생 속도 조절
  - Playwright MCP를 활용한 예문 기능 테스트

- **Task 009: 최근 검색 기록 기능 구현 (F010)**
  - localStorage 커스텀 훅 구현 (`src/hooks/useRecentSearches.ts`)
    - `getRecentSearches(): string[]`
    - `addToRecentSearches(word: string): void`
    - `clearRecentSearches(): void`
  - SSR 호환성 처리
    - 'use client' 지시어 사용
    - useEffect 내에서만 localStorage 접근
    - hydration mismatch 방지
  - 최대 10개 제한 로직
  - 중복 검색 시 최상단 이동
  - 클릭 시 해당 단어 재검색
  - Playwright MCP를 활용한 검색 기록 테스트

- **Task 009-1: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 테스트
    - 홈페이지 접속 -> 단어 검색 -> 결과 확인 플로우
    - 발음 재생 -> 속도 조절 플로우
    - 예문 확인 -> 예문 재생 플로우
    - 최근 검색 클릭 -> 재검색 플로우
  - API 연동 및 비즈니스 로직 검증
  - 에러 핸들링 및 엣지 케이스 테스트
    - 존재하지 않는 단어 검색
    - 특수문자 입력
    - 빈 입력 검색 시도

---

### Phase 4: 사용자 경험 개선

> **목표**: 에러 처리, 로딩 상태, 유효성 검사 등 UX 완성
> **예상 기간**: 0.5일

- **Task 010: 입력 유효성 검사 및 에러 처리 (F011)** - 우선순위
  - 검색 입력 유효성 검사
    - 영어 알파벳만 허용 (정규식 검증)
    - 빈 입력 방지
    - 경고 메시지 표시
  - API 에러 처리
    - 404 (단어 미발견): "단어를 찾을 수 없습니다" 메시지
    - 네트워크 오류: "오류가 발생했습니다. 다시 시도해주세요" 메시지
  - Web Speech API 미지원 브라우저 처리
    - 기능 감지 후 대체 UI 제공
    - 재생 버튼 비활성화 또는 숨김

- **Task 011: 로딩 상태 및 피드백 개선 (F012)**
  - API 호출 중 로딩 상태 표시
    - Skeleton 컴포넌트 활용
    - 검색 버튼 비활성화
  - 음성 재생 중 시각적 피드백
    - 재생 중 버튼 상태 변경
    - 재생 완료 시 상태 복원
  - 부드러운 화면 전환
    - 로딩 -> 결과 애니메이션

---

### Phase 5: 최적화 및 배포

> **목표**: 성능 최적화, 접근성 개선, 프로덕션 배포
> **예상 기간**: 0.5일

- **Task 012: 반응형 디자인 및 접근성 개선** - 우선순위
  - 반응형 디자인 최종 검토
    - 모바일 (320px ~ 768px)
    - 태블릿 (768px ~ 1024px)
    - 데스크톱 (1024px ~)
  - 접근성 개선
    - 키보드 네비게이션 지원
    - ARIA 라벨 추가
    - 색상 대비 검토
    - 스크린 리더 호환성
  - 브라우저 호환성 테스트
    - Chrome, Safari, Firefox, Edge
    - 모바일 브라우저

- **Task 013: 성능 최적화 및 SEO**
  - 성능 최적화
    - 이미지 최적화 (Next.js Image 컴포넌트)
    - 코드 스플리팅
    - 불필요한 리렌더링 방지
  - SEO 최적화
    - 메타 태그 설정
    - Open Graph 태그
    - 시맨틱 HTML 구조

- **Task 014: Vercel 배포 및 최종 테스트**
  - Vercel 프로젝트 연동
  - 환경 변수 설정 (필요 시)
  - 프로덕션 빌드 테스트 (`npm run build`)
  - 배포 후 체크리스트 검증
    - 모바일/데스크톱 반응형 확인
    - 주요 브라우저 테스트
    - Web Speech API 호환성 확인
    - API 속도 및 안정성 확인
    - localStorage hydration mismatch 테스트
    - 네트워크 오류 상황 테스트
  - Playwright MCP를 활용한 프로덕션 E2E 테스트

---

## 기능별 작업 매핑

| 기능 ID | 기능명 | 관련 Task |
|---------|--------|-----------|
| F001 | 단어 검색 | Task 004, Task 005, Task 006 |
| F002 | 발음 정보 표시 | Task 005, Task 006 |
| F003 | 단어 뜻 표시 | Task 005, Task 006 |
| F004 | 음성 재생 | Task 005, Task 007 |
| F005 | 예시 문장 표시 | Task 005, Task 008 |
| F006 | 예문 음성 재생 | Task 005, Task 008 |
| F010 | 최근 검색 기록 | Task 004, Task 005, Task 009 |
| F011 | 검색 오류 처리 | Task 005, Task 010 |
| F012 | 로딩 상태 표시 | Task 005, Task 011 |

---

## 파일 구조 (예상)

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈페이지 (검색 페이지)
│   ├── globals.css             # 전역 스타일
│   └── search/
│       └── [word]/
│           └── page.tsx        # 검색 결과 페이지
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── skeleton.tsx
│   │   ├── alert.tsx
│   │   └── slider.tsx
│   ├── layout/
│   │   ├── Header.tsx          # 공통 헤더
│   │   └── Footer.tsx          # 공통 푸터
│   ├── search/
│   │   ├── SearchInput.tsx     # 검색 입력창
│   │   └── RecentSearches.tsx  # 최근 검색 기록
│   └── word/
│       ├── WordCard.tsx        # 단어 정보 카드
│       ├── PhoneticDisplay.tsx # 발음 기호 표시
│       ├── PlayButton.tsx      # 음성 재생 버튼
│       ├── SpeedControl.tsx    # 재생 속도 조절
│       ├── MeaningsList.tsx    # 품사별 정의 목록
│       └── ExamplesList.tsx    # 예문 목록
├── hooks/
│   ├── useRecentSearches.ts    # 최근 검색 기록 훅
│   ├── useSpeech.ts            # 음성 재생 훅
│   └── useWordSearch.ts        # 단어 검색 훅
├── lib/
│   ├── utils.ts                # 유틸리티 함수 (cn 헬퍼)
│   ├── api.ts                  # API 호출 함수
│   ├── speech.ts               # Web Speech API 유틸리티
│   ├── constants.ts            # 상수 정의
│   └── mock-data.ts            # 더미 데이터
└── types/
    └── index.ts                # TypeScript 타입 정의

tasks/
├── 000-sample.md               # 작업 파일 샘플
├── 001-project-structure.md    # Task 001 작업 파일
├── 002-type-definitions.md     # Task 002 작업 파일
└── ...
```

---

## 예상 일정

| Phase | 기간 | 누적 |
|-------|------|------|
| Phase 1: 애플리케이션 골격 구축 | 0.5일 | 0.5일 |
| Phase 2: UI/UX 완성 | 1.5일 | 2일 |
| Phase 3: 핵심 기능 구현 | 2일 | 4일 |
| Phase 4: 사용자 경험 개선 | 0.5일 | 4.5일 |
| Phase 5: 최적화 및 배포 | 0.5일 | 5일 |

**총 예상 개발 기간: 4-5일**

---

## 품질 체크리스트

### 기본 요구사항
- [ ] PRD의 모든 핵심 기능(F001-F006, F010-F012)이 구현되었는가?
- [ ] 모든 Acceptance Criteria가 충족되었는가?
- [ ] TypeScript 타입 안전성이 보장되는가?

### 구조 우선 접근법 준수
- [ ] Phase 1에서 전체 라우트 구조와 타입 시스템이 완성되었는가?
- [ ] Phase 2에서 UI가 더미 데이터로 완전히 동작하는가?
- [ ] Phase 3에서 더미 데이터가 실제 API로 교체되었는가?

### 사용자 경험
- [ ] 로딩 상태가 명확히 표시되는가?
- [ ] 에러 메시지가 사용자 친화적인가?
- [ ] 반응형 디자인이 모든 디바이스에서 동작하는가?
- [ ] 키보드 네비게이션이 지원되는가?

### 기술적 품질
- [ ] SSR 관련 hydration mismatch가 없는가?
- [ ] Web Speech API 미지원 브라우저 처리가 되었는가?
- [ ] localStorage 데이터가 올바르게 저장/로드되는가?

### 테스트 검증
- [ ] Playwright MCP를 활용한 E2E 테스트가 통과하는가?
- [ ] 모든 사용자 플로우가 정상 동작하는가?
- [ ] 에러 시나리오 테스트가 통과하는가?

---

## 참고 자료

- [Free Dictionary API](https://dictionaryapi.dev/)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Next.js 16 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev/)
