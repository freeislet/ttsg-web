import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { WikiLink } from './WikiLink'

/**
 * 블로그 콘텐츠에서 [[WikiLink]] 패턴을 찾아 React WikiLink 컴포넌트로 교체하는 컴포넌트
 */
export function WikiLinkProcessor() {
  useEffect(() => {
    // DOM이 완전히 로드된 후 WikiLink 패턴을 처리
    const processWikiLinks = () => {
      // 블로그 콘텐츠 영역에서만 처리
      const contentElements = document.querySelectorAll('.blog-content, .prose')

      contentElements.forEach((element) => {
        // 이미 처리된 요소는 스킵
        if (element.hasAttribute('data-wikilink-processed')) return
        element.setAttribute('data-wikilink-processed', 'true')

        // 텍스트 노드를 찾아서 WikiLink 패턴 처리
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            // 코드 블록이나 이미 처리된 요소는 제외
            let parent = node.parentElement
            while (parent) {
              if (
                parent.tagName === 'CODE' ||
                parent.tagName === 'PRE' ||
                parent.classList.contains('wiki-link') ||
                parent.hasAttribute('data-wikilink-processed')
              ) {
                return NodeFilter.FILTER_REJECT
              }
              parent = parent.parentElement
            }
            return NodeFilter.FILTER_ACCEPT
          },
        })

        const textNodes: Text[] = []
        let node

        // 모든 텍스트 노드 수집
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text)
        }
        
        console.log('수집된 텍스트 노드 수:', textNodes.length)
        textNodes.forEach((textNode, index) => {
          console.log(`텍스트 노드 ${index}:`, textNode.textContent, 'in', textNode.parentElement?.tagName)
        })

        // 각 텍스트 노드에서 WikiLink 패턴 처리
        textNodes.forEach((textNode) => {
          const text = textNode.textContent || ''
          const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

          if (wikiLinkRegex.test(text)) {
            console.log('WikiLink 패턴 발견:', text, 'in', textNode.parentElement?.tagName)
            // WikiLink 패턴이 있는 경우 처리
            processTextNodeWithWikiLinks(textNode, text)
          }
        })
      })
    }

    // DOM 로드 대기 후 처리 - 더 강력한 대기 로직
    const initializeWikiLinks = (retryCount = 0) => {
      console.log(`WikiLinkProcessor 시작 (시도 ${retryCount + 1})`)
      
      // DOM 요소 확인
      const contentElements = document.querySelectorAll('.blog-content, .prose')
      console.log('찾은 콘텐츠 요소:', contentElements.length, contentElements)
      
      // DOM 구조 디버깅
      console.log('현재 DOM 구조:')
      try {
        const allElements = document.querySelectorAll('*')
        const relevantElements = Array.from(allElements).filter(el => {
          const className = el.getAttribute('class') || ''
          return className.includes('blog-content') || 
                 className.includes('prose') ||
                 className.includes('content')
        })
        relevantElements.forEach(el => {
          const className = el.getAttribute('class') || ''
          const textContent = el.textContent || ''
          console.log(`- ${el.tagName}.${className}: "${textContent.substring(0, 50)}..."`)
        })
      } catch (error) {
        console.error('DOM 구조 디버깅 중 오류:', error)
      }
      
      // 콘텐츠 요소가 있고 실제 텍스트 콘텐츠가 있는지 확인
      let hasContent = false
      contentElements.forEach(element => {
        if (element.textContent && element.textContent.trim().length > 0) {
          hasContent = true
          console.log('콘텐츠 발견:', element.textContent.substring(0, 100) + '...')
        }
      })
      
      if (contentElements.length > 0 && hasContent) {
        console.log('콘텐츠 로드 완료, WikiLink 처리 시작')
        processWikiLinks()
      } else if (retryCount < 50) { // 최대 5초 대기 (100ms * 50)
        // 콘텐츠가 아직 로드되지 않았다면 잠시 후 재시도
        console.log('콘텐츠 로드 대기 중...')
        setTimeout(() => initializeWikiLinks(retryCount + 1), 100)
      } else {
        console.warn('WikiLinkProcessor: 콘텐츠 로드 타임아웃')
      }
    }

    // 다양한 시점에서 초기화 시도
    // 1. 즉시 시도
    initializeWikiLinks()
    
    // 2. requestAnimationFrame으로 브라우저 렌더링 후 시도
    requestAnimationFrame(() => {
      setTimeout(() => initializeWikiLinks(), 50)
    })
    
    // 3. DOMContentLoaded 이벤트 후 시도 (이미 로드된 경우에도 실행됨)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => initializeWikiLinks(), 100)
      })
    }

    // 동적으로 추가되는 콘텐츠를 위한 MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (
                element.classList.contains('blog-content') ||
                element.classList.contains('prose')
              ) {
                processWikiLinks()
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
}

/**
 * 텍스트 노드에서 WikiLink 패턴을 찾아 React 컴포넌트로 교체
 */
function processTextNodeWithWikiLinks(textNode: Text, text: string) {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  const parent = textNode.parentNode
  if (!parent) return

  // 텍스트를 분할하여 WikiLink와 일반 텍스트로 나눔
  const parts: Array<{
    type: 'text' | 'wikilink'
    content: string
    title?: string
    displayText?: string
  }> = []
  let lastIndex = 0
  let match

  while ((match = wikiLinkRegex.exec(text)) !== null) {
    // 이전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    // WikiLink 추가
    const title = match[1].trim()
    const displayText = match[2] ? match[2].trim() : title
    parts.push({
      type: 'wikilink',
      content: match[0],
      title,
      displayText,
    })

    lastIndex = match.index + match[0].length
  }

  // 마지막 텍스트 추가
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  // 원본 텍스트 노드를 새로운 요소들로 교체
  const fragment = document.createDocumentFragment()

  parts.forEach((part) => {
    if (part.type === 'text') {
      // 일반 텍스트는 텍스트 노드로 추가
      fragment.appendChild(document.createTextNode(part.content))
    } else if (part.type === 'wikilink' && part.title) {
      // WikiLink는 React 컴포넌트로 렌더링
      const wikiLinkContainer = document.createElement('span')
      wikiLinkContainer.setAttribute('data-wikilink-container', 'true')

      // React 컴포넌트를 DOM에 렌더링
      const root = createRoot(wikiLinkContainer)
      root.render(<WikiLink title={part.title} displayText={part.displayText} />)

      fragment.appendChild(wikiLinkContainer)
    }
  })

  // 원본 텍스트 노드를 새로운 fragment로 교체
  parent.replaceChild(fragment, textNode)
}
