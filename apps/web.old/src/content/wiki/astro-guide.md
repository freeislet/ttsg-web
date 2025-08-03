---
title: Astro 가이드
description: Astro 프레임워크 사용법 및 팁
updatedDate: 2025-07-27
---

# Astro 프레임워크 가이드

## 소개

[Astro](https://astro.build)는 콘텐츠 중심의 웹사이트를 구축하기 위한 현대적인 웹 프레임워크입니다. 특히 블로그, 마케팅 사이트, 포트폴리오 등 콘텐츠가 중심인 웹사이트에 적합합니다.

## 주요 특징

### 1. Islands Architecture

Astro는 "Islands Architecture"를 채택하여 필요한 JavaScript만 클라이언트에 전송합니다. 이는 웹사이트 성능 향상에 큰 도움이 됩니다.

```astro
---
// 서버 사이드에서만 실행되는 코드 (클라이언트에 전송되지 않음)
import { getLatestPosts } from '../utils/posts'
const posts = await getLatestPosts()
---

<!-- 정적 HTML -->
<h1>최신 블로그 포스트</h1>
<ul>
  {posts.map((post) => <li>{post.title}</li>)}
</ul>

<!-- 필요한 경우에만 JavaScript 사용 -->
<script>
  // 이 스크립트는 클라이언트에서 실행됩니다
  console.log('클라이언트 사이드 코드')
</script>
```

### 2. 다양한 UI 프레임워크 통합

Astro는 React, Vue, Svelte 등 다양한 UI 프레임워크를 동일한 페이지 내에서 사용할 수 있게 해줍니다.

```astro
---
import ReactComponent from '../components/ReactComponent.jsx'
import VueComponent from '../components/VueComponent.vue'
import SvelteComponent from '../components/SvelteComponent.svelte'
---

<div>
  <ReactComponent />
  <VueComponent />
  <SvelteComponent />
</div>
```

### 3. 콘텐츠 중심 기능

Astro는 Markdown, MDX 등의 콘텐츠 형식을 기본적으로 지원하며, Content Collections API를 통해 콘텐츠 관리가 용이합니다.

## 설치 및 시작하기

새 프로젝트 생성:

```bash
# npm으로 생성
npm create astro@latest

# pnpm으로 생성
pnpm create astro@latest
```

개발 서버 실행:

```bash
npm run dev
# 또는
pnpm dev
```

## TTSG 프로젝트에서의 활용

TTSG 프로젝트에서는 Astro를 메인 프레임워크로 사용하여 다음과 같은 기능을 구현했습니다:

1. 위키 문서 관리 (Markdown 기반)
2. 블로그 포스팅
3. 예제 앱 통합

### 위키 기능 구현 예시

```astro
---
// src/pages/wiki/[slug].astro
import { fetchWikiContent } from '../../utils/wiki'
import Layout from '../../layouts/Layout.astro'

const { slug } = Astro.params
const wikiContent = await fetchWikiContent(slug || 'index')
---

<Layout title={wikiContent.title}>
  <div class="wiki-content">
    <h1>{wikiContent.title}</h1>
    <div class="content">
      <Fragment set:html={wikiContent.html} />
    </div>
  </div>
</Layout>
```

## 추가 자료

- [Astro 공식 문서](https://docs.astro.build)
- [Astro 블로그 예제](https://github.com/withastro/astro/tree/main/examples/blog)
- [Astro 통합 가이드](https://docs.astro.build/en/guides/integrations-guide/)
