/**
 * API 클라이언트 유틸리티
 * 서버 API와의 통신 및 Cloudflare R2 데이터 접근을 담당하는 모듈
 */

// API 기본 경로 설정
const API_BASE = getApiBaseUrl()
const WIKI_API_URL = `${API_BASE}/api/wiki` // 위키 API 엔드포인트
const BLOG_API_URL = `${API_BASE}/api/blog` // 블로그 API 엔드포인트

/**
 * 환경에 따른 API 기본 URL 반환
 * 로컬 개발 환경에서는 포트 8788 사용, 프로덕션에서는 상대 경로 사용
 */
function getApiBaseUrl(): string {
  // 브라우저 환경 확인
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location
    
    // 로컬 개발 환경(localhost 또는 127.0.0.1) 감지
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8788`
    }
  }
  
  // 프로덕션 환경 또는 비브라우저 환경에서는 상대 경로 사용
  return ''
}

/**
 * API 요청을 처리하는 공통 함수
 */
async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options)
    
    // 성공 응답
    if (response.ok) {
      // 응답이 JSON인 경우
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json() as T
        return { success: true, data, status: response.status }
      }
      
      // 응답이 텍스트인 경우
      const text = await response.text()
      return { success: true, data: text as unknown as T, status: response.status }
    }
    
    // 오류 응답
    const errorText = await response.text()
    return { 
      success: false, 
      error: errorText || `API 요청 실패: ${response.status} ${response.statusText}`,
      status: response.status
    }
  } catch (error) {
    console.error('API 요청 오류:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      status: 0
    }
  }
}

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  status: number
}

/**
 * 위키 API 관련 함수 모음
 */
export const wikiApi = {
  /**
   * 위키 페이지 목록 가져오기
   * @returns 위키 페이지 슬러그 배열
   */
  getList: async (): Promise<ApiResponse<string[]>> => {
    return apiRequest<string[]>(`${WIKI_API_URL}/list`)
  },
  
  /**
   * 위키 콘텐츠 가져오기
   * @param slug 위키 페이지 식별자
   * @returns 마크다운 콘텐츠
   */
  getContent: async (slug: string): Promise<ApiResponse<string>> => {
    return apiRequest<string>(`${WIKI_API_URL}/${slug}`)
  },
  
  /**
   * 위키 콘텐츠 저장
   * @param slug 위키 페이지 식별자
   * @param content 마크다운 콘텐츠
   * @returns 저장 결과
   */
  saveContent: async (slug: string, content: string): Promise<ApiResponse<unknown>> => {
    return apiRequest(`${WIKI_API_URL}/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: content
    })
  },
  
  /**
   * 위키 페이지 삭제
   * @param slug 위키 페이지 식별자
   * @returns 삭제 결과
   */
  deletePage: async (slug: string): Promise<ApiResponse<unknown>> => {
    return apiRequest(`${WIKI_API_URL}/${slug}`, {
      method: 'DELETE'
    })
  }
}

/**
 * 블로그 API 관련 함수 모음
 */
export const blogApi = {
  /**
   * 블로그 포스트 목록 가져오기
   * @returns 블로그 포스트 정보 배열
   */
  getList: async (): Promise<ApiResponse<unknown[]>> => {
    return apiRequest<unknown[]>(`${BLOG_API_URL}/list`)
  },
  
  /**
   * 블로그 포스트 가져오기
   * @param slug 블로그 포스트 식별자
   * @returns 블로그 포스트 콘텐츠
   */
  getPost: async (slug: string): Promise<ApiResponse<unknown>> => {
    return apiRequest<unknown>(`${BLOG_API_URL}/${slug}`)
  },
  
  /**
   * 블로그 포스트 저장
   * @param slug 블로그 포스트 식별자
   * @param content 마크다운 콘텐츠
   * @returns 저장 결과
   */
  savePost: async (slug: string, content: string): Promise<ApiResponse<unknown>> => {
    return apiRequest(`${BLOG_API_URL}/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/markdown'
      },
      body: content
    })
  }
}

// 하위 호환성 유지를 위한 기존 함수 (deprecated)
/**
 * @deprecated wikiApi.getContent 사용 권장
 */
export async function getWikiFromR2(slug: string): Promise<string | null> {
  const response = await wikiApi.getContent(slug)
  return response.success ? (response.data || null) : null
}

/**
 * @deprecated wikiApi.saveContent 사용 권장
 */
export async function saveWikiToR2(slug: string, content: string): Promise<boolean> {
  const response = await wikiApi.saveContent(slug, content)
  return response.success
}

/**
 * 모든 위키 페이지 목록 가져오기
 * @returns 페이지 식별자 배열
 */
export async function listWikiPages(): Promise<string[]> {
  try {
    const response = await fetch(`${WIKI_API_URL}/list`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('R2 list error:', error)
    return []
  }
}

/**
 * 위키 페이지 삭제
 * @param slug 위키 페이지 식별자
 * @returns 성공 여부
 */
export async function deleteWikiPage(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${WIKI_API_URL}/${slug}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}

/**
 * R2에서 블로그 콘텐츠 가져오기
 * @param slug 블로그 포스트 식별자
 * @returns 마크다운 콘텐츠 또는 null
 */
export async function getBlogFromR2(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`${BLOG_API_URL}/${slug}`)
    if (response.ok) {
      return await response.text()
    }
    return null
  } catch (error) {
    console.error('R2 fetch error:', error)
    return null
  }
}

/**
 * 블로그 콘텐츠를 R2에 저장
 * @param slug 블로그 포스트 식별자
 * @param content 마크다운 콘텐츠
 * @returns 성공 여부
 */
export async function saveBlogToR2(slug: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${BLOG_API_URL}/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/markdown',
      },
      body: content,
    })

    return response.ok
  } catch (error) {
    console.error('R2 save error:', error)
    return false
  }
}

/**
 * 모든 블로그 포스트 목록 가져오기
 * @returns 포스트 식별자 배열
 */
export async function listBlogPosts(): Promise<string[]> {
  try {
    const response = await fetch(`${BLOG_API_URL}/list`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('R2 list error:', error)
    return []
  }
}

/**
 * 블로그 포스트 삭제
 * @param slug 블로그 포스트 식별자
 * @returns 성공 여부
 */
export async function deleteBlogPost(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${BLOG_API_URL}/${slug}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}
