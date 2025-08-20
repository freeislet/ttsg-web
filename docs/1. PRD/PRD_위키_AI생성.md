# 위키 자동 생성 기능 PRD

## 1. 개요

TTSG 웹사이트의 위키 섹션에 AI 기반 자동 콘텐츠 생성 기능을 추가하여 사용자가 원하는 주제에 대한 위키 문서를 자동으로 생성할 수 있도록 합니다.

## 2. 기능 요구사항

### 2.1 핵심 기능

- **주제 입력**: 사용자가 위키 문서로 생성하고 싶은 주제를 입력
- **AI 모델 선택**: 다양한 AI 모델 중 다중 선택 가능 (체크박스 UI)
- **자동 콘텐츠 생성**: 선택된 각 AI 모델별로 개별 위키 콘텐츠 생성
- **노션 저장**: 각 모델별로 별도의 노션 페이지 생성 및 저장
- **결과 표시**: 생성된 모든 문서의 노션 링크 목록 제공

### 2.2 상세 요구사항

#### 2.2.1 사용자 인터페이스

- `/wiki` 페이지에 "생성..." 버튼 추가
- 위키 생성 전용 페이지 (`/wiki/generate`)
- 주제 입력 필드 (텍스트 입력)
- AI 모델 선택 체크박스 (다중 선택 가능):
  - [ ] Gemini Pro
  - [ ] Gemini Flash
  - [ ] ChatGPT-4
  - [ ] ChatGPT-4 Turbo
  - (추후 모델 추가 가능한 확장 구조)
- 생성 버튼
- 진행 상태 표시 (로딩 인디케이터)
- 결과 표시 영역 (생성된 문서 링크)

#### 2.2.2 AI 콘텐츠 생성

- **프롬프트 템플릿**: 위키 문서 형식에 맞는 구조화된 프롬프트
- **다중 모델 지원**: 선택된 모든 모델에 대해 병렬 또는 순차 처리
- **개별 콘텐츠 생성**: 각 모델별로 독립적인 위키 콘텐츠 생성
- **콘텐츠 형식**: 마크다운 형식으로 생성
- **품질 보장**: 일관된 구조와 형식의 위키 문서 생성

#### 2.2.3 노션 통합

- **개별 페이지 저장**: 선택된 각 모델별로 별도의 노션 페이지 생성
- **버전 관리**: Version 필드에 구체적인 모델명 기록
  - "Gemini Pro", "Gemini Flash", "ChatGPT-4", "ChatGPT-4 Turbo" 등
- **동일 제목**: 모든 페이지는 입력된 주제와 동일한 제목 사용
- **모델별 구분**: Version 필드로 각 모델 결과물 구분
- **링크 반환**: 생성된 모든 노션 페이지의 공유 링크 목록 제공

## 3. 사용자 플로우

```
1. 사용자가 /wiki 페이지 방문
2. "생성..." 버튼 클릭
3. 위키 생성 페이지로 이동
4. 주제 입력 (예: "인공지능의 역사")
5. AI 모델 선택 (사용 가능한 모델 중 하나 이상)
6. "생성" 버튼 클릭
7. 로딩 상태 표시 (선택된 모델 수만큼 진행률 표시)
8. 선택된 각 모델별로 AI API 호출 및 콘텐츠 생성
9. 각 모델 결과를 개별 노션 페이지로 저장
10. 생성된 모든 문서 링크 목록 표시
11. 사용자가 각 링크를 통해 모델별 결과 비교 확인
```

## 4. 기술 스펙

### 4.1 프론트엔드

- **페이지**: `/wiki/generate`
- **컴포넌트**:
  - `WikiGenerator.tsx` (메인 생성 컴포넌트)
  - `TopicInput.tsx` (주제 입력)
  - `ModelSelector.tsx` (AI 모델 선택)
  - `GenerationProgress.tsx` (진행 상태)
  - `ResultDisplay.tsx` (결과 표시)

### 4.2 백엔드 API

- **엔드포인트**: `/api/wiki/generate`
- **메서드**: POST
- **요청 형식**:

```json
{
  "topic": "주제명",
  "models": ["gemini-pro", "gemini-flash", "chatgpt-4", "chatgpt-4-turbo"],
  "language": "ko",
  "tags": ["AI", "IT"]
}
```

- **응답 형식**:

```json
{
  "success": true,
  "results": [
    {
      "model": "gemini-pro",
      "notionUrl": "https://notion.so/page1",
      "pageId": "page-id-1",
      "title": "입력된 주제명",
      "version": "Gemini Pro"
    },
    {
      "model": "chatgpt-4",
      "notionUrl": "https://notion.so/page2",
      "pageId": "page-id-2",
      "title": "입력된 주제명",
      "version": "ChatGPT-4"
    }
  ]
}
```

### 4.3 AI 통합 및 아키텍처

#### 4.3.1 추상화 구조
- **IWikiGenerator 인터페이스**: 모든 AI 모델의 공통 인터페이스
  ```typescript
  interface IWikiGenerator {
    generate(topic: string): Promise<WikiContent>;
    getModelName(): string;
    getModelVersion(): string;
  }
  ```
- **구현체 위치**: `/lib/wiki/` 폴더 내 모델별 구현
- **팩토리 패턴**: 모델 선택에 따른 적절한 구현체 생성

#### 4.3.2 모델별 구현체
- **GeminiProGenerator**: `/lib/wiki/gemini-pro.ts`
- **GeminiFlashGenerator**: `/lib/wiki/gemini-flash.ts`
- **ChatGPT4Generator**: `/lib/wiki/chatgpt-4.ts`
- **ChatGPT4TurboGenerator**: `/lib/wiki/chatgpt-4-turbo.ts`

#### 4.3.3 API 통합
- **Gemini API**: Google AI Studio API 사용 (Pro, Flash 등 다양한 모델)
- **ChatGPT API**: OpenAI API 사용 (GPT-4, GPT-4 Turbo 등)
- **모델 확장성**: 새로운 AI 모델 쉽게 추가 가능한 구조
- **프롬프트 템플릿**: 위키 문서 구조에 맞는 체계적인 프롬프트
- **모델별 최적화**: 각 모델 특성에 맞는 프롬프트 조정 가능

### 4.4 노션 통합

- **Notion API**: 페이지 생성 및 콘텐츠 업로드
- **데이터베이스**: 기존 위키 노션 데이터베이스 활용
- **필드 매핑** (각 모델별 개별 페이지):
  - Title: 입력된 주제 (모든 페이지 동일)
  - Content: 해당 모델이 생성한 콘텐츠
  - Version: 구체적인 모델명 ("Gemini Pro", "ChatGPT-4" 등)
  - Language: "ko" (현재 한국어로 고정)
  - Tags: ["AI", "IT"] (노션 기존 태그 중 다중 선택)
  - Created: 노션에서 자동 생성

## 5. 구현 단계

### Phase 1: 기본 구조 구축

- [ ] 위키 생성 페이지 UI 구현
- [ ] 기본 폼 컴포넌트 개발
- [ ] API 엔드포인트 구조 설계

### Phase 2: AI 통합 및 아키텍처 구현

- [ ] IWikiGenerator 인터페이스 정의
- [ ] `/lib/wiki/` 폴더 구조 생성
- [ ] GeminiProGenerator 구현체 개발
- [ ] GeminiFlashGenerator 구현체 개발
- [ ] ChatGPT4Generator 구현체 개발
- [ ] ChatGPT4TurboGenerator 구현체 개발
- [ ] WikiGeneratorFactory 팩토리 클래스 구현
- [ ] 프롬프트 템플릿 개발 및 최적화

### Phase 3: 노션 통합

- [ ] 노션 API 연동
- [ ] 자동 저장 기능 구현
- [ ] Language 필드 "ko" 고정 설정
- [ ] Tags 필드 ["AI", "IT"] 자동 태깅
- [ ] 메타데이터 관리 (Version, Created 등)

### Phase 4: 사용자 경험 개선

- [ ] 로딩 상태 및 진행률 표시
- [ ] 에러 처리 및 사용자 피드백
- [ ] 결과 표시 및 링크 제공

### Phase 5: 테스트 및 최적화

- [ ] 기능 테스트
- [ ] 성능 최적화
- [ ] 사용자 테스트 및 피드백 반영

## 6. 고려사항

### 6.1 보안

- API 키 환경변수 관리
- 사용자 입력 검증 및 sanitization
- Rate limiting 적용

### 6.2 성능

- AI API 응답 시간 최적화
- 동시 요청 처리
- 캐싱 전략 고려

### 6.3 사용자 경험

- 직관적인 UI/UX 디자인
- 명확한 피드백 및 상태 표시
- 에러 상황에 대한 친화적 메시지

### 6.4 확장성

- **모델 확장성**: 새로운 AI 모델 쉽게 추가 가능한 플러그인 구조
- **동일 LLM 내 다중 모델**: 같은 제공업체의 다른 모델 지원 (예: Gemini Pro, Flash)
- **모델 설정 관리**: 각 모델별 개별 설정 및 프롬프트 최적화
- **다양한 콘텐츠 형식 지원**: 마크다운, HTML 등
- **사용자 맞춤 설정**: 선호 모델, 기본 설정 저장
- **모델 성능 비교**: 생성 결과 품질 및 속도 비교 기능

## 7. 성공 지표

- 위키 자동 생성 기능 사용률
- 생성된 콘텐츠의 품질 만족도
- 사용자 피드백 및 재사용률
- 시스템 안정성 및 응답 시간
