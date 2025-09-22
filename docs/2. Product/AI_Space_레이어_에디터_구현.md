# AI Space 레이어 에디터 구현

## 🎯 개요

AI Space 앱의 신경망 모델 레이어 구성을 별도의 React Flow 기반 시각적 에디터로 분리하여 더 직관적이고 유연한 모델 설계 환경을 제공합니다.

## 🏗️ 아키텍처 설계

### 기존 방식의 문제점
- 모델 노드 내부에서 폼 기반 레이어 설정
- 복잡한 모델 구조 시각화의 한계
- 레이어 간 연결 관계 파악 어려움
- 자동 배치 기능 부재

### 새로운 접근 방식
- **별도 React Flow 에디터**: 레이어를 노드로, 연결을 엣지로 시각화
- **입력/출력 노드**: 동그라미 형태로 모델의 시작과 끝 표현
- **히든 레이어**: 사각형 노드로 상세 파라미터 표시
- **자동 배치**: 레이어 추가 시 최적 위치 자동 계산

## 🔧 구현된 컴포넌트

### 1. 타입 정의 (`/types/LayerEditor.ts`)

#### 핵심 타입
```typescript
export type LayerNodeType = 
  | 'input'      // 입력 노드 (동그라미)
  | 'output'     // 출력 노드 (동그라미)  
  | 'dense'      // Dense 레이어
  | 'conv2d'     // Conv2D 레이어
  | 'lstm'       // LSTM 레이어
  | 'dropout'    // Dropout 레이어
  | 'flatten'    // Flatten 레이어

export interface LayerNodeData {
  label: string
  layerType: LayerNodeType
  units?: number
  activation?: string
  filters?: number
  kernelSize?: number | [number, number]
  rate?: number
  // ... 기타 레이어별 설정
}
```

#### 자동 레이아웃 설정
```typescript
export interface AutoLayoutConfig {
  nodeSpacing: number      // 노드 간 간격 (150px)
  layerSpacing: number     // 레이어 간 간격 (200px)
  startX: number          // 시작 X 좌표 (100px)
  startY: number          // 시작 Y 좌표 (100px)
}
```

### 2. 레이어 노드 컴포넌트 (`/components/layer-editor/LayerNode.tsx`)

#### 시각적 차별화
- **입력/출력 노드**: 원형, 색상 구분 (녹색/빨간색)
- **Dense 레이어**: 파란색 사각형, 유닛 수 표시
- **Conv2D 레이어**: 보라색 사각형, 필터 수 표시
- **LSTM 레이어**: 주황색 사각형, 시퀀스 정보 표시
- **Dropout 레이어**: 회색 사각형, 드롭아웃 비율 표시

#### 핸들 시스템
```typescript
// 입력 노드: 출력 핸들만
<Handle type="source" position={Position.Right} />

// 출력 노드: 입력 핸들만  
<Handle type="target" position={Position.Left} />

// 일반 레이어: 양방향 핸들
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />
```

### 3. 메인 에디터 (`/components/layer-editor/LayerEditor.tsx`)

#### 주요 기능
1. **레이어 팔레트**: 좌측 패널에서 드래그 앤 드롭으로 레이어 추가
2. **시각적 편집**: React Flow 기반 노드 연결 및 배치
3. **속성 패널**: 우측에서 선택된 레이어의 상세 설정
4. **자동 배치**: 버튼 클릭으로 모든 노드 최적 배치

#### 핵심 기능 구현
```typescript
// 새 레이어 추가
const addLayer = useCallback((layerType: LayerNodeType) => {
  const newNode: Node<LayerNodeData> = {
    id: `layer-${nextNodeId}`,
    type: 'layerNode',
    position: { x: 300 + nextNodeId * 50, y: 200 + nextNodeId * 20 },
    data: { ...DEFAULT_LAYER_CONFIGS[layerType] }
  }
  setNodes(nds => [...nds, newNode])
}, [nextNodeId, setNodes])

// 자동 레이아웃
const autoLayout = useCallback(() => {
  setNodes(nds => {
    const sortedNodes = [...nds].sort((a, b) => {
      if (a.id === 'input') return -1
      if (b.id === 'input') return 1
      if (a.id === 'output') return 1
      if (b.id === 'output') return -1
      return (a.data.layerIndex || 0) - (b.data.layerIndex || 0)
    })

    return sortedNodes.map((node, index) => ({
      ...node,
      position: {
        x: config.startX + index * config.nodeSpacing,
        y: config.startY
      }
    }))
  })
}, [setNodes])
```

### 4. 속성 패널 (`/components/layer-editor/LayerPropertiesPanel.tsx`)

#### 레이어별 설정 UI
- **Dense**: 유닛 수, 활성화 함수
- **Conv2D**: 필터 수, 커널 크기, 패딩, 활성화 함수
- **LSTM**: 유닛 수, 활성화 함수, 시퀀스 반환 여부
- **Dropout**: 드롭아웃 비율 (0.0 ~ 1.0)
- **Flatten**: 설정 없음 (안내 메시지만 표시)

## 🔄 기존 시스템과의 통합

### 1. 모델 노드 업데이트

#### 레이어 요약 표시
```typescript
// 레이어 개수와 편집 버튼
<div className="flex justify-between items-center">
  <span>레이어:</span>
  <div className="flex items-center gap-1">
    <span className="font-mono">{data.layers?.length || 0}</span>
    <button onClick={() => setIsLayerEditorOpen(true)}>
      <Edit3 className="w-3 h-3" />
    </button>
  </div>
</div>

// 레이어 요약 정보 (최대 3개 표시)
{data.layers?.slice(0, 3).map((layer, index) => (
  <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
    <span className="font-medium">{layer.type}</span>
    <span className="text-gray-500">
      {layer.units && `${layer.units}u`}
      {layer.filters && `${layer.filters}f`}
    </span>
  </div>
))}
```

#### 레이어 에디터 통합
```typescript
<LayerEditor
  isOpen={isLayerEditorOpen}
  onClose={() => setIsLayerEditorOpen(false)}
  initialLayers={data.layers || []}
  onSave={handleLayersSave}
/>
```

### 2. 속성 패널 개선

기존 폼 기반 레이어 편집을 레이어 에디터 버튼으로 대체:

```typescript
// 기존: 복잡한 폼 UI
<LayerEditor layer={layer} onUpdate={updateLayer} mode="panel" />

// 새로운: 간단한 요약 + 에디터 버튼
<button onClick={() => setIsLayerEditorOpen(true)}>
  <Edit3 className="w-3 h-3" />
  레이어 편집
</button>
```

## 🤖 자동 Shape 추론 시스템

### 1. 데이터 연결 기반 추론 (`/utils/modelShapeInference.ts`)

#### 데이터셋별 Shape 매핑
```typescript
const DATA_TYPE_SHAPES: Record<string, number[]> = {
  'mnist': [28, 28, 1],        // MNIST 이미지
  'iris': [4],                 // Iris 특성 4개
  'car-mpg': [7],             // Car MPG 특성 7개
  'linear': [1],              // 1차원 입력
  // ...
}

const DATA_TYPE_OUTPUT_UNITS: Record<string, number> = {
  'mnist': 10,                // 0-9 숫자 분류
  'iris': 3,                  // 3개 품종 분류
  'car-mpg': 1,              // 연비 예측 (회귀)
  // ...
}
```

#### 자동 추론 함수
```typescript
export function inferInputShapeFromDataNode(
  modelNode: Node<ModelNodeData>,
  dataNodes: Node<DataNodeData>[],
  edges: Edge[]
): number[] | null {
  // 모델 노드로 연결되는 엣지 찾기
  const incomingEdges = edges.filter(edge => edge.target === modelNode.id)
  
  // 연결된 데이터 노드에서 shape 추론
  const connectedDataNode = dataNodes.find(node => 
    incomingEdges.some(edge => edge.source === node.id)
  )
  
  if (connectedDataNode?.data.selectedPresetId) {
    return DATA_TYPE_SHAPES[connectedDataNode.data.selectedPresetId] || [1]
  }
  
  return null
}
```

### 2. ModelStore 통합

연결 변경 시 자동 shape 업데이트:

```typescript
onConnect: (connection: Connection) => {
  modelState.edges = addEdge(connection, modelState.edges)
  // 연결 후 모델 shape 자동 업데이트
  modelState.nodes = updateModelShapes(modelState.nodes, modelState.edges)
},
```

### 3. 권장 레이어 구성 제안

데이터 타입에 따른 최적 아키텍처 자동 제안:

```typescript
export function suggestLayerConfiguration(
  inputShape: number[],
  outputUnits: number
) {
  const isImageData = inputShape.length >= 2 && inputShape[0] > 1
  const isClassification = outputUnits > 1
  
  if (isImageData) {
    // CNN 구조 제안
    return [
      { type: 'conv2d', filters: 32, kernelSize: 3, activation: 'relu' },
      { type: 'conv2d', filters: 64, kernelSize: 3, activation: 'relu' },
      { type: 'flatten' },
      { type: 'dense', units: 128, activation: 'relu' },
      { type: 'dropout', rate: 0.5 },
      { type: 'dense', units: outputUnits, activation: isClassification ? 'softmax' : 'linear' }
    ]
  }
  // ... 기타 데이터 타입별 구성
}
```

## 🎨 사용자 경험 개선

### 1. 직관적인 시각화
- **입력/출력**: 명확한 시작점과 종료점 표시
- **레이어 타입**: 색상과 아이콘으로 즉시 구분 가능
- **연결 관계**: 시각적 엣지로 데이터 흐름 표현

### 2. 효율적인 편집
- **드래그 앤 드롭**: 레이어 팔레트에서 간편한 추가
- **실시간 미리보기**: 변경사항 즉시 반영
- **자동 배치**: 복잡한 모델도 깔끔하게 정리

### 3. 컨텍스트 인식
- **데이터 기반 추론**: 연결된 데이터에 따른 자동 설정
- **타입별 최적화**: 이미지, 시퀀스, 테이블 데이터별 권장 구조
- **실시간 검증**: 잘못된 연결이나 설정 즉시 감지

## 🚀 향후 확장 계획

### 1. 고급 레이어 지원
- **Attention 레이어**: Transformer 모델 지원
- **Normalization 레이어**: BatchNorm, LayerNorm 등
- **Custom 레이어**: 사용자 정의 레이어 생성

### 2. 시각화 개선
- **3D 뷰**: 복잡한 모델의 입체적 표현
- **애니메이션**: 데이터 흐름 시각화
- **성능 지표**: 각 레이어별 연산량, 메모리 사용량 표시

### 3. 협업 기능
- **템플릿 공유**: 검증된 모델 구조 템플릿
- **버전 관리**: 모델 구조 변경 이력 추적
- **주석 시스템**: 레이어별 설명 및 메모

## 📁 파일 구조

```
/src/
├── types/
│   └── LayerEditor.ts              # 레이어 에디터 타입 정의
├── components/
│   └── layer-editor/
│       ├── index.ts                # Export 모음
│       ├── LayerEditor.tsx         # 메인 에디터 컴포넌트
│       ├── LayerNode.tsx          # 개별 레이어 노드
│       └── LayerPropertiesPanel.tsx # 속성 편집 패널
├── utils/
│   └── modelShapeInference.ts      # Shape 자동 추론 유틸리티
└── stores/
    └── modelStore.ts              # 자동 추론 통합
```

## 🎯 핵심 혁신 사항

1. **시각적 모델 설계**: 복잡한 신경망 구조를 직관적으로 설계
2. **자동 Shape 추론**: 데이터 연결 기반 자동 입출력 크기 결정
3. **컨텍스트 인식**: 데이터 타입에 따른 최적 아키텍처 제안
4. **원활한 통합**: 기존 모델 노드 시스템과 완벽 호환

이제 AI Space는 단순한 레이어 나열에서 벗어나 실제 신경망의 구조와 데이터 흐름을 시각적으로 이해하고 설계할 수 있는 강력한 도구로 발전했습니다.
