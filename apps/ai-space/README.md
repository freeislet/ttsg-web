# AI Space

AI 모델 시각화 및 학습 플랫폼 - 노드 기반 인터페이스로 신경망을 구성하고 실시간으로 학습 과정을 시각화할 수 있습니다.

## 주요 기능

- **노드 기반 모델 구성**: 드래그 앤 드롭으로 신경망 레이어를 구성
- **실시간 가중치 시각화**: 학습 중 가중치 매트릭스를 컬러 맵으로 시각화
- **TensorFlow.js 통합**: 브라우저에서 직접 모델 학습 및 추론
- **Valtio 상태 관리**: 반응형 상태 관리로 실시간 UI 업데이트
- **모던 UI**: Tailwind CSS와 Lucide 아이콘으로 구성된 직관적인 인터페이스

## 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, React Flow, Lucide React
- **AI**: TensorFlow.js, tfjs-vis
- **상태 관리**: Valtio
- **배포**: Cloudflare Workers/Pages

## 개발 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

앱이 `http://localhost:4324`에서 실행됩니다.

### 3. 빌드

```bash
pnpm build
```

## 사용법

### 1. 모델 구성

1. **레이어 추가**: 사이드바에서 입력, 히든, 출력 레이어 노드를 추가
2. **노드 연결**: 레이어 노드들을 순서대로 연결
3. **모델 노드 추가**: 모델 설정을 위한 모델 노드 추가
4. **데이터 노드 추가**: 학습 데이터를 위한 데이터 노드 추가

### 2. 하이퍼파라미터 설정

모델 노드에서 다음 설정을 조정할 수 있습니다:
- 학습률 (Learning Rate)
- 에포크 (Epochs)
- 배치 크기 (Batch Size)
- 옵티마이저 (Adam, SGD, RMSprop, Adagrad)
- 손실 함수 (MSE, MAE, Categorical Crossentropy, Binary Crossentropy)

### 3. 모델 학습

1. **컴파일**: 모델 노드에서 "모델 컴파일" 버튼 클릭
2. **학습 시작**: "학습 시작" 버튼으로 학습 진행
3. **실시간 모니터링**: 학습 진행 상황과 가중치 변화를 실시간으로 확인

### 4. 가중치 시각화

- 레이어 노드를 선택하면 우측 패널에서 가중치 매트릭스 시각화
- 색상으로 가중치 값 표현 (빨간색: 음수, 파란색: 양수)
- 통계 정보 (평균, 표준편차, 최솟값, 최댓값) 제공

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── nodes/          # 노드 컴포넌트 (Layer, Model, Data)
│   ├── FlowEditor.tsx  # React Flow 에디터
│   ├── Sidebar.tsx     # 노드 팔레트
│   ├── WeightVisualizer.tsx  # 가중치 시각화
│   └── TrainingPanel.tsx     # 학습 제어 패널
├── stores/             # Valtio 상태 관리
│   └── modelStore.ts   # 모델 상태 및 액션
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── utils/              # 유틸리티 함수
│   └── tensorflow.ts   # TensorFlow.js 헬퍼
└── App.tsx            # 메인 앱 컴포넌트
```

## 배포

### Cloudflare Workers/Pages 배포

1. **환경 변수 설정**:
   ```bash
   cp .env.example .env
   # .env 파일에서 Cloudflare 계정 정보 설정
   ```

2. **배포 실행**:
   ```bash
   pnpm deploy
   ```

### 환경 변수

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
- `VITE_TENSORFLOW_BACKEND`: TensorFlow.js 백엔드 (webgl, cpu)

## 개발 가이드

### 새로운 노드 타입 추가

1. `src/types/index.ts`에 노드 데이터 타입 정의
2. `src/components/nodes/`에 노드 컴포넌트 생성
3. `src/stores/modelStore.ts`에 노드 생성 로직 추가
4. `src/components/FlowEditor.tsx`에 노드 타입 등록

### 새로운 활성화 함수 추가

1. `src/types/index.ts`의 `ActivationType`에 추가
2. `src/utils/tensorflow.ts`에 TensorFlow.js 매핑 추가
3. 노드 컴포넌트의 선택 옵션에 추가

## 라이선스

MIT License

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.
