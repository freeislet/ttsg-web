import type { MiddlewareHandler } from 'astro'
import '@/lib/env'
import '@/lib/errors'

export const onRequest: MiddlewareHandler = async (context, next) => {
  // 런타임 env를 전역에 반영 (덮어쓰기)
  if (!globalThis.runtimeEnv) {
    const env = context.locals.runtime?.env
    if (env) {
      globalThis.runtimeEnv = { ...env }
    }
  }
  return next()
}
