/**
 * API 응답 관련 타입 정의
 */

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

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message: string
}
