import React, { useState, useEffect } from 'react'
import { useCacheStats, useModelStore } from '@/stores/modelStore'
import { getModelDataSummary } from '@/utils/modelDataAccess'

/**
 * 캐시 성능을 모니터링하고 디버깅하기 위한 패널
 */
export const CacheDebugPanel: React.FC = () => {
  const cacheStats = useCacheStats()
  const { nodes, invalidateAllModelCaches, getStats } = useModelStore()
  const [updateCount, setUpdateCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // 1초마다 업데이트 카운터 증가
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateCount(prev => prev + 1)
      setLastUpdate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const modelNodes = nodes.filter(node => node.type === 'model')
  const stats = getStats()

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 m-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 캐시 디버그 패널</h3>
        <div className="text-sm text-gray-500">
          업데이트: #{updateCount} ({lastUpdate?.toLocaleTimeString()})
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">총 모델</div>
          <div className="text-2xl font-bold text-blue-800">{modelNodes.length}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600 font-medium">캐시된 모델</div>
          <div className="text-2xl font-bold text-green-800">{cacheStats.modelsWithCache}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">캐시 적중률</div>
          <div className="text-2xl font-bold text-purple-800">
            {cacheStats.cacheHitRate.toFixed(1)}%
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">총 연결</div>
          <div className="text-2xl font-bold text-orange-800">{stats.edgeCount}</div>
        </div>
      </div>

      {/* 캐시 제어 버튼 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={invalidateAllModelCaches}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          🗑️ 모든 캐시 무효화
        </button>
        <button
          onClick={() => {
            console.log('캐시 상태:', { cacheStats, modelNodes: modelNodes.length })
          }}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          📊 콘솔에 상태 출력
        </button>
      </div>

      {/* 개별 모델 상태 */}
      <div className="space-y-2">
        <h4 className="text-md font-semibold text-gray-700 mb-2">개별 모델 상태</h4>
        {modelNodes.length === 0 ? (
          <div className="text-gray-500 text-sm italic">모델이 없습니다</div>
        ) : (
          modelNodes.map((node, index) => {
            const summary = getModelDataSummary(node as any)
            const hasCache = !!node.data.connectedDataNode
            const cacheAge = node.data.connectedDataNode?.lastUpdated
              ? Date.now() - node.data.connectedDataNode.lastUpdated.getTime()
              : null

            return (
              <div key={node.id} className="bg-gray-50 p-3 rounded border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-600">
                      Model #{index + 1}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      summary.status === 'connected' ? 'bg-green-500' :
                      summary.status === 'stale' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {node.id.slice(-8)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">상태:</span>{' '}
                    <span className={
                      summary.status === 'connected' ? 'text-green-600' :
                      summary.status === 'stale' ? 'text-yellow-600' : 'text-red-600'
                    }>
                      {summary.message}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">데이터셋:</span>{' '}
                    <span className="font-mono">
                      {summary.datasetId || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Input Shape:</span>{' '}
                    <span className="font-mono">
                      {JSON.stringify(summary.inputShape)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Output Units:</span>{' '}
                    <span className="font-mono">
                      {summary.outputUnits}
                    </span>
                  </div>
                </div>

                {hasCache && (
                  <div className="mt-2 text-xs text-gray-500">
                    캐시 나이: {cacheAge ? `${Math.round(cacheAge / 1000)}s` : 'Unknown'}
                    {cacheAge && cacheAge > 5000 && (
                      <span className="text-yellow-600 ml-1">(오래됨)</span>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 성능 팁 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-semibold text-blue-800 mb-1">💡 성능 팁</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 캐시 적중률이 높을수록 성능이 좋습니다</li>
          <li>• 데이터나 연결이 변경되면 자동으로 캐시가 무효화됩니다</li>
          <li>• 5초 이상 된 캐시는 "오래됨" 상태로 표시됩니다</li>
        </ul>
      </div>
    </div>
  )
}
