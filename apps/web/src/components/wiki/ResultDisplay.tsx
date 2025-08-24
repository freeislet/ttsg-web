import { Icon } from '@iconify/react'
import { getModelMeta } from '@/lib/ai'
import { OpenInNewIcon } from '@/components/icons'
import type { WikiGenerationResult } from '@/types'

interface ResultDisplayProps {
  results: WikiGenerationResult[]
}

/**
 * 위키 생성 결과 표시 컴포넌트
 * 생성된 노션 페이지들의 링크와 정보를 표시합니다.
 */
export default function ResultDisplay({ results }: ResultDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Icon icon="mdi:check-circle" className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">생성 완료</h2>
      </div>

      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <Icon icon="mdi:party-popper" className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">
            총 {results.length}개의 위키 문서가 성공적으로 생성되었습니다!
          </span>
        </div>
        <p className="text-green-700 text-sm mt-2">
          각 모델별로 개별 노션 페이지가 생성되었습니다. 아래 링크를 통해 확인해보세요.
        </p>
      </div>

      <div className="space-y-4">
        {results.map((result) => {
          const modelMeta = getModelMeta(result.model, { useFallback: true })
          const { name: modelName, colors, icon } = modelMeta

          return (
            <div
              key={result.notionPageId}
              className={`border-l-4 ${colors.border} ${colors.bg} p-4 rounded-r-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon icon={icon} className={`w-5 h-5 ${colors.text}`} />
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text} rounded-full`}
                    >
                      {modelName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {modelName}으로 생성된 위키 문서입니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={result.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center ${colors.text} bg-white border ${colors.border} px-4 py-2 rounded-lg font-medium transition-colors hover:${colors.bg}`}
                >
                  <Icon icon="simple-icons:notion" className="w-4 h-4 mr-2" />
                  노션에서 보기
                  <OpenInNewIcon className="w-4 h-4 ml-2" />
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(result.notionUrl)}
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="mdi:content-copy" className="w-4 h-4 mr-1" />
                  링크 복사
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Icon icon="mdi:lightbulb" className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800">
            <p className="font-medium mb-1">생성된 문서 활용 팁</p>
            <ul className="text-sm space-y-1">
              <li>• 각 모델의 결과를 비교하여 가장 적합한 내용을 선택하세요</li>
              <li>• 노션에서 직접 편집하여 내용을 보완할 수 있습니다</li>
              <li>• Version 필드로 어떤 모델이 생성했는지 구분할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
