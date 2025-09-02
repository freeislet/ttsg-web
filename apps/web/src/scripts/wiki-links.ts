/**
 * 위키 링크 클라이언트 사이드 처리 스크립트
 * 블로그 페이지에서 위키 링크에 인터랙션을 추가합니다.
 */

import { enhanceWikiLinksInHTML } from '../lib/markdown-utils'

/**
 * 페이지 로드 시 위키 링크 강화
 */
function initializeWikiLinks() {
  // DOM이 완전히 로드된 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceWikiLinksInHTML)
  } else {
    enhanceWikiLinksInHTML()
  }
}

// 스크립트 실행
initializeWikiLinks()

// 동적 콘텐츠 로드 시에도 위키 링크 처리
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // 새로 추가된 노드에서 위키 링크 처리
      setTimeout(enhanceWikiLinksInHTML, 0)
    }
  })
})

// 블로그 콘텐츠 영역 관찰
const blogContent = document.querySelector('.blog-content')
if (blogContent) {
  observer.observe(blogContent, {
    childList: true,
    subtree: true,
  })
}
