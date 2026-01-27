# 영어 단어 학습 사전 MVP PRD

## 🎯 핵심 정보

**목적**: 영어 단어를 검색하고 발음, 뜻, 예문을 확인하여 효과적으로 학습할 수 있는 웹 사전
**사용자**: 영어를 학습하는 전체 연령대 사용자 (학생, 직장인, 일반인)

## 🚶 사용자 여정

```
1. 홈페이지 (검색 페이지)
   ↓ [단어 입력 + 검색 버튼 클릭]

2. 검색 결과 표시
   ↓ [단어 정보 확인]

   [발음 듣기] → [재생 버튼 클릭] → [음성 재생 (속도 조절 가능)]
   [예문 듣기] → [예문별 재생 버튼] → [예문 음성 재생 (속도 조절 가능)]
   ↓

3. 추가 학습
   ↓ [다른 단어 검색 또는 최근 검색 기록 클릭]

4. [완료] → [새로운 단어 검색 계속]
```

## ⚡ 기능 명세

### 1. MVP 핵심 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F001** | 단어 검색 | 영어 단어 입력 및 실시간 검색 | 사전의 가장 핵심 기능 | 홈페이지, 검색 결과 페이지 |
| **F002** | 발음 정보 표시 | IPA 발음 기호 표시 | 정확한 발음 학습을 위한 필수 정보 | 검색 결과 페이지 |
| **F003** | 단어 뜻 표시 | 영어 정의 표시 (품사별 구분) | 단어 이해를 위한 핵심 정보 | 검색 결과 페이지 |
| **F004** | 음성 재생 | 단어 발음 음성 재생 (속도 조절 가능) | 청각 학습을 위한 필수 기능 | 검색 결과 페이지 |
| **F005** | 예시 문장 표시 | 단어 사용 예시 문장 제공 (API 제공 수량만큼) | 실제 사용 맥락 이해를 위한 핵심 기능 | 검색 결과 페이지 |
| **F006** | 예문 음성 재생 | 예시 문장 음성 재생 (속도 조절 가능) | 문장 발음 학습을 위한 필수 기능 | 검색 결과 페이지 |

### 2. MVP 필수 지원 기능

| ID | 기능명 | 설명 | MVP 필수 이유 | 관련 페이지 |
|----|--------|------|-------------|------------|
| **F010** | 최근 검색 기록 | localStorage 기반 최근 검색 단어 표시 (최대 10개) | 재학습 및 빠른 재검색 지원 | 홈페이지, 검색 결과 페이지 |
| **F011** | 검색 오류 처리 | 단어 미발견 시 안내 메시지 표시 | 사용자 경험 개선을 위한 기본 오류 처리 | 검색 결과 페이지 |
| **F012** | 로딩 상태 표시 | API 호출 중 로딩 인디케이터 표시 | 사용자 피드백 제공 | 검색 결과 페이지 |

### 3. MVP 이후 기능 (제외)

- **한글 뜻 번역** (별도 번역 API 필요 - Google Translate, DeepL 등)
- 사용자 인증 및 계정 관리
- 단어장 저장 및 관리
- 즐겨찾기/북마크 기능
- 학습 진도 추적
- 퀴즈 및 테스트 기능
- 소셜 기능 (공유, 댓글 등)
- 다크 모드
- 다국어 지원 (한국어/영어 외)

## 📱 메뉴 구조

```
🏠 영어 단어 학습 사전
├── 🔍 검색 바 (헤더 고정)
│   └── 기능: F001 (단어 검색)
│
├── 📋 최근 검색 (사이드바 또는 하단)
│   └── 기능: F010 (최근 검색 기록 표시)
│
└── 📖 검색 결과 영역 (메인 콘텐츠)
    ├── 발음 정보 - F002
    ├── 단어 뜻 - F003
    ├── 음성 재생 - F004
    ├── 예시 문장 - F005
    └── 예문 음성 재생 - F006
```

---

## 📄 페이지별 상세 기능

### 홈페이지 (검색 페이지)

> **구현 기능:** `F001`, `F010` | **인증:** 불필요

| 항목 | 내용 |
|------|------|
| **역할** | 영어 단어 검색을 위한 랜딩 페이지 및 메인 인터페이스 |
| **진입 경로** | 사이트 접속 시 자동 이동 (루트 경로) |
| **사용자 행동** | 검색창에 영어 단어를 입력하고 검색 버튼 클릭 또는 Enter 키 입력 |
| **주요 기능** | • 검색 입력창 (자동 포커스)<br>• 검색 버튼 (Enter 키 지원)<br>• 최근 검색 기록 표시 (최대 10개, 클릭 시 재검색)<br>• 입력 유효성 검사 (영어 알파벳만 허용)<br>• **검색** 버튼 |
| **다음 이동** | 검색 성공 → 검색 결과 페이지, 입력 오류 → 에러 메시지 표시 |

---

### 검색 결과 페이지

> **구현 기능:** `F001`, `F002`, `F003`, `F004`, `F005`, `F006`, `F010`, `F011`, `F012` | **인증:** 불필요

| 항목 | 내용 |
|------|------|
| **역할** | 검색한 단어의 상세 정보 및 학습 자료 표시 |
| **진입 경로** | 홈페이지에서 단어 검색 성공 시 자동 이동 |
| **사용자 행동** | 단어 정보 확인, 발음 듣기, 예문 확인 및 듣기, 재생 속도 조절 |
| **주요 기능** | • 검색 단어 표시 (제목)<br>• IPA 발음 기호 표시<br>• 영어 정의 표시 (품사별 구분)<br>• 단어 음성 재생 버튼 (재생/일시정지)<br>• 재생 속도 조절 (0.5x, 0.75x, 1x, 1.25x, 1.5x)<br>• 예시 문장 목록 (API 제공 수량만큼)<br>• 각 예문별 음성 재생 버튼<br>• 예문 재생 속도 조절<br>• 로딩 스피너<br>• 오류 메시지 (단어 미발견 시)<br>• 최근 검색 기록 (사이드바)<br>• **새로운 검색** 버튼 |
| **다음 이동** | 새로운 검색 → 홈페이지, 최근 검색 클릭 → 해당 단어 검색 결과 |

---

## 🗄️ 데이터 모델

### LocalStorage (클라이언트 저장)

| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| recentSearches | 최근 검색 단어 배열 | string[] (최대 10개) |
| timestamp | 각 검색 시간 | ISO 8601 string |

### API Response (Free Dictionary API)

| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| word | 검색 단어 | string |
| phonetic | IPA 발음 기호 | string |
| phonetics | 발음 정보 배열 (오디오 URL 포함) | array |
| meanings | 단어 뜻 배열 (품사별) | array |
| definitions | 영어 정의 | string |
| example | 예시 문장 | string |

---

## 🛠️ 기술 스택 (최신 버전)

### 🎨 프론트엔드 프레임워크

- **Next.js 16.1.5** (App Router) - React 풀스택 프레임워크
- **TypeScript 5.7+** - 타입 안전성 보장
- **React 19.2.3** - UI 라이브러리 (최신 동시성 기능, React Compiler 활성화)

### 🎨 스타일링 & UI

- **TailwindCSS v4** (PostCSS 플러그인 방식) - 유틸리티 CSS 프레임워크
- **shadcn/ui** (new-york 스타일) - 고품질 React 컴포넌트 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **Geist Font** - Next.js 최적화 폰트

### 🔌 외부 API 및 서비스

- **Free Dictionary API** - 단어 정의, 발음 기호, 예문 제공 (무료, 인증 불필요)
  - Endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- **Web Speech API** - 브라우저 내장 TTS (무료, 추가 설정 불필요)
  - `window.speechSynthesis` 사용
  - 재생 속도 조절 지원 (`rate` 속성)

### 📦 상태 관리 및 데이터 페칭

- **React Hooks** - 상태 관리 (useState, useEffect)
- **Fetch API** - HTTP 요청 (Native browser API)
- **localStorage** - 클라이언트 데이터 저장

### 🚀 배포 & 호스팅

- **Vercel** - Next.js 16 최적화 배포 플랫폼

### 📦 패키지 관리

- **npm** - 의존성 관리

---

## 🎨 UI/UX 설계 방향

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│  [로고] 영어 단어 학습 사전              │ ← 헤더 (고정)
│  ┌─────────────────────┐ [🔍 검색]      │
│  │  단어 입력...       │                │
│  └─────────────────────┘                │
├─────────────────────────────────────────┤
│  📋 최근 검색         │  📖 검색 결과    │
│                       │                 │
│  • apple             │  Apple /ˈæp.əl/ │
│  • computer          │  🔊 [재생] 🎚️    │
│  • book              │                 │
│                       │  명사:           │
│                       │  1. A fruit...  │
│                       │                 │
│                       │  예문:           │
│                       │  • I eat an     │
│                       │    apple. 🔊     │
└───────────────────────┴─────────────────┘
```

### 디자인 원칙

1. **심플함 우선**: 불필요한 UI 요소 최소화
2. **접근성**: 큰 버튼, 명확한 라벨, 키보드 네비게이션 지원
3. **반응형**: 모바일/태블릿/데스크톱 모두 지원
4. **시각적 피드백**: 로딩, 에러, 성공 상태 명확히 표시
5. **shadcn/ui 활용**: Button, Input, Card, Skeleton 컴포넌트 사용

### 주요 컴포넌트 (shadcn/ui)

- `Button` - 검색, 재생 버튼
- `Input` - 검색 입력창
- `Card` - 검색 결과, 예문 표시
- `Skeleton` - 로딩 상태
- `Alert` - 에러 메시지
- `Slider` - 재생 속도 조절 (또는 Select)

---

## 🔧 기술 구현 가이드

### 1. Free Dictionary API 사용

**장점**:
- 완전 무료, API 키 불필요
- 발음 기호 (IPA) 제공
- 품사별 정의 제공
- 일부 단어에 음성 파일 제공 (오디오 URL)

**단점**:
- 음성 파일이 없는 단어도 있음 (Web Speech API로 대체)
- 예문이 부족하거나 없는 경우 있음 (optional 필드)
- **한글 번역 미지원** (영어 정의만 제공)
- Rate Limit 미명시 (과도한 요청 시 제한 가능성)

**요청 예시**:
```typescript
const response = await fetch(
  `https://api.dictionaryapi.dev/api/v2/entries/en/apple`
);
const data = await response.json();
```

**응답 구조**:
```json
[
  {
    "word": "apple",
    "phonetic": "/ˈæp.əl/",
    "phonetics": [
      {
        "text": "/ˈæp.əl/",
        "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/apple-uk.mp3"
      }
    ],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "A common, round fruit...",
            "example": "I eat an apple every day."
          }
        ]
      }
    ]
  }
]
```

### 2. Web Speech API 사용

**장점**:
- 브라우저 내장, 추가 비용 없음
- 재생 속도 조절 가능
- 다양한 언어 및 음성 지원

**단점**:
- 브라우저마다 음성 품질 차이
- Opera Mini 미지원 (전체 호환성 94.51%)
- Chrome Windows에서 15초 이상 연속 재생 시 멈추는 알려진 버그 (단어/짧은 예문에는 영향 없음)

**구현 예시**:
```typescript
const speak = (text: string, rate: number = 1) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate; // 0.5 ~ 1.5
  window.speechSynthesis.speak(utterance);
};
```

### 3. localStorage 최근 검색 관리 (SSR 주의사항)

> **중요**: Next.js App Router는 기본적으로 서버 사이드 렌더링(SSR)을 사용합니다.
> localStorage는 브라우저 전용 API이므로, 반드시 클라이언트 컴포넌트('use client')와
> useEffect 훅 내에서만 접근해야 합니다.

**구현 예시**:
```typescript
// 검색 기록 추가
const addToRecentSearches = (word: string) => {
  const recent = JSON.parse(
    localStorage.getItem('recentSearches') || '[]'
  );
  const updated = [
    word,
    ...recent.filter((w: string) => w !== word)
  ].slice(0, 10); // 최대 10개
  localStorage.setItem('recentSearches', JSON.stringify(updated));
};

// 검색 기록 불러오기
const getRecentSearches = (): string[] => {
  return JSON.parse(
    localStorage.getItem('recentSearches') || '[]'
  );
};
```

---

## 🔒 기술적 제약사항 및 주의사항

### 브라우저 호환성

| 기능 | Chrome | Safari | Firefox | Edge | 모바일 |
|------|--------|--------|---------|------|--------|
| Web Speech API | 33+ | 7+ | 49+ | 14+ | iOS 7+, Android |
| localStorage | 전체 지원 | 전체 지원 | 전체 지원 | 전체 지원 | 전체 지원 |
| Fetch API | 전체 지원 | 전체 지원 | 전체 지원 | 전체 지원 | 전체 지원 |

**Web Speech API 전체 호환성: 94.51%** (Opera Mini 미지원)

### API 제약사항

1. **Free Dictionary API**
   - Rate Limit: 명시되지 않음 (과도한 요청 자제 권장)
   - 한글 번역: 미지원 (영어 정의만 제공)
   - 예문: optional 필드 (일부 정의에만 존재)
   - 음성 파일: 일부 단어만 제공

2. **Web Speech API**
   - 음성 품질: 브라우저/OS에 따라 상이
   - Chrome 버그: Windows에서 15초 이상 연속 재생 시 멈춤 (단어/짧은 예문에는 영향 없음)
   - rate 속성 범위: 0.1 ~ 10 (PRD 요구사항 0.5 ~ 1.5 완전 지원)

### SSR 관련 주의사항

Next.js App Router 환경에서 브라우저 전용 API 사용 시:
- `window`, `document`, `localStorage` 접근은 반드시 클라이언트 컴포넌트에서
- `'use client'` 지시어 필수
- `useEffect` 훅 내에서 접근하여 hydration mismatch 방지

```typescript
// 올바른 사용 예시
'use client';

import { useEffect, useState } from 'react';

export function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    // 클라이언트에서만 실행됨
    const saved = localStorage.getItem('recentSearches');
    if (saved) setSearches(JSON.parse(saved));
  }, []);

  return /* ... */;
}
```

### 에러 핸들링 가이드

1. **네트워크 에러**: API 호출 실패 시 사용자 친화적 메시지 표시
2. **단어 미발견 (404)**: "단어를 찾을 수 없습니다" 메시지
3. **Web Speech API 미지원**: 기능 감지 후 대체 UI 제공
4. **오디오 재생 실패**: Web Speech API로 폴백

```typescript
// Web Speech API 지원 감지
const isSpeechSupported = typeof window !== 'undefined'
  && 'speechSynthesis' in window;
```

---

## ✅ Acceptance Criteria (검수 기준)

### F001: 단어 검색
- [ ] 검색창에 영어 단어 입력 가능
- [ ] Enter 키 또는 검색 버튼으로 검색 실행
- [ ] 검색 시 Free Dictionary API 호출
- [ ] 검색 결과를 화면에 표시
- [ ] 영어 알파벳 외 입력 시 경고 메시지 표시

### F002: 발음 정보 표시
- [ ] IPA 발음 기호 표시
- [ ] 발음 기호가 없는 경우 "N/A" 표시

### F003: 단어 뜻 표시
- [ ] 품사별 영어 정의 표시
- [ ] 여러 뜻이 있는 경우 번호 매기기
- [ ] 정의가 없는 경우 "정의 없음" 표시

### F004: 음성 재생
- [ ] 재생 버튼 클릭 시 단어 발음 재생
- [ ] 재생 속도 조절 가능 (0.5x, 0.75x, 1x, 1.25x, 1.5x)
- [ ] API 오디오 파일 우선, 없으면 Web Speech API 사용
- [ ] 재생 중 일시정지 가능

### F005: 예시 문장 표시
- [ ] API에서 제공하는 모든 예시 문장 표시
- [ ] 예문이 없는 경우 "예문 없음" 메시지 표시
- [ ] 예문이 있는 정의만 예문 섹션에 표시

### F006: 예문 음성 재생
- [ ] 각 예문마다 독립적인 재생 버튼
- [ ] 재생 속도 조절 가능
- [ ] Web Speech API 사용

### F010: 최근 검색 기록
- [ ] 최근 검색 단어 최대 10개 표시
- [ ] localStorage에 저장
- [ ] 클릭 시 해당 단어 재검색
- [ ] 중복 검색 시 최상단으로 이동

### F011: 검색 오류 처리
- [ ] 단어 미발견 시 "단어를 찾을 수 없습니다" 메시지
- [ ] API 오류 시 "오류가 발생했습니다. 다시 시도해주세요" 메시지

### F012: 로딩 상태 표시
- [ ] API 호출 중 로딩 스피너 표시
- [ ] 로딩 중 검색 버튼 비활성화

---

## 📐 개발 단계 (참고용)

### Phase 1: 기본 검색 및 표시 (1-2일)
- 검색 UI 구현 (Input, Button)
- Free Dictionary API 연동
- 발음 기호, 단어 뜻 표시
- 로딩 및 에러 처리

### Phase 2: 음성 재생 (1일)
- Web Speech API 통합
- 재생 버튼 UI
- 재생 속도 조절 기능

### Phase 3: 예시 문장 (1일)
- 예문 표시 UI
- 예문별 음성 재생
- 예문 없는 경우 처리

### Phase 4: 최근 검색 기록 (0.5일)
- localStorage 연동
- 최근 검색 UI
- 클릭 재검색 기능

### Phase 5: UI/UX 개선 및 테스트 (0.5일)
- 반응형 디자인 조정
- 접근성 개선
- 브라우저 호환성 테스트

**총 예상 개발 기간: 4-5일**

---

## 🚀 배포 체크리스트

- [ ] Vercel에 프로젝트 연동
- [ ] 환경 변수 설정 (필요 시)
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 모바일/데스크톱 반응형 확인
- [ ] 주요 브라우저 테스트 (Chrome, Safari, Firefox, Edge)
- [ ] Web Speech API 브라우저 호환성 확인
- [ ] Free Dictionary API 속도 및 안정성 확인
- [ ] SEO 메타 태그 설정 (title, description)
- [ ] localStorage hydration mismatch 테스트 (새로고침 시 깜빡임 없음 확인)
- [ ] 네트워크 오류 상황 테스트 (API 응답 실패 시 에러 메시지 표시)
- [ ] 존재하지 않는 단어 검색 테스트 (404 에러 핸들링)

---

## 📚 참고 자료

### API 문서
- [Free Dictionary API](https://dictionaryapi.dev/)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### UI 라이브러리
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)

### Next.js
- [Next.js 16 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev/)
