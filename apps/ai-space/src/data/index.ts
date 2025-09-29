/**
 * 데이터 모듈 통합 export
 */

// 타입들
export * from './types'

// 레지스트리
export { DataRegistry, dataRegistry } from './registry'

// 데이터셋들 등록 실행 (side-effect)
import './datasets'
