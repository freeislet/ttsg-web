# NNModel Train API 업데이트 가이드

## 📋 개요

NNModel의 `train` 메서드를 노드 기반 워크플로우에 최적화하여 업데이트했습니다. 외부에서 생성된 모델과 IDataset을 받아 훈련하는 방식으로 변경되어 더 유연하고 사용하기 편해졌습니다.

## 🔄 변경 사항

### **새로운 train 메서드 시그니처**

```typescript
// 새로운 방식 (권장)
async train(
  model: tf.Sequential,           // 외부에서 생성된 모델
  dataset: IDataset,              // 통합 데이터셋 인터페이스
  trainingConfig: ModelTrainingConfig,  // 최신 훈련 설정
  onProgress?: (epoch: number, logs: any) => void
): Promise<{ model: tf.Sequential; result: NewTrainingResult }>

// 기존 방식 (레거시, 하위 호환성)
async trainLegacy(
  trainX: tf.Tensor,
  trainY: tf.Tensor,
  trainingConfig: NNTrainingConfig,  // 구 타입
  onProgress?: (epoch: number, logs: any) => void
): Promise<{ model: tf.Sequential; result: TrainingResult }>
```

## 🎯 주요 개선사항

### **1. 외부 모델 전달**
- 노드에서 모델을 미리 생성하고 전달 가능
- 모델 재사용 및 상태 관리 개선

### **2. IDataset 통합**
- 모든 데이터셋 타입 (MNIST, Iris, Car MPG, Computed) 통일된 인터페이스
- 훈련/테스트 분할 자동 처리
- 메모리 관리 자동화

### **3. 최신 타입 사용**
- `ModelTrainingConfig`: 조기 종료, 과적합 감지 등 고급 기능
- `NewTrainingResult`: 상세한 훈련 결과 및 메트릭

## 🚀 사용 방법

### **노드에서의 기본 사용법**

```typescript
import { NNModel, createNeuralNetworkConfig } from '@/models'
import { getDataPreset } from '@/data'

// 1. 모델 정의 생성
const modelDef = new NNModel({
  inputShape: [4],
  outputUnits: 3,
  layers: [
    { type: 'dense', units: 8, activation: 'relu' },
    { type: 'dense', units: 4, activation: 'relu' }
  ]
})

// 2. TensorFlow 모델 생성
const tfModel = modelDef.createTFModel()

// 3. 데이터셋 로드
const irisPreset = getDataPreset('iris')
const dataset = await irisPreset.loader()

// 4. 훈련 설정
const config = createNeuralNetworkConfig({
  optimizer: 'adam',
  learningRate: 0.001,
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy'],
  epochs: 100,
  batchSize: 32,
  earlyStoppingPatience: 10
})

// 5. 훈련 실행
const result = await modelDef.train(
  tfModel, 
  dataset, 
  config,
  (epoch, logs) => console.log(`Epoch ${epoch}:`, logs)
)

console.log('Training completed:', result.result.finalMetrics)
```

### **편의 메서드 사용 (원스톱)**

```typescript
// 모델 생성 + 훈련을 한 번에
const result = await modelDef.createAndTrain(
  dataset,
  config,
  (epoch, logs) => console.log(`Epoch ${epoch}:`, logs)
)
```

### **다양한 데이터셋 예시**

```typescript
// MNIST (이미지 분류)
const mnistDataset = await getDataPreset('mnist').loader()
const mnistModel = new NNModel({
  inputShape: [28, 28, 1],
  outputUnits: 10,
  layers: [
    { type: 'flatten' },
    { type: 'dense', units: 128, activation: 'relu' },
    { type: 'dense', units: 64, activation: 'relu' }
  ]
})

// Car MPG (회귀)
const carDataset = await getDataPreset('car-mpg').loader()
const regressionModel = new NNModel({
  inputShape: [1],
  outputUnits: 1,
  layers: [
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 32, activation: 'relu' }
  ]
})

// Computed 데이터 (수학 함수)
const sineDataset = await getDataPreset('sine').loader()
```

## 📊 IDataset 자동 처리

새로운 train 메서드는 IDataset의 구조를 자동으로 감지합니다:

```typescript
// 훈련 데이터 자동 선택
const trainX = dataset.trainInputs || dataset.inputs
const trainY = dataset.trainLabels || dataset.labels

// 데이터 형태 자동 로깅
console.log(`📊 Training data shape: inputs ${trainX.shape}, labels ${trainY.shape}`)
```

## 🔧 고급 기능

### **조기 종료**
```typescript
const config = createNeuralNetworkConfig({
  epochs: 1000,
  earlyStoppingPatience: 15,  // 15 에포크 동안 개선 없으면 중단
  earlyStoppingMinDelta: 0.001
})

const result = await model.train(tfModel, dataset, config)
if (result.result.stoppedReason === 'early_stopping') {
  console.log(`⏹️ Stopped early at epoch ${result.result.epochs}`)
}
```

### **과적합 감지**
```typescript
// 자동으로 과적합 경고 출력
// ⚠️ Potential overfitting detected (val_loss: 0.8234, train_loss: 0.1234)
```

### **메모리 관리**
```typescript
// 훈련 완료 후 데이터셋 정리
dataset.dispose()

// 메모리 사용량 확인
const stats = dataset.getStats()
console.log(`Memory usage: ${stats.memoryUsage / 1024 / 1024} MB`)
```

## 🔄 마이그레이션 가이드

### **기존 코드 (계속 작동함)**
```typescript
// 레거시 방식 - 여전히 지원됨
const result = await model.trainLegacy(trainX, trainY, oldConfig, onProgress)
```

### **새로운 코드 (권장)**
```typescript
// 모던 방식 - 권장
const tfModel = model.createTFModel()
const result = await model.train(tfModel, dataset, newConfig, onProgress)
```

## 📈 성능 개선

1. **메모리 효율성**: IDataset의 자동 메모리 관리
2. **훈련 속도**: 조기 종료로 불필요한 에포크 방지
3. **코드 재사용**: 모델과 데이터의 분리로 재사용성 향상
4. **타입 안전성**: TypeScript 타입 시스템 완전 활용

## 🎯 노드 워크플로우 최적화

```typescript
// 노드 기반 워크플로우 예시
class TrainingNode {
  async executeTraining() {
    // 1. 연결된 모델 노드에서 모델 가져오기
    const modelNode = this.getConnectedModelNode()
    const tfModel = modelNode.createTFModel()
    
    // 2. 연결된 데이터 노드에서 데이터셋 가져오기
    const dataNode = this.getConnectedDataNode()
    const dataset = await dataNode.getDataset()
    
    // 3. 훈련 실행
    const result = await modelNode.nnModel.train(
      tfModel,
      dataset,
      this.trainingConfig,
      this.onProgress
    )
    
    // 4. 결과를 다음 노드로 전달
    this.outputTrainedModel(result.model, result.result)
  }
}
```

**새로운 train API로 노드 기반 워크플로우가 훨씬 직관적이고 유연해졌습니다!** 🚀
