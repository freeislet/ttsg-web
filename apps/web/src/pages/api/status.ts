import { responseJson } from '@/lib/api'

/**
 * API 예제: 기본 정보 반환
 * 경로: /api/status
 */
export async function GET() {
  return responseJson({
    message: 'TTSG API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}
