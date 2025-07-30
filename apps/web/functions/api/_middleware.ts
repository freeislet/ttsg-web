/**
 * Cloudflare Pages Function Middleware for API
 *
 * 인증 및 권한 검사를 위한 미들웨어입니다.
 * 현재는 모든 요청을 허용하지만, 나중에 인증 로직을 구현할 수 있습니다.
 */

export const onRequest: PagesFunction = async ({ request, next }) => {
  // 쓰기 작업만 인증 필요 (PUT, POST, DELETE)
  if (['PUT', 'POST', 'DELETE'].includes(request.method)) {
    // TODO: 여기에 인증 로직 구현 (JWT, 세션 등)
    // 인증 실패 시 예시:
    // return new Response('Unauthorized', { status: 401 });
  }

  // 인증 성공 또는 읽기 작업은 계속 진행
  return next()
}
