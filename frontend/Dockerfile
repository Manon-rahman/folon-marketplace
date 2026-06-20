FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_STRIPE_PK
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_STRIPE_PK=$NUXT_PUBLIC_STRIPE_PK
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
