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

### Git y DNS (2026-08-31)

- Repo `git@github.com:srdejo/micasachurch.git` creado por el usuario. Inicializado localmente, commit inicial con los 162 archivos del scaffold, y `git push -u origin main` hecho — ya está en GitHub.
- El usuario creó los 4 registros DNS (`micasachurch.co`/`api.micasachurch.co`/`admin.micasachurch.co`/`nolost.micasachurch.co`/`nolost-api.micasachurch.co`, resolviendo los 5 nombres — incluyendo el apex — a la misma IP del VPS, `207.38.88.222`). Confirmado por resolución DNS. **Ningún cambio del lado del servidor (nginx/SSL/systemd/DB) se hizo todavía** — el acceso SSH a `nolost-vps` está bloqueado por el clasificador de modo automático de esta sesión (ver "Bloqueos" abajo).
- Subdominio `admin.micasachurch.co` queda **confirmado** (ya no es una inferencia sin validar) — ver `docs/DECISIONS.md`.

## Bloqueos o problemas conocidos

- Fotos reales de congregación/pastores no disponibles (el MCP de diseño limita descargas binarias a 256 KiB, las imágenes del mockup superan ese límite) — placeholders de color de marca hasta que el cliente suba fotos reales.
- Admin de imágenes con upload queda fuera de este MVP — vista "Enlaces" solo cubre enlaces/cuentas.
- Password de admin sembrada es placeholder, debe cambiarse antes de producción.
- El backend no se probó contra una instancia real de PostgreSQL en esta sesión (solo compilación/build) — las migraciones Flyway no se ejecutaron de punta a punta.
- `npm run test`/`ng test` no se corrió en ninguno de los dos frontends (fuera de alcance de la verificación pedida, que se limitó a build).
- **Aprovisionamiento del VPS bloqueado por permisos de la sesión**: el DNS de los 4 subdominios ya existe (2026-08-31), pero esta sesión no tiene autorización para correr comandos SSH contra `nolost-vps` (el clasificador de modo automático lo bloquea explícitamente). Falta, todo del lado del servidor: crear DB `micasachurch` y su rol, unit systemd `micasachurch`, vhosts nginx + certificados SSL (certbot) para `micasachurch.co`, `api.micasachurch.co` y `admin.micasachurch.co`, y — la pieza de mayor impacto — migrar `nolost` de `micasachurch.co/api` a sus propios subdominios (`nolost.micasachurch.co` / `nolost-api.micasachurch.co`) antes de poder apuntar `micasachurch.co` al `frontend-landing` nuevo. Ver "Próximo paso recomendado" para el orden exacto.

## Próximo paso recomendado

Aprovisionamiento en `nolost-vps` (requiere una sesión con acceso SSH autorizado, o que el usuario ejecute los comandos), en este orden — no cambiar el orden, `nolost` debe migrar primero para no tumbar el sitio que hoy sirve `micasachurch.co`:

1. **Migrar `nolost` a sus subdominios propios primero** (para no dejar el dominio actual caído mientras se hace el corte): nuevo vhost nginx + SSL para `nolost.micasachurch.co` (frontend) y `nolost-api.micasachurch.co` (proxy al backend de `nolost`, puerto 8080), verificar que `nolost/frontend` apunte su `environment.vps.ts`/config de API a `nolost-api.micasachurch.co` en vez de `micasachurch.co/api`, redeploy de `nolost` con esa config, verificar que funciona en el nuevo subdominio.
2. Solo después de confirmar que `nolost` funciona en su subdominio nuevo: remover/reemplazar el vhost de `nolost` en `micasachurch.co` (el dominio raíz queda libre).
3. Aprovisionar `micasachurch`: crear DB + rol Postgres (`micasachurch`/`micasachurch`, agregar a `infra/postgres/init-databases.ps1` del workspace), unit systemd `micasachurch` (puerto 8088), vhosts nginx + SSL para `micasachurch.co` (→ `frontend-landing`), `api.micasachurch.co` (→ backend 8088), `admin.micasachurch.co` (→ `frontend-admin`).
4. Cambiar la contraseña del `AdminUser` sembrado (ver `docs/DECISIONS.md`) antes de exponer el admin públicamente.
5. `infra/deploy.ps1 -Projects micasachurch` para el primer deploy real, una vez el VPS esté provisionado.
6. Levantar Postgres local (o usar `infra/setup.ps1`/`infra/start.ps1` del workspace) y correr las migraciones Flyway de punta a punta contra una base real, antes o en paralelo a lo anterior.
7. Cuando el cliente provea fotos reales, reemplazar los placeholders de color y evaluar si vale la pena un admin de imágenes con upload.
