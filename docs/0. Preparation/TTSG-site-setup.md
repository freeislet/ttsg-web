# TTSG 스터디 그룹 사이트 아키텍처 계획

## 🧾 개요

- **사이트 이름**: TTSG (통통 스터디 그룹)
- **목표**: AI 및 소프트웨어 개발 관련 정보, 예제, 위키 문서를 공유하는 웹사이트 운영
- **프레임워크**: [Astro](https://astro.build/)
- **패키지 관리 / 구조**: `pnpm workspace` 기반 모노레포
- **배포**: Vercel (메인 앱), Cloudflare R2 (예제 앱 및 일부 위키 콘텐츠)

---

## 📁 프로젝트 구조

```
apps/
├── web/               # 메인 Astro 사이트 (블로그 + 위키 포함)
├── react1/            # 예제 앱 1 (React 등 정적 빌드 앱)
apps-r2/               # Cloudflare R2에 배포되는 앱
├── ai1/               # AI 데모 앱
packages/
├── shared/            # 공통 컴포넌트 또는 유틸
```

---

## 🌐 라우팅 구성

| 경로          | 설명                               | 제공 위치           |
| ------------- | ---------------------------------- | ------------------- |
| `/`           | TTSG 메인 페이지                   | Vercel (`apps/web`) |
| `/blog/*`     | 기술 아티클 (markdown 기반 블로그) | Vercel              |
| `/wiki/*`     | 위키 스타일 정리된 정보            | Vercel or R2        |
| `/app/react1` | 예제 앱 (React 등)                 | Vercel              |
| `/app/ai1`    | AI 데모                            | Cloudflare R2       |

---

## 🚀 배포 전략

### 메인 사이트 (Astro)

- **위치**: `apps/web`
- **배포 대상**: Vercel에 등록
- **루트 디렉토리**: `apps/web`
- **빌드 명령어**: `pnpm build`
- **출력 디렉토리**: `dist/`
- **배포 대상 콘텐츠**:
  - 메인 페이지
  - 블로그
  - 일부 wiki 페이지 (정적 포함)

### 예제 앱 / 위키 일부 페이지

- **배포 대상**: Cloudflare R2
- **업로드 방식**:
  - GitHub Actions or CLI 사용
  - 각 예제 앱 정적 빌드 후 `dist/` 업로드
- **접근 방식**:
  - Astro에서 iframe 또는 링크 연결
  - 또는 Astro SSR 시 fetch 후 렌더링

---

## ⚙️ 기술 설정 요약

### `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

### 루트 `package.json`

```json
{
  "name": "ttsg-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build"
  }
}
```

### Vercel 프로젝트 설정

- **루트 디렉토리**: apps/web
- **Build Command**: pnpm build
- **Output Directory**: dist/

---

## 📚 위키 구현 방식 (2가지 옵션)

1. Astro content collection 기반

- 정적 .md or .mdx 파일 작성
- /wiki/[slug].astro에서 content 불러와 페이지 구성

2. R2에 저장된 문서 fetch

- Astro SSR 또는 클라이언트 측 fetch
- 외부에서 수정 가능한 구조 (Git 또는 CMS로 연동 가능)

---

## ☁️ Cloudflare R2 연동 예시

- static.ttsg.dev (R2와 연결된 CDN 도메인)
- 예시:
  - https://static.ttsg.dev/examples/vue-app/index.html
  - https://static.ttsg.dev/wiki/ai-overview.md

---

## ✅ 향후 작업 목록

- 초기 pnpm workspace 및 Astro 템플릿 생성
- Cloudflare R2 업로드 스크립트 준비
- /wiki/[slug].astro 라우팅 + fetch/render 설정
- 예제 앱 iframe/링크 방식 연결
- Vercel에 메인 Astro 앱 배포 설정 완료
