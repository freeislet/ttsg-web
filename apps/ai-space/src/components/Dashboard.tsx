import React from 'react'
import { useModelStore } from '@/stores/modelStore'
import { BarChart3, Brain, Database, Activity } from 'lucide-react'

/**
 * 간단한 대시보드 컴포넌트
 */
const Dashboard: React.FC = () => {
  const { nodes, getDebugInfo } = useModelStore()
  
  const debugInfo = getDebugInfo()
  const dataNodes = nodes.filter(node => node.type === 'data')
  const modelNodes = nodes.filter(node => node.type === 'model')

  return (
    <div className="min-h-full">
      {/* 대시보드 콘텐츠 */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {/* 모델 학습 상태 위젯 */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              모델 학습 상태
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">총 모델 수</span>
                <span className="text-xl font-bold text-blue-600">{modelNodes.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">데이터 노드 수</span>
                <span className="text-xl font-bold text-green-600">{dataNodes.length}</span>
              </div>
            </div>
          </div>

          {/* 데이터셋 정보 위젯 */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-500" />
              데이터셋 정보
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">데이터 노드 수</span>
                <span className="text-xl font-bold text-yellow-600">{dataNodes.length}</span>
              </div>
              
              {dataNodes.map((node, index) => (
                <div key={node.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">데이터셋 {index + 1}</span>
                    <span className="text-xs text-gray-500">{node.id.slice(0, 8)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {node.data?.label || '라벨 없음'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성능 지표 위젯 */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              성능 지표
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">총 노드 수</span>
                <span className="text-xl font-bold text-green-600">{debugInfo.nodeCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">연결 수</span>
                <span className="text-xl font-bold text-blue-600">{debugInfo.edgeCount}</span>
              </div>
            </div>
          </div>

          {/* 시스템 활동 위젯 */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              최근 활동
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-700">시스템 준비 완료</span>
                  <span className="text-xs text-gray-500">방금 전</span>
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                    시스템
                  </span>
                </div>
              </div>
              
              {nodes.length > 0 && (
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-700">노드 {nodes.length}개 생성됨</span>
                    <span className="text-xs text-gray-500">최근</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      노드
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
