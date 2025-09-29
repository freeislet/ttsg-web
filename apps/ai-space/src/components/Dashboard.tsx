import React, { useState } from 'react'
import { useModelStore } from '@/stores/modelStore'
import { BarChart3, Brain, Database, Activity, Network } from 'lucide-react'
import { NeuralNetworkDashboard } from './panels/NeuralNetworkDashboard'

/**
 * 통합 대시보드 컴포넌트
 */
const Dashboard: React.FC = () => {
  const { nodes, getStats } = useModelStore()
  const [viewMode, setViewMode] = useState<'overview' | 'neural-viz'>('overview')
  
  const debugInfo = getStats()
  const dataNodes = nodes.filter(node => node.type === 'data')
  const modelNodes = nodes.filter(node => node.type === 'model')

  // 신경망 시각화 모드 렌더링
  const renderNeuralVisualization = () => (
    <div className="h-full">
      <NeuralNetworkDashboard className="h-full" />
    </div>
  )

  // 개요 모드 렌더링
  const renderOverview = () => (
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
  )

  return (
    <div className="min-h-full">
      {/* 뷰 모드 스위처 */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            개요
          </button>
          
          <button
            onClick={() => setViewMode('neural-viz')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'neural-viz'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Network className="w-4 h-4 mr-1" />
            신경망 시각화
          </button>
        </div>
      </div>

      {/* 선택된 뷰 렌더링 */}
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'neural-viz' && renderNeuralVisualization()}
    </div>
  )
}

export default Dashboard
