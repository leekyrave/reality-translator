# INSTALL.md
- [Docker](https://www.docker.com/) and Docker Compose

---

## Installation

### 1. Configure environment variables

Copy the example environment files for both the backend and frontend:

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
cd ..
```

> Open each `.env` file and fill in the required values (database credentials, API keys, ports, etc.) before proceeding.

---

### 2. Start Docker services

From the project root, bring up all Docker containers:

```bash
npm run compose:up
```

This will start all services defined in `docker-compose.yml` (database, Redis, etc.).

---

### 3. Run database migrations

Once the containers are up and the database is ready, apply the latest migrations:

```bash
cd backend && npm run migration:up
```

---

## Quick start (copy-paste)

```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env
cd ..
npm run compose:up
cd backend && npm run migration:up
```