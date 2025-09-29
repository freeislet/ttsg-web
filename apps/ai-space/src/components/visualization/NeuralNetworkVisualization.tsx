import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { useModelStore } from '@/stores/modelStore'

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
}

/**
 * TensorFlow Playground 스타일의 신경망 시각화 컴포넌트
 */
export const NeuralNetworkVisualization: React.FC<{
  modelId?: string
  width?: number
  height?: number
  className?: string
}> = ({ 
  modelId, 
  width = 800, 
  height = 400, 
  className 
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredConnection, setHoveredConnection] = useState<ConnectionInfo | null>(null)
  const modelStore = useModelStore()

  // Mock 데이터 - 실제로는 modelStore에서 가져올 예정
  const [layers] = useState<LayerInfo[]>([
    { id: 'input', nodes: 2, type: 'input' },
    { id: 'hidden1', nodes: 4, type: 'hidden', activation: 'tanh' },
    { id: 'hidden2', nodes: 3, type: 'hidden', activation: 'tanh' },
    { id: 'output', nodes: 1, type: 'output', activation: 'sigmoid' }
  ])

  // Mock 가중치 데이터 - 실제로는 TensorFlow.js 모델에서 가져올 예정
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
            weight: (Math.random() - 0.5) * 4 // -2 ~ 2 범위의 가중치
          })
        }
      }
    }
    
    return connections
  }

  const [connections] = useState<ConnectionInfo[]>(generateMockWeights())

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // 기존 내용 제거

    // 색상 스케일 정의 (가중치에 따른 색상)
    const colorScale = d3.scaleLinear<string>()
      .domain([-2, 0, 2])
      .range(['#ff6b6b', '#ffffff', '#4ecdc4'])

    // 선 굵기 스케일 (가중치 절댓값에 따른 굵기)
    const strokeWidthScale = d3.scaleLinear()
      .domain([0, 2])
      .range([0.5, 4])

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

    // 연결선 그리기
    const linkGroup = svg.append('g').attr('class', 'links')
    
    connections.forEach(conn => {
      const sourcePos = nodePositions[conn.sourceLayer][conn.sourceNode]
      const targetPos = nodePositions[conn.targetLayer][conn.targetNode]
      
      linkGroup.append('line')
        .attr('x1', sourcePos.x + 15) // 노드 반지름만큼 오프셋
        .attr('y1', sourcePos.y)
        .attr('x2', targetPos.x - 15)
        .attr('y2', targetPos.y)
        .attr('stroke', colorScale(conn.weight))
        .attr('stroke-width', strokeWidthScale(Math.abs(conn.weight)))
        .attr('stroke-opacity', 0.7)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).attr('stroke-opacity', 1)
          setHoveredConnection(conn)
        })
        .on('mouseleave', function() {
          d3.select(this).attr('stroke-opacity', 0.7)
          setHoveredConnection(null)
        })
    })

    // 노드 그리기
    const nodeGroup = svg.append('g').attr('class', 'nodes')
    
    layers.forEach((layer, layerIdx) => {
      const layerGroup = nodeGroup.append('g').attr('class', `layer-${layerIdx}`)
      
      layer.nodes && Array.from({ length: layer.nodes }).forEach((_, nodeIdx) => {
        const pos = nodePositions[layerIdx][nodeIdx]
        const nodeColor = layer.type === 'input' ? '#ffd93d' : 
                         layer.type === 'output' ? '#ff6b6b' : '#4ecdc4'
        
        // 노드 원 그리기
        layerGroup.append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('r', 15)
          .attr('fill', nodeColor)
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this).attr('r', 18)
          })
          .on('mouseleave', function() {
            d3.select(this).attr('r', 15)
          })
        
        // 바이어스 표시 (입력 레이어 제외)
        if (layer.type !== 'input') {
          layerGroup.append('rect')
            .attr('x', pos.x - 20)
            .attr('y', pos.y + 12)
            .attr('width', 8)
            .attr('height', 8)
            .attr('fill', '#666')
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
        }
      })
      
      // 레이어 라벨 추가
      const firstNodePos = nodePositions[layerIdx][0]
      const lastNodePos = nodePositions[layerIdx][layer.nodes - 1]
      const labelY = firstNodePos.y - 30
      
      layerGroup.append('text')
        .attr('x', firstNodePos.x)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(layer.type === 'input' ? 'Input' :
              layer.type === 'output' ? 'Output' :
              `Hidden ${layerIdx}`)
      
      // 활성화 함수 표시 (히든/아웃풋 레이어)
      if (layer.activation) {
        layerGroup.append('text')
          .attr('x', firstNodePos.x)
          .attr('y', lastNodePos.y + 40)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(layer.activation)
      }
    })

  }, [layers, connections, width, height])

  return (
    <div className={`neural-network-viz ${className || ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">신경망 구조</h3>
        <p className="text-sm text-gray-600">
          노드와 연결선의 색상은 가중치를 나타냅니다. 
          <span className="text-red-500 mx-1">빨간색</span>은 음수, 
          <span className="text-teal-500 mx-1">청록색</span>은 양수 가중치입니다.
        </p>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white"
      />
      
      {/* 호버된 연결 정보 표시 */}
      {hoveredConnection && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          <strong>연결 정보:</strong> 
          레이어 {hoveredConnection.sourceLayer} → 레이어 {hoveredConnection.targetLayer}, 
          가중치: {hoveredConnection.weight.toFixed(3)}
        </div>
      )}
      
      {/* 범례 */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2"></div>
          <span>입력 레이어</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-teal-400 mr-2"></div>
          <span>히든 레이어</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-400 mr-2"></div>
          <span>출력 레이어</span>
        </div>
      </div>
    </div>
  )
}
