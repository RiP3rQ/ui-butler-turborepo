FROM node:18-slim AS builder

WORKDIR /workspace

# Copy service files first
COPY package.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install pnpm
RUN npm install -g pnpm@8.15.6

# Create .npmrc to handle packages
RUN echo "node-linker=hoisted\nshamefully-hoist=true\nstrict-peer-dependencies=false" > .npmrc

# Copy source code
COPY src/ ./src/

# Replace private workspace packages with public alternatives
RUN sed -i 's/"@app\/common": "workspace:\*"/"@nestjs\/common": "^10.0.0"/g' package.json && \
    sed -i 's/"@app\/database": "workspace:\*"/"@nestjs\/typeorm": "^10.0.0"/g' package.json && \
    sed -i 's/"@app\/proto": "workspace:\*"/"@grpc\/proto-loader": "^0.7.0"/g' package.json && \
    sed -i 's/"@repo\/types": "workspace:\*"/"@types\/node": "^20.0.0"/g' package.json && \
    sed -i 's/"@repo\/typescript-config": "workspace:\*"/"typescript": "^5.0.0"/g' package.json && \
    sed -i 's/"extends": "@repo\/typescript-config\/base.json"/"extends": "@tsconfig\/node18\/tsconfig.json"/g' tsconfig.json

# Install tsconfig base
RUN pnpm add -D @tsconfig/node18

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build the application
RUN pnpm run build

FROM node:18-slim AS runner

WORKDIR /app

# Copy necessary files
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/package.json ./

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]

# Expose gRPC port
EXPOSE 3347