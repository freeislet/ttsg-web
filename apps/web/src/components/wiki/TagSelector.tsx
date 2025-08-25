import { forwardRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { AVAILABLE_TAGS } from '@/types/wiki-form'
import Dropdown from '@/components/ui/Dropdown'
import DropdownOption from '@/components/ui/DropdownOption'
import TagBadge from '@/components/ui/TagBadge'

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

      const newTags = value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]

      onChange?.(newTags)
    }

    const handleRemoveTag = (tagToRemove: string) => {
      if (disabled) return
      onChange?.(value.filter((tag) => tag !== tagToRemove))
    }

    return (
      <div className="space-y-2" ref={ref} {...props}>
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Icon icon="mdi:tag-multiple" className="w-4 h-4 mr-2 text-gray-500" />
          태그 (선택사항)
        </label>

        {/* 태그 선택 드롭다운 */}
        <Dropdown
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
          onClose={() => setIsOpen(false)}
          disabled={disabled}
          error={error}
          placeholder="태그를 선택하세요"
          selectedCount={value.length}
          renderTrigger={({ isOpen }) => (
            <div
              className={`
                w-full px-4 py-3 border rounded-lg text-left transition-colors flex items-center justify-between
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
                ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
              `}
            >
              {/* 선택된 태그들 표시 */}
              {value.length > 0 ? (
                <div className="flex flex-wrap gap-2 flex-1 mr-3">
                  {value.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      onRemove={() => handleRemoveTag(tag)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 flex-1">태그를 선택하세요</span>
              )}

              {/* 드롭다운 아이콘 */}
              <Icon
                icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className="w-5 h-5 text-gray-400 flex-shrink-0"
              />
            </div>
          )}
        >
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = value.includes(tag)
            return (
              <DropdownOption
                key={tag}
                value={tag}
                isSelected={isSelected}
                onClick={() => handleToggleTag(tag)}
              />
            )
          })}
        </Dropdown>

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
          위키 문서에 적용할 태그를 선택하세요. ({value.length} / 10개)
        </div>
      </div>
    )
  }
)

TagSelector.displayName = 'TagSelector'

export default TagSelector
