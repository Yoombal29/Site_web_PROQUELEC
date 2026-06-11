# ============================================
# PROQUELEC Production Dockerfile
# Multi-stage build: frontend + backend
# ============================================

# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && npm cache clean --force

# Copy frontend source
COPY . .

# Build the React app
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ---- Stage 2: Build Backend ----
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy ALL package files (server needs root deps like form-data, axios)
COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* ./server/
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist

# ---- Stage 3: Runtime ----
FROM node:20-alpine

RUN apk add --no-cache tzdata curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built artifacts
COPY --from=backend-builder /app ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server/index.js"]
