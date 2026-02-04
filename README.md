# 영어 학습 웹 애플리케이션

Next.js 16, Google Gemini AI, Google Cloud TTS를 활용한 고급 영어 학습 플랫폼입니다.

## 주요 기능

- 🧠 **AI 기반 단어 분석**: Google Gemini 2.0 Flash로 형태소, 음절, 의미 분석
- 🔊 **고품질 음성 합성**: Google Cloud TTS Neural2 음성
- 📚 **동형이의어 지원**: Heteronym 자동 감지 및 품사별 발음 제공
- 💾 **지능형 캐싱**: API 비용 절감을 위한 자동 캐싱 시스템
- 📊 **비용 추적**: 월별 예산 관리 및 사용량 모니터링

## 기술 스택

- **Frontend**: Next.js 16 (App Router, React Compiler, Server Components)
- **UI**: Tailwind CSS v4, shadcn/ui (new-york style)
- **AI**: Google Gemini 2.0 Flash API
- **TTS**: Google Cloud Text-to-Speech API
- **Type Safety**: TypeScript 5 (Strict Mode), Zod 검증

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# AI 프로바이더 설정
AI_PROVIDER=gemini
GOOGLE_API_KEY=your-google-gemini-api-key

# Google Cloud TTS 설정
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
GOOGLE_TTS_VOICE_NAME=en-US-Neural2-J
GOOGLE_TTS_VOICE_TYPE=Neural2
```

#### 📖 상세 설정 가이드

- **Google Gemini AI**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급
- **Google Cloud TTS**: [Google Cloud TTS 설정 가이드](./docs/GOOGLE_CLOUD_SETUP.md) 참조 (필수!)
- **전체 환경 설정**: [환경 설정 가이드](./docs/SETUP_GUIDE.md) 참조

#### ✅ 설정 테스트

Google Cloud TTS 설정이 올바른지 테스트:

```bash
node test-google-tts.js
```

성공 시 `test-output.mp3` 파일이 생성됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API Routes (AI, TTS)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── word/             # 단어 분석 관련 컴포넌트
├── lib/                   # 라이브러리 및 유틸리티
│   ├── ai/               # AI 클라이언트 (Gemini, OpenAI, Anthropic)
│   ├── analysis-cache.ts # 분석 결과 캐싱
│   ├── tts-cache.ts      # TTS 오디오 캐싱
│   └── env.ts            # 환경 변수 검증
├── types/                 # TypeScript 타입 정의
└── hooks/                 # React 커스텀 훅
```

## 주요 명령어

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 실행
```

### 테스트 스크립트

```bash
# Gemini API 테스트
node test-gemini.js

# 일반 AI 클라이언트 테스트
node test-ai-client.js

# Heteronym 테스트
node test-ai-heteronyms.js

# 캐시 통계 확인
node test-cache-stats.js

# 비용 추적 테스트
node test-cost-tracker.js
```

## API 프로바이더

이 프로젝트는 여러 AI 프로바이더를 지원합니다:

| 프로바이더 | 모델 | 비용 (Input/Output per 1M tokens) | 추천 |
|-----------|------|-----------------------------------|------|
| **Google Gemini** | gemini-2.0-flash-exp | $0.10 / $0.40 | ⭐ 권장 |
| Google Gemini | gemini-1.5-flash | $0.075 / $0.30 | 비용 절감 |
| OpenAI | gpt-4o-mini | $0.15 / $0.60 | 안정성 |
| Anthropic | claude-3-5-haiku | $1.00 / $5.00 | 고품질 |

환경 변수 `AI_PROVIDER`로 프로바이더를 변경할 수 있습니다.

## 비용 관리

- **자동 캐싱**: 동일한 단어 분석 및 TTS 결과를 캐싱하여 API 호출 최소화
- **예산 한도**: 월별 예산 설정 및 초과 시 알림 (`AI_MONTHLY_BUDGET`)
- **비용 추적**: 실시간 사용량 및 예상 비용 모니터링

기본 예산 $5로 약 7,000~10,000회 단어 분석이 가능합니다.

## 환경 설정

자세한 설정 방법은 다음 문서를 참조하세요:

- [환경 설정 가이드](./docs/SETUP_GUIDE.md) - API 키 발급 및 환경 변수 설정
- [개발 로드맵](./docs/ROADMAP.md) - 프로젝트 단계별 개발 계획
- [CLAUDE.md](./CLAUDE.md) - Claude Code용 프로젝트 가이드

## 주요 기능 상세

### 1. AI 기반 단어 분석

- **형태소 분석**: 접두사, 어근, 접미사 분해 및 어원 설명
- **음절 분리**: 발음 학습을 위한 음절 단위 분리
- **품사별 의미**: 각 품사에 따른 정의, 예문, 동의어, 반의어 제공
- **US IPA 발음**: 미국식 IPA 표기법 사용

### 2. Heteronym (동형이의어) 처리

동일한 철자이지만 품사에 따라 발음이 다른 단어를 자동으로 감지합니다:

- **record**: 명사 `/ˈrekɔrd/` vs 동사 `/rɪˈkɔrd/`
- **permit**: 명사 `/ˈpɜrmɪt/` vs 동사 `/pərˈmɪt/`
- **present**: 명사/형용사 `/ˈprezənt/` vs 동사 `/prɪˈzent/`

### 3. Google Cloud TTS 통합

- **Neural2 음성**: 자연스러운 발음 (16종 이상)
- **IPA 기반 발음**: 품사별 정확한 발음 생성
- **음소 발음**: 개별 음소(phoneme) 단위 TTS 지원
- **오디오 캐싱**: 동일한 발음 재사용으로 비용 절감

## 개발 가이드

### shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

### 새 AI 프로바이더 추가

1. `src/lib/ai/[provider]-client.ts` 생성
2. `AIClient` 인터페이스 구현
3. `src/lib/ai/client.ts`에 프로바이더 등록
4. `src/lib/ai/cost-tracker.ts`에 비용 정보 추가

### 타입 안전성

모든 외부 API 응답은 Zod 스키마로 검증됩니다:

- `WordAnalysisResponseSchema`: AI API 응답 검증
- `MorphemeAnalysisSchema`: 형태소 분석 검증
- `SyllabificationResultSchema`: 음절 분리 검증
- `MeaningEntrySchema`: 의미 정보 검증

## 배포

### Vercel 배포

```bash
vercel --prod
```

Vercel 환경 변수 설정:
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `.env.local`의 모든 변수를 추가
3. `GOOGLE_CLOUD_TTS_CREDENTIALS`는 JSON 문자열로 입력

## 문제 해결

일반적인 문제와 해결 방법은 [환경 설정 가이드](./docs/SETUP_GUIDE.md#4-문제-해결)를 참조하세요.

주요 문제:
- ❌ "GOOGLE_API_KEY is not configured" → API 키 설정 확인
- ❌ "Google Cloud TTS authentication failed" → Service Account 키 확인
- ❌ "API 예산 초과" → 예산 증액 또는 캐시 활용

## 라이선스

MIT License

## 기여

이슈 리포트 및 Pull Request를 환영합니다!

## 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Google Cloud TTS 문서](https://cloud.google.com/text-to-speech/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
