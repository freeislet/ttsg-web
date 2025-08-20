import { useState, useEffect } from 'react'
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
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
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
                  <svg
                    className="w-4 h-4 ml-1 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
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
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l8.893-.621c.285 0 .047-.28-.093-.311L14.199 3.28c-.28-.31-.93-.619-1.209-.619L4.553 3.043c-.528 0-.746.528-.094.93v.235zm.746 2.428c0 .31.155.528.528.528h14.478c.31 0 .528-.218.528-.528V5.668c0-.31-.218-.528-.528-.528H5.733c-.373 0-.528.218-.528.528v.968zm0 1.24v9.944c0 .746.373 1.117 1.026 1.117h11.636c.746 0 1.026-.466 1.026-1.117V7.876c0-.528-.28-.746-.746-.746H5.951c-.466 0-.746.218-.746.746z" />
          </svg>
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
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l8.893-.621c.285 0 .047-.28-.093-.311L14.199 3.28c-.28-.31-.93-.619-1.209-.619L4.553 3.043c-.528 0-.746.528-.094.93v.235zm.746 2.428c0 .31.155.528.528.528h14.478c.31 0 .528-.218.528-.528V5.668c0-.31-.218-.528-.528-.528H5.733c-.373 0-.528.218-.528.528v.968zm0 1.24v9.944c0 .746.373 1.117 1.026 1.117h11.636c.746 0 1.026-.466 1.026-1.117V7.876c0-.528-.28-.746-.746-.746H5.951c-.466 0-.746.218-.746.746z" />
          </svg>
          TT Wiki 바로가기
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {/* 최근 문서 목록 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          최근 문서
        </h2>
        <p className="text-gray-600 mb-4">노션 위키의 최근 업데이트된 문서 목록입니다.</p>

        {renderPageList()}
      </div>
    </>
  )
}
