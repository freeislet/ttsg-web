import React from 'react'

interface AppHeaderProps {
  /** 헤더에 표시할 타이틀 (예: 'AI CHAT') */
  title?: string
  /** 타이틀 링크 URL (기본값: '/') */
  titleUrl?: string
  /** 홈 링크 URL (기본값: 'https://ttsg.space') */
  homeUrl?: string
  /** 오른쪽에 표시할 추가 콘텐츠 (예: '연결됨' 상태) */
  children?: React.ReactNode
}

/**
 * TTSG 애플리케이션용 공통 헤더 컴포넌트
 *
 * @param title - 메인 TTSG 텍스트 옆에 표시할 타이틀
 * @param titleUrl - 타이틀 클릭 시 이동할 URL (기본값: '/')
 * @param homeUrl - 홈 링크 URL (기본값: 'https://ttsg.space')
 * @param children - 헤더 오른쪽에 표시할 추가 콘텐츠
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  titleUrl = '/',
  homeUrl = 'https://ttsg.space',
  children,
}) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="px-4 py-3">
          <h1 className="text-2xl font-medium m-0 flex items-center space-x-1">
            <a href={homeUrl} className="text-gray-800 no-underline">
              <span className="font-bold">TTSG</span>
            </a>
            {title && (
              <>
                <span className="text-gray-400">|</span>
                <a href={titleUrl} className="text-gray-700 no-underline">
                  <span>{title}</span>
                </a>
              </>
            )}
          </h1>
        </div>

        {children}
      </div>
    </header>
  )
}
