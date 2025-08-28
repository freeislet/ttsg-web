import type { APIRoute } from 'astro'
import { responseServerError } from '@/lib/api'
import type { AIModel, Language } from '@/lib/wiki'
import type { WikiGenerationRequest } from '@/types'
import { validateWikiGenerationRequest, generateWikiForModel } from './generate'

/**
 * 위키 자동 생성 SSE 스트리밍 API 엔드포인트
 * POST /api/wiki/generate-stream
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // 요청 데이터 파싱
    const requestData: WikiGenerationRequest = await request.json()

    // 요청 데이터 검증
    const validationResult = validateWikiGenerationRequest(requestData)
    if (validationResult) {
      return validationResult
    }

    const { models, topic, instruction, language, tags } = requestData

    // SSE 스트림 생성 (Cloudflare 호환을 위해 TransformStream 사용)
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()

    // 백그라운드에서 위키 생성 처리
    processWikiGeneration(writer, encoder, models, topic, instruction, language, tags).catch(
      (error: unknown) => {
        console.error('위키 생성 처리 오류:', error)
      }
    )

    // SSE 응답 반환
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('위키 생성 API 오류:', error)
    return responseServerError(error)
  }
}

/**
 * SSE 스트림을 통해 위키 생성 과정을 처리하는 함수
 */
async function processWikiGeneration(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  models: AIModel[],
  topic: string,
  instruction?: string,
  language?: Language,
  tags?: string[]
): Promise<void> {
  console.log(`[SSE] 위키 생성 프로세스 시작 - 주제: ${topic}, 모델: ${models.join(', ')}`)

  try {
    // 생성 시작 이벤트
    await sendSSEEvent(writer, encoder, {
      type: 'generation_start',
      totalModels: models.length,
    })

    // 각 모델을 순차적으로 처리
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const progress = Math.round(((i + 1) / models.length) * 100)

      // 모델 생성 시작 이벤트
      await sendSSEEvent(writer, encoder, {
        type: 'model_start',
        model,
        progress: Math.round((i / models.length) * 100),
      })

      // 실제 위키 생성
      const result = await generateWikiForModel(model, topic, instruction, language, tags)

      // 모델 완료 이벤트
      await sendSSEEvent(writer, encoder, {
        type: 'model_complete',
        model,
        result,
        progress,
      })
    }

    // 전체 완료 이벤트
    console.log(`[SSE] 위키 생성 프로세스 완료`)
    await sendSSEEvent(writer, encoder, {
      type: 'generation_complete',
    })
  } catch (error) {
    console.error('[SSE] 위키 생성 중 오류:', error)
    await sendSSEEvent(writer, encoder, {
      type: 'error',
      error: AppError.getMessage(error),
    })
  } finally {
    await writer.close()
  }
}

/**
 * SSE 이벤트를 전송하는 헬퍼 함수
 */
async function sendSSEEvent(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  data: Record<string, unknown>
): Promise<void> {
  const eventData = `data: ${JSON.stringify(data)}\n\n`
  await writer.write(encoder.encode(eventData))
}
