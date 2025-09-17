import React from 'react'
import { useSnapshot } from 'valtio'
import { logState, clearLogs, type LogEntry } from '../store/logStore'

/**
 * 로그 패널 컴포넌트
 * 애플리케이션의 로그 메시지들을 시간순으로 표시하고 관리하는 패널
 */
const LogPanel: React.FC = () => {
  const { logs } = useSnapshot(logState)

  /**
   * 로그 레벨에 따른 색상 클래스를 반환
   * @param level - 로그 레벨 (error, warn, info, debug)
   * @returns Tailwind CSS 색상 클래스
   */
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      case 'debug': return 'text-gray-400'
      default: return 'text-gray-300'
    }
  }

  /**
   * 타임스탬프를 한국 시간 형식으로 포맷팅
   * @param timestamp - Date 객체
   * @returns HH:MM:SS 형식의 시간 문자열
   */
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300">로그</h3>
        <button
          onClick={clearLogs}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          지우기
        </button>
      </div>
      
      {/* 로그 내용 영역 */}
      <div className="flex-1 overflow-auto p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">로그가 없습니다.</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log: LogEntry) => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-gray-500 shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <span className={`shrink-0 uppercase font-semibold ${getLevelColor(log.level)}`}>
                  [{log.level}]
                </span>
                {log.category && (
                  <span className="text-purple-400 shrink-0">
                    [{log.category}]
                  </span>
                )}
                <span className="text-gray-300 break-all">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LogPanel
