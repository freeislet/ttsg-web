import { useState } from 'react'
import { Icon } from '@iconify/react'
import { getModelMeta } from '@/lib/ai'
import { useWikiGenerationStore } from '@/stores/wiki-generation'
import { OpenInNewIcon } from '@/components/icons'

/**
 * 위키 생성 결과 표시 컴포넌트
 * 스토어에서 위키 생성 컨텍스트를 가져와 결과를 표시합니다.
 */
export default function ResultDisplay() {
  const wikiGeneration = useWikiGenerationStore()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const successResults = wikiGeneration.modelResults.filter((result) => result.status === 'success')
  const errorResults = wikiGeneration.modelResults.filter((result) => result.status === 'error')
  const hasAnySuccess = successResults.length > 0
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center">
        <Icon
          icon={wikiGeneration.hasErrors ? 'mdi:alert-circle' : 'mdi:check-circle'}
          className={`w-6 h-6 mr-2 ${wikiGeneration.hasErrors ? 'text-orange-600' : 'text-green-600'}`}
        />
        <h2 className="text-xl font-semibold text-gray-800">생성 결과</h2>
      </div>

      {/* 전체 에러 표시 */}
      {wikiGeneration.globalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">전체 생성 실패</span>
          </div>
          <p className="text-red-700 text-sm">{wikiGeneration.globalError}</p>
        </div>
      )}

      {/* 성공 결과 */}
      {hasAnySuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Icon icon="mdi:party-popper" className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              총 {successResults.length}개의 위키 문서가 성공적으로 생성되었습니다!
            </span>
          </div>
          <p className="text-green-700 text-sm">
            각 모델별로 개별 노션 페이지가 생성되었습니다. 아래에서 확인해보세요.
          </p>
        </div>
      )}

      {/* 모델별 결과 */}
      <div className="space-y-4">
        {wikiGeneration.modelResults.map((result) => {
          const modelMeta = getModelMeta(result.model, { useFallback: true })
          const { name: modelName, colors, icon } = modelMeta
          const sectionId = `model-${result.model}`

          return (
            <div
              key={result.model}
              className={`border-l-4 ${colors.border} ${colors.bg} p-4 rounded-r-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon icon={icon} className={`w-5 h-5 ${colors.text}`} />
                  <h3 className="font-medium text-gray-900">{modelName}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      result.status === 'success'
                        ? `${colors.bg} ${colors.text}`
                        : result.status === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {result.status === 'success'
                      ? '성공'
                      : result.status === 'error'
                        ? '실패'
                        : '대기중'}
                  </span>
                </div>
              </div>

              {/* 에러 시 에러 메시지 - 항상 표시 */}
              {result.status === 'error' && result.error && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-red-700 mb-1">오류 내용</h4>
                  <div className="bg-red-50 p-3 rounded border border-red-200 text-xs text-red-600">
                    {result.error}
                  </div>
                </div>
              )}

              {/* 노션 링크 - 항상 표시 */}
              {result.status === 'success' && result.notionUrl && (
                <div className="flex items-center space-x-3 mb-3">
                  <a
                    href={result.notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center ${colors.text} bg-white border ${colors.border} px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:${colors.bg}`}
                  >
                    <Icon icon="simple-icons:notion" className="w-4 h-4 mr-2" />
                    노션에서 보기
                    <OpenInNewIcon className="w-4 h-4 ml-2" />
                  </a>

                  <button
                    onClick={() => navigator.clipboard.writeText(result.notionUrl!)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Icon icon="mdi:content-copy" className="w-4 h-4 mr-1" />
                    링크 복사
                  </button>
                </div>
              )}

              {/* 프롬프트 섹션 */}
              {result.prompt && (
                <div className="border-t pt-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(`${sectionId}-prompt`)}
                      className="flex items-center w-full text-left hover:bg-gray-100 p-3 rounded-lg transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-700 mr-2">프롬프트</h4>
                      <Icon
                        icon={
                          expandedSections[`${sectionId}-prompt`]
                            ? 'mdi:chevron-up'
                            : 'mdi:chevron-down'
                        }
                        className="w-4 h-4 text-gray-500"
                      />
                    </button>
                    {expandedSections[`${sectionId}-prompt`] && (
                      <div className="m-3 mt-0 bg-white p-3 rounded border text-xs text-gray-600 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{result.prompt}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 컨텐츠 섹션 */}
              {result.content && (
                <div className="border-t pt-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(`${sectionId}-content`)}
                      className="flex items-center w-full text-left hover:bg-gray-100 p-3 rounded-lg transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-700 mr-2">생성된 컨텐츠</h4>
                      <Icon
                        icon={
                          expandedSections[`${sectionId}-content`]
                            ? 'mdi:chevron-up'
                            : 'mdi:chevron-down'
                        }
                        className="w-4 h-4 text-gray-500"
                      />
                    </button>
                    {expandedSections[`${sectionId}-content`] && (
                      <div className="m-3 mt-0 bg-white p-3 rounded border text-xs text-gray-600 max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{result.content}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 활용 팁 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Icon icon="mdi:lightbulb" className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800">
            <p className="font-medium mb-1">생성된 문서 활용 팁</p>
            <ul className="text-sm space-y-1">
              <li>• 각 모델의 결과를 비교하여 가장 적합한 내용을 선택하세요</li>
              <li>• 노션에서 직접 편집하여 내용을 보완할 수 있습니다</li>
              <li>• 프롬프트를 확인하여 다음 생성 시 참고하세요</li>
              {errorResults.length > 0 && <li>• 실패한 모델이 있다면 다시 시도해보세요</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
