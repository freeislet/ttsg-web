import { Client } from '@notionhq/client'
import type { PageObjectResponse, BlockObjectRequest } from '@notionhq/client'
import { markdownToBlocks } from '@tryfabric/martian'

/**
 * 언어 타입
 */
export type Language = 'ko' | 'en'

/**
 * 언어별 배지 색상 반환
 */
export const getLanguageBadgeColor = (language: string) => {
  switch (language) {
    case 'ko':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'en':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * 노션 페이지 데이터 타입
 */
export interface NotionPage {
  id: string
  url: string
  title: string
  version?: string
  language: Language
  tags: string[]
  author?: string
  created: string
  lastEditor?: string
  lastEdited: string
}

/**
 * 노션 클라이언트 생성 함수
 */
function createNotionClient() {
  // 워커/로컬 모두에서 동작하도록 전역 캐시 유틸을 사용
  const apiKey = getEnv('NOTION_API_KEY')

  // Cloudflare Workers 환경에서 this 컨텍스트 문제를 해결하기 위한 fetch 래퍼
  // (https://blog.pixelastic.com/2025/01/21/fetch-this-illegal-invocation/ 참고)
  // const fetchWrapper = async (url: RequestInfo | URL, init?: RequestInit) => {
  //   return fetch(url, init)
  // }
  const fetchWrapper = fetch.bind(globalThis)

  return new Client({
    auth: apiKey,
    fetch: fetchWrapper,
  })
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
function extractLanguage(properties: PageObjectResponse['properties']): Language {
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
    const notion = createNotionClient()
    const response = await notion.databases.query({
      database_id: getEnv('NOTION_DATABASE_ID'),
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

/**
 * 위키 콘텐츠를 노션 데이터베이스에 새 페이지로 생성합니다
 * @param title 위키 제목
 * @param content 위키 콘텐츠 (마크다운)
 * @param version 모델 버전 (예: "Gemini Pro")
 * @param language 언어 설정 (기본값: 'ko')
 * @param tags 태그 목록 (기본값: [])
 * @returns 생성된 노션 페이지 정보
 */
export async function createWikiPage(
  title: string,
  content: string,
  version: string,
  language: Language = 'ko',
  tags: string[] = []
): Promise<{ pageId: string; url: string }> {
  try {
    // 마크다운 콘텐츠를 노션 블록으로 변환
    const allBlocks = convertMarkdownToBlocks(content)
    const notion = createNotionClient()

    // 1. 빈 페이지 생성
    const response = await notion.pages.create({
      parent: {
        database_id: getEnv('NOTION_DATABASE_ID'),
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Version: {
          rich_text: [
            {
              text: {
                content: version,
              },
            },
          ],
        },
        Language: {
          select: {
            name: language,
          },
        },
        Tags: {
          multi_select: tags.map((tag) => ({ name: tag })),
        },
      },
      // 빈 children으로 초기화
      children: [],
    })

    const pageId = response.id

    // 2. 블록을 100개 단위로 나누어 추가
    const BATCH_SIZE = 100
    for (let i = 0; i < allBlocks.length; i += BATCH_SIZE) {
      const batch = allBlocks.slice(i, i + BATCH_SIZE) as BlockObjectRequest[]
      await notion.blocks.children.append({
        block_id: pageId,
        children: batch,
      })
    }

    // 노션 페이지 URL 생성 (페이지 ID를 사용하여 공유 링크 형태로)
    const pageUrl = `https://www.notion.so/${pageId.replace(/-/g, '')}`

    return {
      pageId,
      url: pageUrl,
    }
  } catch (error) {
    console.error('노션 페이지 생성 실패:', error)
    throw new Error(
      `노션 페이지 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    )
  }
}

/**
 * 위키 검색 옵션
 */
export interface WikiSearchOptions {
  /** 페이지네이션을 위한 시작 커서 */
  startCursor?: string
  /** 반환할 최대 결과 수 (기본값: 20) */
  pageSize?: number
  /** 정확한 제목 매칭만 수행할지 여부 (기본값: false) */
  exactMatch?: boolean
  /** 검색할 언어 배열 */
  languages?: Language[]
  /** 검색할 버전 배열 */
  versions?: string[]
}

/**
 * 위키 검색 결과
 */
export interface WikiSearchResult {
  /** 검색된 페이지 목록 */
  results: NotionPage[]
  /** 더 많은 결과가 있는지 여부 */
  hasMore: boolean
  /** 다음 페이지를 위한 커서 */
  nextCursor: string | null
}

/**
 * 위키 제목으로 노션 페이지를 검색합니다
 * @param title 검색할 위키 제목
 * @param options 검색 옵션 (언어, 버전 필터링, 페이지네이션)
 * @returns 검색 결과 (페이지 목록, 페이지네이션 정보 포함)
 */
export async function searchWikiPage(
  title: string,
  options?: WikiSearchOptions
): Promise<WikiSearchResult> {
  try {
    const notion = createNotionClient()

    // 기본 제목 필터 구성
    const titleFilter = {
      property: 'Title',
      title: options?.exactMatch
        ? {
            equals: title,
          }
        : {
            contains: title,
          },
    }

    // 추가 필터 구성
    const filters: any[] = [titleFilter]

    // 언어 필터 추가
    if (options?.languages && options.languages.length > 0) {
      if (options.languages.length === 1) {
        filters.push({
          property: 'Language',
          select: {
            equals: options.languages[0],
          },
        })
      } else {
        filters.push({
          or: options.languages.map((lang) => ({
            property: 'Language',
            select: {
              equals: lang,
            },
          })),
        })
      }
    }

    // 버전 필터 추가
    if (options?.versions && options.versions.length > 0) {
      if (options.versions.length === 1) {
        filters.push({
          property: 'Version',
          rich_text: {
            equals: options.versions[0],
          },
        })
      } else {
        filters.push({
          or: options.versions.map((version) => ({
            property: 'Version',
            rich_text: {
              equals: version,
            },
          })),
        })
      }
    }

    // 최종 필터 구성
    const finalFilter = filters.length > 1 ? { and: filters } : filters[0]

    const response = await notion.databases.query({
      database_id: getEnv('NOTION_DATABASE_ID'),
      filter: finalFilter,
      page_size: options?.pageSize ?? 20,
      start_cursor: options?.startCursor,
    })

    if (response.results.length === 0) {
      return {
        results: [],
        hasMore: false,
        nextCursor: null,
      }
    }

    // 페이지 결과 추출
    const results = response.results.filter(isPageObjectResponse).map((page) => ({
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

    // 페이지네이션 정보와 함께 결과 반환
    return {
      results,
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
    }
  } catch (error) {
    console.error('위키 페이지 검색 실패:', error)
    return {
      results: [],
      hasMore: false,
      nextCursor: null,
    }
  }
}

/**
 * 노션 페이지의 프리뷰 내용을 가져옵니다 (처음 3개 블록)
 * @param pageId 노션 페이지 ID
 * @returns 프리뷰 텍스트
 */
export async function getPagePreview(pageId: string): Promise<string> {
  try {
    const notion = createNotionClient()
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 3, // 처음 3개 블록만 가져오기
    })

    const previewText = response.results
      .map((block: any) => {
        // 텍스트 블록에서 내용 추출
        if (block.type === 'paragraph' && block.paragraph?.rich_text) {
          return block.paragraph.rich_text.map((text: any) => text.plain_text).join('')
        }
        if (block.type === 'heading_1' && block.heading_1?.rich_text) {
          return block.heading_1.rich_text.map((text: any) => text.plain_text).join('')
        }
        if (block.type === 'heading_2' && block.heading_2?.rich_text) {
          return block.heading_2.rich_text.map((text: any) => text.plain_text).join('')
        }
        if (block.type === 'heading_3' && block.heading_3?.rich_text) {
          return block.heading_3.rich_text.map((text: any) => text.plain_text).join('')
        }
        return ''
      })
      .filter((text: string) => text.trim().length > 0)
      .join(' ')

    // 프리뷰 텍스트가 너무 길면 자르기 (200자 제한)
    return previewText.length > 200 ? previewText.substring(0, 200) + '...' : previewText
  } catch (error) {
    console.error('페이지 프리뷰 가져오기 실패:', error)
    return '프리뷰를 불러올 수 없습니다.'
  }
}

/**
 * 마크다운 텍스트를 노션 블록으로 변환합니다
 * @param markdown 마크다운 텍스트
 * @returns 노션 블록 배열
 */
function convertMarkdownToBlocks(markdown: string): BlockObjectRequest[] {
  try {
    // @tryfabric/martian을 사용하여 마크다운을 노션 블록으로 변환
    return markdownToBlocks(markdown) as BlockObjectRequest[]
  } catch (error) {
    console.error('마크다운 변환 중 오류 발생:', error)
    // 변환 실패 시 빈 배열 반환
    return []
  }
}
