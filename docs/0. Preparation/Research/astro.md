# Astro 프레임워크 특징 및 사용법

## 🌟 Astro의 주요 특징

1. **아일랜드 아키텍처(Island Architecture)**
   - 페이지를 독립적으로 렌더링되는 여러 '아일랜드'로 분리
   - 각 컴포넌트는 독립적으로 로드되어 전체 페이지 로딩 성능 향상

2. **다중 프레임워크 지원**
   - React, Vue, Svelte, Preact 등 다양한 UI 프레임워크 컴포넌트 통합 가능
   - 한 페이지 내에서 다양한 프레임워크 혼합 사용 가능

3. **정적 사이트 생성(SSG) 최적화**
   - 기본적으로 빠른 정적 사이트 생성에 최적화
   - 필요에 따라 SSR 모드로 전환 가능

4. **Content-first 접근**
   - 마크다운 및 콘텐츠 중심 사이트 구축에 최적화된 도구 제공
   - 콘텐츠 컬렉션 및 자동 라우팅 지원

5. **Zero JS by default**
   - 기본적으로 자바스크립트를 제공하지 않아 초기 로딩 속도 향상
   - 필요한 부분에만 선택적으로 자바스크립트 추가 가능

## ⚛️ React 컴포넌트 사용 시 주의할 점

1. **client:* 지시어의 이해와 사용**
   - 클라이언트에서 실행되어야 하는 React 컴포넌트에는 client:* 지시어 필수
   - 예: `<ReactComponent client:load />`, `<ReactComponent client:idle />`, `<ReactComponent client:visible />`

2. **서버 렌더링과 클라이언트 하이드레이션**
   - 서버에서 렌더링만 필요한 React 컴포넌트는 client 지시어 없이 사용 가능
   - 인터랙션이 필요한 컴포넌트는 적절한 client 지시어 선택이 중요

3. **JSX와 .astro 파일의 차이점**
   - .astro 파일은 서버에서만 실행되며 컴포넌트 스코프 내에서 전체 JavaScript 기능 지원
   - React 컴포넌트 내에서는 일반적인 React/JSX 규칙 적용

---

# Astro SSR, API, 및 배포 옵션

이 문서는 Astro 프로젝트의 SSR 설정, API 기능 추가 방법, 그리고 Vercel과 Cloudflare 배포 옵션을 비교한 정보를 제공합니다.

## SSR 설정

현재 프로젝트는 Server-Side Rendering(SSR)이 활성화되어 있습니다. SSR은 `astro.config.mjs` 파일에서 다음과 같이 설정되어 있습니다:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [mdx(), tailwind(), react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
```

주요 설정:
- `output: 'server'` - 서버 사이드 렌더링을 활성화합니다.
- `adapter: node({ mode: 'standalone' })` - Node.js 어댑터를 사용하여 SSR을 구현합니다.

## API 기능 추가하기

Astro에서 API 기능을 추가하는 주요 방법은 다음과 같습니다:

### 1. API 라우트 생성

`src/pages/api/` 경로에 `.ts` 또는 `.js` 파일을 만들어 API 엔드포인트를 구현할 수 있습니다:

```typescript
// src/pages/api/example.ts
export async function get({ params, request }) {
  // GET 요청 처리 로직
  return {
    body: JSON.stringify({ message: "Success" }),
    headers: { "Content-Type": "application/json" }
  };
}

export async function post({ params, request }) {
  // POST 요청 처리 로직
  const body = await request.json();
  
  return {
    body: JSON.stringify({ message: "Received", data: body }),
    headers: { "Content-Type": "application/json" }
  };
}
```

### 2. API 구조 확장

필요에 따라 더 많은 경로와 기능을 추가할 수 있습니다:
- `src/pages/api/users.ts` - 사용자 관리
- `src/pages/api/auth.ts` - 인증 관련
- `src/pages/api/data/[id].ts` - 동적 파라미터를 사용한 데이터 액세스

### 3. 외부 API와 연동

Astro API 라우트에서 외부 API나 데이터베이스에 연결할 수 있습니다.

### 4. 미들웨어 사용

인증 검증 같은 공통 로직을 미들웨어로 구현할 수 있습니다.

## Vercel vs Cloudflare 배포

### Vercel 장점
- Astro 프로젝트와의 통합이 잘 되어 있음
- 설정이 간단하고 직관적인 UI 제공
- 자동 미리보기 배포와 CI/CD 파이프라인 제공
- 풍부한 서버리스 함수 지원
- 글로벌 CDN으로 빠른 콘텐츠 제공

### Cloudflare 장점
- Cloudflare Workers를 통한 글로벌 엣지 컴퓨팅 제공
- 일반적으로 더 저렴한 가격 정책 (특히 많은 트래픽에 대해)
- DDoS 보호 및 추가 보안 기능 내장
- Cloudflare R2 스토리지와의 통합 (현재 프로젝트에서 이미 R2를 사용 중)
- 더 큰 글로벌 엣지 네트워크를 보유하여 전 세계적으로 더 빠른 응답 시간 가능

### Cloudflare로 마이그레이션 고려사항

1. Astro 프로젝트의 경우 Cloudflare에 배포하려면 `@astrojs/cloudflare` 어댑터로 변경해야 합니다:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [mdx(), tailwind(), react()],
  output: 'server',
  adapter: cloudflare()
});
```

2. 현재 R2를 이미 사용하고 있어 Cloudflare 인프라로의 통합이 더 자연스러울 수 있습니다.

3. 프로젝트에 따라 Cloudflare Workers에서 동작하지 않는 Node.js API가 있을 수 있으므로, 호환성 검사가 필요합니다.

## 결론

현재 이미 Cloudflare R2를 사용하고 있다면 Cloudflare로의 배포가 인프라 통합 측면에서 더 효율적일 수 있습니다. 비용과 성능 측면에서도 Cloudflare가 더 나은 선택일 수 있습니다. 다만, 현재 프로젝트에서 Vercel 종속적인 기능을 사용하고 있다면 마이그레이션 과정에서 추가 작업이 필요할 수 있습니다.
