/**
 * TTS 오디오 캐시 시스템 (서버 측)
 *
 * 파일시스템 기반 영구 캐시와 메모리 캐시를 조합하여
 * Google Cloud TTS API 호출을 최소화합니다.
 *
 * 캐시 키: word + ipa + phoneme (IPA 기반 완벽한 heteronym 구분)
 * 저장 형식: MP3 파일
 *
 * @module tts-cache
 */

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 캐시 로직 버전
 *
 * TTS 입력 로직이 변경되면 이 버전을 올려서
 * 이전에 잘못 생성된 캐시를 자동으로 무효화합니다.
 *
 * v1: context(예문)를 TTS 입력으로 사용 (잘못된 동작)
 * v2: 캐리어 문장만 사용 ("The word.", "To word.")
 * v3: Google Cloud TTS + SSML <phoneme> 태그 + IPA 기반 캐시
 *
 * 주의: tts-client.ts의 CACHE_VERSION과 동일한 값을 유지해야 합니다.
 */
const CACHE_VERSION = 3;

/**
 * TTS 캐시 디렉토리 경로
 *
 * 프로젝트 루트의 .tts-cache 디렉토리에 MP3 파일 저장
 */
const CACHE_DIR = path.join(process.cwd(), '.tts-cache');

/**
 * 메모리 캐시 (Buffer 저장)
 *
 * 자주 요청되는 오디오를 메모리에 유지하여 디스크 I/O를 줄입니다.
 * 최대 100개 항목, LRU 방식으로 관리합니다.
 */
const memoryCache = new Map<string, { buffer: Buffer; lastAccess: number }>();

/**
 * 메모리 캐시 최대 항목 수
 */
const MAX_MEMORY_ENTRIES = 100;

/**
 * 신고된 캐시 항목 추적 (재생성 필요)
 */
const reportedItems = new Set<string>();

/**
 * 캐시 키 생성 (v3: IPA 기반)
 *
 * 단어와 IPA 발음 기호를 조합하여 고유한 캐시 키를 생성합니다.
 * Heteronym의 경우 동일 단어라도 IPA에 따라 다른 캐시를 사용합니다.
 *
 * @param word - 단어
 * @param ipa - IPA 발음 기호 (필수, heteronym 완벽 구분)
 * @param phoneme - 개별 음소 (선택, Phonics별 발음용)
 * @returns 해시된 캐시 키
 */
function generateCacheKey(
  word: string,
  ipa: string,
  phoneme?: string
): string {
  const parts = [`v${CACHE_VERSION}`, word.toLowerCase().trim(), ipa.trim()];
  if (phoneme) parts.push(`phoneme:${phoneme}`);
  const raw = parts.join(':');
  return createHash('md5').update(raw).digest('hex');
}

/**
 * 캐시 파일 경로 생성
 *
 * @param key - 캐시 키
 * @returns MP3 파일의 절대 경로
 */
function getCacheFilePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.mp3`);
}

/**
 * 캐시 디렉토리 초기화
 *
 * 캐시 디렉토리가 없으면 생성합니다.
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * 메모리 캐시 정리 (LRU 방식)
 *
 * 캐시 항목이 최대치를 초과하면 가장 오래된 항목을 제거합니다.
 */
function pruneMemoryCache(): void {
  if (memoryCache.size <= MAX_MEMORY_ENTRIES) return;

  // lastAccess 기준 정렬 후 오래된 항목 제거
  const entries = Array.from(memoryCache.entries())
    .sort((a, b) => a[1].lastAccess - b[1].lastAccess);

  const toRemove = entries.slice(0, memoryCache.size - MAX_MEMORY_ENTRIES);
  for (const [key] of toRemove) {
    memoryCache.delete(key);
  }
}

/**
 * TTS 캐시 관리 클래스
 *
 * 서버 측에서 TTS 오디오를 캐싱하는 기능을 제공합니다.
 * 파일시스템 캐시(영구)와 메모리 캐시(빠른 접근)를 조합합니다.
 */
export class TTSCache {
  /**
   * 캐시에서 오디오 데이터 조회 (v3: IPA 기반)
   *
   * 메모리 캐시 -> 파일시스템 캐시 순으로 조회합니다.
   *
   * @param word - 단어
   * @param ipa - IPA 발음 기호 (필수)
   * @param phoneme - 개별 음소 (선택)
   * @returns 캐시된 MP3 Buffer, 없으면 null
   */
  static async get(
    word: string,
    ipa: string,
    phoneme?: string
  ): Promise<Buffer | null> {
    const key = generateCacheKey(word, ipa, phoneme);

    // 신고된 항목은 캐시에서 제외
    if (reportedItems.has(key)) {
      return null;
    }

    // 1. 메모리 캐시 확인
    const memEntry = memoryCache.get(key);
    if (memEntry) {
      memEntry.lastAccess = Date.now();
      return memEntry.buffer;
    }

    // 2. 파일시스템 캐시 확인
    try {
      const filePath = getCacheFilePath(key);
      const buffer = await fs.readFile(filePath);

      // 메모리 캐시에도 저장
      memoryCache.set(key, { buffer, lastAccess: Date.now() });
      pruneMemoryCache();

      return buffer;
    } catch {
      return null;
    }
  }

  /**
   * 캐시에 오디오 데이터 저장 (v3: IPA 기반)
   *
   * 파일시스템과 메모리 캐시 모두에 저장합니다.
   *
   * @param word - 단어
   * @param buffer - MP3 오디오 데이터
   * @param ipa - IPA 발음 기호 (필수)
   * @param phoneme - 개별 음소 (선택)
   */
  static async set(
    word: string,
    buffer: Buffer,
    ipa: string,
    phoneme?: string
  ): Promise<void> {
    const key = generateCacheKey(word, ipa, phoneme);

    // 신고 상태 해제 (재생성 완료)
    reportedItems.delete(key);

    // 파일시스템에 저장
    await ensureCacheDir();
    const filePath = getCacheFilePath(key);
    await fs.writeFile(filePath, buffer);

    // 메모리 캐시에 저장
    memoryCache.set(key, { buffer, lastAccess: Date.now() });
    pruneMemoryCache();
  }

  /**
   * 캐시 항목 신고 (발음 품질 문제)
   *
   * 신고된 항목은 다음 요청 시 캐시를 무시하고 재생성합니다.
   *
   * @param word - 단어
   * @param ipa - IPA 발음 기호 (필수)
   * @param phoneme - 개별 음소 (선택)
   */
  static report(
    word: string,
    ipa: string,
    phoneme?: string
  ): void {
    const key = generateCacheKey(word, ipa, phoneme);
    reportedItems.add(key);

    // 메모리 캐시에서도 제거
    memoryCache.delete(key);
  }

  /**
   * 캐시 항목 삭제
   *
   * 파일시스템과 메모리 캐시 모두에서 제거합니다.
   *
   * @param word - 단어
   * @param ipa - IPA 발음 기호 (필수)
   * @param phoneme - 개별 음소 (선택)
   */
  static async delete(
    word: string,
    ipa: string,
    phoneme?: string
  ): Promise<void> {
    const key = generateCacheKey(word, ipa, phoneme);

    // 메모리 캐시 삭제
    memoryCache.delete(key);

    // 파일시스템 캐시 삭제
    try {
      const filePath = getCacheFilePath(key);
      await fs.unlink(filePath);
    } catch {
      // 파일이 없으면 무시
    }
  }

  /**
   * 캐시 통계 조회
   *
   * @returns 메모리 캐시 크기, 신고된 항목 수
   */
  static getStats(): { memoryCacheSize: number; reportedCount: number } {
    return {
      memoryCacheSize: memoryCache.size,
      reportedCount: reportedItems.size,
    };
  }
}
