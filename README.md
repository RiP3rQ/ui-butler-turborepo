# 🎨 UI-Butler 🤵

# Advanced Full-Stack Monorepo Architecture with Nest.js (Microservices) & Next.js (Frontend Microservices)

## 📚 Educational Repository Overview

This repository serves as a **comprehensive educational resource demonstrating** a **production-ready**, full-stack
monolithic architecture using **Nest.js microservices** and **Next.js Frontend Microservices** within a **Turborepo** as
a
meneger. It showcases **industry best practices**, advanced architectural patterns, and modern development workflows.

### 🎯 Purpose

- Provide a complete reference implementation of microservices architecture
- Demonstrate real-world patterns and best practices
- Serve as a learning resource for developers at all levels
- Showcase advanced features and integrations
- Illustrate various deployment strategies

### 🏗️ Architecture Overview

```mermaid
graph TD
    MF1[Auth Frontend Microservice] <--> Gateway[API Gateway]
    MF2[Main App Frontend Microservice] <--> Gateway[API Gateway]
    Gateway <--> auth-microservice
    Gateway <--> analytics-microservice
    Gateway <--> billing-microservice
    Gateway <--> components-microservice
    Gateway <--> executions-microservice
    Gateway <--> projects-microservice
    Gateway <--> users-microservice
    Gateway <--> workflows-microservice
    auth-microservice <--> users-microservice
    workflows-microservice --> executions-microservice
    MF3[Landing Page Frontend Microservice] --> MF1[Auth Frontend Microservice]
    MF1[Auth Frontend Microservice] --> MF2[Main App Frontend Microservice]
```

## 🚀 Key Features

### Backend Architecture

- **Microservices Framework**: Nest.js-based services with modular architecture
- **Inter-Service Communication**: gRPC protocol implementation
- **Caching System**: Custom Redis-based caching implementation
- **Authentication**: JWT and Passport.js integration
- **Rate Limiting**: Redis-based request rate limiting
- **Job Processing**: BullMQ integration for async
  operations [recomended only for dev because of large amount of redis calls in production]
- **AI Integration**: `GEMINI` AI response streaming
- **Workflow Management**: Custom AI workflow handling for planning the execution
- **Microservices proxing**: Implementing proxing from API-GATEWAY to components microservice
- **Hybrid backend microservice**: Generated a Nest.js app that is a hybrid application. It serves as an HTTP server and
  as a microservice.
- **Containerization**: Containerizing microservices with docker and docker-compose

### Frontend Implementation

- **Frontend Microservices**: Next.js-based modular frontend architecture
- **SSE**: Showcased how to handle Server-Sent Events on the frontend and backend for instantaneous streaming the AI
  responses
- **Workflow Visualization**: React-flow implementation
- **State Management**: Advanced state management patterns
- **API Integration**: Comprehensive API service integration

## 🛠️ Technology Stack

- **Monorepo Management**: Turborepo
- **Backend Framework**: Nest.js
- **Frontend Framework**: Next.js
- **Language**: TypeScript
- **Communication**: gRPC, REST
- **Caching**: Redis
- **Queue**: BullMQ
- **Database**: PostgreSQL
- **Testing**: Jest
- **Deployment**: Docker, PM2, turbo
- **CI/CD**: GitHub Actions
- **Auth**: JWT, passport.js

## 📦 Repository Structure

```
├── apps/
│   ├── api/ (deprecated -> monolith nest.js app)
│   ├── api-v2/
│   │   ├── libs/
│   │   │   ├── common/
│   │   │   ├── database/
│   │   │   ├── proto/
│   │   │   └── redis/
│   │   ├── services/
│   │   │   ├── analytics-service/
│   │   │   ├── api-gateway/
│   │   │   ├── auth-service/
│   │   │   ├── billing-service/
│   │   │   ├── components-service/
│   │   │   ├── execution-service/
│   │   │   ├── projects-service/
│   │   │   ├── users-service/
│   │   │   └── workflows-service/
│   │   └── README.md
│   ├── web/
│   ├── web-auth/
│   └── web-landing-page/
│
└── packages/
    ├── config-eslint/
    ├── config-tailwindcss/
    ├── config-typescript/
    ├── prompts/
    ├── tasks-registry/
    ├── types/
    └── ui/
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 22
- Docker
- Redis (Upstash)
- PostgreSQL
- pnpm
- `GEMINI` API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RiP3rQ/ui-butler-turborepo.git
   cd ui-butler-turborepo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables for backend microservice and frontend microservice:

   ```bash
   cp .env.example .env
   ```

4. Start development environment:
   ```bash
   pnpm dev
   ```

## 🚢 Deployment Strategies

### 1. Docker Deployment

Detailed documentation for containerized deployment:

- Container orchestration
- Service configuration
- Network setup
- Automatic deployment using Github Actions

### 2. PM2 Ecosystem

Guide for PM2-based deployment:

- Process management
- Ecosystem handling
- Automatic deployment using Github Actions

### 3. Turborepo with PM2

Advanced deployment strategy combining:

- Build optimization
- Service orchestration
- Resource management
- Performance tuning
- Automatic deployment using Github Actions

## 🧪 Testing

- Service-level test examples
- Component testing strategies
- Mocking patterns
- Test coverage requirements

## 📈 Performance Optimization

- Turborepo caching strategies
- Build optimization techniques
- Service performance tuning
- Caching implementation
- Rate limiting implementation
- Asynchronous processing of workflows using BullMQ

## 🔒 Security Implementations

- JWT authentication
- Rate limiting
- CORS configuration
- Form validation
- Security headers
- SSL/TLS setup

## 🤝 Contributing

We welcome contributions! If you have any tips how to improve this repo, just create a PR.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Maintainers

- [RiP3rQ](https://github.com/RiP3rQ)

---

## 💡 Support

For support, please:

1. Create an issue
2. Contact me through my website -> [Website](https://riperq.pro/)
