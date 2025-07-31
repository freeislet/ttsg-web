# TTSG 위키 페이지 생성 테스트 가이드

이 문서는 로컬 환경에서 TTSG 위키 페이지 생성 테스트 방법에 대한 상세 가이드를 제공합니다.

## 1. 사전 준비

테스트를 위해 두 가지 서비스가 실행 중이어야 합니다:

1. **Astro 서버**: 웹 페이지를 제공하는 로컬 서버
2. **Wrangler 워커**: Cloudflare R2 저장소와 통신하는 API 서버

```bash
# Astro 서버 실행 (별도 터미널에서)
cd apps/web
pnpm dev

# Wrangler 워커 실행 (별도 터미널에서)
cd apps/web
pnpm w:dev
```

## 2. 위키 페이지 생성 테스트

### 2.1. API 호출 방법

Wrangler 워커가 제공하는 API를 직접 호출하여 위키 페이지를 생성할 수 있습니다:

```bash
# 위키 페이지 생성/수정 (curl 사용)
curl -X PUT "http://localhost:8788/api/wiki/테스트페이지" \
  -H "Content-Type: text/markdown" \
  --data-binary "# 테스트 페이지 제목\n\n이것은 테스트 페이지 내용입니다."
```

또는 POST 메서드도 사용 가능합니다:

```bash
curl -X POST "http://localhost:8788/api/wiki/테스트페이지" \
  -H "Content-Type: text/markdown" \
  --data-binary "# 테스트 페이지 제목\n\n이것은 테스트 페이지 내용입니다."
```

성공 응답:

```json
{ "success": true }
```

## 3. 위키 페이지 확인

### 3.1. 브라우저에서 페이지 확인

생성된 위키 페이지는 브라우저에서 직접 접속하여 확인할 수 있습니다:

1. 브라우저에서 다음 주소로 접속:

   ```
   http://localhost:3000/wiki/테스트페이지
   ```

2. 페이지가 올바르게 렌더링되었는지 확인합니다:
   - 마크다운 형식이 HTML로 변환되어 표시되는지
   - 제목과 내용이 정확히 표시되는지

### 3.2. API로 콘텐츠 확인

API를 통해 저장된 위키 콘텐츠를 직접 확인할 수 있습니다:

```bash
# GET 요청으로 위키 콘텐츠 확인
curl -X GET "http://localhost:8788/api/wiki?slug=테스트페이지"
```

응답으로 저장된 마크다운 콘텐츠가 반환되어야 합니다.

## 4. 위키 목록 확인

### 4.1. 위키 인덱스 페이지 확인

브라우저에서 위키 인덱스 페이지에 접속하여 생성된 페이지가 목록에 표시되는지 확인합니다:

```
http://localhost:3000/wiki
```

### 4.2. API로 위키 목록 확인

API를 통해 저장된 모든 위키 페이지 목록을 확인할 수 있습니다:

```bash
# 위키 목록 조회
curl -X GET "http://localhost:8788/api/wiki/list"
```

응답 예시:

```json
["테스트페이지", "다른페이지"]
```

## 5. 위키 페이지 삭제

필요한 경우 API를 통해 위키 페이지를 삭제할 수 있습니다:

```bash
# DELETE 요청으로 위키 페이지 삭제
curl -X DELETE "http://localhost:8788/api/wiki?slug=테스트페이지"
```

성공 응답:

```json
{ "success": true }
```

## 6. 문제해결 및 참고사항

1. **404 오류가 발생하는 경우**:
   - Astro 서버와 Wrangler 워커가 모두 실행 중인지 확인
   - 페이지 slug가 올바르게 지정되었는지 확인

2. **R2 저장소 접근 오류**:
   - Wrangler 설정에서 R2 버킷 바인딩이 올바르게 설정되었는지 확인

3. **위키 시스템 소스 우선순위**:
   - 로컬 파일 시스템 (`src/content/wiki/`)가 먼저 검색됨
   - 로컬에 없는 경우 R2 저장소에서 콘텐츠를 가져옴

4. **주의사항**:
   - 현재 구현에서는 인증 기능이 완전히 구현되지 않았음 (인증 로직이 주석 처리되어 있음)
   - 프로덕션 환경에서는 적절한 인증 및 권한 관리가 필요함
