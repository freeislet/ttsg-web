import { Icon } from '@iconify/react'

interface TagBadgeProps {
  tag: string
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

/**
 * 선택된 태그를 표시하는 배지 컴포넌트
 * 제거 버튼이 포함되어 있습니다.
 */
const TagBadge = ({ tag, onRemove, disabled = false, className = '' }: TagBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full ${className}`}
    >
      {tag}
      {!disabled && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
        >
          <Icon icon="mdi:close" className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

export default TagBadge
