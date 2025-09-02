import { useEffect, useRef } from 'react'
import { WikiLink } from '../wiki/WikiLink'
import { extractWikiLinks } from '../../lib/wiki-parser'

/**
 * 위키 링크가 강화된 블로그 콘텐츠 컴포넌트
 */
interface WikiEnhancedContentProps {
  content: string // 마크다운 HTML 콘텐츠
  className?: string
}

/**
 * 블로그 콘텐츠에서 위키 링크를 찾아 WikiLink 컴포넌트로 교체합니다
 */
export function WikiEnhancedContent({ content, className = '' }: WikiEnhancedContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // 위키 링크 패턴을 찾아서 WikiLink 컴포넌트로 교체
    const processWikiLinks = () => {
      const element = contentRef.current!
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      )

      const textNodes: Text[] = []
      let node: Node | null

      // 모든 텍스트 노드 수집
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text)
      }

      // 각 텍스트 노드에서 위키 링크 처리
      textNodes.forEach((textNode) => {
        const text = textNode.textContent || ''
        const wikiLinks = extractWikiLinks(text)

        if (wikiLinks.length > 0) {
          // 위키 링크가 있는 경우 HTML로 변환
          let processedText = text
          
          wikiLinks.forEach((link) => {
            const wikiLinkElement = `<span class="wiki-link-placeholder" data-wiki-title="${link.title}" data-wiki-display="${link.displayText}">${link.displayText}</span>`
            processedText = processedText.replace(link.originalMatch, wikiLinkElement)
          })

          // 새로운 HTML 요소로 교체
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = processedText
          
          // 텍스트 노드를 새로운 요소들로 교체
          const parent = textNode.parentNode!
          while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, textNode)
          }
          parent.removeChild(textNode)
        }
      })

      // 플레이스홀더를 실제 WikiLink 컴포넌트로 교체
      const placeholders = element.querySelectorAll('.wiki-link-placeholder')
      placeholders.forEach((placeholder) => {
        const title = placeholder.getAttribute('data-wiki-title') || ''
        const displayText = placeholder.getAttribute('data-wiki-display') || title
        
        // React 컴포넌트를 DOM에 마운트하는 대신 이벤트 핸들러 추가
        const linkElement = document.createElement('span')
        linkElement.className = 'wiki-link inline-block text-blue-600 hover:text-blue-800 underline decoration-dotted cursor-pointer transition-colors duration-200'
        linkElement.textContent = displayText
        linkElement.setAttribute('data-wiki-title', title)
        linkElement.setAttribute('role', 'button')
        linkElement.setAttribute('tabindex', '0')
        linkElement.setAttribute('aria-label', `위키 페이지 '${title}' 열기`)

        // 클릭 이벤트 추가
        linkElement.addEventListener('click', async () => {
          try {
            const response = await fetch(`/api/wiki/preview?title=${encodeURIComponent(title)}`)
            const data = await response.json() as { success: boolean; data?: { url: string } }
            
            if (data.success && data.data?.url) {
              window.open(data.data.url, '_blank', 'noopener,noreferrer')
            }
          } catch (error) {
            console.error('위키 페이지 열기 실패:', error)
          }
        })

        // 키보드 이벤트 추가
        linkElement.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            linkElement.click()
          }
        })

        placeholder.parentNode?.replaceChild(linkElement, placeholder)
      })
    }

    // DOM이 완전히 로드된 후 처리
    setTimeout(processWikiLinks, 0)
  }, [content])

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
