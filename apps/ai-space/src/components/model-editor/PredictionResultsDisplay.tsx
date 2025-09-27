import React from 'react'
import { PredictionResult } from '@/types/ModelNode'
import { PredictionDisplayConfig } from '@/data/types'
import { Eye } from 'lucide-react'

interface PredictionResultsDisplayProps {
  predictions: PredictionResult[]
  displayConfig?: PredictionDisplayConfig
  datasetId: string
  className?: string
}

/**
 * 예측 결과를 데이터셋에 맞게 시각화하는 컴포넌트
 */
export const PredictionResultsDisplay: React.FC<PredictionResultsDisplayProps> = ({
  predictions,
  displayConfig, // 향후 확장용으로 유지
  datasetId,
  className = '',
}) => {
  if (!predictions || predictions.length === 0) {
    return (
      <div className={`text-center text-gray-500 p-4 ${className}`}>
        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">예측 결과가 없습니다</p>
        <p className="text-xs">모델 학습 완료 후 예측을 생성해보세요</p>
      </div>
    )
  }

  // 통계 정보 계산
  const calculateStats = () => {
    if (predictions.length === 0) return null
    
    const correctPredictions = predictions.filter(p => 
      p.actualClass !== undefined && p.predictedClass === p.actualClass
    ).length
    
    const totalWithActual = predictions.filter(p => p.actualClass !== undefined).length
    const accuracy = totalWithActual > 0 ? (correctPredictions / totalWithActual) * 100 : 0
    
    return {
      total: predictions.length,
      correct: correctPredictions,
      accuracy,
      totalWithActual,
    }
  }

  const stats = calculateStats()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 통계 헤더 */}
      {stats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-blue-800">예측 통계</span>
            <div className="text-blue-700">
              {stats.total}개 샘플 
              {stats.accuracy > 0 && (
                <span className="ml-2 font-bold">
                  정확도: {stats.accuracy.toFixed(1)}% ({stats.correct}/{stats.totalWithActual})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 예측 결과 표시 */}
      <div className="space-y-2">
        {predictions.slice(0, 10).map((prediction, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded p-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">예측값:</span>
                  <span className="ml-2 font-mono text-blue-600">
                    {String(prediction.predictedClass)}
                  </span>
                </div>
                {prediction.confidence !== undefined && (
                  <div className="text-xs text-gray-500">
                    신뢰도: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                )}
                {prediction.error !== undefined && (
                  <div className="text-xs text-gray-500">
                    오차: ±{prediction.error.toFixed(2)}
                  </div>
                )}
              </div>
              
              {prediction.actualClass !== undefined && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    실제: <span className="font-mono">{String(prediction.actualClass)}</span>
                  </div>
                  <div className="text-xs">
                    {prediction.predictedClass === prediction.actualClass ? (
                      <span className="text-green-600">정답 ✓</span>
                    ) : (
                      <span className="text-red-600">오답 ✗</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 데이터셋별 추가 정보 */}
      {datasetId && (
        <div className="text-xs text-gray-400 text-center">
          Dataset: {datasetId}
        </div>
      )}
    </div>
  )
}

export default PredictionResultsDisplay
