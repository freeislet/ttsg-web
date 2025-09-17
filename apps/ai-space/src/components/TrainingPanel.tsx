import React from 'react'
import { Play, Square, RotateCcw, Settings } from 'lucide-react'
import { useModelSnapshot, modelActions } from '@/stores/modelStore'

const TrainingPanel: React.FC = () => {
  const snap = useModelSnapshot()

  const handleCompile = async () => {
    try {
      await modelActions.compileModel()
    } catch (error) {
      console.error('컴파일 실패:', error)
    }
  }

  const handleTrain = async () => {
    try {
      await modelActions.trainModel()
    } catch (error) {
      console.error('학습 실패:', error)
    }
  }

  const handleStop = () => {
    modelActions.stopTraining()
  }

  const handleReset = () => {
    modelActions.resetModel()
  }

  // 모델 노드 찾기
  const modelNode = snap.nodes.find(node => node.data.type === 'model')
  const isModelReady = modelNode && modelNode.data.type === 'model'
  const isCompiled = isModelReady && (modelNode.data as any).isCompiled
  const isTrained = isModelReady && (modelNode.data as any).isTrained

  return (
    <div className="p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">모델 학습</h3>

      {/* 모델 상태 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">모델 상태</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              !isModelReady ? 'bg-gray-400' :
              !isCompiled ? 'bg-yellow-400' :
              isTrained ? 'bg-green-400' : 'bg-blue-400'
            }`} />
            <span className="text-xs text-gray-600">
              {!isModelReady ? '모델 없음' :
               !isCompiled ? '컴파일 필요' :
               isTrained ? '학습 완료' : '학습 준비'}
            </span>
          </div>
        </div>
        
        {isModelReady && (
          <div className="text-xs text-gray-600">
            <div>노드 수: {snap.nodes.length}</div>
            <div>연결 수: {snap.edges.length}</div>
          </div>
        )}
      </div>

      {/* 학습 진행 상황 */}
      {snap.trainingState.isTraining && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">학습 중...</span>
            <span className="text-xs text-blue-600">
              {snap.trainingState.currentEpoch} / {snap.trainingState.totalEpochs}
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(snap.trainingState.currentEpoch / snap.trainingState.totalEpochs) * 100}%` 
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div>
              <span className="font-medium">손실:</span> {snap.trainingState.currentLoss.toFixed(4)}
            </div>
            {snap.trainingState.currentAccuracy && (
              <div>
                <span className="font-medium">정확도:</span> {(snap.trainingState.currentAccuracy * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* 학습 히스토리 */}
      {snap.trainingState.history.length > 0 && !snap.trainingState.isTraining && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-2">최종 결과</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
            <div>
              <span className="font-medium">최종 손실:</span> {snap.trainingState.history[snap.trainingState.history.length - 1]?.loss.toFixed(4)}
            </div>
            <div>
              <span className="font-medium">최종 정확도:</span> {((snap.trainingState.history[snap.trainingState.history.length - 1]?.accuracy || 0) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* 컨트롤 버튼들 */}
      <div className="space-y-2">
        {!isCompiled && (
          <button
            onClick={handleCompile}
            disabled={!isModelReady || snap.trainingState.isTraining}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Settings className="w-4 h-4" />
            모델 컴파일
          </button>
        )}

        {isCompiled && !snap.trainingState.isTraining && (
          <button
            onClick={handleTrain}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Play className="w-4 h-4" />
            학습 시작
          </button>
        )}

        {snap.trainingState.isTraining && (
          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            학습 중단
          </button>
        )}

        {(isCompiled || isTrained) && (
          <button
            onClick={handleReset}
            disabled={snap.trainingState.isTraining}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            모델 리셋
          </button>
        )}
      </div>

      {/* 하이퍼파라미터 표시 */}
      {isModelReady && modelNode.data.type === 'model' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">하이퍼파라미터</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>학습률:</span>
              <span>{(modelNode.data as any).hyperparameters.learningRate}</span>
            </div>
            <div className="flex justify-between">
              <span>에포크:</span>
              <span>{(modelNode.data as any).hyperparameters.epochs}</span>
            </div>
            <div className="flex justify-between">
              <span>배치 크기:</span>
              <span>{(modelNode.data as any).hyperparameters.batchSize}</span>
            </div>
            <div className="flex justify-between">
              <span>옵티마이저:</span>
              <span>{(modelNode.data as any).hyperparameters.optimizer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingPanel
