# DataNode 개선 및 데이터 시각화 계획

## 📋 완료된 작업

### ✅ **DataNode 컴포넌트 업데이트**
- **새로운 데이터 구조 적용**: IDataset 인터페이스 사용
- **프리셋 기반 데이터 선택**: 드롭다운으로 간편한 데이터셋 선택
- **실시간 데이터 정보 표시**: 샘플 수, 입력/출력 형태, 컬럼 정보
- **뷰 모드 전환**: 테이블, 차트, 산점도 간 전환 가능

### ✅ **DataViewer 컴포넌트 구현**
- **테이블 뷰**: 페이지네이션이 있는 데이터 테이블
- **차트 뷰**: 첫 번째 입력 컬럼의 히스토그램
- **산점도 뷰**: 2D 데이터 시각화
- **CSV 내보내기**: 데이터 다운로드 기능
- **전체화면 모드**: 상세 분석을 위한 확대 보기

## 🎯 **현재 구현 상태**

### **DataNode 기능**
```typescript
// 지원하는 데이터셋들
- MNIST: 손글씨 숫자 (28x28 이미지 → 10개 클래스)
- Iris: 붓꽃 분류 (4개 특성 → 3개 품종)
- Car MPG: 자동차 연비 예측 (마력 → MPG)
- Computed: 수학 함수 데이터 (sine, linear 등)

// 표시되는 정보
- 샘플 수: 150개
- 입력 형태: [4]
- 출력 형태: [3]  
- 훈련/테스트: 120/30
- 입력 컬럼: sepal_length, sepal_width, petal_length, petal_width
- 출력 컬럼: class_0, class_1, class_2
```

### **DataViewer 기능**
```typescript
// 테이블 뷰
- 페이지당 50개 샘플 표시
- 모든 입력/출력 컬럼 표시
- 숫자 데이터 소수점 4자리 표시

// 차트 뷰  
- 첫 번째 입력 컬럼의 히스토그램
- 20개 구간으로 분할
- 상대적 높이로 정규화

// 산점도 뷰
- 첫 번째 vs 두 번째 컬럼 (또는 출력)
- 클래스별 색상 구분
- 최대 200개 샘플 (성능 최적화)
```

## 🚀 **다음 단계 개발 계획**

### **Phase 1: 고급 시각화 (2주)**

#### **1.1 차트 라이브러리 통합**
```bash
# 추천 라이브러리
pnpm add recharts          # React 친화적, 가벼움
# 또는
pnpm add @visx/visx        # D3 기반, 더 강력함
```

**구현할 차트들:**
- **히스토그램**: 모든 숫자 컬럼에 대해
- **박스 플롯**: 분포 및 이상치 확인
- **상관관계 매트릭스**: 컬럼 간 상관관계
- **산점도 매트릭스**: 모든 컬럼 조합
- **클래스 분포**: 분류 문제의 레이블 분포

#### **1.2 이미지 데이터 지원**
```typescript
// MNIST 같은 이미지 데이터 전용 뷰
interface ImageViewProps {
  dataset: IDataset
  imageShape: [number, number, number] // [height, width, channels]
  samplesPerRow: number
  maxSamples: number
}

// 구현 기능
- 이미지 그리드 표시 (28x28 MNIST 숫자들)
- 클래스별 필터링
- 확대/축소 기능
- 픽셀 값 히트맵
```

#### **1.3 통계 정보 패널**
```typescript
// 데이터셋 통계 요약
interface DatasetStats {
  numerical: {
    mean: number[]
    std: number[]
    min: number[]
    max: number[]
    quartiles: number[][]
  }
  categorical: {
    classCounts: Record<string, number>
    classDistribution: number[]
  }
  missing: {
    missingCounts: number[]
    missingPercentage: number[]
  }
}
```

### **Phase 2: 인터랙티브 기능 (1주)**

#### **2.1 데이터 필터링**
- **범위 슬라이더**: 숫자 컬럼 값 범위 조정
- **클래스 선택**: 특정 클래스만 표시
- **샘플 검색**: 특정 조건의 샘플 찾기

#### **2.2 데이터 변환**
- **정규화 옵션**: Min-Max, Z-score, Robust
- **로그 변환**: 치우친 분포 보정
- **원-핫 인코딩**: 범주형 데이터 변환

#### **2.3 실시간 업데이트**
- **데이터 변경 감지**: 데이터셋이 바뀌면 자동 새로고침
- **뷰 동기화**: 여러 뷰 간 선택 상태 동기화

### **Phase 3: 성능 최적화 (1주)**

#### **3.1 가상화 (Virtualization)**
```typescript
// 대용량 데이터 처리
import { FixedSizeList as List } from 'react-window'

// 테이블 가상화로 수만 개 행 처리
// 차트 샘플링으로 성능 향상
```

#### **3.2 웹 워커 활용**
```typescript
// 무거운 계산을 백그라운드에서
const statsWorker = new Worker('/workers/dataStats.js')

// 히스토그램, 통계 계산 등을 별도 스레드에서
```

#### **3.3 메모리 관리**
```typescript
// TensorFlow.js 메모리 정리
useEffect(() => {
  return () => {
    dataset.dispose() // 컴포넌트 언마운트 시 정리
  }
}, [dataset])
```

## 🔧 **기술적 고려사항**

### **현재 사용 가능한 시각화**
✅ **테이블 뷰**: 완전 구현됨
✅ **기본 히스토그램**: SVG로 구현됨  
✅ **산점도**: SVG로 구현됨
✅ **CSV 내보내기**: 완전 구현됨

### **개선이 필요한 부분**
🔄 **차트 라이브러리**: 현재 순수 SVG → Recharts/Visx로 업그레이드
🔄 **이미지 뷰**: MNIST 같은 이미지 데이터 전용 뷰 필요
🔄 **통계 패널**: 기본 통계만 → 고급 통계 분석 추가
🔄 **성능**: 대용량 데이터 처리 최적화 필요

### **아키텍처 설계**

#### **컴포넌트 구조**
```
DataViewer/
├── TableView.tsx          ✅ 구현완료
├── ChartView.tsx          🔄 개선필요 (라이브러리 통합)
├── ScatterView.tsx        ✅ 구현완료  
├── ImageView.tsx          🆕 신규구현
├── StatsPanel.tsx         🆕 신규구현
└── FilterPanel.tsx        🆕 신규구현
```

#### **데이터 플로우**
```
IDataset → DataViewer → ViewComponent → Visualization
    ↓         ↓            ↓              ↓
  메모리관리  뷰모드선택   데이터변환    렌더링최적화
```

## 📊 **예상 성능 지표**

### **현재 성능**
- **테이블**: 50개/페이지, 부드러운 스크롤
- **차트**: 20개 구간 히스토그램, 즉시 렌더링  
- **산점도**: 200개 샘플, 실시간 업데이트
- **메모리**: 데이터셋당 ~10-50MB

### **목표 성능 (Phase 3 완료 후)**
- **테이블**: 10,000개+ 행, 가상화로 부드러운 스크롤
- **차트**: 복잡한 차트도 <100ms 렌더링
- **산점도**: 10,000개+ 포인트, 인터랙티브 줌/팬
- **메모리**: 효율적인 정리로 메모리 누수 방지

## 🎯 **우선순위 권장사항**

### **즉시 구현 (이번 주)**
1. **Recharts 통합**: 더 나은 차트 품질
2. **이미지 뷰**: MNIST 데이터 시각화
3. **통계 패널**: 기본 통계 정보

### **다음 주 구현**
1. **필터링 기능**: 데이터 탐색 개선
2. **성능 최적화**: 대용량 데이터 지원
3. **내보내기 확장**: PNG, PDF 지원

### **장기 계획**
1. **고급 분석**: PCA, t-SNE 시각화
2. **실시간 스트리밍**: 데이터 실시간 업데이트
3. **협업 기능**: 시각화 공유 및 주석

**현재 DataNode와 DataViewer는 기본 기능이 완전히 구현되어 사용 가능한 상태입니다!** 🎉
