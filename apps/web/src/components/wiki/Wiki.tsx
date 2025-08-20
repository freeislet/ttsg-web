import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { OpenInNewIcon } from '@/components/icons'
import type { NotionPage, NotionApiResponse } from '@/types'

/**
 * 위키 페이지의 메인 컨텐츠를 담당하는 React 컴포넌트
 * 노션 위키 링크와 최근 문서 목록을 표시합니다.
 */
export default function Wiki() {
  const [pages, setPages] = useState<NotionPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 노션 API에서 최근 페이지 목록을 가져오는 함수
   */
  const loadRecentPages = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notion-pages.json')
      const result: NotionApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API 호출 실패')
      }

      setPages(result.data)
    } catch (err) {
      console.error('노션 페이지 로딩 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 컴포넌트 마운트 시 페이지 목록 로드
   */
  useEffect(() => {
    loadRecentPages()
  }, [])

  /**
   * 페이지 목록 렌더링 함수
   */
  const renderPageList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">노션에서 최신 문서를 불러오는 중...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">문서 목록을 불러올 수 없습니다</span>
          </div>
          <p className="text-red-600 text-sm mt-2">
            노션 API 연결에 문제가 있습니다. 환경변수 설정을 확인해주세요.
          </p>
          <div className="mt-3">
            <button
              onClick={loadRecentPages}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    if (pages.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <Icon icon="mdi:file-document-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">아직 문서가 없습니다.</p>
        </div>
      )
    }

    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']

    return (
      <div className="space-y-3">
        {pages.map((page, index) => {
          const color = colors[index % colors.length]
          const date = new Date(page.lastEdited).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          return (
            <div
              key={page.url}
              className={`border-l-4 border-${color}-500 pl-4 py-2 hover:bg-gray-50 transition-colors`}
            >
              <h3 className="font-medium text-gray-900">
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hover:text-${color}-600 transition-colors flex items-center`}
                >
                  {page.title}
                  <OpenInNewIcon className="w-4 h-4 ml-1 text-gray-400" />
                </a>
              </h3>
              <span className="text-xs text-gray-500">최종 수정: {date}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TT Wiki</h1>
        <p className="text-lg text-gray-600 mb-6">
          TTSG 프로젝트의 문서와 지식을 관리하는 위키 페이지입니다.
        </p>
      </div>

      {/* 노션 위키 링크 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Icon icon="mdi:book-open-variant" className="w-6 h-6 mr-2 text-blue-600" />
          노션 위키
        </h2>
        <p className="text-gray-600 mb-4">
          TTSG 프로젝트의 모든 문서와 가이드는 노션에서 관리됩니다.
        </p>
        <a
          href="https://www.notion.so/TT-Wiki-24fffc6454ce806ebaeeee1a0497640d"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700"
        >
          <Icon icon="simple-icons:notion" className="w-5 h-5 mr-2" />
          TT Wiki 바로가기
          <OpenInNewIcon className="w-4 h-4 ml-2" />
        </a>
      </div>

      {/* 최근 문서 목록 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Icon icon="mdi:file-document-multiple" className="w-6 h-6 mr-2 text-green-600" />
          최근 문서
        </h2>
        <p className="text-gray-600 mb-4">노션 위키의 최근 업데이트된 문서 목록입니다.</p>

        {renderPageList()}
      </div>
    </>
  )
}
