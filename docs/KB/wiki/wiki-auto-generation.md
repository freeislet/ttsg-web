# 위키 자동 생성 시스템 완전 가이드

## 개요

TTSG 프로젝트의 AI 위키 자동 생성 시스템에 대한 완전한 가이드입니다. 이 시스템은 사용자가 입력한 주제에 대해 여러 AI 모델(Gemini, ChatGPT)을 활용하여 위키 문서를 자동 생성하고 노션에 저장하는 기능을 제공합니다.

## 1. 필요한 패키지 설치

### 1.1 AI 모델 패키지

```bash
# Google Gemini API
pnpm add @google/generative-ai

# OpenAI API
pnpm add openai

# 타입 정의 (개발용)
pnpm add -D @types/node
```

### 1.2 기존 패키지 확인

다음 패키지들이 이미 설치되어 있는지 확인하세요:

```bash
# Notion API (이미 설치됨)
@notionhq/client

# Iconify (이미 설치됨)
@iconify/react

# React (이미 설치됨)
react
```

## 2. 환경변수 설정

### 2.1 .env 파일 생성

`/apps/web/.env` 파일에 다음 환경변수를 추가하세요:

```env
# 기존 노션 설정 (이미 있음)
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id

# Google Gemini API 설정
GEMINI_API_KEY=your_gemini_api_key

# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key
```

### 2.2 API 키 발급 방법

#### Google Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키를 복사하여 `GEMINI_API_KEY`에 설정

#### OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/api-keys) 방문
2. OpenAI 계정으로 로그인
3. "Create new secret key" 클릭
4. 생성된 API 키를 복사하여 `OPENAI_API_KEY`에 설정

## 3. 노션 데이터베이스 설정

### 3.1 필수 속성 확인

기존 노션 데이터베이스에 다음 속성들이 있는지 확인하세요:

- **Name** (Title): 페이지 제목
- **Version** (Rich Text): AI 모델 버전 정보
- **Language** (Select): 언어 설정 (ko, en)
- **Tags** (Multi-select): 태그 (AI, IT 등)
- **Created** (Created time): 생성 시간
- **Last Updated** (Last edited time): 최종 수정 시간

### 3.2 Tags 속성 설정

Tags 속성에 다음 옵션들을 미리 추가해주세요:

- AI
- IT
- 기술
- 개발
- 기타

## 4. 시스템 아키텍처

### 4.1 전체 구조

위키 자동 생성 시스템은 다음과 같은 구조로 구성되어 있습니다:

- **프론트엔드**: React 기반 사용자 인터페이스
- **백엔드 API**: Astro API 엔드포인트
- **AI 서비스**: Gemini, ChatGPT API 통합
- **데이터 저장**: Notion API를 통한 위키 페이지 생성

### 4.2 주요 컴포넌트

#### 사용자 인터페이스
- `WikiGenerate.tsx`: 메인 위키 생성 폼 (React Hook Form + Zod 검증)
- `TopicInput.tsx`: 주제 입력 컴포넌트
- `ModelSelector.tsx`: AI 모델 다중 선택 컴포넌트
- `InstructionInput.tsx`: 사용자 정의 지침 입력
- `LanguageSelector.tsx`: 언어 선택 (한국어/영어)
- `TagSelector.tsx`: 태그 다중 선택
- `GenerationProgress.tsx`: 생성 진행 상태 표시
- `ResultDisplay.tsx`: 생성 결과 및 노션 링크 표시

#### AI 모델 관리
- `models.ts`: AI 모델 메타데이터 및 색상 정보
- `colors.ts`: 모델별 색상 클래스 정의
- `types.ts`: AI 모델 타입 정의

### 4.3 프로젝트 파일 구조

```
apps/web/src/
├── components/wiki/
│   ├── Wiki.tsx (수정됨 - 생성 버튼 추가)
│   ├── WikiGenerate.tsx (React Hook Form 기반)
│   ├── TopicInput.tsx
│   ├── ModelSelector.tsx
│   ├── InstructionInput.tsx
│   ├── LanguageSelector.tsx
│   ├── TagSelector.tsx
│   ├── GenerationProgress.tsx
│   └── ResultDisplay.tsx
├── lib/ai/
│   ├── index.ts (통합 export)
│   ├── types.ts (AI 모델 타입)
│   ├── models.ts (모델 메타데이터)
│   └── colors.ts (색상 클래스)
├── pages/
│   ├── wiki.astro
│   └── wiki/
│       └── generate.astro
├── pages/api/wiki/
│   └── generate.ts
└── types/
    └── wiki.ts
```

## 5. 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev

# 또는 특정 앱만 실행
cd apps/web
pnpm dev
```

## 6. 구현된 기능

### 6.1 사용자 인터페이스
- ✅ `/wiki` 페이지에 "생성..." 버튼 추가
- ✅ 위키 생성 전용 페이지 (`/wiki/generate`) 구현
- ✅ React Hook Form + Zod를 활용한 폼 검증
- ✅ 실시간 입력 검증 및 에러 표시
- ✅ 반응형 디자인 (모바일 최적화)

### 6.2 입력 필드
- ✅ **주제 입력**: 필수 입력, 최대 200자 제한
- ✅ **AI 모델 선택**: 다중 선택 가능 (최소 1개)
  - GPT-5, GPT-5 Mini, GPT-5 Nano
  - Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite
- ✅ **사용자 정의 지침**: 선택 입력, 최대 500자 제한
- ✅ **언어 선택**: 한국어/영어 선택
- ✅ **태그 선택**: 다중 선택 (AI, IT, 개발, 기술, 비즈니스)

### 6.3 AI 모델 통합
- ✅ 모델별 색상 구분 및 아이콘 표시
- ✅ 선택 상태에 따른 시각적 피드백
- ✅ 모델 메타데이터 중앙 관리

### 6.4 노션 통합
- ✅ 선택된 각 모델별로 개별 노션 페이지 생성
- ✅ 메타데이터 자동 설정:
  - **Version**: 사용된 AI 모델명
  - **Language**: 선택된 언어 (ko/en)
  - **Tags**: 선택된 태그들
  - **Created**: 자동 생성 시간

### 6.5 사용자 플로우
1. **접근**: `/wiki` 페이지에서 "생성..." 버튼 클릭
2. **입력**: 주제, 모델, 지침, 언어, 태그 설정
3. **검증**: 실시간 폼 유효성 검사
4. **생성**: 선택된 모델별로 병렬 위키 생성
5. **진행**: 실시간 생성 상태 표시
6. **저장**: 각 모델 결과를 개별 노션 페이지로 저장
7. **결과**: 생성된 노션 페이지 링크 목록 제공

## 7. 기능 테스트

### 7.1 기본 접근
1. 브라우저에서 `http://localhost:4321/wiki` 접속
2. "생성..." 버튼 클릭
3. 위키 생성 페이지로 이동 확인

### 7.2 위키 생성 테스트
1. **주제 입력**: "인공지능의 역사" 입력
2. **모델 선택**: GPT-5, Gemini 2.5 Pro 선택
3. **지침 입력**: "초보자도 이해하기 쉽게 설명해주세요" (선택사항)
4. **언어 선택**: 한국어 선택
5. **태그 선택**: AI, IT 태그 선택
6. **생성 실행**: "위키 생성하기" 버튼 클릭
7. **진행 확인**: 각 모델별 생성 상태 확인
8. **결과 확인**: 완료 후 노션 링크 확인

### 7.3 폼 검증 테스트
- 빈 주제로 제출 시 에러 메시지 확인
- 모델 미선택 시 에러 메시지 확인
- 지침 500자 초과 시 에러 메시지 확인
- 실시간 문자 수 카운터 동작 확인

## 8. 문제 해결

### 8.1 일반적인 오류

#### API 키 관련 오류
```
Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.
```
**해결방법**: `.env` 파일에 올바른 API 키가 설정되어 있는지 확인

#### 노션 연결 오류
```
Error: 노션 페이지 생성 중 오류가 발생했습니다
```
**해결방법**: 
- 노션 API 키 확인
- 데이터베이스 ID 확인
- 데이터베이스 속성 설정 확인

#### 모듈 찾을 수 없음 오류
```
Cannot find module '@google/generative-ai'
```
**해결방법**: 
```bash
pnpm add @google/generative-ai
```

### 8.2 디버깅

개발자 도구 콘솔에서 다음과 같은 로그를 확인할 수 있습니다:

```
GPT-5 모델로 위키 생성 시작: 인공지능의 역사
GPT-5 위키 생성 완료, 노션에 저장 중...
GPT-5 노션 저장 완료: https://notion.so/...
```

## 9. 기술 스택 및 아키텍처

### 9.1 기술 스택
- **프론트엔드**: Astro, React, TypeScript, Tailwind CSS
- **폼 관리**: React Hook Form + Zod 검증
- **AI 모델**: Google Gemini (Pro, Flash, Flash Lite), OpenAI GPT-5 (Standard, Mini, Nano)
- **데이터베이스**: Notion API
- **아키텍처**: 모듈화된 컴포넌트 구조, 중앙집중식 상태 관리

### 9.2 핵심 설계 원칙
- **타입 안전성**: TypeScript와 Zod를 통한 컴파일/런타임 검증
- **모듈화**: 컴포넌트별 단일 책임 원칙
- **재사용성**: 색상 클래스 및 모델 메타데이터 중앙 관리
- **확장성**: 새로운 AI 모델 추가 용이성

## 10. 배포 시 고려사항

### 10.1 환경변수 설정
배포 환경에서도 모든 API 키가 올바르게 설정되어 있는지 확인하세요.

### 10.2 API 사용량 모니터링
- Google Gemini API: [Google AI Studio](https://makersuite.google.com/)
- OpenAI API: [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### 10.3 보안 고려사항
- ✅ API 키는 서버사이드에서만 사용
- ✅ 사용자 입력 검증 및 sanitization
- ✅ 에러 메시지 보안 처리
- 🔄 Rate limiting (향후 구현 권장)

### 10.4 성능 최적화
- ✅ 다중 모델 병렬 처리
- ✅ 에러 발생 시 부분 성공 지원
- ✅ React Hook Form을 통한 효율적인 폼 관리
- 🔄 결과 캐싱 (향후 구현 권장)

## 11. 확장 가능성

### 11.1 새로운 AI 모델 추가
1. `/lib/ai/models.ts`에 새 모델 메타데이터 추가
2. `/lib/ai/colors.ts`에 색상 클래스 추가 (필요시)
3. `/lib/ai/types.ts`에 타입 정의 추가
4. API 엔드포인트에서 새 모델 지원 추가

### 11.2 새로운 입력 필드 추가
1. Zod 스키마에 새 필드 정의
2. 해당 입력 컴포넌트 생성
3. `WikiGenerate.tsx`에 Controller 추가
4. API에서 새 필드 처리 로직 추가

### 11.3 향후 개선 사항
- 사용자 맞춤 프롬프트 템플릿
- 생성 결과 품질 평가 시스템
- 실시간 생성 과정 스트리밍
- 모바일 앱 지원

## 12. 지원 및 문의

문제가 발생하거나 추가 기능이 필요한 경우, 개발팀에 문의해주세요.

---

## 변경 이력

- **2025-08-24**: React Hook Form + Zod 통합, 색상 클래스 분리, 새로운 입력 필드 추가
- **2025-08-XX**: 초기 위키 자동 생성 시스템 구현
