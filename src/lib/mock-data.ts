import type { DictionaryResponse, RecentSearch, WordData } from '@/types';

/**
 * 더미 사전 데이터
 *
 * Free Dictionary API 응답 형식과 일치하는 더미 데이터입니다.
 * Phase 3에서 실제 API 호출로 교체될 예정입니다.
 */
export const MOCK_DICTIONARY_DATA: Record<string, DictionaryResponse[]> = {
  hello: [
    {
      word: 'hello',
      phonetic: '/həˈloʊ/',
      phonetics: [
        {
          text: '/həˈloʊ/',
          audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
        },
      ],
      meanings: [
        {
          partOfSpeech: 'noun',
          definitions: [
            {
              definition:
                'A greeting (salutation) said when meeting someone or acknowledging someone\'s arrival or presence.',
              example: 'She gave me a cheerful hello.',
              synonyms: ['greeting', 'hi', 'salutation'],
              antonyms: ['goodbye', 'farewell'],
            },
          ],
        },
        {
          partOfSpeech: 'verb',
          definitions: [
            {
              definition: 'To greet with "hello".',
              example: 'I helloed my friend from across the street.',
              synonyms: ['greet', 'welcome'],
              antonyms: [],
            },
          ],
        },
        {
          partOfSpeech: 'interjection',
          definitions: [
            {
              definition: 'Used to greet someone, answer the telephone, or express surprise.',
              example: 'Hello! How are you today?',
              synonyms: ['hi', 'hey'],
              antonyms: ['bye', 'goodbye'],
            },
          ],
        },
      ],
    },
  ],
  world: [
    {
      word: 'world',
      phonetic: '/wɜːld/',
      phonetics: [
        {
          text: '/wɜːld/',
          audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/world-us.mp3',
        },
      ],
      meanings: [
        {
          partOfSpeech: 'noun',
          definitions: [
            {
              definition: 'The earth, together with all of its countries and peoples.',
              example: 'People from all over the world attended the conference.',
              synonyms: ['earth', 'globe', 'planet'],
              antonyms: [],
            },
            {
              definition: 'All of the people, societies, and institutions on the earth.',
              example: 'The whole world is watching.',
              synonyms: ['humanity', 'mankind', 'humankind'],
              antonyms: [],
            },
            {
              definition: 'A particular region or group of countries.',
              example: 'The Western world has different values.',
              synonyms: ['region', 'area', 'realm'],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ],
  example: [
    {
      word: 'example',
      phonetic: '/ɪɡˈzæmpəl/',
      phonetics: [
        {
          text: '/ɪɡˈzæmpəl/',
          audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/example-us.mp3',
        },
      ],
      meanings: [
        {
          partOfSpeech: 'noun',
          definitions: [
            {
              definition:
                'A thing characteristic of its kind or illustrating a general rule.',
              example: 'This is a good example of Gothic architecture.',
              synonyms: ['specimen', 'sample', 'instance'],
              antonyms: [],
            },
            {
              definition:
                'A person or thing regarded in terms of their fitness to be imitated or the likelihood of their being imitated.',
              example: 'She followed her mother\'s example and became a teacher.',
              synonyms: ['model', 'pattern', 'precedent'],
              antonyms: ['warning', 'counterexample'],
            },
          ],
        },
        {
          partOfSpeech: 'verb',
          definitions: [
            {
              definition: 'Be illustrated or exemplified.',
              example: 'The problem is exampled by the case study.',
              synonyms: ['illustrate', 'demonstrate', 'exemplify'],
              antonyms: [],
            },
          ],
        },
      ],
    },
  ],
  learn: [
    {
      word: 'learn',
      phonetic: '/lɜːn/',
      phonetics: [
        {
          text: '/lɜːn/',
          audio: '',
        },
      ],
      meanings: [
        {
          partOfSpeech: 'verb',
          definitions: [
            {
              definition: 'Gain or acquire knowledge of or skill in something by study, experience, or being taught.',
              example: 'They learn English as a second language.',
              synonyms: ['study', 'acquire', 'grasp'],
              antonyms: ['forget', 'unlearn'],
            },
            {
              definition: 'Become aware of something by information or from observation.',
              example: 'I learned that she had been married before.',
              synonyms: ['discover', 'find out', 'realize'],
              antonyms: [],
            },
            {
              definition: 'Commit to memory.',
              example: 'He learned the poem by heart.',
              synonyms: ['memorize', 'remember'],
              antonyms: ['forget'],
            },
          ],
        },
      ],
    },
  ],
  study: [
    {
      word: 'study',
      phonetic: '/ˈstʌdi/',
      phonetics: [
        {
          text: '/ˈstʌdi/',
        },
      ],
      meanings: [
        {
          partOfSpeech: 'noun',
          definitions: [
            {
              definition: 'The devotion of time and attention to gaining knowledge.',
              example: 'The study of English is very important.',
              synonyms: ['learning', 'education', 'scholarship'],
              antonyms: ['ignorance'],
            },
            {
              definition: 'A detailed investigation and analysis of a subject or situation.',
              example: 'A study of pollution in rivers.',
              synonyms: ['investigation', 'inquiry', 'research'],
              antonyms: [],
            },
          ],
        },
        {
          partOfSpeech: 'verb',
          definitions: [
            {
              definition: 'Devote time and attention to gaining knowledge of an academic subject.',
              example: 'I studied hard for the exam.',
              synonyms: ['learn', 'read', 'revise'],
              antonyms: ['ignore', 'neglect'],
            },
            {
              definition: 'Look at closely in order to observe or read.',
              example: 'She studied the map carefully.',
              synonyms: ['examine', 'inspect', 'scrutinize'],
              antonyms: ['ignore', 'overlook'],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * 더미 최근 검색 기록
 *
 * Phase 3에서 localStorage를 활용한 실제 검색 기록 관리로 교체될 예정입니다.
 */
export const MOCK_RECENT_SEARCHES: RecentSearch[] = [
  { word: 'hello', timestamp: Date.now() - 3600000 }, // 1시간 전
  { word: 'world', timestamp: Date.now() - 7200000 }, // 2시간 전
  { word: 'example', timestamp: Date.now() - 10800000 }, // 3시간 전
  { word: 'learn', timestamp: Date.now() - 14400000 }, // 4시간 전
  { word: 'study', timestamp: Date.now() - 18000000 }, // 5시간 전
];

/**
 * API 응답을 WordData로 변환
 *
 * DictionaryResponse 배열을 받아 첫 번째 요소를 WordData 형태로 변환합니다.
 * 페이지에서 사용하기 쉬운 형태로 단순화합니다.
 *
 * @param response - API 응답 (DictionaryResponse 배열)
 * @returns WordData 객체 또는 null (응답이 없는 경우)
 *
 * @example
 * ```typescript
 * const response = MOCK_DICTIONARY_DATA['hello'];
 * const wordData = convertToWordData(response);
 * console.log(wordData?.word); // 'hello'
 * ```
 */
export function convertToWordData(
  response: DictionaryResponse[]
): WordData | null {
  if (!response || response.length === 0) return null;

  const first = response[0];
  return {
    word: first.word,
    phonetic: first.phonetic,
    meanings: first.meanings,
  };
}
