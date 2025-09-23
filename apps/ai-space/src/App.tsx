import { AppHeader } from 'shared'
import {
  Panel,
  PanelGroup,
  PanelResizeHandleHorizontal,
  PanelResizeHandleVertical,
} from '@/components/PanelResize'
import { ModelEditor } from '@/components/model-editor'
import NodeProperties from '@/components/NodeProperties'
import BottomPanel from '@/components/BottomPanel'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader title="AI SPACE" homeUrl="https://ttsg.space">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">준비 완료</span>
        </div>
      </AppHeader>

      {/* 메인 콘텐츠 - 세로 분할 구조 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          {/* 상단: 플로우 에디터 + 속성 패널 */}
          <Panel defaultSize={70} minSize={50} maxSize={85}>
            <PanelGroup direction="horizontal">
              {/* 플로우 에디터 */}
              <Panel defaultSize={75} minSize={60}>
                <div className="h-full flex flex-col">
                  <ModelEditor />
                </div>
              </Panel>

              <PanelResizeHandleHorizontal />

              {/* 노드 속성 패널 */}
              <Panel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full bg-white border-l border-gray-200">
                  <NodeProperties />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandleVertical />

          {/* 하단: 대시보드 + 로그 패널 */}
          <Panel defaultSize={30} minSize={15} maxSize={50}>
            <BottomPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

export default App
