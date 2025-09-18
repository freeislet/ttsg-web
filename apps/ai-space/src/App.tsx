import React from 'react'
import { AppHeader } from 'shared'
import NewApp from '@/components/NewApp'
import { useNewModelStore } from '@/stores/newModelStore'

function App() {
  const { isLoading } = useNewModelStore()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <AppHeader title="AI SPACE v2" homeUrl="https://ttsg.space">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isLoading ? '로딩 중' : '새로운 아키텍처'}
          </span>
        </div>
      </AppHeader>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        <NewApp />
      </div>
    </div>
  )
}

export default App
