# Task 001: 프로젝트 구조 및 라우팅 설정

> **상태**: 대기 중
> **우선순위**: 높음 (Phase 1 첫 번째 작업)
> **예상 소요 시간**: 2-3시간

## 개요

Next.js App Router 기반의 전체 라우트 구조를 생성하고, 공통 레이아웃 컴포넌트 골격을 구현합니다. 모든 주요 페이지의 빈 껍데기 파일을 생성하여 애플리케이션의 기본 구조를 확립합니다.

## 관련 기능

- **F001**: 단어 검색 (라우트 구조)
- **F010**: 최근 검색 기록 (레이아웃 구조)

## 관련 파일

| 파일 경로 | 유형 | 설명 |
|-----------|------|------|
| `src/app/layout.tsx` | TO_MODIFY | 루트 레이아웃에 공통 구조 추가 |
| `src/app/page.tsx` | TO_MODIFY | 홈페이지 (검색 페이지) 골격 |
| `src/app/search/[word]/page.tsx` | CREATE | 검색 결과 페이지 |
| `src/components/layout/Header.tsx` | CREATE | 공통 헤더 컴포넌트 |
| `src/components/layout/Footer.tsx` | CREATE | 공통 푸터 컴포넌트 |

## 수락 기준 (Acceptance Criteria)

- [ ] `/` 경로로 홈페이지 (검색 페이지) 접근 가능
- [ ] `/search/[word]` 동적 라우트로 검색 결과 페이지 접근 가능
- [ ] 공통 헤더가 모든 페이지에 표시됨
- [ ] 메타데이터(title, description)가 올바르게 설정됨
- [ ] 레이아웃 구조가 PRD의 UI/UX 설계에 부합함

## 구현 단계

### 1단계: 디렉토리 구조 생성

- [ ] `src/components/layout/` 디렉토리 생성
- [ ] `src/app/search/[word]/` 디렉토리 생성

### 2단계: 공통 레이아웃 컴포넌트 구현

- [ ] `Header.tsx` 골격 구현
  - 로고/타이틀 영역
  - 검색바 영역 (placeholder)
- [ ] `Footer.tsx` 골격 구현 (선택사항)

### 3단계: 루트 레이아웃 수정

- [ ] `layout.tsx`에 메타데이터 설정
  - title: "영어 단어 학습 사전"
  - description: "영어 단어를 검색하고 발음, 뜻, 예문을 확인하세요"
- [ ] Header 컴포넌트 통합

### 4단계: 페이지 골격 생성

- [ ] 홈페이지 (`page.tsx`) 기본 구조
  - 메인 검색 영역 placeholder
  - 최근 검색 기록 영역 placeholder
- [ ] 검색 결과 페이지 (`search/[word]/page.tsx`) 기본 구조
  - 단어 정보 영역 placeholder
  - params에서 word 추출 로직

### 5단계: 검증

- [ ] 개발 서버 실행 후 모든 라우트 접근 확인
- [ ] 레이아웃이 올바르게 적용되는지 확인

## 기술 노트

### Next.js App Router 라우팅 구조

```
src/app/
├── layout.tsx          # 루트 레이아웃 (모든 페이지 공통)
├── page.tsx            # 홈페이지 (/)
└── search/
    └── [word]/
        └── page.tsx    # 검색 결과 페이지 (/search/{word})
```

### 동적 라우트 파라미터 접근

```typescript
// src/app/search/[word]/page.tsx
interface SearchPageProps {
  params: Promise<{ word: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { word } = await params;
  // word를 사용한 로직
}
```

### 메타데이터 설정

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '영어 단어 학습 사전',
  description: '영어 단어를 검색하고 발음, 뜻, 예문을 확인하세요',
};
```

### 주의사항

- Next.js 16에서는 동적 라우트의 `params`가 Promise로 반환됨
- 서버 컴포넌트에서는 async/await 사용 필요
- 클라이언트 컴포넌트에서는 `use()` 훅 또는 useParams 사용

## 변경 사항 요약

> **참고**: 작업 완료 후 작성

### 생성된 파일

- 없음 (작업 완료 후 기록)

### 수정된 파일

- 없음 (작업 완료 후 기록)
