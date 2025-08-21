import type { NotionPage } from '@/lib/notion'

/**
 * 노션 API 응답 타입
 */
export interface NotionApiResponse {
  success: boolean
  data: NotionPage[]
  count: number
  message?: string
}
