FROM outlinewiki/outline:latest

# 로컬 환경과 Fly.io에서 모두 작동하도록 환경 설정
ENV NODE_ENV=production

# Fly.io 환경에 맞춤 추가 설정
ENV PORT=8080
ENV BIND_HOST=0.0.0.0

# 포트 노출
EXPOSE 8080

# HOST 인자를 명시적으로 지정하여 Outline 서버 시작
CMD ["yarn", "start", "--host", "0.0.0.0"]
