/**
 * API 예제: 기본 정보 반환
 * 경로: /api/status
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'TTSG API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
