import { forwardRef } from 'react'
import { Icon } from '@iconify/react'
import { LANGUAGE_OPTIONS } from '@/types/wiki-form'

interface LanguageSelectorProps {
  value?: 'ko' | 'en'
  onChange?: (value: 'ko' | 'en') => void
  error?: string
  disabled?: boolean
}

/**
 * 언어 선택 컴포넌트
 * 위키 문서 생성 언어를 선택합니다.
 */
const LanguageSelector = forwardRef<HTMLSelectElement, LanguageSelectorProps>(
  ({ value = 'ko', onChange, error, disabled = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value as 'ko' | 'en')
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Icon icon="mdi:translate" className="w-4 h-4 mr-2 text-gray-500" />
          생성 언어
        </label>

        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors appearance-none bg-white
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer'}
            `}
            {...props}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 드롭다운 아이콘 */}
          <Icon
            icon="mdi:chevron-down"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          />
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
          AI가 생성할 위키 문서의 언어를 선택하세요.
        </div>
      </div>
    )
  }
)

LanguageSelector.displayName = 'LanguageSelector'

export default LanguageSelector
