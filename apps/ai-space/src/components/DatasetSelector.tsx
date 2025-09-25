import React from 'react'
import Select, { GroupBase, OptionsOrGroups } from 'react-select'
import { DataPreset } from '@/data/types'
import { getDataPresets, getPresetsByCategory } from '@/data'

/**
 * 데이터셋 선택 옵션 타입
 */
interface DatasetOption {
  value: string
  label: string
  preset: DataPreset
}

/**
 * 데이터셋 그룹 타입
 */
interface DatasetGroup extends GroupBase<DatasetOption> {
  label: string
  options: DatasetOption[]
}

/**
 * 데이터셋 선택기 컴포넌트 Props
 */
interface DatasetSelectorProps {
  value?: string
  onChange: (presetId: string | null) => void
  placeholder?: string
  isDisabled?: boolean
  className?: string
}

/**
 * 카테고리 이름 매핑
 */
const CATEGORY_LABELS: Record<string, string> = {
  sample: '📊 샘플 데이터',
  computed: '🧮 계산된 데이터'
}


/**
 * 커스텀 옵션 컴포넌트
 */
const CustomOption: React.FC<any> = ({ data, ...props }) => {
  const { preset } = data
  
  return (
    <div {...props.innerProps} className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${props.isFocused ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-gray-900">{preset.name}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {preset.estimatedSize}
            </span>
          </div>
          <div className="text-xs text-gray-600 truncate">{preset.description}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * 커스텀 그룹 헤더 컴포넌트
 */
const CustomGroupHeading: React.FC<any> = ({ children, ...props }) => (
  <div {...props.innerProps} className="px-3 py-1.5 bg-gray-100 font-semibold text-gray-700 text-xs border-b">
    {children}
  </div>
)

/**
 * 데이터셋 선택기 컴포넌트
 */
const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  value,
  onChange,
  placeholder = "데이터셋을 선택하세요",
  isDisabled = false,
  className = ""
}) => {
  // 데이터셋을 카테고리별로 그룹화
  const createOptions = (): OptionsOrGroups<DatasetOption, DatasetGroup> => {
    const categorizedPresets = getPresetsByCategory()
    
    return Object.entries(categorizedPresets).map(([category, presets]) => ({
      label: CATEGORY_LABELS[category] || category,
      options: presets.map((preset) => ({
        value: preset.id,
        label: preset.name,
        preset
      }))
    }))
  }

  // 선택된 값 찾기
  const findSelectedOption = (presetId: string | undefined): DatasetOption | null => {
    if (!presetId) return null
    
    const allPresets = getDataPresets()
    const preset = allPresets.find(p => p.id === presetId)
    
    if (!preset) return null
    
    return {
      value: preset.id,
      label: preset.name,
      preset
    }
  }

  const selectedOption = findSelectedOption(value)

  return (
    <div className={`${className} nodrag`} onMouseDown={(e) => e.stopPropagation()}>
      <Select<DatasetOption, false, DatasetGroup>
        value={selectedOption}
        onChange={(option) => onChange(option?.value || null)}
        options={createOptions()}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable
        isSearchable
        menuPortalTarget={document.body}
        menuPlacement="auto"
        menuPosition="fixed"
        components={{
          Option: CustomOption,
          GroupHeading: CustomGroupHeading
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #f59e0b' : 'none',
            '&:hover': {
              borderColor: '#f59e0b'
            }
          }),
          menu: (base) => ({
            ...base,
            minWidth: '280px',
            right: 0,
            left: 'auto',
            zIndex: 99999
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 99999
          }),
          menuList: (base) => ({
            ...base,
            padding: 0
          }),
          option: () => ({
            // 커스텀 옵션 컴포넌트에서 스타일 처리
          }),
          groupHeading: () => ({
            // 커스텀 그룹 헤더에서 스타일 처리
          })
        }}
        className="text-sm"
        classNamePrefix="dataset-select"
      />
    </div>
  )
}

export default DatasetSelector
