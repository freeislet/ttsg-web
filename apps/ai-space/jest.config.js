/** @type {import('jest').Config} */
export default {
  // 테스트 환경 설정
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  
  // ESM 지원
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // 모듈 경로 매핑 (vite.config.ts와 동일하게)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@/models/(.*)$': '<rootDir>/src/models/$1',
    '^@/data/(.*)$': '<rootDir>/src/data/$1',
  },
  
  // 테스트 설정 파일
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // 변환 설정
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },
  
  // 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  
  // 모듈 무시 패턴
  transformIgnorePatterns: [
    'node_modules/(?!(reactflow|@reactflow|@tensorflow/tfjs|valtio)/)',
  ],
  
  // 테스트 타임아웃 (TensorFlow.js 테스트용)
  testTimeout: 30000,
}
