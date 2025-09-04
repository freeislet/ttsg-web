import type { APIRoute } from 'astro'
import { searchWikiPage, getPagePreview, type WikiSearchOptions } from '@/lib/notion'

/**
 * 위키 페이지 프리뷰 API 엔드포인트
 * GET /api/wiki/preview?title=위키제목&language=ko&version=Gemini 2.5 Pro
 * 
 * @param title - 검색할 위키 제목 (필수)
 * @param language - 언어 필터 (ko | en, 선택적)
 * @param version - AI 모델명 필터 (예: "Gemini 2.5 Pro", "GPT-5", 선택적)
 * 
 * @returns {
 *   success: boolean,
 *   data: NotionPage & { preview: string },
 *   allPages: NotionPage[] // 전체 검색 결과 (Version + Language 선택 UI용)
 * }
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const title = url.searchParams.get('title')
    const language = url.searchParams.get('language')
    const version = url.searchParams.get('version')

    if (!title) {
      return new Response(
        JSON.stringify({
          error: '위키 제목이 필요합니다.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 검색 옵션 구성
    const searchOptions: WikiSearchOptions = {
      exactMatch: true,
      pageSize: 10,
    }

    // 언어 파라미터가 있으면 추가
    if (language) {
      searchOptions.languages = [language as 'ko' | 'en']
    }

    // AI 모델명 파라미터가 있으면 추가 (예: "Gemini 2.5 Pro", "GPT-5")
    if (version) {
      searchOptions.versions = [version]
    }

    // 위키 페이지 검색
    const wikiPages = await searchWikiPage(title, searchOptions)

    if (wikiPages.length === 0) {
      return new Response(
        JSON.stringify({
          error: '해당 위키 페이지를 찾을 수 없습니다.',
          title,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 첫 번째 결과 사용 (가장 관련성 높은 페이지)
    const wikiPage = wikiPages[0]

    // 페이지 프리뷰 내용 가져오기
    const previewContent = await getPagePreview(wikiPage.id)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...wikiPage,
          preview: previewContent,
        },
        // 전체 검색 결과 목록 (Version + Language 선택 UI용)
        allPages: wikiPages,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5분 캐시
        },
      }
    )
  } catch (error) {
    console.error('위키 프리뷰 API 오류:', error)

    return new Response(
      JSON.stringify({
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
