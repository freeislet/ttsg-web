import React, { useState, useMemo } from 'react'
import { X, Download, Maximize2 } from 'lucide-react'
import { IDataset, DataViewMode } from '@/data'
import * as tf from '@tensorflow/tfjs'

/**
 * 데이터 뷰어 Props
 */
export interface DataViewerProps {
  dataset: IDataset
  viewMode: DataViewMode
  onClose: () => void
  onViewModeChange: (mode: DataViewMode) => void
}

/**
 * 테이블 뷰 컴포넌트
 */
const TableView: React.FC<{ dataset: IDataset }> = ({ dataset }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 50
  
  // 데이터를 JavaScript 배열로 변환
  const tableData = useMemo(() => {
    const inputs = dataset.inputs.arraySync() as number[][]
    const labels = dataset.labels.arraySync() as number[][]
    
    const totalSamples = Math.min(inputs.length, 500) // 최대 500개만 표시
    const data = []
    
    for (let i = 0; i < totalSamples; i++) {
      const row: Record<string, any> = { index: i }
      
      // 입력 데이터 추가
      dataset.inputColumns.forEach((col, idx) => {
        row[col] = Array.isArray(inputs[i]) ? inputs[i][idx] : inputs[i]
      })
      
      // 출력 데이터 추가
      dataset.outputColumns.forEach((col, idx) => {
        row[col] = Array.isArray(labels[i]) ? labels[i][idx] : labels[i]
      })
      
      data.push(row)
    }
    
    return data
  }, [dataset])
  
  const totalPages = Math.ceil(tableData.length / pageSize)
  const currentData = tableData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const allColumns = ['index', ...dataset.inputColumns, ...dataset.outputColumns]
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {allColumns.map(col => (
                <th key={col} className="px-2 py-1 text-left font-medium text-gray-700 border-b">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {allColumns.map(col => (
                  <td key={col} className="px-2 py-1 border-b text-gray-600">
                    {typeof row[col] === 'number' ? row[col].toFixed(4) : row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t bg-gray-50">
          <span className="text-xs text-gray-600">
            {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, tableData.length)} / {tableData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-2 py-1 text-xs bg-white border rounded disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 text-xs bg-white border rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 차트 뷰 컴포넌트 (간단한 히스토그램)
 */
const ChartView: React.FC<{ dataset: IDataset }> = ({ dataset }) => {
  // 첫 번째 입력 컬럼의 히스토그램 생성
  const histogramData = useMemo(() => {
    const inputs = dataset.inputs.arraySync() as number[][]
    const firstColumn = inputs.map(row => Array.isArray(row) ? row[0] : row)
    
    // 히스토그램 계산
    const min = Math.min(...firstColumn)
    const max = Math.max(...firstColumn)
    const bins = 20
    const binSize = (max - min) / bins
    const histogram = new Array(bins).fill(0)
    
    firstColumn.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1)
      histogram[binIndex]++
    })
    
    const maxCount = Math.max(...histogram)
    
    return histogram.map((count, idx) => ({
      bin: min + idx * binSize,
      count,
      height: (count / maxCount) * 100
    }))
  }, [dataset])
  
  return (
    <div className="h-full p-4">
      <h4 className="text-sm font-medium mb-4">
        {dataset.inputColumns[0]} 분포
      </h4>
      <div className="flex items-end justify-between h-48 bg-gray-50 p-4 rounded">
        {histogramData.map((bar, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div
              className="bg-blue-500 w-full max-w-[20px] rounded-t"
              style={{ height: `${bar.height}%` }}
              title={`${bar.bin.toFixed(2)}: ${bar.count}개`}
            />
            <span className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-left">
              {bar.bin.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 산점도 뷰 컴포넌트
 */
const ScatterView: React.FC<{ dataset: IDataset }> = ({ dataset }) => {
  // 첫 번째와 두 번째 입력 컬럼으로 산점도 생성
  const scatterData = useMemo(() => {
    const inputs = dataset.inputs.arraySync() as number[][]
    const labels = dataset.labels.arraySync() as number[][]
    
    const maxSamples = 200 // 성능을 위해 샘플 수 제한
    const step = Math.max(1, Math.floor(inputs.length / maxSamples))
    
    const points = []
    for (let i = 0; i < inputs.length; i += step) {
      const input = inputs[i]
      const label = labels[i]
      
      points.push({
        x: Array.isArray(input) ? input[0] : input,
        y: Array.isArray(input) && input.length > 1 ? input[1] : (Array.isArray(label) ? label[0] : label),
        class: Array.isArray(label) ? label.indexOf(Math.max(...label)) : Math.round(label)
      })
    }
    
    // 정규화
    const xValues = points.map(p => p.x)
    const yValues = points.map(p => p.y)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    
    return points.map(p => ({
      ...p,
      x: ((p.x - xMin) / (xMax - xMin)) * 280 + 10, // SVG 좌표로 변환
      y: 290 - ((p.y - yMin) / (yMax - yMin)) * 280 // Y축 뒤집기
    }))
  }, [dataset])
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
  
  return (
    <div className="h-full p-4">
      <h4 className="text-sm font-medium mb-4">
        {dataset.inputColumns[0]} vs {dataset.inputColumns[1] || dataset.outputColumns[0]}
      </h4>
      <svg width="300" height="300" className="border rounded bg-gray-50">
        {scatterData.map((point, idx) => (
          <circle
            key={idx}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={colors[point.class % colors.length]}
            opacity="0.7"
          />
        ))}
      </svg>
    </div>
  )
}

/**
 * 데이터 뷰어 컴포넌트
 */
const DataViewer: React.FC<DataViewerProps> = ({ 
  dataset, 
  viewMode, 
  onClose, 
  onViewModeChange 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const handleExport = () => {
    // CSV 내보내기 구현
    const inputs = dataset.inputs.arraySync() as number[][]
    const labels = dataset.labels.arraySync() as number[][]
    
    const headers = [...dataset.inputColumns, ...dataset.outputColumns]
    const rows = []
    
    for (let i = 0; i < Math.min(inputs.length, 1000); i++) {
      const row = []
      const input = inputs[i]
      const label = labels[i]
      
      // 입력 데이터
      if (Array.isArray(input)) {
        row.push(...input)
      } else {
        row.push(input)
      }
      
      // 출력 데이터
      if (Array.isArray(label)) {
        row.push(...label)
      } else {
        row.push(label)
      }
      
      rows.push(row.join(','))
    }
    
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'dataset.csv'
    a.click()
    
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      ${isFullscreen ? 'p-0' : 'p-4'}
    `}>
      <div className={`
        bg-white rounded-lg shadow-xl flex flex-col
        ${isFullscreen ? 'w-full h-full rounded-none' : 'w-4/5 h-4/5 max-w-4xl'}
      `}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">데이터 뷰어</h3>
            <div className="flex gap-1">
              {(['table', 'chart', 'scatter'] as DataViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`px-3 py-1 text-sm rounded ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode === 'table' ? '테이블' : mode === 'chart' ? '차트' : '산점도'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="CSV 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="전체화면"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'table' && <TableView dataset={dataset} />}
          {viewMode === 'chart' && <ChartView dataset={dataset} />}
          {viewMode === 'scatter' && <ScatterView dataset={dataset} />}
        </div>
      </div>
    </div>
  )
}

export default DataViewer
