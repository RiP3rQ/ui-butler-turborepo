# UI Butler Microservices Architecture

## Overview

UI Butler is a microservices-based application that provides UI component generation and management capabilities. The
system is built using NestJS and follows a microservices architecture pattern.

## Architecture

The application consists of the following microservices:

- **API Gateway** (Port: 3333)

  - Main entry point for all client requests
  - Handles request routing and authentication
  - Provides API documentation

- **Auth Service** (Port: 3346)

  - Handles authentication and authorization
  - Manages JWT tokens
  - Supports OAuth providers (Google, GitHub)

- **Users Service** (Port: 3341)

  - Manages user accounts and profiles
  - Handles user preferences

- **Analytics Service** (Port: 3347)

  - Collects and processes usage analytics
  - Provides reporting capabilities

- **Billing Service** (Port: 3345)

  - Handles subscription management
  - Processes payments
  - Manages billing-related operations

- **Components Service** (Port: 3344)

  - Manages UI component templates
  - Handles component generation

- **Execution Service** (Port: 3343)

  - Executes component generation tasks
  - Manages task queue

- **Projects Service** (Port: 3342)

  - Manages user projects
  - Handles project configurations

- **Workflows Service** (Port: 3340)
  - Manages automation workflows
  - Handles workflow execution

Production Deployment

# Build Docker images

docker-compose build

# Start services

docker-compose up -d

# Start monitoring stack

docker-compose -f docker-compose.monitoring.yml up -d

# Service Ports

Service Port Description

API Gateway 3333 Main API entry point

Auth Service 3346 Authentication service

Users Service 3341 User management

Analytics Service 3347 Usage analytics

Billing Service 3345 Subscription management

Components Service 3344 UI component management

Execution Service 3343 Task execution

Projects Service 3342 Project management

Workflows Service 3340 Workflow automation

# Monitoring

Service Port Description

Grafana 3009 Metrics visualization

Prometheus 9090 Metrics collection

Node Exporter 9100 System metrics

# Documentation

API Documentation: http://localhost:3333/api-docs

Monitoring Dashboard: http://localhost:3009
