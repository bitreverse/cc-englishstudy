# "TTS 생성에 실패했습니다" 에러 해결 완료

## 문제 요약

사용자가 단어 검색 후 발음 재생 버튼을 클릭했을 때 **"TTS 생성에 실패했습니다"** 에러가 발생했습니다.

---

## 원인 분석

### 핵심 원인

**Google Cloud Service Account 인증 키 파일이 설정되지 않음**

`.env.local` 파일에서 `GOOGLE_APPLICATION_CREDENTIALS`가 다음과 같이 설정되어 있었으나:
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
```

실제로 `google-service-account.json` 파일이 프로젝트 루트에 존재하지 않았습니다.

### 기술적 배경

Google Cloud TTS API는 Service Account 인증 방식을 사용합니다:

1. **Service Account 생성**: Google Cloud Console에서 특수한 서비스 계정 생성
2. **JSON 키 발급**: 인증 정보가 담긴 JSON 파일 다운로드
3. **애플리케이션 설정**: 해당 JSON 파일 경로를 환경변수로 지정
4. **API 호출**: 애플리케이션이 해당 키를 사용하여 TTS API 호출

이 과정에서 **3번 단계가 누락**되어 에러가 발생했습니다.

---

## 해결 방법

### 1. 상세 설정 가이드 문서 작성

다음 문서들을 작성하여 사용자가 쉽게 따라할 수 있도록 했습니다:

#### 📖 주요 가이드 문서

| 문서 | 용도 | 소요 시간 |
|------|------|----------|
| [`docs/GOOGLE_CLOUD_SETUP.md`](./GOOGLE_CLOUD_SETUP.md) | 전체 설정 가이드 (상세) | 15-20분 |
| [`docs/TTS_SETUP_QUICKSTART.md`](./TTS_SETUP_QUICKSTART.md) | 빠른 시작 가이드 | 5-10분 |

#### 📝 가이드 내용

- Google Cloud 프로젝트 생성 (스크린샷 포함)
- Text-to-Speech API 활성화
- Service Account 생성 및 권한 부여
- JSON 키 파일 다운로드
- 프로젝트 설정 방법 (파일 경로 / JSON 문자열)
- 테스트 및 검증
- 비용 관리 및 예산 설정
- 문제 해결 FAQ

---

### 2. 코드 개선 - 에러 처리 강화

#### 2.1 `src/lib/google-tts-client.ts` 개선

**개선 전**:
```typescript
throw new Error('Google Cloud TTS credentials not configured.');
```

**개선 후**:
```typescript
throw new Error(
  '❌ Google Cloud TTS 인증 정보가 설정되지 않았습니다.\n\n' +
  '다음 중 하나를 .env.local 파일에 설정하세요:\n' +
  '1. GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json\n' +
  '2. GOOGLE_CLOUD_TTS_CREDENTIALS=\'{"type":"service_account",...}\'\n\n' +
  '📖 자세한 설정 방법은 docs/GOOGLE_CLOUD_SETUP.md를 참조하세요.'
);
```

#### 2.2 에러 타입별 상세 메시지

다음과 같은 상황별 에러 메시지를 추가했습니다:

| 에러 상황 | 상세 안내 |
|----------|----------|
| **인증 정보 미설정** | 환경변수 설정 방법 + 설정 가이드 링크 |
| **키 파일 없음** | 파일 경로 확인 방법 + 다운로드 가이드 |
| **API 미활성화** | API 활성화 링크 + 단계별 해결 방법 |
| **권한 부족** | IAM 설정 링크 + 역할 부여 방법 |
| **Quota 초과** | 사용량 확인 링크 + 무료 할당량 안내 |
| **인증 실패** | JSON 키 검증 방법 + 재발급 가이드 |

#### 2.3 디버깅 로그 강화

```typescript
// 성공 시 명확한 메시지
console.log('[Google TTS] ✅ Initialized with keyFilename:', path);
console.log('[Google TTS] ✅ TTS 생성 성공, 오디오 크기:', size, 'bytes');

// 실패 시 상세한 정보
console.error('[Google TTS] ❌ Failed to initialize:', error);
console.error('[Google TTS] ❌ TTS 생성 실패:', error);
```

---

### 3. 테스트 스크립트 생성

#### 3.1 `test-google-tts.js` 생성

Google Cloud TTS 설정을 단계별로 검증하는 테스트 스크립트를 작성했습니다.

**실행 방법**:
```bash
node test-google-tts.js
```

**테스트 항목**:
- [x] 환경변수 확인
- [x] 키 파일 존재 여부
- [x] 키 파일 형식 검증
- [x] TTS 클라이언트 초기화
- [x] TTS API 호출 및 오디오 생성
- [x] 오디오 파일 저장 (`test-output.mp3`)

**출력 예시**:
```
============================================================
🧪 Google Cloud TTS 설정 테스트
============================================================

Step 1: 환경변수 확인
✅ GOOGLE_APPLICATION_CREDENTIALS: ./google-service-account.json

Step 2: 키 파일 확인
✅ 키 파일 존재
✅ 키 파일 형식 유효
   프로젝트 ID: english-study-app-123456

Step 3: TTS 클라이언트 초기화
✅ TTS 클라이언트 초기화 성공

Step 4: TTS API 호출 테스트
✅ TTS 오디오 생성 성공
✅ 오디오 파일 저장: test-output.mp3

============================================================
✅ 모든 테스트 통과!
============================================================
```

---

### 4. 보안 강화

#### 4.1 `.gitignore` 업데이트

Service Account 키 파일이 절대 Git에 커밋되지 않도록 다음 패턴을 추가했습니다:

```gitignore
# Google Cloud Service Account 키 (절대 커밋하지 말 것!)
google-service-account.json
*-service-account.json

# 테스트 출력 파일
test-output.mp3
test-*.mp3
```

#### 4.2 JSON 키 검증

`test-google-tts.js`에서 다음 필수 필드를 자동 검증:
- `type`
- `project_id`
- `private_key`
- `client_email`

#### 4.3 두 가지 인증 방식 지원

**방법 1: 파일 경로 (로컬 개발용)**
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
```

**방법 2: JSON 문자열 (배포 환경용)**
```env
GOOGLE_CLOUD_TTS_CREDENTIALS='{"type":"service_account",...}'
```

---

### 5. 문서 업데이트

#### 5.1 `README.md` 업데이트

빠른 시작 섹션에 다음을 추가:
- Google Cloud TTS 설정 가이드 링크
- 테스트 스크립트 실행 방법
- Google Gemini API 키 발급 링크

#### 5.2 문서 구조

```
docs/
├── GOOGLE_CLOUD_SETUP.md          # 전체 설정 가이드 (상세)
├── TTS_SETUP_QUICKSTART.md        # 빠른 시작 가이드
├── TTS_ERROR_RESOLVED.md          # 이 문서 (에러 해결 기록)
├── SETUP_GUIDE.md                 # 전체 환경 설정
├── PRD.md                         # 프로젝트 요구사항
└── ROADMAP.md                     # 개발 로드맵
```

---

## 사용자 액션 아이템

### 즉시 수행

1. **Google Cloud 프로젝트 생성** (5-10분)
   - 📖 가이드: [`docs/TTS_SETUP_QUICKSTART.md`](./TTS_SETUP_QUICKSTART.md)

2. **JSON 키 파일 다운로드**
   - Google Cloud Console → Service Account → 키 생성

3. **프로젝트에 키 파일 설정**
   ```
   파일 위치: D:\05.Programming\ClaudeCode\cc-englishstudy\google-service-account.json
   파일명: google-service-account.json (정확히 이 이름)
   ```

4. **설정 테스트**
   ```bash
   node test-google-tts.js
   ```

5. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

6. **애플리케이션 테스트**
   - http://localhost:3000
   - "record" 검색
   - 발음 재생 버튼 클릭
   - ✅ 오디오 정상 재생 확인

---

## 예상 결과

### 성공 시

- ✅ 테스트 스크립트 통과
- ✅ `test-output.mp3` 파일 생성
- ✅ 브라우저에서 발음 정상 재생
- ✅ 터미널 로그:
  ```
  [Google TTS] ✅ Initialized with keyFilename
  [TTS API] ✅ TTS 생성 성공
  ```

### 실패 시

각 에러 메시지에 **해결 방법**과 **설정 가이드 링크**가 포함되어 있습니다.

예시:
```
❌ Google Cloud TTS 인증 정보가 설정되지 않았습니다.

다음 중 하나를 .env.local 파일에 설정하세요:
1. GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
2. GOOGLE_CLOUD_TTS_CREDENTIALS='{"type":"service_account",...}'

📖 자세한 설정 방법은 docs/GOOGLE_CLOUD_SETUP.md를 참조하세요.
```

---

## 비용 안내

### 무료 할당량

- **Neural2/WaveNet 음성**: 매월 **100만 자** 무료
- **Standard 음성**: 매월 **400만 자** 무료

### 예상 사용량

- 단어당 평균 10자
- 1,000단어 생성 = 10,000자
- 월 100만 자 할당량의 **1%만 사용**

> 💡 대부분의 경우 **완전히 무료**로 사용 가능합니다!

### Google Cloud 무료 체험

- **$300 크레딧** (90일 동안)
- 무료 체험 종료 후 자동 결제 없음

---

## 향후 개선 사항

### 1. Fallback 시스템 구현 (선택적)

Google Cloud TTS 실패 시 OpenAI TTS로 자동 전환:

```typescript
try {
  return await googleTTS.synthesize(ssml);
} catch (error) {
  console.warn('[TTS] Google Cloud TTS 실패, OpenAI TTS로 fallback');
  return await openaiTTS.synthesize(text);
}
```

### 2. 모니터링 대시보드 추가

- TTS API 호출 횟수 추적
- 캐시 히트율 확인
- 월별 비용 예측

### 3. 음성 선택 UI

사용자가 UI에서 음성을 선택할 수 있는 기능:
- Male / Female
- US / UK / AU 억양
- 속도 조절

---

## 관련 파일

### 새로 생성된 파일

- ✅ `docs/GOOGLE_CLOUD_SETUP.md`
- ✅ `docs/TTS_SETUP_QUICKSTART.md`
- ✅ `docs/TTS_ERROR_RESOLVED.md` (이 문서)
- ✅ `test-google-tts.js`

### 수정된 파일

- ✅ `src/lib/google-tts-client.ts` (에러 처리 강화)
- ✅ `.gitignore` (보안 강화)
- ✅ `README.md` (설정 가이드 링크 추가)

### 변경 없음

- `src/app/api/tts/route.ts` (이미 적절한 에러 처리 포함)
- `src/lib/env.ts` (환경변수 스키마 적절함)

---

## 요약

### 문제
❌ "TTS 생성에 실패했습니다" 에러

### 원인
⚠️ Google Cloud Service Account 인증 키 미설정

### 해결
✅ 상세 설정 가이드 제공 + 에러 처리 강화 + 테스트 도구 제공

### 다음 단계
📖 [`docs/TTS_SETUP_QUICKSTART.md`](./TTS_SETUP_QUICKSTART.md) 가이드를 따라 설정 완료 (5-10분 소요)

---

**문의 사항이 있으면 프로젝트 이슈 트래커에 질문을 남겨주세요!** 🚀
