import { proxy, useSnapshot } from 'valtio'
import {
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow'
import {
  FlowNode,
  FlowEdge,
  ModelState,
  NodeData,
  ModelNodeData,
  TrainingNodeData,
  TrainedModelNodeData,
  TrainingDataNodeData,
  NodeType,
} from '@/types'
import {
  createModelFromDefinition,
  compileModelFromTrainingNode,
  trainModelFromTrainingNode,
  generateTrainingData,
  executeTrainingPipeline,
} from '@/utils/tensorflow'
import {
  createModelNode,
  createTrainingNode,
  createTrainedModelNode,
  createTrainingDataNode,
  createModelTrainingGroup,
} from '@/utils/nodeFactory'
import { logInfo, logWarn, logError, logDebug } from '@/store/logStore'

/**
 * AI Space 모델 상태 관리 (Valtio 기반)
 */

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
    history: [],
  },
  modelDefinitions: {},
  trainingSessions: {},
  trainedModels: {},
  trainingDatasets: {},
  nodeGroups: [],
  activeGroupId: undefined,
})

// 액션 함수들
export const modelActions = {
  // === 새로운 노드 생성 함수들 ===

  // 개별 노드 생성
  addNode: (type: NodeType, position: { x: number; y: number }, config?: any) => {
    let newNode: FlowNode

    switch (type) {
      case 'model':
        newNode = createModelNode(position, config)
        modelState.modelDefinitions[newNode.id] = newNode.data as ModelNodeData
        logInfo('모델 정의 노드가 추가되었습니다', 'node')
        break

      case 'training':
        if (!config?.modelNodeId) {
          logError('학습 노드 생성에는 모델 노드 ID가 필요합니다', 'node')
          return
        }
        newNode = createTrainingNode(position, config.modelNodeId, config)
        modelState.trainingSessions[newNode.id] = newNode.data as TrainingNodeData
        logInfo('모델 학습 노드가 추가되었습니다', 'node')
        break

      case 'trained-model':
        if (!config?.modelId || !config?.trainingId) {
          logError('학습된 모델 노드 생성에는 모델 ID와 학습 ID가 필요합니다', 'node')
          return
        }
        newNode = createTrainedModelNode(position, config.modelId, config.trainingId, config)
        modelState.trainedModels[newNode.id] = newNode.data as TrainedModelNodeData
        logInfo('학습된 모델 노드가 추가되었습니다', 'node')
        break

      case 'training-data':
        newNode = createTrainingDataNode(position, config)
        modelState.trainingDatasets[newNode.id] = newNode.data as TrainingDataNodeData
        logInfo(
          `훈련 데이터 노드가 추가되었습니다 (샘플: ${(newNode.data as TrainingDataNodeData).samples})`,
          'node'
        )
        break

      default:
        logError(`알 수 없는 노드 타입: ${type}`, 'node')
        return
    }

    modelState.nodes.push(newNode)
  },

  // 모델 학습 그룹 생성 (4개 노드 한 번에)
  addModelTrainingGroup: (position: { x: number; y: number }, config?: any) => {
    try {
      const group = createModelTrainingGroup({
        position,
        dataConfig: {
          samples: config?.samples || 1000,
          inputFeatures: config?.inputFeatures || 4,
          outputFeatures: config?.outputFeatures || 1,
          dataType: config?.dataType || 'training',
        },
        modelConfig: {
          modelType: config?.modelType || 'neural-network',
          layers: config?.layers || [
            { type: 'dense', units: 64, activation: 'relu' },
            { type: 'dense', units: 32, activation: 'relu' },
          ],
        },
        trainingConfig: {
          optimizer: config?.optimizer || 'adam',
          learningRate: config?.learningRate || 0.001,
          loss: config?.loss || 'mse',
          epochs: config?.epochs || 50,
          batchSize: config?.batchSize || 32,
        },
      })

      // 노드들을 상태에 추가
      group.nodes.forEach((node: FlowNode) => {
        modelState.nodes.push(node)

        // 각 노드를 해당 상태 객체에도 저장
        switch (node.data.type) {
          case 'model':
            modelState.modelDefinitions[node.id] = node.data as ModelNodeData
            break
          case 'training':
            modelState.trainingSessions[node.id] = node.data as TrainingNodeData
            break
          case 'trained-model':
            modelState.trainedModels[node.id] = node.data as TrainedModelNodeData
            break
          case 'training-data':
            modelState.trainingDatasets[node.id] = node.data as TrainingDataNodeData
            break
        }
      })

      // 엣지들을 상태에 추가
      group.edges.forEach((edge: FlowEdge) => {
        modelState.edges.push(edge)
      })

      // 노드 그룹 저장
      modelState.nodeGroups.push(group)
      modelState.activeGroupId = group.id

      logInfo(`모델 학습 그룹이 생성되었습니다 (${group.nodes.length}개 노드)`, 'node')
    } catch (error) {
      logError(`모델 학습 그룹 생성 실패: ${error}`, 'node')
    }
  },

  // === 기본 노드 관리 함수들 ===

  // 노드 업데이트
  updateNode: <T extends NodeData>(nodeId: string, data: Partial<T>) => {
    const nodeIndex = modelState.nodes.findIndex((node) => node.id === nodeId)
    if (nodeIndex !== -1) {
      const node = modelState.nodes[nodeIndex]
      modelState.nodes[nodeIndex].data = { ...node.data, ...data }

      // 해당 상태 객체도 업데이트
      switch (node.data.type) {
        case 'model':
          if (modelState.modelDefinitions[nodeId]) {
            modelState.modelDefinitions[nodeId] = {
              ...modelState.modelDefinitions[nodeId],
              ...data,
            }
          }
          break
        case 'training':
          if (modelState.trainingSessions[nodeId]) {
            modelState.trainingSessions[nodeId] = {
              ...modelState.trainingSessions[nodeId],
              ...data,
            }
          }
          break
        case 'trained-model':
          if (modelState.trainedModels[nodeId]) {
            modelState.trainedModels[nodeId] = { ...modelState.trainedModels[nodeId], ...data }
          }
          break
        case 'training-data':
          if (modelState.trainingDatasets[nodeId]) {
            modelState.trainingDatasets[nodeId] = {
              ...modelState.trainingDatasets[nodeId],
              ...data,
            }
          }
          break
      }
    }
  },

  // 노드 삭제
  deleteNode: (nodeId: string) => {
    const node = modelState.nodes.find((n) => n.id === nodeId)
    if (node) {
      logWarn(`${node.data.label} 노드가 삭제되었습니다`, 'node')

      // 해당 상태 객체에서도 제거
      switch (node.data.type) {
        case 'model':
          delete modelState.modelDefinitions[nodeId]
          break
        case 'training':
          delete modelState.trainingSessions[nodeId]
          break
        case 'trained-model':
          delete modelState.trainedModels[nodeId]
          break
        case 'training-data':
          delete modelState.trainingDatasets[nodeId]
          break
      }
    }

    modelState.nodes = modelState.nodes.filter((node) => node.id !== nodeId)
    modelState.edges = modelState.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    )
    if (modelState.selectedNode === nodeId) {
      modelState.selectedNode = null
    }
  },

  // === React Flow 이벤트 핸들러들 ===

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
    logDebug(`노드 연결: ${connection.source} → ${connection.target}`, 'connection')
  },

  // 노드 선택
  setSelectedNode: (nodeId: string | null) => {
    modelState.selectedNode = nodeId
  },

  // 훈련 데이터 생성
  generateTrainingData: (
    nodeId: string,
    dataType: 'linear' | 'classification' | 'polynomial' = 'linear'
  ) => {
    const dataNode = modelState.trainingDatasets[nodeId]
    if (!dataNode) {
      logError('훈련 데이터 노드를 찾을 수 없습니다', 'data')
      return
    }

    try {
      const generatedData = generateTrainingData(
        dataNode.samples,
        dataNode.inputFeatures,
        dataNode.outputFeatures,
        dataType
      )

      modelActions.updateNode(nodeId, {
        data: generatedData,
        dataStats: {
          inputMean: generatedData.inputs[0]?.map(() => 0), // 간단한 통계 계산
          inputStd: generatedData.inputs[0]?.map(() => 1),
        },
      })

      logInfo(`훈련 데이터가 생성되었습니다 (${generatedData.inputs.length}개 샘플)`, 'data')
    } catch (error) {
      logError(`훈련 데이터 생성 실패: ${error}`, 'data')
    }
  },

  // 전체 학습 파이프라인 실행
  executeTrainingPipeline: async (groupId: string) => {
    const group = modelState.nodeGroups.find((g) => g.id === groupId)
    if (!group) {
      logError('노드 그룹을 찾을 수 없습니다', 'training')
      return
    }

    try {
      // 그룹에서 필요한 노드들 찾기
      const dataNode = group.nodes.find((n) => n.data.type === 'training-data')
      const modelDefNode = group.nodes.find((n) => n.data.type === 'model')
      const trainingNode = group.nodes.find((n) => n.data.type === 'training')
      const trainedModelNode = group.nodes.find((n) => n.data.type === 'trained-model')

      if (!dataNode || !modelDefNode || !trainingNode || !trainedModelNode) {
        logError('필요한 노드들을 찾을 수 없습니다', 'training')
        return
      }

      logInfo('전체 학습 파이프라인을 시작합니다...', 'training')

      // 학습 상태 업데이트
      modelState.trainingState.isTraining = true
      modelActions.updateNode(trainingNode.id, { isTraining: true })

      const result = await executeTrainingPipeline(
        modelDefNode.data as ModelNodeData,
        dataNode.data as TrainingDataNodeData,
        trainingNode.data as TrainingNodeData,
        (epoch: number, logs: any) => {
          // 실시간 진행 상황 업데이트
          modelActions.updateNode(trainingNode.id, {
            trainingProgress: {
              epoch,
              totalEpochs: (trainingNode.data as TrainingNodeData).epochs,
              loss: logs?.loss || 0,
              accuracy: logs?.accuracy,
              valLoss: logs?.val_loss,
              valAccuracy: logs?.val_accuracy,
            },
          })

          modelState.trainingState.currentEpoch = epoch
          modelState.trainingState.currentLoss = logs?.loss || 0
          modelState.trainingState.currentAccuracy = logs?.accuracy
        }
      )

      // 학습 완료 후 상태 업데이트
      modelState.trainingState.isTraining = false
      modelActions.updateNode(trainingNode.id, { isTraining: false })
      modelActions.updateNode(trainedModelNode.id, {
        isReady: true,
        finalLoss: result.finalMetrics.loss,
        finalAccuracy: result.finalMetrics.accuracy,
        trainingHistory: {
          epochs: Array.from({ length: result.history.history.loss.length }, (_, i) => i + 1),
          loss: result.history.history.loss as number[],
          accuracy: (result.history.history.acc as number[]) || [],
          valLoss: (result.history.history.val_loss as number[]) || [],
          valAccuracy: (result.history.history.val_acc as number[]) || [],
        },
      })

      logInfo('전체 학습 파이프라인이 완료되었습니다', 'training')
    } catch (error) {
      modelState.trainingState.isTraining = false
      logError(`학습 파이프라인 실패: ${error}`, 'training')
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
      currentAccuracy: undefined,
      history: [],
    }
    modelState.modelDefinitions = {}
    modelState.trainingSessions = {}
    modelState.trainedModels = {}
    modelState.trainingDatasets = {}
    modelState.nodeGroups = []
    modelState.activeGroupId = undefined

    logInfo('모든 상태가 초기화되었습니다', 'system')
  },
}

// 커스텀 훅: 모델 상태 스냅샷 사용
export const useModelSnapshot = () => {
  return useSnapshot(modelState)
}
