import { Client, type PageObjectResponse } from '@notionhq/client'
import type { NotionPage } from '@/types'

/**
 * 노션 클라이언트 인스턴스
 */
const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
})

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
 * 노션 페이지 속성에서 버전을 안전하게 추출
 */
function extractVersion(properties: PageObjectResponse['properties']): string | undefined {
  const versionProperty = properties.Version
  if (versionProperty && 'rich_text' in versionProperty && versionProperty.rich_text) {
    const firstText = versionProperty.rich_text[0]
    if (firstText && 'plain_text' in firstText) {
      return firstText.plain_text
    }
  }
  return undefined
}

/**
 * 노션 페이지 속성에서 언어를 안전하게 추출
 */
function extractLanguage(properties: PageObjectResponse['properties']): 'ko' | 'en' {
  const languageProperty = properties.Language
  if (languageProperty && 'select' in languageProperty && languageProperty.select) {
    const language = languageProperty.select.name
    if (language === 'ko' || language === 'en') {
      return language
    }
  }
  return 'ko' // 기본값
}

/**
 * 노션 페이지 속성에서 태그를 안전하게 추출
 */
function extractTags(properties: PageObjectResponse['properties']): string[] {
  const tagsProperty = properties.Tags
  if (tagsProperty && 'multi_select' in tagsProperty && tagsProperty.multi_select) {
    return tagsProperty.multi_select.map((tag) => tag.name)
  }
  return []
}

/**
 * 노션 페이지 속성에서 작성자를 안전하게 추출
 */
function extractAuthor(properties: PageObjectResponse['properties']): string | undefined {
  const authorProperty = properties.Author
  if (authorProperty && 'people' in authorProperty && authorProperty.people) {
    const firstPerson = authorProperty.people[0]
    if (firstPerson && 'name' in firstPerson) {
      return firstPerson.name || undefined
    }
  }
  return undefined
}

/**
 * 노션 페이지 속성에서 생성일을 안전하게 추출
 */
function extractCreated(properties: PageObjectResponse['properties']): string {
  const createdProperty = properties.Created
  if (createdProperty && 'created_time' in createdProperty) {
    return createdProperty.created_time
  }
  return new Date().toISOString() // 기본값
}

/**
 * 노션 페이지 속성에서 최종 편집자를 안전하게 추출
 */
function extractLastEditor(properties: PageObjectResponse['properties']): string | undefined {
  const lastEditorProperty = properties['Last Editor']
  if (lastEditorProperty && 'people' in lastEditorProperty && lastEditorProperty.people) {
    const firstPerson = lastEditorProperty.people[0]
    if (firstPerson && 'name' in firstPerson) {
      return firstPerson.name || undefined
    }
  }
  return undefined
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
      url: page.url,
      title: extractTitle(page.properties),
      version: extractVersion(page.properties),
      language: extractLanguage(page.properties),
      tags: extractTags(page.properties),
      author: extractAuthor(page.properties),
      created: extractCreated(page.properties),
      lastEditor: extractLastEditor(page.properties),
      lastEdited: page.last_edited_time,
    }))
  } catch (error) {
    console.error('노션 API 호출 실패:', error)
    return []
  }
}
