# 환경 설정 가이드

이 문서는 영어 학습 애플리케이션의 환경 설정 방법을 안내합니다.

## 목차

1. [Google Gemini AI 설정](#1-google-gemini-ai-설정)
2. [Google Cloud TTS 설정](#2-google-cloud-tts-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [문제 해결](#4-문제-해결)

---

## 1. Google Gemini AI 설정

### 1.1 API 키 발급

1. **Google AI Studio 접속**
   - URL: https://aistudio.google.com/app/apikey

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 기존 Google Cloud 프로젝트 선택 또는 새 프로젝트 생성
   - API 키가 생성되면 안전한 곳에 복사

3. **API 키 저장**
   - 프로젝트 루트의 `.env.local` 파일에 저장:
   ```env
   GOOGLE_API_KEY=your-api-key-here
   AI_PROVIDER=gemini
   ```

### 1.2 지원 모델

- **gemini-2.0-flash-exp** (권장)
  - 최신 Gemini 2.0 Flash 실험 모델
  - 빠른 응답 속도 + 높은 품질
  - 비용: Input $0.10/1M tokens, Output $0.40/1M tokens

- **gemini-1.5-flash**
  - 안정적인 Gemini 1.5 Flash 모델
  - 비용: Input $0.075/1M tokens, Output $0.30/1M tokens

### 1.3 요금 정보 (2026년 1월 기준)

| 모델 | Input (1M tokens) | Output (1M tokens) | 예상 단어당 비용 |
|------|-------------------|-------------------|-----------------|
| gemini-2.0-flash-exp | $0.10 | $0.40 | ~$0.0007 |
| gemini-1.5-flash | $0.075 | $0.30 | ~$0.0005 |
| gpt-4o-mini | $0.15 | $0.60 | ~$0.0010 |

💡 **비용 절감 팁**: 기본 예산은 월 $5로 설정되어 있으며, 약 7,000~10,000회 단어 분석이 가능합니다.

---

## 2. Google Cloud TTS 설정

### 2.1 Google Cloud 프로젝트 설정

1. **Google Cloud Console 접속**
   - URL: https://console.cloud.google.com/

2. **새 프로젝트 생성**
   - 프로젝트 선택 드롭다운 → "새 프로젝트"
   - 프로젝트 이름 입력 (예: "english-study-app")
   - "만들기" 클릭

3. **Text-to-Speech API 활성화**
   - 검색창에 "Text-to-Speech API" 입력
   - API 선택 후 "사용 설정" 클릭

### 2.2 Service Account 생성

1. **Service Account 페이지 이동**
   - 메뉴: IAM 및 관리자 → Service Account

2. **Service Account 생성**
   - "서비스 계정 만들기" 클릭
   - 이름: `english-study-tts`
   - 역할: "Cloud Text-to-Speech 사용자" 선택
   - "완료" 클릭

3. **키 생성**
   - 생성된 Service Account 클릭
   - "키" 탭 → "키 추가" → "새 키 만들기"
   - 키 유형: JSON 선택
   - 다운로드된 JSON 파일을 안전한 위치에 저장

### 2.3 환경 변수 설정

**방법 1: 키 파일 경로 지정 (로컬 개발)**

```env
GOOGLE_APPLICATION_CREDENTIALS=D:\credentials\google-cloud-tts-key.json
```

**방법 2: JSON 문자열 사용 (배포 환경)**

1. JSON 파일 내용을 한 줄로 변환:
```bash
cat google-cloud-tts-key.json | jq -c
```

2. `.env.local`에 추가:
```env
GOOGLE_CLOUD_TTS_CREDENTIALS={"type":"service_account","project_id":"..."}
```

### 2.4 TTS 음성 설정

```env
# 음성 이름 (기본값: en-US-Neural2-J)
GOOGLE_TTS_VOICE_NAME=en-US-Neural2-J

# 음성 타입 (기본값: WaveNet)
GOOGLE_TTS_VOICE_TYPE=WaveNet
```

**추천 음성 옵션:**

| 음성 이름 | 타입 | 특징 | 비용 |
|----------|------|------|------|
| en-US-Neural2-J | Neural2 | 최고 품질, 자연스러운 발음 | $16/1M characters |
| en-US-Wavenet-D | WaveNet | 높은 품질, 안정적 | $16/1M characters |
| en-US-Standard-C | Standard | 기본 품질, 저렴 | $4/1M characters |

### 2.5 TTS 요금 정보

- **Neural2 / WaveNet**: $16 per 1M characters
- **Standard**: $4 per 1M characters
- **무료 할당량**: 매월 최초 0~4M characters (Standard 기준)

💡 **비용 절감**: 애플리케이션은 자동으로 TTS 결과를 캐싱하므로 동일한 발음은 재사용됩니다.

---

## 3. 환경 변수 설정

### 3.1 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# AI 프로바이더 설정
AI_PROVIDER=gemini
GOOGLE_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp

# Google Cloud TTS 설정
GOOGLE_APPLICATION_CREDENTIALS=D:\credentials\google-cloud-tts-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_TTS_VOICE_NAME=en-US-Neural2-J
GOOGLE_TTS_VOICE_TYPE=WaveNet

# 예산 설정
AI_MONTHLY_BUDGET=5.00
```

### 3.2 환경 변수 검증

애플리케이션 시작 시 자동으로 환경 변수를 검증합니다. 누락된 필수 변수가 있으면 에러 메시지가 표시됩니다.

**검증 항목:**
- ✅ `AI_PROVIDER`가 유효한 값인지 확인 (gemini, openai, anthropic)
- ✅ 선택된 프로바이더의 API 키가 설정되었는지 확인
- ✅ TTS 설정이 올바른지 확인

---

## 4. 문제 해결

### 4.1 "GOOGLE_API_KEY is not configured" 에러

**원인**: Gemini API 키가 설정되지 않음

**해결 방법**:
1. `.env.local` 파일에 `GOOGLE_API_KEY` 추가
2. 개발 서버 재시작: `npm run dev`

### 4.2 "Google Cloud TTS authentication failed" 에러

**원인**: TTS Service Account 인증 실패

**해결 방법**:
1. Service Account JSON 키 파일 경로 확인
2. 환경 변수 확인:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=절대경로
   ```
3. 키 파일의 권한 확인 (읽기 가능해야 함)

### 4.3 "API 예산 초과" 경고

**원인**: 월별 예산 한도에 도달

**해결 방법**:
1. `.env.local`에서 예산 증액:
   ```env
   AI_MONTHLY_BUDGET=10.00
   ```
2. 또는 다음 달까지 대기 (자동 리셋)

### 4.4 JSON 파싱 에러

**원인**: AI API 응답이 예상 형식과 다름

**해결 방법**:
1. 콘솔 로그에서 실제 응답 확인
2. 모델 변경 시도:
   ```env
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. 이슈 리포트 제출 (응답 내용 포함)

### 4.5 Heteronym 발음 오류

**원인**: 동형이의어의 발음이 잘못 생성됨

**해결 방법**:
1. 프롬프트가 품사별 발음을 올바르게 구분하는지 확인
2. `src/lib/heteronyms-detector.ts`에서 heteronym 목록 확인
3. TTS API에 명시적으로 IPA 발음 전달 확인

---

## 5. 프로덕션 배포

### 5.1 Vercel 배포

1. **환경 변수 설정**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - 모든 환경 변수를 추가 (`.env.local` 내용)

2. **TTS 키 설정 (Vercel용)**
   ```env
   GOOGLE_CLOUD_TTS_CREDENTIALS={"type":"service_account",...}
   ```

3. **배포**
   ```bash
   vercel --prod
   ```

### 5.2 보안 체크리스트

- [ ] API 키가 소스 코드에 포함되지 않음
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] TTS Service Account 권한이 최소화됨 (Cloud TTS 사용자만)
- [ ] Rate Limiting 설정됨 (API Route 레벨)
- [ ] 에러 메시지에 민감한 정보 노출 안 됨

---

## 6. 추가 리소스

- [Google AI Studio 문서](https://ai.google.dev/docs)
- [Google Cloud TTS 문서](https://cloud.google.com/text-to-speech/docs)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [프로젝트 ROADMAP](./ROADMAP.md)

---

**문의**: 문제가 계속되면 GitHub Issues에 리포트해주세요.
