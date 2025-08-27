/**
 * English wiki prompt templates
 */

import type { PromptStrings } from './types'

/**
 * English 프롬프트 문자열 객체
 */
export const englishPrompts: PromptStrings = {
  getPrompt: (
    topic: string,
    instruction?: string
  ) => `You are a professional wiki document writer. Please write a systematic and comprehensive wiki document about the given topic in English.

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
- Include actual implementation methods and code examples when possible.
${
  instruction
    ? `
Additional Instructions:
${instruction}
`
    : ''
}
Start the wiki document:`,
  systemMessage:
    'You are a professional wiki document writer. Please write accurate and systematic wiki documents in English. Output only the article without any additional explanations or notes.',
  optimizationMessages: {
    ChatGPT:
      'Utilize the characteristics of OpenAI GPT model to write a creative and comprehensive document.',
    Gemini:
      'Utilize the characteristics of Google Gemini model to write a structured and systematic document.',
  },
}
