export interface AppErrorOptions {
  statusCode?: number
  cause?: Error
  context?: Record<string, unknown>
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly cause?: Error
  public readonly context?: Record<string, unknown>
  // public readonly isOperational: boolean

  constructor(message: string, options: AppErrorOptions = {}) {
    const { statusCode = 500, cause, context } = options

    super(message)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.cause = cause
    this.context = context
    // this.isOperational = true

    // 스택 트레이스 유지 (Node.js 환경에서만 유효)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 에러 객체로부터 에러 메시지를 추출합니다.
   * @param error 알 수 없는 타입의 에러 객체
   * @param defaultMessage 기본 에러 메시지
   * @returns 에러 메시지 문자열
   */
  static getMessage(error: unknown, defaultMessage?: string): string {
    if (error instanceof AppError) return error.message
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return defaultMessage ?? '알 수 없는 오류'
  }

  /**
   * 에러 객체를 AppError 인스턴스로 변환합니다.
   * @param error 알 수 없는 타입의 에러 객체
   * @param defaultMessage 기본 에러 메시지
   * @returns AppError 인스턴스
   */
  static fromError(error: unknown, defaultMessage?: string): AppError {
    if (error instanceof AppError) return error

    const message = this.getMessage(error, defaultMessage)

    return new AppError(message, {
      cause: error instanceof Error ? error : undefined,
    })
  }
}
