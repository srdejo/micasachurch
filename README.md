# micasachurch — Mi Casa Church

Sitio web para Mi Casa Church, una iglesia en Ocaña, Norte de Santander, Colombia. Proyecto sencillo: un solo tenant, un solo administrador.

Tres partes:

- `backend/` — API en Java + Spring Boot.
- `frontend-landing/` — sitio público en Angular (SSR).
- `frontend-admin/` — panel administrativo en Angular (SPA).

## Stack

- **Backend**: `backend/` — Java 21, Spring Boot 3.4.x, Gradle multi-módulo (Groovy DSL), Spring Data JPA + Hibernate, Flyway, PostgreSQL.
- **Frontend**: Angular 22, standalone components, signals, Tailwind CSS v4.
- Sin multitenancy, sin roles complejos — un único `AdminUser` sembrado.

## Documentación

- `CLAUDE.md` — reglas de trabajo y convenciones de código (léelo antes de tocar código).
- `docs/ARCHITECTURE.md` — cómo está construido hoy.
- `docs/DECISIONS.md` — decisiones técnicas tomadas y por qué.
- `docs/ROADMAP.md` — etapas hacia el MVP.
- `docs/PROGRESS.md` — estado actual, bloqueos conocidos.
- `docs/DEPLOYMENT.md` — estado del despliegue (config preparada, VPS aún no provisionado).

## Desarrollo local

```bash
cd backend
./gradlew.bat bootRun --continuous
```

```bash
cd frontend-landing
npm install
npm start
```

```bash
cd frontend-admin
npm install
npm start
```
