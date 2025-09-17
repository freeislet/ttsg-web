import { useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { AppHeader } from 'shared'
import FlowEditor from '@/components/FlowEditor'
import Sidebar from '@/components/Sidebar'
import NodeProperties from '@/components/NodeProperties'
import BottomPanel from '@/components/BottomPanel'
import { useSnapshot } from 'valtio'
import { modelState } from '@/stores/modelStore'

function App() {
  const snap = useSnapshot(modelState)
  const [bottomPanelHeight, _setBottomPanelHeight] = useState(200)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <AppHeader title="AI SPACE" homeUrl="https://ttsg.space">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              snap.trainingState.isTraining ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {snap.trainingState.isTraining ? '학습 중' : '대기 중'}
          </span>
        </div>
      </AppHeader>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 패널 (노드 에디터 영역) */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{ height: `calc(100% - ${bottomPanelHeight}px)` }}
        >
          <ReactFlowProvider>
            {/* 사이드바 */}
            <Sidebar />

            {/* 플로우 에디터 */}
            <div className="flex-1 flex flex-col">
              <FlowEditor />
            </div>

            {/* 우측 속성 패널 */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              {/* 노드 속성 */}
              <div className="flex-1 p-4">
                <NodeProperties />
              </div>
            </div>
          </ReactFlowProvider>
        </div>

        {/* 하단 패널 (로그창 등) */}
        <BottomPanel height={bottomPanelHeight} />
      </div>
    </div>
  )
}

export default App
