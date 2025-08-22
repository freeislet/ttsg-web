import type { APIRoute } from 'astro'
import { responseSuccess, responseError, responseServerError } from '@/lib/api'
import { WikiGeneratorFactory } from '@/lib/wiki'
import { createWikiPage } from '@/lib/notion'
import type { WikiGenerationRequest, WikiGenerationResponse, WikiGenerationResult } from '@/types'

/**
 * 위키 자동 생성 API 엔드포인트
 * POST /api/wiki/generate
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // 요청 데이터 파싱
    const requestData: WikiGenerationRequest = await request.json()
    const { models, topic, instruction, language, tags } = requestData

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

    const results: WikiGenerationResult[] = []
    const errors: string[] = []

    // 각 모델별로 위키 생성 및 노션 저장
    for (const model of models) {
      try {
        console.log(
          `${model} 모델로 위키 생성 시작: ${topic}${instruction ? ` (지침: ${instruction})` : ''}`
        )

        // AI 모델로 위키 콘텐츠 생성
        const generator = WikiGeneratorFactory.create(model)
        const version = generator.getName()
        const wikiContent = await generator.generate(topic, language, instruction)
        console.log(`${model} 위키 생성 완료, 노션에 저장 중...`)

        // 노션에 페이지 생성
        const notionPage = await createWikiPage(wikiContent, version, language, tags)
        console.log(`${model} 노션 저장 완료: ${notionPage.url}`)

        results.push({
          model,
          title: wikiContent.title,
          version,
          notionUrl: notionPage.url,
          notionPageId: notionPage.pageId,
        })
      } catch (error) {
        console.error(`${model} 위키 생성 실패:`, error)
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        errors.push(`${model}: ${errorMessage}`)
      }
    }

    // 결과 반환
    if (results.length === 0) {
      return responseError(
        `모든 모델에서 위키 생성에 실패했습니다. 오류: ${errors.join('; ')}`,
        500
      )
    }

    // 부분적 성공의 경우 경고 메시지 포함
    let message: string | undefined
    if (errors.length > 0) {
      message = `일부 모델에서 오류가 발생했습니다: ${errors.join('; ')}`
    }

    return responseSuccess<WikiGenerationResponse>({
      success: true,
      results,
      message,
    })
  } catch (error) {
    console.error('위키 생성 API 오류:', error)
    return responseServerError(error)
  }
}
