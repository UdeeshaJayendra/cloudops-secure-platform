FROM node:22-alpine

LABEL org.opencontainers.image.title="CloudOps Secure Platform Backend"
LABEL org.opencontainers.image.description="Backend API for the CloudOps Secure Platform"
LABEL org.opencontainers.image.version="1.0.0"

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]