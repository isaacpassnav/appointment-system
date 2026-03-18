# CI/CD Deployment Workflow

This repository uses GitHub Actions to orchestrate production deployments from `main`.

Workflow file:

- `.github/workflows/deploy.yml`

## What the workflow does

1. Detects changed paths:
   - Backend scope: `apps/api/**` and `apps/worker/**`
   - Frontend scope: `apps/web/**`
2. Validates the monorepo:
   - `npm ci`
   - `npm run lint` (only if script exists)
   - Typecheck backend: `npx tsc --noEmit -p apps/api/tsconfig.json`
   - Typecheck frontend: `npx tsc --noEmit -p apps/web/tsconfig.json`
3. Deploys backend on Koyeb if backend changed:
   - Redeploy API service
   - Redeploy Worker service
4. Runs backend health check (always after validation):
   - `GET $API_HEALTH_URL`
   - 15 retries, 20s interval, 10s timeout per attempt
5. Deploys frontend on Vercel if frontend changed and health check passed:
   - Triggers Vercel deploy hook

## Production branch

- `main` is production.
- Every push to `main` must pass validation before any deploy is triggered.

## Required GitHub Secrets

Set these in:

- GitHub repository -> `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

Required secrets:

1. `KOYEB_API_TOKEN`
2. `KOYEB_API_SERVICE_ID`
3. `KOYEB_WORKER_SERVICE_ID`
4. `API_HEALTH_URL`
5. `VERCEL_DEPLOY_HOOK`

## How to obtain each secret

### 1) KOYEB_API_TOKEN

- Koyeb dashboard -> Account -> API
- Create/copy token and store as `KOYEB_API_TOKEN`

### 2) KOYEB_API_SERVICE_ID

- Koyeb -> App -> API service -> Settings
- Copy service ID and store as `KOYEB_API_SERVICE_ID`

### 3) KOYEB_WORKER_SERVICE_ID

- Koyeb -> App -> Worker service -> Settings
- Copy service ID and store as `KOYEB_WORKER_SERVICE_ID`

### 4) API_HEALTH_URL

- Public URL to backend health endpoint, for example:
  - `https://<your-koyeb-service>.koyeb.app/health`
- Store as `API_HEALTH_URL`

### 5) VERCEL_DEPLOY_HOOK

- Vercel -> Project -> Settings -> Git -> Deploy Hooks
- Create a hook for production and copy the URL
- Store as `VERCEL_DEPLOY_HOOK`

## ASCII flow diagram

```text
push to main
    |
    +--> detect-changes (paths-filter)
    |
    +--> validate (npm ci + lint + typecheck api/web)
            |
            +--> deploy-backend (only if backend changed)
            |        |
            |        +--> redeploy API (Koyeb)
            |        +--> redeploy Worker (Koyeb)
            |
            +--> health-check (always after validate)
                     |
                     +--> retry GET API_HEALTH_URL up to 15 times
                     |
                     +--> deploy-frontend (only if frontend changed AND health passed)
                              |
                              +--> trigger Vercel deploy hook
```

## Notes

- If only backend changes: only Koyeb deploy is triggered.
- If only frontend changes: backend health is still verified before Vercel deploy.
- If both change: backend deploy happens first, then health check, then frontend deploy.
