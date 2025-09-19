/**
 * 레이어 팩토리 통합 테스트
 */

import { 
  createLayer, 
  validateLayerConfig, 
  getSupportedLayerTypes, 
  createDefaultLayerConfig 
} from '../index'
import type { LayerConfig, LayerType } from '../types'

describe('Layer Factory Integration', () => {
  describe('createLayer', () => {
    it('should create dense layer', () => {
      const config: LayerConfig = {
        type: 'dense',
        units: 64,
        activation: 'relu',
      }

      const layer = createLayer(config)
      expect(layer).toBeDefined()
    })

    it('should create dropout layer', () => {
      const config: LayerConfig = {
        type: 'dropout',
        rate: 0.3,
      }

      const layer = createLayer(config)
      expect(layer).toBeDefined()
    })

    it('should create batchNormalization layer', () => {
      const config: LayerConfig = {
        type: 'batchNormalization',
      }

      const layer = createLayer(config)
      expect(layer).toBeDefined()
    })

    it('should create conv1d layer', () => {
      const config: LayerConfig = {
        type: 'conv1d',
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
      }

      const layer = createLayer(config)
      expect(layer).toBeDefined()
    })

    it('should throw error for unsupported layer type', () => {
      const config = {
        type: 'unsupported',
      } as any

      expect(() => createLayer(config)).toThrow('Unsupported layer type: unsupported')
    })
  })

  describe('validateLayerConfig', () => {
    it('should validate all supported layer types', () => {
      const configs: LayerConfig[] = [
        { type: 'dense', units: 32, activation: 'relu' },
        { type: 'dropout', rate: 0.2 },
        { type: 'batchNormalization' },
        { type: 'conv1d', filters: 16, kernelSize: 3 },
      ]

      configs.forEach(config => {
        expect(validateLayerConfig(config)).toBe(true)
      })
    })

    it('should handle invalid configs', () => {
      const invalidConfigs: LayerConfig[] = [
        { type: 'dense', units: 0 }, // invalid units
        { type: 'dropout', rate: 1.5 }, // invalid rate
        { type: 'conv1d', filters: 0, kernelSize: 3 }, // invalid filters
      ]

      invalidConfigs.forEach(config => {
        expect(validateLayerConfig(config)).toBe(false)
      })
    })
  })

  describe('getSupportedLayerTypes', () => {
    it('should return all supported layer types', () => {
      const types = getSupportedLayerTypes()
      
      expect(types).toContain('dense')
      expect(types).toContain('dropout')
      expect(types).toContain('batchNormalization')
      expect(types).toContain('conv1d')
      expect(types.length).toBeGreaterThan(0)
    })
  })

  describe('createDefaultLayerConfig', () => {
    it('should create default config for each layer type', () => {
      const supportedTypes = getSupportedLayerTypes()
      
      supportedTypes.forEach(type => {
        const config = createDefaultLayerConfig(type)
        expect(config.type).toBe(type)
        expect(validateLayerConfig(config)).toBe(true)
      })
    })

    it('should throw error for unsupported layer type', () => {
      expect(() => createDefaultLayerConfig('unsupported' as LayerType))
        .toThrow('Unsupported layer type: unsupported')
    })
  })
})
