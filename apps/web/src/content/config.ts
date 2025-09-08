import { defineCollection, z } from 'astro:content'
import { categories } from '@/types/blog'

/**
 * 블로그 컬렉션 스키마 정의
 * 기술 문서, 뉴스, 소개글 카테고리를 지원합니다.
 */
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(), // 제목
    description: z.string(), // 요약 설명
    pubDate: z.date(), // 발행일
    updatedDate: z.date().optional(), // 수정일 (선택)
    category: z.enum(categories), // 카테고리
    tags: z.array(z.string()), // 태그 배열
    author: z.string().default('TTSG'), // 작성자
    draft: z.boolean().default(false), // 임시저장 여부
    featured: z.boolean().default(false), // 추천 포스트 여부
    heroImage: z.string().optional(), // 대표 이미지 (선택)
  }),
})

export const collections = {
  blog: blogCollection,
}
