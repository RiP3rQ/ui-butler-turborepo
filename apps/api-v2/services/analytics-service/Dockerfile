# ==========================================
# STAGE 1: Dependencies
# ==========================================
FROM node:18-alpine AS deps

WORKDIR /app

# Alpine uses apk instead of apt-get
RUN apk update

# Copy package files
COPY package*.json ./
COPY .eslintrc.js ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Alpine uses apk instead of apt-get
RUN apk update

# Copy dependency files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/tsconfig*.json ./

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# ==========================================
# STAGE 3: Runner
# ==========================================
FROM node:18-alpine AS runner

# Alpine uses apk instead of apt-get
RUN apk update

# Add Tini
RUN apk add --no-cache tini

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Set environment variables
ENV NODE_ENV=production
ENV TZ=UTC

# Copy necessary files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Switch to non-root user
USER nestjs

# Use Tini
ENTRYPOINT ["/sbin/tini", "--"]

# Health check for gRPC
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "const client = require('@grpc/grpc-js').makeGenericClientConstructor({}); \
    const c = new client('localhost:${ANALYTICS_SERVICE_PORT}', require('@grpc/grpc-js').credentials.createInsecure()); \
    c.waitForReady(Date.now() + 1000, (e) => process.exit(e ? 1 : 0));"

# Start the application
CMD ["node", "dist/src/main"]

# Expose gRPC port
EXPOSE 3347