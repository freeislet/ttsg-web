import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { WikiLink } from './WikiLink'

/**
 * 블로그 콘텐츠에서 ((위키링크)) 패턴을 찾아 React WikiLink 컴포넌트로 변환하는 프로세서
 * 클라이언트 사이드에서 DOM 조작을 통해 마크다운 렌더링 후 위키링크를 처리합니다.
 */
export function WikiLinkProcessor() {
  useEffect(() => {
    /**
     * 위키링크 패턴을 찾아 React 컴포넌트로 교체
     */
    const processWikiLinks = () => {
      // 블로그/위키 마크다운 콘텐츠 영역에서 위키링크 처리
      const contentElements = document.querySelectorAll('.prose, .md-content, article')

      contentElements.forEach((element) => {
        // 이미 처리된 요소는 스킵
        if (element.hasAttribute('data-wiki-processed')) return
        element.setAttribute('data-wiki-processed', 'true')

        // 텍스트 노드에서 위키링크 패턴 찾기
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            // 코드 블록 내부는 제외
            const parent = node.parentElement
            if (parent?.tagName === 'CODE' || parent?.closest('pre, code')) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          },
        })

        const textNodes: Text[] = []
        let node
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text)
        }

        // 각 텍스트 노드에서 위키링크 패턴 처리
        textNodes.forEach((textNode) => {
          const text = textNode.textContent || ''
          const wikiLinkRegex = /\(\(([^)|]+)(?:\|([^)]+))?\)\)/g

          if (wikiLinkRegex.test(text)) {
            const parent = textNode.parentNode
            if (!parent) return

            // 위키링크 패턴을 분할하여 처리
            const parts: string[] = []
            const matches: Array<{ title: string; displayText?: string }> = []
            let lastIndex = 0

            // 정규식으로 모든 매치 찾기
            text.replace(wikiLinkRegex, (match, title, displayText, offset) => {
              // 매치 이전 텍스트 추가
              if (offset > lastIndex) {
                parts.push(text.substring(lastIndex, offset))
              }

              // 위키링크 정보 저장
              matches.push({
                title: title.trim(),
                displayText: displayText?.trim(),
              })
              parts.push('WIKILINK_PLACEHOLDER')

              lastIndex = offset + match.length
              return match
            })

            // 마지막 텍스트 추가
            if (lastIndex < text.length) {
              parts.push(text.substring(lastIndex))
            }

            // 새로운 DOM 구조 생성
            const fragment = document.createDocumentFragment()
            let matchIndex = 0

            parts.forEach((part) => {
              if (part === 'WIKILINK_PLACEHOLDER') {
                // WikiLink React 컴포넌트로 교체
                const match = matches[matchIndex++]
                if (match) {
                  const container = document.createElement('span')
                  container.className = 'wiki-link-container'

                  // React 컴포넌트 렌더링
                  const root = createRoot(container)
                  root.render(<WikiLink title={match.title} displayText={match.displayText} />)

                  fragment.appendChild(container)
                }
              } else if (part) {
                // 일반 텍스트
                fragment.appendChild(document.createTextNode(part))
              }
            })

            // 원본 텍스트 노드를 새로운 fragment로 교체
            parent.replaceChild(fragment, textNode)
          }
        })
      })
    }

    // 초기 처리
    processWikiLinks()

    // 동적 콘텐츠 변경 감지 (MutationObserver)
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 새로운 노드가 추가된 경우에만 처리
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (
                element.matches('.prose, .md-content, article') ||
                element.querySelector('.prose, .md-content, article')
              ) {
                shouldProcess = true
              }
            }
          })
        }
      })

      if (shouldProcess) {
        // 약간의 지연 후 처리 (DOM 업데이트 완료 대기)
        setTimeout(processWikiLinks, 100)
      }
    })

    // 마크다운 콘텐츠 영역 관찰 시작
    const mdContent = document.querySelector('.md-content, article, main')
    if (mdContent) {
      observer.observe(mdContent, {
        childList: true,
        subtree: true,
      })
    }

    // 컴포넌트 언마운트 시 observer 정리
    return () => {
      observer.disconnect()
    }
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}
