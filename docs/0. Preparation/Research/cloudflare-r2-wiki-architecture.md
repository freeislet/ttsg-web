# Cloudflare R2 기반 위키 아키텍처

## 1. 개요

이 문서는 TTSG 프로젝트의 위키 콘텐츠를 Cloudflare R2 스토리지에 직접 저장하고 관리하는 아키텍처를 설명합니다. CMS를 도입하는 대신 자체 편집 UI를 구현하여 인프라 관리 비용을 최소화하면서 동적 컨텐츠 관리가 가능한 방식을 제안합니다.

### 1.1 선택 이유

- **비용 효율성**: Cloudflare R2는 무료 티어(10GB 스토리지, 월 10만 읽기 작업)를 제공함
- **인프라 단순화**: 별도의 CMS 서버나 데이터베이스 관리 불필요
- **기존 프로젝트와의 통합**: Astro 기반 프로젝트에 직접 통합 가능
- **유연성**: 필요한 기능만 맞춤형으로 구현 가능

## 2. 시스템 아키텍처

### 2.1 기본 구조

```
apps/web/ (Astro 기반 웹 앱)
├── src/
│   ├── pages/
│   │   └── wiki/
│   │       ├── [slug].astro     # 위키 페이지 표시
│   │       ├── edit/[slug].astro # 위키 편집 UI
│   │       └── new.astro        # 새 위키 페이지 생성
│   ├── components/
│   │   ├── WikiEditor.tsx       # 마크다운 에디터 컴포넌트
│   │   └── WikiPreview.tsx      # 실시간 마크다운 미리보기
│   ├── utils/
│   │   ├── wiki.ts              # 위키 콘텐츠 로드 로직 (이미 존재)
│   │   └── r2-client.ts         # R2 인터페이스 (CRUD 기능)
│   └── api/                     # API 엔드포인트 (Astro에서 서버 측 로직)
│       └── wiki/
│           ├── get.ts           # 콘텐츠 조회 
│           ├── save.ts          # 콘텐츠 저장
│           ├── list.ts          # 위키 목록 조회
│           └── delete.ts        # 콘텐츠 삭제
└── functions/                   # Cloudflare Functions (직접 R2 액세스)
    └── r2-wiki-operations.js    # R2 버킷 CRUD 조작
```

### 2.2 데이터 흐름

#### 읽기 흐름
1. 사용자가 `/wiki/page-name` 접속
2. `[slug].astro`가 `fetchWikiContent` 호출
3. 로컬 캐시/Astro 컬렉션 확인 → 없으면 R2에서 로드
4. 마크다운 변환 후 페이지 렌더링

#### 쓰기 흐름
1. 사용자가 `/wiki/edit/page-name` 접속
2. `edit/[slug].astro`가 기존 콘텐츠 로드 (있을 경우)
3. `WikiEditor` 컴포넌트로 마크다운 편집
4. 저장 시 `/api/wiki/save` API 호출
5. API가 Cloudflare Function 호출하여 R2에 저장
6. 성공 시 `/wiki/page-name`으로 리디렉션

## 3. 구현 세부 사항

### 3.1 R2 클라이언트

R2와의 통신을 담당하는 클라이언트 모듈입니다.

```typescript
// src/utils/r2-client.ts
const R2_BASE_URL = 'https://api.ttsg.dev/r2';  // Cloudflare Function 엔드포인트

export async function getWikiFromR2(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`${R2_BASE_URL}/wiki/${slug}.md`);
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error('R2 fetch error:', error);
    return null;
  }
}

export async function saveWikiToR2(slug: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${R2_BASE_URL}/wiki/${slug}.md`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/markdown'
      },
      body: content
    });
    
    return response.ok;
  } catch (error) {
    console.error('R2 save error:', error);
    return false;
  }
}

export async function listWikiPages(): Promise<string[]> {
  try {
    const response = await fetch(`${R2_BASE_URL}/wiki/list`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('R2 list error:', error);
    return [];
  }
}

export async function deleteWikiPage(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${R2_BASE_URL}/wiki/${slug}.md`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}
```

### 3.2 위키 유틸리티 업데이트

기존 `wiki.ts` 파일을 R2 지원을 위해 업데이트합니다.

```typescript
// src/utils/wiki.ts
import { getEntry } from 'astro:content'
import { marked } from 'marked'
import { getWikiFromR2 } from './r2-client'

// Base URLs for different wiki content sources
const SOURCES = {
  R2: 'https://static.ttsg.dev/wiki', // Cloudflare R2 path
}

export interface WikiContent {
  title: string
  content: string
  html: string
  source: 'local' | 'r2' | 'not-found'
  slug: string
  metadata?: Record<string, unknown>
}

/**
 * Fetches wiki content from local collection or R2 storage
 */
export async function fetchWikiContent(slug: string): Promise<WikiContent> {
  // First try to get from local content
  try {
    const entry = await getEntry('wiki', slug)

    if (entry) {
      const content = entry.body
      const html = marked.parse(content)
      return {
        title: entry.data.title || slug.replace(/-/g, ' '),
        content,
        html,
        source: 'local',
        slug,
        metadata: entry.data
      }
    }
  } catch (error) {
    console.error('Error fetching local wiki content:', error)
  }

  // If not found locally, try to fetch from R2
  try {
    const content = await getWikiFromR2(slug)
    
    if (content) {
      const html = marked.parse(content)
      return {
        title: slug.replace(/-/g, ' '),
        content,
        html,
        source: 'r2',
        slug,
      }
    }
  } catch (error) {
    console.error('Error fetching wiki content from R2:', error)
  }

  // Return not found result
  return {
    title: 'Not Found',
    content: `Wiki content "${slug}" not found`,
    html: `<p>Wiki content "${slug}" not found</p>`,
    source: 'not-found',
    slug,
  }
}
```

### 3.3 마크다운 에디터 컴포넌트

React를 사용한 마크다운 에디터 컴포넌트입니다.

```tsx
// src/components/WikiEditor.tsx
import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface WikiEditorProps {
  initialContent?: string;
  onSave: (content: string) => Promise<boolean>;
}

export function WikiEditor({ initialContent = '', onSave }: WikiEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setPreview(marked.parse(content));
  }, [content]);
  
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const success = await onSave(content);
      if (!success) {
        setError('저장 실패. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('오류 발생: ' + String(err));
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <textarea 
          className="w-full h-96 p-4 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="마크다운으로 작성..."
        />
        
        <div className="mt-4 flex justify-between">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
      
      <div className="p-4 border rounded prose">
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
```

### 3.4 위키 편집 페이지

위키 페이지를 편집하는 Astro 페이지 컴포넌트입니다.

```astro
// src/pages/wiki/edit/[slug].astro
---
import Layout from '../../../layouts/Layout.astro';
import { WikiEditor } from '../../../components/WikiEditor';
import { fetchWikiContent } from '../../../utils/wiki';
import { saveWikiToR2 } from '../../../utils/r2-client';

// 인증 확인 (구현 필요)
// const isAuthenticated = checkAuth(Astro.request);
// if (!isAuthenticated) return Astro.redirect('/login');

const { slug } = Astro.params;
const wikiContent = await fetchWikiContent(slug || '');

// POST 요청 처리
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const content = String(formData.get('content') || '');
  
  const success = await saveWikiToR2(slug || '', content);
  if (success) {
    return Astro.redirect(`/wiki/${slug}`);
  }
}
---

<Layout title={`Edit: ${wikiContent.title}`}>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Edit: {wikiContent.title}</h1>
    
    <WikiEditor 
      client:load
      initialContent={wikiContent.content}
      onSave={async (content) => {
        const response = await fetch(`/api/wiki/save?slug=${slug}`, {
          method: 'POST',
          body: content
        });
        
        if (response.ok) {
          window.location.href = `/wiki/${slug}`;
          return true;
        }
        return false;
      }}
    />
  </div>
</Layout>
```

### 3.5 새 위키 페이지 생성

새로운 위키 페이지를 생성하는 컴포넌트입니다.

```astro
// src/pages/wiki/new.astro
---
import Layout from '../../layouts/Layout.astro';
import { WikiEditor } from '../../components/WikiEditor';
import { saveWikiToR2 } from '../../utils/r2-client';

// 인증 확인 (구현 필요)
// const isAuthenticated = checkAuth(Astro.request);
// if (!isAuthenticated) return Astro.redirect('/login');

let error = '';
let slug = '';

// POST 요청 처리
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  slug = String(formData.get('slug') || '').trim().toLowerCase().replace(/\s+/g, '-');
  const content = String(formData.get('content') || '');
  
  if (!slug) {
    error = '페이지 식별자를 입력해주세요.';
  } else {
    const success = await saveWikiToR2(slug, content);
    if (success) {
      return Astro.redirect(`/wiki/${slug}`);
    } else {
      error = '페이지 저장에 실패했습니다. 다시 시도해주세요.';
    }
  }
}
---

<Layout title="Create New Wiki Page">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Create New Wiki Page</h1>
    
    <form method="POST" class="mb-6">
      <div class="mb-4">
        <label for="slug" class="block text-sm font-medium text-gray-700">
          Page Identifier (URL slug)
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={slug}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="page-name"
          required
        />
      </div>
      
      {error && <p class="text-red-500 mb-4">{error}</p>}
      
      <WikiEditor 
        client:load
        initialContent=""
        onSave={async (content) => {
          const slugValue = document.getElementById('slug').value.trim().toLowerCase().replace(/\s+/g, '-');
          
          if (!slugValue) {
            alert('페이지 식별자를 입력해주세요.');
            return false;
          }
          
          const response = await fetch(`/api/wiki/save?slug=${slugValue}`, {
            method: 'POST',
            body: content
          });
          
          if (response.ok) {
            window.location.href = `/wiki/${slugValue}`;
            return true;
          }
          return false;
        }}
      />
    </form>
  </div>
</Layout>
```

### 3.6 API 엔드포인트: 위키 저장

```typescript
// src/pages/api/wiki/save.ts
import type { APIRoute } from 'astro';
import { saveWikiToR2 } from '../../../utils/r2-client';

export const POST: APIRoute = async ({ request, url }) => {
  // 인증 확인 (구현 필요)
  // if (!isAuthenticated(request)) {
  //   return new Response(JSON.stringify({ error: '인증 필요' }), { status: 401 });
  // }
  
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: '페이지 식별자 필요' }), { status: 400 });
  }
  
  try {
    const content = await request.text();
    const success = await saveWikiToR2(slug, content);
    
    if (success) {
      return new Response(JSON.stringify({ success: true }));
    } else {
      return new Response(JSON.stringify({ error: '저장 실패' }), { status: 500 });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `오류 발생: ${error.message}` }), 
      { status: 500 }
    );
  }
};
```

### 3.7 Cloudflare Function: R2 조작

```javascript
// functions/r2-wiki-operations.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/r2/', ''); // /r2/wiki/page-name.md -> wiki/page-name.md
  const method = request.method;
  
  // CORS 헤더 설정
  const headers = new Headers({
    'Access-Control-Allow-Origin': 'https://ttsg.dev',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // R2 버킷 접근
    const bucket = env.WIKI_BUCKET;
    
    // 리스트 조회 요청 처리
    if (path === 'wiki/list') {
      const objects = await bucket.list({ prefix: 'wiki/' });
      const files = objects.objects.map(obj => obj.key.replace('wiki/', '').replace('.md', ''));
      return new Response(JSON.stringify(files), { 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      });
    }
    
    // 개별 파일 처리
    if (method === 'GET') {
      const object = await bucket.get(path);
      if (object === null) {
        return new Response('Not found', { status: 404, headers });
      }
      return new Response(await object.text(), { headers });
      
    } else if (method === 'PUT') {
      await bucket.put(path, request.body);
      return new Response('Saved', { headers });
      
    } else if (method === 'DELETE') {
      await bucket.delete(path);
      return new Response('Deleted', { headers });
    }
    
    return new Response('Method not allowed', { status: 405, headers });
    
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500, headers });
  }
}
```

## 4. 구현 계획

### 4.1 구현 단계

1. **R2 설정**
   - Cloudflare 계정 생성/확인
   - R2 버킷 생성
   - 적절한 CORS 설정

2. **기본 인프라 구축**
   - R2 클라이언트 유틸리티 구현
   - 기존 wiki.ts 확장하여 R2 지원 추가

3. **편집 인터페이스 개발**
   - WikiEditor 컴포넌트 구현
   - 새 페이지 생성 및 편집 페이지 개발

4. **서버 측 로직 구현**
   - API 엔드포인트 생성
   - Cloudflare Functions 배포
   - 인증 시스템 연동

5. **테스트 및 최적화**
   - 전체 워크플로우 테스트
   - 성능 및 UX 최적화

### 4.2 추후 확장 가능성

- **버전 관리**: Git 기반 버전 관리 시스템 추가
- **미디어 업로드**: 이미지 등 미디어 파일 업로드 및 관리 기능
- **검색 기능**: Cloudflare Workers를 활용한 콘텐츠 검색 기능
- **접근 권한 관리**: 페이지별 편집/읽기 권한 설정

## 5. 장점과 고려사항

### 5.1 장점

- **비용 효율성**: CMS 구독 비용 없이 확장 가능한 위키 구축
- **성능**: Cloudflare의 글로벌 CDN 활용으로 빠른 콘텐츠 전송
- **유연성**: 필요에 따라 기능 추가/수정 용이
- **소유권**: 데이터 및 인프라에 대한 완전한 통제권

### 5.2 고려사항

- **개발 노력**: 초기 개발 및 기능 구현에 시간 투자 필요
- **유지보수**: 자체 구현 시스템 유지보수 책임
- **인증 및 보안**: 적절한 인증 및 접근 제어 메커니즘 구현 필요
- **백업 전략**: 데이터 손실 방지를 위한 백업 전략 수립 필요

## 6. 결론

Cloudflare R2 기반 위키 시스템은 인프라 관리 비용을 최소화하면서도 유연하고 확장 가능한 콘텐츠 관리 솔루션을 제공합니다. 기존 Astro 프로젝트에 자연스럽게 통합되며, 필요한 기능만 맞춤형으로 구현할 수 있다는 장점이 있습니다. 특히 TTSG 프로젝트와 같이 효율적인 리소스 사용이 중요한 경우 적합한 접근 방식입니다.
