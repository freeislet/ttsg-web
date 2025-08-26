import type { APIRoute } from 'astro'
import { responseServerError } from '@/lib/api'
import { createWikiPage } from '@/lib/notion'
import { WikiGeneratorFactory, type AIModel, type Language } from '@/lib/wiki'
import type { WikiGenerationRequest, WikiGenerationResult } from '@/types'
import { validateWikiGenerationRequest } from './generate'

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
    await sendSSEEvent(writer, encoder, {
      type: 'generation_complete',
    })
  } catch (error) {
    console.error('위키 생성 처리 중 오류:', error)
    await sendSSEEvent(writer, encoder, {
      type: 'error',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
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

/**
 * 단일 모델로 위키 생성 및 노션 저장
 * @param model AI 모델
 * @param topic 주제
 * @param instruction 추가 지침
 * @param language 언어
 * @param tags 태그 목록
 * @returns 위키 생성 결과
 */
async function generateWikiForModel(
  model: AIModel,
  topic: string,
  instruction?: string,
  language?: Language,
  tags?: string[]
): Promise<WikiGenerationResult> {
  try {
    // AI 모델로 위키 콘텐츠 생성
    const generator = WikiGeneratorFactory.create(model)
    const version = generator.getName()
    const wikiContent = await generator.generate(topic, language, instruction)
    const { title, prompt, content, error } = wikiContent

    // 위키 생성 실패 시
    if (!content) {
      return { model, title, version, prompt, error: error ?? '알 수 없는 오류' }
    }

    const result = { model, title, version, prompt, content }

    // 노션에 페이지 생성
    try {
      const notionPage = await createWikiPage(title, content, version, language, tags)

      return {
        ...result,
        notionUrl: notionPage.url,
        notionPageId: notionPage.pageId,
      }
    } catch (error) {
      console.error(`${model} 노션 저장 실패 [${topic}]:`, error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'

      return {
        ...result,
        error: `노션 저장 실패: ${errorMessage}`,
      }
    }
  } catch (error) {
    console.error(`${model} 예상치 못한 오류 [${topic}]:`, error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'

    return {
      model,
      title: topic,
      version: model,
      error: errorMessage,
    }
  }
}
