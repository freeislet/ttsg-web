# TinaCMS 통합 연구

## 1. TinaCMS 개요

[TinaCMS](https://tina.io/)는 Git 기반 콘텐츠 관리 시스템으로, 마크다운, JSON, YAML 등의 데이터 파일을 관리하기 위한 시각적 편집기를 제공합니다. 주요 특징은 다음과 같습니다:

- **Git 기반**: 모든 콘텐츠 변경사항이 Git 커밋으로 관리됩니다.
- **개발자 친화적**: 기존 코드베이스와 쉽게 통합 가능합니다.
- **인라인 편집**: 실제 페이지에서 콘텐츠를 직접 편집할 수 있습니다.
- **스키마 기반**: 콘텐츠 모델을 코드로 정의합니다.
- **미디어 관리**: 이미지 및 기타 미디어 파일 관리 기능을 제공합니다.

## 2. TTSG 프로젝트에 TinaCMS 도입 이점

### 2.1 현재 Astro 설정과의 호환성

현재 TTSG 프로젝트는 Astro 프레임워크를 사용하고 있으며, 콘텐츠 컬렉션을 통해 마크다운 파일을 관리하고 있습니다. TinaCMS는 이러한 설정과 원활하게 통합될 수 있습니다:

- Astro의 콘텐츠 컬렉션 스키마를 TinaCMS 스키마로 쉽게 변환 가능
- 정적 사이트 생성(SSG) 워크플로우와 호환됨
- 기존 마크다운 파일을 그대로 활용 가능

### 2.2 블로그 및 위키 콘텐츠 관리

블로그 및 위키 콘텐츠 관리를 위한 TinaCMS의 주요 이점:

- **구조화된 콘텐츠**: 일관된 메타데이터 및 콘텐츠 구조 보장
- **협업**: 여러 사용자가 동시에 작업 가능
- **버전 관리**: Git을 통한 모든 변경사항 추적
- **편집자 경험**: 기술적 지식이 없는 사용자도 쉽게 콘텐츠 편집 가능
- **미디어 라이브러리**: 이미지, 비디오 등의 미디어 에셋 효율적 관리
- **검색 기능**: 콘텐츠 검색 및 필터링 기능 제공

## 3. 외부 콘텐츠 스토리지 옵션

TinaCMS는 콘텐츠를 여러 방식으로 저장할 수 있습니다:

### 3.1 Local Mode (로컬 스토리지)

- **구성**: 로컬 파일 시스템에 직접 저장
- **워크플로우**: 로컬에서 편집 → Git 커밋 → 배포
- **장점**: 간단한 설정, 기존 Git 워크플로우 유지
- **단점**: 협업 기능 제한적, 편집을 위한 로컬 개발 환경 필요

### 3.2 Tina Cloud (클라우드 스토리지)

- **구성**: Tina Cloud에서 호스팅되는 콘텐츠 API
- **워크플로우**: Tina Cloud 편집기에서 편집 → Git 저장소에 자동 커밋 → 배포
- **장점**:
  - 사용자 인증 및 권한 관리
  - 웹 기반 편집기 (개발 환경 불필요)
  - 실시간 협업
  - 편집 중인 콘텐츠 미리보기
- **단점**:
  - 월간 구독 비용 발생
  - 외부 서비스 의존성

### 3.3 Self-hosted API (자체 호스팅 API)

- **구성**: 자체 서버에 Tina 데이터 레이어 호스팅
- **워크플로우**: 자체 호스팅 편집기에서 편집 → Git 저장소에 커밋 → 배포
- **장점**:
  - 데이터 소유권 완전 보장
  - 커스텀 인증 시스템 연동 가능
  - 외부 의존성 최소화
- **단점**:
  - 설정 및 유지보수 복잡성 증가
  - 서버 인프라 필요

## 4. TTSG 프로젝트를 위한 TinaCMS 구현 계획

### 4.1 통합 단계

1. **TinaCMS 설치 및 기본 설정**:

   ```bash
   # TinaCMS 패키지 설치
   pnpm add tinacms @tinacms/cli

   # Tina 구성 파일 생성
   npx @tinacms/cli init
   ```

2. **콘텐츠 스키마 정의**:
   - 기존 Astro 콘텐츠 컬렉션 스키마를 TinaCMS 스키마로 변환
   - 블로그 및 위키 콘텐츠 모델 정의

3. **외부 스토리지 설정**:
   - Tina Cloud 계정 생성 및 프로젝트 연결 (권장)
   - 또는 자체 호스팅 API 설정

4. **인증 시스템 연동**:
   - 편집자 계정 생성 및 권한 설정
   - 필요시 기존 인증 시스템과 통합

5. **Astro 빌드 프로세스 통합**:
   - TinaCMS를 Astro 빌드 파이프라인에 통합
   - 콘텐츠 변경 시 자동 빌드 트리거 설정

### 4.2 인라인 편집 UI 구현

TinaCMS의 인라인 편집 기능을 통해 WYSIWYG 경험을 제공할 수 있습니다:

1. **Tina UI 컴포넌트 설치**:

   ```bash
   pnpm add @tinacms/toolkit
   ```

2. **편집 모드 활성화**:

   ```tsx
   // src/components/TinaWrapper.tsx
   import { TinaEditProvider } from 'tinacms/dist/edit-state'

   export const TinaWrapper = ({ children }) => {
     const isEditing = useIsEditing()

     return <TinaEditProvider editMode={isEditing}>{children}</TinaEditProvider>
   }
   ```

3. **인라인 편집 필드 구현**:

   ```tsx
   // src/components/EditableContent.tsx
   import { useTina } from 'tinacms/dist/react'

   export const EditableContent = ({ data, query, variables }) => {
     const { data: tinaData } = useTina({
       query,
       variables,
       data,
     })

     return (
       <div>
         <h1 data-tina-field={tinaData.title}>{tinaData.title}</h1>
         <div data-tina-field={tinaData.content}>{/* 마크다운 또는 리치 텍스트 렌더링 */}</div>
       </div>
     )
   }
   ```

4. **미디어 관리 UI 통합**:
   - 이미지 업로드 및 선택 인터페이스
   - 미디어 갤러리 및 에셋 관리

5. **에디터 스타일링**:
   - 프로젝트 디자인 시스템에 맞게 에디터 UI 커스터마이징
   - 다크/라이트 모드 지원 등

### 4.3 검색 기능 구현

TinaCMS는 콘텐츠 검색 기능을 지원합니다:

1. **GraphQL API를 통한 쿼리**:

   ```tsx
   const SEARCH_QUERY = `
     query SearchContent($searchTerm: String!) {
       wiki(filter: {content: {contains: $searchTerm}}) {
         edges {
           node {
             title
             slug
             excerpt
           }
         }
       }
     }
   `

   // 검색 구현
   const searchResults = await client.request({
     query: SEARCH_QUERY,
     variables: { searchTerm: '검색어' },
   })
   ```

2. **고급 검색 기능**:
   - 필터링 및 정렬
   - 전문 검색(Full-text search)
   - 메타데이터 기반 검색

## 5. 잠재적 문제점 및 해결 방안

### 5.1 빌드 시간 증가

- **문제**: TinaCMS 통합으로 빌드 시간 증가 가능성
- **해결**: 증분 빌드 설정, 필요한 페이지만 재빌드

### 5.2 콘텐츠 버전 충돌

- **문제**: 여러 사용자가 동시 편집 시 충돌 가능성
- **해결**: Tina Cloud의 실시간 협업 기능 활용, 충돌 해결 UI 제공

### 5.3 마이그레이션 복잡성

- **문제**: 기존 콘텐츠의 TinaCMS 스키마 적용 어려움
- **해결**: 점진적 마이그레이션 전략, 마이그레이션 스크립트 개발

### 5.4 성능 최적화

- **문제**: 대량의 콘텐츠 처리 시 성능 저하 가능성
- **해결**: 콘텐츠 청크화, 최적화된 쿼리 설계, 캐싱 전략 구현

## 6. 결론 및 다음 단계

TinaCMS는 TTSG 프로젝트의 콘텐츠 관리 요구사항을 충족시킬 수 있는 강력한 솔루션입니다. 특히 블로그와 위키 콘텐츠의 구조화된 관리, 협업 워크플로우, 그리고 향후 검색 기능 구현을 위한 기반을 제공합니다.

### 6.1 권장 설정

- **스토리지 옵션**: Tina Cloud (외부 스토리지)
- **편집 인터페이스**: 인라인 편집 + 관리자 대시보드
- **배포 통합**: Vercel 또는 Cloudflare와 웹훅 연동

### 6.2 다음 단계

1. TinaCMS 데모 설정 구축 및 테스트
2. 콘텐츠 모델 스키마 완성
3. 사용자 워크플로우 테스트 및 피드백 수집
4. 전체 사이트에 점진적 롤아웃

### 6.3 타임라인 예상

- 초기 설정 및 프로토타입: 1-2주
- 콘텐츠 모델 설계 및 구현: 1주
- 인라인 편집 UI 개발: 1-2주
- 전체 통합 및 테스트: 1주
- 문서화 및 사용자 트레이닝: 2-3일
