import { useState, useEffect, useRef } from 'react'
import { searchWikiPages, getWikiPreview, type NotionPage, type Language } from '@/client/wiki'
import { getLanguageBadgeColor } from '@/types/wiki'
import { OpenInNewIcon } from '../icons'

/**
 * 위키 프리뷰 팝업 컴포넌트 props
 */
interface WikiPreviewProps {
  title: string // 위키 제목
  position: { x: number; y: number } // 팝업 위치
  onClose: () => void // 닫기 콜백
  onMouseEnter?: () => void // 마우스 진입 시 호출될 콜백
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
export function WikiPreview({ title, position, onClose, onMouseEnter }: WikiPreviewProps) {
  const [data, setData] = useState<WikiPreviewData | null>(null)
  const [allPages, setAllPages] = useState<NotionPage[]>([])
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [error, setError] = useState<string>('')
  const previewRef = useRef<HTMLDivElement>(null)

  /**
   * 위키 프리뷰 데이터 로드
   */
  const loadPreviewData = async (language?: Language, version?: string) => {
    try {
      setLoadingState('loading')

      // 1단계: 위키 페이지 검색
      const searchResults = await searchWikiPages(title, {
        exactMatch: true,
        pageSize: 10,
        languages: language ? [language] : undefined,
        versions: version ? [version] : undefined,
      })
      const pages = searchResults.pages

      if (pages.length === 0) {
        setError('해당 위키 페이지를 찾을 수 없습니다.')
        setLoadingState('error')
        return
      }

      // 검색 결과 설정
      setAllPages(pages)
      const firstPage = pages[0]
      setSelectedPage(firstPage)

      // 2단계: 선택된 페이지의 프리뷰 내용 로드
      const previewContent = await getWikiPreview(firstPage.id)

      setData({
        ...firstPage,
        preview: previewContent,
      })
      setLoadingState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.')
      setLoadingState('error')
      console.error('위키 프리뷰 로드 오류:', err)
    }
  }

  useEffect(() => {
    loadPreviewData()
  }, [title])

  /**
   * 마우스 호버 이벤트 핸들러
   */
  const handleMouseEnter = () => {
    // WikiLink의 hide 타이머 취소를 위해 부모 콜백 호출
    onMouseEnter?.()
  }

  const handleMouseLeave = () => {
    onClose()
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
    const popupWidth = 400
    const popupHeight = 200
    const margin = 8

    // absolute positioning을 위해 스크롤 오프셋 추가
    let x = position.x - popupWidth / 2 + window.pageXOffset
    let y = position.y + 4 + window.pageYOffset

    // 화면 오른쪽 경계 체크
    if (x + popupWidth > window.innerWidth + window.pageXOffset - margin) {
      x = window.innerWidth + window.pageXOffset - popupWidth - margin
    }

    // 화면 왼쪽 경계 체크
    if (x < window.pageXOffset + margin) {
      x = window.pageXOffset + margin
    }

    // 화면 아래쪽 경계 체크
    if (y + popupHeight > window.innerHeight + window.pageYOffset - margin) {
      y = position.y - popupHeight - 8 + window.pageYOffset
    }

    return {
      position: 'absolute' as const,
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 9999,
    }
  }

  /**
   * 페이지 옵션 선택 핸들러
   */
  const handlePageSelect = async (page: NotionPage) => {
    // 현재 선택된 페이지와 동일한 경우 무시
    if (selectedPage?.id === page.id) {
      return
    }

    setSelectedPage(page)
    try {
      setLoadingState('loading')

      // 선택된 페이지의 프리뷰 내용 로드
      const previewContent = await getWikiPreview(page.id)

      setData({
        ...page,
        preview: previewContent,
      })
      setLoadingState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.')
      setLoadingState('error')
      console.error('위키 프리뷰 로드 오류:', err)
    }
  }

  return (
    <div
      ref={previewRef}
      className="wiki-preview bg-white border border-gray-200 rounded-md shadow-lg w-96 max-h-96 text-base font-normal overflow-y-auto"
      style={getPopupStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 초기 로딩 상태 */}
      {loadingState === 'loading' && !data && (
        <div className="flex items-center justify-center h-32 p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">로딩 중...</span>
        </div>
      )}

      {/* 초기 에러 상태 */}
      {loadingState === 'error' && !data && (
        <div className="text-center py-8 p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      )}

      {/* 데이터가 있을 때 (성공 또는 페이지 변경 중 로딩) */}
      {data && (
        <div className="space-y-2 p-3">
          {/* 헤더 */}
          <div className="space-y-2 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-lg">{data.title}</span>
              <div className="flex flex-wrap gap-1 items-center flex-shrink-0">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Version + Language 선택 옵션 */}
            <div className="flex flex-wrap gap-1">
              {allPages.map((page) => (
                <button
                  key={`${page.id}-${page.language}-${page.version}`}
                  onClick={() => handlePageSelect(page)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                    selectedPage?.id === page.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{page.version || 'Unknown'}</span>
                  {page.language && (
                    <span
                      className={`px-1 py-0 rounded text-xs font-medium border ${getLanguageBadgeColor(page.language)}`}
                    >
                      {page.language}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 프리뷰 내용 영역 */}
          {loadingState === 'loading' ? (
            <div className="flex items-center justify-center h-20 p-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-sm">로딩 중...</span>
            </div>
          ) : loadingState === 'error' ? (
            <div className="text-center py-4">
              <div className="text-red-500 mb-1">⚠️</div>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed">{data.preview}</div>
          )}

          {/* 액션 */}
          <div className="flex justify-end border-t border-gray-100 pt-1">
            <a
              href={`/wiki/${encodeURIComponent(data.title)}?version=${data.version ? encodeURIComponent(data.version) : ''}&language=${data.language ? data.language : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <span>전체 내용 보기</span>
              <OpenInNewIcon className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
