/**
 * 색상 클래스 정의 인터페이스
 */
export interface ColorClasses {
  border: string
  bg: string
  text: string
}

/**
 * 색상별 Tailwind CSS 클래스 매핑
 */
export const COLOR_CLASSES = {
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  gray: {
    border: 'border-gray-500',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
  },
} as const

/**
 * 색상 클래스에 따른 스타일 조회
 * @param colors 색상 클래스 객체
 * @param isSelected 선택 상태
 * @returns Tailwind CSS 클래스 객체
 */
export function getColorClasses(colors: ColorClasses, isSelected: boolean) {
  return {
    border: isSelected ? colors.border : 'border-gray-200',
    bg: isSelected ? colors.bg : '',
    text: colors.text, // 아이콘 색상은 항상 동일
    checkbox: colors.text,
  }
}
