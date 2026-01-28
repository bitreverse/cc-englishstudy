/**
 * Web Speech API 유틸리티 함수
 *
 * 브라우저의 Web Speech API를 활용하여 텍스트 음성 변환(TTS) 기능을 제공합니다.
 * 브라우저 호환성을 체크하고, 안전하게 음성 재생을 처리합니다.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
 */

/**
 * Web Speech API 지원 여부 확인
 *
 * @returns 브라우저가 Web Speech API를 지원하면 true, 아니면 false
 *
 * @example
 * ```typescript
 * if (isSpeechSupported()) {
 *   speak('Hello, world!');
 * } else {
 *   console.log('TTS not supported');
 * }
 * ```
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * 텍스트를 음성으로 변환하여 재생
 *
 * @param text - 재생할 텍스트
 * @param rate - 재생 속도 (0.1 ~ 10, 기본값 1)
 * @returns Promise (재생 완료 시 resolve, 에러 시 reject)
 *
 * @example
 * ```typescript
 * try {
 *   await speak('Hello, world!', 1.5);
 *   console.log('재생 완료');
 * } catch (error) {
 *   console.error('재생 실패:', error);
 * }
 * ```
 */
export function speak(text: string, rate: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech not supported'));
      return;
    }

    // 이전 재생 중단
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = 'en-US';

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    speechSynthesis.speak(utterance);
  });
}

/**
 * 현재 재생 중인 음성 중단
 *
 * @example
 * ```typescript
 * stopSpeaking();
 * ```
 */
export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    speechSynthesis.cancel();
  }
}

/**
 * 음성 재생 중 여부 확인
 *
 * @returns 재생 중이면 true, 아니면 false
 *
 * @example
 * ```typescript
 * if (isSpeaking()) {
 *   console.log('재생 중');
 * }
 * ```
 */
export function isSpeaking(): boolean {
  return isSpeechSupported() && speechSynthesis.speaking;
}
