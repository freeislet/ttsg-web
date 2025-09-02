/**
 * 위키 링크 파싱 유틸리티
 * [[제목]] 또는 [[제목|표시텍스트]] 형태의 위키 링크를 처리합니다.
 */

/**
 * 위키 링크 정보 타입
 */
export interface WikiLinkInfo {
  title: string // 실제 위키 제목
  displayText: string // 화면에 표시될 텍스트
  originalMatch: string // 원본 매치 문자열
}

/**
 * 마크다운 텍스트에서 위키 링크를 찾아 정보를 추출합니다
 * @param markdown 마크다운 텍스트
 * @returns 위키 링크 정보 배열
 */
export function extractWikiLinks(markdown: string): WikiLinkInfo[] {
  // [[제목]] 또는 [[제목|표시텍스트]] 패턴 매칭
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  const links: WikiLinkInfo[] = []
  let match

  while ((match = wikiLinkRegex.exec(markdown)) !== null) {
    const [originalMatch, title, displayText] = match
    
    links.push({
      title: title.trim(),
      displayText: displayText ? displayText.trim() : title.trim(),
      originalMatch,
    })
  }

  return links
}

/**
 * 마크다운 텍스트의 위키 링크를 HTML 링크로 변환합니다
 * @param markdown 마크다운 텍스트
 * @returns 위키 링크가 변환된 마크다운 텍스트
 */
export function convertWikiLinksToHtml(markdown: string): string {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  
  return markdown.replace(wikiLinkRegex, (match, title, displayText) => {
    const linkTitle = title.trim()
    const linkText = displayText ? displayText.trim() : linkTitle
    
    // data-wiki-title 속성으로 위키 제목 저장
    return `<span class="wiki-link" data-wiki-title="${linkTitle}">${linkText}</span>`
  })
}

/**
 * 마크다운 텍스트의 위키 링크를 React 컴포넌트 형태로 변환합니다
 * @param markdown 마크다운 텍스트
 * @returns React 컴포넌트가 포함된 JSX 문자열
 */
export function convertWikiLinksToComponents(markdown: string): string {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  
  return markdown.replace(wikiLinkRegex, (match, title, displayText) => {
    const linkTitle = title.trim()
    const linkText = displayText ? displayText.trim() : linkTitle
    
    // WikiLink 컴포넌트로 변환
    return `<WikiLink title="${linkTitle}" displayText="${linkText}" />`
  })
}

/**
 * HTML 문자열에서 위키 링크 스팬을 찾아 WikiLink 컴포넌트로 교체합니다
 * (클라이언트 사이드에서 사용)
 * @param htmlElement HTML 요소
 */
export function enhanceWikiLinksInElement(htmlElement: HTMLElement): void {
  const wikiLinks = htmlElement.querySelectorAll('.wiki-link')
  
  wikiLinks.forEach((link) => {
    const title = link.getAttribute('data-wiki-title')
    const displayText = link.textContent || title
    
    if (title) {
      // 동적으로 WikiLink 컴포넌트 속성 설정
      link.setAttribute('data-wiki-enhanced', 'true')
      link.setAttribute('data-wiki-display', displayText || title)
      
      // hover 이벤트 리스너는 WikiLink 컴포넌트에서 처리
    }
  })
}

/**
 * 위키 링크가 포함된 마크다운인지 확인합니다
 * @param markdown 마크다운 텍스트
 * @returns 위키 링크 포함 여부
 */
export function hasWikiLinks(markdown: string): boolean {
  const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/
  return wikiLinkRegex.test(markdown)
}

/**
 * 위키 링크 제목을 정규화합니다 (검색용)
 * @param title 위키 제목
 * @returns 정규화된 제목
 */
export function normalizeWikiTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자, 공백만 유지)
}
