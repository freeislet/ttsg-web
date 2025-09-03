/**
 * 마크다운 및 위키링크 처리 유틸리티 함수들
 */

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
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)

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
          return `<span class="wiki-link cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-dotted inline-flex items-center gap-1" data-wiki-title="${linkTitle}">
            ${linkText}
            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </span>`
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
        const data = (await response.json()) as {
          success: boolean
          data?: { url: string; title?: string }
        }

        if (data.success && data.data?.url) {
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
        previewElement.className =
          'wiki-preview-popup fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm'

        // 화면 크기 및 스크롤 위치 고려
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const scrollX = window.scrollX
        const scrollY = window.scrollY

        // 프리뷰 예상 크기 (최대 너비 384px = max-w-sm)
        const previewWidth = 384
        const previewHeight = 200 // 예상 높이

        // 기본 위치 계산
        let left = rect.left + rect.width / 2
        let top = rect.bottom + 8
        let transform = 'translateX(-50%)'

        // 좌우 경계 체크 및 조정
        if (left - previewWidth / 2 < scrollX + 16) {
          // 왼쪽으로 벗어나는 경우
          left = scrollX + 16 + previewWidth / 2
          transform = 'translateX(-50%)'
        } else if (left + previewWidth / 2 > scrollX + viewportWidth - 16) {
          // 오른쪽으로 벗어나는 경우
          left = scrollX + viewportWidth - 16 - previewWidth / 2
          transform = 'translateX(-50%)'
        }

        // 상하 경계 체크 및 조정
        if (top + previewHeight > scrollY + viewportHeight - 16) {
          // 아래로 벗어나는 경우, 링크 위쪽에 표시
          top = rect.top - previewHeight - 8

          // 위쪽에도 공간이 부족한 경우
          if (top < scrollY + 16) {
            top = scrollY + 16
          }
        }

        previewElement.style.left = `${left}px`
        previewElement.style.top = `${top}px`
        previewElement.style.transform = transform

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
          const data = (await response.json()) as { success: boolean; data?: any; error?: string }

          if (data.success && data.data) {
            // 프리뷰 내용 표시
            previewElement.innerHTML = `
              <div class="space-y-2">
                <h3 class="font-semibold text-gray-900">${data.data.title}</h3>
                <div class="text-sm text-gray-600 line-clamp-3">
                  ${data.data.preview || '프리뷰를 불러올 수 없습니다.'}
                </div>
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
      if (
        previewElement &&
        !previewElement.contains(e.target as Node) &&
        !link.contains(e.target as Node)
      ) {
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
