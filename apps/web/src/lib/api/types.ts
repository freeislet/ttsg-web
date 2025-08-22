/**
 * API 응답 관련 타입 정의
 */

/**
 * API 오류 응답 데이터 타입
 */
export interface ErrorResponseData {
  success: false
  message: string
  [key: string]: unknown
}

// /**
//  * API 성공 응답 데이터 타입
//  */
// export interface SuccessResponseData<T = unknown> {
//   success: true
//   data?: T
//   [key: string]: unknown
// }

// /**
//  * 일반적인 API 응답 데이터 타입
//  */
// export type ApiResponseData<T = unknown> = SuccessResponseData<T> | ErrorResponseData
