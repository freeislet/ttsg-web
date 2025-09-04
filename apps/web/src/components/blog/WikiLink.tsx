import { useState, useRef, useEffect } from 'react'
import { WikiPreview } from './WikiPreview'

/**
 * 위키 링크 컴포넌트 props
 */
interface WikiLinkProps {
  title: string // 위키 제목
  displayText?: string // 표시할 텍스트 (기본값: title)
  className?: string // 추가 CSS 클래스
}

/**
 * 위키 링크 컴포넌트
 * hover 시 프리뷰 팝업을 표시하고, 클릭 시 노션 페이지로 이동합니다.
 */
export function WikiLink({ title, displayText, className = '' }: WikiLinkProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const linkRef = useRef<HTMLSpanElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const hideTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * 마우스 호버 시 프리뷰 표시
   */
  const handleMouseEnter = (event: React.MouseEvent) => {
    // 기존 숨김 타이머 취소
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }

    // 디바운싱: 300ms 후에 프리뷰 표시
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = linkRef.current?.getBoundingClientRect()
      if (rect) {
        setPreviewPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        })
        setShowPreview(true)
      }
    }, 300)
  }

  /**
   * 마우스 떠날 시 프리뷰 숨김 (지연)
   */
  const handleMouseLeave = () => {
    // 디바운싱 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // 500ms 지연 후 프리뷰 숨김 (프리뷰로 이동할 시간 제공)
    hideTimeoutRef.current = setTimeout(() => {
      setShowPreview(false)
    }, 500)
  }

  /**
   * 프리뷰 닫기 핸들러
   */
  const handlePreviewClose = () => {
    setShowPreview(false)
    // 모든 타이머 정리
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }

  /**
   * 컴포넌트 언마운트 시 타이머 정리
   */
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <span
        ref={linkRef}
        className={`
          wiki-link 
          inline-block 
          text-blue-600 
          hover:text-blue-800 
          underline 
          decoration-dotted 
          cursor-default 
          transition-colors 
          duration-200
          ${className}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayText || title}
      </span>

      {/* 프리뷰 팝업 */}
      {showPreview && (
        <WikiPreview
          title={title}
          position={previewPosition}
          onClose={handlePreviewClose}
          hideTimeoutRef={hideTimeoutRef}
        />
      )}
    </>
  )
}
