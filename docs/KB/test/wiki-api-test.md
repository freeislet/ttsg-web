# TTSG 위키 페이지 생성 테스트 가이드

이 문서는 로컬 환경에서 TTSG 위키 페이지 생성 테스트 방법에 대한 상세 가이드를 제공합니다.

## 1. 사전 준비

### 1.1. 필요한 소프트웨어

- Node.js (v18 이상)
- pnpm (v8 이상)
- wrangler (v4.27.0)

### 1.2. 로컬 개발 환경 설정

프로젝트에는 이미 `wrangler`가 devDependencies로 설치되어 있습니다:

```json
"devDependencies": {
  // ...
  "wrangler": "4.27.0"
}
```

### 1.3. 서비스 실행

테스트를 위해 Wrangler 서비스가 실행되어야 합니다:

```bash
# 프로젝트 루트로 이동
cd apps/web

# Wrangler 워커 실행 (로컬 개발 환경)
pnpm w:dev
```

이 명령은 `wrangler pages dev .` 명령을 실행하여 프로젝트 루트 디렉토리를 기반으로 Wrangler 서비스를 시작합니다. 이렇게 하면 `functions` 디렉토리의 API가 자동으로 인식됩니다.

> **참고:** 원격 바인딩을 사용하려면 `pnpm w:dev:remote` 명령을 사용할 수 있습니다.

## 2. 위키 API 테스트

### 2.1. 위키 목록 조회

```bash
# 위키 목록 조회 (curl 사용)
curl -X GET "http://localhost:8788/api/wiki/list"
```

성공 응답 예시:

```json
["테스트페이지", "다른페이지"]
```

### 2.2. 위키 페이지 생성/수정

```bash
# 위키 페이지 생성/수정 (curl 사용)
curl -X POST "http://localhost:8788/api/wiki/테스트페이지" \
  -H "Content-Type: text/plain" \
  -H "Origin: http://localhost:8788" \
  -d "# 테스트 페이지 제목\n\n이것은 테스트 페이지 내용입니다."
```

성공 응답:

```json
{ "success": true }
```

### 2.3. 위키 페이지 조회

```bash
# 위키 페이지 조회
curl -X GET "http://localhost:8788/api/wiki/테스트페이지"
```

응답으로 저장된 마크다운 콘텐츠가 반환됩니다.

## 3. 웹 인터페이스 테스트

### 3.1. 브라우저에서 위키 목록 확인

1. 브라우저에서 다음 주소로 접속:

   ```
   http://localhost:8788/wiki
   ```

2. 생성된 위키 페이지 목록이 표시되는지 확인합니다.

### 3.2. 브라우저에서 위키 페이지 확인

1. 브라우저에서 다음 주소로 접속:

   ```
   http://localhost:8788/wiki/테스트페이지
   ```

2. 페이지가 올바르게 렌더링되었는지 확인합니다:
   - 마크다운 형식이 HTML로 변환되어 표시되는지
   - 제목과 내용이 정확히 표시되는지

### 3.3. 위키 페이지 생성

1. 브라우저에서 다음 주소로 접속:

   ```
   http://localhost:8788/wiki/new
   ```

2. 위키 편집기에 내용을 입력합니다.
3. 저장 버튼을 클릭합니다.
4. 저장 후 새로 생성된 페이지로 리다이렉트되는지 확인합니다.

### 3.4. 위키 페이지 편집

1. 브라우저에서 다음 주소로 접속:

   ```
   http://localhost:8788/wiki/edit/테스트페이지
   ```

2. 기존 내용이 에디터에 표시되는지 확인합니다.
3. 내용을 수정하고 저장 버튼을 클릭합니다.
4. 저장 후 수정된 페이지로 리다이렉트되는지 확인합니다.

## 4. 환경 설정

### 4.1. wrangler.toml 설정

프로젝트의 `wrangler.toml` 파일은 다음과 같이 구성되어 있습니다:

```toml
name = "ttsg"
pages_build_output_dir = "dist"
compatibility_date = "2025-07-30"
compatibility_flags = ["nodejs_compat"]

# 기본 환경 설정 (로컬 개발 환경)

# 로컬 개발 환경에서 사용할 R2 버킷 바인딩 설정
[[r2_buckets]]
bucket_name = "ttsg-dev"  # 개발 환경 R2 버킷 이름
binding = "BUCKET"        # env.BUCKET으로 접근 가능

# 환경별 설정
[env]

# 개발(preview) 환경 설정
[env.preview]

# 개발 환경에서 사용할 R2 버킷 바인딩 설정
[[env.preview.r2_buckets]]
bucket_name = "ttsg-dev"   # 개발 환경 R2 버킷 이름
binding = "BUCKET"         # env.BUCKET으로 접근 가능

# 프로덕션 환경 설정
[env.production]

# 프로덕션 환경에서 사용할 R2 버킷 바인딩 설정
[[env.production.r2_buckets]]
bucket_name = "ttsg"       # 프로덕션 환경 R2 버킷 이름
binding = "BUCKET"         # env.BUCKET으로 접근 가능
```

### 4.2. 환경별 실행 명령

- **로컬 개발 환경**: `pnpm w:dev` (프로젝트 루트 디렉토리 기반)
- **원격 바인딩 환경**: `pnpm w:dev:remote` (프로젝트 루트 디렉토리 기반, 원격 바인딩 사용)
- **프로덕션 환경**: `pnpm w:deploy` (프로덕션 배포)

## 5. 트러블슈팅

### 5.1. 포트 충돌 해결

wrangler 실행 시 "Address already in use" 오류가 발생하면 이미 사용 중인 포트를 확인하고 해당 프로세스를 종료하세요.

```bash
# 8788 포트 사용 중인 프로세스 확인
lsof -i :8788

# 해당 프로세스 종료
kill <PID>
```

### 5.2. API 404 오류

API 엔드포인트에서 404 오류가 발생하는 경우 다음을 확인하세요:

1. `functions` 디렉토리가 프로젝트 루트에 있는지 확인
2. `wrangler pages dev .` 명령으로 실행 중인지 확인
3. `functions/api/wiki/[[route]].ts` 파일이 존재하는지 확인

### 5.3. 위키 저장 오류

WikiEditor에서 "onSave is not a function" 오류가 발생하면 Astro와 React 컴포넌트 간 함수 전달 문제입니다. 이 문제는 WikiEditor.tsx 컴포넌트 내에서 직접 저장 기능을 구현하여 해결되었습니다.

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
