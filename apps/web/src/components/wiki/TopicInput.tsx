import { Icon } from '@iconify/react'

interface TopicInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

/**
 * 위키 생성 주제 입력 컴포넌트
 * 사용자가 위키로 생성하고 싶은 주제를 입력할 수 있습니다.
 */
export default function TopicInput({ value, onChange, error, disabled = false }: TopicInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
        <Icon icon="mdi:lightbulb-outline" className="w-4 h-4 inline mr-1" />
        생성할 주제
      </label>
      <input
        id="topic"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="예: 인공지능의 역사, 블록체인 기술, 머신러닝 알고리즘..."
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      <div className="text-xs text-gray-500">
        <Icon icon="mdi:information-outline" className="w-3 h-3 inline mr-1" />
        구체적이고 명확한 주제를 입력하면 더 좋은 결과를 얻을 수 있습니다.
      </div>
    </div>
  )
}
