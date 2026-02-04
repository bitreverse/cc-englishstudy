# Google Cloud TTS 빠른 설정 가이드

**목표**: 5-10분 안에 Google Cloud TTS를 설정하고 테스트하기

---

## 체크리스트

설정 전 다음을 준비하세요:

- [ ] Google 계정 (Gmail)
- [ ] 신용카드 (Google Cloud 무료 체험용, 실제 결제 없음)
- [ ] 10분의 시간

---

## Step 1: Google Cloud 프로젝트 생성 (3분)

### 1.1 Google Cloud Console 접속

🔗 https://console.cloud.google.com/

### 1.2 새 프로젝트 만들기

1. 상단 프로젝트 드롭다운 클릭
2. "새 프로젝트" 선택
3. 프로젝트 이름: `english-study-app`
4. "만들기" 클릭
5. 생성된 프로젝트로 전환

---

## Step 2: Text-to-Speech API 활성화 (1분)

### 2.1 API 활성화

🔗 https://console.cloud.google.com/apis/library/texttospeech.googleapis.com

1. "사용 설정" 또는 "사용" 클릭
2. 활성화 완료 대기 (수 초)

---

## Step 3: Service Account 생성 및 키 다운로드 (3분)

### 3.1 Service Account 페이지 이동

🔗 https://console.cloud.google.com/iam-admin/serviceaccounts

### 3.2 Service Account 만들기

1. **"+ 서비스 계정 만들기"** 클릭

2. **서비스 계정 세부정보** (1/3)
   ```
   이름: english-study-tts
   설명: English Study TTS Service
   ```
   → "만들기 및 계속하기" 클릭

3. **권한 부여** (2/3)
   - 역할 선택: **"Cloud Text-to-Speech 사용자"**
   - 검색창에 "text-to-speech" 입력
   → "계속" 클릭

4. **사용자 액세스** (3/3)
   - 건너뛰기
   → "완료" 클릭

### 3.3 JSON 키 다운로드

1. 생성된 **"english-study-tts"** 클릭
2. 상단 **"키"** 탭 선택
3. **"키 추가"** → **"새 키 만들기"**
4. 키 유형: **JSON** (기본값)
5. **"만들기"** 클릭
6. **JSON 파일 자동 다운로드됨**
   - 파일명 예시: `english-study-app-123456-a1b2c3d4e5f6.json`

⚠️ **중요**: 이 파일은 절대 공개하면 안 됩니다!

---

## Step 4: 프로젝트에 키 파일 설정 (2분)

### 4.1 JSON 키 파일 복사

1. 다운로드한 JSON 파일을 프로젝트 루트로 복사:
   ```
   D:\05.Programming\ClaudeCode\cc-englishstudy\google-service-account.json
   ```

2. 파일명을 정확히 **`google-service-account.json`**으로 변경

### 4.2 `.env.local` 파일 확인

프로젝트 루트의 `.env.local` 파일을 열고 다음 내용 확인:

```env
# Google Cloud TTS 설정
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
GOOGLE_TTS_VOICE_NAME=en-US-Neural2-J
GOOGLE_TTS_VOICE_TYPE=Neural2
```

---

## Step 5: 테스트 (1분)

### 5.1 설정 테스트 스크립트 실행

```bash
node test-google-tts.js
```

### 5.2 예상 출력

```
============================================================
🧪 Google Cloud TTS 설정 테스트
============================================================

Step 1: 환경변수 확인

✅ GOOGLE_APPLICATION_CREDENTIALS: ./google-service-account.json

Step 2: 키 파일 확인
✅ 키 파일 존재: D:\...\google-service-account.json
✅ 키 파일 형식 유효
   프로젝트 ID: english-study-app-123456
   Service Account: english-study-tts@...

Step 3: TTS 클라이언트 초기화
✅ TTS 클라이언트 초기화 성공 (keyFilename)

Step 4: TTS API 호출 테스트
테스트 단어: "hello"
API 호출 중...
✅ TTS 오디오 생성 성공 (크기: 12345 bytes)
✅ 오디오 파일 저장: D:\...\test-output.mp3

============================================================
✅ 모든 테스트 통과!
============================================================
Google Cloud TTS 설정이 올바르게 완료되었습니다.
```

### 5.3 애플리케이션 테스트

1. 개발 서버 시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 http://localhost:3000 접속

3. "record" 검색

4. 발음 재생 버튼 (🔊) 클릭

5. 오디오가 정상 재생되면 성공! 🎉

---

## 문제 해결

### ❌ "키 파일이 존재하지 않습니다"

**원인**: JSON 키 파일이 잘못된 위치에 있음

**해결**:
1. 파일이 프로젝트 루트에 있는지 확인
2. 파일명이 정확히 `google-service-account.json`인지 확인
3. `.env.local`의 경로가 `./google-service-account.json`인지 확인

---

### ❌ "API가 활성화되지 않았습니다"

**원인**: Text-to-Speech API가 활성화되지 않음

**해결**:
1. https://console.cloud.google.com/apis/library/texttospeech.googleapis.com 접속
2. 올바른 프로젝트 선택 확인 (상단 드롭다운)
3. "사용 설정" 클릭
4. 다시 테스트 실행

---

### ❌ "권한이 부족합니다"

**원인**: Service Account에 권한이 없음

**해결**:
1. https://console.cloud.google.com/iam-admin/iam 접속
2. Service Account 찾기: `english-study-tts@...`
3. "수정" 클릭 → "Cloud Text-to-Speech 사용자" 역할 추가
4. 저장 후 다시 테스트

---

### ❌ 여전히 에러 발생

**상세 가이드 참조**:
- 📖 [전체 설정 가이드](./GOOGLE_CLOUD_SETUP.md)
- 🛠️ [문제 해결 섹션](./GOOGLE_CLOUD_SETUP.md#9-문제-해결)

---

## 비용 안내

### 무료 할당량

- **Neural2/WaveNet 음성**: 매월 **100만 자** 무료
- **예상 사용량**: 단어당 10자 × 1,000단어 = 10,000자 → 할당량의 **1%만 사용**

### 무료 체험

- **$300 크레딧** (90일 동안 사용 가능)
- 무료 체험 종료 후 자동 결제 없음 (수동 업그레이드 필요)

> 💡 대부분의 경우 완전히 **무료**로 사용 가능합니다!

---

## 다음 단계

✅ Google Cloud TTS 설정 완료!

이제 다음을 시도해보세요:

1. **동형이의어 테스트**: "record", "present", "lead" 검색
2. **음성 변경**: `.env.local`에서 `GOOGLE_TTS_VOICE_NAME` 변경
   - `en-US-Neural2-C` (Female)
   - `en-US-Neural2-D` (Male)
   - [전체 음성 목록](https://cloud.google.com/text-to-speech/docs/voices)

---

**설정 완료 시간**: 약 5-10분 ⏱️

**다음**: 애플리케이션의 다른 기능 탐색하기 🚀
