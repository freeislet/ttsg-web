import type { APIRoute } from 'astro'
import { searchWikiPage, type WikiSearchOptions } from '@/lib/notion'

/**
 * 위키 페이지 검색 API 엔드포인트
 * GET /api/wiki/search?title=위키제목&language=ko&version=Gemini 2.5 Pro
 * 
 * @param title - 검색할 위키 제목 (필수)
 * @param language - 언어 필터 (ko | en, 선택적)
 * @param version - AI 모델명 필터 (예: "Gemini 2.5 Pro", "GPT-5", 선택적)
 * 
 * @returns {
 *   success: boolean,
 *   data: NotionPage[]
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
          success: false,
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

    return new Response(
      JSON.stringify({
        success: true,
        data: wikiPages,
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
    console.error('위키 검색 API 오류:', error)

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
