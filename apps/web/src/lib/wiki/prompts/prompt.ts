/**
 * 위키 생성을 위한 프롬프트 템플릿
 */

import type { AIType, Language } from './types'
import { koreanPrompts } from './prompt-ko'
import { englishPrompts } from './prompt-en'

const promptsByLanguage = {
  ko: koreanPrompts,
  en: englishPrompts,
}

/**
 * 기본 위키 생성 프롬프트 템플릿
 * @param topic 위키 생성 주제
 * @param language 언어 설정 (선택적, 기본값: 'ko')
 * @returns 구조화된 프롬프트
 */
export function getWikiPrompt(topic: string, language?: Language): string {
  const prompts = promptsByLanguage[language ?? 'ko']
  return prompts.getPrompt(topic)
}

/**
 * 위키 문서 생성을 위한 시스템 메시지를 생성합니다.
 * @param language 언어 설정 (선택적, 기본값: 'ko')
 * @param aiType AI 타입 (선택적, 있으면 최적화 메시지 추가)
 * @returns 시스템 메시지
 */
export function getWikiSystemMessage(language?: Language, aiType?: AIType): string {
  const prompts = promptsByLanguage[language ?? 'ko']

  // AI 타입별 최적화 메시지 반영
  if (aiType) {
    const optimizationMessage = prompts.optimizationMessages[aiType]
    if (optimizationMessage) {
      return prompts.systemMessage + '\n' + optimizationMessage
    }
  }

  // 기본 시스템 메시지 반환
  return prompts.systemMessage
}
