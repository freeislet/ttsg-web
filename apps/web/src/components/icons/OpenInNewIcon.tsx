interface OpenInNewIconProps {
  className?: string
}

/**
 * 외부 링크 아이콘 컴포넌트
 * 새 탭에서 열리는 링크를 나타내는 아이콘
 */
export function OpenInNewIcon({ className = 'w-4 h-4' }: OpenInNewIconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}
