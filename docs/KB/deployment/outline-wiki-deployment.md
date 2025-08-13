# Outline 위키 Fly.io 배포 가이드

## 개요

TTSG 프로젝트는 위키 솔루션으로 [Outline](https://www.getoutline.com/)을 사용하며, 이를 [Fly.io](https://fly.io/)에 배포합니다. 이 문서는 TTSG 팀원들이 Outline 위키를 배포하고 관리하는 방법에 대한 가이드입니다.

## Outline 소개

Outline은 팀을 위한 위키 및 지식 베이스 솔루션으로, 다음과 같은 특징이 있습니다:

- 직관적이고 현대적인 인터페이스
- 실시간 협업 기능
- 마크다운 지원
- 버전 관리 및 이력 추적
- 강력한 검색 기능
- 다양한 인증 방식 지원 (Google, GitHub 등)
- API 및 통합 기능

## 프로젝트 구조

Outline 위키 프로젝트는 TTSG 모노레포 내의 `apps/wiki` 디렉토리에 위치합니다:

```
apps/
  └── wiki/
      ├── Dockerfile              # Outline Docker 이미지 정의
      ├── docker-compose.yml      # 로컬 개발 환경 구성
      ├── fly.toml                # Fly.io 배포 설정
      ├── env.example             # 환경 변수 예시
      ├── setup-fly-resources.sh  # Fly.io 리소스 생성 스크립트
      ├── DEPLOY.md               # 상세 배포 가이드
      └── README.md               # 프로젝트 개요
```

## 배포 과정

### 1. 사전 준비사항

배포를 시작하기 전에 다음 항목들이 준비되어 있는지 확인하세요:

- [Fly.io](https://fly.io) 계정 생성
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) 설치
- Docker 설치 (로컬 테스트용)
- 인증 제공자 설정 (Google, GitHub 등)

### 2. Fly CLI 설정

```bash
# Fly CLI 설치 (macOS)
brew install flyctl

# Fly.io 계정으로 로그인
fly auth login
```

### 3. 필요한 리소스 생성

프로젝트 폴더의 스크립트를 사용하여 필요한 모든 Fly.io 리소스를 생성합니다:

```bash
# apps/wiki 디렉토리로 이동
cd /Users/freeislet/Documents/TTSG/projects/ttsg/apps/wiki

# 스크립트 실행 권한 부여
chmod +x setup-fly-resources.sh

# 스크립트 실행
./setup-fly-resources.sh
```

이 스크립트는 다음 리소스를 생성합니다:
- PostgreSQL 데이터베이스 (ttsg-wiki-db)
- Redis 인스턴스 (ttsg-wiki-redis)
- 데이터 저장용 볼륨 (outline_data)
- 보안에 필요한 시크릿 키

### 4. 환경 변수 설정

스크립트 실행 후 생성된 시크릿 키를 사용하여 Fly.io에 환경 변수를 설정합니다:

```bash
# 기본 시크릿 설정
fly secrets set \
  SECRET_KEY="생성된_시크릿_키" \
  UTILS_SECRET="생성된_유틸_시크릿" \
  URL="https://ttsg-wiki.fly.dev"
```

데이터베이스 및 Redis 연결 정보를 추가합니다:

```bash
# 데이터베이스 및 Redis 연결 정보 설정
fly secrets set \
  DATABASE_URL="postgres://postgres:비밀번호@ttsg-wiki-db.internal:5432/postgres" \
  REDIS_URL="redis://ttsg-wiki-redis.internal:6379"
```

인증 제공자 설정 (예: Google OAuth):

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="your-client-id" \
  GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 5. 배포 실행

모든 설정이 완료되면 애플리케이션을 배포합니다:

```bash
# 애플리케이션 배포
fly deploy
```

### 6. 초기 설정

배포가 완료된 후 다음 단계를 진행하세요:

1. 브라우저에서 `https://ttsg-wiki.fly.dev`에 접속
2. 인증 제공자를 통해 로그인
3. 관리자 계정 설정 및 팀 워크스페이스 생성
4. 팀원 초대 및 권한 설정

## 로컬 개발 환경

로컬에서 개발 및 테스트를 하려면 다음 명령어를 사용하세요:

```bash
# apps/wiki 디렉토리로 이동
cd /Users/freeislet/Documents/TTSG/projects/ttsg/apps/wiki

# Docker Compose로 로컬 환경 시작
docker compose up

# 백그라운드로 실행하려면
docker compose up -d
```

로컬 환경에서는 `http://localhost:8080`으로 접속할 수 있습니다.

## 유지보수 및 관리

### 로그 확인

```bash
# 애플리케이션 로그 확인
fly logs
```

### 설정 변경

```bash
# 환경 변수 추가/변경
fly secrets set KEY=VALUE

# 변경 사항 적용을 위한 재배포
fly deploy
```

### 백업 및 복원

정기적인 백업을 위해 Fly.io의 PostgreSQL 백업 기능을 활용하세요:

```bash
# 데이터베이스 백업 생성
fly postgres backup create -a ttsg-wiki-db
```

## 문제 해결

### 연결 문제 해결

데이터베이스 연결 문제 발생 시:

```bash
# 데이터베이스 상태 확인
fly postgres status -a ttsg-wiki-db

# 데이터베이스 직접 접속
fly postgres connect -a ttsg-wiki-db
```

### 애플리케이션 재시작

```bash
# 애플리케이션 재시작
fly apps restart ttsg-wiki
```

## 참고 자료

- [Outline 공식 문서](https://docs.getoutline.com/)
- [Fly.io 배포 가이드](https://fly.io/docs/apps/)
- [Fly.io PostgreSQL 문서](https://fly.io/docs/postgres/)
- [Outline GitHub 저장소](https://github.com/outline/outline)
