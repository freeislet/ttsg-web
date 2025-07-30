# Cloudflare Pages와 R2 통합: 위키 시스템 구현

## 1. 개요

이 문서는 Astro 기반 TTSG 프로젝트를 Cloudflare Pages에 배포하고, Cloudflare R2와 통합하여 위키 콘텐츠를 관리하는 방법을 설명합니다. 이 접근 방식은 별도의 API 서버 없이 직접 R2 버킷에 접근할 수 있는 장점이 있습니다.

### 1.1 이전 아키텍처와의 차이점

기존의 접근 방식은 다음과 같습니다:
- Vercel에 웹사이트 배포
- R2에 접근하기 위한 별도의 Cloudflare Worker API 필요
- 클라이언트 → API → R2 버킷의 3단계 구조

새로운 접근 방식의 장점:
- Cloudflare Pages에 통합 배포
- Pages Functions을 통한 R2 버킷 직접 바인딩
- 인증 및 권한 관리 통합
- 별도 API 서버 불필요

## 2. 시스템 아키텍처

### 2.1 기본 구조

```
apps/web/ (Astro 기반 웹 앱)
├── src/
│   ├── pages/
│   │   └── wiki/
│   │       ├── [slug].astro         # 위키 페이지 표시
│   │       ├── edit/[slug].astro    # 위키 편집 UI
│   │       └── new.astro            # 새 위키 페이지 생성
│   ├── components/
│   │   └── WikiEditor.tsx           # 마크다운 에디터 컴포넌트
│   └── utils/
│       └── wiki.ts                  # 위키 콘텐츠 로드 로직
└── functions/                       # Cloudflare Pages Functions
    └── api/
        └── wiki/
            ├── [[route]].ts         # 위키 CRUD 작업 처리
            └── _middleware.ts       # 인증 및 권한 검사
```

### 2.2 데이터 흐름

#### 읽기 흐름
1. 사용자가 `/wiki/page-name` 접속
2. Astro 페이지에서 Cloudflare Function API 호출
3. Function이 R2 버킷에서 콘텐츠 로드
4. 마크다운 변환 후 페이지 렌더링

#### 쓰기 흐름
1. 사용자가 `/wiki/edit/page-name` 접속
2. WikiEditor 컴포넌트로 마크다운 편집
3. 저장 시 Cloudflare Function API 호출
4. Function이 R2 버킷에 직접 저장

## 3. Cloudflare Pages 배포 설정

### 3.1 프로젝트 준비

Astro 프로젝트에 Cloudflare 통합 추가:

```bash
# Cloudflare 통합 추가
npm install @astrojs/cloudflare
```

`astro.config.mjs` 파일 업데이트:

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'directory'  // Pages Functions 사용 모드
  }),
});
```

### 3.2 Pages Functions 구성

Cloudflare Pages Functions는 특정 경로 패턴에 맞는 요청을 처리하는 서버리스 함수입니다.

`functions/api/wiki/[[route]].ts` 파일 생성:

```typescript
export interface Env {
  WIKI_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const route = params.route ? params.route.toString() : '';
  const slug = route || url.searchParams.get('slug') || '';
  const method = request.method;
  
  // CORS 헤더 설정
  const headers = new Headers({
    'Access-Control-Allow-Origin': url.origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  
  // OPTIONS 요청 처리
  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // R2 버킷 접근 (바인딩 사용)
    const bucket = env.WIKI_BUCKET;
    
    // 목록 조회
    if (route === 'list') {
      const objects = await bucket.list({ prefix: 'wiki/' });
      const files = objects.objects.map(obj => obj.key.replace('wiki/', '').replace('.md', ''));
      return new Response(JSON.stringify(files), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // 개별 파일 처리
    const path = `wiki/${slug}.md`;
    
    if (method === 'GET') {
      const object = await bucket.get(path);
      if (object === null) {
        return new Response('Not found', { status: 404, headers });
      }
      return new Response(await object.text(), { headers });
      
    } else if (method === 'PUT' || method === 'POST') {
      const content = await request.text();
      await bucket.put(path, content);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      
    } else if (method === 'DELETE') {
      await bucket.delete(path);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Method not allowed', { status: 405, headers });
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error: ${error.message}` }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }
};
```

### 3.3 인증 미들웨어 구현 (선택사항)

`functions/api/wiki/_middleware.ts` 파일 생성:

```typescript
export const onRequest: PagesFunction = async ({ request, next }) => {
  // 쓰기 작업만 인증 필요
  if (['PUT', 'POST', 'DELETE'].includes(request.method)) {
    // 여기에 인증 로직 구현
    // 예: JWT 토큰 검증, 세션 확인 등
    
    // 인증 실패 시
    // return new Response('Unauthorized', { status: 401 });
  }
  
  // 인증 성공 또는 읽기 작업은 계속 진행
  return next();
};
```

## 4. 클라이언트 측 코드 업데이트

기존 `r2-client.ts`를 새로운 API 엔드포인트를 사용하도록 업데이트:

```typescript
// src/utils/r2-client.ts
const API_BASE_URL = '/api/wiki';  // Pages Functions 경로

/**
 * R2에서 위키 콘텐츠 가져오기
 */
export async function getWikiFromR2(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`);
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error('R2 fetch error:', error);
    return null;
  }
}

/**
 * 위키 콘텐츠를 R2에 저장
 */
export async function saveWikiToR2(slug: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
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

/**
 * 모든 위키 페이지 목록 가져오기
 */
export async function listWikiPages(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/list`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('R2 list error:', error);
    return [];
  }
}

/**
 * 위키 페이지 삭제
 */
export async function deleteWikiPage(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}
```

## 5. Cloudflare Pages 배포

### 5.1 GitHub 저장소 연결

1. Cloudflare 대시보드에서 "Pages" 메뉴 선택
2. "Create a project" → "Connect to Git" 클릭
3. GitHub 계정 연결 및 저장소 선택
4. 배포 설정:
   - Framework preset: `Astro`
   - Build command: `npm run build` (또는 `pnpm build`)
   - Build output directory: `dist`
   - Root directory: `/apps/web` (모노레포인 경우)

### 5.2 환경 변수 및 R2 바인딩 설정

1. 프로젝트 설정 페이지로 이동
2. "Settings" → "Functions" → "R2 bucket bindings" 클릭
3. 바인딩 추가:
   - Variable name: `WIKI_BUCKET`
   - R2 bucket: 이전에 생성한 버킷 선택
4. 저장 및 새 배포 시작

### 5.3 사용자 지정 도메인 설정 (선택사항)

1. "Settings" → "Custom domains" 클릭
2. "Set up a custom domain" 클릭
3. 도메인 이름 입력 및 DNS 설정 완료

## 6. 장점과 고려사항

### 6.1 장점

- **통합 배포**: 웹사이트와 API가 모두 Cloudflare에서 호스팅되어 관리가 용이
- **R2 직접 접근**: 환경 변수 바인딩을 통한 안전하고 간편한 R2 접근
- **보안 향상**: API 키가 코드나 환경 변수에 노출되지 않음
- **확장성**: Cloudflare 생태계 내에서 쉽게 확장 가능
- **비용 효율성**: 무료 티어로 시작 가능

### 6.2 고려사항

- **벤더 락인**: Cloudflare 생태계에 더 의존하게 됨
- **마이그레이션**: Vercel에서 Cloudflare로 이전 작업 필요
- **기능 제한**: Cloudflare Pages Functions의 일부 제한사항 고려 필요
- **디버깅**: 로컬 개발 환경과 배포 환경 간 차이 이해 필요

## 7. 배포 및 테스트 단계

1. Astro 설정 및 어댑터 업데이트
2. Pages Functions 구현
3. 클라이언트 코드 업데이트
4. GitHub 저장소 연결 및 배포 설정
5. R2 바인딩 구성
6. 전체 기능 테스트:
   - 위키 페이지 조회
   - 새 위키 페이지 생성
   - 위키 페이지 편집
   - 인증 및 권한 테스트

## 8. 결론

Cloudflare Pages와 R2를 통합하는 이 접근 방식은 별도의 API 서버 없이도 효율적인 위키 시스템 구현이 가능합니다. R2 버킷 바인딩을 통해 보안을 유지하면서도 개발 복잡성을 줄일 수 있습니다. 또한 Cloudflare의 글로벌 네트워크를 활용하여 성능과 확장성도 확보할 수 있습니다.
