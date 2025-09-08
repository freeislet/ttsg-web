# TTSG AI Chat

Gemini API 기반 실시간 AI 채팅 애플리케이션입니다. React Router와 Cloudflare Workers를 활용하여 빠르고 안정적인 AI 대화 경험을 제공합니다.

## 🚀 주요 기능

- **실시간 AI 채팅**: Gemini API를 활용한 고품질 AI 응답
- **스트리밍 응답**: 실시간으로 AI 응답을 받아볼 수 있는 스트리밍 기능
- **대화 관리**: 세션 기반 대화 히스토리 관리 및 로컬 저장
- **설정 커스터마이징**: AI 모델 파라미터 및 응답 스타일 조정
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **다크/라이트 모드**: 사용자 선호에 따른 테마 변경

## 🛠 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Cloudflare Workers + Durable Objects
- **AI API**: Google Gemini API
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Deployment**: Cloudflare Workers

## 🏗 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- pnpm (권장) 또는 npm
- Cloudflare 계정 및 API 토큰

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm run dev

# 타입 체크
pnpm run typecheck

# 프로덕션 빌드
pnpm run build

# Cloudflare Workers 배포
pnpm run deploy
```

## 🔧 환경 변수 설정

Cloudflare Workers에서 다음 환경 변수를 설정해야 합니다:

```bash
# Gemini API 키
GEMINI_API_KEY=your_gemini_api_key_here

# 기타 설정 (선택사항)
RATE_LIMIT_PER_MINUTE=20
MAX_TOKENS=1000
```

## 📁 프로젝트 구조

```
apps/ai-chat/
├── app/                    # React Router 앱
│   ├── routes/            # 라우트 컴포넌트
│   ├── components/        # 재사용 가능한 컴포넌트
│   └── styles/           # 스타일 파일
├── workers/              # Cloudflare Workers 코드
│   ├── app.ts           # 메인 워커 파일
│   └── api/             # API 핸들러
├── public/              # 정적 파일
└── wrangler.jsonc       # Cloudflare 설정
```

## 🚀 배포

이 프로젝트는 Cloudflare Workers에 자동 배포됩니다:

1. **GitHub 연동**: 메인 브랜치에 푸시하면 자동 배포
2. **수동 배포**: `pnpm run deploy` 명령어 사용
3. **프리뷰 배포**: Pull Request 생성 시 자동 프리뷰 생성

## 🔗 관련 링크

- **라이브 데모**: [ai-chat.ttsg.space](https://ai-chat.ttsg.space)
- **프로젝트 문서**: [TTSG AI Chat PRD](../../docs/1.%20PRD/PRD_AI_채팅앱.md)
- **React Router 문서**: [reactrouter.com](https://reactrouter.com/)
- **Cloudflare Workers 문서**: [developers.cloudflare.com](https://developers.cloudflare.com/workers/)

---

**TTSG 생태계**의 일부로 개발된 AI 채팅 애플리케이션입니다.
