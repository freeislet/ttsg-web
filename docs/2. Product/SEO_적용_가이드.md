# TTSG SEO 적용 가이드

## 1. 현재 SEO 상태 분석

### 1.1 기존 구현 현황
- **기본 메타태그**: 제한적 구현 (title만 하드코딩)
- **블로그 SEO**: BlogLayout에서 동적 title, description 생성
- **구조화된 데이터**: 미구현
- **Sitemap**: 미구현
- **Open Graph**: 미구현
- **Twitter Cards**: 미구현
- **JSON-LD**: 미구현

### 1.2 개선 필요 영역
1. **메인 사이트 SEO**: 정적 title을 동적으로 변경
2. **메타태그 확장**: description, keywords, Open Graph, Twitter Cards
3. **구조화된 데이터**: JSON-LD 스키마 추가
4. **Sitemap 생성**: 자동 sitemap.xml 생성
5. **성능 최적화**: Core Web Vitals 개선
6. **다국어 지원**: hreflang 태그 (향후)

## 2. SEO 개선 계획

### 2.1 Phase 1: 기본 SEO 구조 구축
- [ ] 동적 메타태그 시스템 구현
- [ ] Layout 컴포넌트에 SEO props 추가
- [ ] Open Graph 및 Twitter Cards 구현
- [ ] 기본 JSON-LD 구조화된 데이터 추가

### 2.2 Phase 2: 콘텐츠별 SEO 최적화
- [ ] 블로그 포스트 SEO 강화
- [ ] 위키 페이지 SEO 구현
- [ ] 앱 소개 페이지 SEO 최적화
- [ ] 카테고리별 메타 정보 관리

### 2.3 Phase 3: 기술적 SEO 구현
- [ ] Sitemap.xml 자동 생성
- [ ] Robots.txt 최적화
- [ ] 캐노니컬 URL 설정
- [ ] 페이지 로딩 속도 최적화

### 2.4 Phase 4: 고급 SEO 기능
- [ ] 구조화된 데이터 확장 (Article, Organization, WebSite)
- [ ] 빵부스러기 네비게이션
- [ ] 이미지 SEO 최적화
- [ ] 내부 링크 최적화

## 3. 구현 상세 계획

### 3.1 SEO 컴포넌트 구조
```
src/
├── components/
│   └── seo/
│       ├── SEOHead.astro          # 메인 SEO 컴포넌트
│       ├── OpenGraph.astro        # Open Graph 메타태그
│       ├── TwitterCard.astro      # Twitter Cards
│       └── JsonLD.astro           # JSON-LD 구조화된 데이터
├── lib/
│   └── seo/
│       ├── config.ts              # SEO 설정
│       ├── utils.ts               # SEO 유틸리티 함수
│       └── schemas.ts             # JSON-LD 스키마 정의
└── types/
    └── seo.ts                     # SEO 타입 정의
```

### 3.2 SEO 데이터 구조
```typescript
interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}
```

### 3.3 자동화 메커니즘
1. **블로그 포스트**: Content Collections에서 자동으로 SEO 데이터 추출
2. **위키 페이지**: 노션 API에서 메타 정보 가져와서 SEO 데이터 생성
3. **앱 페이지**: 정적 SEO 데이터 파일로 관리
4. **Sitemap**: Astro 빌드 시 자동 생성

## 4. 성능 목표

### 4.1 Core Web Vitals 목표
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 4.2 SEO 점수 목표
- **Google PageSpeed Insights**: 90+ (모바일/데스크톱)
- **Lighthouse SEO**: 95+
- **구조화된 데이터 검증**: 100% 통과

## 5. 모니터링 및 측정

### 5.1 SEO 도구 연동
- Google Search Console
- Google Analytics 4
- Bing Webmaster Tools
- 구조화된 데이터 테스트 도구

### 5.2 정기 점검 항목
- 월별 검색 순위 모니터링
- Core Web Vitals 성능 추적
- 크롤링 오류 점검
- 구조화된 데이터 유효성 검사

## 6. 콘텐츠 SEO 가이드라인

### 6.1 블로그 포스트 SEO
- 제목: 50-60자 이내, 키워드 포함
- 메타 설명: 150-160자 이내, 액션 유도 문구 포함
- 헤딩 구조: H1 > H2 > H3 계층 구조 준수
- 이미지: alt 텍스트, 적절한 파일명, 최적화된 크기

### 6.2 위키 페이지 SEO
- 노션 제목을 기반으로 한 SEO 제목 생성
- 노션 요약을 활용한 메타 설명
- 태그 기반 키워드 설정
- 내부 링크 최적화

### 6.3 앱 소개 페이지 SEO
- 앱별 고유한 메타 정보
- 스크린샷 및 데모 이미지 최적화
- 기능 설명을 통한 롱테일 키워드 타겟팅

## 7. 기술적 구현 세부사항

### 7.1 Astro SEO 통합
```astro
---
// Layout.astro
export interface Props {
  seo?: SEOData;
}

const { seo } = Astro.props;
const defaultSEO = {
  title: 'TTSG - Technology & Innovation Hub',
  description: 'TTSG는 최신 기술과 혁신을 탐구하는 플랫폼입니다.',
  // ...
};
---

<SEOHead seo={{ ...defaultSEO, ...seo }} />
```

### 7.2 동적 Sitemap 생성
```typescript
// src/pages/sitemap.xml.ts
export async function GET() {
  const posts = await getCollection('blog');
  const pages = [
    { url: '/', lastmod: new Date() },
    { url: '/blog', lastmod: new Date() },
    { url: '/wiki', lastmod: new Date() },
    // ...
  ];
  
  // 블로그 포스트 추가
  posts.forEach(post => {
    pages.push({
      url: `/blog/${post.slug}`,
      lastmod: post.data.updatedDate || post.data.pubDate
    });
  });
  
  return new Response(generateSitemap(pages));
}
```

### 7.3 구조화된 데이터 예시
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TTSG",
  "url": "https://ttsg.space",
  "description": "Technology & Innovation Hub",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ttsg.space/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## 8. 배포 및 검증 프로세스

### 8.1 개발 환경 검증
1. Lighthouse 점수 확인
2. 구조화된 데이터 테스트
3. 메타태그 검증
4. 모바일 친화성 테스트

### 8.2 프로덕션 배포 후 검증
1. Google Search Console 제출
2. Sitemap 제출
3. 크롤링 상태 모니터링
4. 검색 결과 확인

## 9. 유지보수 계획

### 9.1 정기 업데이트
- 월별: SEO 성과 리포트 작성
- 분기별: 키워드 전략 검토
- 반기별: 기술적 SEO 감사
- 연간: 전체 SEO 전략 재검토

### 9.2 콘텐츠 업데이트 자동화
- 새 블로그 포스트 발행 시 자동 sitemap 업데이트
- 위키 페이지 변경 시 메타 정보 자동 갱신
- 앱 업데이트 시 관련 페이지 SEO 정보 동기화

이 가이드를 바탕으로 TTSG 사이트의 SEO를 체계적으로 개선하여 검색 엔진 가시성과 사용자 경험을 향상시킬 예정입니다.
