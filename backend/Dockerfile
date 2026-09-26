FROM node:22-alpine

LABEL org.opencontainers.image.title="CloudOps Secure Platform Backend"
LABEL org.opencontainers.image.description="Backend API for the CloudOps Secure Platform"
LABEL org.opencontainers.image.version="1.0.0"

RUN npm install -g npm@11.20.0

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

RUN chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]