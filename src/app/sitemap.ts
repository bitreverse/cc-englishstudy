import type { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo-config';

/**
 * sitemap.xml 설정
 *
 * 검색 엔진에 사이트 구조를 알려줍니다.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: seoConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
