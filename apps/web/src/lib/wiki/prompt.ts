/**
 * 위키 생성을 위한 프롬프트 템플릿
 */

import type { AIType } from '@/lib/ai'
import type { Language } from '@/lib/notion'

/**
 * 위키 프롬프트 옵션 인터페이스
 */
export interface WikiPromptOptions {
  aiType?: AIType
  language?: Language
  includeSystemPrompt?: boolean
}

/**
 * 위키 프롬프트를 생성합니다.
 * @param topic 위키 생성 주제
 * @param options 프롬프트 옵션
 * @returns 완성된 프롬프트
 */
export function getWikiPrompt(topic: string, options: WikiPromptOptions = {}): string {
  const { aiType, language = 'ko', includeSystemPrompt = false } = options

  let prompt = ''

  // 시스템 프롬프트 포함 (주로 Gemini용)
  if (includeSystemPrompt) {
    const systemPrompt = getWikiSystemPrompt(language)
    prompt += systemPrompt + '\n\n'
  }

  // 기본 위키 프롬프트
  const basePrompt = getWikiBasePrompt(topic, language)
  prompt += basePrompt

  // 모델별 최적화 메시지
  if (aiType) {
    const optimizationMessage = getModelOptimizationMessage(aiType, language)
    if (optimizationMessage) {
      prompt += '\n\n' + optimizationMessage
    }
  }

  return prompt
}

/**
 * 기본 위키 생성 프롬프트 템플릿
 * @param topic 위키 생성 주제
 * @param language 언어 설정 (선택적, 기본값: 'ko')
 * @returns 구조화된 프롬프트
 */
export function getWikiBasePrompt(topic: string, language?: Language): string {
  const isKorean = (language ?? 'ko') === 'ko'

  if (isKorean) {
    return `당신은 전문적인 위키 문서 작성자입니다. 주어진 주제에 대해 체계적이고 포괄적인 위키 문서를 한국어로 작성해주세요.

주제: ${topic}

다음 구조를 따라 마크다운 형식으로 작성해주세요:

# ${topic}

## 개요
- 주제에 대한 간단하고 명확한 정의
- 핵심 개념과 중요성

## 역사 및 배경
- 발전 과정과 주요 이정표
- 중요한 인물이나 사건

## 주요 특징
- 핵심 특성과 구성 요소
- 작동 원리나 메커니즘

## 분류 및 유형
- 다양한 종류나 카테고리
- 각각의 특징과 차이점

## 응용 및 활용
- 실제 사용 사례
- 다양한 분야에서의 활용

## 장점과 단점
- 긍정적 측면
- 한계점이나 문제점

## 현재 동향
- 최신 발전 사항
- 현재의 연구나 개발 상황

## 미래 전망
- 예상되는 발전 방향
- 잠재적 영향과 변화

## 관련 용어
- 주요 전문 용어 설명
- 연관 개념들

## 참고 자료
- 추가 학습을 위한 리소스
- 관련 웹사이트나 문헌

작성 지침:
- 정확하고 객관적인 정보를 제공하세요.
- 전문적이면서도 이해하기 쉽게 설명하세요.
- 각 섹션은 충분한 내용으로 구성하세요.
- 마크다운 문법을 정확히 사용하세요.
- 한국어로 자연스럽게 작성하세요.
- 최신 정보를 반영하되, 확실하지 않은 내용은 포함하지 마세요.

위키 문서를 시작하세요:`
  } else {
    return `You are a professional wiki document writer. Please write a systematic and comprehensive wiki document about the given topic in English.

Topic: ${topic}

Please write in markdown format following this structure:

# ${topic}

## Overview
- Simple and clear definition of the topic
- Core concepts and importance

## History and Background
- Development process and major milestones
- Important figures or events

## Key Features
- Core characteristics and components
- Operating principles or mechanisms

## Classification and Types
- Various categories or types
- Features and differences of each

## Applications and Uses
- Real-world use cases
- Applications in various fields

## Advantages and Disadvantages
- Positive aspects
- Limitations or problems

## Current Trends
- Latest developments
- Current research or development status

## Future Prospects
- Expected development directions
- Potential impacts and changes

## Related Terms
- Key technical term explanations
- Related concepts

## References
- Resources for additional learning
- Related websites or literature

Writing Guidelines:
- Provide accurate and objective information.
- Explain professionally yet understandably.
- Compose each section with sufficient content.
- Use markdown syntax correctly.
- Write naturally in English.
- Reflect the latest information, but do not include uncertain content.

Start the wiki document:`
  }
}

/**
 * 위키 문서 생성을 위한 시스템 메시지를 생성합니다.
 * @param language 언어 설정
 * @returns 시스템 메시지
 */
export function getWikiSystemPrompt(language: Language = 'ko'): string {
  return language === 'ko'
    ? '당신은 전문적인 위키 문서 작성자입니다. 정확하고 체계적인 한국어 위키 문서를 작성해주세요.'
    : 'You are a professional wiki document writer. Please write accurate and systematic wiki documents in English.'
}

/**
 * 모델별 최적화 메시지를 생성합니다.
 * @param aiType AI 타입
 * @param language 언어 설정
 * @returns 최적화 메시지
 */
export function getModelOptimizationMessage(aiType: AIType, language: Language = 'ko'): string {
  const isKorean = language === 'ko'

  switch (aiType) {
    case 'ChatGPT':
      return isKorean
        ? 'OpenAI GPT 모델의 특성을 활용하여 창의적이고 포괄적인 문서를 작성해주세요.'
        : 'Utilize the characteristics of OpenAI GPT model to write a creative and comprehensive document.'

    case 'Gemini':
      return isKorean
        ? 'Google Gemini 모델의 특성을 활용하여 구조화되고 체계적인 문서를 작성해주세요.'
        : 'Utilize the characteristics of Google Gemini model to write a structured and systematic document.'

    default:
      return ''
  }
}
