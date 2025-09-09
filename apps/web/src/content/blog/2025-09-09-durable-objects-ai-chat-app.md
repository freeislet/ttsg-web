---
title: "Durable Objects를 활용한 AI 채팅 앱 구현"
description: "Cloudflare Durable Objects를 활용하여 지연시간을 최소화하는 AI 채팅 앱을 구현하는 방식을 소개합니다."
pubDate: 2025-09-09
category: "dev"
tags: ["durable-objects", "ai-chat", "real-time", "cloudflare", "websocket", "serverless"]
author: "TTSG"
heroImage: "https://cf-assets.www.cloudflare.com/zkvhlag99gkb/7mcw3kQ2ZM9rODjsZIfG8B/0b891f4a1b7e93a3b87e06e45307fb87/BDES-1018_Cloudflare_Object_Workers_Birthday_Week_Blog_Hero.png"
featured: true
draft: false
---

실시간 애플리케이션을 구축할 때 가장 큰 도전 과제 중 하나는 **상태 관리**와 **확장성**입니다. 기존의 서버 기반 아키텍처는 복잡한 인프라 관리와 높은 운영 비용을 요구하며, 사용자가 증가할수록 성능 병목이 발생하기 쉽습니다.

이 글에서는 Cloudflare의 **Durable Objects**를 활용하여 이러한 문제들을 어떻게 해결할 수 있는지, 그리고 기존 아키텍처와 비교했을 때 어떤 장점이 있는지 살펴보겠습니다.

## Durable Objects란 무엇인가?

Durable Objects는 Cloudflare Workers의 확장 기능으로, **컴퓨팅과 스토리지를 하나로 결합한 특별한 서버리스 컴퓨팅 환경**입니다. 일반적인 Workers와 달리 다음과 같은 고유한 특징을 가집니다:

### 핵심 특징

1. **전역 고유 식별자**: 각 Durable Object는 전 세계에서 유일한 ID를 가지며, 어디서든 특정 객체에 요청을 보낼 수 있습니다.
2. **강력한 일관성**: 각 객체는 자체적인 영구 스토리지(최대 10GB)를 가지며, 트랜잭션과 강력한 일관성을 보장합니다.
3. **단일 스레드 동시성**: 웹 브라우저와 같은 협력적 멀티태스킹 모델을 사용하여 안전하고 정확한 상태 관리를 제공합니다.
4. **자동 확장**: 수백만 개의 객체를 탄력적으로 생성하고 관리할 수 있으며, 인프라 관리가 필요 없습니다.

### 객체 생명주기 (Lifecycle)

Durable Objects의 각 객체는 요청에 따라 동적으로 생성되고, 비활성 상태가 지속되면 자동으로 정리됩니다. Durable Objects의 생명주기는 다음과 같습니다:

![Durable Objects Lifecycle](https://developers.cloudflare.com/_astro/lifecycle-of-a-do.C3BLS8lH_Z2nkrrY.webp)

**생명주기 단계:**

1. **객체 생성**: 첫 번째 요청이 들어올 때 객체가 인스턴스화됩니다
2. **활성 상태**: 요청을 처리하고 상태를 메모리에 유지합니다
3. **비활성 상태**: 요청이 없으면 객체가 대기 상태로 전환됩니다
4. **자동 정리**: 장시간 비활성 상태가 지속되면 메모리에서 제거됩니다
5. **상태 복원**: 새로운 요청이 오면 저장된 상태를 기반으로 객체가 재생성됩니다

이러한 생명주기 관리 덕분에 개발자는 인프라 관리에 신경 쓰지 않고도 확장 가능한 애플리케이션을 구축할 수 있습니다.

### 주요 기능들

Durable Objects의 핵심은 상태와 컴퓨팅을 하나의 객체 안에서 관리하는 것입니다. 각 객체는 고유한 ID를 가지며, 전 세계 어디서든 해당 객체에 직접 요청을 보낼 수 있습니다. 이는 기존의 로드밸런서나 세션 관리 없이도 특정 사용자나 리소스와 연결된 상태를 일관되게 유지할 수 있음을 의미합니다.

아래 예시는 AI 채팅방을 구현한 Durable Object 클래스입니다. 이 클래스는 WebSocket 연결을 관리하고, 채팅 히스토리를 영구 저장하며, 여러 사용자 간의 실시간 메시지 교환을 처리합니다:

```typescript
// Durable Object 클래스 예시
export class ChatRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket> = new Map();
  
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
  }
  
  // WebSocket 연결 처리
  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    
    // 세션 관리 및 메시지 브로드캐스트
    this.handleSession(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  
  // 인메모리 상태와 영구 스토리지 활용
  private async handleSession(websocket: WebSocket) {
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, websocket);
    
    // 채팅 히스토리 로드
    const history = await this.state.storage.get("chat_history") || [];
    websocket.send(JSON.stringify({ type: "history", data: history }));
  }
}
```

## 기존 아키텍처와의 비교

### 전통적인 서버 기반 아키텍처

기존의 AI 채팅 앱은 다음과 같은 구조를 가집니다:

```
클라이언트 → 로드밸런서 → 웹서버 → Redis/DB → AI API
```

**주요 문제점:**
- 복잡한 세션 관리 (Sticky Sessions 필요)
- Redis 등 외부 상태 저장소 의존성
- 수평 확장 시 복잡한 로드 밸런싱
- 높은 인프라 운영 비용

### Durable Objects 기반 아키텍처

```
클라이언트 → Cloudflare Edge → Durable Object → AI API
```

**핵심 장점:**
- 상태와 컴퓨팅 결합
- 외부 데이터베이스 불필요
- 자동 확장 및 지리적 분산
- 단순화된 아키텍처

## 레이턴시 성능 비교

### 기존 아키텍처의 레이턴시 요소

1. **클라이언트 → 로드밸런서**: 10-50ms
2. **로드밸런서 → 웹서버**: 5-20ms  
3. **웹서버 → Redis 조회**: 1-5ms
4. **Redis → 데이터베이스**: 5-15ms
5. **총 레이턴시**: **21-90ms**

### Durable Objects 아키텍처

1. **클라이언트 → Cloudflare Edge**: 5-30ms
2. **Edge → Durable Object**: 0-10ms (같은 데이터센터)
3. **인메모리 상태 접근**: <1ms
4. **총 레이턴시**: **6-41ms**

**성능 개선**: 평균 **50-60% 레이턴시 감소**

## AI 채팅 앱 구현 아키텍처

### 1. 채팅방 관리

실제 AI 채팅 앱에서 가장 중요한 부분은 채팅방의 상태를 효율적으로 관리하는 것입니다. 각 채팅방은 독립적인 Durable Object로 구현되며, 다음과 같은 책임을 가집니다:

- **참가자 관리**: 현재 접속한 사용자들의 WebSocket 연결을 추적
- **메시지 히스토리**: 대화 내용을 영구 저장소에 보관
- **AI 컨텍스트 유지**: AI 모델이 이전 대화를 기억할 수 있도록 컨텍스트 관리
- **실시간 브로드캐스트**: 새로운 메시지를 모든 참가자에게 즉시 전달

이러한 기능들이 하나의 객체 안에서 통합 관리되기 때문에, 복잡한 동기화 로직 없이도 일관된 상태를 유지할 수 있습니다:

```typescript
export class AIChatRoom {
  private participants: Map<string, WebSocket> = new Map();
  private messageHistory: ChatMessage[] = [];
  private aiContext: AIContext = new AIContext();
  
  async handleMessage(message: ChatMessage) {
    // 1. 메시지 저장
    await this.state.storage.put(`msg_${Date.now()}`, message);
    
    // 2. AI 응답 생성
    const aiResponse = await this.generateAIResponse(message);
    
    // 3. 모든 참가자에게 브로드캐스트
    this.broadcast({
      type: 'ai_response',
      data: aiResponse,
      timestamp: Date.now()
    });
  }
  
  private async generateAIResponse(message: ChatMessage) {
    // AI API 호출 (Gemini, OpenAI 등)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: this.aiContext.getMessages(),
        stream: true
      })
    });
    
    return this.handleStreamResponse(response);
  }
}
```

### 2. 스트리밍 응답 처리

AI 모델의 응답을 실시간으로 스트리밍하는 것은 사용자 경험에 매우 중요합니다. 사용자는 AI가 답변을 생성하는 과정을 실시간으로 볼 수 있어 더 자연스러운 대화 경험을 얻을 수 있습니다.

Durable Objects에서는 AI API로부터 받은 스트림 데이터를 실시간으로 파싱하고, 각 토큰을 즉시 연결된 모든 클라이언트에게 브로드캐스트할 수 있습니다. 이 과정에서 중요한 점은:

- **청크 단위 처리**: AI API에서 오는 데이터를 작은 단위로 나누어 처리
- **실시간 전송**: 각 토큰이 생성되는 즉시 클라이언트에게 전송
- **에러 핸들링**: 스트림 중단이나 파싱 오류에 대한 적절한 처리
- **상태 동기화**: 모든 참가자가 동일한 AI 응답을 실시간으로 확인

```typescript
private async handleStreamResponse(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          
          if (content) {
            // 실시간 스트리밍
            this.broadcast({
              type: 'ai_stream',
              content: content,
              timestamp: Date.now()
            });
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}
```

### 3. WebSocket Hibernation 활용

Cloudflare의 WebSocket Hibernation은 비용 최적화를 위한 핵심 기능입니다. 일반적으로 WebSocket 연결은 지속적으로 CPU 시간을 소모하지만, Hibernation을 사용하면 비활성 상태의 연결에 대해서는 과금이 중단됩니다.

이 기능의 핵심 아이디어는 다음과 같습니다:

- **자동 절전**: 메시지가 없는 동안 WebSocket 연결이 "잠들어" 있는 상태
- **즉시 깨우기**: 새로운 메시지가 도착하면 연결이 즉시 활성화
- **하트비트 관리**: 연결 상태를 유지하기 위한 최소한의 신호만 교환
- **비용 절약**: 실제 활동이 있을 때만 과금되어 운영 비용 대폭 절감

특히 채팅 앱처럼 간헐적으로 메시지가 오가는 애플리케이션에서는 이 기능이 매우 효과적입니다:

```typescript
// 비용 최적화를 위한 WebSocket Hibernation
export class OptimizedChatRoom {
  async webSocketMessage(ws: WebSocket, message: string) {
    const data = JSON.parse(message);
    
    if (data.type === 'heartbeat') {
      // Hibernation 방지를 위한 하트비트
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
    }
    
    // 실제 메시지 처리
    await this.processMessage(data);
  }
  
  async webSocketClose(ws: WebSocket, code: number) {
    // 연결 종료 시 정리 작업
    this.cleanupSession(ws);
    
    // 다른 참가자들에게 알림
    this.broadcast({
      type: 'user_left',
      timestamp: Date.now()
    });
  }
}
```

## 다른 활용 사례

### 1. 협력 문서 작성 플랫폼

실시간 협력 문서 편집은 Durable Objects의 강력한 일관성 보장이 빛을 발하는 영역입니다. 여러 사용자가 동시에 같은 문서를 편집할 때 발생할 수 있는 충돌을 해결하는 것은 매우 복잡한 문제입니다.

기존 시스템에서는 이를 위해 복잡한 분산 동기화 알고리즘과 충돌 해결 로직이 필요했습니다. 하지만 Durable Objects를 사용하면:

- **중앙집중식 상태 관리**: 문서의 모든 변경사항이 하나의 객체에서 순차적으로 처리
- **Operational Transform**: 동시 편집 시 발생하는 충돌을 자동으로 해결
- **실시간 커서 동기화**: 다른 사용자의 편집 위치를 실시간으로 표시
- **버전 관리**: 문서의 모든 변경 이력을 자동으로 추적

이러한 기능들이 하나의 객체 안에서 통합 관리되어 개발 복잡도가 크게 줄어듭니다:

```typescript
export class CollaborativeDocument {
  private document: DocumentState = new DocumentState();
  private cursors: Map<string, CursorPosition> = new Map();
  
  async handleOperation(operation: DocumentOperation) {
    // Operational Transform 적용
    const transformedOp = this.document.transform(operation);
    
    // 문서 상태 업데이트
    this.document.apply(transformedOp);
    
    // 모든 편집자에게 변경사항 전파
    this.broadcast({
      type: 'document_change',
      operation: transformedOp,
      version: this.document.version
    });
    
    // 영구 저장
    await this.state.storage.put('document', this.document.serialize());
  }
}
```

**장점:**
- 충돌 해결 로직의 중앙 집중화
- 실시간 커서 위치 동기화
- 문서 버전 관리 및 히스토리

### 2. 멀티플레이어 게임

멀티플레이어 게임은 Durable Objects의 모든 장점이 집약되는 사용 사례입니다. 게임에서는 다음과 같은 요구사항들이 동시에 충족되어야 합니다:

**핵심 요구사항:**
- **낮은 지연시간**: 플레이어 액션에 대한 즉각적인 반응
- **강력한 일관성**: 모든 플레이어가 동일한 게임 상태를 공유
- **치팅 방지**: 서버 측에서 게임 규칙을 엄격하게 검증
- **확장성**: 수많은 게임 방을 동시에 운영

Durable Objects는 이 모든 요구사항을 자연스럽게 만족시킵니다. 각 게임 방이 독립적인 객체로 구현되어 플레이어 간의 상호작용을 실시간으로 처리하고, 게임 상태를 안전하게 관리할 수 있습니다:

```typescript
export class GameRoom {
  private gameState: GameState = new GameState();
  private players: Map<string, Player> = new Map();
  
  async handlePlayerAction(playerId: string, action: GameAction) {
    // 게임 규칙 검증
    if (!this.gameState.isValidAction(playerId, action)) {
      return this.sendError(playerId, 'Invalid action');
    }
    
    // 게임 상태 업데이트
    this.gameState.applyAction(action);
    
    // 모든 플레이어에게 상태 동기화
    this.broadcast({
      type: 'game_update',
      state: this.gameState.getPublicState(),
      timestamp: Date.now()
    });
    
    // 게임 종료 조건 확인
    if (this.gameState.isGameOver()) {
      await this.handleGameEnd();
    }
  }
  
  // 정기적인 게임 상태 저장 (Alarms API 활용)
  async alarm() {
    await this.state.storage.put('game_state', this.gameState.serialize());
    
    // 다음 저장 스케줄링 (30초 후)
    this.state.storage.setAlarm(Date.now() + 30000);
  }
}
```

**게임 특화 장점:**
- 치팅 방지를 위한 서버 권한 게임 로직
- 낮은 레이턴시로 반응성 향상
- 플레이어 매칭 및 방 관리 자동화

## 장단점 분석

### 장점

1. **개발 생산성**: 복잡한 인프라 설정 없이 비즈니스 로직에 집중
2. **비용 효율성**: 사용량 기반 과금으로 유휴 시간 비용 없음
3. **글로벌 확장**: 자동 지리적 분산으로 전 세계 사용자 지원
4. **강력한 일관성**: 복잡한 동기화 로직 없이 데이터 일관성 보장
5. **실시간 성능**: 초저지연 WebSocket 연결과 인메모리 상태

### 단점

1. **벤더 종속성**: Cloudflare 플랫폼에 의존
2. **학습 곡선**: 새로운 프로그래밍 모델 이해 필요
3. **디버깅 복잡성**: 분산 환경에서의 디버깅 어려움
4. **제한사항**: 메모리 및 CPU 사용량 제한
5. **생태계**: 상대적으로 새로운 기술로 커뮤니티 자료 부족

## 결론

Durable Objects는 실시간 앱 개발 및 유지보수의 애로사항을 줄일 수 있는 하나의 대안이 될 수 있습니다. 기존 아키텍처의 복잡성을 크게 줄이면서도 성능과 확장성을 동시에 확보할 수 있는 솔루션입니다.

특히 다음과 같은 프로젝트에 적합합니다:
- 실시간 협업이 필요한 애플리케이션
- 글로벌 사용자를 대상으로 하는 서비스
- 빠른 프로토타이핑과 MVP 개발
- 인프라 관리 부담을 줄이고 싶은 팀

물론 모든 상황에 완벽한 해결책은 아니지만, 적절한 사용 사례에서는 개발 속도와 운영 효율성을 크게 향상시킬 수 있습니다. 

앞으로 더 많은 개발자들이 Durable Objects의 잠재력을 발견하고 활용하게 될 것으로 기대됩니다. 여러분도 다음 프로젝트에서 한번 시도해보시는 것은 어떨까요?

## 참고 자료

- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/) - 공식 개발자 문서
- [Durable Objects API Reference](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/) - API 레퍼런스
- [Durable Objects: Easy, Fast, Correct — Choose Three](https://blog.cloudflare.com/durable-objects-easy-fast-correct-choose-three/) - Cloudflare 공식 블로그
- [Introducing Workers Durable Objects](https://blog.cloudflare.com/introducing-workers-durable-objects/) - Durable Objects 소개 및 핵심 개념
