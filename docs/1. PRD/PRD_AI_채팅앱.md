# PRD: TTSG AI 채팅 앱

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**TTSG AI Chat** - Gemini API 기반 AI 채팅 애플리케이션

### 1.2 프로젝트 목적
- Gemini API를 활용한 실시간 AI 채팅 서비스 제공
- TTSG 생태계 내에서 AI 기술 활용 사례 구현
- 사용자에게 직관적이고 반응성 높은 채팅 경험 제공

### 1.3 타겟 사용자
- TTSG 사이트 방문자
- AI 기술에 관심 있는 개발자 및 일반 사용자
- 실시간 AI 상담이 필요한 사용자

### 1.4 핵심 가치 제안
- **빠른 응답**: Gemini API의 고성능 AI 모델 활용
- **사용자 친화적**: 직관적인 채팅 인터페이스
- **안정성**: Cloudflare 인프라 기반의 안정적인 서비스
- **확장성**: 향후 다양한 AI 모델 통합 가능한 구조

## 2. 기능 요구사항

### 2.1 핵심 기능

#### 2.1.1 실시간 채팅
- **기능 설명**: 사용자와 AI 간의 실시간 대화
- **세부 요구사항**:
  - 텍스트 메시지 입력 및 전송
  - AI 응답 실시간 스트리밍 표시
  - 메시지 히스토리 관리 (세션 기반)
  - 타이핑 인디케이터 표시

#### 2.1.2 대화 관리
- **기능 설명**: 대화 세션 및 히스토리 관리
- **세부 요구사항**:
  - 새 대화 시작
  - 대화 히스토리 저장 (로컬 스토리지)
  - 대화 내용 초기화
  - 대화 내용 내보내기 (텍스트/JSON)

#### 2.1.3 AI 모델 설정
- **기능 설명**: AI 응답 품질 및 스타일 조정
- **세부 요구사항**:
  - 응답 길이 조절 (짧음/보통/길음)
  - 응답 톤 설정 (친근함/전문적/창의적)
  - 온도(Temperature) 설정 (창의성 조절)
  - 시스템 프롬프트 커스터마이징

### 2.2 부가 기능

#### 2.2.1 사용자 경험 개선
- **다크/라이트 모드**: 사용자 선호에 따른 테마 변경
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **키보드 단축키**: Enter 전송, Shift+Enter 줄바꿈
- **메시지 복사**: 개별 메시지 복사 기능

#### 2.2.2 성능 최적화
- **지연 로딩**: 대화 히스토리 페이지네이션
- **오프라인 지원**: 네트워크 오류 시 재시도 메커니즘
- **캐싱**: 자주 사용되는 응답 캐싱

## 3. 기술 아키텍처

### 3.1 기술 스택
- **프론트엔드**: React Router v7 + React + TypeScript
- **스타일링**: Tailwind CSS v4
- **호스팅**: Cloudflare Workers
- **도메인**: ai-chat.ttsg.space
- **데이터베이스**: Cloudflare D1 (필요시)
- **스토리지**: Cloudflare R2 (파일 업로드 시)

### 3.2 시스템 아키텍처

```
[사용자] 
    ↓
[ai-chat.ttsg.space (서브도메인) - React Router SSR]
    ↓
[Cloudflare Workers]
    ↓
[Gemini API]
```

### 3.3 폴더 구조
```
ai-chat/
├── app/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── MessageBubble.tsx
│   │   ├── Settings/
│   │   │   ├── ModelSettings.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── routes/
│   │   ├── _index.tsx
│   │   └── chat.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSettings.ts
│   │   └── useLocalStorage.ts
│   ├── stores/
│   │   ├── chatStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   └── geminiApi.ts
│   ├── types/
│   │   ├── chat.ts
│   │   └── settings.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── root.tsx
│   └── app.css
├── workers/
│   └── api/
│       └── chat.ts
├── public/
├── wrangler.jsonc
└── package.json
```

## 4. API 설계

### 4.1 채팅 API

#### POST /workers/api/chat
**요청**:
```typescript
interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  settings?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

**응답**:
```typescript
interface ChatResponse {
  message: string;
  timestamp: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**스트리밍 응답**:
```typescript
// Server-Sent Events 형태
data: {"type": "token", "content": "안녕"}
data: {"type": "token", "content": "하세요"}
data: {"type": "done", "usage": {...}}
```

### 4.2 에러 처리
```typescript
interface ApiError {
  error: string;
  code: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_REQUEST';
  message: string;
  retryAfter?: number;
}
```

## 5. 데이터 모델

### 5.1 채팅 메시지
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
  metadata?: {
    tokens?: number;
    model?: string;
    temperature?: number;
  };
}
```

### 5.2 채팅 세션
```typescript
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  settings: ChatSettings;
}
```

### 5.3 사용자 설정
```typescript
interface ChatSettings {
  theme: 'light' | 'dark' | 'auto';
  temperature: number; // 0.0 - 1.0
  maxTokens: number;
  responseLength: 'short' | 'medium' | 'long';
  systemPrompt: string;
  autoSave: boolean;
}
```

## 6. 사용자 인터페이스

### 6.1 레이아웃 구조
```
┌─────────────────────────────────────┐
│ Header (로고, 설정, 테마 토글)        │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────────────────┐ │
│ │ Sidebar │ │ Chat Container      │ │
│ │         │ │ ┌─────────────────┐ │ │
│ │ 대화    │ │ │ Message List    │ │ │
│ │ 히스토리│ │ │                 │ │ │
│ │         │ │ └─────────────────┘ │ │
│ │         │ │ ┌─────────────────┐ │ │
│ │         │ │ │ Message Input   │ │ │
│ │         │ │ └─────────────────┘ │ │
│ └─────────┘ └─────────────────────┘ │
└─────────────────────────────────────┘
```

### 6.2 컴포넌트 상세

#### 6.2.1 MessageBubble
- 사용자/AI 메시지 구분 스타일링
- 타임스탬프 표시
- 복사 버튼
- 로딩 애니메이션 (AI 응답 중)

#### 6.2.2 MessageInput
- 멀티라인 텍스트 입력
- 전송 버튼 (Enter 키 지원)
- 문자 수 제한 표시
- 첨부파일 업로드 (향후 확장)

#### 6.2.3 Settings Panel
- 모델 파라미터 조정 슬라이더
- 시스템 프롬프트 편집기
- 테마 선택
- 데이터 내보내기/가져오기

## 7. 성능 요구사항

### 7.1 응답 시간
- **초기 로딩**: 3초 이내
- **메시지 전송**: 1초 이내 (UI 반응)
- **AI 응답 시작**: 5초 이내
- **스트리밍 지연**: 100ms 이내

### 7.2 처리량
- **동시 사용자**: 100명 (초기 목표)
- **메시지 처리**: 초당 10개 메시지
- **세션 지속**: 1시간 (비활성 시 자동 종료)

### 7.3 가용성
- **업타임**: 99.9% (월 43분 다운타임 허용)
- **에러율**: 1% 이하
- **복구 시간**: 5분 이내

## 8. 보안 요구사항

### 8.1 API 보안
- Gemini API 키는 서버사이드에서만 사용
- Rate limiting: 사용자당 분당 20회 요청
- CORS 설정으로 허용된 도메인만 접근
- 입력 검증 및 XSS 방지

### 8.2 데이터 보안
- 개인정보 수집 최소화
- 대화 내용 로컬 스토리지 저장 (서버 저장 안함)
- HTTPS 강제 사용
- CSP(Content Security Policy) 적용

## 9. 개발 일정

### 9.1 Phase 1: 기본 채팅 기능 (2주)
- [x] 프로젝트 셋업 및 기본 구조
- [ ] 채팅 UI 컴포넌트 개발
- [ ] Gemini API 연동
- [ ] 기본 메시지 송수신 기능

### 9.2 Phase 2: 고급 기능 (2주)
- [ ] 스트리밍 응답 구현
- [ ] 대화 히스토리 관리
- [ ] 설정 패널 구현
- [ ] 반응형 디자인 적용

### 9.3 Phase 3: 최적화 및 배포 (1주)
- [ ] 성능 최적화
- [ ] 에러 처리 강화
- [ ] 테스트 작성
- [ ] 프로덕션 배포

### 9.4 Phase 4: 추가 기능 (1주)
- [ ] 다크 모드 구현
- [ ] 키보드 단축키
- [ ] 데이터 내보내기
- [ ] 사용자 피드백 수집

## 10. 성공 지표

### 10.1 기술적 지표
- **응답 시간**: 평균 3초 이내
- **에러율**: 1% 이하
- **사용자 만족도**: 4.0/5.0 이상
- **페이지 로딩 속도**: 2초 이내

### 10.2 비즈니스 지표
- **일간 활성 사용자**: 50명 (1개월 후)
- **평균 세션 시간**: 10분 이상
- **재방문율**: 30% 이상
- **기능 사용률**: 핵심 기능 80% 이상

## 11. 위험 요소 및 대응 방안

### 11.1 기술적 위험
- **API 제한**: Gemini API 할당량 초과
  - *대응*: 사용량 모니터링 및 알림 시스템
- **성능 이슈**: 대량 트래픽 시 응답 지연
  - *대응*: CDN 캐싱 및 로드 밸런싱
- **보안 취약점**: API 키 노출 위험
  - *대응*: 환경 변수 관리 및 정기 보안 감사

### 11.2 비즈니스 위험
- **사용자 채택률 저조**: 예상보다 낮은 사용률
  - *대응*: 사용자 피드백 수집 및 기능 개선
- **비용 초과**: API 사용량 증가로 인한 비용 부담
  - *대응*: 사용량 제한 및 비용 모니터링

## 12. 향후 확장 계획

### 12.1 단기 확장 (3개월)
- 다중 AI 모델 지원 (GPT, Claude 등)
- 음성 입력/출력 기능
- 파일 업로드 및 분석 기능
- 대화 공유 기능

### 12.2 중장기 확장 (6개월)
- 사용자 계정 시스템
- 대화 내용 클라우드 동기화
- AI 어시스턴트 커스터마이징
- 팀 협업 기능

---

**문서 버전**: 1.1  
**작성일**: 2025-09-05  
**최종 수정일**: 2025-09-08  
**작성자**: TTSG 개발팀  
**승인자**: [승인자명]  
**다음 리뷰 예정일**: 2025-09-15
