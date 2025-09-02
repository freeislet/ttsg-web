import { convertWikiLinksToHtml } from './wiki-parser'

/**
 * 마크다운 콘텐츠에서 위키 링크를 처리합니다
 * @param markdown 원본 마크다운 텍스트
 * @returns 위키 링크가 HTML로 변환된 마크다운
 */
export function processWikiLinksInMarkdown(markdown: string): string {
  return convertWikiLinksToHtml(markdown)
}

/**
 * 렌더링된 HTML에서 위키 링크를 찾아 변환하고 이벤트 핸들러를 추가합니다
 * (클라이언트 사이드에서 실행)
 */
export function enhanceWikiLinksInHTML(): void {
  // 페이지 로드 후 위키 링크 강화
  if (typeof window === 'undefined') return

  // 먼저 [[위키링크]] 패턴을 찾아서 HTML로 변환
  const contentElements = document.querySelectorAll('.prose, .blog-content, article')
  
  contentElements.forEach((element) => {
    if (element.hasAttribute('data-wiki-processed')) return
    element.setAttribute('data-wiki-processed', 'true')
    
    // 텍스트 노드에서 위키 링크 패턴 찾기
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    const textNodes: Text[] = []
    let node
    
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text)
    }
    
    // 위키 링크 패턴을 HTML로 변환
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || ''
      const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
      
      if (wikiLinkRegex.test(text)) {
        const newHTML = text.replace(wikiLinkRegex, (match, title, displayText) => {
          const linkTitle = title.trim()
          const linkText = displayText ? displayText.trim() : linkTitle
          return `<span class="wiki-link cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-dotted" data-wiki-title="${linkTitle}">${linkText}</span>`
        })
        
        // 텍스트 노드를 HTML로 교체
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = newHTML
        
        const parent = textNode.parentNode
        if (parent) {
          while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, textNode)
          }
          parent.removeChild(textNode)
        }
      }
    })
  })

  // 변환된 위키 링크에 이벤트 핸들러 추가
  const wikiLinks = document.querySelectorAll('.wiki-link[data-wiki-title]')
  
  wikiLinks.forEach((link) => {
    const title = link.getAttribute('data-wiki-title')
    if (!title || link.hasAttribute('data-wiki-enhanced')) return

    // 이미 처리된 링크는 스킵
    link.setAttribute('data-wiki-enhanced', 'true')

    // 클릭 이벤트 추가
    link.addEventListener('click', async (e) => {
      e.preventDefault()
      
      try {
        const response = await fetch(`/api/wiki/preview?title=${encodeURIComponent(title)}`)
        const data = await response.json() as { success: boolean; data?: { url: string; title?: string } }
        
        if (data.success && data.data?.url) {
          // RAG의 경우 버전 선택 옵션 제공
          if (title.toLowerCase() === 'rag' && data.data.title?.toLowerCase().includes('rag')) {
            const userChoice = confirm(`${data.data.title} 페이지를 열시겠습니까?\n\n다른 RAG 관련 페이지를 찾으려면 '취소'를 클릭하세요.`)
            if (!userChoice) {
              // 사용자가 취소를 선택한 경우 검색 힌트 제공
              alert('RAG 관련 다른 페이지를 찾으려면:\n- "RAG 시스템"\n- "검색 증강 생성"\n- "Retrieval Augmented Generation"\n등의 키워드로 검색해보세요.')
              return
            }
          }
          
          window.open(data.data.url, '_blank', 'noopener,noreferrer')
        } else {
          console.warn('위키 페이지를 찾을 수 없습니다:', title)
        }
      } catch (error) {
        console.error('위키 페이지 열기 실패:', error)
      }
    })

    // 키보드 이벤트 추가
    link.addEventListener('keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent
      if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
        e.preventDefault()
        ;(link as HTMLElement).click()
      }
    })

    // hover 이벤트로 프리뷰 표시
    let hoverTimeout: NodeJS.Timeout
    let previewElement: HTMLElement | null = null
    
    link.addEventListener('mouseenter', (e) => {
      hoverTimeout = setTimeout(async () => {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        
        // 기존 프리뷰가 있다면 제거
        const existingPreview = document.querySelector('.wiki-preview-popup')
        if (existingPreview) {
          existingPreview.remove()
        }
        
        // 프리뷰 컨테이너 생성
        previewElement = document.createElement('div')
        previewElement.className = 'wiki-preview-popup fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm'
        previewElement.style.left = `${rect.left + rect.width / 2}px`
        previewElement.style.top = `${rect.bottom + 8}px`
        previewElement.style.transform = 'translateX(-50%)'
        
        // 로딩 상태 표시
        previewElement.innerHTML = `
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm text-gray-600">로딩 중...</span>
          </div>
        `
        
        document.body.appendChild(previewElement)
        
        try {
          // 프리뷰 데이터 로드
          const response = await fetch(`/api/wiki/preview?title=${encodeURIComponent(title)}`)
          const data = await response.json() as { success: boolean; data?: any; error?: string }
          
          if (data.success && data.data) {
            // 프리뷰 내용 표시
            previewElement.innerHTML = `
              <div class="space-y-2">
                <h3 class="font-semibold text-gray-900">${data.data.title}</h3>
                <div class="text-sm text-gray-600 line-clamp-3">
                  ${data.data.preview || '프리뷰를 불러올 수 없습니다.'}
                </div>
                <div class="text-xs text-gray-400">클릭하여 전체 페이지 보기</div>
              </div>
            `
          } else {
            previewElement.innerHTML = `
              <div class="text-sm text-gray-600">
                ${data.error || '페이지를 찾을 수 없습니다.'}
              </div>
            `
          }
        } catch (error) {
          previewElement.innerHTML = `
            <div class="text-sm text-red-600">
              프리뷰를 불러오는 중 오류가 발생했습니다.
            </div>
          `
        }
      }, 300)
    })

    link.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
      
      // 프리뷰 팝업 제거 (약간의 지연 후)
      setTimeout(() => {
        if (previewElement && !previewElement.matches(':hover')) {
          previewElement.remove()
          previewElement = null
        }
      }, 100)
    })
    
    // 프리뷰 팝업에서 마우스가 나갔을 때도 처리
    document.addEventListener('mouseover', (e) => {
      if (previewElement && !previewElement.contains(e.target as Node) && !link.contains(e.target as Node)) {
        setTimeout(() => {
          if (previewElement && !previewElement.matches(':hover') && !link.matches(':hover')) {
            previewElement.remove()
            previewElement = null
          }
        }, 100)
      }
    })
  })
}
