// Flat config for ESLint v9
// 참고: 기존 .eslintrc.js를 대체합니다. 플랫 구성에 맞춰 파서/플러그인 설정을 분리했습니다.

const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const astro = require('eslint-plugin-astro')
const astroParser = require('astro-eslint-parser')

const prodWarn = process.env.NODE_ENV === 'production' ? 'warn' : 'off'

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // 무시 패턴
  {
    ignores: [
      '**/dist/**',
      '**/.wrangler/**',
      '**/node_modules/**',
      // 생성 산출물 무시 (옵션 A)
      '**/.astro/**',
      '**/*.d.ts',
      '**/worker-configuration.d.ts',
      '**/functions/types.d.ts',
    ],
  },
  // Astro 권장 설정 (플랫 설정 제공) - 배열이므로 전개해서 삽입
  ...astro.configs['flat/recommended'],

  // 일반 JS/TS 공통 규칙
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': prodWarn,
      'no-debugger': prodWarn,
    },
  },

  // TypeScript 전용 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Astro 파일(.astro) 파서/플러그인 설정 (추가 규칙 필요 시 여기에 정의)
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
    plugins: {
      astro,
    },
    rules: {
      // 필요한 경우 astro 전용 규칙 추가
    },
  },
]
