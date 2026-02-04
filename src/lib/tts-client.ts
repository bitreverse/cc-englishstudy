/**
 * 클라이언트 측 TTS 서비스
 *
 * IndexedDB 캐시와 API 호출을 통합하여
 * 브라우저에서 효율적인 발음 재생을 제공합니다.
 *
 * 캐시 계층:
 * 1. IndexedDB (영구 저장, 브라우저 종료 후에도 유지)
 * 2. 서버 API (OpenAI TTS → 파일시스템 캐시)
 *
 * @module tts-client
 */

/**
 * TTS 요청 파라미터
 */
export interface TTSRequestParams {
  /** 발음할 단어 */
  word: string;
  /** 품사 (heteronym 구분용) */
  partOfSpeech?: string;
  /** IPA 발음 기호 */
  ipa?: string;
  /** 개별 음소 (Phonics별 발음) */
  phoneme?: string;
  /** 캐시 무시 (재생성 시) */
  skipCache?: boolean;
}

/**
 * IndexedDB 데이터베이스 이름 및 버전
 */
const DB_NAME = 'tts-audio-cache';
const DB_VERSION = 2; // v2: 캐시 키에 CACHE_VERSION 포함
const STORE_NAME = 'audio';

/**
 * 캐시 로직 버전
 *
 * TTS 입력 로직이 변경되면 이 버전을 올려서
 * 이전에 잘못 생성된 캐시를 자동으로 무효화합니다.
 *
 * v1: context(예문)를 TTS 입력으로 사용 (잘못된 동작)
 * v2: 캐리어 문장만 사용 ("The word.", "To word.")
 */
const CACHE_VERSION = 2;

/**
 * 캐시 만료 시간: 30일
 */
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

/**
 * IndexedDB 캐시 항목 타입
 */
interface CacheEntry {
  /** 캐시 키 */
  key: string;
  /** 오디오 데이터 (ArrayBuffer) */
  data: ArrayBuffer;
  /** 저장 시간 (timestamp) */
  timestamp: number;
}

/**
 * IndexedDB 데이터베이스 열기
 *
 * @returns IndexedDB 데이터베이스 인스턴스
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // v1 -> v2 업그레이드: 기존 캐시를 모두 삭제 (잘못된 예문 오디오 제거)
      if (oldVersion < 2 && db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
        console.info(
          '[TTS Cache] 캐시 DB 업그레이드: v1 -> v2 (이전 캐시 전체 삭제)'
        );
      }

      // 스토어가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 캐시 키 생성
 *
 * 버전 정보를 포함하여 TTS 입력 로직 변경 시
 * 이전 캐시가 자동으로 무효화됩니다.
 *
 * @param params - TTS 요청 파라미터
 * @returns 캐시 키 문자열 (예: "v2:record:noun")
 */
function generateCacheKey(params: TTSRequestParams): string {
  const parts = [`v${CACHE_VERSION}`, params.word.toLowerCase().trim()];
  if (params.partOfSpeech) parts.push(params.partOfSpeech.toLowerCase());
  if (params.phoneme) parts.push(`phoneme:${params.phoneme}`);
  return parts.join(':');
}

/**
 * IndexedDB에서 캐시된 오디오 조회
 *
 * @param key - 캐시 키
 * @returns 캐시된 ArrayBuffer, 없거나 만료되면 null
 */
async function getFromCache(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // TTL 확인
        if (Date.now() - entry.timestamp > CACHE_TTL) {
          // 만료된 항목 삭제
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    // IndexedDB 미지원 또는 에러
    return null;
  }
}

/**
 * IndexedDB에 오디오 캐시 저장
 *
 * @param key - 캐시 키
 * @param data - 오디오 ArrayBuffer
 */
async function saveToCache(key: string, data: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
    };

    store.put(entry);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB 에러 무시 (캐시 실패해도 재생은 가능)
    console.warn('[TTS Client] 캐시 저장 실패');
  }
}

/**
 * IndexedDB에서 특정 캐시 삭제
 *
 * @param key - 캐시 키
 */
async function removeFromCache(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
  } catch {
    // 에러 무시
  }
}

/**
 * 현재 재생 중인 Audio 인스턴스
 *
 * 동시에 하나의 오디오만 재생하도록 관리합니다.
 */
let currentAudio: HTMLAudioElement | null = null;

/**
 * TTS 오디오 가져오기 (캐시 우선)
 *
 * 1. IndexedDB 캐시 확인
 * 2. 서버 API 호출
 * 3. 결과를 캐시에 저장
 *
 * @param params - TTS 요청 파라미터
 * @returns 오디오 ArrayBuffer
 * @throws 오디오 생성 실패 시
 */
export async function fetchTTSAudio(
  params: TTSRequestParams
): Promise<ArrayBuffer> {
  const cacheKey = generateCacheKey(params);

  // 1. IndexedDB 캐시 확인 (skipCache가 아닌 경우)
  if (!params.skipCache) {
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // 2. 서버 API 호출
  // API 스키마에 맞게 필요한 필드만 전달 (word, ipa, phoneme, skipCache)
  // partOfSpeech는 클라이언트 측 캐시 키 생성용으로만 사용
  const apiPayload: {
    word: string;
    ipa?: string;
    phoneme?: string;
    skipCache?: boolean;
  } = {
    word: params.word,
  };

  if (params.ipa) apiPayload.ipa = params.ipa;
  if (params.phoneme) apiPayload.phoneme = params.phoneme;
  if (params.skipCache) apiPayload.skipCache = params.skipCache;

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error || `TTS API 오류 (${response.status})`
    );
  }

  // 3. ArrayBuffer로 변환
  const audioData = await response.arrayBuffer();

  // 4. 캐시에 저장
  await saveToCache(cacheKey, audioData);

  return audioData;
}

/**
 * TTS 오디오 재생
 *
 * ArrayBuffer를 Blob URL로 변환하여 재생합니다.
 * 이전에 재생 중인 오디오가 있으면 중지합니다.
 *
 * @param audioData - MP3 오디오 ArrayBuffer
 * @param speed - 재생 속도 (기본값 1)
 * @returns Promise (재생 완료 시 resolve)
 */
export function playAudioBuffer(
  audioData: ArrayBuffer,
  speed: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이전 재생 중지
    stopCurrentAudio();

    // Blob URL 생성
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    // Audio 인스턴스 생성 및 재생
    const audio = new Audio(url);
    audio.playbackRate = speed;
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      reject(new Error('오디오 재생에 실패했습니다.'));
    };

    audio.play().catch((err) => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      reject(err);
    });
  });
}

/**
 * 현재 재생 중인 오디오 중지
 */
export function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    // src가 Blob URL인 경우 해제
    if (currentAudio.src.startsWith('blob:')) {
      URL.revokeObjectURL(currentAudio.src);
    }
    currentAudio = null;
  }
}

/**
 * 현재 재생 중인지 확인
 *
 * @returns 재생 중이면 true
 */
export function isAudioPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/**
 * 발음 품질 신고
 *
 * 서버에 신고를 보내고 클라이언트 캐시도 삭제합니다.
 *
 * @param params - 신고 대상 정보
 * @returns 성공 여부
 */
export async function reportPronunciation(
  params: Pick<TTSRequestParams, 'word' | 'partOfSpeech' | 'phoneme'>
): Promise<boolean> {
  try {
    // 클라이언트 캐시 삭제
    const cacheKey = generateCacheKey(params as TTSRequestParams);
    await removeFromCache(cacheKey);

    // 서버에 신고
    const response = await fetch('/api/tts/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return response.ok;
  } catch {
    console.error('[TTS Client] 신고 실패');
    return false;
  }
}

/**
 * 만료된 캐시 정리
 *
 * IndexedDB에서 TTL이 지난 항목을 삭제합니다.
 * 앱 초기화 시 호출하면 좋습니다.
 */
export async function pruneExpiredCache(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const cutoff = Date.now() - CACHE_TTL;

    let deletedCount = 0;

    return new Promise((resolve) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => resolve(deletedCount);
    });
  } catch {
    return 0;
  }
}

/**
 * 구버전 캐시 항목 정리
 *
 * 현재 CACHE_VERSION과 일치하지 않는 키를 가진
 * 캐시 항목을 모두 삭제합니다.
 *
 * IndexedDB DB_VERSION 업그레이드 시 자동으로 처리되지만,
 * 수동으로도 호출할 수 있습니다.
 *
 * @returns 삭제된 항목 수
 */
export async function purgeOldVersionCache(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    let deletedCount = 0;
    const currentPrefix = `v${CACHE_VERSION}:`;

    return new Promise((resolve) => {
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const key = cursor.key as string;
          // 현재 버전 접두사로 시작하지 않는 항목은 삭제
          if (!key.startsWith(currentPrefix)) {
            cursor.delete();
            deletedCount++;
            console.info(
              `[TTS Cache] 구버전 캐시 삭제: ${key}`
            );
          }
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.info(
              `[TTS Cache] 구버전 캐시 ${deletedCount}개 삭제 완료`
            );
          }
          resolve(deletedCount);
        }
      };

      request.onerror = () => resolve(deletedCount);
    });
  } catch {
    return 0;
  }
}
