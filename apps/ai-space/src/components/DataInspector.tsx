import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Table, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Grid3X3,
  Info,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react'
import { IDataset } from '@/data'

/**
 * 데이터 시각화 모드
 */
export type DataVisualizationMode = 'table' | 'bar' | 'scatter' | 'line' | 'pie' | 'stats'

/**
 * 데이터 인스펙터 Props
 */
interface DataInspectorProps {
  dataset: IDataset | null
  mode?: DataVisualizationMode
  className?: string
  showModeSelector?: boolean
  maxRows?: number
}

/**
 * 색상 팔레트
 */
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

/**
 * 데이터 인스펙터 컴포넌트
 * 데이터를 테이블, 차트 등 다양한 형태로 시각화
 */
const DataInspector: React.FC<DataInspectorProps> = ({
  dataset,
  mode = 'table',
  className = '',
  showModeSelector = true,
  maxRows = 100
}) => {
  const [currentMode, setCurrentMode] = useState<DataVisualizationMode>(mode)
  const [currentPage, setCurrentPage] = useState(0)
  const rowsPerPage = 10

  // 데이터 전처리 - 간단한 버전
  const processedData = useMemo(() => {
    if (!dataset) return { rows: [], columns: [], stats: {} }

    // 텐서 데이터를 배열로 변환 (샘플 데이터)
    const sampleSize = Math.min(maxRows, dataset.sampleCount)
    const rows: any[] = []
    
    // 입력 컬럼들
    const inputColumns = dataset.inputColumns || ['input']
    const outputColumns = dataset.outputColumns || ['output']
    const columns = [...inputColumns, ...outputColumns]
    
    // 샘플 데이터 생성 (실제로는 텐서에서 추출해야 함)
    for (let i = 0; i < sampleSize; i++) {
      const row: any = {}
      inputColumns.forEach((col, idx) => {
        row[col] = Math.random() * 100 // 임시 데이터
      })
      outputColumns.forEach((col, idx) => {
        row[col] = Math.random() * 10 // 임시 데이터
      })
      rows.push(row)
    }
    
    // 통계 계산
    const stats: Record<string, any> = {}
    columns.forEach(col => {
      const values = rows.map((row: any) => row[col]).filter((val: any) => typeof val === 'number')
      if (values.length > 0) {
        const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length
        stats[col] = {
          count: values.length,
          mean,
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.sqrt(values.reduce((acc: number, val: number) => acc + Math.pow(val - mean, 2), 0) / values.length)
        }
      }
    })

    return { rows, columns, stats }
  }, [dataset, maxRows])

  // 페이지네이션
  const paginatedRows = useMemo(() => {
    const startIndex = currentPage * rowsPerPage
    return processedData.rows.slice(startIndex, startIndex + rowsPerPage)
  }, [processedData.rows, currentPage, rowsPerPage])

  const totalPages = Math.ceil(processedData.rows.length / rowsPerPage)

  // 모드 선택 옵션
  const modeOptions = [
    { key: 'table', label: '테이블', icon: Table },
    { key: 'bar', label: '막대 차트', icon: BarChart3 },
    { key: 'scatter', label: '산점도', icon: Zap },
    { key: 'line', label: '선 그래프', icon: TrendingUp },
    { key: 'pie', label: '원형 차트', icon: PieChartIcon },
    { key: 'stats', label: '통계', icon: Info },
  ] as const

  if (!dataset) {
    return (
      <div className={`flex items-center justify-center p-8 text-gray-500 ${className}`}>
        <div className="text-center">
          <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const renderVisualization = () => {
    const { rows, columns } = processedData

    switch (currentMode) {
      case 'table':
        return (
          <div className="space-y-4">
            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2 text-sm text-gray-900 border-b">
                          {typeof row[col] === 'number' ? row[col].toFixed(3) : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {currentPage * rowsPerPage + 1}-{Math.min((currentPage + 1) * rowsPerPage, rows.length)} / {rows.length}개 행
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case 'bar':
        const numericColumns = columns.filter(col => 
          rows.every(row => typeof row[col] === 'number')
        )
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={columns[0]} />
                <YAxis />
                <Tooltip />
                {numericColumns.slice(0, 3).map((col, index) => (
                  <Bar key={col} dataKey={col} fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )

      case 'scatter':
        if (columns.length < 2) return <div className="p-4 text-gray-500">산점도를 위해서는 최소 2개의 컬럼이 필요합니다</div>
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={rows.slice(0, 50)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={columns[0]} />
                <YAxis dataKey={columns[1]} />
                <Tooltip />
                <Scatter dataKey={columns[1]} fill={COLORS[0]} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )

      case 'line':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows.slice(0, 50)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={columns[0]} />
                <YAxis />
                <Tooltip />
                {columns.slice(1, 4).map((col, index) => (
                  <Line key={col} type="monotone" dataKey={col} stroke={COLORS[index % COLORS.length]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case 'pie':
        const pieData = columns.slice(1, 6).map((col, index) => ({
          name: col,
          value: rows.reduce((sum, row) => sum + (typeof row[col] === 'number' ? row[col] : 0), 0),
          fill: COLORS[index % COLORS.length]
        }))
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )

      case 'stats':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(processedData.stats).map(([col, stats]) => (
                <div key={col} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{col}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">개수:</span>
                      <span>{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균:</span>
                      <span>{stats.mean.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">최솟값:</span>
                      <span>{stats.min.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">최댓값:</span>
                      <span>{stats.max.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">표준편차:</span>
                      <span>{stats.std.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div className="p-4 text-gray-500">지원하지 않는 시각화 모드입니다</div>
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">데이터셋</h3>
            <p className="text-sm text-gray-600">
              {processedData.rows.length}개 행 × {processedData.columns.length}개 열
            </p>
          </div>
          
          {/* 모드 선택 */}
          {showModeSelector && (
            <div className="flex items-center gap-1">
              {modeOptions.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentMode(key as DataVisualizationMode)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${currentMode === key 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                    }
                  `}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4">
        {renderVisualization()}
      </div>
    </div>
  )
}

export default DataInspector
