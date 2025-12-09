# Agri Sync Pro

Agri Sync Pro is a modular NestJS platform for coordinating agricultural operations. The project follows a strict feature-based architecture, enforces shared coding conventions, and exposes a consistent API response format suited for large, multi-team development.

## Project Structure

```
src/
  common/           # shared decorators, interceptors, guards, filters, pipes, utils
  config/           # configuration factories and environment validation
  modules/
    auth/           # auth flows (login/register)
    users/          # user management (controllers, DTOs, services, entities)
    products/       # catalog/product management
    health/         # health checks and uptime endpoints
  app.module.ts
  main.ts
```

Each module keeps its controllers, services, DTOs, and entities nearby to encourage clear ownership. Shared logic lives in `src/common`, and application bootstrap/customization stays out of `main.ts` via the `configureApp` helper.

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Copy env configuration**

   ```bash
   cp .env.example .env.development
   # update values as needed
   ```

3. **Run the API**

   ```bash
   pnpm run start:dev
   ```

4. **Swagger docs** are exposed at `http://localhost:<PORT>/api/docs`.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm run start`    | Start the compiled app                   |
| `pnpm run start:dev`| Start in watch mode                      |
| `pnpm run lint`     | Run ESLint with strict shared rules      |
| `pnpm run format`   | Format files with Prettier               |
| `pnpm run test`     | Run unit tests                           |
| `pnpm run test:e2e` | Run end-to-end tests                     |
| `pnpm run build`    | Compile TypeScript to `dist/`            |

## Environment Variables

The application never hardcodes secrets. Configuration is pulled from `.env.*` files through `@nestjs/config` and validated by `src/config/env.validation.ts`. Minimum requirements are captured in `.env.example`:

```
NODE_ENV=
APP_NAME=
PORT=
API_VERSION=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
SECURITY_API_KEY=
```

## Coding Standards

- **ESLint + Prettier + EditorConfig** keep formatting and linting consistent.
- `@typescript-eslint/no-explicit-any` ensures no `any` usage.
- `unused-imports` and `simple-import-sort` enforce deterministic imports with no dead code.
- DTOs leverage `class-validator`/`class-transformer`, and controllers never validate raw JSON.
- Shared API responses come from the response interceptor so every endpoint returns `{ status, message, data }`.

## API Defaults

- Global prefix: `/api`
- Versioning: URI-based (`/api/v1/...`)
- Response normalization & exception handling configured through global interceptors/filters.
- Helmet provides sensible security headers.
- Swagger is available behind `/api/docs` for easy discovery.
- Health checks are powered by `@nestjs/terminus`, exposing `/api/v1/health` with memory indicators.

## Branching & Git Flow

- `main` → production, `dev` → integration.
- Prefix feature branches with `feature/` and urgent fixes with `hotfix/`.
- Follow [Conventional Commits](https://www.conventionalcommits.org/): e.g., `feat: add user registration`.
- All work merges into `dev` via PR and must pass CI (lint, test, build) before reaching `main`.

## Testing Strategy

- Unit tests live alongside the relevant modules.
- `test/app.e2e-spec.ts` covers critical HTTP flows using the same bootstrap config as production.
- CI runs lint → unit tests → e2e tests (optional) → build to block regressions before merge.

## Documentation & Knowledge Sharing

Keep project docs, RFCs, and user guides inside the `docs/` directory. When introducing a new module or workflow, update both this README and the appropriate doc so other engineers can ramp up quickly.
