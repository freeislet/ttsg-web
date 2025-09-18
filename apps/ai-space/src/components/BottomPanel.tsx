import React, { useState } from 'react'
import { Terminal, Activity, Settings } from 'lucide-react'
import { useModelStore } from '@/stores/modelStore'

interface BottomPanelProps {
  /** 패널의 높이 (픽셀 단위) - react-resizable-panels 사용 시 선택적 */
  height?: number
}

/**
 * 하단 패널 컴포넌트
 * 로그, 성능 지표, 설정 등의 탭을 포함하는 하단 패널
 */
const BottomPanel: React.FC<BottomPanelProps> = ({ height }) => {
  const [activeTab, setActiveTab] = useState('logs')
  const { getDebugInfo } = useModelStore()

  const debugInfo = getDebugInfo()

  const renderLogPanel = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="space-y-2">
        <div className="text-green-400 text-sm font-mono">
          [INFO] AI Space v2 - 새로운 아키텍처 로드됨
        </div>
        <div className="text-blue-400 text-sm font-mono">
          [DEBUG] 모델 레지스트리 초기화 완료
        </div>
        <div className="text-blue-400 text-sm font-mono">
          [DEBUG] 노드 레지스트리 초기화 완료
        </div>
        <div className="text-yellow-400 text-sm font-mono">
          [WARN] 기존 아키텍처 파일들 정리됨
        </div>
      </div>
    </div>
  )

  const renderMetricsPanel = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-gray-400 text-sm">노드 수</div>
          <div className="text-white text-xl font-bold">{debugInfo.nodeCount}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-gray-400 text-sm">엣지 수</div>
          <div className="text-white text-xl font-bold">{debugInfo.edgeCount}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-gray-400 text-sm">모델 인스턴스</div>
          <div className="text-white text-xl font-bold">{debugInfo.modelInstanceCount}</div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-gray-400 text-sm">등록된 모델 타입</div>
          <div className="text-white text-xl font-bold">{debugInfo.registeredModelTypes.length}</div>
        </div>
      </div>
    </div>
  )

  const renderSettingsPanel = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-2">등록된 모델 타입</h3>
          <div className="space-y-1">
            {debugInfo.registeredModelTypes.map(type => (
              <div key={type} className="text-gray-400 text-sm font-mono">
                • {type}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-white font-medium mb-2">등록된 노드 타입</h3>
          <div className="space-y-1">
            {debugInfo.registeredNodeTypes.map(type => (
              <div key={type} className="text-gray-400 text-sm font-mono">
                • {type}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div 
      className="bg-gray-800 border-t border-gray-700 h-full" 
      style={height ? { height } : undefined}
    >
      <div className="h-full flex flex-col">
        {/* 탭 헤더 */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none ${
              activeTab === 'logs' ? 'text-white bg-gray-700' : 'text-gray-400'
            }`}
          >
            <Terminal size={16} />
            로그
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none ${
              activeTab === 'metrics' ? 'text-white bg-gray-700' : 'text-gray-400'
            }`}
          >
            <Activity size={16} />
            성능 지표
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none ${
              activeTab === 'settings' ? 'text-white bg-gray-700' : 'text-gray-400'
            }`}
          >
            <Settings size={16} />
            설정
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="flex-1">
          {activeTab === 'logs' && renderLogPanel()}
          {activeTab === 'metrics' && renderMetricsPanel()}
          {activeTab === 'settings' && renderSettingsPanel()}
        </div>
      </div>
    </div>
  )
}

export default BottomPanel
