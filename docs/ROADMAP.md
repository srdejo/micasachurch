# ROADMAP.md

Etapas hacia el MVP de `micasachurch`.

## Etapa 1 — Backend: dominio y aplicación ✅

Entidades de dominio, puertos de repositorio y casos de uso para `Event`, `Network`, `PrayerRequest`, `ServiceSchedule`, `LinkEntry`, `SiteSettings`, `AdminUser`. Verificado: compila (`./gradlew compileJava`).

## Etapa 2 — Backend: infraestructura, controllers y bootstrap ✅

Adaptadores JPA completos para las 7 entidades, controladores REST públicos y de administración, `ChurchConfig` (wiring de beans), módulo `bootstrap` con `application.yml`, migraciones Flyway (schema + seed), `messages.properties`. Verificado: `./gradlew build -x test` genera el jar sin errores.

## Etapa 3 — `frontend-landing`: sitio público ✅

Angular 22 + SSR, Tailwind v4 con la paleta de marca. Página única con las 14 secciones especificadas, ruta `/devocional` con navegación por fecha. Verificado: `ng build` genera bundles (browser + server) sin errores.

## Etapa 4 — `frontend-admin`: panel administrativo ✅

Angular 22 SPA (sin SSR), login JWT, sidebar + 6 vistas (Panel, Eventos, Peticiones de oración, Redes, Horarios y en vivo, Enlaces). Verificado: `ng build` sin errores.

## Etapa 5 — Documentación ✅

`README.md`, `CLAUDE.md`, `LICENSE`, `docs/{ARCHITECTURE,DECISIONS,ROADMAP,PROGRESS,DEPLOYMENT}.md`.

## Etapa 6 — Infra: wiring y documentación (sin desplegar) ✅

`PORTS.md` actualizado (puerto 8088 reservado), `infra/deploy.ps1` con entrada `micasachurch` (config preparada, dos frontends), sintaxis validada. **No se tocó nada de `nolost`, ni DNS/nginx reales.**

## Etapa 7 — Aprovisionamiento real en el VPS (pendiente, no iniciada)

Cuando el usuario lo autorice: crear DB y rol en Postgres del VPS, vhosts nginx + SSL para `micasachurch.co`, `api.micasachurch.co` y `admin.micasachurch.co` (subdominio de admin sin confirmar todavía — ver `docs/DECISIONS.md`), unit systemd `micasachurch.service`, primer deploy real vía `infra/deploy.ps1 -Projects micasachurch`, y cambio de la contraseña de administrador sembrada (ver `docs/DEPLOYMENT.md`).

## Fuera de alcance de este MVP (documentado, no pendiente de ejecutar)

- Admin de imágenes con upload (grilla de fotos) — ver `docs/DECISIONS.md`.
- Migración de `nolost` a subdominio propio — tarea separada que requiere aprobación explícita del usuario, no relacionada con este proyecto salvo que comparte el dominio `micasachurch.co`.
