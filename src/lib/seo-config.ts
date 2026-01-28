/**
 * SEO 설정
 *
 * 애플리케이션의 SEO 메타데이터를 중앙에서 관리합니다.
 */

export const seoConfig = {
  title: {
    default: '영어 단어 학습 사전',
    template: '%s | 영어 단어 학습 사전',
  },
  description:
    '영어 단어를 검색하고 발음, 뜻, 예문을 확인하세요. Free Dictionary API 기반 무료 영어 학습 도구',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://english-dictionary.vercel.app',
  openGraph: {
    type: 'website' as const,
    locale: 'ko_KR',
    siteName: '영어 단어 학습 사전',
  },
  twitter: {
    card: 'summary' as const,
  },
} as const;
