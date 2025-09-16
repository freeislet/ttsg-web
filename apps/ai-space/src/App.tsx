import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { AppHeader } from 'shared'
import FlowEditor from '@/components/FlowEditor'
import Sidebar from '@/components/Sidebar'
import WeightVisualizer from '@/components/WeightVisualizer'
import TrainingPanel from '@/components/TrainingPanel'
import { useSnapshot } from 'valtio'
import { modelState } from '@/stores/modelStore'

function App() {
  const snap = useSnapshot(modelState)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <AppHeader 
        title="AI SPACE" 
        homeUrl="https://ttsg.space"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            snap.trainingState.isTraining ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600">
            {snap.trainingState.isTraining ? '학습 중' : '대기 중'}
          </span>
        </div>
      </AppHeader>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          {/* 사이드바 */}
          <Sidebar />
          
          {/* 플로우 에디터 */}
          <div className="flex-1 flex flex-col">
            <FlowEditor />
          </div>
          
          {/* 우측 패널 */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Weight 시각화 */}
            <div className="flex-1 p-4">
              <WeightVisualizer />
            </div>
            
            {/* 학습 패널 */}
            <div className="border-t border-gray-200">
              <TrainingPanel />
            </div>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default App
