import { forwardRef, type ReactNode } from 'react'
import { Icon } from '@iconify/react'
import { useClickOutside } from '@/hooks/useClickOutside'

interface DropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  disabled?: boolean
  error?: string
  placeholder?: string
  selectedCount?: number
  children: ReactNode
  className?: string
  renderTrigger?: (params: {
    isOpen: boolean
    selectedCount: number
    placeholder: string
  }) => ReactNode
}

/**
 * 재사용 가능한 드롭다운 컴포넌트
 * 태그 선택, 옵션 선택 등에 사용할 수 있습니다.
 */
const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      isOpen,
      onToggle,
      onClose,
      disabled = false,
      error,
      placeholder = '선택하세요',
      selectedCount = 0,
      children,
      className = '',
      renderTrigger,
      ...props
    },
    _ref
  ) => {
    const dropdownRef = useClickOutside<HTMLDivElement>(onClose, isOpen)

    const getDisplayText = () => {
      if (selectedCount > 0) {
        return `${selectedCount}개 선택됨`
      }
      return placeholder
    }

    return (
      <div className={`relative ${className}`} ref={dropdownRef} {...props}>
        {renderTrigger ? (
          <div onClick={onToggle} className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
            {renderTrigger({ isOpen, selectedCount, placeholder })}
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`
              w-full px-4 py-3 border rounded-lg text-left transition-colors flex items-center justify-between
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
            `}
          >
            <span className="text-gray-500">{getDisplayText()}</span>
            <Icon
              icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              className="w-5 h-5 text-gray-400"
            />
          </button>
        )}

        {/* 드롭다운 메뉴 */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">{children}</div>
          </div>
        )}
      </div>
    )
  }
)

Dropdown.displayName = 'Dropdown'

export default Dropdown
