import React from 'react'
import { useModelSnapshot } from '@/stores/modelStore'

// TODO: LayerNodeData는 기존 아키텍처 - 새 아키텍처로 마이그레이션 필요
interface LayerNodeData {
  weights?: number[][]
}

const WeightVisualizer: React.FC = () => {
  const snap = useModelSnapshot()

  // 선택된 노드 찾기
  const selectedNode = snap.nodes.find((node) => node.id === snap.selectedNode)

  // 레이어 노드가 아니거나 가중치가 없으면 기본 메시지 표시
  if (!selectedNode || selectedNode.data.type === 'model' || selectedNode.data.type === 'data') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <p className="text-sm">레이어 노드를 선택하면</p>
          <p className="text-sm">가중치 매트릭스를 확인할 수 있습니다</p>
        </div>
      </div>
    )
  }

  const layerData = selectedNode.data as LayerNodeData

  // 가중치가 없으면 초기화 메시지
  if (!layerData.weights || layerData.weights.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-sm">모델을 학습하면</p>
          <p className="text-sm">가중치 시각화가 표시됩니다</p>
        </div>
      </div>
    )
  }

  // 가중치를 색상으로 변환하는 함수
  const weightToColor = (weight: number, min: number, max: number) => {
    const normalized = (weight - min) / (max - min)
    if (normalized > 0.5) {
      // 양수: 파란색 계열
      const intensity = (normalized - 0.5) * 2
      return `rgb(${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))}, 255)`
    } else {
      // 음수: 빨간색 계열
      const intensity = (0.5 - normalized) * 2
      return `rgb(255, ${Math.round(255 * (1 - intensity))}, ${Math.round(255 * (1 - intensity))})`
    }
  }

  // 가중치 범위 계산
  const allWeights = layerData.weights.flat()
  const minWeight = Math.min(...allWeights)
  const maxWeight = Math.max(...allWeights)

  const rows = layerData.weights.length
  const cols = layerData.weights[0]?.length || 0

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">가중치 매트릭스</h3>
        <p className="text-sm text-gray-600">{selectedNode.data.label}</p>
        <div className="mt-2 text-xs text-gray-500">
          <span>
            크기: {rows} × {cols}
          </span>
          <span className="ml-4">
            범위: {minWeight.toFixed(3)} ~ {maxWeight.toFixed(3)}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {/* 색상 범례 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>음수 (빨강)</span>
            <span>0</span>
            <span>양수 (파랑)</span>
          </div>
          <div
            className="h-4 rounded"
            style={{
              background: 'linear-gradient(to right, rgb(255,0,0), rgb(255,255,255), rgb(0,0,255))',
            }}
          />
        </div>

        {/* 가중치 매트릭스 시각화 */}
        <div className="weight-matrix">
          {rows > 50 || cols > 50 ? (
            // 큰 매트릭스는 축소해서 표시
            <canvas
              width={Math.min(400, cols * 2)}
              height={Math.min(400, rows * 2)}
              className="border border-gray-200 rounded"
              ref={(canvas) => {
                if (canvas) {
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    const cellWidth = canvas.width / cols
                    const cellHeight = canvas.height / rows

                    for (let i = 0; i < rows; i++) {
                      for (let j = 0; j < cols; j++) {
                        const weight = layerData.weights?.[i][j] ?? 0
                        ctx.fillStyle = weightToColor(weight, minWeight, maxWeight)
                        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            // 작은 매트릭스는 격자로 표시
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                maxWidth: '400px',
              }}
            >
              {layerData.weights.map((row, i) =>
                row.map((weight, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="w-4 h-4 border border-gray-300 rounded-sm"
                    style={{
                      backgroundColor: weightToColor(weight, minWeight, maxWeight),
                    }}
                    title={`[${i},${j}]: ${weight.toFixed(4)}`}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* 통계 정보 */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700">평균</div>
            <div className="text-gray-900">
              {(allWeights.reduce((a, b) => a + b, 0) / allWeights.length).toFixed(4)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-gray-700">표준편차</div>
            <div className="text-gray-900">
              {Math.sqrt(
                allWeights.reduce((acc, val) => {
                  const mean = allWeights.reduce((a, b) => a + b, 0) / allWeights.length
                  return acc + Math.pow(val - mean, 2)
                }, 0) / allWeights.length
              ).toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeightVisualizer
