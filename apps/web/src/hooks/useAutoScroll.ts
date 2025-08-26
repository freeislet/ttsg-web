import { useRef, useEffect } from 'react'

/**
 * 조건이 만족될 때 자동으로 스크롤하는 커스텀 훅
 *
 * @param condition - 스크롤을 트리거할 조건
 * @param options - 스크롤 옵션 (기본값: { behavior: 'smooth', block: 'start' })
 * @returns ref - 스크롤 대상 요소에 연결할 ref
 */
export function useAutoScroll<T extends HTMLElement>(
  condition: boolean,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (condition && ref.current) {
      ref.current.scrollIntoView(options)
    }
  }, [condition, options])

  return ref
}
