import * as tf from '@tensorflow/tfjs'

/**
 * TensorFlow.js 공식 튜토리얼 코드 테스트
 * https://www.tensorflow.org/js/tutorials 에서 가져온 기본 예제
 */
export async function testTensorFlowBasic(): Promise<boolean> {
  console.log('🧪 Starting TensorFlow.js basic test...')
  
  try {
    // TensorFlow.js 백엔드 확인
    await tf.ready()
    console.log('🔧 TensorFlow.js backend:', tf.getBackend())
    
    // Create a simple model.
    const model = tf.sequential()
    model.add(tf.layers.dense({units: 1, inputShape: [1]}))
    
    console.log('✅ Model created successfully')

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'})
    
    console.log('✅ Model compiled successfully')

    // Generate some synthetic data for training. (y = 2x - 1)
    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])
    
    console.log('✅ Test data created successfully')
    console.log('📊 xs shape:', xs.shape, 'ys shape:', ys.shape)

    // Train the model using the data.
    console.log('🚀 Starting model.fit...')
    const history = await model.fit(xs, ys, {
      epochs: 10, // 빠른 테스트를 위해 250에서 10으로 축소
      verbose: 1
    })
    
    console.log('✅ Training completed successfully!')
    console.log('📊 Final loss:', history.history.loss[history.history.loss.length - 1])
    
    // Test prediction
    const prediction = model.predict(tf.tensor2d([5], [1, 1])) as tf.Tensor
    console.log('🎯 Prediction for x=5:', await prediction.data())
    
    // Clean up
    xs.dispose()
    ys.dispose()
    prediction.dispose()
    model.dispose()
    
    console.log('🧹 Memory cleaned up')
    console.log('🎉 TensorFlow.js basic test PASSED!')
    
    return true
    
  } catch (error) {
    console.error('❌ TensorFlow.js basic test FAILED:', error)
    return false
  }
}

/**
 * 더 복잡한 모델 테스트 (현재 AI Space와 유사한 구조)
 */
export async function testTensorFlowComplex(): Promise<boolean> {
  console.log('🧪 Starting TensorFlow.js complex model test...')
  
  try {
    // TensorFlow.js 백엔드 확인
    await tf.ready()
    console.log('🔧 TensorFlow.js backend:', tf.getBackend())
    
    // Create a more complex model similar to AI Space
    const model = tf.sequential()
    
    // First dense layer (similar to our default layers)
    model.add(tf.layers.dense({
      units: 8,
      activation: 'relu',
      inputShape: [4] // Similar to Iris dataset
    }))
    
    // Second dense layer
    model.add(tf.layers.dense({
      units: 4,
      activation: 'relu'
    }))
    
    // Output layer for 3-class classification
    model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }))
    
    console.log('✅ Complex model created successfully')

    // Compile model
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
    
    console.log('✅ Complex model compiled successfully')

    // Generate synthetic data similar to Iris
    const numSamples = 120
    const xs = tf.randomNormal([numSamples, 4])
    const ys = tf.oneHot(tf.randomUniform([numSamples], 0, 3, 'int32'), 3)
    
    console.log('✅ Complex test data created successfully')
    console.log('📊 xs shape:', xs.shape, 'ys shape:', ys.shape)

    // Train the model
    console.log('🚀 Starting complex model.fit...')
    const history = await model.fit(xs, ys, {
      epochs: 5,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 1
    })
    
    console.log('✅ Complex training completed successfully!')
    console.log('📊 Final loss:', history.history.loss[history.history.loss.length - 1])
    console.log('📊 Final accuracy:', history.history.acc?.[history.history.acc.length - 1] || 'N/A')
    
    // Clean up
    xs.dispose()
    ys.dispose()
    model.dispose()
    
    console.log('🧹 Memory cleaned up')
    console.log('🎉 TensorFlow.js complex test PASSED!')
    
    return true
    
  } catch (error) {
    console.error('❌ TensorFlow.js complex test FAILED:', error)
    return false
  }
}
