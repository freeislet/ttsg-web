# Cloudflare Pages 배포 가이드

이 문서는 TTSG 프로젝트를 Cloudflare Pages에 배포하기 위한 단계별 가이드입니다.

## 1. Cloudflare Pages 프로젝트 생성 및 배포

### GitHub 저장소 연결

1. Cloudflare 대시보드에서 "Pages" 메뉴 선택
2. "Create a project" → "Connect to Git" 클릭
3. GitHub 계정 연결 후 TTSG 저장소 선택
4. 다음 설정으로 프로젝트 구성:
   - Framework preset: `Astro`
   - Root directory: `apps/web` (웹 어플리케이션 폴더)
   - Build command: `pnpm run build`
   - Build output directory: `dist`
   - Environment variables: 필요한 경우 설정

### R2 버킷 바인딩 설정

프로젝트의 `wrangler.toml` 파일에 R2 버킷 바인딩이 이미 구성되어 있지만, Cloudflare Pages 대시보드에서도 동일한 바인딩을 설정해야 합니다:

1. 프로젝트 생성 후 Pages 대시보드에서 프로젝트 선택
2. "Settings" → "Functions" 탭으로 이동
3. "R2 bucket bindings" 섹션에서 "Add binding" 클릭
4. 다음 정보 입력(wrangler.toml과 동일하게):
   - Variable name: `BUCKET`
   - R2 bucket: 생성한 R2 버킷 선택 (예: ttsg)
5. "Save" 버튼 클릭

### 배포 시작

1. "Deployments" 탭으로 이동
2. "Retry deployment" 또는 새 커밋 푸시하여 배포 시작
3. 빌드 로그와 배포 상태 확인

## 2. 커스텀 도메인 설정 (선택사항)

1. "Custom domains" 탭으로 이동
2. "Set up a custom domain" 클릭
3. 도메인 이름 입력 (예: wiki.ttsg.dev)
4. DNS 설정 완료 (자동 또는 수동)

## 3. 로컬 개발 환경 설정

### Wrangler CLI 설치 및 설정

```bash
npm install -g wrangler
```

#### wrangler.toml 설정

`wrangler.toml` 파일을 아래와 같이 구성하여 Cloudflare Functions, R2 바인딩, Node.js 호환성 등을 설정합니다.

```toml
name = "ttsg"
pages_build_output_dir = "dist"
compatibility_date = "2025-07-30"
compatibility_flags = ["nodejs_compat"]

[env]
production = { }

# R2 버킷 바인딩 설정
[[r2_buckets]]
bucket_name = "ttsg"
binding = "BUCKET"  # env.BUCKET으로 접근 가능
experimental_remote = true
```

중요 설정 사항:

- `compatibility_flags = ["nodejs_compat"]`: Node.js 내장 모듈(fs, child_process 등)을 사용하기 위한 필수 설정
- `bucket_name`과 `binding`: R2 버킷 연결 설정
- `experimental_remote`: 로컬 개발 시에도 클라우드의 R2 버킷을 사용할 수 있게 함

#### TypeScript 타입 정의 생성

Cloudflare Workers/Pages Functions 환경에 맞는 타입 정의를 생성합니다:

```bash
cd apps/web
pnpm w:types
```

이 명령은 `worker-configuration.d.ts` 파일을 생성하며, 이 파일은 Cloudflare Workers API와 R2 등의 타입 정의를 포함합니다. `tsconfig.json`에 다음과 같이 추가되어야 합니다:

```json
{
  "compilerOptions": {
    "types": ["./worker-configuration.d.ts", "node"]
  }
}
```

### 로컬에서 Pages Functions 테스트

로컬 개발 환경에서는 다음 순서로 진행해야 합니다:

```bash
cd apps/web
# 1. 먼저 빌드 (React SSR 관련 vite alias가 적용됨)
pnpm build
# 2. 빌드된 파일로 Wrangler 개발 서버 실행
pnpm w:dev
```

원격 R2 바인딩을 사용해 테스트하려면:

```bash
pnpm w:dev
```

## 4. 문제 해결

### React 19 + Cloudflare Functions 호환성 문제 (MessageChannel Error)

**문제 증상**
Cloudflare Pages에서 아래와 같은 오류 메시지가 나타나며 Functions 배포가 실패함:

```
Error: Failed to publish your Function. Got error: Uncaught ReferenceError: MessageChannel is not defined
  at chunks/_@astro-renderers_GJ0eSamk.mjs:6804:16 in requireReactDomServer_browser_production
```

**원인**
React 19와 Astro의 SSR이 Cloudflare Workers 환경에서 사용하는 `MessageChannel` API가 없기 때문입니다. Cloudflare Workers 환경은 일반 Node.js 환경과 달리 제한된 Web API만 지원합니다.

**해결 방법**
React 19를 그대로 유지하면서 `astro.config.mjs` 파일에 다음과 같이 `vite.resolve.alias` 설정을 추가합니다:

```javascript
export default defineConfig({
  // ... 기존 설정 ...
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        ...(import.meta.env.PROD && {
          // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
          // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
          // (https://github.com/withastro/astro/issues/12824#issuecomment-2563095382)
          'react-dom/server': 'react-dom/server.edge',
        }),
      },
    },
  },
})
```

이 설정은 프로덕션 환경에서 React DOM Server를 edge 버전으로 대체하여 MessageChannel 의존성을 제거합니다.

### R2 접근 오류

- R2 바인딩이 올바르게 설정되었는지 확인
- Cloudflare Worker/Pages 로그 확인
- CORS 설정 확인

### 빌드 오류

- 필요한 디펜던시 설치 여부 확인
- 빌드 명령 및 경로 확인
- Node.js 버전 호환성 확인

### API 오류

- 네트워크 요청 확인 (브라우저 개발자 도구)
- Pages Functions 로그 확인
- API 엔드포인트 경로 확인

## 5. 마이그레이션 후 변경 사항

기존 시스템과 비교하여 다음과 같은 변경 사항이 있습니다:

1. API 엔드포인트 변경:
   - 기존: `https://api.ttsg.dev/r2/wiki/{slug}.md`
   - 새로운 경로: `/api/wiki/{slug}`

2. 배포 흐름 변경:
   - 기존: Vercel 배포 + 별도 Cloudflare Worker API
   - 새로운 흐름: Cloudflare Pages로 통합 배포

3. 로컬 개발 흐름:
   - `wrangler pages dev` 명령으로 Pages Functions 포함하여 테스트
