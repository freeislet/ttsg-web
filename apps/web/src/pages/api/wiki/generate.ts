import type { APIRoute } from 'astro'
import { responseSuccess, responseError, responseServerError } from '@/lib/api'
import { createWikiPage } from '@/lib/notion'
import { WikiGeneratorFactory, type AIModel, type Language } from '@/lib/wiki'
import type { WikiGenerationRequest, WikiGenerationResponse, WikiGenerationResult } from '@/types'

/**
 * 위키 자동 생성 API 엔드포인트
 * POST /api/wiki/generate
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

    // 각 모델별로 위키 생성 및 노션 저장
    const results = await Promise.all(
      models.map((model) => generateWikiForModel(model, topic, instruction, language, tags))
    )

    // 결과 반환 (성공/실패 모두 포함)
    let message: string | undefined
    const successCount = results.filter((r) => !r.error).length
    const errorCount = results.filter((r) => r.error).length

    if (successCount === 0) {
      message = `모든 모델에서 위키 생성에 실패했습니다.`
    } else if (errorCount > 0) {
      message = `${successCount}개 모델 성공, ${errorCount}개 모델 실패`
    }

    return responseSuccess<WikiGenerationResponse>({
      success: successCount > 0,
      results,
      message,
    })
  } catch (error) {
    console.error('위키 생성 API 오류:', error)
    return responseServerError(error)
  }
}

/**
 * 위키 생성 요청 검증 함수
 * @param requestData 파싱된 요청 데이터
 * @returns 검증 실패 시 Error Response, 성공 시 undefined
 */
export function validateWikiGenerationRequest(
  requestData: WikiGenerationRequest
): Response | undefined {
  const { models, topic } = requestData

  // 입력 검증
  if (!topic || !topic.trim()) {
    return responseError('주제를 입력해주세요.')
  }

  if (!models || models.length === 0) {
    return responseError('최소 하나의 AI 모델을 선택해주세요.')
  }

  // 지원하는 모델인지 확인
  const unsupportedModels = models.filter(
    (model) => !WikiGeneratorFactory.supportedModels.includes(model)
  )
  if (unsupportedModels.length > 0) {
    return responseError(`지원하지 않는 모델입니다: ${unsupportedModels.join(', ')}`)
  }

  // 검증 통과
  return undefined
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
