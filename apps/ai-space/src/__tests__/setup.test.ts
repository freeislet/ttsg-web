/**
 * 테스트 환경 설정 확인
 */

describe('Test Environment Setup', () => {
  it('should have Jest globals available', () => {
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('should have testing library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)

    expect(element).toBeInTheDocument()

    // 정리
    document.body.removeChild(element)
  })

  it('should have TensorFlow.js mocked', async () => {
    const tf = await import('@tensorflow/tfjs')

    expect(tf.sequential).toBeDefined()
    expect(tf.layers.dense).toBeDefined()
    expect(tf.train.adam).toBeDefined()
  })

  it('should have React Flow mocked', async () => {
    const { ReactFlow } = await import('reactflow')

    expect(ReactFlow).toBeDefined()
  })

  it('should have Valtio mocked', async () => {
    const { proxy, useSnapshot } = await import('valtio')

    expect(proxy).toBeDefined()
    expect(useSnapshot).toBeDefined()
  })
})
