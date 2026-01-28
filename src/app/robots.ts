import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo-config';

/**
 * robots.txt 설정
 *
 * 검색 엔진 크롤러가 사이트를 크롤링하는 방법을 제어합니다.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${seoConfig.url}/sitemap.xml`,
  };
}
