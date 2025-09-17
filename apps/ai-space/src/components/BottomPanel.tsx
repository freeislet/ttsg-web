import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Terminal, Activity, Settings } from 'lucide-react'
import LogPanel from './LogPanel'
import MetricsPanel from './MetricsPanel'
import SettingsPanel from './SettingsPanel'
import 'react-tabs/style/react-tabs.css'

interface BottomPanelProps {
  /** 패널의 높이 (픽셀 단위) */
  height: number
}

/**
 * 하단 패널 컴포넌트
 * 로그, 성능 지표, 설정 등의 탭을 포함하는 하단 패널
 */
const BottomPanel: React.FC<BottomPanelProps> = ({ height }) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700" style={{ height }}>
      <Tabs className="h-full flex flex-col">
        <TabList className="flex bg-gray-800 border-b border-gray-700 m-0 p-0">
          <Tab className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none">
            <Terminal size={16} />
            로그
          </Tab>
          <Tab className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none">
            <Activity size={16} />
            성능 지표
          </Tab>
          <Tab className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 hover:bg-gray-700 border-none bg-transparent outline-none">
            <Settings size={16} />
            설정
          </Tab>
        </TabList>

        <TabPanel className="flex-1 outline-none">
          <LogPanel />
        </TabPanel>
        <TabPanel className="flex-1 outline-none">
          <MetricsPanel />
        </TabPanel>
        <TabPanel className="flex-1 outline-none">
          <SettingsPanel />
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default BottomPanel
