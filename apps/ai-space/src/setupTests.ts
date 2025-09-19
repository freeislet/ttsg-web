/**
 * Jest 테스트 환경 설정
 */

import '@testing-library/jest-dom'

// TensorFlow.js 모킹 설정
jest.mock('@tensorflow/tfjs', () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve({
      history: {
        loss: [0.5, 0.3, 0.1],
        accuracy: [0.7, 0.8, 0.9],
        val_loss: [0.6, 0.4, 0.2],
        val_accuracy: [0.6, 0.7, 0.8],
      }
    })),
    predict: jest.fn(),
    summary: jest.fn(),
    dispose: jest.fn(),
  })),
  layers: {
    dense: jest.fn(() => ({ name: 'dense_mock' })),
    dropout: jest.fn(() => ({ name: 'dropout_mock' })),
    batchNormalization: jest.fn(() => ({ name: 'batchNorm_mock' })),
    conv1d: jest.fn(() => ({ name: 'conv1d_mock' })),
    inputLayer: jest.fn(() => ({ name: 'input_mock' })),
  },
  train: {
    adam: jest.fn(() => ({ name: 'adam_optimizer' })),
    sgd: jest.fn(() => ({ name: 'sgd_optimizer' })),
    rmsprop: jest.fn(() => ({ name: 'rmsprop_optimizer' })),
  },
  tensor: jest.fn(),
  randomNormal: jest.fn(() => ({
    dispose: jest.fn(),
  })),
  dispose: jest.fn(),
}))

// React Flow 모킹
jest.mock('reactflow', () => ({
  ReactFlow: jest.fn(({ children }) => children),
  Handle: jest.fn(({ children }) => children),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
  useReactFlow: () => ({
    screenToFlowPosition: jest.fn((pos) => pos),
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
  }),
  applyNodeChanges: jest.fn((_changes, nodes) => nodes),
  applyEdgeChanges: jest.fn((_changes, edges) => edges),
  addEdge: jest.fn((connection, edges) => [...edges, connection]),
}))

// Valtio 모킹 (필요시)
jest.mock('valtio', () => ({
  proxy: jest.fn((obj) => obj),
  useSnapshot: jest.fn((obj) => obj),
}))

// 전역 설정
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
})

// Canvas 모킹 (TensorFlow.js 시각화용)
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})) as any

// 콘솔 경고 억제 (테스트 중 불필요한 로그 제거)
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ReactDOM.render') ||
       args[0].includes('Warning: '))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})
