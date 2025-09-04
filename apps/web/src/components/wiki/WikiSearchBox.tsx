import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface WikiSearchBoxProps {
  /** 초기 검색어 */
  initialQuery?: string
  /** 검색 실행 시 호출되는 콜백 함수 */
  onSearch?: (query: string) => void
  /** 검색 결과 페이지로 이동할지 여부 (기본값: true) */
  navigateToResults?: boolean
  /** 플레이스홀더 텍스트 */
  placeholder?: string
  /** 추가 CSS 클래스 */
  className?: string
  /** 자동 포커스 여부 */
  autoFocus?: boolean
}

/**
 * 위키 검색을 위한 재사용 가능한 검색창 컴포넌트
 */
export default function WikiSearchBox({
  initialQuery = '',
  onSearch,
  navigateToResults = true,
  placeholder = '위키 페이지를 검색하세요...',
  className = '',
  autoFocus = false,
}: WikiSearchBoxProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 컴포넌트 마운트 시 자동 포커스
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  /**
   * 검색어 변경 시 초기값 동기화
   */
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  /**
   * 검색 실행 함수
   */
  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()

    if (!trimmedQuery) {
      return
    }

    setIsSearching(true)

    try {
      // 커스텀 콜백이 있으면 실행
      if (onSearch) {
        onSearch(trimmedQuery)
      }

      // 검색 결과 페이지로 이동
      if (navigateToResults) {
        const searchParams = new URLSearchParams({ q: trimmedQuery })
        window.location.href = `/wiki/search?${searchParams}`
      }
    } catch (error) {
      console.error('검색 중 오류:', error)
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(query)
    }

    // Escape 키로 검색창 초기화
    if (e.key === 'Escape') {
      setQuery('')
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }

  /**
   * 검색창 초기화
   */
  const handleClear = () => {
    setQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        {/* 검색 아이콘 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            icon={isSearching ? 'mdi:loading' : 'mdi:magnify'}
            className={`w-5 h-5 text-gray-400 ${isSearching ? 'animate-spin' : ''}`}
          />
        </div>

        {/* 검색 입력창 */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSearching}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   disabled:bg-gray-50 disabled:text-gray-500
                   text-gray-900 placeholder-gray-500
                   transition-colors duration-200"
          aria-label="위키 검색"
        />

        {/* 검색창 우측 버튼들 */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {/* 초기화 버튼 */}
          {query && !isSearching && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full 
                       hover:bg-gray-100 transition-colors"
              aria-label="검색어 초기화"
            >
              <Icon icon="mdi:close" className="w-4 h-4" />
            </button>
          )}

          {/* 검색 버튼 */}
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="mr-2 px-3 py-1 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors duration-200"
            aria-label="검색 실행"
          >
            {isSearching ? (
              <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
            ) : (
              <span className="text-sm font-medium">검색</span>
            )}
          </button>
        </div>
      </div>

      {/* 검색 힌트 */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex flex-wrap gap-4">
          <span>💡 팁: Enter 키로 검색</span>
          <span>⌨️ Esc 키로 초기화</span>
        </div>
      </div>
    </form>
  )
}
