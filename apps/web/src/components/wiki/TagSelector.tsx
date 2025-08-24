import { forwardRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { AVAILABLE_TAGS } from '@/types/wiki-form'

interface TagSelectorProps {
  value?: string[]
  onChange?: (value: string[]) => void
  error?: string
  disabled?: boolean
}

/**
 * 태그 다중 선택 컴포넌트
 * 위키 문서에 적용할 태그들을 선택합니다.
 */
const TagSelector = forwardRef<HTMLDivElement, TagSelectorProps>(
  ({ value = [], onChange, error, disabled = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleToggleTag = (tag: string) => {
      if (disabled) return
      
      const newTags = value.includes(tag)
        ? value.filter(t => t !== tag)
        : [...value, tag]
      
      onChange?.(newTags)
    }

    const handleRemoveTag = (tagToRemove: string) => {
      if (disabled) return
      onChange?.(value.filter(tag => tag !== tagToRemove))
    }

    return (
      <div className="space-y-2" ref={ref} {...props}>
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Icon icon="mdi:tag-multiple" className="w-4 h-4 mr-2 text-gray-500" />
          태그 선택
        </label>
        
        {/* 선택된 태그들 표시 */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
            {value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* 태그 선택 드롭다운 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 border rounded-lg text-left transition-colors flex items-center justify-between
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
            `}
          >
            <span className="text-gray-500">
              {value.length > 0 ? `${value.length}개 태그 선택됨` : '태그를 선택하세요'}
            </span>
            <Icon 
              icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} 
              className="w-5 h-5 text-gray-400" 
            />
          </button>

          {/* 드롭다운 메뉴 */}
          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = value.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`
                        w-full px-3 py-2 text-left rounded-md transition-colors flex items-center justify-between
                        ${isSelected 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      <span>{tag}</span>
                      {isSelected && (
                        <Icon icon="mdi:check" className="w-4 h-4 text-purple-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="flex items-center text-sm text-red-600">
            <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}

        {/* 도움말 */}
        <div className="text-xs text-gray-500">
          <Icon icon="mdi:information-outline" className="w-3 h-3 inline mr-1" />
          위키 문서에 적용할 태그를 선택하세요. (최대 10개)
        </div>
      </div>
    )
  }
)

TagSelector.displayName = 'TagSelector'

export default TagSelector
