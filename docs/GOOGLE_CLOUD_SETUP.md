# Google Cloud Text-to-Speech API 설정 가이드

이 가이드는 Google Cloud TTS API를 사용하여 고품질 영어 발음 오디오를 생성하기 위한 단계별 설정 방법을 안내합니다.

---

## 목차

1. [사전 준비](#1-사전-준비)
2. [Google Cloud 프로젝트 생성](#2-google-cloud-프로젝트-생성)
3. [Text-to-Speech API 활성화](#3-text-to-speech-api-활성화)
4. [Service Account 생성](#4-service-account-생성)
5. [JSON 키 파일 다운로드](#5-json-키-파일-다운로드)
6. [프로젝트 설정](#6-프로젝트-설정)
7. [테스트 및 검증](#7-테스트-및-검증)
8. [비용 관리](#8-비용-관리)
9. [문제 해결](#9-문제-해결)

---

## 1. 사전 준비

### 필요한 것

- ✅ Google 계정 (Gmail 또는 Google Workspace)
- ✅ 신용카드 (Google Cloud 무료 체험 또는 결제용)
- ✅ 인터넷 브라우저

### Google Cloud 무료 체험

- **$300 크레딧** (90일 동안 사용 가능)
- Text-to-Speech API 무료 할당량:
  - **WaveNet/Neural2 음성**: 매월 100만 자까지 무료
  - **Standard 음성**: 매월 400만 자까지 무료
- 무료 체험 종료 후에도 자동 결제되지 않음 (수동으로 업그레이드 필요)

> 💡 **참고**: 이 프로젝트의 단어 발음 생성은 월 100만 자를 초과할 가능성이 매우 낮으므로, 대부분의 경우 **무료**로 사용 가능합니다.

---

## 2. Google Cloud 프로젝트 생성

### Step 1: Google Cloud Console 접속

1. 브라우저에서 [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Google 계정으로 로그인
3. 첫 방문 시 약관 동의 및 국가 선택

### Step 2: 새 프로젝트 만들기

1. **상단 프로젝트 선택 드롭다운** 클릭
   - 화면 왼쪽 상단 "Google Cloud" 로고 옆에 위치
   - "프로젝트 선택" 또는 현재 프로젝트 이름 표시

2. **"새 프로젝트" 클릭**
   - 팝업 창 우측 상단의 "새 프로젝트" 버튼

3. **프로젝트 정보 입력**
   ```
   프로젝트 이름: english-study-app
   조직: 조직 없음 (개인 계정의 경우)
   위치: 조직 없음
   ```

4. **"만들기" 클릭**
   - 프로젝트 생성 완료까지 1-2분 소요
   - 알림에서 "프로젝트가 생성되었습니다" 확인

5. **생성된 프로젝트로 전환**
   - 상단 프로젝트 드롭다운에서 방금 만든 프로젝트 선택

### Step 3: 프로젝트 ID 확인

프로젝트 ID는 나중에 필요할 수 있으므로 메모해두세요.

```
예시: english-study-app-123456
```

**확인 방법**:
- Dashboard 페이지의 "프로젝트 정보" 카드
- 또는 상단 프로젝트 선택 드롭다운

---

## 3. Text-to-Speech API 활성화

### Step 1: API 라이브러리 페이지 이동

**방법 A: 메뉴에서 이동**
1. 왼쪽 햄버거 메뉴(≡) 클릭
2. "API 및 서비스" → "라이브러리" 선택

**방법 B: 직접 링크**
- [API 라이브러리 바로가기](https://console.cloud.google.com/apis/library)

### Step 2: Text-to-Speech API 검색

1. 검색창에 **"Text-to-Speech"** 입력
2. **"Cloud Text-to-Speech API"** 선택
   - 제공업체: Google
   - 아이콘: 파란색 말풍선 모양

### Step 3: API 활성화

1. **"사용" 또는 "사용 설정" 버튼** 클릭
2. 활성화 완료 대기 (수 초 소요)
3. **"API 사용 설정됨"** 확인
   - 페이지 상단에 녹색 체크 표시

---

## 4. Service Account 생성

Service Account는 애플리케이션이 Google Cloud API를 안전하게 호출할 수 있도록 하는 특수한 계정입니다.

### Step 1: Service Account 페이지 이동

**방법 A: 메뉴에서 이동**
1. 왼쪽 메뉴: "IAM 및 관리자" → "서비스 계정"

**방법 B: 직접 링크**
- [Service Account 바로가기](https://console.cloud.google.com/iam-admin/serviceaccounts)

### Step 2: 새 Service Account 만들기

1. **상단 "+ 서비스 계정 만들기"** 클릭

2. **서비스 계정 세부정보 입력** (1/3 단계)
   ```
   서비스 계정 이름: english-study-tts
   서비스 계정 ID: english-study-tts (자동 생성, 수정 가능)
   설명: English Study App - Text to Speech Service
   ```
   - **"만들기 및 계속하기"** 클릭

3. **서비스 계정에 권한 부여** (2/3 단계)
   - **"역할 선택"** 드롭다운 클릭
   - 검색창에 **"text-to-speech"** 입력
   - **"Cloud Text-to-Speech 사용자"** 선택
     - 또는 **"Cloud Text-to-Speech API 사용자"**
   - **"계속"** 클릭

4. **사용자에게 서비스 계정 액세스 권한 부여** (3/3 단계)
   - 이 단계는 **건너뛰기**
   - **"완료"** 클릭

### Step 3: Service Account 생성 확인

Service Account 목록에 새로 만든 계정이 표시됩니다:
```
이름: english-study-tts
이메일: english-study-tts@english-study-app-123456.iam.gserviceaccount.com
```

---

## 5. JSON 키 파일 다운로드

⚠️ **중요**: 이 단계에서 생성되는 JSON 키 파일은 **매우 민감한 정보**입니다. 절대 공개하거나 GitHub에 커밋하지 마세요!

### Step 1: Service Account 선택

1. Service Account 목록에서 **"english-study-tts"** 클릭

### Step 2: 키 탭으로 이동

1. 상단 탭에서 **"키"** 선택

### Step 3: 새 키 만들기

1. **"키 추가"** 버튼 클릭 → **"새 키 만들기"** 선택
2. 키 유형 선택 팝업:
   - **"JSON"** 선택 (기본값)
   - **"만들기"** 클릭

3. **JSON 파일 자동 다운로드**
   - 브라우저 다운로드 폴더에 저장됨
   - 파일명 예시: `english-study-app-123456-a1b2c3d4e5f6.json`

4. **확인 메시지**
   ```
   비공개 키가 컴퓨터에 저장되었습니다.
   이 키 파일을 안전하게 보관하세요.
   ```

### Step 4: 키 파일 확인

다운로드한 JSON 파일을 텍스트 에디터로 열어보면 다음과 같은 구조입니다:

```json
{
  "type": "service_account",
  "project_id": "english-study-app-123456",
  "private_key_id": "a1b2c3d4e5f6...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "english-study-tts@english-study-app-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 6. 프로젝트 설정

### 옵션 A: 파일 경로 방식 (로컬 개발용 - 권장)

#### Step 1: JSON 키 파일을 프로젝트 루트에 복사

1. 다운로드한 JSON 파일을 복사
2. 프로젝트 루트 디렉토리에 붙여넣기:
   ```
   D:\05.Programming\ClaudeCode\cc-englishstudy\google-service-account.json
   ```

3. 파일명을 **`google-service-account.json`**으로 변경

#### Step 2: `.env.local` 파일 업데이트

프로젝트 루트의 `.env.local` 파일을 열고 다음 내용을 확인/수정:

```env
# ============================================
# Google Cloud TTS Configuration
# ============================================

# Google Cloud Service Account 키 파일 경로
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json

# Google Cloud 프로젝트 ID (선택적)
GOOGLE_CLOUD_PROJECT_ID=english-study-app-123456

# TTS 음성 설정
GOOGLE_TTS_VOICE_NAME=en-US-Neural2-J
GOOGLE_TTS_VOICE_TYPE=Neural2
```

> 💡 **상대 경로 사용**: `./google-service-account.json`는 프로젝트 루트 기준 상대 경로입니다.

#### Step 3: `.gitignore` 확인

프로젝트의 `.gitignore` 파일에 다음 라인이 있는지 확인:

```gitignore
# Google Cloud Service Account 키 (절대 커밋하지 말 것!)
google-service-account.json
*.json
.env.local
```

이미 설정되어 있으면 패스!

---

### 옵션 B: 환경변수 JSON 문자열 방식 (배포 환경용)

Vercel, Netlify 등 배포 환경에서는 파일을 업로드할 수 없으므로 JSON 내용을 환경변수로 설정합니다.

#### Step 1: JSON 파일 내용 복사

1. `google-service-account.json` 파일을 텍스트 에디터로 열기
2. **전체 내용 복사** (Ctrl+A, Ctrl+C)

#### Step 2: 배포 플랫폼에서 환경변수 설정

**Vercel 예시**:
1. Vercel Dashboard → 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 새 환경변수 추가:
   ```
   Name: GOOGLE_CLOUD_TTS_CREDENTIALS
   Value: {"type":"service_account","project_id":"..."}
   ```
   - JSON 전체를 한 줄로 붙여넣기

**로컬 `.env.local`에서 테스트** (선택적):
```env
# 파일 경로 대신 JSON 문자열 사용
GOOGLE_CLOUD_TTS_CREDENTIALS='{"type":"service_account","project_id":"english-study-app-123456",...}'
```

> ⚠️ **주의**: JSON 문자열에는 작은따옴표(`'`)로 감싸야 하며, 개행 문자(`\n`)는 그대로 유지해야 합니다.

---

## 7. 테스트 및 검증

### Step 1: 개발 서버 재시작

```bash
# 기존 서버가 실행 중이면 종료 (Ctrl+C)
npm run dev
```

### Step 2: 브라우저에서 테스트

1. http://localhost:3000 접속
2. 검색창에 **"record"** 입력
3. 검색 결과에서 **발음 재생 버튼 (🔊)** 클릭
4. 오디오가 정상 재생되는지 확인

### Step 3: 콘솔 로그 확인

개발 서버 터미널에서 다음과 같은 로그를 확인:

```
[Google TTS] Initialized with keyFilename
[TTS API] 요청: { word: 'record', ipa: '/ˈrɛkərd/', phoneme: undefined }
[TTS API] SSML 생성: { word: 'record', ipa: '/ˈrɛkərd/', ssml: '<speak>...' }
[Google TTS] Synthesizing speech: { voice: 'en-US-Neural2-J', ... }
[TTS API] 캐시에 저장 완료
```

### Step 4: 에러 체크

만약 에러가 발생하면 다음을 확인하세요:

#### ❌ 에러 1: "Google Cloud TTS credentials not configured"

**원인**: 환경변수가 설정되지 않음

**해결**:
1. `.env.local` 파일 확인
2. `GOOGLE_APPLICATION_CREDENTIALS` 또는 `GOOGLE_CLOUD_TTS_CREDENTIALS` 설정 확인
3. 개발 서버 재시작

#### ❌ 에러 2: "ENOENT: no such file or directory"

**원인**: JSON 키 파일이 지정된 경로에 없음

**해결**:
1. `google-service-account.json` 파일이 프로젝트 루트에 있는지 확인
2. 파일명 및 경로 확인

#### ❌ 에러 3: "API [texttospeech.googleapis.com] is not enabled"

**원인**: Text-to-Speech API가 활성화되지 않음

**해결**:
1. [API 라이브러리](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com) 접속
2. "사용 설정" 클릭
3. 올바른 프로젝트 선택 확인

#### ❌ 에러 4: "Permission denied" 또는 "PERMISSION_DENIED"

**원인**: Service Account에 권한이 없음

**해결**:
1. [IAM 페이지](https://console.cloud.google.com/iam-admin/iam) 접속
2. Service Account 찾기: `english-study-tts@...`
3. "Cloud Text-to-Speech 사용자" 역할 확인
4. 없으면 "수정" → 역할 추가

---

## 8. 비용 관리

### 무료 할당량

| 음성 유형 | 무료 할당량 (월) | 초과 시 요금 |
|----------|----------------|------------|
| Standard | 400만 자 | $4.00 / 100만 자 |
| WaveNet  | 100만 자 | $16.00 / 100만 자 |
| Neural2  | 100만 자 | $16.00 / 100만 자 |

> 💡 **예상 사용량**: 단어당 평균 10자 × 1,000단어 = 10,000자 → 월 100만 자 할당량의 **1%만 사용**

### 예산 알림 설정 (권장)

Google Cloud Console에서 예산 초과를 방지하기 위한 알림을 설정할 수 있습니다.

1. **결제 페이지 이동**
   - 왼쪽 메뉴: "결제" → "예산 및 알림"
   - 또는 [예산 바로가기](https://console.cloud.google.com/billing/budgets)

2. **예산 만들기**
   - "예산 만들기" 클릭
   - 예산 이름: `English Study TTS Budget`
   - 예산 범위: 이 프로젝트
   - 예산 금액: $10.00 (월)

3. **알림 설정**
   - 50% 도달 시 이메일 알림
   - 80% 도달 시 이메일 알림
   - 100% 도달 시 이메일 알림

4. **저장**

### 비용 모니터링

**Cloud Console 대시보드**:
- "결제" → "보고서" 에서 실시간 사용량 확인
- Text-to-Speech API 필터링하여 문자 수 및 비용 확인

---

## 9. 문제 해결

### Q1. JSON 키 파일을 실수로 삭제했어요!

**A**: 새 키를 생성하세요.

1. [Service Account 페이지](https://console.cloud.google.com/iam-admin/serviceaccounts) 접속
2. `english-study-tts` 클릭 → "키" 탭
3. "키 추가" → "새 키 만들기" → JSON 선택
4. 새 키 파일 다운로드 및 설정 (위의 Step 5, 6 반복)

> ⚠️ **보안**: 이전 키는 자동으로 무효화되지 않으므로, "키" 탭에서 삭제하세요.

---

### Q2. 여러 프로젝트가 있는데 어떤 프로젝트를 선택해야 하나요?

**A**: Google Cloud Console 상단의 프로젝트 드롭다운에서 올바른 프로젝트가 선택되었는지 확인하세요.

- 프로젝트 이름: `english-study-app` (또는 생성한 이름)
- 모든 설정은 **선택된 프로젝트** 내에서만 적용됩니다.

---

### Q3. 개발 서버를 재시작해도 에러가 계속 발생해요.

**A**: 다음을 순서대로 확인하세요:

1. **환경변수 확인**
   ```bash
   # PowerShell에서 환경변수 출력
   Get-Content .env.local
   ```
   - `GOOGLE_APPLICATION_CREDENTIALS` 설정 확인

2. **파일 존재 확인**
   ```bash
   # 파일이 있는지 확인
   Test-Path .\google-service-account.json
   # True가 출력되어야 함
   ```

3. **JSON 파일 유효성 검증**
   - JSON 파일을 텍스트 에디터로 열어서 구조가 올바른지 확인
   - `project_id`, `private_key`, `client_email` 필드 존재 확인

4. **API 활성화 확인**
   - [API 대시보드](https://console.cloud.google.com/apis/dashboard) 접속
   - "Cloud Text-to-Speech API"가 "사용 설정됨" 상태인지 확인

5. **권한 확인**
   - [IAM 페이지](https://console.cloud.google.com/iam-admin/iam) 접속
   - Service Account `english-study-tts@...`에 "Cloud Text-to-Speech 사용자" 역할이 있는지 확인

6. **캐시 삭제 및 재시작**
   ```bash
   # Next.js 캐시 삭제
   Remove-Item -Recurse -Force .next
   # 재시작
   npm run dev
   ```

---

### Q4. 프로덕션 배포 시에는 어떻게 설정하나요?

**A**: 배포 플랫폼의 환경변수 설정을 사용하세요.

#### Vercel 배포

1. Vercel Dashboard → 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 다음 환경변수 추가:

   ```
   GOOGLE_CLOUD_TTS_CREDENTIALS
   → JSON 키 파일 전체 내용 (한 줄로)

   GOOGLE_TTS_VOICE_NAME
   → en-US-Neural2-J

   GOOGLE_TTS_VOICE_TYPE
   → Neural2
   ```

4. "Save" 클릭
5. 프로젝트 재배포

#### 다른 플랫폼 (Netlify, Railway, etc.)

동일한 방식으로 환경변수 설정 페이지에서 위의 값들을 추가하세요.

---

### Q5. 비용이 너무 많이 나오고 있어요!

**A**: 비정상적인 사용량이 발생한 경우:

1. **사용량 확인**
   - [결제 보고서](https://console.cloud.google.com/billing/reports) 접속
   - Text-to-Speech API 사용량 확인

2. **캐시 확인**
   - 애플리케이션이 TTS 캐시를 제대로 사용하고 있는지 확인
   - 동일한 단어를 반복 생성하지 않아야 함

3. **Rate Limiting 확인**
   - 봇이나 자동화 스크립트가 API를 과도하게 호출하지 않는지 확인

4. **긴급 조치**
   - [API 대시보드](https://console.cloud.google.com/apis/dashboard) 접속
   - Text-to-Speech API → "사용 중지" 클릭 (임시 차단)

---

## 추가 리소스

- [Google Cloud TTS 공식 문서](https://cloud.google.com/text-to-speech/docs)
- [지원되는 음성 목록](https://cloud.google.com/text-to-speech/docs/voices)
- [SSML 가이드](https://cloud.google.com/text-to-speech/docs/ssml)
- [가격 정보](https://cloud.google.com/text-to-speech/pricing)

---

## 보안 체크리스트

설정 완료 후 다음을 확인하세요:

- [ ] `google-service-account.json` 파일이 `.gitignore`에 포함됨
- [ ] `.env.local` 파일이 Git에 커밋되지 않음
- [ ] JSON 키 파일을 공개 저장소에 업로드하지 않음
- [ ] Service Account에 필요한 최소 권한만 부여됨
- [ ] 예산 알림이 설정됨 (선택적)

---

## 요약

1. ✅ Google Cloud 프로젝트 생성
2. ✅ Text-to-Speech API 활성화
3. ✅ Service Account 생성 및 권한 부여
4. ✅ JSON 키 파일 다운로드
5. ✅ 프로젝트에 키 파일 설정
6. ✅ `.env.local` 환경변수 설정
7. ✅ 개발 서버 재시작 및 테스트
8. ✅ 비용 모니터링 설정

**설정 완료!** 이제 고품질 영어 발음 TTS를 사용할 수 있습니다. 🎉

---

**문제가 발생하면?**

- [문제 해결 섹션](#9-문제-해결) 참조
- 또는 프로젝트 이슈 트래커에 질문 남기기
