type Runtime = import('@astrojs/cloudflare').Runtime<Env>

declare namespace App {
  interface Locals extends Runtime {}
}

// Env 전역 캐시 선언
type EnvKey = keyof Env

declare global {
  var runtimeEnv: Env
  var getEnv: (key: EnvKey) => string
}
