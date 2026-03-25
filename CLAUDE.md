# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppointmentIO is a multi-tenant SaaS appointment scheduling system with AI automation.

**Stack:**
- **Backend API:** NestJS + Fastify + Prisma + PostgreSQL (Supabase), port 3000
- **Worker:** NestJS + BullMQ + Redis (Upstash), port 3001
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui, port 3002
- **Monorepo:** npm workspaces with `apps/*` structure

## Common Commands

**Development (from root):**
```bash
npm run infra:up          # Start PostgreSQL + Redis via Docker
npm run dev               # Run API + Worker concurrently
npm run dev:api           # Run only API (port 3000)
npm run dev:worker        # Run only Worker (port 3001)
npm run dev:web           # Run only Frontend (port 3002)
npm run dev:all           # Run API + Worker + Web
```

**Database:**
```bash
npm run db:generate       # Generate Prisma client
npm run db:migrate:dev    # Run migrations in dev mode
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:seed           # Seed demo data
npm run db:studio         # Open Prisma Studio
```

**Testing:**
```bash
npm run test              # Run all tests
npm run test -w apps/api  # Run API tests only
npm run test:watch -w apps/api  # Watch mode
npm run test:cov -w apps/api    # Coverage report
```

**Linting:**
```bash
npm run lint              # Lint all apps
```

**Build:**
```bash
npm run build             # Build all apps
npm run build -w apps/api
npm run build -w apps/web
```

## Architecture

### Multi-Tenancy Model

The system uses a **single-database, tenant-isolated** approach:

- Every table has a `tenantId` column (UUID)
- `TenantGuard` automatically extracts `tenantId` from JWT payload and attaches it to request context
- API routes receive `tenantContext` with `tenantId`, `userId`, `globalRole`, `tenantRole`, `bypassTenancy`
- Superadmins can bypass tenancy checks with `bypassTenancy: true`
- Tenant override via `x-tenant-id` header (only for superadmins)

**Key Files:**
- `apps/api/src/common/guards/tenant.guard.ts` - Extracts and validates tenant context
- `apps/api/src/common/interfaces/request-tenant-context.interface.ts` - Context type definition

### Authentication Flow

**Backend:**
- JWT access + refresh tokens
- Access token expiry: 15 minutes (configurable)
- Refresh token expiry: 7 days
- Email verification required before login
- Passwords hashed with bcrypt
- Role hierarchy: SUPERADMIN > RESELLER > ADMIN > STAFF > CLIENT

**Frontend:**
- Tokens stored in localStorage under key `appointment-system-auth`
- Automatic token refresh on 401 responses via `AuthProvider`
- `withAccessToken` helper for authenticated API calls
- Protected routes check `useAuth()` status

**Key Files:**
- `apps/api/src/modules/auth/` - Auth module (signup, signin, verify, refresh)
- `apps/web/providers/auth-provider.tsx` - React auth context with auto-refresh
- `apps/web/lib/api.ts` - API client with error handling

### API Structure

NestJS modules in `apps/api/src/modules/`:
- `auth/` - Authentication & authorization
- `users/` - User management
- `appointments/` - CRUD with tenant isolation
- `notifications/` - Queue jobs for reminders
- `mail/` - Email templates and sending (SMTP + Resend fallback)

**Global Middleware:**
- `helmet()` - Security headers
- `requestIdMiddleware` - Request correlation IDs
- `ValidationPipe` - Auto-validation with class-validator
- `HttpExceptionFilter` - Consistent error responses

### Notification Queue (BullMQ)

Two deployment modes:
1. **Inline processor** (default for free tier): Jobs processed within API process
2. **Dedicated worker** (scalable): Separate `apps/worker` service

**Job Types:**
- `appointment-reminder-24h` - 24 hours before appointment
- `appointment-reminder-1h` - 1 hour before appointment
- `welcome-email` - New user signup
- `verify-email` - Email verification

**Key Files:**
- `apps/api/src/modules/notifications/notifications.processor.service.ts` - Inline processor
- `apps/worker/src/notifications/notifications.processor.ts` - Dedicated worker processor
- `apps/api/src/modules/notifications/notification-job.types.ts` - Job type definitions

### Frontend Structure

Next.js 15 App Router in `apps/web/app/`:
- `page.tsx` - Landing page with marketing sections
- `login/page.tsx` - Authentication
- `signup/page.tsx` - Registration
- `verify-email/page.tsx` - Email verification
- `dashboard/` - Tenant workspace
  - `layout.tsx` - Dashboard shell with sidebar navigation
  - `page.tsx` - Overview with appointments
  - `appointments/page.tsx` - Full appointment management
  - `settings/page.tsx` - User profile

**Design System:**
- Tailwind CSS with custom tokens in `globals.css`
- Breakpoints: 1023px (tablet), 900px, 767px (mobile), 479px
- Dark theme default
- shadcn/ui components in `components/ui/`

**Internationalization:**
- i18next with 3 languages: EN, ES, PT
- Translations in `apps/web/lib/i18n.ts`
- All UI text comes from translation keys

### Database Schema (Prisma)

**Core Models:**
- `User` - Authentication, profile, role
- `Tenant` - Business/organization isolation unit
- `TenantMember` - Many-to-many user-tenant relationship with roles
- `Appointment` - Scheduling core entity
- `NotificationLog` - Audit trail for notifications

**Key Relationships:**
- User → TenantMember → Tenant (hierarchical access)
- Tenant → Appointment[] (isolated data)
- Appointment → NotificationLog[] (reminder tracking)

**Enum Types:**
- `UserRole`: SUPERADMIN, RESELLER, ADMIN, STAFF, CLIENT
- `TenantRole`: BUSINESS_ADMIN, STAFF, CLIENT
- `AppointmentStatus`: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- `NotificationChannel`: EMAIL, WHATSAPP
- `NotificationStatus`: QUEUED, SENT, FAILED

## Environment Configuration

**Critical Variables:**
```bash
# API
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
REDIS_URL=redis://localhost:6379  # or rediss:// for Upstash
RESEND_API_KEY=...
FRONTEND_PUBLIC_BASE_URL=http://localhost:3002

# Web
NEXT_PUBLIC_API_BASE_URL=/api
API_PROXY_TARGET=http://localhost:3000/api
```

See `apps/api/.env.example` for complete list.

## Deployment

**Production Architecture:**
- **API:** Koyeb (or Railway/Render) - NestJS not serverless-compatible
- **Worker:** Koyeb (optional, can use inline processor)
- **Frontend:** Vercel (Root Directory: `apps/web`)
- **Database:** Supabase PostgreSQL
- **Redis:** Upstash
- **Email:** Resend (primary) with SMTP fallback

**CI/CD:**
- GitHub Actions in `.github/workflows/deploy.yml`
- Conditional deploys based on changed paths
- API/Worker changes → Koyeb deploy
- Web changes → Vercel deploy

## Code Patterns

**Backend:**
- Use `PrismaService` for database access (extends `@prisma/client`)
- Apply `@UseGuards(AccessTokenGuard)` for protected routes
- Use `@CurrentUser()` decorator to get authenticated user
- Always filter queries by `tenantId` for tenant-scoped entities
- Use `NotificationQueueService` to schedule reminder jobs

**Frontend:**
- Use `useAuth()` hook for authentication state
- Call API via `withAccessToken((token) => apiCall(token))` for auto-refresh
- Use `ApiError` class for error handling
- Components should use translation keys, never hardcoded text

**Database Queries:**
```typescript
// Always include tenant isolation
await this.prisma.appointment.findMany({
  where: { tenantId: context.tenantId }
});
```

## Known Issues & Workarounds

**React Version:**
Root `package.json` has `overrides` forcing React 19.2.4. If build fails with "Incompatible React versions", verify `apps/web/package.json` matches.

**Email Delivery:**
`onboarding@resend.dev` is restricted to test recipients. For production, verify a custom domain in Resend.

**Login 403 Error:**
Backend blocks login if `emailVerified=false`. Use `/auth/resend-verification` to retry.

**Free Tier Limitations:**
Koyeb free tier doesn't support multiple services. Use `NOTIFICATIONS_INLINE_PROCESSOR_ENABLED=true` to run worker within API process.