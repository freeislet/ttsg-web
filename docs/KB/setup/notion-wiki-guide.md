# 노션 공개 위키 구축 가이드

## 목차

1. [개요](#개요)
2. [노션 공개 위키 설정 방법](#노션-공개-위키-설정-방법)
3. [노션 API를 통한 페이지 생성](#노션-api를-통한-페이지-생성)
4. [다국어 지원 구현](#다국어-지원-구현)
5. [배포 및 관리 팁](#배포-및-관리-팁)

## 개요

노션(Notion)은 강력한 협업 도구이자 지식 관리 플랫폼으로, 공개 위키를 구축하는 데 적합합니다. 이 문서에서는 TTSG 프로젝트를 위해 노션을 활용하여 공개 위키를 구축하는 방법을 설명합니다.

### 노션 공개 위키의 장점

- **사용 용이성**: 직관적인 인터페이스로 기술 지식이 없는 팀원도 쉽게 사용 가능
- **실시간 협업**: 여러 사용자가 동시에 문서 편집 가능
- **API 지원**: 프로그래밍 방식으로 페이지 생성 및 관리 가능
- **다양한 콘텐츠 형식**: 텍스트, 이미지, 표, 데이터베이스 등 다양한 형식 지원
- **공개 설정**: 특정 페이지를 공개하여 외부 사용자도 접근 가능

## 노션 공개 위키 설정 방법

### 1. 노션 워크스페이스 설정

1. [노션 웹사이트](https://www.notion.so)에 접속하여 계정 생성 또는 로그인
2. 새 워크스페이스 생성 또는 기존 워크스페이스 선택
3. 워크스페이스 설정에서 팀원 초대 (필요한 경우)

### 2. 위키 구조 설계

```
노션 위키 구조 예시:
├── 홈페이지
├── 시작하기
│   ├── 개요
│   ├── 설치 가이드
│   └── 자주 묻는 질문
├── 문서
│   ├── 사용자 가이드
│   ├── API 레퍼런스
│   └── 튜토리얼
└── 커뮤니티
    ├── 기여 가이드라인
    └── 로드맵
```

1. 위키의 메인 페이지 생성
2. 사이드바 구성 (페이지 그룹화)
3. 템플릿 페이지 생성 (일관된 문서 형식 유지)

### 3. 공개 설정

1. 공유하려는 페이지에서 오른쪽 상단의 "공유" 버튼 클릭
2. "웹에 공유" 옵션 활성화
3. 공유 설정에서 "Allow duplicate as template" 옵션은 끄고, "Search engine indexing" 옵션은 켜서 구글/네이버 등의 검색 엔진에 노출되도록 설정
4. 공유 링크 생성

![노션 공유 설정](https://help.notion.so/images/pages/sharing-and-permissions/public-sharing/share-to-web.gif)

### 4. 노션 퍼블릭 페이지 커스터마이징

1. 퍼블릭 페이지의 아이콘 및 커버 이미지 설정
2. 목차(Table of Contents) 추가로 네비게이션 개선
3. 페이지 간 내비게이션 링크 설정

## 노션 API를 통한 페이지 생성

### 1. API 통합 설정

1. [노션 개발자 페이지](https://developers.notion.com)에서 통합 생성
2. 통합 토큰 발급 및 보안 유지
3. 통합을 위키 데이터베이스에 연결

```javascript
// .env 파일에 보안 설정
NOTION_API_KEY=your_integration_token
NOTION_DATABASE_ID=your_database_id
```

### 2. API 클라이언트 설정

```bash
# API 클라이언트 설치
pnpm add @notionhq/client
```

```javascript
// notion-client.js
import { Client } from '@notionhq/client';

// 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default notion;
```

### 3. 페이지 생성 예제

```javascript
// create-page.js
import notion from './notion-client';

/**
 * 노션에 새 위키 페이지를 생성하는 함수
 * @param {string} title - 페이지 제목
 * @param {string} content - 페이지 내용
 * @param {string[]} tags - 태그 목록
 * @returns {Promise<Object>} 생성된 페이지 객체
 */
export async function createWikiPage(title, content, tags = []) {
  try {
    // 부모 데이터베이스 ID 지정
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    // 페이지 생성
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        제목: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        태그: {
          multi_select: tags.map(tag => ({ name: tag })),
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content,
                },
              },
            ],
          },
        },
      ],
    });
    
    console.log('페이지가 성공적으로 생성되었습니다:', response.url);
    return response;
  } catch (error) {
    console.error('페이지 생성 중 오류 발생:', error.message);
    throw error;
  }
}
```

### 4. 페이지 조회 및 업데이트

```javascript
// query-pages.js
import notion from './notion-client';

/**
 * 위키 페이지 목록을 조회하는 함수
 * @param {Object} filter - 필터 조건
 * @returns {Promise<Array>} 페이지 목록
 */
export async function queryWikiPages(filter = {}) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: filter,
    });
    
    return response.results;
  } catch (error) {
    console.error('페이지 조회 중 오류 발생:', error.message);
    throw error;
  }
}

/**
 * 위키 페이지를 업데이트하는 함수
 * @param {string} pageId - 업데이트할 페이지 ID
 * @param {Object} properties - 업데이트할 속성
 * @returns {Promise<Object>} 업데이트된 페이지 객체
 */
export async function updateWikiPage(pageId, properties) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });
    
    console.log('페이지가 성공적으로 업데이트되었습니다:', response.url);
    return response;
  } catch (error) {
    console.error('페이지 업데이트 중 오류 발생:', error.message);
    throw error;
  }
}
```

## 다국어 지원 구현

### 1. 다국어 구조 설계

노션에서 다국어 지원을 위한 두 가지 주요 접근 방식:

#### 방법 1: 별도 페이지 접근법

각 언어별로 별도의 페이지를 생성하고 언어 전환 링크 제공

```
위키 구조:
├── 홈 (한국어)
│   └── [언어 전환 링크: 영어, 일본어, 중국어]
├── Home (영어)
│   └── [언어 전환 링크: 한국어, 일본어, 중국어]
├── ホーム (일본어)
│   └── [언어 전환 링크: 한국어, 영어, 중국어]
└── 主页 (중국어)
    └── [언어 전환 링크: 한국어, 영어, 일본어]
```

#### 방법 2: 토글 기반 접근법

하나의 페이지 내에서 토글 블록을 사용하여 다국어 콘텐츠 제공

```
페이지 구조:
├── 제목
├── 목차
└── 콘텐츠
    ├── 🇰🇷 한국어
    │   └── [한국어 콘텐츠]
    ├── 🇺🇸 영어
    │   └── [영어 콘텐츠]
    ├── 🇯🇵 일본어
    │   └── [일본어 콘텐츠]
    └── 🇨🇳 중국어
        └── [중국어 콘텐츠]
```

### 2. 다국어 관리를 위한 데이터베이스 설계

```
다국어 콘텐츠 데이터베이스:
- 속성:
  - 키(Key): 콘텐츠 식별자
  - 한국어(Korean): 한국어 텍스트
  - 영어(English): 영어 텍스트
  - 일본어(Japanese): 일본어 텍스트
  - 중국어(Chinese): 중국어 텍스트
  - 카테고리(Category): 콘텐츠 분류
  - 마지막 업데이트(Last Updated): 최종 수정일
```

### 3. API를 통한 다국어 페이지 생성

```javascript
// multilingual-page.js
import notion from './notion-client';

/**
 * 다국어 위키 페이지를 생성하는 함수
 * @param {Object} titles - 언어별 제목 객체 {ko: '한국어 제목', en: 'English Title', ...}
 * @param {Object} contents - 언어별 내용 객체 {ko: '한국어 내용', en: 'English content', ...}
 * @returns {Promise<Object>} 생성된 페이지 객체
 */
export async function createMultilingualPage(titles, contents) {
  try {
    // 지원 언어 목록
    const languages = [
      { code: 'ko', flag: '🇰🇷', name: '한국어' },
      { code: 'en', flag: '🇺🇸', name: '영어' },
      { code: 'ja', flag: '🇯🇵', name: '일본어' },
      { code: 'zh', flag: '🇨🇳', name: '중국어' },
    ];
    
    // 기본 언어는 한국어
    const defaultLang = 'ko';
    
    // 페이지 생성 (제목은 기본 언어로)
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        제목: {
          title: [
            {
              text: {
                content: titles[defaultLang] || Object.values(titles)[0],
              },
            },
          ],
        },
        언어: {
          multi_select: Object.keys(titles).map(lang => ({ name: lang })),
        },
      },
      // 페이지 내용 구성
      children: [
        // 언어 전환 링크 섹션
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '언어 선택 / Language' } }],
          },
        },
        ...languages.filter(lang => titles[lang.code]).map(lang => ({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { 
                type: 'text', 
                text: { 
                  content: `${lang.flag} ${lang.name}`,
                },
                annotations: {
                  bold: true,
                  color: 'default',
                }
              }
            ],
          },
        })),
        // 구분선
        {
          object: 'block',
          type: 'divider',
          divider: {},
        },
        // 각 언어별 콘텐츠 섹션
        ...languages.filter(lang => contents[lang.code]).flatMap(lang => [
          {
            object: 'block',
            type: 'toggle',
            toggle: {
              rich_text: [
                { 
                  type: 'text', 
                  text: { content: `${lang.flag} ${titles[lang.code] || ''}` },
                  annotations: { bold: true }
                }
              ],
              children: [
                {
                  object: 'block',
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [
                      { type: 'text', text: { content: contents[lang.code] || '' } }
                    ],
                  },
                }
              ],
            },
          }
        ]),
      ],
    });
    
    console.log('다국어 페이지가 성공적으로 생성되었습니다:', response.url);
    return response;
  } catch (error) {
    console.error('다국어 페이지 생성 중 오류 발생:', error.message);
    throw error;
  }
}
```

### 4. 다국어 콘텐츠 관리 유틸리티

```javascript
// language-utils.js

/**
 * 번역 파일에서 다국어 콘텐츠 로드
 * @param {string} path - 번역 파일 경로
 * @returns {Object} 다국어 콘텐츠 객체
 */
export function loadTranslations(path) {
  try {
    const translations = require(path);
    return translations;
  } catch (error) {
    console.error('번역 파일 로드 중 오류 발생:', error.message);
    return {};
  }
}

/**
 * 특정 키에 대한 번역 텍스트 가져오기
 * @param {Object} translations - 번역 객체
 * @param {string} key - 번역 키
 * @param {string} lang - 언어 코드
 * @param {string} fallbackLang - 대체 언어 코드
 * @returns {string} 번역된 텍스트
 */
export function getTranslation(translations, key, lang, fallbackLang = 'ko') {
  if (!translations[key]) {
    return `[Translation missing: ${key}]`;
  }
  
  return translations[key][lang] || translations[key][fallbackLang] || `[${lang} translation missing for: ${key}]`;
}
```

## 배포 및 관리 팁

### 1. 노션 페이지 임베딩

공개 노션 페이지를 TTSG 웹사이트에 임베드하는 방법:

```html
<iframe
  src="https://your-notion-page-url-here"
  width="100%"
  height="600px"
  frameborder="0"
  allowfullscreen
></iframe>
```

Astro 컴포넌트로 만들기:

```astro
---
// NotionEmbed.astro
interface Props {
  url: string;
  height?: string;
}

const { url, height = "600px" } = Astro.props;
---

<div class="notion-embed-container">
  <iframe
    src={url}
    width="100%"
    height={height}
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>

<style>
  .notion-embed-container {
    position: relative;
    width: 100%;
    margin: 1rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
```

### 2. 자동화 워크플로우

노션 API와 GitHub Actions를 활용한 자동화:

1. 노션 페이지 변경 감지
2. 웹사이트에 반영
3. 정기적 백업

### 3. SEO 최적화

노션 공개 위키의 SEO 개선:

1. 메타데이터 최적화: 페이지 제목과 설명이 명확하고 관련성 있게 작성
2. 검색 엔진 인덱싱 활성화: 공유 설정에서 "Search engine indexing" 옵션 켜기
3. 사이트맵 생성: 주요 페이지에 대한 링크가 포함된 인덱스 페이지 만들기
4. 검색 엔진 색인 등록: Google Search Console 및 Naver Webmaster Tools에 수동으로 URL 제출

### 4. 커스텀 도메인 연결

노션 페이지에 커스텀 도메인 연결 (Super 구독 필요):

1. 노션 설정에서 도메인 연결
2. DNS 설정 업데이트
3. SSL 인증서 확인

## 결론

노션은 강력하고 유연한 위키 플랫폼으로, API를 통한 자동화와 다국어 지원이 가능합니다. 이 가이드를 통해 TTSG 프로젝트를 위한 공개 위키를 효과적으로 구축하고 관리할 수 있습니다.

## 참고 자료

- [노션 API 공식 문서](https://developers.notion.com)
- [노션 공개 공유 가이드](https://www.notion.so/help/sharing-and-permissions)
- [노션 API JavaScript SDK](https://github.com/makenotion/notion-sdk-js)
