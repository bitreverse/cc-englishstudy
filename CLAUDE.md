# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
영어 학습을 위한 Next.js 웹 애플리케이션입니다. Tailwind CSS v4, shadcn/ui, React Compiler를 사용합니다.

## 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 실행 (Turbopack 사용, http://localhost:3000)
npm run build        # 프로덕션 빌드 (Turbopack 사용)
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

### shadcn/ui 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]  # 새 컴포넌트 추가
```

## 프로젝트 구조

### 디렉토리 구조
```
src/
├── app/              # Next.js App Router 페이지
│   ├── layout.tsx   # 루트 레이아웃 (Geist 폰트 설정)
│   ├── page.tsx     # 홈 페이지
│   └── globals.css  # 전역 스타일 (Tailwind CSS)
└── lib/
    └── utils.ts     # 유틸리티 함수 (cn 헬퍼)
```

### 경로 별칭
TypeScript 경로 별칭이 설정되어 있습니다:
- `@/*` → `./src/*`
- `@/components` → shadcn/ui 컴포넌트 (components.json에 정의됨)
- `@/lib` → 라이브러리 유틸리티
- `@/hooks` → React 훅

## 기술 스택 및 설정

### 주요 라이브러리
- **Next.js 16.1.5**: App Router, React Compiler 활성화
- **React 19.2.3**: 최신 React 버전
- **Tailwind CSS v4**: PostCSS 플러그인 방식
- **shadcn/ui**: new-york 스타일, lucide-react 아이콘, 중립 베이스 컬러

### TypeScript 설정
- Target: ES2017
- Strict 모드 활성화
- JSX: react-jsx

### Next.js 설정
- React Compiler 활성화 (`next.config.ts`)
- Turbopack 사용 (dev 및 build)

### MCP 서버
프로젝트에 다음 MCP 서버가 설정되어 있습니다:
- **playwright**: 브라우저 자동화 및 테스팅
- **context7**: 문서 및 컨텍스트 관리
- **sequential-thinking**: 순차적 사고 지원

## 개발 가이드

### 새 페이지 추가
`src/app/` 디렉토리에 폴더를 생성하고 `page.tsx` 파일을 추가합니다.

### 새 컴포넌트 추가
1. shadcn/ui 컴포넌트: `npx shadcn@latest add [component-name]`
2. 커스텀 컴포넌트: `src/components/` 디렉토리 생성 후 추가

### 스타일링
- Tailwind CSS 클래스 사용
- `cn()` 헬퍼로 조건부 스타일 병합 (`@/lib/utils`)
- CSS 변수 기반 테마 시스템 (globals.css)
