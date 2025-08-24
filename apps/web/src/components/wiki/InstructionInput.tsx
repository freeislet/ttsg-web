import { forwardRef } from 'react'
import { Icon } from '@iconify/react'

interface InstructionInputProps {
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
}

/**
 * 사용자 정의 지침 입력 컴포넌트
 * AI에게 전달할 추가 지침을 입력받습니다.
 */
const InstructionInput = forwardRef<HTMLTextAreaElement, InstructionInputProps>(
  ({ value = '', onChange, error, disabled = false, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Icon icon="mdi:text-box-outline" className="w-4 h-4 mr-2 text-gray-500" />
          사용자 정의 지침 (선택사항)
        </label>

        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="AI에게 전달할 추가 지침을 입력하세요. 예: '전문적인 톤으로 작성해주세요', '초보자도 이해할 수 있게 설명해주세요' 등"
            className={`
              w-full px-4 py-3 border rounded-lg resize-none transition-colors
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            `}
            rows={4}
            maxLength={500}
            {...props}
          />

          {/* 글자 수 표시 */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">{value.length}/500</div>
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
          AI가 문서를 생성할 때 참고할 추가 지침을 입력할 수 있습니다.
        </div>
      </div>
    )
  }
)

InstructionInput.displayName = 'InstructionInput'

export default InstructionInput
