import React, { useMemo } from 'react'
import ReactFlow, { Background, Controls, MiniMap, Panel, ReactFlowProvider } from 'reactflow'
import { AppHeader } from 'shared'
import { useModelStore } from '@/stores/modelStore'
import DataNode from '@/components/nodes/DataNode'
import ModelNode from '@/components/nodes/ModelNode'
import VisualizationNode from '@/components/nodes/VisualizationNode'
import NodeProperties from '@/components/NodeProperties'
import Dashboard from '@/components/Dashboard'
import {
  Panel as ResizablePanel,
  PanelGroup,
  PanelResizeHandleHorizontal,
} from '@/components/PanelResize'
import 'reactflow/dist/style.css'

// 노드 자동 등록을 위한 import
import '@/components/nodes'

function AppInner() {
  console.log('🚀 App component loaded')

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    addDataNode,
    addModelNode,
    clearAll
  } = useModelStore()

  // 노드 타입 정의
  const nodeTypes = useMemo(() => ({
    data: DataNode,
    model: ModelNode,
    visualization: VisualizationNode,
  }), [])

  React.useEffect(() => {
    console.log('🔍 App useEffect triggered')
    console.log('🔍 Nodes:', nodes.length)
    console.log('🔍 Edges:', edges.length)
  }, [nodes.length, edges.length])

  // 노드 추가 핸들러
  const handleAddDataNode = () => {
    console.log('🔵 데이터 노드 추가 버튼 클릭됨')
    try {
      addDataNode({ x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 })
      console.log('✅ 데이터 노드 추가 완료')
    } catch (error) {
      console.error('❌ 데이터 노드 추가 실패:', error)
    }
  }

  const handleAddModelNode = () => {
    console.log('🔵 모델 노드 추가 버튼 클릭됨')
    try {
      addModelNode('neural-network', { x: Math.random() * 400 + 300, y: Math.random() * 300 + 100 })
      console.log('✅ 모델 노드 추가 완료')
    } catch (error) {
      console.error('❌ 모델 노드 추가 실패:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppHeader title="AI SPACE" homeUrl="https://ttsg.space">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">준비 완료</span>
        </div>
      </AppHeader>
      
      {/* 메인 콘텐츠 - 3개 패널 구조 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* 좌측: 플로우 에디터 + 노드 속성 패널 */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <PanelGroup direction="horizontal">
              {/* 플로우 에디터 */}
              <ResizablePanel defaultSize={75} minSize={60}>
                <div className="h-full flex flex-col">
                  <ReactFlow
                    nodes={nodes as any}
                    edges={edges as any}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-50"
                  >
                    <Background color="#e5e7eb" gap={20} />
                    <Controls />
                    <MiniMap 
                      nodeColor="#6366f1"
                      maskColor="rgba(0, 0, 0, 0.1)"
                      className="!bg-white !border !border-gray-300"
                    />
                    
                    {/* 노드 추가 패널 - ReactFlow Panel 사용 */}
                    <Panel position="top-left" className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">노드 추가</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddDataNode}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                          데이터 노드
                        </button>
                        <button
                          onClick={handleAddModelNode}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          모델 노드
                        </button>
                        <button
                          onClick={clearAll}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          모두 삭제
                        </button>
                      </div>
                    </Panel>
                  </ReactFlow>
                </div>
              </ResizablePanel>

              <PanelResizeHandleHorizontal />

              {/* 노드 속성 패널 */}
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="h-full bg-white border-l border-gray-200 flex flex-col">
                  <div className="flex-1 p-4">
                    <NodeProperties />
                  </div>
                </div>
              </ResizablePanel>
            </PanelGroup>
          </ResizablePanel>

          <PanelResizeHandleHorizontal />

          {/* 우측: 대시보드 */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="h-full bg-white border-l border-gray-200">
              <Dashboard />
            </div>
          </ResizablePanel>
        </PanelGroup>
      </div>
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  )
}

export default App
