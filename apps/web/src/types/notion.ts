/**
 * 노션 페이지 데이터 타입
 */
export interface NotionPage {
  id: string
  title: string
  url: string
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
