import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { searchWikiPages, type NotionPage } from '@/client/wiki'
import { OpenInNewIcon } from '@/components/icons'

interface WikiSearchResultsProps {
  /** 검색어 */
  query: string
  /** 초기 검색 결과 (SSR에서 전달) */
  initialResults?: NotionPage[]
  /** 초기 페이지네이션 정보 */
  initialHasMore?: boolean
  initialNextCursor?: string | null
}

/**
 * 위키 검색 결과를 무한 스크롤로 표시하는 컴포넌트
 */
export default function WikiSearchResults({
  query,
  initialResults = [],
  initialHasMore = false,
  initialNextCursor = null,
}: WikiSearchResultsProps) {
  const [results, setResults] = useState<NotionPage[]>(initialResults)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [error, setError] = useState<string | null>(null)

  // 무한 스크롤을 위한 관찰 대상 요소
  const observerRef = useRef<HTMLDivElement>(null)

  /**
   * 추가 검색 결과를 로드하는 함수
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return

    setLoading(true)
    setError(null)

    try {
      const searchResult = await searchWikiPages(query, {
        startCursor: nextCursor,
      })

      // 기존 결과에 새 결과 추가
      setResults((prev) => [...prev, ...searchResult.results])
      setHasMore(searchResult.hasMore)
      setNextCursor(searchResult.nextCursor)
    } catch (err) {
      console.error('추가 검색 결과 로드 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [query, nextCursor, loading, hasMore])

  /**
   * Intersection Observer를 사용한 무한 스크롤 구현
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // 100px 전에 미리 로드
      }
    )

    const currentObserverRef = observerRef.current
    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [loadMore, hasMore, loading])

  /**
   * 검색어가 변경될 때 결과 초기화
   */
  useEffect(() => {
    setResults(initialResults)
    setHasMore(initialHasMore)
    setNextCursor(initialNextCursor)
    setError(null)
  }, [query, initialResults, initialHasMore, initialNextCursor])

  /**
   * 검색 결과 아이템 렌더링
   */
  const renderResultItem = (page: NotionPage, index: number) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
    const color = colors[index % colors.length]
    const date = new Date(page.lastEdited).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return (
      <div
        key={page.id}
        className={`border-l-4 border-${color}-500 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r-lg`}
      >
        <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-1">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-${color}-600 transition-colors flex items-center text-lg`}
          >
            {page.title}
            <OpenInNewIcon className="w-4 h-4 ml-1 text-gray-400" />
          </a>
          {page.version && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {page.version}
            </span>
          )}
        </h3>

        {/* 태그 표시 */}
        {page.tags && page.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {page.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded-full`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>최종 수정: {date}</span>
          {page.author && <span>작성자: {page.author}</span>}
          {page.language && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {page.language === 'ko' ? '한국어' : '영어'}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <Icon icon="mdi:file-search-outline" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
        <p className="text-gray-600">"{query}"에 대한 검색 결과를 찾을 수 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">다른 검색어를 시도해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 검색 결과 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">"{query}" 검색 결과</h2>
        <span className="text-sm text-gray-500">
          {results.length}개 결과
          {hasMore && ' (더 많은 결과 있음)'}
        </span>
      </div>

      {/* 검색 결과 목록 */}
      <div className="space-y-3">{results.map((page, index) => renderResultItem(page, index))}</div>

      {/* 무한 스크롤 트리거 */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">더 많은 결과를 불러오는 중...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">검색 중 오류가 발생했습니다</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadMore}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 모든 결과 로드 완료 메시지 */}
      {!hasMore && results.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <Icon icon="mdi:check-circle" className="w-6 h-6 mx-auto mb-2" />
          <p>모든 검색 결과를 불러왔습니다.</p>
        </div>
      )}
    </div>
  )
}
