/**
 * 노션 페이지 데이터 타입
 */
export interface NotionPageData {
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
  data: NotionPageData[]
  count: number
  message?: string
}
