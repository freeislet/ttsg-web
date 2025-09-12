import type { APIRoute } from 'astro'
import { searchWikiPages, type WikiSearchOptions } from '@/lib/notion'

/**
 * 위키 페이지 검색 API 엔드포인트
 * GET /api/wiki/search?q=검색어&cursor=다음페이지커서&size=20&exact=true&languages=ko,en&versions=Gemini 2.5 Pro,GPT-5
 *
 * @param q - 검색할 위키 제목 (필수)
 * @param cursor - 페이지네이션을 위한 커서 (선택적)
 * @param size - 페이지 크기 (1-100, 기본값: 20)
 * @param exact - 정확한 매칭 여부 (true/false, 기본값: false)
 * @param languages - 언어 필터 (쉼표로 구분된 언어 코드, 예: "ko,en", 선택적)
 * @param versions - AI 모델명 필터 (쉼표로 구분된 모델명, 예: "Gemini 2.5 Pro,GPT-5", 선택적)
 *
 * @returns {
 *   success: boolean,
 *   data: {
 *     results: NotionPage[],
 *     hasMore: boolean,
 *     nextCursor: string | null
 *   }
 * }
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get('q')
    const cursor = url.searchParams.get('cursor')
    const size = url.searchParams.get('size')
    const exact = url.searchParams.get('exact')
    const languages = url.searchParams.get('languages')
    const versions = url.searchParams.get('versions')

    if (!query) {
      // TODO: responseError
      return new Response(
        JSON.stringify({
          success: false,
          error: '검색어가 필요합니다.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 페이지 크기 검증 및 설정
    let pageSize = 20 // 기본값
    if (size) {
      const parsedSize = parseInt(size, 10)
      if (isNaN(parsedSize) || parsedSize < 1 || parsedSize > 100) {
        return new Response(
          JSON.stringify({
            success: false,
            error: '페이지 크기는 1-100 사이의 숫자여야 합니다.',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      pageSize = parsedSize
    }

    // 검색 옵션 구성
    const searchOptions: WikiSearchOptions = {
      exactMatch: exact === 'true', // exact 파라미터로 정확한 매칭 여부 결정
      pageSize,
      startCursor: cursor || undefined,
    }

    // 언어 파라미터가 있으면 쉼표로 분리하여 배열로 추가
    if (languages) {
      searchOptions.languages = languages.split(',').map((lang) => lang.trim() as 'ko' | 'en')
    }

    // AI 모델명 파라미터가 있으면 쉼표로 분리하여 배열로 추가
    if (versions) {
      searchOptions.versions = versions.split(',').map((version) => version.trim())
    }

    // 위키 페이지 검색
    const searchResult = await searchWikiPages(query, searchOptions)

    return new Response(
      JSON.stringify({
        success: true,
        data: searchResult,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // 1분 캐시
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
