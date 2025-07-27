# TTSG (통통 스터디 그룹) 웹사이트

AI 및 소프트웨어 개발 관련 정보, 예제, 위키 문서를 공유하는 웹사이트입니다.

## 🧾 프로젝트 개요

- **사이트 이름**: TTSG (통통 스터디 그룹)
- **목표**: AI 및 소프트웨어 개발 관련 정보, 예제, 위키 문서를 공유
- **프레임워크**: [Astro](https://astro.build/)
- **패키지 관리 / 구조**: `pnpm workspace` 기반 모노레포
- **배포**: Vercel (메인 앱), Cloudflare R2 (예제 앱 및 일부 위키 콘텐츠)

## 📁 프로젝트 구조

```
apps/
├── web/               # 메인 Astro 사이트 (블로그 + 위키 포함)
├── react1/            # 예제 앱 1 (React 등 정적 빌드 앱)
apps-r2/               # Cloudflare R2에 배포되는 앱
├── ai1/               # AI 데모 앱
packages/
├── shared/            # 공통 컴포넌트 또는 유틸리티
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- pnpm 8+

### 설치 및 개발 서버 실행

1. 저장소 클론
```bash
git clone <repository-url>
cd ttsg
```

2. 의존성 설치
```bash
pnpm install
```

3. 개발 서버 실행
```bash
# 메인 웹 앱 실행
pnpm dev

# 특정 앱 실행
pnpm --filter react1 dev
```

## 📚 주요 기능

### 위키

- Markdown 기반의 문서 관리
- 로컬 콘텐츠 또는 Cloudflare R2 저장소에서 문서 가져오기
- 동적 라우팅을 통한 위키 페이지 접근

### 블로그

- 기술 아티클 및 스터디 그룹 소식 공유
- Markdown/MDX 기반의 콘텐츠 작성

### 예제 앱

- 다양한 프레임워크로 구현된 예제 애플리케이션
- Vercel 또는 Cloudflare R2에 배포

## 🛠️ 기술 스택

- **프론트엔드**: Astro, React, Tailwind CSS
- **패키지 관리**: pnpm workspace (모노레포)
- **배포**: Vercel, Cloudflare R2
- **콘텐츠 관리**: Markdown, MDX

## 🔄 기여 방법

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 제출합니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
