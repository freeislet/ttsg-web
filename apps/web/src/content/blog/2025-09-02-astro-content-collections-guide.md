---
title: 'Astro Content Collections로 블로그 만들기'
description: 'Astro Content Collections를 활용하여 타입 안전한 블로그를 구축하는 방법을 단계별로 알아보세요.'
pubDate: 2025-09-02
category: 'dev'
tags: ['astro', 'typescript', 'blog', 'content-collections']
author: 'TTSG'
draft: false
featured: false
heroImage: '/assets/images/blog/astro-logo-dark.svg'
---

# Astro Content Collections로 블로그 만들기

Astro Content Collections는 마크다운 기반 콘텐츠를 타입 안전하게 관리할 수 있는 강력한 기능입니다. 이 가이드에서는 실제 블로그를 구축하면서 Content Collections의 핵심 개념과 활용법을 알아보겠습니다.

## Content Collections란?

Content Collections는 Astro에서 제공하는 콘텐츠 관리 시스템으로, 다음과 같은 장점을 제공합니다:

- **타입 안전성**: TypeScript 스키마로 콘텐츠 구조 정의
- **자동 완성**: IDE에서 콘텐츠 속성 자동 완성 지원
- **유효성 검사**: 빌드 시 콘텐츠 유효성 자동 검증
- **성능 최적화**: 정적 생성으로 빠른 로딩 속도

## 프로젝트 구조 설정

먼저 기본적인 폴더 구조를 만들어보겠습니다:

```
src/
├── content/
│   ├── config.ts          # 스키마 정의
│   └── blog/
│       ├── post-1.md
│       ├── post-2.md
│       └── ...
└── pages/
    └── blog/
        ├── index.astro    # 블로그 목록
        └── [slug].astro   # 개별 포스트
```

## 스키마 정의하기

`src/content/config.ts` 파일에서 블로그 포스트의 구조를 정의합니다:

```typescript
import { defineCollection, z } from 'astro:content'

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    category: z.enum(['news', 'tech', 'misc']),
    tags: z.array(z.string()),
    author: z.string().default('TTSG'),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
})

export const collections = {
  blog: blogCollection,
}
```

## 마크다운 파일 작성

이제 실제 블로그 포스트를 작성해보겠습니다:

```markdown
---
title: '첫 번째 포스트'
description: 'Astro로 만든 첫 번째 블로그 포스트입니다.'
pubDate: 2024-08-30
category: 'tech'
tags: ['astro', 'blog']
featured: true
---

# 첫 번째 포스트

여기에 포스트 내용을 작성합니다.
```

## 페이지에서 콘텐츠 사용하기

### 블로그 목록 페이지

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content'

const allPosts = await getCollection('blog')
const publishedPosts = allPosts.filter((post) => !post.data.draft)
---

<html>
  <body>
    <h1>블로그</h1>
    {
      publishedPosts.map((post) => (
        <article>
          <h2>
            <a href={`/blog/${post.slug}`}>{post.data.title}</a>
          </h2>
          <p>{post.data.description}</p>
          <time>{post.data.pubDate.toLocaleDateString('ko-KR')}</time>
        </article>
      ))
    }
  </body>
</html>
```

### 개별 포스트 페이지

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const blogPosts = await getCollection('blog')
  return blogPosts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

const { post } = Astro.props
const { Content } = await post.render()
---

<html>
  <body>
    <article>
      <h1>{post.data.title}</h1>
      <time>{post.data.pubDate.toLocaleDateString('ko-KR')}</time>
      <Content />
    </article>
  </body>
</html>
```

## 고급 기능 활용하기

### 카테고리별 필터링

```typescript
// 특정 카테고리 포스트만 가져오기
const techPosts = await getCollection('blog', ({ data }) => {
  return data.category === 'tech' && !data.draft
})
```

### 태그 기반 관련 포스트

```typescript
// 현재 포스트와 같은 태그를 가진 포스트 찾기
const relatedPosts = allPosts.filter(
  (p) =>
    p.slug !== currentPost.slug && p.data.tags.some((tag) => currentPost.data.tags.includes(tag))
)
```

### 정렬 및 페이지네이션

```typescript
// 발행일 기준 정렬
const sortedPosts = publishedPosts.sort(
  (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
)

// 페이지네이션
const postsPerPage = 10
const currentPage = 1
const paginatedPosts = sortedPosts.slice(
  (currentPage - 1) * postsPerPage,
  currentPage * postsPerPage
)
```

## 성능 최적화 팁

### 1. 이미지 최적화

```astro
---
import { Image } from 'astro:assets'
---

{
  post.data.heroImage && (
    <Image src={post.data.heroImage} alt={post.data.title} width={800} height={400} format="webp" />
  )
}
```

### 2. 메타데이터 최적화

```astro
<head>
  <title>{post.data.title} | TTSG Blog</title>
  <meta name="description" content={post.data.description} />
  <meta property="og:title" content={post.data.title} />
  <meta property="og:description" content={post.data.description} />
  {post.data.heroImage && <meta property="og:image" content={post.data.heroImage} />}
</head>
```

### 3. RSS 피드 생성

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET() {
  const posts = await getCollection('blog')

  return rss({
    title: 'TTSG Blog',
    description: 'TTSG의 기술 블로그',
    site: 'https://ttsg.example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  })
}
```

## 마무리

Astro Content Collections를 활용하면 타입 안전하고 성능이 뛰어난 블로그를 쉽게 구축할 수 있습니다. 특히 다음과 같은 장점들이 있습니다:

- **개발 경험 향상**: TypeScript 지원으로 안전한 개발
- **성능 최적화**: 정적 생성으로 빠른 로딩
- **유지보수성**: 구조화된 콘텐츠 관리
- **확장성**: 다양한 콘텐츠 타입 지원

더 자세한 정보는 [Astro 공식 문서](https://docs.astro.build/en/guides/content-collections/)를 참고하세요.
