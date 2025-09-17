import React from 'react'

/**
 * 성능 지표 패널 컴포넌트
 * AI 모델 학습 및 추론 과정의 성능 지표를 표시하는 패널
 * TODO: 실제 성능 지표 구현 예정
 */
const MetricsPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">성능 지표</h3>
      </div>
      
      {/* 내용 영역 */}
      <div className="flex-1 p-4">
        <div className="text-gray-500 text-center">
          성능 지표 패널 (추후 구현 예정)
        </div>
        {/* TODO: 다음과 같은 성능 지표들을 표시할 예정
            - 학습 손실 (Training Loss)
            - 검증 손실 (Validation Loss)
            - 정확도 (Accuracy)
            - 학습 시간 (Training Time)
            - 메모리 사용량 (Memory Usage)
            - GPU 사용률 (GPU Utilization)
        */}
      </div>
    </div>
  )
}

export default MetricsPanel
