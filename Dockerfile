# ---- Dependencies ----
FROM node:22-slim AS deps
WORKDIR /app
# Prisma needs OpenSSL present to pick the right engine.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---- Builder ----
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the standalone Next.js server (also runs `prisma generate`).
RUN npm run build

# ---- Runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Next.js standalone output (includes a minimal node_modules).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + CLI + engines so the entrypoint can sync the DB on boot.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Persisted SQLite lives here; mount a volume at /data.
RUN mkdir -p /data
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
