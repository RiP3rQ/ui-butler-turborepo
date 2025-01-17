# Build Commands

# ===========================================

# Build the image

docker build -f apps/api-v2/services/analytics-service/Dockerfile -t analytics-service .

# Build with no cache (force rebuild)

docker build --no-cache -f apps/api-v2/services/analytics-service/Dockerfile -t analytics-service .

# Build with a specific tag/version

docker build -f apps/api-v2/services/analytics-service/Dockerfile -t analytics-service:1.0.0 .

# Run Commands

# ===========================================

# Run in development mode

docker run -p 3347:3347 \
-e DATABASE_URL="your_database_url" \
-e ANALYTICS_SERVICE_HOST="0.0.0.0" \
-e ANALYTICS_SERVICE_PORT="3347" \
--name analytics-service \
--rm \
-d \
analytics-service

# Run in production mode with automatic restart

docker run -p 3347:3347 \
-e DATABASE_URL="your_database_url" \
-e ANALYTICS_SERVICE_HOST="0.0.0.0" \
-e ANALYTICS_SERVICE_PORT="3347" \
--name analytics-service \
--restart unless-stopped \
-d \
analytics-service

# Monitoring Commands

# ===========================================

# View logs

docker logs analytics-service

# Follow logs in real-time

docker logs -f analytics-service

# View container status

docker ps

# View all containers (including stopped)

docker ps -a

# View container details (config, network, etc)

docker inspect analytics-service

# View container resource usage

docker stats analytics-service

# Management Commands

# ===========================================

# Stop the container

docker stop analytics-service

# Start a stopped container

docker start analytics-service

# Restart the container

docker restart analytics-service

# Remove the container

docker rm analytics-service

# Remove container and its volumes

docker rm -v analytics-service

# Remove all stopped containers

docker container prune

# Image Management

# ===========================================

# List all images

docker images

# Remove the image

docker rmi analytics-service

# Remove unused images

docker image prune

# Remove all unused images (including unused dependencies)

docker image prune -a

# Debugging Commands

# ===========================================

# Execute shell inside running container

docker exec -it analytics-service sh

# Copy files from container

docker cp analytics-service:/app/dist ./dist

# View container environment variables

docker exec analytics-service env

# Check container health

docker inspect --format='{{json .State.Health}}' analytics-service

# Cleanup Commands

# ===========================================

# Stop and remove container

docker rm -f analytics-service

# Clean all unused containers, networks, images

docker system prune

# Clean everything including volumes

docker system prune -a --volumes

# Development Helpers

# ===========================================

# Build and run in one command

docker-compose up --build

# Rebuild and restart single service

docker-compose up -d --no-deps --build analytics-service

# View container logs with timestamp

docker logs -f --timestamps analytics-service
