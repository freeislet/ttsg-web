import React from 'react';

interface AppHeaderProps {
  /** 헤더에 표시할 타이틀 (예: 'AI CHAT') */
  title?: string;
  /** 오른쪽에 표시할 추가 콘텐츠 (예: '연결됨' 상태) */
  children?: React.ReactNode;
  /** 홈 링크 URL (기본값: '/') */
  homeUrl?: string;
}

/**
 * TTSG 애플리케이션용 공통 헤더 컴포넌트
 * 
 * @param title - 메인 TTSG 텍스트 옆에 표시할 타이틀
 * @param children - 헤더 오른쪽에 표시할 추가 콘텐츠
 * @param homeUrl - TTSG 로고 클릭 시 이동할 URL
 */
export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  children, 
  homeUrl = '/' 
}) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="py-1">
          <a href={homeUrl} className="text-gray-800 no-underline">
            <h1 className="text-2xl font-bold m-0 flex items-center gap-2">
              <span>TTSG</span>
              {title && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-blue-600">{title}</span>
                </>
              )}
            </h1>
          </a>
        </div>

        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};
