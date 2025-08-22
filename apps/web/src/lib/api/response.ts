/**
 * API 응답 생성을 위한 유틸리티 함수들
 */

import type { ErrorResponseData } from './types'

/**
 * JSON 응답을 생성합니다.
 * @param data 응답 데이터 객체
 * @param status HTTP 상태 코드 (기본값: 200)
 * @param headers 추가 헤더 (기본값: JSON Content-Type)
 * @returns Response 객체
 */
export function createJsonResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * 성공 응답을 생성합니다.
 * @param data 응답 데이터
 * @param status HTTP 상태 코드 (기본값: 200)
 * @returns Response 객체
 */
export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return createJsonResponse(data, status)
}

/**
 * 오류 응답을 생성합니다.
 * @param message 오류 메시지
 * @param status HTTP 상태 코드 (기본값: 400)
 * @param data 추가 데이터 (선택적)
 * @returns Response 객체
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  data?: Record<string, unknown>
): Response {
  const errorData: ErrorResponseData = {
    success: false,
    message,
    ...(data && { ...data }),
  }

  return createJsonResponse(errorData, status)
}

/**
 * 서버 오류 응답을 생성합니다.
 * @param error 오류 객체 또는 메시지
 * @returns Response 객체
 */
export function createServerErrorResponse(error: unknown): Response {
  let message: string

  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    try {
      message = String(error.toString())
    } catch {
      //
    }
  }

  message ??= 'Unknown error'

  return createErrorResponse(`서버 오류가 발생했습니다: ${message}`, 500)
}

export {
  createJsonResponse as responseJson,
  createSuccessResponse as responseSuccess,
  createErrorResponse as responseError,
  createServerErrorResponse as responseServerError,
}
