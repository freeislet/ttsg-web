# 데이터셋 로더 구조

이 폴더는 AI Space에서 사용하는 모든 데이터셋 로더들을 카테고리별로 구성합니다.

## 📁 폴더 구조

```
/datasets/
├── BaseDataset.ts          # 기본 데이터셋 클래스 (메모리 관리)
├── index.ts                # 통합 export
├── sample/                 # 외부 다운로드 데이터셋들
│   ├── index.ts           # sample 데이터셋 통합 export
│   └── mnist.ts           # MNIST 손글씨 숫자 데이터셋
└── computed/              # 프로그래밍 방식으로 생성되는 데이터셋들
    └── index.ts           # 수학 함수 기반 데이터 생성
```

## 🎯 카테고리별 설명

### Sample 데이터셋 (`/sample/`)
외부에서 다운로드하는 실제 데이터셋들입니다.

- **MNIST**: 손글씨 숫자 인식 (28x28 이미지 → 0-9 분류)
- **향후 추가 예정**: CIFAR-10, Fashion-MNIST, Iris, Titanic 등

### Computed 데이터셋 (`/computed/`)
프로그래밍 방식으로 생성하는 수학적 데이터셋들입니다.

- **선형 함수**: y = ax + b
- **삼각 함수**: 사인파, 코사인파, 탄젠트
- **고급 함수**: 시그모이드, 가우시안 분포 등

## 🔧 새로운 데이터셋 추가하기

### 1. Sample 데이터셋 추가
```typescript
// /sample/new-dataset.ts
export async function loadNewDataset(): Promise<IDataset> {
  // 외부 데이터 다운로드 및 처리
  const data = await fetch('https://example.com/dataset.json')
  // IDataset 형태로 변환하여 반환
  return new CustomDataset(...)
}
```

### 2. Computed 데이터셋 추가
```typescript
// /computed/index.ts에 새로운 함수 추가
export const COMPUTED_FUNCTIONS = {
  // 기존 함수들...
  newFunction: {
    name: 'New Function',
    description: 'Description of new function',
    formula: 'y = f(x)',
    category: 'advanced',
    defaultParams: { param1: 1 }
  }
}
```

## 📋 사용 예시

```typescript
import { loadMNIST, loadLinearData } from '@/data/datasets'

// Sample 데이터 로드
const mnistDataset = await loadMNIST()

// Computed 데이터 로드  
const linearDataset = await loadLinearData()

// 메모리 정리
mnistDataset.dispose()
linearDataset.dispose()
```

## 🛡️ 메모리 관리

모든 데이터셋은 `BaseDataset`을 상속받아 자동 메모리 관리를 제공합니다:

- `dispose()`: 모든 텐서 메모리 해제
- `getStats()`: 메모리 사용량 및 통계 정보
- `isDisposed`: 정리 여부 확인

## 🚀 확장성

이 구조는 향후 새로운 카테고리 추가를 쉽게 만듭니다:

- `/sample/`: 실제 데이터셋
- `/computed/`: 수학적 생성 데이터
- `/synthetic/`: AI 생성 데이터 (향후)
- `/streaming/`: 실시간 스트리밍 데이터 (향후)
- `/augmented/`: 데이터 증강 (향후)
