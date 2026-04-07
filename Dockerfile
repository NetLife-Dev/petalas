FROM node:18-slim AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Install OpenSSL and other essentials for Prisma on Debian
RUN apt-get update && apt-get install -y openssl libssl-dev libc6 ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
# Install OpenSSL in the builder stage as well for prisma generate
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Ensure Prisma client is generated for the correct platform
RUN npx prisma generate
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Final stage needs OpenSSL at runtime as well
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Essential Prisma and Binaries
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV HOME /tmp

# Auto-migrate on start
CMD ["sh", "-c", "./node_modules/.bin/prisma db push && node server.js"]


