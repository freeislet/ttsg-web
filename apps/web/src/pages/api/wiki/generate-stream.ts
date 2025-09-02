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
  const startTime = Date.now()
  console.log(`[SSE] 위키 생성 프로세스 시작 - 주제: ${topic}, 모델: ${models.join(', ')}, 시작시간: ${new Date().toISOString()}`)

  try {
    // 생성 시작 이벤트
    console.log('[SSE] generation_start 이벤트 전송')
    await sendSSEEvent(writer, encoder, {
      type: 'generation_start',
      totalModels: models.length,
    })

    // 각 모델을 순차적으로 처리
    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      const progress = Math.round(((i + 1) / models.length) * 100)
      const modelStartTime = Date.now()

      console.log(`[SSE] 모델 ${model} 처리 시작 (${i + 1}/${models.length})`)
      
      // 모델 생성 시작 이벤트
      await sendSSEEvent(writer, encoder, {
        type: 'model_start',
        model,
        progress: Math.round((i / models.length) * 100),
      })

      // 실제 위키 생성
      console.log(`[SSE] 모델 ${model} AI 생성 시작`)
      const result = await generateWikiForModel(model, topic, instruction, language, tags)
      const modelEndTime = Date.now()
      
      console.log(`[SSE] 모델 ${model} AI 생성 완료 - 소요시간: ${modelEndTime - modelStartTime}ms, 결과:`, {
        hasContent: !!result.content,
        hasError: !!result.error,
        notionUrl: result.notionUrl,
        contentLength: result.content?.length || 0
      })

      // 모델 완료 이벤트
      await sendSSEEvent(writer, encoder, {
        type: 'model_complete',
        model,
        result,
        progress,
      })
      
      console.log(`[SSE] 모델 ${model} model_complete 이벤트 전송 완료`)
    }

    // 전체 완료 이벤트
    const totalTime = Date.now() - startTime
    console.log(`[SSE] 위키 생성 프로세스 완료 - 총 소요시간: ${totalTime}ms, 완료시간: ${new Date().toISOString()}`)
    
    console.log('[SSE] generation_complete 이벤트 전송 시작')
    await sendSSEEvent(writer, encoder, {
      type: 'generation_complete',
    })
    console.log('[SSE] generation_complete 이벤트 전송 완료')
    
  } catch (error) {
    console.error('[SSE] 위키 생성 중 오류:', error)
    await sendSSEEvent(writer, encoder, {
      type: 'error',
      error: AppError.getMessage(error),
    })
  } finally {
    console.log('[SSE] 스트림 writer 종료 시작')
    await writer.close()
    console.log('[SSE] 스트림 writer 종료 완료')
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
  try {
    const eventData = `data: ${JSON.stringify(data)}\n\n`
    console.log(`[SSE] 이벤트 전송: ${data.type}, 데이터 크기: ${eventData.length}bytes`)
    await writer.write(encoder.encode(eventData))
    console.log(`[SSE] 이벤트 전송 완료: ${data.type}`)
  } catch (error) {
    console.error(`[SSE] 이벤트 전송 실패: ${data.type}`, error)
    throw error
  }
}
