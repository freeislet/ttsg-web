/**
 * Cloudflare Pages Functions 모든 경로에 대한 함수
 * ttsg.pages.dev에서 ttsg.freeislet.workers.dev로의 301 리디렉션을 처리합니다.
 * 모든 요청 경로를 새 도메인으로 리디렉션합니다.
 */

// Pages Functions의 각 라우트 핸들러는 요청을 받아 응답을 반환하는 형태입니다.
export function onRequest(context) {
  const request = context.request
  const url = new URL(request.url)
  const targetUrl = 'https://ttsg.freeislet.workers.dev' + url.pathname + url.search

  // 301 Moved Permanently 상태 코드로 리디렉션
  //console.log('Redirecting to:', targetUrl)
  return Response.redirect(targetUrl, 301)
}
