import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { dataRegistry } from '@/data'

/**
 * 2D 데이터 포인트 타입
 */
interface DataPoint {
  x: number
  y: number
  label: number | string
  color?: string
}

/**
 * 히트맵 설정 타입
 */
interface HeatmapSettings {
  resolution: number  // 해상도 (격자 밀도)
  xDomain: [number, number]
  yDomain: [number, number]
  showDataPoints: boolean
  showAxes: boolean
}

/**
 * TensorFlow Playground 스타일의 결정 경계 히트맵 컴포넌트
 */
export const DecisionBoundaryHeatmap: React.FC<{
  datasetId?: string
  modelPredictFn?: (x: number, y: number) => number
  width?: number
  height?: number
  className?: string
  settings?: Partial<HeatmapSettings>
}> = ({ 
  datasetId = 'linear',
  modelPredictFn,
  width = 400, 
  height = 400,
  className,
  settings = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  
  // 기본 설정
  const defaultSettings: HeatmapSettings = {
    resolution: 50,
    xDomain: [-1, 1],
    yDomain: [-1, 1],
    showDataPoints: true,
    showAxes: true,
    ...settings
  }

  // Mock 예측 함수 (실제로는 TensorFlow.js 모델에서 가져올 예정)
  const mockPredictFn = (x: number, y: number): number => {
    if (modelPredictFn) {
      return modelPredictFn(x, y)
    }
    // 간단한 원형 결정 경계 예제
    const distance = Math.sqrt(x * x + y * y)
    return Math.tanh(distance * 2 - 0.5)
  }

  // 데이터 포인트 생성 (데이터셋에 따라)
  useEffect(() => {
    const generateDataPoints = async () => {
      try {
        const dataset = dataRegistry.getById(datasetId)
        if (dataset?.loader) {
          const data = await dataset.loader()
          
          // 2D 데이터만 처리 (첫 2개 특성 사용)
          const points: DataPoint[] = []
          
          if (data.inputs && data.labels) {
            const inputsArray = await data.inputs.array() as number[][]
            const labelsArray = await data.labels.array() as number[] | number[][]
            
            for (let i = 0; i < Math.min(inputsArray.length, 200); i++) {
              const features = inputsArray[i]
              const label = Array.isArray(labelsArray[i]) ? (labelsArray[i] as number[])[0] : labelsArray[i] as number
              
              if (features && features.length >= 2) {
                points.push({
                  x: features[0],
                  y: features[1], 
                  label: label,
                  color: label > 0.5 ? '#ff6b6b' : '#4ecdc4'
                })
              }
            }
          }
          
          setDataPoints(points)
        }
      } catch (error) {
        console.error('Error loading dataset for heatmap:', error)
        // Mock 데이터로 폴백
        generateMockData()
      }
    }

    const generateMockData = () => {
      const points: DataPoint[] = []
      for (let i = 0; i < 100; i++) {
        const x = (Math.random() - 0.5) * 2
        const y = (Math.random() - 0.5) * 2
        const distance = Math.sqrt(x * x + y * y)
        const label = distance > 0.6 ? 1 : 0
        
        points.push({
          x,
          y,
          label,
          color: label ? '#ff6b6b' : '#4ecdc4'
        })
      }
      setDataPoints(points)
    }

    if (datasetId) {
      generateDataPoints()
    } else {
      generateMockData()
    }
  }, [datasetId])

  // 히트맵 그리기
  useEffect(() => {
    if (!canvasRef.current || !svgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    canvas.width = width
    canvas.height = height

    // 히트맵 데이터 생성
    const { xDomain, yDomain } = defaultSettings
    const xScale = d3.scaleLinear().domain(xDomain).range([0, width])
    const yScale = d3.scaleLinear().domain(yDomain).range([height, 0])
    
    // 색상 스케일 (결정 경계용)
    const colorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['#ff6b6b', '#ffffff', '#4ecdc4'])

    // ImageData 생성
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let pixelX = 0; pixelX < width; pixelX++) {
      for (let pixelY = 0; pixelY < height; pixelY++) {
        // 픽셀 좌표를 데이터 좌표로 변환
        const x = xScale.invert(pixelX)
        const y = yScale.invert(pixelY)
        
        // 모델 예측값 구하기
        const prediction = mockPredictFn(x, y)
        
        // 색상 계산
        const color = d3.color(colorScale(prediction))
        if (color) {
          const pixelIndex = (pixelY * width + pixelX) * 4
          data[pixelIndex] = color.rgb().r     // Red
          data[pixelIndex + 1] = color.rgb().g // Green  
          data[pixelIndex + 2] = color.rgb().b // Blue
          data[pixelIndex + 3] = 180          // Alpha (투명도)
        }
      }
    }

    // Canvas에 히트맵 그리기
    ctx.putImageData(imageData, 0, 0)

    // SVG 오버레이로 데이터 포인트와 축 그리기
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // 축 그리기 (옵션)
    if (defaultSettings.showAxes) {
      const axisGroup = svg.append('g').attr('class', 'axes')
      
      // X축
      axisGroup.append('line')
        .attr('x1', 0)
        .attr('y1', yScale(0))
        .attr('x2', width)
        .attr('y2', yScale(0))
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3)
      
      // Y축  
      axisGroup.append('line')
        .attr('x1', xScale(0))
        .attr('y1', 0)
        .attr('x2', xScale(0))
        .attr('y2', height)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3)
    }

    // 데이터 포인트 그리기
    if (defaultSettings.showDataPoints && dataPoints.length > 0) {
      const pointsGroup = svg.append('g').attr('class', 'data-points')
      
      pointsGroup.selectAll('.data-point')
        .data(dataPoints)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 3)
        .attr('fill', d => d.color || '#333')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function(_, d) {
          d3.select(this).attr('r', 5)
          // 툴팁 표시 (간단한 예제)
          console.log(`Point: (${d.x.toFixed(2)}, ${d.y.toFixed(2)}), Label: ${d.label}`)
        })
        .on('mouseleave', function() {
          d3.select(this).attr('r', 3)
        })
    }

  }, [dataPoints, width, height, defaultSettings, modelPredictFn])

  return (
    <div className={`decision-boundary-heatmap ${className || ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">결정 경계</h3>
        <p className="text-sm text-gray-600">
          색상이 진할수록 해당 클래스에 대한 모델의 확신이 높습니다.
          <span className="text-red-500 mx-1">빨간색</span>은 클래스 0,
          <span className="text-teal-500 mx-1">청록색</span>은 클래스 1을 나타냅니다.
        </p>
      </div>
      
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-lg"
          style={{ width, height }}
        />
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="relative z-10 border border-gray-200 rounded-lg"
        />
      </div>
      
      {/* 컨트롤 패널 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>데이터 포인트 표시:</span>
          <input
            type="checkbox"
            checked={defaultSettings.showDataPoints}
            onChange={(e) => {
              // TODO: 설정 업데이트 로직
              console.log('Show data points:', e.target.checked)
            }}
            className="rounded"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>축 표시:</span>
          <input
            type="checkbox"
            checked={defaultSettings.showAxes}
            onChange={(e) => {
              // TODO: 설정 업데이트 로직  
              console.log('Show axes:', e.target.checked)
            }}
            className="rounded"
          />
        </div>
      </div>
      
      {/* 범례 */}
      <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 mr-2 rounded"></div>
          <span>클래스 0 (음수)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 mr-2 rounded"></div>
          <span>중립</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-teal-400 mr-2 rounded"></div>
          <span>클래스 1 (양수)</span>
        </div>
      </div>
    </div>
  )
}
