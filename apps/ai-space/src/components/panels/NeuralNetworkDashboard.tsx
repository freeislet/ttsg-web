import React, { useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Play, Pause, RotateCcw, Settings, Eye, EyeOff } from 'lucide-react'

import { NeuralNetworkVisualization } from '../visualization/NeuralNetworkVisualization'
import { DecisionBoundaryHeatmap } from '../visualization/DecisionBoundaryHeatmap'
import { useModelStore } from '@/stores/modelStore'

/**
 * 대시보드 설정 타입
 */
interface DashboardSettings {
  showNetwork: boolean
  showHeatmap: boolean
  showTrainingChart: boolean
  heatmapDataset: string
  animationSpeed: number
}

/**
 * TensorFlow Playground 스타일의 신경망 대시보드 패널
 */
export const NeuralNetworkDashboard: React.FC<{
  className?: string
}> = ({ className }) => {
  const modelStore = useModelStore()
  
  // 대시보드 설정 상태
  const [settings, setSettings] = useState<DashboardSettings>({
    showNetwork: true,
    showHeatmap: true, 
    showTrainingChart: false,
    heatmapDataset: 'linear',
    animationSpeed: 1
  })

  // 학습 제어 상태
  const [isTraining, setIsTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [loss, setLoss] = useState(0.0)

  // Mock 예측 함수 - 실제로는 현재 선택된 모델의 예측 함수를 사용
  const modelPredictFn = (x: number, y: number): number => {
    // 간단한 XOR 패턴 예제
    return Math.tanh((x + y) * 2) * Math.tanh((x - y) * 2)
  }

  // 학습 시작/정지
  const handleTrainingToggle = () => {
    setIsTraining(!isTraining)
    
    if (!isTraining) {
      // 학습 시작 - 실제로는 모델 학습 로직 호출
      console.log('Training started')
      // Mock 학습 진행
      const interval = setInterval(() => {
        setEpoch(prev => prev + 1)
        setLoss(prev => Math.max(0, prev - 0.01 + Math.random() * 0.005))
      }, 100 / settings.animationSpeed)
      
      // 10초 후 자동 정지 (데모용)
      setTimeout(() => {
        setIsTraining(false)
        clearInterval(interval)
      }, 10000)
    } else {
      console.log('Training paused')
    }
  }

  // 리셋
  const handleReset = () => {
    setIsTraining(false)
    setEpoch(0)
    setLoss(1.0)
    console.log('Model reset')
  }

  // 설정 업데이트
  const updateSetting = <K extends keyof DashboardSettings>(
    key: K, 
    value: DashboardSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`neural-network-dashboard bg-gray-50 ${className || ''}`}>
      {/* 헤더 컨트롤 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-800">신경망 대시보드</h2>
          
          {/* 학습 상태 표시 */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Epoch:</span>
            <span className="font-mono font-bold">{epoch.toLocaleString()}</span>
            <span className="text-gray-600">Loss:</span>
            <span className="font-mono font-bold text-red-600">{loss.toFixed(4)}</span>
          </div>
        </div>
        
        {/* 컨트롤 버튼들 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTrainingToggle}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
              isTraining
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isTraining ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                정지
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                학습
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            리셋
          </button>
          
          {/* 패널 표시/숨기기 토글 */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => updateSetting('showNetwork', !settings.showNetwork)}
              className={`p-1.5 rounded ${
                settings.showNetwork
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title="신경망 구조 표시/숨기기"
            >
              {settings.showNetwork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => updateSetting('showHeatmap', !settings.showHeatmap)}
              className={`p-1.5 rounded ${
                settings.showHeatmap
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title="히트맵 표시/숨기기"
            >
              {settings.showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            
            <button className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 시각화 영역 - TensorFlow Playground 스타일 */}
      <div className="h-[700px] bg-gray-50">
        <PanelGroup direction="horizontal">
          {/* 신경망 구조 패널 */}
          {settings.showNetwork && (
            <>
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full bg-white border-r border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Neural Network
                    </h3>
                  </div>
                  <div className="p-6">
                    <NeuralNetworkVisualization
                      width={550}
                      height={500}
                      showNodeOutputs={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-gray-400" />
            </>
          )}
          
          {/* 출력 영역 패널 */}
          {settings.showHeatmap && (
            <Panel defaultSize={40} minSize={30}>
              <DecisionBoundaryHeatmap
                datasetId={settings.heatmapDataset}
                modelPredictFn={modelPredictFn}
                width={450}
                height={450}
                showTestData={true}
                discretize={false}
                loss={loss}
                trainingLoss={0.510}
                className="h-full"
              />
            </Panel>
          )}
        </PanelGroup>
      </div>

      {/* 하단 설정 패널 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* 학습 설정 */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">학습 속도</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={settings.animationSpeed}
              onChange={(e) => updateSetting('animationSpeed', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-gray-600">{settings.animationSpeed}x</span>
          </div>
          
          {/* 현재 연결된 모델 정보 */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">연결된 모델</label>
            <div className="text-gray-600">
              {modelStore.nodes.filter(n => n.type === 'model').length > 0
                ? `${modelStore.nodes.filter(n => n.type === 'model').length}개 모델`
                : '모델 없음'
              }
            </div>
          </div>
          
          {/* 통계 정보 */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">학습 통계</label>
            <div className="text-gray-600">
              {isTraining ? '학습 중...' : '학습 정지'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
