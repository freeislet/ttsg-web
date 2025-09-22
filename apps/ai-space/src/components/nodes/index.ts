/**
 * 노드 컴포넌트 자동 등록
 * 
 * 새로운 아키텍처에서는 ModelNode와 DataNode만 사용합니다.
 */

import { NodeRegistry } from './NodeRegistry'

console.log('🔧 노드 컴포넌트 자동 등록 시작')

// 디버그 정보 출력
const debugInfo = NodeRegistry.getDebugInfo()
console.log('🔍 등록된 노드 타입:', debugInfo)

console.log('✅ 노드 컴포넌트 자동 등록 완료')
