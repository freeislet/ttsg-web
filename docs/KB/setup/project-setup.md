# TTSG 프로젝트 셋업 가이드

본 문서는 TTSG(통통 스터디 그룹) 웹사이트의 설정 및 구조에 관한 정보를 제공합니다.

## 1. 프로젝트 개요

TTSG 웹사이트는 AI 및 소프트웨어 개발 관련 정보, 예제, 위키 문서를 공유하는 플랫폼입니다. 주요 특징은 다음과 같습니다:

- **프레임워크**: [Astro](https://astro.build/)
- **패키지 관리**: `pnpm workspace` 기반 모노레포
- **배포**:
  - 메인 앱: Vercel
  - 예제 앱 및 일부 위키 콘텐츠: Cloudflare R2

## 2. 프로젝트 구조

```
ttsg/
├── apps/
│   ├── web/                # 메인 Astro 사이트 (블로그 + 위키)
│   └── react1/             # React 예제 앱
├── apps-r2/
│   └── ai1/                # AI 데모 앱 (Cloudflare R2 배포)
├── packages/
│   └── shared/             # 공통 컴포넌트 및 유틸리티
├── docs/                   # 프로젝트 문서
├── pnpm-workspace.yaml     # 워크스페이스 구성
└── package.json            # 루트 패키지 정의
```

## 3. 주요 설정 파일

### 3.1 루트 디렉토리

- **pnpm-workspace.yaml**: 워크스페이스 패키지 지정

  ```yaml
  packages:
    - apps/*
    - packages/*
  onlyBuiltDependencies:
    - esbuild
  ```

- **package.json**: 루트 패키지 설정 및 스크립트

  ```json
  {
    "name": "ttsg",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "dev": "pnpm --filter web dev",
      "build": "pnpm --filter web build"
    },
    "devDependencies": {
      "eslint": "^8.57.1",
      "prettier": "^3.0.3",
      "prettier-plugin-astro": "^0.12.2"
    }
  }
  ```

- **.eslintrc.js**: 코드 린팅 규칙
- **.prettierrc**: 코드 포맷팅 설정

### 3.2 Astro 앱 (apps/web)

- **package.json**: Astro 의존성 및 스크립트
- **astro.config.mjs**: Astro 설정 (SSR, 통합 등)
- **tailwind.config.mjs**: Tailwind CSS 설정

### 3.3 React 앱 (apps/react1)

- **package.json**: React 의존성 및 스크립트
- **vite.config.ts**: Vite 빌드 설정
- **tsconfig.json**: TypeScript 설정

## 4. 핵심 기능

### 4.1 위키 시스템

위키 콘텐츠는 두 가지 방식으로 제공됩니다:

1. **로컬 마크다운 파일**:
   - 위치: `apps/web/src/content/wiki/*.md`
   - Astro Content Collections을 통해 관리

2. **Cloudflare R2 저장소**:
   - 외부 저장소에서 동적으로 가져오는 마크다운 콘텐츠
   - SSR을 통해 렌더링

#### 위키 페이지 라우팅

- `/wiki`: 위키 인덱스 페이지
- `/wiki/[slug]`: 개별 위키 문서 페이지

### 4.2 공유 컴포넌트 패키지

`packages/shared`는 여러 앱에서 재사용 가능한 UI 컴포넌트와 유틸리티를 제공합니다:

- **Button**: 다양한 스타일 및 크기 옵션을 가진 버튼 컴포넌트
- **Card**: 콘텐츠 표시를 위한 카드 컴포넌트
- **formatDate**: 날짜 포맷팅 유틸리티 (한국어 지원)

## 5. 개발 시작하기

### 5.1 사전 요구사항

- Node.js 18+
- pnpm 8+

### 5.2 설치 및 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev  # 메인 Astro 앱 실행
pnpm --filter react1 dev  # React 예제 앱 실행
```

## 6. 알려진 이슈 및 해결책

### 6.1 의존성 경고

pnpm install 시 다음 경고가 발생할 수 있습니다:

1. **Deprecated 패키지**:
   - eslint@8.57.1
   - tsup@7.3.0
   - 기타 하위 의존성 5개

2. **Peer 의존성 불일치**:
   - @astrojs/mdx와 @astrojs/node가 astro v4를 요구하지만 설치된 버전은 v5.12.3

### 6.2 해결책

1. **Astro 통합 패키지 업데이트**:

   ```bash
   pnpm add @astrojs/mdx@latest @astrojs/node@latest @astrojs/tailwind@latest
   ```

2. **esbuild 빌드 스크립트 승인**:

   ```bash
   pnpm approve-builds
   ```

3. **pnpm-workspace.yaml에 빌드 스크립트 허용 추가**:
   ```yaml
   onlyBuiltDependencies:
     - esbuild
   ```
