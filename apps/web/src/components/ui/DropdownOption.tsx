import { Icon } from '@iconify/react'

interface DropdownOptionProps {
  value: string
  isSelected: boolean
  onClick: () => void
  className?: string
}

/**
 * 드롭다운 옵션 컴포넌트
 * 선택 상태를 시각적으로 표시합니다.
 */
const DropdownOption = ({ value, isSelected, onClick, className = '' }: DropdownOptionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-3 py-2 text-left rounded-md transition-colors flex items-center justify-between
        ${isSelected ? 'bg-purple-100 text-purple-800' : 'hover:bg-gray-100 text-gray-700'}
        ${className}
      `}
    >
      <span>{value}</span>
      {isSelected && <Icon icon="mdi:check" className="w-4 h-4 text-purple-600" />}
    </button>
  )
}

export default DropdownOption
