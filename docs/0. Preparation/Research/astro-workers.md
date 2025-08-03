# Astro + Cloudflare Workers 프로젝트

이 문서는 TTSG 프로젝트에서 Astro와 Cloudflare Workers를 활용한 웹 애플리케이션 구축에 대한 정보를 제공합니다.

## 프로젝트 개요

Astro와 Cloudflare Workers를 결합하여 다음과 같은 이점을 얻을 수 있습니다:

- **고성능 웹사이트**: Astro의 아일랜드 아키텍처와 최소 JavaScript 접근 방식
- **글로벌 배포**: Cloudflare의 전 세계 엣지 네트워크를 통한 빠른 콘텐츠 전달
- **서버리스 실행**: 서버 관리 없이 자동 스케일링되는 Workers 환경
- **보안 강화**: Cloudflare의 DDoS 보호 및 보안 기능 활용

## 프로젝트 생성 방법

Astro + Cloudflare Workers 프로젝트는 다음 명령어로 생성할 수 있습니다:

```bash
pnpm create cloudflare@latest <프로젝트명> --framework=astro
```

TTSG 프로젝트의 경우 다음과 같이 생성했습니다:

```bash
pnpm create cloudflare@latest web --framework=astro
```

이 명령어는 다음 작업을 수행합니다:
1. Astro 프로젝트 기본 템플릿 생성
2. Cloudflare Workers용 설정 추가
3. 필요한 의존성 설치 (Wrangler, Cloudflare 어댑터 등)
4. 타입 생성 및 설정 파일 구성

## 프로젝트 구조

생성된 프로젝트의 주요 구조는 다음과 같습니다:

```
web/
├── .vscode/            # VS Code 설정
├── public/             # 정적 자산 디렉토리
├── src/                # 소스 코드 디렉토리
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── layouts/        # 페이지 레이아웃
│   └── pages/          # 페이지 정의 (자동 라우팅)
├── astro.config.mjs    # Astro 설정 (Cloudflare 어댑터 포함)
├── package.json        # 프로젝트 의존성 및 스크립트
├── tsconfig.json       # TypeScript 설정
├── worker-configuration.d.ts # Workers 타입 정의
└── wrangler.jsonc      # Cloudflare Workers 설정
```

## 주요 파일 설명

### astro.config.mjs

이 파일은 Astro 설정을 포함하며, Cloudflare 어댑터가 구성되어 있습니다:

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ mode: 'directory' })
});
```

### wrangler.jsonc

Cloudflare Workers 설정 파일로, 배포 및 환경 설정을 관리합니다:

```jsonc
{
  "name": "web",
  "compatibility_date": "2025-08-03",
  // ... 기타 설정
}
```

## 개발 및 배포 워크플로우

### 로컬 개발

로컬 개발 서버를 시작하려면:

```bash
cd apps/web
pnpm run dev
```

이 명령은 로컬 개발 서버를 실행하며, 일반적으로 http://localhost:4321에서 접근 가능합니다.

### 배포

프로젝트를 Cloudflare Workers에 배포하려면:

```bash
cd apps/web
pnpm run deploy
```

이 명령은 프로젝트를 빌드하고 Cloudflare Workers에 배포합니다. 배포하기 전에 Cloudflare 계정 인증이 필요합니다.

## Cloudflare Pages vs Workers

기존 프로젝트는 Cloudflare Pages를 사용했으나, 새 프로젝트는 Cloudflare Workers를 사용합니다. 주요 차이점:

| 기능 | Cloudflare Pages | Cloudflare Workers |
|------|-----------------|-------------------|
| 실행 환경 | 정적 호스팅 중심 | 서버리스 JavaScript 환경 |
| 동적 기능 | Functions를 통해 제한적 | 완전한 프로그래밍 가능한 환경 |
| 빌드 프로세스 | Cloudflare 서버에서 빌드 | 로컬 빌드 후 업로드 |
| 배포 속도 | 자동화된 Git 통합 | CLI 배포 |
| 개발자 경험 | 간단한 설정 | 더 많은 제어와 유연성 |

## 성능 최적화 고려사항

Astro + Cloudflare Workers 환경에서 성능을 최적화하기 위한 고려사항:

1. **에셋 최적화**: 이미지, CSS, JavaScript 최적화
2. **캐싱 전략**: Cloudflare 캐시 헤더 활용
3. **Edge Functions**: 지역별 맞춤 콘텐츠 제공 가능
4. **아일랜드 아키텍처**: 필요한 컴포넌트만 인터랙티브하게 설정

## API 구현 방식

Astro + Cloudflare Workers 환경에서 API를 구현하는 방법은 다음과 같습니다:

### Cloudflare Pages vs Workers API 구현 비교

| Cloudflare Pages | Cloudflare Workers |
|-----------------|-------------------|
| `functions/` 폴더에 구현 | `src/pages/api/` 또는 `src/pages/*.js/ts` 파일에 구현 |
| 파일 기반 라우팅 | Astro의 파일 기반 라우팅 사용 |
| Worker 런타임 제약 | 완전한 Workers 런타임 기능 활용 |

### API 엔드포인트 생성 위치

- `src/pages/api/` 폴더에 API 파일 생성 (권장)
- 또는 `src/pages/` 폴더에 `.js` 또는 `.ts` 확장자를 가진 파일 생성

### API 구현 기본 구조

```typescript
// src/pages/api/index.ts
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'TTSG API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
```

### HTTP 메서드 지원

- `GET`, `POST`, `PUT`, `DELETE` 등의 HTTP 메서드를 지원합니다.
- 각 메서드는 별도의 함수로 export 합니다.

```typescript
// src/pages/api/users.ts
export async function GET() {
  // 사용자 목록 조회 로직
  return new Response(/* ... */);
}

export async function POST() {
  // 사용자 생성 로직
  return new Response(/* ... */);
}
```

### 동적 라우팅

- Astro의 동적 라우팅을 사용할 수 있습니다.
- `src/pages/api/[id].ts`와 같은 형식으로 파일을 생성합니다.

```typescript
// src/pages/api/users/[id].ts
export async function GET({ params }) {
  const { id } = params;
  // id를 사용한 데이터 조회 로직
  return new Response(/* ... */);
}
```

### 요청 정보 접근

- API 함수는 `context` 객체를 받아 요청 정보에 접근할 수 있습니다.

```typescript
export async function POST({ request, params, locals }) {
  // request: 요청 객체 (body, headers 등)
  // params: URL 매개변수
  // locals: 서버 측 상태 공유 (Astro.locals)
  
  const data = await request.json();
  // 데이터 처리 로직
  
  return new Response(/* ... */);
}
```

### Cloudflare 특정 기능 활용

- Workers 환경에서는 Cloudflare Workers API와 바인딩에 직접 접근할 수 있습니다.

```typescript
// KV, D1 등의 Cloudflare 서비스 활용 예시
export async function GET({ request, env }) {
  // env를 통해 Cloudflare 바인딩에 접근
  const value = await env.MY_KV.get('key');
  return new Response(value);
}
```

## 참고 자료

- [Astro 공식 문서](https://docs.astro.build)
- [Cloudflare Workers 개발자 문서](https://developers.cloudflare.com/workers/)
- [Astro Cloudflare 어댑터](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Astro 엔드포인트 문서](https://docs.astro.build/en/guides/endpoints/)
