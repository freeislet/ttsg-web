import { DataNodeState, DataSourceType } from '@/types/DataTypes'
import DataNode from './DataNode'

/**
 * 고유 ID 생성 함수
 */
const generateNodeId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 기본 데이터 노드 상태 생성
 */
const createDefaultDataNodeState = (sourceType: DataSourceType = 'preset'): DataNodeState => {
  return {
    config: {
      sourceType,
      // 기본값들은 UI에서 설정
    },
    isLoading: false,
    viewMode: 'table'
  }
}

/**
 * 데이터 노드 생성 팩토리
 */
export const createDataNode = (
  position: { x: number; y: number },
  sourceType: DataSourceType = 'preset'
) => {
  const nodeId = generateNodeId('data')
  
  return {
    id: nodeId,
    type: 'data',
    position,
    data: {
      label: '데이터 소스',
      state: createDefaultDataNodeState(sourceType)
    }
  }
}

/**
 * 데이터 노드 팩토리 객체
 */
export const DataNodeFactory = {
  nodeType: 'data',
  displayName: '데이터 소스',
  NodeComponent: DataNode,
  createNode: createDataNode
}
