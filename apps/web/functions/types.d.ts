/**
 * Cloudflare Pages Functions 타입 정의
 */

interface Env {
  WIKI_BUCKET: R2Bucket
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string
  ): Promise<R2Object>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<R2Objects>
}

interface R2Object {
  key: string
  size: number
  etag: string
  httpEtag: string
  checksums: {
    md5?: string
    sha1?: string
    sha256?: string
    sha384?: string
    sha512?: string
  }
  uploaded: Date
  httpMetadata?: {
    contentType: string
    contentEncoding?: string
    contentLanguage?: string
    contentDisposition?: string
    cacheControl?: string
    cacheExpiry?: Date
  }
  customMetadata?: Record<string, string>
  range?: {
    offset: number
    length: number
  }
  body: ReadableStream
  bodyUsed: boolean
  text(): Promise<string>
  json<T>(): Promise<T>
  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
}

interface R2Objects {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
  delimitedPrefixes?: string[]
}

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string | string[]>
  data: Record<string, unknown>
  waitUntil: (promise: Promise<any>) => void
  next: () => Promise<Response>
}) => Response | Promise<Response>
