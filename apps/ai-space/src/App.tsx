import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import { AppHeader } from 'shared'
import FlowEditor from '@/components/FlowEditor'
import Sidebar from '@/components/Sidebar'
import NodeProperties from '@/components/NodeProperties'
import BottomPanel from '@/components/BottomPanel'
import {
  Panel,
  PanelGroup,
  PanelResizeHandleHorizontal,
  PanelResizeHandleVertical,
} from '@/components/PanelResize'
import { useModelStore } from '@/stores/modelStore'

// 노드 자동 등록을 위한 import
import '@/components/nodes'

function App() {
  const { isLoading, selectedNodeId, getDebugInfo } = useModelStore()

  // 디버그: 등록된 모델 타입 확인
  React.useEffect(() => {
    const debugInfo = getDebugInfo()
    console.log('🔍 등록된 모델 타입:', debugInfo.registeredModelTypes)
    console.log('🔍 등록된 노드 타입:', debugInfo.registeredNodeTypes)
  }, [])

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 헤더 */}
        <AppHeader title="AI SPACE" homeUrl="https://ttsg.space">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}
            />
            <span className="text-sm text-gray-600">{isLoading ? '로딩 중' : '준비 완료'}</span>
          </div>
        </AppHeader>

        {/* 메인 콘텐츠 - Resizable Panels */}
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={75} minSize={50}>
              <PanelGroup direction="vertical">
                {/* 상단 패널 (노드 에디터 영역) */}
                <Panel defaultSize={75} minSize={50}>
                  <PanelGroup direction="horizontal">
                    {/* 좌측 사이드바 */}
                    <Panel defaultSize={20} minSize={15} maxSize={30}>
                      <Sidebar />
                    </Panel>

                    <PanelResizeHandleHorizontal />

                    {/* 중앙 플로우 에디터 */}
                    <Panel defaultSize={60} minSize={40}>
                      <div className="h-full flex flex-col">
                        <FlowEditor />
                      </div>
                    </Panel>
                  </PanelGroup>
                </Panel>

                <PanelResizeHandleVertical />

                {/* 하단 패널 (로그창 등) */}
                <Panel defaultSize={25} minSize={15} maxSize={50}>
                  <BottomPanel />
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandleHorizontal />

            {/* 우측 속성 패널 */}
            <Panel defaultSize={20} minSize={15} maxSize={35}>
              <div className="h-full bg-white border-l border-gray-200 flex flex-col">
                <div className="flex-1 p-4">
                  <NodeProperties />
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default App
