/**
 * Dense 레이어 팩토리 테스트
 */

import { createDenseLayer, validateDenseConfig, getDefaultDenseConfig } from '../dense'
import type { DenseLayerConfig } from '../types'

describe('Dense Layer Factory', () => {
  describe('createDenseLayer', () => {
    it('should create dense layer with valid config', () => {
      const config: DenseLayerConfig = {
        type: 'dense',
        units: 64,
        activation: 'relu',
      }

      const layer = createDenseLayer(config)
      expect(layer).toBeDefined()
      expect(layer.name).toBe('dense_mock')
    })

    it('should use default values for optional fields', () => {
      const config: DenseLayerConfig = {
        type: 'dense',
        units: 32,
      }

      const layer = createDenseLayer(config)
      expect(layer).toBeDefined()
    })

    it('should handle all activation types', () => {
      const activations: Array<DenseLayerConfig['activation']> = [
        'relu', 'sigmoid', 'tanh', 'softmax', 'linear', 'elu', 'selu'
      ]

      activations.forEach(activation => {
        const config: DenseLayerConfig = {
          type: 'dense',
          units: 32,
          activation,
        }

        const layer = createDenseLayer(config)
        expect(layer).toBeDefined()
      })
    })
  })

  describe('validateDenseConfig', () => {
    it('should validate correct config', () => {
      const config: DenseLayerConfig = {
        type: 'dense',
        units: 64,
        activation: 'relu',
      }

      expect(validateDenseConfig(config)).toBe(true)
    })

    it('should reject config with zero units', () => {
      const config: DenseLayerConfig = {
        type: 'dense',
        units: 0,
        activation: 'relu',
      }

      expect(validateDenseConfig(config)).toBe(false)
    })

    it('should reject config with negative units', () => {
      const config: DenseLayerConfig = {
        type: 'dense',
        units: -10,
        activation: 'relu',
      }

      expect(validateDenseConfig(config)).toBe(false)
    })
  })

  describe('getDefaultDenseConfig', () => {
    it('should return default config', () => {
      const config = getDefaultDenseConfig()
      
      expect(config).toEqual({
        type: 'dense',
        units: 32,
        activation: 'relu',
        useBias: true,
      })
    })

    it('should accept custom units', () => {
      const config = getDefaultDenseConfig(128)
      
      expect(config.units).toBe(128)
      expect(config.type).toBe('dense')
    })
  })
})
