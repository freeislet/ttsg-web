# Jamstack React 앱 배포 조사 결과

## 개요
Gemini API를 활용한 AI 채팅 앱을 Jamstack으로 구축하여 TTSG 사이트에 연동하는 방안에 대한 기술적 조사 결과입니다.

## 1. Jamstack React 앱 배포 방식

### 1.1 순수 React vs 프레임워크 비교

#### 순수 React (Create React App / Vite)
**장점:**
- 단순한 구조로 학습 곡선이 낮음
- 번들 크기가 상대적으로 작음
- Cloudflare Pages에서 직접 지원
- 빠른 개발 시작 가능

**단점:**
- SEO 최적화가 제한적 (SPA 특성상)
- 서버사이드 렌더링 미지원
- 라우팅, 상태 관리 등을 별도로 구성해야 함

#### React 프레임워크 (Next.js, Gatsby)

**Next.js:**
- SSR/SSG 지원으로 SEO 최적화
- API Routes로 백엔드 기능 통합 가능
- Cloudflare Pages에서 완전 지원
- 복잡한 설정이 필요할 수 있음

**Gatsby:**
- 정적 사이트 생성에 최적화
- GraphQL 기반 데이터 관리
- 플러그인 생태계 풍부
- 동적 콘텐츠 처리에 제약

**Vite:**
- 매우 빠른 개발 서버
- 모듈식 아키텍처
- TypeScript 지원 우수
- 커뮤니티가 상대적으로 작음

### 1.2 권장 방식
**AI 채팅 앱을 위한 최적의 구성은 Remix를 Cloudflare Workers에 ai-chat.ttsg.space 서브도메인으로 배포하는 것입니다.**

**근거:**
1. **통합된 개발 경험**: 프론트엔드와 백엔드를 하나의 프로젝트에서 관리
2. **자동 SPA 라우팅**: 클라이언트 사이드 라우팅 자동 처리
3. **SSR 지원**: 초기 로딩 성능 및 SEO 최적화
4. **API 라우트 내장**: Gemini API 호출을 위한 별도 Functions 불필요
5. **실시간 채팅**: SPA 특성이 채팅 UI에 적합

## 2. 도메인 연결 방식

### 2.1 서브도메인 방식 (chat.ttsg.space)

**장점:**
- 완전히 독립적인 앱 운영 가능
- DNS 설정이 단순함 (CNAME 레코드 하나)
- 캐싱 정책을 독립적으로 관리
- 별도 SSL 인증서 자동 발급

**단점:**
- SEO 관점에서 도메인 권한이 분산됨
- 쿠키 공유에 제약 (다른 도메인으로 인식)

**설정 방법:**
```bash
# DNS 설정 (Cloudflare DNS에서)
CNAME chat <YOUR_PAGES_PROJECT>.pages.dev
```

### 2.2 경로 기반 방식 (ttsg.space/apps/chat)

**장점:**
- 메인 사이트와 통합된 사용자 경험
- SEO 관점에서 도메인 권한 통합
- 쿠키 및 세션 공유 가능

**단점:**
- 라우팅 설정이 복잡함
- 메인 사이트 배포와 의존성 발생
- 충돌 가능성 존재

**구현 방법:**
1. **Cloudflare Workers를 통한 프록시**
2. **메인 사이트에서 iframe 임베딩**
3. **Pages Functions를 통한 라우팅**

### 2.3 권장 방식
**서브도메인 방식 (chat.ttsg.space) 권장**

**근거:**
1. **독립성**: 채팅 앱의 독립적인 개발/배포 가능
2. **성능**: 별도 CDN 캐싱으로 최적화
3. **유지보수**: 메인 사이트와 분리된 관리
4. **확장성**: 향후 다른 앱 추가 시 일관된 구조

## 3. R2 애셋 경로 처리

### 3.1 상대 경로 vs 절대 경로

**R2에서는 상대 경로 직접 접근 불가능**
- R2는 객체 스토리지로 파일 시스템과 다른 구조
- 모든 애셋은 절대 경로 또는 API를 통해 접근해야 함

### 3.2 권장 구현 방식

#### 방식 1: Pages Functions를 통한 프록시
```javascript
// functions/assets/[[path]].js
export async function onRequestGet(context) {
  const path = context.params.path.join('/');
  const object = await context.env.ASSETS.get(path);
  
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata.contentType,
      'Cache-Control': 'public, max-age=31536000'
    }
  });
}
```

#### 방식 2: 환경 변수를 통한 절대 경로 관리
```javascript
// .env
VITE_ASSETS_BASE_URL=https://chat.ttsg.space/assets

// React 컴포넌트에서
const imageUrl = `${import.meta.env.VITE_ASSETS_BASE_URL}/images/logo.png`;
```

### 3.3 애셋 구조 권장사항
```
R2 Bucket: ttsg-chat-assets
├── images/
│   ├── icons/
│   ├── avatars/
│   └── ui/
├── fonts/
└── static/
    ├── css/
    └── js/
```

## 4. 전체 아키텍처 권장안

### 4.1 기술 스택 (업데이트됨)
- **프론트엔드**: React Router (구 Remix) + React + TypeScript
- **호스팅**: Cloudflare Workers
- **실시간 상태**: Durable Objects
- **영구 저장**: Cloudflare D1
- **애셋 스토리지**: Cloudflare R2
- **도메인**: ai-chat.ttsg.space (서브도메인)
- **API**: Gemini API (Workers 내장 라우트)

### 4.2 프로젝트 구조 (React Router 기준)
```
ai-chat/
├── app/
│   ├── components/
│   ├── routes/
│   │   ├── _index.tsx
│   │   ├── api.chat.ts (Gemini API)
│   │   └── api.upload.ts (파일 업로드)
│   ├── utils/
│   ├── types/
│   ├── entry.server.ts
│   ├── root.tsx
│   └── routes.ts
├── workers/
│   └── app.ts (Worker 엔트리, Durable Objects 포함)
├── public/
├── react-router.config.ts
├── vite.config.ts
├── wrangler.jsonc
└── package.json
```

### 4.3 배포 플로우 (React Router 기준)
1. **개발**: `pnpm run dev` (로컬 개발 서버)
2. **빌드**: `pnpm run build` (Workers 번들 생성)
3. **배포**: `pnpm run deploy` (Cloudflare Workers 배포)
4. **애셋**: R2에 별도 업로드 (필요시)

## 5. 보안 및 성능 고려사항

### 5.1 API 키 보안
- Gemini API 키는 Pages Functions에서 환경 변수로 관리
- 클라이언트에서 직접 API 호출 금지

### 5.2 성능 최적화
- R2 애셋에 적절한 캐시 헤더 설정
- 이미지 최적화 (WebP, 압축)
- 코드 스플리팅으로 초기 로딩 시간 단축

### 5.3 비용 최적화
- R2 Class B 작업 (GET 요청) 비용 고려
- 적절한 캐싱 정책으로 요청 수 최소화

## 6. R2 정적 호스팅의 한계

### 6.1 R2를 정적 웹사이트 호스팅으로 사용할 때의 문제점

사용자가 제안한 "빌드된 dist 폴더를 R2에 올리고 /apps/ai-chat 경로로 접근" 방식은 기술적으로 가능하지만 실용적이지 않습니다.

**주요 제약사항:**
1. **SPA 라우팅 미지원**: R2는 모든 경로에 대해 `index.html`을 반환하는 fallback 기능이 없음
2. **복잡한 CORS 설정**: 메인 사이트에서 R2 파일 접근 시 CORS 정책 설정 필요
3. **프록시 함수 필요**: 메인 사이트에서 `/apps/ai-chat` → R2 프록시를 위한 추가 Workers 함수 구현 필요
4. **캐시 관리 복잡성**: 적절한 캐시 헤더 설정과 무효화 로직 구현 필요

### 6.2 실제 구현 시 필요한 작업
```javascript
// 메인 사이트에서 필요한 프록시 Workers 함수
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/apps/ai-chat')) {
      // R2에서 파일 가져오기
      const objectKey = url.pathname.replace('/apps/ai-chat', '') || '/index.html';
      const object = await env.CHAT_BUCKET.get(objectKey);
      
      if (!object) {
        // SPA 라우팅을 위해 index.html 반환
        const indexObject = await env.CHAT_BUCKET.get('/index.html');
        return new Response(indexObject.body, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      return new Response(object.body, {
        headers: { 'Content-Type': object.httpMetadata.contentType }
      });
    }
  }
}
```

## 7. 권장 대안: 풀스택 프레임워크

### 7.1 React Router (구 Remix) + Cloudflare Workers 조합

**중요 업데이트**: Remix가 React Router로 통합되었습니다. 새로운 프로젝트는 `react-router` 프레임워크를 사용합니다.

**장점:**
- **통합된 개발 경험**: 프론트엔드와 백엔드를 하나의 프로젝트에서 관리
- **자동 SPA 라우팅**: 클라이언트 사이드 라우팅 자동 처리
- **SSR 지원**: 초기 로딩 성능 및 SEO 최적화
- **API 라우트 내장**: Gemini API 호출을 위한 별도 Functions 불필요
- **간단한 배포**: `pnpm create cloudflare@latest` 한 번으로 완료
- **Durable Objects 지원**: Workers 엔트리 파일에서 직접 추가 가능

**배포 방법:**
```bash
pnpm create cloudflare@latest ai-chat --framework=react-router
cd ai-chat
pnpm run deploy
```

### 7.2 React Router vs 다른 프레임워크 비교

| 특징 | React Router | Next.js | RedwoodJS |
|------|-------------|---------|----------|
| CF Workers 지원 | ✅ 완벽 지원 | ⚠️ 제한적 | ⚠️ 제한적 |
| 학습 곡선 | 낮음 (React 기반) | 중간 | 높음 |
| 번들 크기 | 중간 | 중간 | 큼 |
| API 개발 | 간단 | 간단 | GraphQL 강제 |
| 배포 복잡도 | 낮음 | 중간 | 높음 |
| Durable Objects | ✅ 네이티브 지원 | ❌ 미지원 | ❌ 미지원 |

**결론**: React Router 권장

## 8. 최종 권장 아키텍처

```
[사용자] → [ai-chat.ttsg.space] → [Remix on CF Workers] → [Gemini API]
```

**기술 스택:**
- **프레임워크**: React Router (구 Remix)
- **런타임**: Cloudflare Workers
- **실시간 상태**: Durable Objects
- **도메인**: ai-chat.ttsg.space
- **데이터베이스**: Cloudflare D1
- **스토리지**: Cloudflare R2 (파일 업로드 시)

이 구성은 개발 복잡도를 크게 줄이면서도 성능과 확장성을 보장합니다.

---
*작성일: 2025-09-05*
*작성자: Windsurf AI*
