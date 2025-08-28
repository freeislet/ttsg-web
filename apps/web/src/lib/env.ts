// Env 전역 캐시 선언
declare global {
  type EnvKey = keyof Env
  var runtimeEnv: Env
  var getEnv: (key: EnvKey) => string
}

/**
 * Env 전역 캐시 조회
 * - 전역 사용 위해 middleware에서 import
 */
globalThis.getEnv ??= (key: EnvKey): string => {
  // console.log(key, globalThis.runtimeEnv?.[key], import.meta.env[key])
  const value = globalThis.runtimeEnv?.[key] ?? import.meta.env[key]
  if (value === undefined) {
    throw new Error(`Env key "${key}" not found`)
  }
  if (typeof value !== 'string') {
    throw new Error(`Env key "${key}" is not a string`)
  }
  return value
}

export {}
