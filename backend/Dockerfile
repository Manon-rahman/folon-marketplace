# Build context: project root (.)
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY backend/entrypoint.sh ./
COPY db/migrations ./db/migrations
RUN chmod +x entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]
