# Cloudflare Pages 배포 가이드

이 문서는 TTSG 프로젝트를 Cloudflare Pages에 배포하고 R2 버킷과 연동하는 방법을 안내합니다.

## 1. 사전 준비

### 필요한 계정 및 설정

- Cloudflare 계정 (회원가입: https://dash.cloudflare.com/sign-up)
- GitHub 계정 (리포지토리 연결용)
- 이미 생성된 R2 버킷 (없다면 아래 R2 버킷 생성 부분 참조)

### 필요한 도구

- Node.js 18.x 이상
- npm 또는 yarn

## 2. 로컬 프로젝트 설정

이미 다음 단계를 완료했습니다:

- Astro 프로젝트에 Cloudflare 어댑터 설치
- `astro.config.mjs` 파일 업데이트
- Pages Functions 구성 (API 엔드포인트)
- R2 클라이언트 코드 업데이트

## 3. R2 버킷 생성 (아직 하지 않은 경우)

1. Cloudflare 대시보드에 로그인
2. 왼쪽 메뉴에서 "R2" 선택
3. "Create bucket" 버튼 클릭
4. 버킷 이름으로 "ttsg-wiki" 입력 (또는 원하는 이름)
5. "Create bucket" 버튼 클릭

## 4. Cloudflare Pages 프로젝트 생성 및 배포

### GitHub 저장소 연결

1. Cloudflare 대시보드에서 "Pages" 메뉴 선택
2. "Create a project" → "Connect to Git" 클릭
3. GitHub 계정 연결 후 TTSG 저장소 선택
4. 다음 설정으로 프로젝트 구성:
   - Framework preset: `Astro`
   - Build command: `cd apps/web && npm run build` (모노레포인 경우)
   - Build output directory: `apps/web/dist` (모노레포인 경우)
   - Root directory: `/` (저장소 루트)
   - Environment variables: 필요한 경우 설정

### R2 버킷 바인딩 설정

1. 프로젝트 생성 후 Pages 대시보드에서 프로젝트 선택
2. "Settings" → "Functions" 탭으로 이동
3. "R2 bucket bindings" 섹션에서 "Add binding" 클릭
4. 다음 정보 입력:
   - Variable name: `WIKI_BUCKET`
   - R2 bucket: 생성한 R2 버킷 선택 (예: ttsg-wiki)
5. "Save" 버튼 클릭

### 배포 시작

1. "Deployments" 탭으로 이동
2. "Retry deployment" 또는 새 커밋 푸시하여 배포 시작
3. 빌드 로그와 배포 상태 확인

## 5. 커스텀 도메인 설정 (선택사항)

1. "Custom domains" 탭으로 이동
2. "Set up a custom domain" 클릭
3. 도메인 이름 입력 (예: wiki.ttsg.dev)
4. DNS 설정 완료 (자동 또는 수동)

## 6. 로컬 개발 환경 설정

### Wrangler CLI 설치

```bash
npm install -g wrangler
```

### 로컬에서 Pages Functions 테스트

```bash
cd apps/web
wrangler pages dev dist
```

이 명령은 로컬에서 Pages Functions과 함께 사이트를 실행합니다. 단, 로컬에서 R2 바인딩을 테스트하려면 추가 설정이 필요합니다.

## 7. 문제 해결

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

## 8. 마이그레이션 후 변경 사항

기존 시스템과 비교하여 다음과 같은 변경 사항이 있습니다:

1. API 엔드포인트 변경:
   - 기존: `https://api.ttsg.dev/r2/wiki/{slug}.md`
   - 새로운 경로: `/api/wiki/{slug}`

2. 배포 흐름 변경:
   - 기존: Vercel 배포 + 별도 Cloudflare Worker API
   - 새로운 흐름: Cloudflare Pages로 통합 배포

3. 로컬 개발 흐름:
   - `wrangler pages dev` 명령으로 Pages Functions 포함하여 테스트
