/**
 * 콘텐츠에서 요약을 추출합니다.
 * @param content 콘텐츠
 * @param topic 주제
 * @returns 요약
 * @deprecated 자동 생성된 코드인데 지금은 사용 안 함
 */
export function extractSummary(content: string, topic: string): string {
  const lines = content.split('\n')
  const overviewIndex = lines.findIndex((line) => line.includes('## 개요'))

  if (overviewIndex !== -1 && overviewIndex + 1 < lines.length) {
    const summaryLines = []
    for (let i = overviewIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('##')) break
      if (line && !line.startsWith('#')) {
        summaryLines.push(line.replace(/^- /, ''))
      }
    }
    return summaryLines.join(' ').substring(0, 200) + '...'
  }

  return topic + '에 대한 위키 문서입니다.'
}
