import React from 'react'
import { Brain, Database, TrendingUp, CheckCircle, Zap } from 'lucide-react'
import { modelActions } from '@/stores/modelStore'

const Sidebar: React.FC = () => {
  // 개별 노드 추가 함수들
  const addTrainingDataNode = () => {
    modelActions.addNode('training-data', { x: Math.random() * 400, y: Math.random() * 400 })
  }

  const addModelNode = () => {
    modelActions.addNode('model', { x: Math.random() * 400, y: Math.random() * 400 })
  }

  const addTrainingNode = () => {
    // 학습 노드는 모델 정의 노드가 필요하므로 기본 모델 ID 생성
    const modelNodeId = `model_def_${Date.now()}`
    modelActions.addNode(
      'training',
      { x: Math.random() * 400, y: Math.random() * 400 },
      { modelNodeId }
    )
  }

  const addTrainedModelNode = () => {
    // 학습된 모델 노드는 모델 ID와 학습 ID가 필요하므로 기본값 생성
    const modelId = `model_${Date.now()}`
    const trainingId = `training_${Date.now()}`
    modelActions.addNode(
      'trained-model',
      { x: Math.random() * 400, y: Math.random() * 400 },
      { modelId, trainingId }
    )
  }

  // 모델 학습 그룹 생성 (4개 노드 한 번에)
  const addModelTrainingGroup = () => {
    modelActions.addModelTrainingGroup({ x: 100, y: 100 })
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">노드 팔레트</h2>

      {/* 빠른 시작 - 모델 학습 그룹 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">빠른 시작</h3>
        <button
          onClick={addModelTrainingGroup}
          className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-green-100 transition-all"
        >
          <Zap className="w-4 h-4 text-blue-600" />
          <div className="text-left">
            <div className="text-sm font-medium text-blue-800">모델 학습 그룹</div>
            <div className="text-xs text-blue-600">4개 노드 자동 생성</div>
          </div>
        </button>
      </div>

      {/* 개별 노드들 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">개별 노드</h3>
        <div className="space-y-2">
          {/* 훈련 데이터 노드 */}
          <button
            onClick={addTrainingDataNode}
            className="w-full flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Database className="w-4 h-4 text-yellow-600" />
            <div className="text-left">
              <div className="text-sm text-yellow-800">훈련 데이터</div>
              <div className="text-xs text-yellow-600">데이터 생성 및 관리</div>
            </div>
          </button>

          {/* 모델 정의 노드 */}
          <button
            onClick={addModelNode}
            className="w-full flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Brain className="w-4 h-4 text-blue-600" />
            <div className="text-left">
              <div className="text-sm text-blue-800">모델 정의</div>
              <div className="text-xs text-blue-600">구조 및 레이어 설정</div>
            </div>
          </button>

          {/* 모델 학습 노드 */}
          <button
            onClick={addTrainingNode}
            className="w-full flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div className="text-left">
              <div className="text-sm text-green-800">모델 학습</div>
              <div className="text-xs text-green-600">컴파일 및 학습 실행</div>
            </div>
          </button>

          {/* 학습된 모델 노드 */}
          <button
            onClick={addTrainedModelNode}
            className="w-full flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-purple-600" />
            <div className="text-left">
              <div className="text-sm text-purple-800">학습된 모델</div>
              <div className="text-xs text-purple-600">성능 표시 및 예측</div>
            </div>
          </button>
        </div>
      </div>

      {/* 워크플로우 안내 */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-2">워크플로우</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>1. 훈련 데이터</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>2. 모델 정의</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>3. 모델 학습</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>4. 학습된 모델</span>
          </div>
        </div>
      </div>

      {/* 도움말 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-xs font-medium text-blue-700 mb-1">💡 팁</h4>
        <p className="text-xs text-blue-600">
          "모델 학습 그룹"을 사용하면 전체 워크플로우가 자동으로 생성되고 연결됩니다.
        </p>
      </div>
    </div>
  )
}

export default Sidebar
