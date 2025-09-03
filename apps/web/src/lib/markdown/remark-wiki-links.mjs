/**
 * remark 플러그인: [[WikiLink]] 문법을 WikiLink 컴포넌트로 변환
 * [[제목]] 또는 [[제목|표시텍스트]] 형태를 처리
 */
export function remarkWikiLinks() {
  return (tree) => {
    // 간단한 구현: 텍스트 노드에서 위키링크 패턴을 찾아 HTML로 변환
    function visitNode(node) {
      if (node.type === 'text' && node.value) {
        const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
        if (wikiLinkRegex.test(node.value)) {
          node.value = node.value.replace(wikiLinkRegex, (match, title, displayText) => {
            const linkTitle = title.trim()
            const linkText = displayText ? displayText.trim() : linkTitle
            return `<WikiLink title="${linkTitle}" displayText="${linkText}" />`
          })
          node.type = 'html'
        }
      }
      
      if (node.children) {
        node.children.forEach(visitNode)
      }
    }
    
    visitNode(tree)
  }
}
