import { Client, type PageObjectResponse } from '@notionhq/client'

/**
 * 노션 클라이언트 인스턴스
 */
const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
})

/**
 * 노션 페이지 데이터 타입 정의
 */
export interface NotionPage {
  id: string
  title: string
  url: string
  lastEdited: string
}

/**
 * 타입 가드: PageObjectResponse인지 확인
 */
function isPageObjectResponse(page: unknown): page is PageObjectResponse {
  return (
    page !== null &&
    typeof page === 'object' &&
    'id' in page &&
    'url' in page &&
    'last_edited_time' in page &&
    'properties' in page
  )
}

/**
 * 노션 페이지 속성에서 제목을 안전하게 추출
 */
function extractTitle(properties: PageObjectResponse['properties']): string {
  // Name 속성에서 제목 추출 시도
  const nameProperty = properties.Name
  if (nameProperty && 'title' in nameProperty && nameProperty.title) {
    const firstTitle = nameProperty.title[0]
    if (firstTitle && 'plain_text' in firstTitle) {
      return firstTitle.plain_text
    }
  }

  // Title 속성에서 제목 추출 시도
  const titleProperty = properties.Title
  if (titleProperty && 'title' in titleProperty && titleProperty.title) {
    const firstTitle = titleProperty.title[0]
    if (firstTitle && 'plain_text' in firstTitle) {
      return firstTitle.plain_text
    }
  }

  return 'Untitled'
}

/**
 * 노션 데이터베이스에서 최근 페이지 목록을 가져옵니다
 * @param limit 가져올 페이지 수 (기본값: 10)
 * @returns 최근 페이지 목록
 */
export async function getRecentPages(limit: number = 10): Promise<NotionPage[]> {
  try {
    const response = await notion.databases.query({
      database_id: import.meta.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: 'Last Updated',
          direction: 'descending',
        },
      ],
      page_size: limit,
    })

    return response.results.filter(isPageObjectResponse).map((page) => ({
      id: page.id,
      title: extractTitle(page.properties),
      url: page.url,
      lastEdited: page.last_edited_time,
    }))
  } catch (error) {
    console.error('노션 API 호출 실패:', error)
    return []
  }
}
