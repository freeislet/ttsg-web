export * from './AppError'
export * from './utils'

// 전역 선언
// - 전역 사용 위해 Layout.astro, middleware에서 import
import {
  AppError as AppErrorClass,
  type AppErrorOptions as AppErrorOptionsInterface,
} from './AppError'

declare global {
  type AppErrorOptions = AppErrorOptionsInterface
  var AppError: typeof AppErrorClass
  interface AppError extends InstanceType<typeof AppErrorClass> {}
}

globalThis.AppError ??= AppErrorClass
