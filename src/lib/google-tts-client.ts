/**
 * Google Cloud Text-to-Speech 클라이언트
 *
 * SSML <phoneme> 태그를 사용하여 IPA 발음 기호를 직접 전달합니다.
 * Heteronym(동철이음어)의 정확한 발음을 보장합니다.
 *
 * @module google-tts-client
 */

import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { env } from './env';

// Google Cloud TTS 타입 단축
type SynthesizeSpeechRequest = protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

/**
 * Google Cloud TTS 클라이언트 (싱글톤)
 */
let ttsClient: TextToSpeechClient | null = null;

/**
 * Google Cloud TTS 클라이언트 초기화
 *
 * Service Account 인증 방식:
 * 1. GOOGLE_APPLICATION_CREDENTIALS 환경변수 (파일 경로)
 * 2. GOOGLE_CLOUD_TTS_CREDENTIALS 환경변수 (JSON 문자열)
 *
 * @returns TextToSpeechClient 인스턴스
 * @throws 인증 정보가 없는 경우
 */
function getGoogleTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    // 방법 1: 파일 경로
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        ttsClient = new TextToSpeechClient({
          keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS,
        });
        console.log('[Google TTS] ✅ Initialized with keyFilename:', env.GOOGLE_APPLICATION_CREDENTIALS);
        return ttsClient;
      } catch (error) {
        console.error('[Google TTS] ❌ Failed to initialize with keyFilename:', error);
        throw new Error(
          `Google Cloud TTS 초기화 실패: 키 파일을 읽을 수 없습니다.\n` +
          `파일 경로: ${env.GOOGLE_APPLICATION_CREDENTIALS}\n` +
          `에러: ${error instanceof Error ? error.message : String(error)}\n` +
          `설정 가이드: docs/GOOGLE_CLOUD_SETUP.md`
        );
      }
    }

    // 방법 2: JSON 문자열
    if (env.GOOGLE_CLOUD_TTS_CREDENTIALS) {
      try {
        const credentials = JSON.parse(env.GOOGLE_CLOUD_TTS_CREDENTIALS);

        // 필수 필드 검증
        const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !credentials[field]);

        if (missingFields.length > 0) {
          throw new Error(`JSON 키 파일에 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
        }

        ttsClient = new TextToSpeechClient({ credentials });
        console.log('[Google TTS] ✅ Initialized with credentials JSON');
        return ttsClient;
      } catch (error) {
        console.error('[Google TTS] ❌ Failed to parse credentials JSON:', error);
        throw new Error(
          `Google Cloud TTS 초기화 실패: 환경변수 JSON 형식이 올바르지 않습니다.\n` +
          `에러: ${error instanceof Error ? error.message : String(error)}\n` +
          `설정 가이드: docs/GOOGLE_CLOUD_SETUP.md`
        );
      }
    }

    // 인증 정보 없음
    throw new Error(
      '❌ Google Cloud TTS 인증 정보가 설정되지 않았습니다.\n\n' +
      '다음 중 하나를 .env.local 파일에 설정하세요:\n' +
      '1. GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json\n' +
      '2. GOOGLE_CLOUD_TTS_CREDENTIALS=\'{"type":"service_account",...}\'\n\n' +
      '📖 자세한 설정 방법은 docs/GOOGLE_CLOUD_SETUP.md를 참조하세요.'
    );
  }

  return ttsClient;
}

/**
 * IPA 발음 기호 정리
 *
 * 슬래시(/) 및 공백을 제거하고 순수 IPA 기호만 추출합니다.
 *
 * @param ipa - IPA 발음 기호 (예: "/ˈrɛkərd/")
 * @returns 정리된 IPA (예: "ˈrɛkərd")
 */
function cleanIPA(ipa: string): string {
  return ipa.replace(/\//g, '').trim();
}

/**
 * SSML <phoneme> 태그 생성
 *
 * IPA 발음 기호를 직접 SSML로 변환하여
 * Google Cloud TTS가 정확한 발음을 생성하도록 합니다.
 *
 * **Heteronym 해결:**
 * - record (noun): /ˈrɛkərd/
 * - record (verb): /rɪˈkɔrd/
 * IPA만으로 품사별 발음을 완벽히 구분합니다.
 *
 * **개별 음소 발음 (Phonics):**
 * - 파열음(p, t, k, b, d, g): 매우 짧은 schwa(ə) 추가하여 발음 가능하게 함
 * - 마찰음(f, v, s, z, etc): 순수 음소만 발음
 * - 비음(m, n, ŋ): 연장 가능하므로 순수 음소만 발음
 * - 모음: 순수 모음 소리만 발음
 *
 * @param word - 발음할 단어
 * @param ipa - IPA 발음 기호
 * @param phoneme - 개별 음소 (Phonics별 발음용, 선택적)
 * @returns SSML 문자열
 *
 * @example
 * ```typescript
 * // 전체 단어 발음
 * buildSSML('record', '/ˈrɛkərd/')
 * // => '<speak><phoneme alphabet="ipa" ph="ˈrɛkərd">record</phoneme></speak>'
 *
 * // 개별 음소 발음 (파열음)
 * buildSSML('p', '/p/', 'p')
 * // => '<speak><phoneme alphabet="ipa" ph="pə">p</phoneme></speak>'
 *
 * // 개별 음소 발음 (마찰음)
 * buildSSML('s', '/s/', 's')
 * // => '<speak><phoneme alphabet="ipa" ph="s">s</phoneme></speak>'
 * ```
 */
export function buildSSML(word: string, ipa: string, phoneme?: string): string {
  if (phoneme) {
    // 개별 음소 재생: 강세 기호 제거
    const cleanPhoneme = phoneme.replace(/[ˈˌ]/g, '');

    // 파열음(plosives)은 매우 짧은 schwa(ə)를 추가하여 발음 가능하게 함
    // 파열음은 모음 없이 발음하기 어려우므로 최소한의 schwa 추가
    const plosives = ['p', 't', 'k', 'b', 'd', 'g'];
    const isPlosive = plosives.includes(cleanPhoneme);

    // IPA ph 속성: 파열음이면 schwa 추가, 아니면 그대로
    const ipaPhoneme = isPlosive ? `${cleanPhoneme}ə` : cleanPhoneme;

    // SSML 텍스트는 단순 플레이스홀더 (알파벳 한 글자로 통일)
    const textContent = cleanPhoneme.length === 1 ? cleanPhoneme : 'sound';

    return `<speak><phoneme alphabet="ipa" ph="${ipaPhoneme}">${textContent}</phoneme></speak>`;
  }

  // 전체 단어 발음: IPA 그대로 사용
  const ph = cleanIPA(ipa);
  return `<speak><phoneme alphabet="ipa" ph="${ph}">${word}</phoneme></speak>`;
}

/**
 * Google Cloud TTS API 호출
 *
 * SSML 입력을 사용하여 정확한 발음 오디오를 생성합니다.
 * WaveNet 음성으로 자연스럽고 고품질의 발음을 제공합니다.
 *
 * @param ssml - SSML 문자열
 * @returns MP3 오디오 데이터 (Buffer)
 * @throws API 호출 실패 시
 *
 * @example
 * ```typescript
 * const ssml = buildSSML('record', '/ˈrɛkərd/');
 * const audioBuffer = await synthesizeSpeech(ssml);
 * ```
 */
export async function synthesizeSpeech(ssml: string): Promise<Buffer> {
  const client = getGoogleTTSClient();

  // TTS 요청 설정
  const request: SynthesizeSpeechRequest = {
    input: { ssml },
    voice: {
      languageCode: 'en-US',
      name: env.GOOGLE_TTS_VOICE_NAME,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9, // 학습용이므로 약간 느리게
      pitch: 0,
      volumeGainDb: 0,
    },
  };

  console.log('[Google TTS] Synthesizing speech:', {
    voice: env.GOOGLE_TTS_VOICE_NAME,
    voiceType: env.GOOGLE_TTS_VOICE_TYPE,
    ssml: ssml.substring(0, 100), // 로그 크기 제한
  });

  try {
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content in Google TTS response');
    }

    console.log('[Google TTS] ✅ TTS 생성 성공, 오디오 크기:', response.audioContent.length, 'bytes');

    // Uint8Array를 Buffer로 변환
    return Buffer.from(response.audioContent as Uint8Array);
  } catch (error) {
    console.error('[Google TTS] ❌ TTS 생성 실패:', error);

    // 에러 타입별 상세 메시지
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // API 미활성화
      if (errorMessage.includes('api') && errorMessage.includes('not enabled')) {
        throw new Error(
          '❌ Google Cloud Text-to-Speech API가 활성화되지 않았습니다.\n\n' +
          '해결 방법:\n' +
          '1. https://console.cloud.google.com/apis/library/texttospeech.googleapis.com 접속\n' +
          '2. "사용 설정" 클릭\n' +
          '3. 개발 서버 재시작\n\n' +
          '📖 자세한 설정 방법: docs/GOOGLE_CLOUD_SETUP.md'
        );
      }

      // 권한 부족
      if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        throw new Error(
          '❌ Google Cloud TTS 권한이 부족합니다.\n\n' +
          '해결 방법:\n' +
          '1. https://console.cloud.google.com/iam-admin/iam 접속\n' +
          '2. Service Account에 "Cloud Text-to-Speech 사용자" 역할 부여\n' +
          '3. 개발 서버 재시작\n\n' +
          '📖 자세한 설정 방법: docs/GOOGLE_CLOUD_SETUP.md'
        );
      }

      // 인증 실패
      if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
        throw new Error(
          '❌ Google Cloud TTS 인증에 실패했습니다.\n\n' +
          '해결 방법:\n' +
          '1. .env.local 파일의 GOOGLE_APPLICATION_CREDENTIALS 확인\n' +
          '2. google-service-account.json 파일 존재 확인\n' +
          '3. JSON 키 파일 내용이 올바른지 확인\n' +
          '4. 개발 서버 재시작\n\n' +
          '📖 자세한 설정 방법: docs/GOOGLE_CLOUD_SETUP.md'
        );
      }

      // Quota 초과
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error(
          '❌ Google Cloud TTS API 할당량을 초과했습니다.\n\n' +
          '해결 방법:\n' +
          '1. https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas 에서 할당량 확인\n' +
          '2. 무료 할당량: 월 100만 자 (WaveNet/Neural2)\n' +
          '3. 할당량 증가 요청 또는 다음 달까지 대기\n\n' +
          '현재 사용량: https://console.cloud.google.com/billing/reports'
        );
      }

      // 기타 에러
      throw new Error(
        `Google Cloud TTS API 에러: ${error.message}\n\n` +
        '📖 문제 해결 가이드: docs/GOOGLE_CLOUD_SETUP.md#9-문제-해결'
      );
    }

    throw error;
  }
}

/**
 * Google Cloud TTS 비용 예측
 *
 * WaveNet 요금 기준 (2026-01):
 * - WaveNet: $16.00 per 1M characters
 * - Neural2: $16.00 per 1M characters
 * - Standard: $4.00 per 1M characters
 *
 * @param characterCount - 문자 수
 * @returns 예상 비용 (USD)
 */
export function estimateTTSCost(characterCount: number): number {
  const costPerMillionChars = env.GOOGLE_TTS_VOICE_TYPE === 'Standard' ? 4.0 : 16.0;
  return (characterCount / 1_000_000) * costPerMillionChars;
}

/**
 * Google Cloud TTS 음성 목록
 *
 * 주요 영어 음성 목록입니다. 전체 목록은 다음 링크에서 확인하세요:
 * https://cloud.google.com/text-to-speech/docs/voices
 */
export const GOOGLE_TTS_VOICES = {
  // Neural2 (최고 품질)
  NEURAL2_A: 'en-US-Neural2-A', // Male
  NEURAL2_C: 'en-US-Neural2-C', // Female
  NEURAL2_D: 'en-US-Neural2-D', // Male
  NEURAL2_E: 'en-US-Neural2-E', // Female
  NEURAL2_F: 'en-US-Neural2-F', // Female
  NEURAL2_G: 'en-US-Neural2-G', // Female
  NEURAL2_H: 'en-US-Neural2-H', // Female
  NEURAL2_I: 'en-US-Neural2-I', // Male
  NEURAL2_J: 'en-US-Neural2-J', // Male (추천)

  // WaveNet (고품질)
  WAVENET_A: 'en-US-Wavenet-A', // Male
  WAVENET_B: 'en-US-Wavenet-B', // Male
  WAVENET_C: 'en-US-Wavenet-C', // Female
  WAVENET_D: 'en-US-Wavenet-D', // Male
  WAVENET_E: 'en-US-Wavenet-E', // Female
  WAVENET_F: 'en-US-Wavenet-F', // Female
} as const;
