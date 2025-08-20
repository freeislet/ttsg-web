/**
 * 노션 페이지 데이터 타입
 */
export interface NotionPage {
  id: string
  url: string
  title: string
  version?: string
  language: 'ko' | 'en'
  tags: string[]
  author?: string
  created: string
  lastEditor?: string
  lastEdited: string
}

/**
 * 노션 API 응답 타입
 */
export interface NotionApiResponse {
  success: boolean
  data: NotionPage[]
  count: number
  message?: string
}
