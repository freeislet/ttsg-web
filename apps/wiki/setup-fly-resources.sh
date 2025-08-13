#!/bin/bash
# Outline을 위한 Fly.io 리소스(PostgreSQL, Redis) 생성 스크립트

set -e

# 색상 코드 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 색상 없음

echo -e "${GREEN}TT Wiki - Fly.io 리소스 생성 스크립트${NC}"
echo "========================================"

# Fly.io 로그인 상태 확인
echo -e "\n${YELLOW}Fly.io 로그인 상태 확인 중...${NC}"
if ! flyctl auth whoami &> /dev/null; then
  echo -e "${RED}Fly.io에 로그인되어 있지 않습니다. 먼저 로그인하세요:${NC}"
  echo "flyctl auth login"
  exit 1
fi
echo -e "${GREEN}로그인 확인 완료!${NC}"

# PostgreSQL 데이터베이스 생성
echo -e "\n${YELLOW}PostgreSQL 데이터베이스 생성 중...${NC}"
if flyctl postgres create --name tt-wiki-db --region nrt --vm-size shared-cpu-1x --initial-cluster-size 1 --volume-size 1; then
  echo -e "${GREEN}PostgreSQL 데이터베이스 생성 완료!${NC}"
else
  echo -e "${RED}PostgreSQL 데이터베이스 생성 실패 또는 이미 존재합니다.${NC}"
  echo "기존 데이터베이스 연결 정보를 확인하세요: flyctl postgres show tt-wiki-db"
fi

# Redis 인스턴스 생성
echo -e "\n${YELLOW}Redis 인스턴스 생성 중...${NC}"
if flyctl redis create --name tt-wiki-redis --region nrt --vm-size micro; then
  echo -e "${GREEN}Redis 인스턴스 생성 완료!${NC}"
else
  echo -e "${RED}Redis 인스턴스 생성 실패 또는 이미 존재합니다.${NC}"
  echo "기존 Redis 연결 정보를 확인하세요: flyctl redis show tt-wiki-redis"
fi

# 볼륨 생성 (Outline 데이터 저장용)
echo -e "\n${YELLOW}Outline 데이터 저장을 위한 볼륨 생성 중...${NC}"
if flyctl volumes create outline_data --region nrt --size 1; then
  echo -e "${GREEN}볼륨 생성 완료!${NC}"
else
  echo -e "${RED}볼륨 생성 실패 또는 이미 존재합니다.${NC}"
  echo "기존 볼륨을 확인하세요: flyctl volumes list"
fi

# 시크릿 생성
echo -e "\n${YELLOW}시크릿 키 생성 중...${NC}"
SECRET_KEY=$(openssl rand -base64 32)
UTILS_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}생성된 시크릿 키:${NC}"
echo "SECRET_KEY: $SECRET_KEY"
echo "UTILS_SECRET: $UTILS_SECRET"
echo -e "\n${YELLOW}시크릿을 Fly.io에 등록하려면 다음 명령어를 실행하세요:${NC}"
echo "flyctl secrets set SECRET_KEY=\"$SECRET_KEY\" UTILS_SECRET=\"$UTILS_SECRET\""

# 데이터베이스 연결 정보 가져오기
echo -e "\n${YELLOW}데이터베이스 연결 정보 가져오는 방법:${NC}"
echo "flyctl postgres show tt-wiki-db"

# Redis 연결 정보 가져오기
echo -e "\n${YELLOW}Redis 연결 정보 가져오는 방법:${NC}"
echo "flyctl redis show tt-wiki-redis"

echo -e "\n${GREEN}모든 리소스 설정이 완료되었습니다!${NC}"
echo -e "${YELLOW}이제 env.example 파일을 참고하여 환경 변수를 설정하고 애플리케이션을 배포하세요.${NC}"
echo "flyctl deploy"
