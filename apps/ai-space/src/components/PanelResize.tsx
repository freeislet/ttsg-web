import React from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

export { Panel, PanelGroup } from 'react-resizable-panels'

interface PanelResizeHandleProps {
  /** 추가 CSS 클래스명 */
  className?: string
}

/**
 * 수평 방향 패널 리사이즈 핸들 컴포넌트
 * 좌우로 드래그하여 패널 크기를 조정할 수 있습니다.
 */
export const PanelResizeHandleHorizontal: React.FC<PanelResizeHandleProps> = ({
  className = '',
}) => {
  return (
    <PanelResizeHandle
      className={`w-2 bg-gray-200 hover:bg-blue-300 transition-colors cursor-col-resize relative group ${className}`}
    >
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-400 group-hover:bg-blue-500 transition-colors transform -translate-x-1/2" />
    </PanelResizeHandle>
  )
}

/**
 * 수직 방향 패널 리사이즈 핸들 컴포넌트
 * 상하로 드래그하여 패널 크기를 조정할 수 있습니다.
 */
export const PanelResizeHandleVertical: React.FC<PanelResizeHandleProps> = ({ className = '' }) => {
  return (
    <PanelResizeHandle
      className={`h-2 bg-gray-200 hover:bg-blue-300 transition-colors cursor-row-resize relative group ${className}`}
    >
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-400 group-hover:bg-blue-500 transition-colors transform -translate-y-1/2" />
    </PanelResizeHandle>
  )
}
