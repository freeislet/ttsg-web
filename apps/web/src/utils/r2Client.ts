/**
 * R2 클라이언트 유틸리티
 * Cloudflare R2와의 통신을 담당하는 클라이언트 모듈
 */

const WIKI_API_URL = '/api/wiki' // 위키 API 엔드포인트
const BLOG_API_URL = '/api/blog' // 블로그 API 엔드포인트

/**
 * R2에서 위키 콘텐츠 가져오기
 * @param slug 위키 페이지 식별자
 * @returns 마크다운 콘텐츠 또는 null
 */
export async function getWikiFromR2(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`${WIKI_API_URL}/${slug}`)
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
 * 위키 콘텐츠를 R2에 저장
 * @param slug 위키 페이지 식별자
 * @param content 마크다운 콘텐츠
 * @returns 성공 여부
 */
export async function saveWikiToR2(slug: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${WIKI_API_URL}/${slug}`, {
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
