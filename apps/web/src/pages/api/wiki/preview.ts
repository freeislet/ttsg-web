import type { APIRoute } from 'astro'
import { searchWikiPage, getPagePreview } from '../../../lib/notion'

/**
 * 위키 페이지 프리뷰 API 엔드포인트
 * GET /api/wiki/preview?title=위키제목
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const title = url.searchParams.get('title')
    
    if (!title) {
      return new Response(
        JSON.stringify({ 
          error: '위키 제목이 필요합니다.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 위키 페이지 검색
    const wikiPage = await searchWikiPage(title)
    
    if (!wikiPage) {
      return new Response(
        JSON.stringify({ 
          error: '해당 위키 페이지를 찾을 수 없습니다.',
          title 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 페이지 프리뷰 내용 가져오기
    const previewContent = await getPagePreview(wikiPage.id)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...wikiPage,
          preview: previewContent,
        }
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5분 캐시
        }
      }
    )
  } catch (error) {
    console.error('위키 프리뷰 API 오류:', error)
    
    return new Response(
      JSON.stringify({ 
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
