# ==========================================
# BUILD STAGE
# ==========================================
FROM node:18-slim AS builder

WORKDIR /workspace

# Copy root workspace configuration files
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# Copy shared packages
COPY packages ./packages

# Copy API libraries
COPY apps/api-v2/libs/common ./apps/api-v2/libs/common
COPY apps/api-v2/libs/database ./apps/api-v2/libs/database
COPY apps/api-v2/libs/proto ./apps/api-v2/libs/proto

# Copy service-specific files
COPY apps/api-v2/services/projects-service/package.json ./apps/api-v2/services/projects-service/
COPY apps/api-v2/services/projects-service/tsconfig*.json ./apps/api-v2/services/projects-service/
COPY apps/api-v2/services/projects-service/nest-cli.json ./apps/api-v2/services/projects-service/
COPY apps/api-v2/services/projects-service/src ./apps/api-v2/services/projects-service/src

# Install pnpm
RUN npm install -g pnpm@8.15.6

# Install dependencies and build
RUN pnpm install --no-frozen-lockfile
RUN cd apps/api-v2/services/projects-service && pnpm run build

# ==========================================
# PRODUCTION STAGE
# ==========================================
FROM node:18-slim AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.6

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
COPY --from=builder /workspace/apps/api-v2/services/projects-service/package.json ./apps/api-v2/services/projects-service/
COPY --from=builder /workspace/apps/api-v2/services/projects-service/dist ./apps/api-v2/services/projects-service/dist

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

# Set working directory to service folder
WORKDIR /app/apps/api-v2/services/projects-service

# Start the application
CMD ["node", "dist/main"]

# Expose Projects Service port
EXPOSE 3342