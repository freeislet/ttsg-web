import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useModelStore } from '@/stores/modelStore'

// TensorFlow Playground 스타일 상수들
const RECT_SIZE = 30
const BIAS_SIZE = 5
const NEURON_CANVAS_SIZE = 24

/**
 * 신경망 레이어 정보
 */
interface LayerInfo {
  id: string
  nodes: number
  type: 'input' | 'hidden' | 'output'
  activation?: string
}

/**
 * 연결 정보 (가중치 포함)
 */
interface ConnectionInfo {
  sourceLayer: number
  sourceNode: number
  targetLayer: number
  targetNode: number
  weight: number
  id: string
}

/**
 * TensorFlow Playground 완전 재현 컴포넌트
 */
export const NeuralNetworkVisualization: React.FC<{
  modelId?: string
  width?: number
  height?: number
  className?: string
  showNodeOutputs?: boolean
}> = ({ 
  modelId, 
  width = 600, 
  height = 400, 
  className,
  showNodeOutputs = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const modelStore = useModelStore()

  // Mock 신경망 구조
  const [layers] = useState<LayerInfo[]>([
    { id: 'input', nodes: 2, type: 'input' },
    { id: 'hidden1', nodes: 4, type: 'hidden', activation: 'tanh' },
    { id: 'hidden2', nodes: 4, type: 'hidden', activation: 'tanh' },
    { id: 'output', nodes: 1, type: 'output', activation: 'sigmoid' }
  ])

  // Mock 가중치 데이터
  const generateMockWeights = (): ConnectionInfo[] => {
    const connections: ConnectionInfo[] = []
    
    for (let layerIdx = 0; layerIdx < layers.length - 1; layerIdx++) {
      const currentLayer = layers[layerIdx]
      const nextLayer = layers[layerIdx + 1]
      
      for (let sourceIdx = 0; sourceIdx < currentLayer.nodes; sourceIdx++) {
        for (let targetIdx = 0; targetIdx < nextLayer.nodes; targetIdx++) {
          connections.push({
            sourceLayer: layerIdx,
            sourceNode: sourceIdx,
            targetLayer: layerIdx + 1,
            targetNode: targetIdx,
            weight: (Math.random() - 0.5) * 4, // -2 ~ 2 범위
            id: `${layerIdx}-${sourceIdx}-${layerIdx + 1}-${targetIdx}`
          })
        }
      }
    }
    
    return connections
  }

  const [connections] = useState<ConnectionInfo[]>(generateMockWeights())

  // 뉴런의 출력을 시각화하는 작은 캔버스 생성
  const createNeuronCanvas = (nodeId: string, x: number, y: number) => {
    if (!containerRef.current) return

    // 기존 캔버스 제거
    const existingCanvas = containerRef.current.querySelector(`#canvas-${nodeId}`)
    if (existingCanvas) {
      existingCanvas.remove()
    }

    const canvas = document.createElement('canvas')
    canvas.id = `canvas-${nodeId}`
    canvas.width = NEURON_CANVAS_SIZE
    canvas.height = NEURON_CANVAS_SIZE
    canvas.className = 'neuron-canvas absolute pointer-events-none border border-gray-300'
    canvas.style.left = `${x + 3}px`
    canvas.style.top = `${y + 3}px`
    
    containerRef.current.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 간단한 뉴런 출력 히트맵 생성 (2D 그리드)
    const imageData = ctx.createImageData(NEURON_CANVAS_SIZE, NEURON_CANVAS_SIZE)
    const data = imageData.data

    for (let i = 0; i < NEURON_CANVAS_SIZE; i++) {
      for (let j = 0; j < NEURON_CANVAS_SIZE; j++) {
        const x = (i / NEURON_CANVAS_SIZE) * 2 - 1 // -1 to 1
        const y = (j / NEURON_CANVAS_SIZE) * 2 - 1 // -1 to 1
        
        // Mock 뉴런 출력 계산 (실제로는 신경망 결과를 사용)
        let output = 0
        if (nodeId.includes('input')) {
          output = nodeId.includes('0') ? x : y
        } else if (nodeId.includes('hidden1')) {
          output = Math.tanh(x + y)
        } else if (nodeId.includes('hidden2')) {
          output = Math.tanh(x * y)
        } else {
          output = 1 / (1 + Math.exp(-(x + y)))
        }

        const pixelIndex = (j * NEURON_CANVAS_SIZE + i) * 4
        
        // 출력값에 따른 색상 (파란색-주황색)
        if (output > 0) {
          data[pixelIndex] = 255 * (1 - output)     // R
          data[pixelIndex + 1] = 165 * (1 - output) // G  
          data[pixelIndex + 2] = 0                  // B
        } else {
          data[pixelIndex] = 0                      // R
          data[pixelIndex + 1] = 100 * (1 + output) // G
          data[pixelIndex + 2] = 255 * (1 + output) // B
        }
        data[pixelIndex + 3] = 255 // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 모든 기존 캔버스 제거
    containerRef.current.querySelectorAll('.neuron-canvas').forEach(canvas => canvas.remove())

    // 색상 및 스케일 설정
    const colorScale = d3.scaleLinear<string>()
      .domain([-2, 0, 2])
      .range(['#f59e0b', '#ffffff', '#3b82f6']) // 주황색-흰색-파란색

    const strokeWidthScale = d3.scaleLinear()
      .domain([0, 2])
      .range([0.5, 6])

    // 레이어별 노드 위치 계산
    const layerSpacing = width / (layers.length + 1)
    const nodePositions: { x: number; y: number }[][] = []

    layers.forEach((layer, layerIdx) => {
      const layerNodes: { x: number; y: number }[] = []
      const x = layerSpacing * (layerIdx + 1)
      const nodeSpacing = height / (layer.nodes + 1)

      for (let nodeIdx = 0; nodeIdx < layer.nodes; nodeIdx++) {
        const y = nodeSpacing * (nodeIdx + 1)
        layerNodes.push({ x, y })
      }
      
      nodePositions.push(layerNodes)
    })

    // 곡선 연결선 그리기
    const linkGroup = svg.append('g').attr('class', 'links')
    
    connections.forEach(conn => {
      const sourcePos = nodePositions[conn.sourceLayer][conn.sourceNode]
      const targetPos = nodePositions[conn.targetLayer][conn.targetNode]
      
      // 베지어 곡선 경로 계산
      const midX = (sourcePos.x + targetPos.x) / 2
      const path = d3.path()
      path.moveTo(sourcePos.x + RECT_SIZE / 2, sourcePos.y)
      path.quadraticCurveTo(
        midX, sourcePos.y, // 제어점
        targetPos.x - RECT_SIZE / 2, targetPos.y
      )
      
      linkGroup.append('path')
        .attr('d', path.toString())
        .attr('stroke', colorScale(conn.weight))
        .attr('stroke-width', strokeWidthScale(Math.abs(conn.weight)))
        .attr('stroke-opacity', 0.6)
        .attr('fill', 'none')
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).attr('stroke-opacity', 1)
        })
        .on('mouseleave', function() {
          d3.select(this).attr('stroke-opacity', 0.6)
        })
    })

    // 노드 그리기
    const nodeGroup = svg.append('g').attr('class', 'nodes')
    
    layers.forEach((layer, layerIdx) => {
      layer.nodes && Array.from({ length: layer.nodes }).forEach((_, nodeIdx) => {
        const pos = nodePositions[layerIdx][nodeIdx]
        const nodeId = `${layer.id}-${nodeIdx}`
        
        const nodeEl = nodeGroup.append('g')
          .attr('class', 'node')
          .attr('id', `node-${nodeId}`)
        
        // 노드 사각형 (TensorFlow Playground 스타일)
        nodeEl.append('rect')
          .attr('x', pos.x - RECT_SIZE / 2)
          .attr('y', pos.y - RECT_SIZE / 2)
          .attr('width', RECT_SIZE)
          .attr('height', RECT_SIZE)
          .attr('fill', layer.type === 'input' ? '#ff7043' : 
                       layer.type === 'output' ? '#42a5f5' : '#ffa726')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 3)
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this).attr('stroke-width', 2)
            setSelectedNodeId(nodeId)
          })
          .on('mouseleave', function() {
            d3.select(this).attr('stroke-width', 1)
            setSelectedNodeId(null)
          })

        // 바이어스 (입력 레이어 제외)
        if (layer.type !== 'input') {
          nodeEl.append('rect')
            .attr('x', pos.x - RECT_SIZE / 2 - BIAS_SIZE - 2)
            .attr('y', pos.y + RECT_SIZE / 2 - BIAS_SIZE + 3)
            .attr('width', BIAS_SIZE)
            .attr('height', BIAS_SIZE)
            .attr('fill', '#666')
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
        }

        // 각 뉴런의 출력 시각화 (작은 캔버스)
        if (showNodeOutputs && (layer.type === 'input' || layer.type === 'hidden')) {
          setTimeout(() => {
            createNeuronCanvas(nodeId, pos.x - RECT_SIZE / 2, pos.y - RECT_SIZE / 2)
          }, 100)
        }

        // 입력 레이어 라벨
        if (layer.type === 'input') {
          nodeEl.append('text')
            .attr('x', pos.x - RECT_SIZE / 2 - 10)
            .attr('y', pos.y)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(nodeIdx === 0 ? 'X₁' : 'X₂')
        }
      })
    })

  }, [layers, connections, width, height, showNodeOutputs])

  return (
    <div className={`neural-network-viz relative ${className || ''}`} ref={containerRef}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-white"
      />
      
      {selectedNodeId && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          뉴런: {selectedNodeId}
        </div>
      )}
    </div>
  )
}
