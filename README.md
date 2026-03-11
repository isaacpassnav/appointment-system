# PWS3 - Sistema de Agenda de Citas (MVP Profesional)

## Estado del proyecto
Este proyecto se rehace desde cero en un nuevo repositorio para construir una base robusta y escalable.

### Que reutilizamos del proyecto anterior
- Idea de negocio y objetivo del producto.
- Historias de usuario base (registro, login, agendar, cancelar).
- Referencia conceptual de separar responsabilidades.

### Que NO reutilizamos
- Logica en memoria sin base de datos.
- Modelos actuales de citas con inconsistencias.
- Auth y manejo de errores del backend anterior.

## Vision del producto
Construir una plataforma para gestionar citas de forma simple para negocio y cliente final, reduciendo no-shows y automatizando comunicaciones.

## Objetivo del MVP
Entregar una primera version estable que permita:
- Registrar y autenticar usuarios.
- Agendar, consultar, cancelar y reagendar citas.
- Notificar por email y enviar recordatorios automaticos.
- Mejorar asistencia del cliente con enlace a calendario.

## Alcance funcional del MVP
1. Registro e inicio de sesion.
2. Agenda de citas con validacion de conflictos.
3. Confirmacion de cita por email.
4. Recordatorio automatico 24h antes.
5. Cancelacion y reagendamiento.
6. Enlace para agregar al calendario (ICS).
7. Panel admin basico con estado de citas.

## Stack recomendado

### Backend
- Runtime: Node.js LTS.
- Framework: NestJS (API) con adaptador Fastify.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Cola de trabajos: Redis + BullMQ.
- Auth: JWT (access + refresh) + roles basicos.
- Documentacion: Swagger/OpenAPI.
- Observabilidad: logs estructurados + trazabilidad.

### Frontend
- Framework: Next.js (App Router) + TypeScript.
- UI: Tailwind CSS + libreria de componentes reutilizables.
- Estado servidor: TanStack Query.
- Formularios: React Hook Form + Zod.
- Estado local ligero: Zustand (solo cuando haga falta).
- Tabla/calendario: componentes modulares por dominio.

## Arquitectura objetivo

### Servicios
- `api-service`: endpoints y reglas de negocio.
- `worker-service`: recordatorios, colas y reintentos.
- `postgres`: fuente de verdad.
- `redis`: jobs diferidos, cache y rate limiting.

### Frontend por modulos
- `auth`: login, registro, recuperacion.
- `appointments`: crear, listar, cancelar, reagendar.
- `calendar`: vista diaria/semanal y disponibilidad.
- `admin`: panel de control y metricas.
- `profile`: datos del usuario y preferencias de notificacion.

## Plan de frontend (MVP)
1. Pantallas base: login, registro, dashboard.
2. Flujo de reserva paso a paso (fecha, hora, confirmacion).
3. Vista de mis citas con filtros por estado.
4. Acciones de cancelar/reagendar con feedback claro.
5. Vista responsive para mobile-first.
6. Estados UX completos: loading, empty, error y success.

## Integraciones planificadas
- Email transaccional para confirmaciones y recordatorios.
- WhatsApp (fase siguiente) para notificaciones.
- Google/Microsoft Calendar (fase siguiente) con OAuth.

## Seguridad y calidad
- Validaciones estrictas en backend y frontend.
- Manejo de errores consistente y trazable.
- Idempotencia en operaciones criticas.
- Control de permisos por rol.
- Proteccion de rutas privadas en frontend.
- Rate limiting y auditoria de eventos.

## Backend status (actual)
- Auth JWT (access + refresh) operativo.
- Endpoints de citas (`create/list/findOne/cancel`) operativos con validacion de conflictos.
- Rate limiting por categoria de ruta (`auth`, `public`, `private`) activo.
- Idempotencia para crear cita via `x-idempotency-key` (cache en memoria, MVP).
- Multi-tenant core listo (modelos `Tenant/TenantMember`, JWT con `tenantId` y queries scoping).
- Pendiente hardening: enforcement global de `tenantId` via middleware Prisma.
- Swagger disponible en `/api/docs` con contratos request actualizados.
- Seed de datos demo disponible para acelerar integracion frontend.

### Comandos backend utiles
```bash
# levantar infraestructura local
npm run infra:up

# api + worker (en terminales separadas o con concurrently)
npm run dev:api
npm run dev:worker
npm run dev

# prisma
npm run db:generate
npm run db:migrate:deploy
npm run db:studio
npm run db:seed
```

## Testing recomendado

### Backend
- Unit tests en servicios y casos de negocio.
- Integration tests para DB y colas.
- E2E de endpoints criticos (auth + citas).

### Frontend
- Unit tests en componentes y hooks.
- Integration tests en formularios y flujos de agenda.
- E2E (Playwright) para login, crear cita y cancelacion.

## CI/CD recomendado
- Pipeline de lint + test + build en cada pull request.
- Entorno staging para validacion previa.
- Deploy automatico por rama principal.

## Metricas de negocio a seguir
- Tasa de no-show.
- Tasa de cancelacion.
- Tiempo promedio entre reserva y cita.
- Entregabilidad de notificaciones.
- Tasa de conversion en flujo de reserva.

## Roadmap de alto nivel
1. Fundacion backend (auth, DB, agenda).
2. Worker de notificaciones y recordatorios.
3. Frontend MVP conectado al backend.
4. Hardening (tests, seguridad, observabilidad).
5. Integraciones externas (calendar y WhatsApp).

## No objetivos del MVP
- Microservicios completos desde el dia 1.
- Agentes IA autonomos sin control.
- Multi-tenant avanzado en primera entrega.

## Decision actual
Se continua con nuevo repositorio y reconstruccion completa, cubriendo backend y frontend con enfoque MVP profesional.
