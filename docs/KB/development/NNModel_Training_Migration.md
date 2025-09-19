# NNModel 훈련 시스템 마이그레이션 가이드

## 📋 개요

NNModel의 훈련 시스템을 새로운 `models/training` 모듈로 마이그레이션했습니다. 이를 통해 더 강력하고 확장 가능한 훈련 기능을 제공하며, 모든 모델 타입에서 재사용 가능한 구조를 구축했습니다.

## 🔄 변경 사항

### 1. 새로운 훈련 모듈 도입

```typescript
// 기존 (NNModel 내부)
switch (trainingConfig.optimizer) {
  case 'adam': optimizer = tf.train.adam(learningRate); break
  // ...
}

// 새로운 방식 (training 모듈)
import { createOptimizer } from './training'
const optimizer = createOptimizer('adam', 0.001)
```

### 2. 향상된 기능들

- **조기 종료 (Early Stopping)**: 과적합 방지
- **과적합 감지**: 자동 경고 시스템
- **향상된 메트릭**: 더 상세한 학습 분석
- **진행 상황 추적**: 실시간 모니터링

### 3. 하위 호환성 유지

기존 코드는 수정 없이 그대로 작동합니다:

```typescript
// 기존 방식 (여전히 작동함)
const result = await model.train(trainX, trainY, {
  optimizer: 'adam',
  learningRate: 0.001,
  loss: 'mse',
  epochs: 100,
  batchSize: 32
})
```

## 🚀 새로운 기능 사용법

### 1. 고급 훈련 설정

```typescript
import { createNeuralNetworkConfig } from './training'

const modernConfig = createNeuralNetworkConfig({
  optimizer: 'adam',
  learningRate: 0.001,
  loss: 'mse',
  epochs: 100,
  batchSize: 32,
  earlyStoppingPatience: 10,  // 새로운 기능!
  validationSplit: 0.2
})

const result = await model.trainWithModernConfig(trainX, trainY, modernConfig)
```

### 2. 모델 평가 및 예측

```typescript
// 모델 평가
const metrics = await model.evaluate(trainedModel, testX, testY)
console.log('Test accuracy:', metrics.accuracy)

// 예측
const prediction = model.predict(trainedModel, inputData)
```

### 3. 메모리 사용량 확인

```typescript
const memoryUsage = model.getMemoryUsage()
console.log(`Model memory usage: ${memoryUsage / 1024 / 1024} MB`)
```

## 📊 성능 개선

### 1. 조기 종료로 훈련 시간 단축

```typescript
const config = createNeuralNetworkConfig({
  epochs: 1000,
  earlyStoppingPatience: 15  // 15 에포크 동안 개선이 없으면 중단
})

// 실제로는 50 에포크에서 중단될 수 있음
const result = await model.trainWithModernConfig(trainX, trainY, config)
console.log(`Stopped at epoch: ${result.result.epochs}`)
```

### 2. 과적합 자동 감지

```typescript
// 훈련 완료 후 자동으로 과적합 여부 체크
const result = await model.train(trainX, trainY, config)

// 콘솔에 자동으로 경고 출력:
// ⚠️ Potential overfitting detected (val_loss: 0.8234, train_loss: 0.1234)
```

## 🔧 마이그레이션 체크리스트

### ✅ 완료된 항목

- [x] 새로운 training 모듈 생성
- [x] NNModel에 ModelTrainer 통합
- [x] 기존 인터페이스 deprecated 처리
- [x] 하위 호환성 유지
- [x] 추가 유틸리티 메서드 (evaluate, predict, getMemoryUsage)
- [x] 테스트 코드 작성

### 🔄 진행 중

- [ ] 다른 모델 타입 (CNN, RNN) 마이그레이션
- [ ] 노드 컴포넌트 업데이트
- [ ] 성능 벤치마크 테스트

## 📝 API 변경 사항

### Deprecated 인터페이스

```typescript
// @deprecated - 새로운 training 모듈의 ModelTrainingConfig 사용 권장
export interface NNTrainingConfig { ... }

// @deprecated - 새로운 training 모듈의 TrainingResult 사용 권장  
export interface TrainingResult { ... }
```

### 새로운 메서드

```typescript
// 새로운 고급 훈련 메서드
trainWithModernConfig(trainX, trainY, config, callbacks): Promise<{model, result}>

// 모델 평가
evaluate(model, testX, testY): Promise<Record<string, number>>

// 모델 예측
predict(model, inputData): tf.Tensor | tf.Tensor[]

// 메모리 사용량 계산
getMemoryUsage(): number
```

## 🎯 다음 단계

1. **노드 컴포넌트 업데이트**: TrainingNode에서 새로운 기능 활용
2. **CNN/RNN 모델 마이그레이션**: 동일한 패턴으로 다른 모델 타입 업그레이드
3. **성능 최적화**: 대용량 데이터셋에 대한 배치 처리 개선
4. **UI 개선**: 조기 종료, 과적합 감지 상태를 UI에 표시

## 🔍 문제 해결

### 일반적인 문제

1. **Import 오류**: `models/training` 모듈이 제대로 빌드되었는지 확인
2. **타입 오류**: 기존 코드에서 deprecated 인터페이스 사용 시 경고 무시 가능
3. **메모리 누수**: 새로운 시스템은 자동으로 텐서 정리를 수행

### 디버깅 팁

```typescript
// 훈련 과정 상세 로그 확인
const config = createNeuralNetworkConfig({
  verbose: 1,  // 상세 로그 활성화
  // ...
})
```

## 📚 참고 자료

- [TensorFlow.js 공식 문서](https://www.tensorflow.org/js)
- [AI Space 노드 아키텍처 문서](../2.%20Product/AI_Space_노드_아키텍처_재설계.md)
- [Training 모듈 API 문서](../../apps/ai-space/src/models/training/README.md)
