FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars
ARG NEXT_PUBLIC_TINA_CLIENT_ID
ARG TINA_TOKEN
ARG AGENT_BACKEND_URL=http://daedalus:8100
ENV NEXT_PUBLIC_TINA_CLIENT_ID=$NEXT_PUBLIC_TINA_CLIENT_ID
ENV TINA_TOKEN=$TINA_TOKEN
ENV AGENT_BACKEND_URL=$AGENT_BACKEND_URL

# Ensure node_modules/.bin is in PATH for tinacms
ENV PATH=/app/node_modules/.bin:$PATH

RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV AGENT_BACKEND_URL=http://daedalus:8100

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
