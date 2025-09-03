import { useState, useEffect, useRef } from 'react'
import type { NotionPage } from '@/lib/notion'

/**
 * 위키 프리뷰 팝업 컴포넌트 props
 */
interface WikiPreviewProps {
  title: string // 위키 제목
  position: { x: number; y: number } // 팝업 위치
  onClose: () => void // 닫기 콜백
}

/**
 * 위키 페이지 프리뷰 데이터 타입
 */
interface WikiPreviewData extends NotionPage {
  preview: string
}

/**
 * 로딩 상태 타입
 */
type LoadingState = 'loading' | 'success' | 'error'

/**
 * 위키 프리뷰 팝업 컴포넌트
 * 노션 위키 페이지의 미리보기를 표시합니다.
 */
export function WikiPreview({ title, position, onClose }: WikiPreviewProps) {
  const [data, setData] = useState<WikiPreviewData | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [error, setError] = useState<string>('')
  const previewRef = useRef<HTMLDivElement>(null)

  /**
   * 위키 프리뷰 데이터 로드
   */
  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setLoadingState('loading')
        const response = await fetch(`/api/wiki/preview?title=${encodeURIComponent(title)}`)
        const result = (await response.json()) as {
          success: boolean
          data?: WikiPreviewData
          error?: string
        }

        if (result.success && result.data) {
          setData(result.data)
          setLoadingState('success')
        } else {
          setError(result.error || '페이지를 찾을 수 없습니다.')
          setLoadingState('error')
        }
      } catch (err) {
        setError('프리뷰를 불러오는 중 오류가 발생했습니다.')
        setLoadingState('error')
      }
    }

    loadPreviewData()
  }, [title])

  /**
   * 팝업 외부 클릭 시 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // 약간의 지연 후 이벤트 리스너 추가 (팝업이 완전히 렌더링된 후)
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  /**
   * ESC 키로 닫기
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  /**
   * 팝업 위치 계산 (화면 경계 고려)
   */
  const getPopupStyle = () => {
    const popupWidth = 320
    const popupHeight = 200
    const margin = 16

    let x = position.x - popupWidth / 2
    let y = position.y

    // 화면 오른쪽 경계 체크
    if (x + popupWidth > window.innerWidth - margin) {
      x = window.innerWidth - popupWidth - margin
    }

    // 화면 왼쪽 경계 체크
    if (x < margin) {
      x = margin
    }

    // 화면 아래쪽 경계 체크
    if (y + popupHeight > window.innerHeight - margin) {
      y = position.y - popupHeight - 16 // 링크 위로 표시
    }

    return {
      position: 'fixed' as const,
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 9999,
    }
  }

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      ref={previewRef}
      className="wiki-preview bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-hidden"
      style={getPopupStyle()}
    >
      {loadingState === 'loading' && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      )}

      {loadingState === 'error' && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}

      {loadingState === 'success' && data && (
        <div className="space-y-3">
          {/* 헤더 */}
          <div className="border-b border-gray-100 pb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{data.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {data.tags.length > 0 && (
                <div className="flex gap-1">
                  {data.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {data.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{data.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 프리뷰 내용 */}
          <div className="text-sm text-gray-700 leading-relaxed">{data.preview}</div>

          {/* 메타데이터 */}
          <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
            <div className="flex justify-between items-center">
              <span>수정: {formatDate(data.lastEdited)}</span>
              {data.version && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">{data.version}</span>
              )}
            </div>
          </div>

          {/* 액션 */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => window.open(data.url, '_blank', 'noopener,noreferrer')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              전체 보기 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
