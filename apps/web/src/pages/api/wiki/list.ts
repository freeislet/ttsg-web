import type { APIRoute } from 'astro'
import type { NotionApiResponse } from '@/types'
import { responseSuccess, responseServerError } from '@/lib/api'
import { getRecentPages } from '@/lib/notion'

/**
 * 노션 데이터베이스에서 최근 페이지 목록을 반환하는 API 엔드포인트
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    // 쿼리 파라미터에서 limit 값 추출 (기본값: 10)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const pages = await getRecentPages(limit)

    const response: NotionApiResponse = {
      success: true,
      data: pages,
      count: pages.length,
    }

    return responseSuccess(response)
  } catch (error) {
    console.error('노션 페이지 조회 실패:', error)
    return responseServerError(error)
  }
}
