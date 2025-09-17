# AI Space 노드 에디터 아키텍처 재설계

## 📋 개요

AI Space의 노드 에디터를 TensorFlow.js의 실제 워크플로우와 일치하도록 재설계합니다. 기존의 개별 레이어 노드 방식에서 모델 생성-학습-평가의 명확한 단계별 접근 방식으로 전환합니다.

## 🎯 설계 목표

1. **실무 워크플로우 반영**: TensorFlow.js의 `createModel() → compile() → fit()` 패턴 구현
2. **직관적인 UX**: 사용자가 머신러닝 파이프라인을 쉽게 이해할 수 있는 구조
3. **유연한 데이터 연결**: 수동 입력과 자동 추론을 모두 지원
4. **확장 가능한 아키텍처**: 향후 다양한 모델 타입 지원 가능

## 🏗️ 새로운 노드 구조

### 1. 모델 정의 노드 (ModelDefinitionNode)

**역할**: `tf.sequential()` 모델 생성 및 레이어 구성

```typescript
interface ModelDefinitionNodeData {
  id: string
  label: string
  modelType: 'neural-network' | 'cnn' | 'rnn' // 확장 가능
  inputShape: number[] | 'auto' // 직접 입력 또는 데이터에서 자동 추론
  outputUnits: number | 'auto' // 직접 입력 또는 데이터에서 자동 추론
  layers: LayerConfig[] // 히든 레이어 구성
  isCompiled: boolean
}

interface LayerConfig {
  type: 'dense' | 'conv2d' | 'lstm' // 확장 가능
  units: number
  activation: 'relu' | 'sigmoid' | 'tanh' | 'linear' | 'softmax'
  // 추가 레이어별 설정...
}
```

**UI 특징**:
- 레이어 리스트를 동적으로 추가/제거 가능
- inputShape, outputUnits는 직접 입력 또는 연결된 데이터 노드에서 자동 설정
- 하단에 "모델 학습 노드 생성" 버튼 제공

**TensorFlow.js 매핑**:
```javascript
function createModel(nodeData) {
  const model = tf.sequential();
  
  // 입력 레이어
  model.add(tf.layers.dense({
    inputShape: nodeData.inputShape,
    units: nodeData.layers[0].units,
    activation: nodeData.layers[0].activation
  }));
  
  // 히든 레이어들
  nodeData.layers.slice(1).forEach(layer => {
    model.add(tf.layers.dense({
      units: layer.units,
      activation: layer.activation
    }));
  });
  
  // 출력 레이어
  model.add(tf.layers.dense({
    units: nodeData.outputUnits,
    activation: 'linear' // 또는 설정된 활성화 함수
  }));
  
  return model;
}
```

### 2. 모델 학습 노드 (TrainingNode)

**역할**: 모델 컴파일 및 학습 실행

```typescript
interface TrainingNodeData {
  id: string
  label: string
  // Compile 옵션
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad'
  learningRate: number
  loss: 'mse' | 'mae' | 'categorical-crossentropy' | 'binary-crossentropy'
  metrics: string[]
  // Fit 옵션
  epochs: number
  batchSize: number
  validationSplit: number
  // 상태
  isTraining: boolean
  trainingProgress?: {
    epoch: number
    loss: number
    accuracy?: number
    valLoss?: number
    valAccuracy?: number
  }
}
```

**UI 특징**:
- 모델 정의 노드에서만 생성 가능 (팔레트에 없음)
- 실시간 학습 진행 상황 표시
- 학습 시작/중지 버튼
- 학습 완료 시 자동으로 "학습된 모델" 노드 생성

**TensorFlow.js 매핑**:
```javascript
async function trainModel(model, inputs, labels, nodeData) {
  // 모델 컴파일
  model.compile({
    optimizer: tf.train.adam(nodeData.learningRate),
    loss: nodeData.loss,
    metrics: nodeData.metrics
  });

  // 모델 학습
  return await model.fit(inputs, labels, {
    batchSize: nodeData.batchSize,
    epochs: nodeData.epochs,
    validationSplit: nodeData.validationSplit,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // 실시간 진행 상황 업데이트
        updateTrainingProgress(epoch, logs);
      }
    }
  });
}
```

### 3. 학습된 모델 노드 (TrainedModelNode)

**역할**: 학습 완료된 모델 표시 및 예측 기능

```typescript
interface TrainedModelNodeData {
  id: string
  label: string
  modelId: string // 연결된 모델 정의 노드 ID
  trainingId: string // 연결된 학습 노드 ID
  // 성능 지표
  finalLoss: number
  finalAccuracy?: number
  trainingHistory: {
    epoch: number[]
    loss: number[]
    accuracy?: number[]
    valLoss?: number[]
    valAccuracy?: number[]
  }
  // 모델 상태
  isReady: boolean
}
```

**UI 특징**:
- 학습 결과 요약 표시
- 손실/정확도 그래프 미니뷰
- 예측 테스트 기능
- 모델 저장/내보내기 옵션

### 4. 훈련 데이터 노드 (TrainingDataNode)

**역할**: 기존 DataNode를 확장하여 더 명확한 역할 정의

```typescript
interface TrainingDataNodeData {
  id: string
  label: string
  dataType: 'training' | 'validation' | 'test'
  // 데이터 형태
  inputShape: number[] // [samples, features]
  outputShape: number[] // [samples, labels]
  // 실제 데이터
  data?: {
    inputs: number[][]
    labels: number[][]
  }
  // 메타데이터
  samples: number
  inputFeatures: number
  outputFeatures: number
}
```

## 🔗 노드 연결 구조

```
[훈련 데이터] → [모델 정의] → [모델 학습] → [학습된 모델]
     ↓              ↓              ↓              ↓
  데이터 제공    inputShape    학습 실행      성능 평가
               outputUnits      진행 상황      예측 기능
                자동 추론
```

### 연결 규칙

1. **훈련 데이터 → 모델 정의**: inputShape, outputUnits 자동 설정
2. **모델 정의 → 모델 학습**: 모델 구조 전달
3. **훈련 데이터 → 모델 학습**: 학습 데이터 제공
4. **모델 학습 → 학습된 모델**: 학습 결과 전달

## 🎨 "모델 학습 그룹" 프리셋

사용자 편의를 위해 4개 노드를 한 번에 생성하고 연결하는 프리셋 기능:

```typescript
function createModelTrainingGroup(): NodeGroup {
  const dataNode = createTrainingDataNode({
    position: { x: 100, y: 200 },
    data: { samples: 1000, inputFeatures: 4, outputFeatures: 1 }
  });
  
  const modelDefNode = createModelDefinitionNode({
    position: { x: 400, y: 200 },
    data: { 
      modelType: 'neural-network',
      inputShape: 'auto', // 데이터 노드에서 자동 설정
      outputUnits: 'auto',
      layers: [
        { type: 'dense', units: 64, activation: 'relu' },
        { type: 'dense', units: 32, activation: 'relu' }
      ]
    }
  });
  
  // 연결 생성
  const connections = [
    { source: dataNode.id, target: modelDefNode.id, type: 'data-to-model' }
  ];
  
  return { nodes: [dataNode, modelDefNode], connections };
}
```

## 🔄 기존 코드 마이그레이션

### 1. TypeScript 인터페이스 업데이트

기존 `types.ts` 파일에 새로운 노드 타입들 추가:

```typescript
// 기존
export type NodeData = LayerNodeData | ModelNodeData | DataNodeData;

// 새로운 구조
export type NodeData = 
  | ModelDefinitionNodeData 
  | TrainingNodeData 
  | TrainedModelNodeData 
  | TrainingDataNodeData;
```

### 2. TensorFlow.js 유틸리티 함수 업데이트

`tensorflow.ts`의 `createModelFromNodes` 함수를 새로운 구조에 맞게 수정:

```typescript
// 기존: LayerNodeData[] 기반
export const createModelFromNodes = (layerNodes: LayerNodeData[]): tf.Sequential

// 새로운: ModelDefinitionNodeData 기반
export const createModelFromDefinition = (
  modelDef: ModelDefinitionNodeData,
  trainingData?: TrainingDataNodeData
): tf.Sequential
```

## 📈 향후 확장 계획

1. **다양한 모델 타입 지원**:
   - CNN (Convolutional Neural Network)
   - RNN/LSTM (Recurrent Neural Network)
   - Transfer Learning 모델

2. **고급 기능**:
   - 하이퍼파라미터 자동 튜닝
   - 모델 앙상블
   - 실시간 성능 모니터링

3. **시각화 개선**:
   - 모델 아키텍처 다이어그램
   - 실시간 학습 곡선
   - 가중치 히트맵

## 🚀 구현 우선순위

1. **Phase 1**: 새로운 노드 타입 정의 및 기본 UI 구현
2. **Phase 2**: 노드 간 연결 로직 및 데이터 흐름 구현
3. **Phase 3**: TensorFlow.js 통합 및 실제 학습 기능
4. **Phase 4**: 프리셋 기능 및 UX 개선
5. **Phase 5**: 고급 기능 및 시각화 추가

---

이 설계는 AI Space를 실무에서 사용 가능한 수준의 머신러닝 도구로 발전시키는 기반을 제공합니다.
