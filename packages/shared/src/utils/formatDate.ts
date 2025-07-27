/**
 * Utility functions for formatting dates consistently across the application
 */

// Constants for Korean date formatting
// const KOREAN_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
// const KOREAN_MONTHS = [
//   '1월', '2월', '3월', '4월', '5월', '6월',
//   '7월', '8월', '9월', '10월', '11월', '12월'
// ];

/**
 * Format a date in YYYY년 MM월 DD일 format (Korean style)
 */
export function formatKoreanDate(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()

  return `${year}년 ${month}월 ${day}일`
}

/**
 * Format a date in YYYY-MM-DD format
 */
export function formatISODate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Format a date with time in YYYY-MM-DD HH:MM format
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  const dateStr = formatISODate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${dateStr} ${hours}:${minutes}`
}

/**
 * Format a date as relative time (e.g., "3일 전", "방금 전")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 30) return `${diffDay}일 전`
  if (diffMonth < 12) return `${diffMonth}개월 전`
  return `${diffYear}년 전`
}
