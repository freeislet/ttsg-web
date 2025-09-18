import React, { useEffect } from 'react'
import NewFlowEditor from './NewFlowEditor'
import NewSidebar from './NewSidebar'

// 모델 및 노드 자동 등록을 위한 import
import '@/models/nn' // 신경망 모델 자동 등록

/**
 * 새로운 메인 App 컴포넌트
 */
const NewApp: React.FC = () => {
  useEffect(() => {
    console.log('🚀 AI Space v2 - New Architecture Loaded')
    console.log('📦 Models and Nodes auto-registered')
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <NewSidebar />
      
      {/* 메인 에디터 */}
      <div className="flex-1 relative">
        <NewFlowEditor />
      </div>
    </div>
  )
}

export default NewApp
