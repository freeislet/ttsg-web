/**
 * 노드 컴포넌트 및 팩토리 중앙 관리
 * 모든 노드 타입의 등록과 export를 담당
 */

import { NodeRegistry } from './NodeRegistry'

// === 새 아키텍처 노드 컴포넌트들 ===
export { default as DataNode } from './DataNode'
export { default as NNModelNode } from './NNModelNode'
export { default as NNTrainingNode } from './NNTrainingNode'

// === 베이스 컴포넌트들 ===
export { BaseModelNode, createModelNodeComponent } from './BaseModelNode'
export { BaseTrainingNode, createTrainingNodeComponent } from './BaseTrainingNode'

// === 팩토리들 ===
export { DataNodeFactory } from './DataNodeFactory'
export { NNModelNodeFactory } from './NNModelNodeFactory'
export { NNTrainingNodeFactory } from './NNTrainingNodeFactory'
export { NNTrainedModelNodeFactory } from './NNTrainedModelNodeFactory'

// === 노드 팩토리 자동 등록 ===
import { NeuralNetworkNodeFactory } from './NeuralNetworkNodeFactories'

// 신경망 노드 팩토리 등록
NodeRegistry.register(NeuralNetworkNodeFactory)

// 데이터 노드 팩토리 등록 (필요시)
// 추가 노드 팩토리들도 여기서 등록

console.log('🔧 노드 팩토리들이 등록되었습니다')
