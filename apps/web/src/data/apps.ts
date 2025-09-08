/**
 * 데모 앱 정보 타입 정의
 */
export interface DemoApp {
  /** 앱 고유 식별자 */
  id: string
  /** 앱 이름 */
  name: string
  /** 앱 설명 */
  description: string
  /** 앱 링크 URL */
  url: string
  /** 스크린샷 이미지 경로 목록 */
  screenshots: string[]
  /** 기술 스택 태그 목록 */
  tags: AppTag[]
  /** 앱 상태 */
  status: 'active' | 'maintenance' | 'coming-soon'
  /** 앱 아이콘 (선택적) */
  icon?: string
}

/**
 * 앱 태그 정보 타입 정의
 */
export interface AppTag {
  /** 태그 이름 */
  name: string
  /** 태그 색상 (Tailwind CSS 클래스) */
  color: string
}

/**
 * 미리 정의된 태그 목록
 */
export const APP_TAGS: Record<string, AppTag> = {
  REACT: { name: 'React', color: 'bg-blue-100 text-blue-800' },
  TYPESCRIPT: { name: 'TypeScript', color: 'bg-purple-100 text-purple-800' },
  ASTRO: { name: 'Astro', color: 'bg-orange-100 text-orange-800' },
  GEMINI: { name: 'Gemini API', color: 'bg-green-100 text-green-800' },
  CLOUDFLARE: { name: 'Cloudflare', color: 'bg-yellow-100 text-yellow-800' },
  VITE: { name: 'Vite', color: 'bg-indigo-100 text-indigo-800' },
  TAILWIND: { name: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-800' },
  NODEJS: { name: 'Node.js', color: 'bg-green-100 text-green-800' },
  AI: { name: 'AI', color: 'bg-pink-100 text-pink-800' },
  CHAT: { name: 'Chat', color: 'bg-gray-100 text-gray-800' },
} as const

/**
 * 데모 앱 목록 데이터
 */
export const DEMO_APPS: DemoApp[] = [
  {
    id: 'ai-chat',
    name: 'AI Chat',
    description:
      'Gemini API를 활용한 실시간 AI 채팅 애플리케이션입니다. 스트리밍 응답과 직관적인 UI를 통해 자연스러운 대화 경험을 제공합니다.',
    url: 'https://ai-chat.ttsg.space',
    screenshots: ['/assets/images/apps/ai-chat/image.png'],
    tags: [
      APP_TAGS.REACT,
      APP_TAGS.GEMINI,
      APP_TAGS.TYPESCRIPT,
      APP_TAGS.CLOUDFLARE,
      APP_TAGS.AI,
      APP_TAGS.CHAT,
    ],
    status: 'active',
    icon: 'chat', // 채팅 아이콘
  },
  // 향후 추가될 앱들을 위한 예시:
  // {
  //   id: 'wiki-generator',
  //   name: 'Wiki Generator',
  //   description: 'AI를 활용한 자동 위키 페이지 생성 도구입니다.',
  //   url: 'https://ttsg.space/wiki/generate',
  //   screenshots: [],
  //   tags: [APP_TAGS.ASTRO, APP_TAGS.AI, APP_TAGS.TYPESCRIPT],
  //   status: 'maintenance'
  // }
]

/**
 * 상태별 앱 필터링 함수
 */
export function getAppsByStatus(status: DemoApp['status']): DemoApp[] {
  return DEMO_APPS.filter((app) => app.status === status)
}

/**
 * 활성 상태 앱 목록 조회
 */
export function getActiveApps(): DemoApp[] {
  return getAppsByStatus('active')
}

/**
 * 태그별 앱 필터링 함수
 */
export function getAppsByTag(tagName: string): DemoApp[] {
  return DEMO_APPS.filter((app) => app.tags.some((tag) => tag.name === tagName))
}
