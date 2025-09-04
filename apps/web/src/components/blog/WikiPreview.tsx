import { useState, useEffect, useRef } from 'react'
import type { NotionPage } from '@/lib/notion'

/**
 * 위키 프리뷰 팝업 컴포넌트 props
 */
interface WikiPreviewProps {
  title: string // 위키 제목
  position: { x: number; y: number } // 팝업 위치
  onClose: () => void // 닫기 콜백
  hideTimeoutRef?: React.MutableRefObject<NodeJS.Timeout | undefined> // 공유 타이머 참조
}

/**
 * 위키 페이지 프리뷰 데이터 타입
 */
interface WikiPreviewData extends NotionPage {
  preview: string
}

/**
 * API 응답 타입
 */
interface WikiPreviewResponse {
  success: boolean
  data?: WikiPreviewData
  allPages?: NotionPage[]
  error?: string
}

/**
 * 로딩 상태 타입
 */
type LoadingState = 'loading' | 'success' | 'error'

/**
 * 위키 프리뷰 팝업 컴포넌트
 * 노션 위키 페이지의 미리보기를 표시합니다.
 */
export function WikiPreview({
  title,
  position,
  onClose,
  hideTimeoutRef: sharedHideTimeoutRef,
}: WikiPreviewProps) {
  const [data, setData] = useState<WikiPreviewData | null>(null)
  const [allPages, setAllPages] = useState<NotionPage[]>([])
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [error, setError] = useState<string>('')
  const previewRef = useRef<HTMLDivElement>(null)
  // 공유된 hideTimeoutRef가 있으면 사용하고, 없으면 로컬 생성
  const hideTimeoutRef = sharedHideTimeoutRef || useRef<NodeJS.Timeout>()

  /**
   * 위키 프리뷰 데이터 로드
   */
  const loadPreviewData = async (language?: string, version?: string) => {
    try {
      setLoadingState('loading')
      const params = new URLSearchParams({ title })
      if (language) params.append('language', language)
      if (version) params.append('version', version)

      const response = await fetch(`/api/wiki/preview?${params.toString()}`)
      const result = (await response.json()) as WikiPreviewResponse

      console.log('WikiPreview API Response:', result) // 디버깅용

      if (result.success && result.data) {
        setData(result.data)
        setAllPages(result.allPages || [])
        setSelectedPage(result.data)
        setLoadingState('success')
        console.log('AllPages loaded:', result.allPages?.length || 0) // 디버깅용
      } else {
        setError(result.error || '페이지를 찾을 수 없습니다.')
        setLoadingState('error')
      }
    } catch (err) {
      console.error('WikiPreview load error:', err) // 디버깅용
      setError('프리뷰를 불러오는 중 오류가 발생했습니다.')
      setLoadingState('error')
    }
  }

  useEffect(() => {
    loadPreviewData()
  }, [title])

  /**
   * 마우스 호버 이벤트 핸들러
   */
  const handleMouseEnter = () => {
    // 숨김 타이머 취소 (프리뷰에 마우스가 올라가면 유지)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    // 200ms 지연 후 프리뷰 닫기
    hideTimeoutRef.current = setTimeout(() => {
      onClose()
    }, 200)
  }

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
      // 컴포넌트 언마운트 시 타이머 정리
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
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

  /**
   * 페이지 옵션 선택 핸들러
   */
  const handlePageSelect = (page: NotionPage) => {
    setSelectedPage(page)
    loadPreviewData(page.language, page.version)
  }

  /**
   * 고유한 페이지 옵션들 추출
   */
  const getUniqueOptions = () => {
    console.log('getUniqueOptions - allPages:', allPages) // 디버깅용

    if (!allPages || allPages.length === 0) {
      console.log('getUniqueOptions - no pages available')
      return []
    }

    const options = allPages.map((page) => {
      console.log('getUniqueOptions - mapping page:', {
        id: page.id,
        version: page.version,
        language: page.language,
      })
      return {
        ...page,
        displayVersion: page.version || 'Unknown',
        displayLanguage: page.language || 'ko',
      }
    })

    const uniqueOptions = options.filter(
      (option, index, self) =>
        index ===
        self.findIndex(
          (o) =>
            o.displayVersion === option.displayVersion &&
            o.displayLanguage === option.displayLanguage
        )
    )

    console.log('getUniqueOptions - unique options:', uniqueOptions.length, uniqueOptions)
    return uniqueOptions
  }

  /**
   * 언어별 배지 색상 반환
   */
  const getLanguageBadgeColor = (language: string) => {
    switch (language) {
      case 'ko':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'en':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div
      ref={previewRef}
      className="wiki-preview bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-hidden"
      style={getPopupStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

          {/* Version + Language 선택 옵션 */}
          {allPages.length > 1 && (
            <div className="border-b border-gray-100 pb-2">
              <div className="text-xs text-gray-600 mb-1">
                버전 선택: ({allPages.length}개 옵션)
              </div>
              <div className="flex flex-wrap gap-1">
                {getUniqueOptions().map((option) => (
                  <button
                    key={`${option.id}-${option.language}-${option.version}`}
                    onClick={() => handlePageSelect(option)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                      selectedPage?.id === option.id &&
                      selectedPage?.language === option.language &&
                      selectedPage?.version === option.version
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{option.displayVersion}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getLanguageBadgeColor(option.displayLanguage)}`}
                    >
                      {option.displayLanguage}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 디버깅용 임시 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 border border-gray-200 p-2 rounded">
              <div>allPages.length: {allPages.length}</div>
              <div>uniqueOptions: {getUniqueOptions().length}</div>
              <div>selectedPage: {selectedPage?.id || 'none'}</div>
            </div>
          )}

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
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <span>전체 내용 보기</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
