import { proxy } from 'valtio'

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  category?: string
}

interface LogState {
  logs: LogEntry[]
  maxLogs: number
}

// 로그 상태 관리
export const logState = proxy<LogState>({
  logs: [],
  maxLogs: 1000,
})

// 로그 추가 함수
export const addLog = (level: LogEntry['level'], message: string, category?: string) => {
  const newLog: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level,
    message,
    category,
  }

  logState.logs = [newLog, ...logState.logs].slice(0, logState.maxLogs)
}

// 로그 레벨별 헬퍼 함수들
export const logInfo = (message: string, category?: string) => addLog('info', message, category)
export const logWarn = (message: string, category?: string) => addLog('warn', message, category)
export const logError = (message: string, category?: string) => addLog('error', message, category)
export const logDebug = (message: string, category?: string) => addLog('debug', message, category)

// 로그 초기화
export const clearLogs = () => {
  logState.logs = []
}

// 초기 로그 메시지
logInfo('AI Space 애플리케이션이 시작되었습니다.', 'system')
