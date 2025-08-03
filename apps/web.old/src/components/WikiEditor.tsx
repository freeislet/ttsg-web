import { useState, useEffect } from 'react'
import { marked } from 'marked'

import { wikiApi } from '@/utils/r2Client'

interface WikiEditorProps {
  initialContent?: string
  slug?: string // 위키 페이지 슬러그
  mode: 'new' | 'edit' // 새 페이지 생성 또는 기존 페이지 수정 모드
  redirectAfterSave?: boolean // 저장 후 리디렉션 여부
}

/**
 * 위키 편집을 위한 마크다운 에디터 컴포넌트
 * 편집 영역과 미리보기 영역을 포함
 */
export function WikiEditor({
  initialContent = '',
  slug,
  mode,
  redirectAfterSave = true,
}: WikiEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 콘텐츠가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    setPreview(marked.parse(content))
  }, [content])

  // 저장 처리
  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      // 새 페이지 모드에서는 slug 입력 필드에서 값을 가져옴
      let targetSlug = slug

      if (mode === 'new') {
        const slugInput = document.getElementById('slug') as HTMLInputElement
        if (!slugInput) {
          setError('페이지 식별자 입력란을 찾을 수 없습니다.')
          return
        }

        targetSlug = slugInput.value.trim().toLowerCase().replace(/\s+/g, '-')

        if (!targetSlug) {
          setError('페이지 식별자를 입력해주세요.')
          return
        }
      }

      // 이미 slug가 있는 경우 (편집 모드)
      if (!targetSlug) {
        setError('페이지 식별자가 없습니다.')
        return
      }

      // API 요청
      const response = await wikiApi.saveContent(targetSlug, content)

      if (response.success) {
        if (redirectAfterSave) {
          window.location.href = `/wiki/${targetSlug}`
        }
      } else {
        setError(`저장 실패 (${response.status}): ${response.error || '알 수 없는 오류'}`)
      }
    } catch (err) {
      console.error('위키 저장 오류:', err)
      setError('오류 발생: ' + (err instanceof Error ? err.message : String(err)))
      console.error('Wiki save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-medium mb-2">편집</h3>
        <textarea
          className="w-full h-96 p-4 border rounded font-mono text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="마크다운으로 작성..."
        />

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">미리보기</h3>
        <div className="p-4 border rounded prose h-96 overflow-auto bg-white">
          <div dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  )
}
