import { createRequestHandler } from 'react-router'

// ChatRoom Durable Object 클래스
export class ChatRoom {
  private state: DurableObjectState
  private env: Env
  private sessions: Set<WebSocket>
  private messages: Array<{ id: string; content: string; timestamp: number; sender: 'user' | 'ai' }>

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
    this.sessions = new Set()
    this.messages = []
  }

  // WebSocket 연결 처리
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.endsWith('/websocket')) {
      // WebSocket 업그레이드 처리
      const upgradeHeader = request.headers.get('Upgrade')
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 })
      }

      const webSocketPair = new WebSocketPair()
      const [client, server] = Object.values(webSocketPair)

      // WebSocket 이벤트 핸들러 설정
      server.accept()
      this.sessions.add(server)

      server.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data as string)
          await this.handleMessage(data, server)
        } catch (error) {
          console.error('메시지 처리 오류:', error)
        }
      })

      server.addEventListener('close', () => {
        this.sessions.delete(server)
      })

      // 기존 메시지 히스토리 전송
      server.send(
        JSON.stringify({
          type: 'history',
          messages: this.messages,
        })
      )

      return new Response(null, {
        status: 101,
        webSocket: client,
      })
    }

    return new Response('Not found', { status: 404 })
  }

  // 메시지 처리 로직
  private async handleMessage(data: any, sender: WebSocket) {
    if (data.type === 'user_message') {
      // 사용자 메시지 저장 (브로드캐스트하지 않음 - 클라이언트에서 이미 UI에 추가함)
      const userMessage = {
        id: crypto.randomUUID(),
        content: data.content,
        timestamp: Date.now(),
        sender: 'user' as const,
      }
      this.messages.push(userMessage)

      // AI 응답 생성 (Gemini API 호출)
      try {
        const aiResponse = await this.generateAIResponse(data.content)
        const aiMessage = {
          id: crypto.randomUUID(),
          content: aiResponse,
          timestamp: Date.now(),
          sender: 'ai' as const,
        }
        this.messages.push(aiMessage)

        // AI 응답만 브로드캐스트
        this.broadcast({
          type: 'message',
          message: aiMessage,
        })
      } catch (error) {
        console.error('AI 응답 생성 오류:', error)
        const errorMessage = {
          id: crypto.randomUUID(),
          content: '죄송합니다. 현재 AI 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          timestamp: Date.now(),
          sender: 'ai' as const,
        }
        this.messages.push(errorMessage)
        this.broadcast({
          type: 'message',
          message: errorMessage,
        })
      }
    }
  }

  // Gemini API 호출
  private async generateAIResponse(userMessage: string): Promise<string> {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
        this.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userMessage,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`)
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string
          }>
        }
      }>
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 응답을 생성할 수 없습니다.'
  }

  // 모든 연결된 클라이언트에게 메시지 브로드캐스트
  private broadcast(message: any) {
    const messageStr = JSON.stringify(message)
    this.sessions.forEach((session) => {
      try {
        session.send(messageStr)
      } catch (error) {
        // 연결이 끊어진 세션 제거
        this.sessions.delete(session)
      }
    })
  }
}

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(
  // @ts-ignore - virtual module은 빌드 시점에 생성됨
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Durable Object 라우팅
    if (url.pathname.startsWith('/chat/')) {
      const roomId = url.pathname.split('/')[2]
      if (roomId) {
        const durableObjectId = env.CHAT_ROOM.idFromName(roomId)
        const chatRoom = env.CHAT_ROOM.get(durableObjectId)
        return chatRoom.fetch(request)
      }
    }

    // React Router 요청 처리
    return requestHandler(request, {
      cloudflare: { env, ctx },
    })
  },
} satisfies ExportedHandler<Env>
