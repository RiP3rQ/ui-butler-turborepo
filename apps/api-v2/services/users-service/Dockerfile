# ==========================================
# BUILD STAGE
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /workspace

# Copy root workspace configuration files
COPY package.json ./
COPY pnpm-workspace.yaml ./
#COPY pnpm-lock.yaml ./ <---DO NOT COPY pnpm-lock.yaml as it will cause blotted node_modules
COPY turbo.json ./

# Copy shared packages
COPY packages/config-typescript ./packages/config-typescript
COPY packages/config-eslint ./packages/config-eslint
COPY packages/types ./packages/types

# Copy API libraries
COPY apps/api-v2/libs/common ./apps/api-v2/libs/common
COPY apps/api-v2/libs/database ./apps/api-v2/libs/database
COPY apps/api-v2/libs/proto ./apps/api-v2/libs/proto

# Copy service-specific files
COPY apps/api-v2/services/users-service/package.json ./apps/api-v2/services/users-service/
COPY apps/api-v2/services/users-service/tsconfig*.json ./apps/api-v2/services/users-service/
COPY apps/api-v2/services/users-service/nest-cli.json ./apps/api-v2/services/users-service/
COPY apps/api-v2/services/users-service/src ./apps/api-v2/services/users-service/src

# Install pnpm
RUN npm install -g pnpm@10.2.1

# Install only needed dependencies (without pnpm-lock) and build using TURBO
RUN pnpm install
RUN pnpm run build:backend

# ==========================================
# PRODUCTION STAGE
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.2.1

# Set production environment
ENV NODE_ENV=production
ENV HUSKY=0
ENV CI=true

# Copy workspace files for production install
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/pnpm-workspace.yaml ./
COPY --from=builder /workspace/pnpm-lock.yaml ./

# Copy packages and libs package.json files
COPY --from=builder /workspace/packages ./packages
COPY --from=builder /workspace/apps/api-v2/libs ./apps/api-v2/libs

# Copy service files
COPY --from=builder /workspace/apps/api-v2/services/users-service/package.json ./apps/api-v2/services/users-service/
COPY --from=builder /workspace/apps/api-v2/services/users-service/dist ./apps/api-v2/services/users-service/dist

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

# Set working directory to service folder
WORKDIR /app/apps/api-v2/services/users-service

# Start the application
CMD ["node", "dist/main"]

# Expose Users Service port
EXPOSE 3341