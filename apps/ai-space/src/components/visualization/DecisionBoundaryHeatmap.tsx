import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { dataRegistry } from '@/data'

/**
 * 2D 데이터 포인트 타입
 */
interface DataPoint {
  x: number
  y: number
  label: number
  color?: string
}

/**
 * TensorFlow Playground 완전 재현 출력 영역
 */
export const DecisionBoundaryHeatmap: React.FC<{
  datasetId?: string
  modelPredictFn?: (x: number, y: number) => number
  width?: number
  height?: number
  className?: string
  showTestData?: boolean
  discretize?: boolean
  loss?: number
  trainingLoss?: number
}> = ({ 
  datasetId = 'linear',
  modelPredictFn,
  width = 500, 
  height = 500,
  className,
  showTestData = true,
  discretize = false,
  loss = 0.523,
  trainingLoss = 0.514
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  
  // TensorFlow Playground 도메인 설정
  const xDomain: [number, number] = [-6, 6]
  const yDomain: [number, number] = [-6, 6]
  const DENSITY = 100 // 히트맵 해상도

  // TensorFlow Playground와 동일한 예측 함수
  const mockPredictFn = (x: number, y: number): number => {
    if (modelPredictFn) {
      return modelPredictFn(x, y)
    }
    // 나선형 패턴 (TensorFlow Playground의 Spiral 데이터와 유사)
    const r = Math.sqrt(x * x + y * y)
    const theta = Math.atan2(y, x)
    return Math.tanh(Math.sin(theta + r * 0.5) * 2)
  }

  // 나선형 데이터 생성 (TensorFlow Playground 스타일)
  useEffect(() => {
    const generateSpiralData = () => {
      const points: DataPoint[] = []
      const numPoints = 200
      
      for (let i = 0; i < numPoints; i++) {
        for (let label = 0; label < 2; label++) {
          const r = i / numPoints * 5
          const t = 1.75 * i / numPoints * 2 * Math.PI + label * Math.PI
          const x = r * Math.sin(t) + Math.random() * 0.3
          const y = r * Math.cos(t) + Math.random() * 0.3
          
          points.push({
            x: x * 0.8,
            y: y * 0.8,
            label,
            color: label === 0 ? '#ff7043' : '#42a5f5' // 주황색/파란색
          })
        }
      }
      setDataPoints(points)
    }

    generateSpiralData()
  }, [datasetId])

  // 히트맵 및 데이터 포인트 렌더링
  useEffect(() => {
    if (!canvasRef.current || !svgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    canvas.width = width
    canvas.height = height

    // 스케일 설정
    const xScale = d3.scaleLinear().domain(xDomain).range([0, width])
    const yScale = d3.scaleLinear().domain(yDomain).range([height, 0])
    
    // 히트맵 생성
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let pixelX = 0; pixelX < width; pixelX++) {
      for (let pixelY = 0; pixelY < height; pixelY++) {
        const x = xScale.invert(pixelX)
        const y = yScale.invert(pixelY)
        
        const prediction = mockPredictFn(x, y)
        
        // TensorFlow Playground 색상 (주황색-파란색)
        let r, g, b
        if (prediction > 0) {
          // 파란색 계열
          const intensity = Math.min(prediction, 1)
          r = Math.round(255 * (1 - intensity * 0.7))
          g = Math.round(255 * (1 - intensity * 0.3))  
          b = 255
        } else {
          // 주황색 계열
          const intensity = Math.min(-prediction, 1)
          r = 255
          g = Math.round(255 * (1 - intensity * 0.3))
          b = Math.round(255 * (1 - intensity * 0.7))
        }

        const pixelIndex = (pixelY * width + pixelX) * 4
        data[pixelIndex] = r
        data[pixelIndex + 1] = g  
        data[pixelIndex + 2] = b
        data[pixelIndex + 3] = 180 // 투명도
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // SVG 오버레이
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 격자 그리기
    const gridGroup = svg.append('g').attr('class', 'grid')
    
    // 세로 격자선
    for (let i = -6; i <= 6; i++) {
      gridGroup.append('line')
        .attr('x1', xScale(i))
        .attr('y1', 0)
        .attr('x2', xScale(i))
        .attr('y2', height)
        .attr('stroke', '#ddd')
        .attr('stroke-width', i === 0 ? 2 : 1)
        .attr('opacity', i === 0 ? 0.5 : 0.2)
    }
    
    // 가로 격자선
    for (let i = -6; i <= 6; i++) {
      gridGroup.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(i))
        .attr('x2', width)
        .attr('y2', yScale(i))
        .attr('stroke', '#ddd')
        .attr('stroke-width', i === 0 ? 2 : 1)
        .attr('opacity', i === 0 ? 0.5 : 0.2)
    }

    // 데이터 포인트 그리기
    if (showTestData && dataPoints.length > 0) {
      const pointsGroup = svg.append('g').attr('class', 'data-points')
      
      pointsGroup.selectAll('.data-point')
        .data(dataPoints)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', d => d.color || '#333')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this).attr('r', 6)
        })
        .on('mouseleave', function() {
          d3.select(this).attr('r', 4)
        })
    }

  }, [dataPoints, width, height, showTestData, discretize])

  return (
    <div className={`decision-boundary-heatmap bg-white ${className || ''}`}>
      {/* TensorFlow Playground 스타일 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">OUTPUT</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div>Test loss: <span className="font-mono">{loss.toFixed(3)}</span></div>
            <div>Training loss: <span className="font-mono">{trainingLoss.toFixed(3)}</span></div>
          </div>
        </div>
        
        {/* 컨트롤 체크박스들 */}
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showTestData}
              className="mr-2"
              readOnly
            />
            Show test data
          </label>
          <label className="flex items-center">
            <input
              type="checkbox" 
              checked={discretize}
              className="mr-2"
              readOnly
            />
            Discretize output
          </label>
        </div>
      </div>
      
      {/* 메인 시각화 영역 */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width, height }}
        />
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="relative z-10"
        />
      </div>
      
      {/* 하단 범례 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">
            Colors shows data, neuron and weight values
          </div>
          
          {/* 색상 그라데이션 바 */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm">-1</span>
            <div 
              className="w-32 h-4 rounded"
              style={{
                background: 'linear-gradient(to right, #ff7043, #ffffff, #42a5f5)'
              }}
            />
            <span className="text-sm">0</span>
            <div 
              className="w-32 h-4 rounded"
              style={{
                background: 'linear-gradient(to right, #ffffff, #42a5f5)'
              }}
            />
            <span className="text-sm">1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
