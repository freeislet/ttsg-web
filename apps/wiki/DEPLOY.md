# TT Wiki - Outline 배포 가이드

이 문서는 TT Wiki (Outline)를 Fly.io에 배포하는 방법에 대한 상세한 안내입니다.

## 사전 준비사항

배포를 시작하기 전에 다음 항목들이 준비되어 있는지 확인하세요:

1. [Fly.io](https://fly.io) 계정
2. [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) 설치
3. Docker 설치
4. 인증 제공자 설정 (Google, GitHub 또는 기타 OIDC 제공자)

## 1단계: Fly.io CLI 설치 및 로그인

```bash
# Fly CLI 설치 (macOS)
brew install flyctl

# Fly.io 계정으로 로그인
fly auth login
```

## 2단계: 필요한 리소스 생성

프로젝트 폴더에 포함된 스크립트를 사용하여 필요한 모든 Fly.io 리소스를 생성합니다:

```bash
# 스크립트 실행 권한 부여
chmod +x setup-fly-resources.sh

# 스크립트 실행
./setup-fly-resources.sh
```

이 스크립트는 다음 리소스를 생성합니다:
- PostgreSQL 데이터베이스 (tt-wiki-db)
- Redis 인스턴스 (tt-wiki-redis)
- Outline 데이터용 볼륨 (outline_data)
- 랜덤 생성된 보안 키

## 3단계: 환경 변수 설정

스크립트 실행 후 생성된 시크릿 키를 사용하여 Fly.io에 환경 변수를 설정합니다:

```bash
# 기본 시크릿 설정
fly secrets set \
  SECRET_KEY="생성된_시크릿_키" \
  UTILS_SECRET="생성된_유틸_시크릿"
```

데이터베이스 및 Redis 연결 정보를 가져와 추가 환경 변수를 설정합니다:

```bash
# 데이터베이스 및 Redis 연결 정보 확인
fly postgres show tt-wiki-db
fly redis show tt-wiki-redis

# 연결 정보로 환경 변수 설정
fly secrets set \
  DATABASE_URL="postgres://postgres:비밀번호@tt-wiki-db.internal:5432/postgres" \
  REDIS_URL="redis://tt-wiki-redis.internal:6379"
```

인증 및 스토리지 관련 환경 변수를 설정합니다:

```bash
# 인증 제공자 설정 (예: Google OAuth)
fly secrets set \
  GOOGLE_CLIENT_ID="your-client-id" \
  GOOGLE_CLIENT_SECRET="your-client-secret"

# S3 호환 스토리지 설정 (선택 사항)
fly secrets set \
  AWS_ACCESS_KEY_ID="your-access-key" \
  AWS_SECRET_ACCESS_KEY="your-secret-key" \
  AWS_REGION="ap-northeast-1" \
  AWS_S3_UPLOAD_BUCKET_NAME="your-bucket-name"
```

## 4단계: 애플리케이션 배포

모든 환경 변수가 설정되면 애플리케이션을 배포합니다:

```bash
# 애플리케이션 배포
fly deploy
```

배포가 완료되면 애플리케이션 URL을 확인합니다:

```bash
fly status
```

## 5단계: 초기 설정 완료

배포된 애플리케이션에 접속하여 초기 설정을 완료합니다:

1. 브라우저에서 `https://ttsg-wiki.fly.dev` (또는 지정된 URL)에 접속
2. 인증 제공자를 통해 로그인
3. 관리자 계정 설정 및 워크스페이스 생성
4. 팀원 초대 및 권한 설정

## 문제 해결

### 로그 확인

애플리케이션에 문제가 있는 경우 로그를 확인하세요:

```bash
fly logs
```

### 설정 변경

환경 변수나 설정을 변경해야 할 경우:

```bash
# 환경 변수 추가/변경
fly secrets set KEY=VALUE

# 변경 사항 적용을 위해 재배포
fly deploy
```

### 데이터베이스 접속

데이터베이스에 직접 접속해야 할 경우:

```bash
fly postgres connect -a tt-wiki-db
```

## 참고 자료

- [Outline 공식 문서](https://docs.getoutline.com/)
- [Fly.io 배포 가이드](https://fly.io/docs/apps/)
- [Fly.io PostgreSQL 문서](https://fly.io/docs/postgres/)
