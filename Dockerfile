FROM node:20-alpine AS base

# Build stage - install deps AND build in same stage to preserve symlinks
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

ARG AGENT_BACKEND_URL=http://daedalus:8100
ENV AGENT_BACKEND_URL=$AGENT_BACKEND_URL

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
