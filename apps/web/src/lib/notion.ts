import { Client, type PageObjectResponse, type BlockObjectRequest } from '@notionhq/client'

/**
 * 언어 타입
 */
export type Language = 'ko' | 'en'

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
  return new Client({ auth: apiKey })
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
    const blocks = convertMarkdownToBlocks(content)
    const notion = createNotionClient()
    const response = await notion.pages.create({
      parent: {
        database_id: getEnv('NOTION_DATABASE_ID'),
      },
      properties: {
        Name: {
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
      children: blocks,
    })

    // 노션 페이지 URL 생성 (페이지 ID를 사용하여 공유 링크 형태로)
    const pageUrl = `https://www.notion.so/${response.id.replace(/-/g, '')}`

    return {
      pageId: response.id,
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
 * 마크다운 텍스트를 노션 블록으로 변환합니다
 * @param markdown 마크다운 텍스트
 * @returns 노션 블록 배열
 */
function convertMarkdownToBlocks(markdown: string): BlockObjectRequest[] {
  const lines = markdown.split('\n')
  const blocks: BlockObjectRequest[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      continue
    }

    // 헤딩 처리
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: { content: line.substring(2) },
            },
          ],
        },
      })
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: { content: line.substring(3) },
            },
          ],
        },
      })
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: { content: line.substring(4) },
            },
          ],
        },
      })
    } else if (line.startsWith('- ')) {
      // 불릿 리스트 처리
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: line.substring(2) },
            },
          ],
        },
      })
    } else {
      // 일반 텍스트 처리
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: line },
            },
          ],
        },
      })
    }
  }

  return blocks
}
