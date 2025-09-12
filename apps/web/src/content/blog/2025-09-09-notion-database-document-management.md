---
title: "노션 데이터베이스를 활용한 문서 관리 시스템"
description: "노션 데이터베이스 기반 문서 관리 시스템 구축을 위한 노션 API 사용법을 알아봅니다."
pubDate: 2025-09-09
category: "dev"
tags: ["notion", "api", "database", "document-management", "typescript", "javascript"]
author: "TTSG"
draft: false
featured: false
heroImage: "/assets/images/blog/notion-database.png"
---

# 노션 데이터베이스를 활용한 문서 관리 시스템 구축 가이드

위키 시스템 구축을 위해 여러 솔루션을 살펴보다가 노션 데이터베이스를 문서 관리 시스템으로 활용할 수 있다는 제안을 받아 TTSG 위키에 도입해 보았습니다. 

이 가이드에서는 TypeScript와 노션 API를 사용하여 문서 관리 시스템을 구축하는 방법을 정리하였습니다.

## 1. 노션 데이터베이스 설계 및 생성

### 데이터베이스 스키마 설계

먼저 문서 관리에 필요한 데이터베이스 스키마를 설계합니다. 예를 들어 다음과 같은 속성들을 포함할 수 있습니다:

| 속성명 | 타입 | 설명 |
|--------|------|------|
| Title | Title | 문서 제목 (기본 키) |
| Version | Rich text | 문서 버전 정보 |
| Tags | Multi-select | 문서 태그 |
| Author | People | 작성자 |
| Created | Created time | 생성일 (자동) |
| Last Editor | People | 최종 편집자 |
| Last Updated | Last edited time | 최종 수정일 (자동) |

### 노션에서 데이터베이스 생성하기

![노션 위키 데이터베이스](/assets/images/blog/notion-wiki-database.png)

1. **새 페이지 생성**: 노션에서 새 페이지를 만들고 `/database` 명령어로 데이터베이스를 생성합니다.
2. **속성 설정**: 위 스키마에 따라 각 속성을 추가하고 타입을 설정합니다.
3. **API 키 발급**: [노션 개발자 페이지](https://www.notion.so/my-integrations)에서 새 통합을 생성하고 API 키를 발급받습니다.
4. **데이터베이스 연결**: 생성한 데이터베이스 페이지에서 "연결 추가" → 생성한 통합을 선택합니다.
5. **데이터베이스 ID 확인**: 데이터베이스 URL에서 ID를 추출합니다.
   ```
   https://www.notion.so/your-workspace/DATABASE_ID?v=VIEW_ID
   ```

## 2. 노션 클라이언트 설정 및 타입 정의

### 노션 클라이언트 생성

`@notionhq/client`을 사용하여 노션 클라이언트를 생성합니다:

```typescript
import { Client } from '@notionhq/client'

/**
 * 노션 클라이언트 생성 함수
 */
function createNotionClient() {
  // Cloudflare 배포 시 fetch 컨텍스트 문제 해결 위해 this 바인딩
  const fetchWrapper = fetch.bind(globalThis)

  return new Client({
    auth: '<노션에서 발급받은 API 키>',
    fetch: fetchWrapper,
  })
}
```

### 타입 정의

문서 관리에 필요한 TypeScript 타입을 정의합니다:

```typescript
/**
 * 노션 페이지 데이터 타입
 */
export interface NotionPage {
  id: string
  url: string
  title: string
  version?: string
  tags: string[]
  author?: string
  created: string
  lastEditor?: string
  lastEdited: string
}
```

## 3. 문서 목록 조회

### 최근 문서 목록 가져오기

데이터베이스에서 최근 수정된 문서 목록을 가져오는 함수입니다:

```typescript
/**
 * 노션 데이터베이스에서 최근 페이지 목록을 가져옵니다
 */
export async function getRecentPages(limit: number = 10): Promise<NotionPage[]> {
  try {
    const notion = createNotionClient()
    const response = await notion.databases.query({
      database_id: '<노션 데이터베이스 ID>',
      sorts: [
        {
          property: 'Last Updated',
          direction: 'descending',
        },
      ],
      page_size: limit,
    })

    return response.results
      .filter(isPageObjectResponse)
      .map((page) => ({
        id: page.id,
        url: page.url,
        title: extractTitle(page.properties),
        version: extractVersion(page.properties),
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
```

### 속성 추출 유틸리티 함수들

노션 페이지 속성에서 데이터를 안전하게 추출하는 함수들입니다:

```typescript
/**
 * 노션 페이지 속성에서 제목을 안전하게 추출
 */
function extractTitle(properties: PageObjectResponse['properties']): string {
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
```

## 4. 문서 검색

### 검색 기능 구현

제목, 버전 등의 검색 조건과 커서 기반 페이지네이션을 지원하는 문서 검색 함수입니다:

```typescript
/**
 * 위키 검색 옵션
 */
export interface WikiSearchOptions {
  startCursor?: string
  pageSize?: number
  exactMatch?: boolean
  versions?: string[]
}

/**
 * 위키 제목으로 노션 페이지를 검색합니다
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
        ? { equals: title }
        : { contains: title },
    }

    // 추가 필터 구성
    const filters: any[] = [titleFilter]

    // 최종 필터 구성
    const finalFilter = filters.length > 1 ? { and: filters } : filters[0]

    const response = await notion.databases.query({
      database_id: '<노션 데이터베이스 ID>',
      filter: finalFilter,
      page_size: options?.pageSize ?? 20,
      start_cursor: options?.startCursor,
    })

    return {
      results: response.results
        .filter(isPageObjectResponse)
        .map(transformToNotionPage),
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
```

## 5. 문서 내용 조회

### 전체 페이지 컨텐츠 마크다운 변환

노션 페이지의 전체 내용을 마크다운 형식으로 변환하여 가져오는 함수입니다:

```typescript
import { NotionToMarkdown } from 'notion-to-md'

/**
 * 노션 페이지의 전체 컨텐츠를 마크다운으로 변환하여 반환합니다
 */
export async function getPageContentAsMarkdown(pageId: string): Promise<string> {
  try {
    const notion = createNotionClient()
    
    // NotionToMarkdown 인스턴스 생성
    const n2m = new NotionToMarkdown({ 
      notionClient: notion,
      config: {
        parseChildPages: false, // 자식 페이지는 파싱하지 않음
        convertImagesToBase64: false, // 이미지를 base64로 변환하지 않음
      }
    })

    // 페이지의 모든 블록을 마크다운으로 변환
    const mdblocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdblocks)

    return mdString.parent
  } catch (error) {
    console.error('노션 페이지 마크다운 변환 실패:', error)
    throw new Error(
      `노션 페이지를 마크다운으로 변환하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    )
  }
}
```

이 함수는 `notion-to-md` 라이브러리를 사용하여 노션 페이지의 모든 블록을 마크다운으로 변환합니다. 설정 옵션을 통해 자식 페이지 파싱이나 이미지 base64 변환을 제어할 수 있습니다.

### 페이지 프리뷰 가져오기

문서의 처음 몇 블록을 가져와서 프리뷰를 생성하는 함수입니다:

```typescript
/**
 * 노션 페이지의 프리뷰 내용을 가져옵니다
 */
export async function getPagePreview(pageId: string): Promise<string> {
  try {
    const notion = createNotionClient()
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 3, // 처음 3개 블록만 가져오기
    })

    // 블록에서 텍스트를 추출하는 재귀 함수
    const extractTextFromBlock = async (block: any): Promise<string[]> => {
      const texts: string[] = []

      // 기본 텍스트 블록 처리
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        texts.push(
          block.paragraph.rich_text
            .map((text: any) => text.plain_text)
            .join('')
        )
      }

      // 리스트 아이템 처리
      if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
        texts.push(
          block.bulleted_list_item.rich_text
            .map((text: any) => text.plain_text)
            .join('')
        )
      }

      // 자식 블록이 있는 경우 재귀적으로 처리
      if (block.has_children) {
        try {
          const childResponse = await notion.blocks.children.list({
            block_id: block.id,
            page_size: 2,
          })

          for (const childBlock of childResponse.results) {
            const childTexts = await extractTextFromBlock(childBlock)
            texts.push(...childTexts)
          }
        } catch (error) {
          console.warn('자식 블록 가져오기 실패:', error)
        }
      }

      return texts
    }

    // 모든 블록에서 텍스트 추출
    const allTexts: string[] = []
    for (const block of response.results) {
      const blockTexts = await extractTextFromBlock(block)
      allTexts.push(...blockTexts)

      // 충분한 텍스트를 얻었으면 중단
      if (allTexts.join(' ').length > 200) break
    }

    const previewText = allTexts
      .filter((text: string) => text.trim().length > 0)
      .join(' ')

    // 프리뷰 텍스트가 너무 길면 자르기 (300자 제한)
    const MAX_LENGTH = 300
    return previewText.length > MAX_LENGTH
      ? previewText.substring(0, MAX_LENGTH) + '...'
      : previewText
  } catch (error) {
    console.error('페이지 프리뷰 가져오기 실패:', error)
    return '프리뷰를 불러올 수 없습니다.'
  }
}
```

이 함수는 위키 링크의 프리뷰 팝업을 보여주는데 사용됩니다.

## 6. 문서 저장

### 새 문서 생성

마크다운 콘텐츠를 노션 페이지로 변환하여 저장하는 함수입니다:

```typescript
import { markdownToBlocks } from '@tryfabric/martian'

/**
 * 위키 콘텐츠를 노션 데이터베이스에 새 페이지로 생성합니다
 */
export async function createWikiPage(
  title: string,
  content: string,
  version: string,
  tags: string[] = []
): Promise<{ pageId: string; url: string }> {
  try {
    // 마크다운 콘텐츠를 노션 블록으로 변환
    const allBlocks = convertMarkdownToBlocks(content)
    const notion = createNotionClient()

    // 1. 빈 페이지 생성
    // NOTE: 생성 단계에서 전체 컨텐츠를 children으로 넘기면 100개 제한으로 인해 오류가 발생할 수 있으므로,
    //       우선 빈 페이지를 생성한 후에 100개 단위로 블록을 추가
    const response = await notion.pages.create({
      parent: {
        database_id: '<노션 데이터베이스 ID>',
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
        Tags: {
          multi_select: tags.map((tag) => ({ name: tag })),
        },
      },
      children: [], // 빈 children으로 초기화
    })

    const pageId = response.id

    // 2. 블록을 100개 단위로 나누어 추가
    const BATCH_SIZE = 100
    for (let i = 0; i < allBlocks.length; i += BATCH_SIZE) {
      const batch = allBlocks.slice(i, i + BATCH_SIZE)
      await notion.blocks.children.append({
        block_id: pageId,
        children: batch,
      })
    }

    // 노션 페이지 URL 생성
    const pageUrl = `https://www.notion.so/${pageId.replace(/-/g, '')}`

    return {
      pageId,
      url: pageUrl,
    }
  } catch (error) {
    console.error('노션 페이지 생성 실패:', error)
    throw new Error(
      `노션 페이지 생성 중 오류가 발생했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    )
  }
}

/**
 * 마크다운 텍스트를 노션 블록으로 변환합니다
 */
function convertMarkdownToBlocks(markdown: string): BlockObjectRequest[] {
  try {
    return markdownToBlocks(markdown) as BlockObjectRequest[]
  } catch (error) {
    console.error('마크다운 변환 중 오류 발생:', error)
    return []
  }
}
```

생성 단계에서 전체 컨텐츠를 children으로 넘기면 100개 제한으로 인해 오류가 발생할 수 있으므로, 우선 빈 페이지를 생성한 후에 100개 단위로 블록을 추가합니다.

## 7. 활용 예제

### React 컴포넌트에서 사용하기

```typescript
import React, { useState, useEffect } from 'react'
import { getRecentPages, searchWikiPage, type NotionPage } from './lib/notion'

export function DocumentList() {
  const [documents, setDocuments] = useState<NotionPage[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // 최근 문서 목록 로드
  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoading(true)
      try {
        const pages = await getRecentPages(20)
        setDocuments(pages)
      } catch (error) {
        console.error('문서 목록 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentDocuments()
  }, [])

  // 검색 기능
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      const pages = await getRecentPages(20)
      setDocuments(pages)
      return
    }

    setLoading(true)
    try {
      const result = await searchWikiPage(term, {
        exactMatch: false,
        pageSize: 20,
      })
      setDocuments(result.results)
    } catch (error) {
      console.error('검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="document-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="문서 검색..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            handleSearch(e.target.value)
          }}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <div className="document-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <h3>{doc.title}</h3>
              <p>태그: {doc.tags.join(', ')}</p>
              <p>수정일: {new Date(doc.lastEdited).toLocaleDateString()}</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                노션에서 보기
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### API 엔드포인트 구현

```typescript
// pages/api/documents/search.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { searchWikiPage } from '../../../lib/notion'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { q, exact } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Search query is required' })
  }

  try {
    const result = await searchWikiPage(q, {
      exactMatch: exact === 'true',
      pageSize: 20,
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('Search API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

## 참고 자료

- [노션 API 공식 문서](https://developers.notion.com/)
- [노션 JavaScript SDK](https://github.com/makenotion/notion-sdk-js)
- [@tryfabric/martian - 마크다운 to 노션 블록 변환기](https://github.com/tryfabric/martian)
- [노션 API 레이트 리밋 가이드](https://developers.notion.com/reference/request-limits)
