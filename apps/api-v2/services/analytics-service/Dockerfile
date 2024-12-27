# ==========================================
# BUILD STAGE
# Uses node:18-slim as the base image for building
# ==========================================
FROM node:18-slim AS builder

# Set working directory
WORKDIR /workspace

# ==========================================
# Copy root workspace configuration files
# These files are necessary for the monorepo setup
# ==========================================
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# ==========================================
# Copy shared packages
# @repo/* packages contain shared configurations and types
# ==========================================
COPY packages ./packages

# ==========================================
# Copy API libraries
# @app/* packages contain shared business logic and utilities
# ==========================================
# Common library for shared code
COPY apps/api-v2/libs/common ./apps/api-v2/libs/common
# Database library for database connections and models
COPY apps/api-v2/libs/database ./apps/api-v2/libs/database
# Proto library for gRPC definitions
COPY apps/api-v2/libs/proto ./apps/api-v2/libs/proto

# ==========================================
# Copy service-specific files
# These files are needed to build the analytics service
# ==========================================
# Package.json contains service dependencies and scripts
COPY apps/api-v2/services/analytics-service/package.json ./apps/api-v2/services/analytics-service/
# TypeScript configuration
COPY apps/api-v2/services/analytics-service/tsconfig*.json ./apps/api-v2/services/analytics-service/
# NestJS configuration
COPY apps/api-v2/services/analytics-service/nest-cli.json ./apps/api-v2/services/analytics-service/
# Source code
COPY apps/api-v2/services/analytics-service/src ./apps/api-v2/services/analytics-service/src

# ==========================================
# Install dependencies and build
# ==========================================
# Install pnpm with exact version from package.json
RUN npm install -g pnpm@8.15.6

# Install all dependencies (including workspace packages)
RUN pnpm install --no-frozen-lockfile

# Build the analytics service
RUN cd apps/api-v2/services/analytics-service && pnpm run build

# ==========================================
# PRODUCTION STAGE
# Creates a minimal production image
# ==========================================
FROM node:18-slim AS runner

# Set working directory for the app
WORKDIR /app

# ==========================================
# Copy build artifacts and dependencies
# Only copies what's necessary for production
# ==========================================
# Copy the built application
COPY --from=builder /workspace/apps/api-v2/services/analytics-service/dist ./dist
# Copy the package.json for runtime dependencies
COPY --from=builder /workspace/apps/api-v2/services/analytics-service/package.json ./
# Copy node_modules containing all dependencies
COPY --from=builder /workspace/node_modules ./node_modules

# ==========================================
# Set production environment
# ==========================================
ENV NODE_ENV=production

# ==========================================
# Start the application
# ==========================================
# Command to run the built application
CMD ["node", "dist/main"]

# Expose port for gRPC communication
EXPOSE 3347

# Command to build image from the root of the monorepo
# docker build -f apps/api-v2/services/analytics-service/Dockerfile -t analytics-service .