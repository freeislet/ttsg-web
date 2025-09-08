import type { MiddlewareHandler } from 'astro'
import '@/lib/env'
import '@/lib/errors'

export const onRequest: MiddlewareHandler = async (context, next) => {
  // AI Chat 앱 리다이렉트 처리
  if (context.url.pathname.startsWith('/apps/ai-chat')) {
    const redirectUrl = `https://ai-chat.ttsg.space${context.url.pathname.replace('/apps/ai-chat', '')}`
    return Response.redirect(redirectUrl, 301)
  }

  // 런타임 env를 전역에 반영 (덮어쓰기)
  if (!globalThis.runtimeEnv) {
    const env = context.locals.runtime?.env
    if (env) {
      globalThis.runtimeEnv = { ...env }
    }
  }
  return next()
}
