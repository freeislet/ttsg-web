import React from 'react'
import type { NotionPage } from '@/client/wiki'
import { getLanguageChipColor } from '@/types/wiki'

/**
 * 위키 페이지의 버전/언어 선택 UI 컴포넌트
 * 프리뷰 팝업에서 사용하는 칩(Chip) 스타일과 동일한 UX를 제공합니다.
 */
export interface VersionLanguageSelectorProps {
  /** 표시할 노션 페이지 목록 (버전/언어 조합 단위) */
  pages: NotionPage[]
  /** 선택된 페이지 id (프리뷰 모드에서 강조 표시용) */
  selectedPageId?: string
  /** 프리뷰 모드에서 페이지 선택 콜백 (제공되지 않으면 링크로 내비게이션) */
  onPageSelect?: (page: NotionPage) => void
}

/**
 * 칩(Chip) 공통 클래스
 */
function chipClass(selected: boolean) {
  return [
    'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors',
    selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  ].join(' ')
}

/**
 * 위키 버전/언어 선택기
 */
export default function VersionLanguageSelector({
  pages,
  selectedPageId,
  onPageSelect,
}: VersionLanguageSelectorProps) {
  return (
    <div className="no-md-content mt-3 space-y-2">
      <div className="flex flex-wrap gap-1">
        {pages.map((page) => {
          const chip = (
            <>
              <span>{page.version || 'Unknown'}</span>
              {page.language && (
                <span
                  className={`px-1 py-0 rounded text-xs font-medium border ${getLanguageChipColor(page.language as any)}`}
                >
                  {page.language}
                </span>
              )}
            </>
          )
          const key = `${page.id}-${page.language}-${page.version}`
          const href = `/wiki/${page.title}?version=${page.version ? encodeURIComponent(page.version) : ''}&language=${page.language}`
          const className = chipClass(page.id === selectedPageId)

          // 프리뷰 모드: 콜백이 있는 경우 버튼
          if (onPageSelect) {
            return (
              <button key={key} onClick={() => onPageSelect(page)} className={className}>
                {chip}
              </button>
            )
          }

          return (
            <a key={key} href={href} className={className}>
              {chip}
            </a>
          )
        })}
      </div>
    </div>
  )
}
