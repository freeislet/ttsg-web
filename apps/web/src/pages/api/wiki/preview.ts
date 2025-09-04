import type { APIRoute } from 'astro'
import { getPagePreview } from '@/lib/notion'

/**
 * 위키 페이지 프리뷰 API 엔드포인트
 * GET /api/wiki/preview?pageId=노션페이지ID
 *
 * @param pageId - 노션 페이지 ID (필수)
 *
 * @returns {
 *   success: boolean,
 *   data: { preview: string }
 * }
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const pageId = url.searchParams.get('pageId')

    if (!pageId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '노션 페이지 ID가 필요합니다.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 페이지 프리뷰 내용 가져오기
    const previewContent = await getPagePreview(pageId)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          preview: previewContent,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600', // 10분 캐시
        },
      }
    )
  } catch (error) {
    console.error('위키 프리뷰 API 오류:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
