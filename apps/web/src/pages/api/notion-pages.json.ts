import type { APIRoute } from 'astro'
import { getRecentPages } from '../../lib/notion'
import type { NotionApiResponse, ApiErrorResponse } from '../../types/api'

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

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300', // 5분 캐시
      },
    })
  } catch (error) {
    console.error('노션 페이지 조회 실패:', error)

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to fetch pages from Notion',
      message: error instanceof Error ? error.message : 'Unknown error',
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
