import { useState, useEffect } from 'react';
import { marked } from 'marked';

interface WikiEditorProps {
  initialContent?: string;
  onSave: (content: string) => Promise<boolean>;
}

/**
 * 위키 편집을 위한 마크다운 에디터 컴포넌트
 * 편집 영역과 미리보기 영역을 포함
 */
export function WikiEditor({ initialContent = '', onSave }: WikiEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 콘텐츠가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    setPreview(marked.parse(content));
  }, [content]);
  
  // 저장 처리
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const success = await onSave(content);
      if (!success) {
        setError('저장 실패. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('오류 발생: ' + String(err));
    } finally {
      setSaving(false);
    }
  };
  
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
  );
}
