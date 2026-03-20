# AppointmentIO - SaaS de Gestion de Citas

Monorepo para un sistema SaaS multi-tenant de gestion de citas con automatizacion por IA.

## Stack

- Backend API: NestJS + Fastify + Prisma + JWT
- Worker: NestJS + BullMQ + Redis
- Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui
- DB: PostgreSQL (Supabase)
- Redis: Upstash (produccion)
- Email: Resend
- Deploy: Koyeb (api) + Vercel (web). Worker dedicado es opcional.

## Estructura del monorepo

- `apps/api`: API principal
- `apps/worker`: worker de colas/notificaciones
- `apps/web`: frontend
- `docs`: documentacion de soporte
- `.github/workflows`: CI/CD

## Estado actual del roadmap

### Fase 1 - Fundacion backend

- [x] 1.1 Deploy Koyeb funcionando
- [x] 1.2 Prisma Client generado en CI/CD
- [x] 1.3 Schema multi-tenant base con `tenantId`
- [x] 1.4 Tenant guard global activo
- [x] 1.5 Auth: signup, verify email, signin, refresh
- [x] 1.6 Resend: welcome email + verify email
- [x] 1.7 CRUD de citas con aislamiento por tenant
- [x] 1.8 Migrations aplicadas en Supabase produccion

### Fase 2 - Worker de notificaciones

- [x] Integracion BullMQ en API y Worker
- [x] Integracion Redis con Upstash (`rediss://`)
- [x] Fallback por variables `UPSTASH_REDIS_REST_*` si falta `REDIS_URL`
- [x] Modo free: processor inline en API (sin servicio worker dedicado)
- [ ] Recordatorios 24h y 1h antes
- [ ] Dead-letter queue con politica de reintentos avanzada

### Fase 3 - Frontend MVP

- [x] Landing + autenticacion conectada a API
- [x] Flujo base de login/registro/verificacion
- [x] Pagina visual de verificacion de email (`/verify-email`) con CTA a login
- [x] Landing con FAQ + bloque de dashboard visual animado
- [x] Seccion dinamica de integraciones (WhatsApp, Telegram, Email, Calendar, Payments)
- [x] Paginas de marketing para apartados del nav (`/[slug]`) sin rutas rotas
- [x] Tenant dashboard modular (`/dashboard/*`) con Overview, Appointments, Customers, Services, Automations, Messages, Analytics, Settings
- [ ] Dashboards completos por rol con datos reales
- [ ] Flujo completo de reserva, cancelacion y reagendamiento

## Avances recientes

- Health endpoint operativo en API (`/health`) para Koyeb y CI.
- Flujo de verificacion de correo en backend y frontend.
- Worker y API usando Redis de Upstash en produccion.
- Pipeline de deploy condicionado por cambios (`api/worker` vs `web`).
- Opcion de auditoria de correos agregada:
  - Variable `RESEND_AUDIT_EMAILS` para recibir copia BCC de correos salientes.

## Variables de entorno clave

### API (`apps/api`)

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_AUDIT_EMAILS` (opcional, lista separada por comas)
- `REDIS_URL` (recomendado)
- `UPSTASH_REDIS_REST_URL` (fallback)
- `UPSTASH_REDIS_REST_TOKEN` (fallback)
- `FRONTEND_PUBLIC_BASE_URL` (para links de verificacion amigables)
- `NOTIFICATIONS_INLINE_PROCESSOR_ENABLED` (`true` por defecto)
- `WORKER_CONCURRENCY` (concurrencia del processor inline)

### Worker (`apps/worker`)

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_AUDIT_EMAILS` (opcional)
- `REDIS_URL` (recomendado)
- `UPSTASH_REDIS_REST_URL` (fallback)
- `UPSTASH_REDIS_REST_TOKEN` (fallback)

### Web (`apps/web`)

- `NEXT_PUBLIC_API_BASE_URL`
- `API_PROXY_TARGET`

## Variables por plataforma (produccion)

### Koyeb - Servicio API

Configura en Koyeb > Service API > Environment Variables:

- `NODE_ENV=production`
- `DATABASE_URL=...`
- `DIRECT_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `REDIS_URL=rediss://...`
- `UPSTASH_REDIS_REST_URL=https://...upstash.io`
- `UPSTASH_REDIS_REST_TOKEN=...`
- `RESEND_API_KEY=...`
- `RESEND_FROM_EMAIL=onboarding@resend.dev` (o dominio verificado)
- `RESEND_AUDIT_EMAILS=tu-correo@dominio.com` (opcional)
- `FRONTEND_PUBLIC_BASE_URL=https://tu-frontend.vercel.app`
- `NOTIFICATIONS_INLINE_PROCESSOR_ENABLED=true`
- `WORKER_CONCURRENCY=5`
- `API_PUBLIC_BASE_URL=https://tu-api.koyeb.app`
- `VERIFY_EMAIL_URL_TEMPLATE=` (opcional)

### Koyeb - Servicio Worker (opcional)

Configura en Koyeb > Service Worker > Environment Variables:

- `NODE_ENV=production`
- `REDIS_URL=rediss://...`
- `UPSTASH_REDIS_REST_URL=https://...upstash.io`
- `UPSTASH_REDIS_REST_TOKEN=...`
- `RESEND_API_KEY=...`
- `RESEND_FROM_EMAIL=onboarding@resend.dev` (o dominio verificado)
- `RESEND_AUDIT_EMAILS=tu-correo@dominio.com` (opcional)
- `WORKER_CONCURRENCY=5`

Nota: si `RESEND_API_KEY` falta en Worker, los jobs de email se saltan.
Nota: en plan free puedes omitir este servicio y procesar todo desde API.

### Vercel - Frontend Web

Configura en Vercel > Project > Settings > Environment Variables:

- `NEXT_PUBLIC_API_BASE_URL=/api`
- `API_PROXY_TARGET=https://tu-api.koyeb.app/api`

Nota: `API_PROXY_TARGET` debe incluir `/api` al final.

## Troubleshooting rapido

- Error `403 Forbidden` al hacer login:
  - El backend bloquea login si `emailVerified=false`.
  - Reenviar verificacion: `POST /api/auth/resend-verification` con `{ "email": "..." }`.
- Warning en worker: `RESEND_API_KEY is not configured`:
  - Falta `RESEND_API_KEY` en el servicio Worker (Koyeb o `.env` local).
- No llegan correos de verificacion a usuarios finales:
  - Si usas `RESEND_FROM_EMAIL=onboarding@resend.dev`, Resend aplica restricciones de envio en modo prueba.
  - Para produccion real, verifica un dominio propio en Resend y usa un remitente de ese dominio.
- Si no puedes crear worker dedicado en Koyeb free:
  - Activa `NOTIFICATIONS_INLINE_PROCESSOR_ENABLED=true` en API y despliega solo API.

## Comandos utiles

```bash
# instalar dependencias (raiz)
npm ci

# desarrollo
npm run dev:api
npm run dev:worker
npm run dev:web
npm run dev:all

# build
npm run build -w apps/api
npm run build -w apps/worker
npm run build -w apps/web

# prisma
npm run db:generate
npm run db:migrate:dev
npm run db:migrate:deploy
npm run db:seed
```

## CI/CD

Workflow: `.github/workflows/deploy.yml`

Reglas:

- Cambios en `apps/api/**` o `apps/worker/**` -> deploy Koyeb.
- Cambios en `apps/web/**` -> deploy Vercel.
- Frontend se deploya solo si backend esta healthy.

## Siguiente paso recomendado

Implementar recordatorios diferidos (24h y 1h) en BullMQ con scheduler y confirmar trazabilidad de entrega por tenant.
