/**
 * API 응답 관련 타입 정의
 */

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message: string
}
