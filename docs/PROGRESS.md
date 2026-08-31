# PROGRESS.md

Estado actual de `micasachurch`.

## Estado

Scaffolding completo del MVP: backend, ambos frontends y documentación. **Nada desplegado en producción** — ver `docs/DEPLOYMENT.md`.

### Backend

- Dominio, aplicación e infraestructura completos para las 7 entidades (`Event`, `Network`, `PrayerRequest`, `ServiceSchedule`, `LinkEntry`, `SiteSettings`, `AdminUser`).
- Controladores REST: `PublicController` (endpoints públicos) + 6 controladores de administración + `AdminAuthController`.
- Módulo `bootstrap`: `MicasachurchApplication`, `application.yml`, `messages.properties`, migraciones Flyway `V1__church_schema.sql` (esquema) y `V2__church_seed.sql` (datos semilla).
- **Verificado**: `cd backend && ./gradlew.bat build -x test` termina en `BUILD SUCCESSFUL`, genera `bootstrap/build/libs/bootstrap-0.0.1-SNAPSHOT.jar`. No se corrió contra una instancia real de Postgres (no hay una disponible en esta sesión) — las migraciones no se ejecutaron contra una base real, solo se verificó que el código compila y el jar se arma.

### `frontend-landing`

- Angular 22 + SSR (`@angular/ssr`), Tailwind v4 con paleta de marca (`cream`/`ink`/`terracotta`/`gold`).
- Página única (`pages/home`) con las 14 secciones pedidas, ruta `/devocional` con navegación por fecha y llamada directa a la API de Our Daily Bread.
- **Verificado**: `npx ng build` termina sin errores, genera bundles de browser + server y prerenderiza la ruta `/`.

### `frontend-admin`

- Angular 22 SPA (sin SSR), login JWT (`AuthService` + `authGuard` + interceptor), sidebar de 268px + 6 vistas.
- **Verificado**: `npx ng build` termina sin errores.

### Infra

- `PORTS.md`: fila agregada para `micasachurch` (puerto 8088, reservado, backend no desplegado); "próximo puerto libre" actualizado a 8089.
- `infra/deploy.ps1`: entrada `micasachurch` agregada siguiendo el patrón de `distriapp` (config preparada, sin provisionar), con `LandingFrontendPath`/`AdminFrontendPath` para los dos frontends; agregado al menú interactivo. Sintaxis validada con `[System.Management.Automation.Language.Parser]::ParseFile` → `OK`. **No se ejecutó ningún deploy real ni se tocó nada de `nolost`.**

## Bloqueos o problemas conocidos

- Fotos reales de congregación/pastores no disponibles (el MCP de diseño limita descargas binarias a 256 KiB, las imágenes del mockup superan ese límite) — placeholders de color de marca hasta que el cliente suba fotos reales.
- Admin de imágenes con upload queda fuera de este MVP — vista "Enlaces" solo cubre enlaces/cuentas.
- Password de admin sembrada es placeholder, debe cambiarse antes de producción.
- Migración de `nolost` a subdominio propio (`nolost.micasachurch.co` frontend, `nolost-api.micasachurch.co` backend) es tarea pendiente separada, NO ejecutada — requiere aprobación explícita del usuario por ser cambio de producción en DNS/nginx de un dominio real.
- El backend no se probó contra una instancia real de PostgreSQL en esta sesión (solo compilación/build) — las migraciones Flyway no se ejecutaron de punta a punta.
- `npm run test`/`ng test` no se corrió en ninguno de los dos frontends (fuera de alcance de la verificación pedida, que se limitó a build).

## Próximo paso recomendado

1. Levantar Postgres local (o usar `infra/setup.ps1`/`infra/start.ps1` del workspace) y correr las migraciones Flyway de punta a punta contra una base real.
2. Confirmar con el usuario el subdominio de `frontend-admin` (`admin.micasachurch.co`, inferido — ver `docs/DECISIONS.md`).
3. Cuando el cliente provea fotos reales, reemplazar los placeholders de color y evaluar si vale la pena un admin de imágenes con upload.
4. Aprovisionar el VPS (DB, nginx/SSL, systemd) solo cuando el usuario lo autorice explícitamente — ver `docs/ROADMAP.md` Etapa 7.
