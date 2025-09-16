import { proxy } from 'valtio'
import * as tf from '@tensorflow/tfjs'
import { 
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from 'reactflow'
import { 
  FlowNode, 
  LayerNodeData, 
  ModelNodeData, 
  DataNodeData,
  ModelState,
  NodeData
} from '@/types'
import {
  createModelFromNodes,
  compileModel as compileModelTF,
  trainModel as trainModelTF,
  generateSampleData,
  extractLayerWeights,
  disposeModel,
  disposeTensors,
  getMemoryInfo
} from '@/utils/tensorflow'

// TensorFlow.js 모델 인스턴스 저장
let currentModel: tf.Sequential | null = null
let currentTrainingData: { x: tf.Tensor, y: tf.Tensor } | null = null

// valtio 프록시 상태
export const modelState = proxy<ModelState>({
  nodes: [],
  edges: [],
  selectedNode: null,
  trainingState: {
    isTraining: false,
    currentEpoch: 0,
    totalEpochs: 0,
    currentLoss: 0,
    currentAccuracy: undefined,
    history: []
  },
  compiledModel: null,
})

// 액션 함수들
export const modelActions = {
  // 노드 추가
  addNode: (type: 'input' | 'hidden' | 'output' | 'model' | 'data', position: { x: number, y: number }) => {
    const id = `${type}-${Date.now()}`
    let data: NodeData

    switch (type) {
      case 'input':
      case 'hidden':
      case 'output':
        data = {
          type,
          neurons: type === 'input' ? 784 : type === 'output' ? 10 : 128,
          activation: type === 'input' ? undefined : 'relu',
          label: type === 'input' ? '입력 레이어' : type === 'output' ? '출력 레이어' : '히든 레이어'
        } as LayerNodeData
        break
      case 'model':
        data = {
          type: 'model',
          modelType: 'neural-network',
          hyperparameters: {
            learningRate: 0.001,
            epochs: 100,
            batchSize: 32,
            optimizer: 'adam',
            loss: 'mse'
          },
          label: '모델',
          isCompiled: false,
          isTrained: false
        } as ModelNodeData
        break
      case 'data':
        data = {
          type: 'data',
          dataType: 'training',
          shape: [1000, 784],
          samples: 1000,
          features: 784,
          label: '데이터'
        } as DataNodeData
        break
      default:
        return
    }

    const newNode: FlowNode = {
      id,
      type,
      position,
      data
    }

    modelState.nodes.push(newNode)
  },

  // 노드 업데이트
  updateNode: (nodeId: string, data: Partial<NodeData>) => {
    const nodeIndex = modelState.nodes.findIndex((node) => node.id === nodeId)
    if (nodeIndex !== -1) {
      modelState.nodes[nodeIndex].data = { ...modelState.nodes[nodeIndex].data, ...data }
    }
  },

  // 노드 삭제
  deleteNode: (nodeId: string) => {
    modelState.nodes = modelState.nodes.filter((node) => node.id !== nodeId)
    modelState.edges = modelState.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )
    if (modelState.selectedNode === nodeId) {
      modelState.selectedNode = null
    }
  },

  // 노드 변경 처리
  onNodesChange: (changes: NodeChange[]) => {
    modelState.nodes = applyNodeChanges(changes, modelState.nodes)
  },

  // 엣지 변경 처리
  onEdgesChange: (changes: EdgeChange[]) => {
    modelState.edges = applyEdgeChanges(changes, modelState.edges)
  },

  // 연결 처리
  onConnect: (connection: Connection) => {
    modelState.edges = addEdge(connection, modelState.edges)
  },

  // 노드 선택
  setSelectedNode: (nodeId: string | null) => {
    modelState.selectedNode = nodeId
  },

  // 모델 컴파일
  compileModel: async () => {
    try {
      const modelNode = modelState.nodes.find(node => node.data.type === 'model')
      const layerNodes = modelState.nodes
        .filter(node => ['input', 'hidden', 'output'].includes(node.data.type))
        .map(node => node.data as LayerNodeData)
        .sort((a, b) => {
          const order = { input: 0, hidden: 1, output: 2 }
          return order[a.type] - order[b.type]
        })

      if (!modelNode || modelNode.data.type !== 'model' || layerNodes.length === 0) {
        throw new Error('모델 노드 또는 레이어 노드가 없습니다')
      }

      // 기존 모델 정리
      if (currentModel) {
        disposeModel(currentModel)
      }

      // 새 모델 생성
      currentModel = createModelFromNodes(layerNodes)
      compileModelTF(currentModel, (modelNode.data as ModelNodeData).hyperparameters)

      modelActions.updateNode(modelNode.id, { isCompiled: true })
      console.log('모델 컴파일 완료:', getMemoryInfo())
    } catch (error) {
      console.error('모델 컴파일 실패:', error)
      throw error
    }
  },

  // 모델 학습
  trainModel: async () => {
    try {
      const modelNode = modelState.nodes.find(node => node.data.type === 'model')
      const dataNode = modelState.nodes.find(node => node.data.type === 'data')
      
      if (!modelNode || modelNode.data.type !== 'model' || !(modelNode.data as ModelNodeData).isCompiled) {
        throw new Error('모델이 컴파일되지 않았습니다')
      }

      if (!currentModel) {
        throw new Error('TensorFlow.js 모델이 없습니다')
      }

      const hyperparams = (modelNode.data as ModelNodeData).hyperparameters
      modelState.trainingState.isTraining = true
      modelState.trainingState.totalEpochs = hyperparams.epochs
      modelState.trainingState.currentEpoch = 0
      modelState.trainingState.history = []

      // 훈련 데이터 준비
      if (!currentTrainingData) {
        const inputNode = modelState.nodes.find(n => n.data.type === 'input')
        const outputNode = modelState.nodes.find(n => n.data.type === 'output')
        const inputSize = inputNode ? (inputNode.data as LayerNodeData).neurons : 784
        const outputSize = outputNode ? (outputNode.data as LayerNodeData).neurons : 10
        const samples = (dataNode?.data as DataNodeData)?.samples || 1000
        
        currentTrainingData = generateSampleData(samples, inputSize, outputSize)
      }

      // 실제 TensorFlow.js 학습
      await trainModelTF(
        currentModel,
        currentTrainingData.x,
        currentTrainingData.y,
        hyperparams,
        (epoch, logs) => {
          if (!modelState.trainingState.isTraining) return
          
          modelState.trainingState.currentEpoch = epoch + 1
          modelState.trainingState.currentLoss = logs?.loss || 0
          modelState.trainingState.currentAccuracy = logs?.acc || logs?.accuracy || undefined
          
          modelState.trainingState.history.push({
            epoch: epoch + 1,
            loss: logs?.loss || 0,
            accuracy: logs?.acc || logs?.accuracy || 0
          })

          // 가중치 추출 및 업데이트
          modelState.nodes.forEach((node, nodeIndex) => {
            if (['input', 'hidden', 'output'].includes(node.data.type)) {
              const layerIndex = Math.floor(nodeIndex / 2)
              const weights = extractLayerWeights(currentModel!, layerIndex)
              if (weights) {
                modelActions.updateNode(node.id, {
                  weights: weights.weights,
                  biases: weights.biases,
                  isActive: true
                })
              }
            }
          })
        }
      )

      modelState.trainingState.isTraining = false
      modelActions.updateNode(modelNode.id, { isTrained: true })
      
      // 모든 레이어 비활성화
      modelState.nodes.forEach(node => {
        if (['input', 'hidden', 'output'].includes(node.data.type)) {
          modelActions.updateNode(node.id, { isActive: false })
        }
      })
      
      console.log('모델 학습 완료:', getMemoryInfo())
    } catch (error) {
      modelState.trainingState.isTraining = false
      console.error('모델 학습 실패:', error)
      throw error
    }
  },

  // 학습 중단
  stopTraining: () => {
    modelState.trainingState.isTraining = false
  },

  // 모델 리셋
  resetModel: () => {
    // TensorFlow.js 모델 정리
    if (currentModel) {
      disposeModel(currentModel)
      currentModel = null
    }
    
    if (currentTrainingData) {
      disposeTensors(currentTrainingData.x, currentTrainingData.y)
      currentTrainingData = null
    }

    modelState.trainingState = {
      isTraining: false,
      currentEpoch: 0,
      totalEpochs: 0,
      currentLoss: 0,
      currentAccuracy: undefined,
      history: []
    }

    // 모든 노드의 학습 관련 상태 리셋
    modelState.nodes.forEach(node => {
      if (node.data.type === 'model') {
        modelActions.updateNode(node.id, { 
          isCompiled: false, 
          isTrained: false,
          trainingProgress: undefined 
        })
      } else if (['input', 'hidden', 'output'].includes(node.data.type)) {
        modelActions.updateNode(node.id, { 
          weights: undefined,
          biases: undefined,
          activations: undefined,
          gradients: undefined,
          isActive: false,
          isTraining: false
        })
      }
    })
    
    console.log('모델 리셋 완료:', getMemoryInfo())
  },

  // 예측 실행
  predict: async (inputData: number[]) => {
    if (!currentModel) {
      throw new Error('모델이 컴파일되지 않았습니다')
    }
    
    try {
      const inputTensor = tf.tensor2d([inputData])
      const prediction = currentModel.predict(inputTensor) as tf.Tensor
      const result = await prediction.data()
      
      // 메모리 정리
      inputTensor.dispose()
      prediction.dispose()
      
      return Array.from(result)
    } catch (error) {
      console.error('예측 실패:', error)
      throw error
    }
  },

  // 전체 상태 초기화
  reset: () => {
    modelState.nodes = []
    modelState.edges = []
    modelState.selectedNode = null
    modelState.trainingState = {
      isTraining: false,
      currentEpoch: 0,
      totalEpochs: 0,
      currentLoss: 0,
      history: [],
    }
    modelState.compiledModel = null
  },
}
