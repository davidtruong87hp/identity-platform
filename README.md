# Identity Platform

A full-stack identity and authentication platform built as an [Nx](https://nx.dev) monorepo. It provides user registration, login, email verification, password reset, Google OAuth, profile management, and avatar uploads — backed by a microservice architecture with event-driven email notifications.

## Architecture

The monorepo is organised into three applications:

| Project | Path | Description |
|---|---|---|
| `identity` | `backend/identity-service` | NestJS REST API — auth, users, profiles, storage |
| `notification` | `backend/notification-service` | NestJS microservice — email delivery via RabbitMQ |
| `web` | `frontend/web` | Next.js 16 frontend |

### Tech Stack

**Frontend**
- Next.js 16, React 19, TailwindCSS
- TanStack Query, React Hook Form + Zod

**Backend**
- NestJS 11, Prisma ORM, PostgreSQL 17
- Passport.js (JWT + Google OAuth 2.0)
- RabbitMQ (AMQP) for async messaging
- MinIO (S3-compatible) for file storage

**Tooling**
- Nx 22 monorepo with pnpm
- Docker Compose for local infrastructure
- Playwright (e2e) + Jest (unit)

## Features

- Email/password registration with email verification
- Login with JWT access & refresh tokens
- Google OAuth 2.0 sign-in
- Forgot password / password reset flow
- User profile management with avatar uploads
- Transactional email notifications (Nodemailer + Mailpit in dev)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment variables

Each service ships an `.env.example` file. Copy and adjust them:

```sh
cp backend/identity-service/.env.example backend/identity-service/.env
cp backend/notification-service/.env.example backend/notification-service/.env
# Web uses .env.local — see frontend/web/.env.local
```

Key variables for the identity service:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `RABBITMQ_URL` | RabbitMQ AMQP connection URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `S3_*` | MinIO / S3 storage credentials |

### 3. Start infrastructure

```sh
make up
```

This starts all Docker Compose services (databases, RabbitMQ, MinIO, Mailpit, and the apps themselves).

### 4. Run database migrations

```sh
make identity-migrate
```

## Service URLs (dev)

See [`ports.md`](ports.md) for the full port registry.

| Service | URL |
|---|---|
| Web app | http://localhost:3004 |
| Identity API | http://localhost:3002 |
| RabbitMQ UI | http://localhost:15673 |
| Mailpit (email) | http://localhost:8025 |
| MinIO Console | http://localhost:9001 |

## Development

### Running tasks with Nx

```sh
# Serve an app locally (outside Docker)
pnpm nx serve identity
pnpm nx serve web

# Build
pnpm nx build identity

# Lint
pnpm nx lint identity

# Run unit tests
pnpm nx test identity
```

### Useful Make targets

```sh
make up                  # Start all services
make down                # Stop all services
make logs                # Tail logs
make rebuild             # Rebuild and restart Docker images
make reset               # Full reset (wipe volumes, rebuild, start)
make identity-migrate    # Run Prisma migrations
make identity-studio     # Open Prisma Studio
make test                # Run all unit + e2e tests
make test-fresh          # Rebuild + full test run from scratch
```

## Testing

### Unit tests

```sh
make identity-test
# or
pnpm nx test identity
```

### E2e tests

```sh
make identity-test-e2e
```

This resets the test database, runs migrations against it, and executes Playwright e2e tests against the dedicated `identity-service-test` container.

## Project Structure

```
identity-platform/
├── backend/
│   ├── identity-service/       # Auth & user management API
│   │   └── src/modules/
│   │       ├── auth/           # JWT, Google OAuth, token refresh
│   │       ├── user/           # User CRUD
│   │       ├── profile/        # Profile & avatar management
│   │       ├── notification/   # Publishes events to RabbitMQ
│   │       ├── storage/        # S3/MinIO file uploads
│   │       └── database/       # Prisma setup
│   └── notification-service/   # Email microservice
│       └── src/modules/
│           ├── mail/           # Nodemailer templates
│           └── notification/   # RabbitMQ consumer
├── frontend/
│   └── web/                    # Next.js app
│       └── src/app/
│           ├── (auth)/         # Login, register, verify-email, reset-password
│           └── profile/        # Profile page
└── docker-compose.yml
```
