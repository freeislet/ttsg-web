import React, { useState } from 'react'
import { formatKoreanDate } from 'shared'

interface WikiEntry {
  id: number
  title: string
  description: string
  date: Date
}

const mockWikiData: WikiEntry[] = [
  {
    id: 1,
    title: 'Astro 가이드',
    description: 'Astro 프레임워크 사용법 및 팁',
    date: new Date(2025, 6, 27),
  },
  {
    id: 2,
    title: 'React 소개',
    description: 'React 라이브러리의 기본 개념과 구조',
    date: new Date(2025, 6, 25),
  },
  {
    id: 3,
    title: 'JavaScript 기초',
    description: 'JavaScript 프로그래밍 기초 및 활용',
    date: new Date(2025, 6, 23),
  },
]

const ExampleComponent: React.FC = () => {
  const [wikiEntries, setWikiEntries] = useState<WikiEntry[]>(mockWikiData)
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null)

  const handleEntrySelect = (entry: WikiEntry) => {
    setSelectedEntry(entry)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">위키 항목 보기 예시</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">위키 목록</h3>
          <div className="border rounded-lg overflow-hidden">
            {wikiEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntrySelect(entry)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedEntry?.id === entry.id ? 'bg-blue-50' : ''
                }`}
              >
                <h4 className="font-medium">{entry.title}</h4>
                <p className="text-sm text-gray-500">{formatKoreanDate(entry.date)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">위키 내용</h3>
          {selectedEntry ? (
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2">{selectedEntry.title}</h4>
              <p className="text-gray-500 text-sm mb-4">{formatKoreanDate(selectedEntry.date)}</p>
              <p>{selectedEntry.description}</p>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  이 컴포넌트는 실제 위키 콘텐츠를 패치하는 대신 목업 데이터를 사용합니다. 실제
                  구현에서는 Astro 앱의 위키 콘텐츠를 API를 통해 가져올 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 text-center text-gray-500">
              왼쪽 목록에서 위키 항목을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExampleComponent
