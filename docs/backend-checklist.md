# Backend Closure Checklist

## 1) Foundation
- [x] Monorepo with `apps/api` and `apps/worker`
- [x] NestJS API bootstrapped with global validation pipe
- [x] Swagger enabled at `/api/docs`
- [x] Health endpoint implemented at `/api/health`
- [x] Root scripts for lint/test/build/dev

## 2) Database and ORM
- [x] Prisma schema defined (`User`, `Appointment`, `NotificationLog`)
- [x] Prisma client generation working
- [x] Initial migration created: `prisma/migrations/202602241230_init/migration.sql`
- [x] Migration applied successfully on Session Pooler
- [x] `prisma migrate status` reports database up to date

## 3) Core API Modules
- [x] `users` module implemented (`create`, `findAll`, `findOne`)
- [x] `appointments` module implemented (`create`, `findAll`, `findOne`, `cancel`)
- [x] Conflict validation for overlapping appointments
- [x] DTO validation with `class-validator`

## 3.5) Multi-tenant Core
- [x] Tenant + membership models (`Tenant`, `TenantMember`)
- [x] `tenantId` enforced in appointments/notifications
- [x] JWT includes `tenantId` + `tenantRole`
- [x] Tenant-scoped queries for users and appointments
- [ ] Prisma-level tenant enforcement (middleware or policy layer)

## 4) Environments and Security Basics
- [x] Real secrets isolated in `.env` files
- [x] `.env` files ignored by git
- [x] `.env.example` files sanitized (no real credentials)
- [x] Supabase URL/keys and DB variables explicitly documented in env templates

## 5) Quality Gates
- [x] `npm run db:generate` passing
- [x] `npm run lint` passing
- [x] `npm run build` passing
- [x] `npm test` passing

## 6) Blockers Before Calling Backend "Production-Ready"
- [x] Authentication module (JWT access + refresh) with hashed credentials
- [x] Authorization guards (JWT access guard on protected routes)
- [x] Unified error format/exception filter
- [x] Request correlation ID (`x-request-id`)
- [x] Rate limiting by route category (auth/public/private)
- [x] Idempotency for appointment creation (client request key)
- [x] Worker job processors (confirmation + reminders)
- [x] Email provider integration (Brevo SMTP principal + fallback a Resend + fallback directo si falla queue)
- [ ] WhatsApp provider integration (optional for MVP scope)
- [ ] Contract tests/e2e for users and appointments routes
- [x] Notification delivery metrics endpoint (`GET /api/notifications/metrics`)
- [x] Dead-letter queue explicita (`notifications-dead-letter`) en fallo final

## 7) Minimal "Ready for Frontend" Definition
Implemented to start frontend integration:
- [x] Auth endpoints (`signup`, `signin`, `refresh`, `logout`)
- [x] User profile endpoint (`GET /api/auth/me`)

Still pending before production hardening:
- [ ] Appointment create/list/cancel integration tests
- [x] OpenAPI docs aligned with real request contracts
- [x] Seed script with demo data for frontend development

## 8) Commands
```bash
# API
npm run dev:api

# Worker
npm run dev:worker

# Prisma
npm run db:generate
npm run db:migrate:deploy
npm run db:studio
npm run db:seed
```

## Notes
- Current idempotency implementation uses in-memory cache keyed by `tenantId` + `userId` + `x-idempotency-key`.
- For horizontal scaling, migrate idempotency storage to Redis/PostgreSQL unique key strategy.
- Appointment creation now enqueues:
  - confirmation email (immediate)
  - reminder 24h before (delayed job)
  - reminder 1h before (delayed job)
- Appointment email jobs now create/update `NotificationLog` (`QUEUED` -> `SENT` / `FAILED`).
