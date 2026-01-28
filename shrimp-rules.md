# 영어 학습 웹 애플리케이션 개발 가이드

> 이 문서는 AI Agent가 이 프로젝트에서 코드를 작성할 때 따라야 하는 규칙을 정의합니다.

## 프로젝트 개요

- **목적**: 영어 학습을 위한 웹 애플리케이션
- **핵심 기술**: Next.js 16.1.5, React 19.2.3, TypeScript, Tailwind CSS v4, shadcn/ui
- **특수 설정**: React Compiler 활성화, Turbopack 사용

## 프로젝트 아키텍처

### 디렉토리 구조 규칙

- **페이지 파일**: `src/app/` 하위에 폴더 생성 및 `page.tsx` 파일 추가
- **컴포넌트 파일**:
  - shadcn/ui 컴포넌트: `src/components/ui/`에 자동 생성됨
  - 커스텀 컴포넌트: `src/components/` 생성 후 추가
- **유틸리티 파일**: `src/lib/` 하위에 추가
- **훅 파일**: `src/hooks/` 하위에 추가
- **타입 정의**: 각 모듈과 같은 디렉토리에 `.types.ts` 파일로 생성

### 경로 별칭 시스템

**반드시 사용해야 하는 경로 별칭:**
- `@/*` → `./src/*` (모든 src 하위 파일)
- `@/components` → shadcn/ui 및 커스텀 컴포넌트
- `@/lib` → 유틸리티 함수
- `@/hooks` → React 훅

**예시:**
```typescript
// ✅ 올바른 import
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ 잘못된 import
import { cn } from "../../lib/utils";
import { Button } from "../components/ui/button";
```

## 코드 표준

### Tailwind CSS v4 사용 규칙

**중요: 이 프로젝트는 Tailwind CSS v4를 사용하며, v3와 다른 방식입니다.**

#### 설정 방식
- **절대 금지**: `tailwind.config.js` 파일 생성 또는 사용
- **필수 사용**: PostCSS 플러그인 방식 (`postcss.config.mjs`)
- **스타일 정의**: `src/app/globals.css`에서만 수정

#### globals.css 구조
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* CSS 변수를 Tailwind 토큰으로 매핑 */
}

:root {
  /* 라이트 모드 색상 변수 */
}

.dark {
  /* 다크 모드 색상 변수 */
}
```

#### 스타일링 규칙
- **필수**: 항상 Tailwind 유틸리티 클래스 사용
- **금지**: 인라인 스타일 (`style` 속성) 사용 금지
- **금지**: 새로운 CSS 파일 생성 지양
- **조건부 스타일**: `cn()` 함수 사용 필수

**예시:**
```typescript
// ✅ 올바른 방법
import { cn } from "@/lib/utils";

<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary text-primary-foreground"
)} />

// ❌ 잘못된 방법
<div style={{ display: 'flex', gap: '8px' }} />
<div className={isActive ? "active-class" : "inactive-class"} />
```

### CSS 변수 기반 테마 시스템

#### 색상 추가 규칙
새로운 색상을 추가할 때는 **반드시** 다음 단계를 따라야 합니다:

1. `src/app/globals.css`의 `:root`에 라이트 모드 색상 추가
2. `src/app/globals.css`의 `.dark`에 다크 모드 색상 추가
3. `@theme inline` 블록에 Tailwind 토큰 매핑 추가

**예시:**
```css
/* 1. :root에 라이트 모드 색상 추가 */
:root {
  --success: oklch(0.7 0.2 150);
  --success-foreground: oklch(0.1 0 0);
}

/* 2. .dark에 다크 모드 색상 추가 */
.dark {
  --success: oklch(0.6 0.18 150);
  --success-foreground: oklch(0.95 0 0);
}

/* 3. @theme inline에 토큰 매핑 추가 */
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

#### 색상 공간
- **필수 사용**: `oklch()` 색상 공간
- **금지**: hex, rgb, hsl 직접 사용

### shadcn/ui 컴포넌트 규칙

#### 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]
```

#### 컴포넌트 위치
- **절대 금지**: `src/components/ui/` 외부로 shadcn/ui 컴포넌트 이동
- **필수**: `src/components/ui/`에서만 shadcn/ui 컴포넌트 유지

#### 컴포넌트 수정
- **허용**: shadcn/ui 컴포넌트 스타일 수정 (Tailwind 클래스로만)
- **금지**: 컴포넌트의 기본 구조나 props 변경 시 신중하게 검토

#### 스타일 설정
- **스타일**: new-york
- **아이콘**: lucide-react
- **베이스 컬러**: neutral
- **CSS 변수**: 활성화됨

### TypeScript 규칙

#### 타입 정의
- **필수**: TypeScript strict 모드 준수
- **필수**: 모든 함수 매개변수 및 반환 타입 명시
- **허용**: `interface` 또는 `type` 사용 (상황에 따라 선택)
- **금지**: `any` 타입 사용 (불가피한 경우만 `unknown` 사용)

**예시:**
```typescript
// ✅ 올바른 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ 잘못된 타입 정의
function getUser(id) {  // 타입 없음
  // ...
}

function processData(data: any) {  // any 사용
  // ...
}
```

## 기능 구현 표준

### 새 페이지 추가

**단계:**
1. `src/app/` 하위에 폴더 생성 (예: `src/app/vocabulary/`)
2. `page.tsx` 파일 생성
3. 필요시 `layout.tsx` 파일 생성 (해당 페이지 전용 레이아웃)
4. 메타데이터는 `page.tsx` 내에서 `export const metadata` 사용

**예시:**
```typescript
// src/app/vocabulary/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vocabulary | English Learning",
  description: "Learn new English vocabulary",
};

export default function VocabularyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Vocabulary</h1>
      {/* 페이지 콘텐츠 */}
    </div>
  );
}
```

### 새 컴포넌트 추가

**의사결정 트리:**
1. **shadcn/ui에 해당 컴포넌트가 있는가?**
   - 있음 → `npx shadcn@latest add [component-name]` 사용
   - 없음 → 2번으로 이동

2. **UI 컴포넌트인가?**
   - 예 → `src/components/ui/` 생성 후 추가
   - 아니오 → `src/components/` 하위에 적절한 폴더 생성 후 추가

**예시:**
```typescript
// src/components/vocabulary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VocabularyCardProps {
  word: string;
  definition: string;
  example: string;
}

export function VocabularyCard({ word, definition, example }: VocabularyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{word}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{definition}</p>
        <p className="mt-2 text-sm italic">{example}</p>
      </CardContent>
    </Card>
  );
}
```

### 영어 학습 기능 구현 방향

**핵심 기능 구현 시 고려사항:**
- 단어 학습 기능: 카드 형태로 표시, 진행 상태 추적
- 발음 기능: 웹 API 또는 외부 서비스 활용 검토
- 진행 상태 저장: 로컬 스토리지 또는 백엔드 API 결정 필요
- 사용자 인터랙션: 키보드 네비게이션 지원 고려

## 프레임워크/라이브러리 사용 표준

### React Compiler 호환성

**이 프로젝트는 React Compiler가 활성화되어 있습니다.**

#### 호환성 고려사항
- **필수**: 컴포넌트 순수성 유지 (side effects는 useEffect 내에서만)
- **권장**: 불필요한 `useMemo`, `useCallback` 제거 (컴파일러가 자동 최적화)
- **금지**: 컴포넌트 외부에서 직접 DOM 조작

**예시:**
```typescript
// ✅ React Compiler 호환
export function Counter() {
  const [count, setCount] = useState(0);

  // 컴파일러가 자동으로 최적화
  const doubled = count * 2;

  return <div>{doubled}</div>;
}

// ❌ React Compiler 비호환
let externalState = 0;  // 외부 상태 수정

export function Counter() {
  externalState++;  // 컴포넌트 외부 상태 수정
  return <div>{externalState}</div>;
}
```

### Turbopack 사용

- **필수**: 모든 개발 및 빌드 명령은 `--turbopack` 플래그 포함
- **금지**: package.json에서 `--turbopack` 플래그 제거
- **참고**: Turbopack은 Webpack보다 빠른 번들러

## 주요 파일 상호작용 표준

### src/app/globals.css ↔ src/app/layout.tsx

**관계:**
- `globals.css`의 폰트 변수는 `layout.tsx`에서 정의된 폰트와 연결됨
- 테마 색상 변수는 전체 애플리케이션에 영향

**수정 시 주의사항:**
- `globals.css`에 새 폰트 변수 추가 시, `layout.tsx`에서 폰트 import 확인
- 테마 색상 변수 수정 시, 라이트 모드(`:root`)와 다크 모드(`.dark`) 모두 업데이트

### components.json ↔ src/components/ui/

**관계:**
- `components.json`의 `aliases` 설정이 컴포넌트 import 경로 결정
- shadcn/ui 컴포넌트는 이 설정에 따라 자동 생성됨

**수정 시 주의사항:**
- 경로 별칭 변경 시, 기존 모든 컴포넌트의 import 경로 수정 필요
- `components.json` 수정 후 shadcn/ui 컴포넌트 재생성 필요할 수 있음

### src/lib/utils.ts ↔ 모든 컴포넌트

**관계:**
- `cn()` 함수는 프로젝트 전체에서 사용되는 핵심 유틸리티
- 모든 컴포넌트의 조건부 스타일링에 사용

**수정 금지:**
- `cn()` 함수는 수정하거나 재구현하지 말 것
- 필요시 새로운 유틸리티 함수를 추가할 것

### tsconfig.json ↔ 모든 TypeScript 파일

**관계:**
- `paths` 설정이 모든 import 경로에 영향
- `strict` 모드가 타입 체크 엄격도 결정

**수정 시 주의사항:**
- 경로 별칭 변경 시 전체 프로젝트의 import 경로 영향
- strict 모드 관련 설정 변경 금지

### next.config.ts ↔ 전체 프로젝트

**관계:**
- `reactCompiler` 설정이 빌드 방식에 영향
- 모든 설정 변경은 전체 재빌드 필요

**수정 시 주의사항:**
- 설정 변경 후 반드시 개발 서버 재시작
- `reactCompiler: true` 설정 유지 필수

## AI 의사결정 가이드

### 스타일링 선택

**결정 트리:**
1. Tailwind 유틸리티 클래스로 가능한가?
   - 예 → Tailwind 클래스 사용
   - 아니오 → 2번으로

2. shadcn/ui 테마 색상으로 가능한가?
   - 예 → CSS 변수 사용 (`text-primary`, `bg-muted` 등)
   - 아니오 → 3번으로

3. 새로운 색상이 필요한가?
   - 예 → `globals.css`에 CSS 변수 추가 (라이트/다크 모드 모두)
   - 아니오 → 커스텀 CSS 클래스 생성 (`globals.css`의 `@layer` 내)

### 컴포넌트 선택

**우선순위:**
1. shadcn/ui 컴포넌트 존재 여부 확인
2. 존재하면 shadcn/ui 사용
3. 존재하지 않으면 커스텀 컴포넌트 생성

### 데이터 fetching

**Next.js 14+ App Router 패턴:**
- 서버 컴포넌트에서 직접 데이터 fetch (기본)
- 클라이언트 상태 필요시 `"use client"` 선언
- 정적 데이터는 `generateStaticParams` 사용

## 금지 사항

### 절대 하지 말아야 할 것

#### Tailwind CSS 관련
- ❌ `tailwind.config.js` 파일 생성 또는 사용
- ❌ `globals.css`에서 `@import "tailwindcss"` 제거
- ❌ `@theme inline` 블록 구조 변경
- ❌ 색상 하드코딩 (hex, rgb 직접 사용)

#### 스타일링 관련
- ❌ 인라인 스타일 (`style` 속성) 사용
- ❌ `src/app/globals.css` 외부에 새 CSS 파일 생성
- ❌ CSS 변수 직접 하드코딩 (테마 시스템 사용 필수)
- ❌ `cn()` 함수 무시하고 className을 문자열 결합으로 처리

#### 컴포넌트 관련
- ❌ shadcn/ui 컴포넌트를 `src/components/ui/` 외부로 이동
- ❌ `cn()` 함수 재구현 또는 수정
- ❌ 경로 별칭 무시하고 상대 경로 사용
- ❌ 컴포넌트 외부에서 DOM 직접 조작

#### 설정 파일 관련
- ❌ `next.config.ts`에서 `reactCompiler: true` 제거 또는 비활성화
- ❌ `package.json`에서 `--turbopack` 플래그 제거
- ❌ `tsconfig.json`에서 `strict: true` 비활성화
- ❌ 경로 별칭 설정 임의 변경

#### 프로젝트 구조 관련
- ❌ `src/` 외부에 컴포넌트나 유틸리티 파일 생성
- ❌ App Router 대신 Pages Router 사용
- ❌ `src/app/` 구조 변경

#### 타입 관련
- ❌ `any` 타입 남용
- ❌ 타입 정의 없는 함수 생성
- ❌ strict 모드 규칙 우회

### 주의해야 할 것

#### 성능 관련
- ⚠️ 큰 번들 크기를 생성하는 라이브러리 추가 시 검토 필요
- ⚠️ 클라이언트 컴포넌트 남용 지양 (서버 컴포넌트 우선)
- ⚠️ 불필요한 상태 관리 라이브러리 추가 지양

#### 접근성 관련
- ⚠️ 키보드 네비게이션 고려
- ⚠️ ARIA 레이블 필요시 추가
- ⚠️ 색상 대비 비율 확인 (WCAG 기준)

---

## 문서 업데이트

이 문서는 프로젝트 진행에 따라 업데이트되어야 합니다:
- 새로운 기능 추가 시 관련 규칙 추가
- 프로젝트 구조 변경 시 문서 동기화
- 새로운 라이브러리 추가 시 사용 표준 명시
