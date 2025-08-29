import { useRef, useEffect } from 'react'

// 헤더 높이 (px) - 헤더 컴포넌트의 실제 높이에 맞춰 조정
const HEADER_HEIGHT = 64 // py-2 (8px * 2) + h1 (32px) + shadow 등 고려

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
      // 요소의 위치 계산
      const element = ref.current
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset

      // 헤더 높이만큼 offset 적용
      const offsetPosition = elementPosition - HEADER_HEIGHT

      // 스크롤 적용
      window.scrollTo({
        top: offsetPosition,
        behavior: options.behavior as ScrollBehavior,
      })
    }
  }, [condition, options.behavior])

  return ref
}
