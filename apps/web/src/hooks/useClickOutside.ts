import { useEffect, useRef } from 'react'

/**
 * 외부 클릭을 감지하는 커스텀 훅
 * @param callback 외부 클릭 시 실행할 콜백 함수
 * @param isActive 훅이 활성화되어야 하는지 여부
 * @returns 감지할 요소에 연결할 ref
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  isActive: boolean = true
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [callback, isActive])

  return ref
}
