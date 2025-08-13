# TT Wiki - Outline

이 프로젝트는 TT의 위키 시스템으로, [Outline](https://www.getoutline.com/)을 사용하여 문서를 관리하고 [Fly.io](https://fly.io/)에 배포하며 도메인은 wiki.ttsg.space를 사용합니다.

## 개요

Outline은 팀을 위한 위키 및 지식 베이스를 제공하는 오픈 소스 솔루션입니다. 이 프로젝트는 Docker를 사용하여 Outline을 설정하고 Fly.io에 배포하는 구성을 포함합니다.

## 필수 조건

- [Docker](https://www.docker.com/) 설치
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) 설치
- Fly.io 계정

## 로컬 개발

로컬 환경에서 개발 및 테스트를 위해 다음 명령어를 사용하세요:

```bash
# Docker Compose로 로컬 환경 시작
docker compose up

# 백그라운드로 실행
docker compose up -d
```

## 배포

Fly.io에 배포하려면 다음 단계를 따르세요:

```bash
# Fly.io에 로그인
fly auth login

# 애플리케이션 배포
fly deploy
```

## 환경 변수

Outline을 구성하기 위해 필요한 환경 변수는 `.env.example` 파일에 정의되어 있습니다. 실제 배포 전에 `.env` 파일을 생성하고 적절한 값을 설정하세요.

## 문서

더 자세한 정보는 [Outline 공식 문서](https://docs.getoutline.com/)를 참조하세요.
