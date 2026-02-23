# Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 16+
- Required environment variables:
  - `DATABASE_URL`
  - `PORT` (optional, default `3000`)
  - `LOG_LEVEL` (optional)

## Local Deployment

1. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

2. Build the project:

   ```bash
   pnpm run build
   ```

3. Run quality checks:

   ```bash
   pnpm run lint
   pnpm run format:check
   pnpm run test
   ```

4. Start the service:

   ```bash
   pnpm run start
   ```

5. Verify health and docs:

   - API base: `http://localhost:3000/api/v1`
   - Swagger UI: `http://localhost:3000/api-docs`
   - OpenAPI JSON: `http://localhost:3000/api-docs/openapi.json`

## Docker Deployment

1. Build image:

   ```bash
   docker build -t learning-nodejs:latest .
   ```

2. Run container:

   ```bash
   docker run --rm -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/user_crud_db" \
     -e NODE_ENV=production \
     learning-nodejs:latest
   ```

3. Confirm app is running:

   ```bash
   curl http://localhost:3000/api-docs/
   ```

## CI/CD Expectations

The workflow in `.github/workflows/ci.yml` validates on each push and pull request:

- Linting
- Formatting
- Unit tests with coverage
- E2E tests
- Build

Any deployment pipeline should only promote builds after this workflow passes.