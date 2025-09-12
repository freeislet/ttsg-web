import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { getNotionWikiList, type NotionPage } from '@/client/wiki'
import { OpenInNewIcon } from '@/components/icons'
import WikiSearchBox from './WikiSearchBox'

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
      const pages = await getNotionWikiList()
      setPages(pages)
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
          const url = `/wiki/${encodeURIComponent(page.title)}?version=${page.version || ''}&language=${page.language}`
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
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <a
                  href={url}
                  className={`hover:text-${color}-600 transition-colors flex items-center`}
                >
                  {page.title}
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="새 창에서 보기"
                >
                  <OpenInNewIcon className="w-4 h-4" />
                </a>
                {page.version && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {page.version}
                  </span>
                )}
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
          <Icon icon="mdi:book-open-variant" className="w-8 h-8 mr-3 text-blue-600" />
          TT Wiki
        </h1>
      </div>

      {/* 위키 검색 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Icon icon="mdi:magnify" className="w-6 h-6 mr-2 text-blue-600" />
          위키 검색
        </h2>

        <WikiSearchBox
          placeholder="위키 페이지 제목이나 키워드를 입력하세요..."
          className="w-full"
        />
      </div>

      {/* AI 위키 문서 만들기 버튼 */}
      <div className="mb-8">
        <a
          href="/wiki/generate"
          className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-purple-700"
        >
          <Icon icon="mdi:auto-fix" className="w-5 h-5 mr-2" />
          AI 위키 문서 만들기...
        </a>
      </div>

      {/* 최근 문서 목록 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Icon icon="mdi:file-document-multiple" className="w-6 h-6 mr-2 text-green-600" />
          최근 문서
        </h2>
        <p className="text-gray-600 mb-4">최근 업데이트된 문서 목록입니다.</p>

        {renderPageList()}
      </div>

      {/* 노션 위키 링크 섹션 */}
      <div className="bg-gray-50 border-l-4 border-gray-200 rounded-lg p-6">
        <div className="mb-4 flex items-start">
          <Icon
            icon="mdi:information"
            className="w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0"
          />
          <p className="text-blue-800 font-medium">TT Wiki 문서는 노션에서 관리됩니다.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.notion.so/TT-Wiki-24fffc6454ce806ebaeeee1a0497640d"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            <Icon icon="simple-icons:notion" className="w-5 h-5 mr-2" />
            TT Wiki 노션 바로가기
            <OpenInNewIcon className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </>
  )
}
