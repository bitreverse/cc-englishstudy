import type { Phonetic } from '@/types';

/**
 * Heteronym 그룹 타입
 *
 * 동형이의어(heteronym)는 동일한 철자를 가지지만
 * 품사에 따라 발음이 다른 단어를 의미합니다.
 *
 * 예시:
 * - record: /ˈrɛkərd/ (noun) vs /rɪˈkɔrd/ (verb)
 * - permit: /ˈpɜrmɪt/ (noun) vs /pərˈmɪt/ (verb)
 * - present: /ˈprɛzənt/ (noun) vs /prɪˈzɛnt/ (verb)
 */
export interface HeteronymGroup {
  /** 품사 (noun, verb, adjective 등) */
  partOfSpeech: string;
  /** IPA 발음 기호 */
  pronunciation: string;
  /** 음성 파일 URL (선택적) */
  audio?: string;
}

/**
 * 잘 알려진 Heteronym 단어 목록
 *
 * Free Dictionary API가 품사별 발음을 제공하지 않으므로,
 * 일반적인 heteronym 목록을 관리합니다.
 */
export const KNOWN_HETERONYMS = new Set([
  'permit',
  'record',
  'present',
  'object',
  'subject',
  'project',
  'contract',
  'produce',
  'desert',
  'refuse',
  'content',
  'contest',
  'convict',
  'conduct',
  'conflict',
  'console',
  'excuse',
  'export',
  'import',
  'increase',
  'insult',
  'protest',
  'rebel',
  'reject',
  'suspect',
  'transport',
  'read', // read (present) vs read (past)
  'live', // live (verb) vs live (adjective)
  'bow', // bow (weapon) vs bow (gesture)
  'close', // close (verb) vs close (adjective)
]);

/**
 * 단어가 알려진 Heteronym인지 확인
 *
 * @param word - 확인할 단어
 * @returns heteronym이면 true
 *
 * @example
 * isKnownHeteronym('permit'); // true
 * isKnownHeteronym('cat'); // false
 */
export function isKnownHeteronym(word: string): boolean {
  return KNOWN_HETERONYMS.has(word.toLowerCase());
}

/**
 * Heteronyms 감지 함수
 *
 * Free Dictionary API의 phonetics 배열을 분석하거나,
 * 알려진 heteronym 목록을 기반으로 감지합니다.
 *
 * 알고리즘:
 * 1. 단어가 알려진 heteronym 목록에 있는지 확인
 * 2. phonetics 배열에서 text(IPA)가 존재하는 항목만 필터링
 * 3. 품사별로 발음을 그룹화
 * 4. 서로 다른 발음이 2개 이상이면 heteronym으로 판단
 *
 * @param word - 검색 단어
 * @param phonetics - Free Dictionary API의 phonetics 배열
 * @returns HeteronymGroup 배열 (빈 배열이면 heteronym 아님)
 *
 * @example
 * // "record" 검색 시
 * const phonetics = [
 *   { text: "/ˈrɛkərd/", partOfSpeech: "noun" },
 *   { text: "/rɪˈkɔrd/", partOfSpeech: "verb" }
 * ];
 * const groups = detectHeteronyms('record', phonetics);
 * // 결과: [
 * //   { partOfSpeech: "noun", pronunciation: "/ˈrɛkərd/" },
 * //   { partOfSpeech: "verb", pronunciation: "/rɪˈkɔrd/" }
 * // ]
 */
export function detectHeteronyms(word: string, phonetics: Phonetic[]): HeteronymGroup[] {
  // 1. 알려진 heteronym인지 확인
  const isKnown = isKnownHeteronym(word);

  // 2. IPA가 존재하는 항목만 필터링
  const validPhonetics = phonetics.filter((p) => p.text && p.text.trim() !== '');

  // 발음이 없거나 1개만 있으면
  // - 알려진 heteronym이면 AI가 판단하도록 빈 배열 대신 placeholder 반환
  // - 아니면 빈 배열 반환
  if (validPhonetics.length <= 1) {
    if (isKnown) {
      // AI 프롬프트에서 heteronym 처리하도록 시그널
      return [
        { partOfSpeech: 'noun', pronunciation: '' },
        { partOfSpeech: 'verb', pronunciation: '' },
      ];
    }
    return [];
  }

  // 3. 품사별 발음 맵 생성
  const pronunciationMap = new Map<string, { pronunciation: string; audio?: string }>();

  for (const phonetic of validPhonetics) {
    const pos = phonetic.partOfSpeech || 'unknown';
    const pronunciation = phonetic.text!.trim();

    // 동일 품사에 대해 첫 번째 발음만 저장
    if (!pronunciationMap.has(pos)) {
      pronunciationMap.set(pos, {
        pronunciation,
        audio: phonetic.audio && phonetic.audio.trim() !== '' ? phonetic.audio : undefined,
      });
    }
  }

  // 4. 서로 다른 발음이 2개 이상인지 확인
  const uniquePronunciations = new Set(
    Array.from(pronunciationMap.values()).map((v) => v.pronunciation)
  );

  // 발음이 모두 동일하면 heteronym 아님 (단, 알려진 heteronym이면 예외)
  if (uniquePronunciations.size <= 1 && !isKnown) {
    return [];
  }

  // 5. HeteronymGroup 배열 생성
  const groups: HeteronymGroup[] = Array.from(pronunciationMap.entries()).map(
    ([partOfSpeech, { pronunciation, audio }]) => ({
      partOfSpeech,
      pronunciation,
      audio,
    })
  );

  return groups;
}

/**
 * Heteronym 여부 판단 함수
 *
 * detectHeteronyms의 결과를 boolean으로 변환합니다.
 *
 * @param groups - HeteronymGroup 배열
 * @returns heteronym이면 true, 아니면 false
 *
 * @example
 * const groups = detectHeteronyms(phonetics);
 * if (isHeteronym(groups)) {
 *   console.log('This word is a heteronym!');
 * }
 */
export function isHeteronym(groups: HeteronymGroup[]): boolean {
  return groups.length >= 2;
}

/**
 * 특정 품사의 발음 가져오기
 *
 * HeteronymGroup 배열에서 특정 품사의 발음을 찾습니다.
 *
 * @param groups - HeteronymGroup 배열
 * @param partOfSpeech - 찾을 품사
 * @returns 해당 품사의 발음 (없으면 undefined)
 *
 * @example
 * const groups = detectHeteronyms(phonetics);
 * const nounPronunciation = getPronunciationByPartOfSpeech(groups, 'noun');
 * console.log(nounPronunciation); // "/ˈrɛkərd/"
 */
export function getPronunciationByPartOfSpeech(
  groups: HeteronymGroup[],
  partOfSpeech: string
): string | undefined {
  const group = groups.find(
    (g) => g.partOfSpeech.toLowerCase() === partOfSpeech.toLowerCase()
  );
  return group?.pronunciation;
}
