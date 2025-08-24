# TTSG 위키 구현 가이드

이 문서는 TTSG 웹사이트의 위키 시스템 구현에 관한 상세 정보를 제공합니다.

## 1. 위키 시스템 개요

TTSG의 위키 시스템은 두 가지 방식으로 콘텐츠를 제공합니다:

1. **로컬 마크다운 파일**: 저장소에 직접 저장된 마크다운 콘텐츠
2. **Cloudflare R2 저장소**: 외부 저장소에서 동적으로 가져오는 마크다운 콘텐츠

이 하이브리드 접근 방식은 정적 콘텐츠와 동적으로 업데이트되는 콘텐츠를 모두 관리할 수 있게 해줍니다.

## 2. 파일 구조

```
apps/web/
├── src/
│   ├── content/
│   │   └── wiki/            # 로컬 위키 콘텐츠 (마크다운 파일)
│   │       └── astro-guide.md
│   │       └── ...
│   ├── pages/
│   │   └── wiki/
│   │       ├── index.astro   # 위키 목차 페이지
│   │       └── [slug].astro  # 동적 위키 콘텐츠 페이지
│   └── utils/
│       └── wiki.ts           # 위키 콘텐츠 가져오기 관련 유틸리티
└── ...
```

## 3. 위키 콘텐츠 가져오기

### 3.1 유틸리티 함수 (wiki.ts)

```typescript
export async function fetchWikiContent(slug: string): Promise<string | null> {
  try {
    // 1. 로컬 파일 시스템에서 먼저 확인
    try {
      // Astro의 content collections에서 콘텐츠 가져오기 시도
      const localContent = await import(`../content/wiki/${slug}.md`)
      return localContent.default
    } catch (localError) {
      console.log(`Local content for ${slug} not found, trying R2...`)
    }

    // 2. Cloudflare R2에서 가져오기 시도
    const r2Response = await fetch(`https://storage.example.com/wiki/${slug}.md`)

    if (!r2Response.ok) {
      throw new Error(`R2 fetch failed: ${r2Response.status}`)
    }

    return await r2Response.text()
  } catch (error) {
    console.error(`Failed to fetch wiki content for ${slug}:`, error)
    return null
  }
}
```

### 3.2 마크다운 렌더링

위키 콘텐츠 렌더링을 위해 `marked` 라이브러리를 사용합니다:

```typescript
import { marked } from 'marked'

// 마크다운을 HTML로 변환
const htmlContent = marked(markdownContent)
```

## 4. 위키 페이지 구현

### 4.1 동적 위키 페이지 ([slug].astro)

```astro
---
import Layout from '../../layouts/Layout.astro'
import { fetchWikiContent } from '../../utils/wiki'
import { marked } from 'marked'

export const prerender = false // SSR 활성화

const { slug } = Astro.params

if (!slug) {
  return Astro.redirect('/wiki')
}

// 위키 콘텐츠 가져오기
const content = await fetchWikiContent(slug)

if (!content) {
  return Astro.redirect('/wiki?error=not-found')
}

// 마크다운을 HTML로 변환
const htmlContent = marked(content)

// 제목 추출 (첫 번째 H1 태그)
const titleMatch = content.match(/^#\s+(.+)$/m)
const title = titleMatch ? titleMatch[1] : slug
---

<Layout title={`${title} | TTSG Wiki`}>
  <main class="container mx-auto p-4">
    <div class="prose prose-lg mx-auto">
      <article set:html={htmlContent} />
    </div>
  </main>
</Layout>
```

### 4.2 위키 인덱스 페이지 (index.astro)

```astro
---
import Layout from '../../layouts/Layout.astro'
import { getCollection } from 'astro:content'

// 로컬 위키 항목 가져오기
const localWikiEntries = await getCollection('wiki')

// R2 위키 목록도 가져올 수 있습니다 (구현 예시)
// const r2WikiEntries = await fetch('https://storage.example.com/wiki/index.json')
//   .then(res => res.json())
//   .catch(() => []);

// 모든 위키 항목 합치기
const allWikiEntries = [
  ...localWikiEntries.map((entry) => ({
    slug: entry.slug,
    title: entry.data.title,
    description: entry.data.description,
    source: 'local',
  })),
  // ...r2WikiEntries
]
---

<Layout title="TTSG Wiki">
  <main class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-8">TTSG 위키</h1>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {
        allWikiEntries.map((entry) => (
          <a href={`/wiki/${entry.slug}`} class="block">
            <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
              <h2 class="text-xl font-semibold">{entry.title}</h2>
              <p class="text-gray-600 mt-2">{entry.description}</p>
              <span class="text-sm text-blue-500 mt-3 inline-block">자세히 보기 →</span>
            </div>
          </a>
        ))
      }
    </div>
  </main>
</Layout>
```

## 5. 콘텐츠 컬렉션 설정

### 5.1 콘텐츠 설정 파일 (src/content/config.ts)

```typescript
import { defineCollection, z } from 'astro:content'

const wikiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = {
  wiki: wikiCollection,
}
```

## 6. 샘플 위키 콘텐츠

### 6.1 astro-guide.md 예시

````markdown
# Astro 프레임워크 가이드

Astro는 콘텐츠 중심 웹사이트를 위한 최신 웹 프레임워크입니다.

## 주요 특징

- **아일랜드 아키텍처**: 필요한 JavaScript만 전송
- **다양한 UI 프레임워크 지원**: React, Vue, Svelte 등
- **빠른 성능**: 최소한의 JavaScript와 최대한의 정적 HTML
- **콘텐츠 중심**: 마크다운, MDX 등 콘텐츠 처리에 최적화

## 시작하기

```bash
# 새 프로젝트 생성
npm create astro@latest
```
````

## SSR과 정적 사이트 생성

Astro는 기본적으로 정적 사이트 생성(SSG)를 지원하며, 필요에 따라 서버 사이드 렌더링(SSR)도 지원합니다.

### SSR 활성화

```js
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
})
```

## 마무리

Astro는 콘텐츠 중심 사이트에 이상적인 프레임워크이며, 성능과 개발자 경험 사이의 균형을 잘 맞춥니다.

```

## 7. 확장 및 개선 가능성

1. **검색 기능**: 위키 콘텐츠 전체 텍스트 검색 구현
2. **태그 시스템**: 관련 위키 페이지를 쉽게 찾을 수 있는 태그 시스템
3. **편집 기능**: 인증된 사용자가 위키를 편집할 수 있는 기능
4. **버전 관리**: 위키 콘텐츠의 변경 내역 추적
5. **댓글/토론**: 위키 콘텐츠에 대한 의견 교환 기능
```
