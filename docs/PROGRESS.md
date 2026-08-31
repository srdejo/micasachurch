# PROGRESS.md

Estado actual de `micasachurch`.

## Estado

**`micasachurch` está completo y en producción en su dominio final.** Backend y ambos frontends desplegados; Fase A (migrar `nolost`) y Fase B (liberar `micasachurch.co`) de `docs/DEPLOYMENT.md` ejecutadas y verificadas el 2026-08-31.

### Estado en vivo por subdominio (verificado 2026-08-31, después de la Fase B)

| Subdominio | Sirve | Estado |
|---|---|---|
| `micasachurch.co` / `www.micasachurch.co` | `frontend-landing` | ✅ funcionando — contenido real confirmado ("Mi Casa Church", "Bienvenido a...") |
| `api.micasachurch.co` | backend (`micasachurch.service`, puerto 8088) | ✅ funcionando — `GET /api/events` responde con datos seed reales, login admin devuelve JWT válido |
| `admin.micasachurch.co` | `frontend-admin` | ✅ funcionando — login end-to-end verificado en el navegador, incluyendo cambio de clave propio y gestión de otros admins |
| `nolost.micasachurch.co` | `nolost` (migrado, sin rebuild) | ✅ funcionando — mismo `dist` ya publicado, verificado con el título real de la app |
| `nolost-api.micasachurch.co` | backend de `nolost` (puerto 8080) | ✅ funcionando — responde en un endpoint protegido (403, esperado sin JWT) |

### Backend

- Dominio, aplicación e infraestructura completos para las 7 entidades (`Event`, `Network`, `PrayerRequest`, `ServiceSchedule`, `LinkEntry`, `SiteSettings`, `AdminUser`).
- Controladores REST: `PublicController` (endpoints públicos) + 6 controladores de administración + `AdminAuthController`.
- Módulo `bootstrap`: `MicasachurchApplication`, `application.yml`, `messages.properties`, migraciones Flyway `V1__church_schema.sql` (esquema) y `V2__church_seed.sql` (datos semilla).
- **Verificado en producción**: DB y rol Postgres creados en el VPS, migraciones Flyway corridas de punta a punta contra la base real, servicio `micasachurch.service` corriendo, `GET /api/events` y login admin responden correctamente desde `https://api.micasachurch.co`.

### `frontend-landing`

- Angular 22 + SSR (`@angular/ssr`), Tailwind v4 con paleta de marca (`cream`/`ink`/`terracotta`/`gold`).
- Página única (`pages/home`) con las 14 secciones pedidas, ruta `/devocional` con navegación por fecha y llamada directa a la API de Our Daily Bread.
- **Desplegado**: subido a `~/apps/micasachurch/frontend` vía `infra/deploy.ps1 -Projects micasachurch`. Sirviendo todavía en el dominio de nginx local del VPS (no accesible en `micasachurch.co` hasta la Fase B — hoy ese dominio sigue siendo de `nolost`).
- Brechas frente al mockup real (fidelidad visual, no funcionalidad) — ver `docs/ROADMAP.md` Etapa 8.

### `frontend-admin`

- Angular 22 SPA (sin SSR), login JWT (`AuthService` + `authGuard` + interceptor), sidebar de 268px + 6 vistas.
- **Desplegado y verificado en producción** en `https://admin.micasachurch.co` — login real con `admin`/`password` (placeholder, cambiar antes de ir a producción real) devuelve JWT y carga el panel.
- Subida manual (no automatizada en `infra/deploy.ps1` — ver `docs/DECISIONS.md`).

### Infra

- `PORTS.md`: fila para `micasachurch` (puerto 8088, ahora **en uso**, no solo reservado).
- `infra/deploy.ps1`: entrada `micasachurch` funcionando para backend + `frontend-landing` (`Deploy-All`). `frontend-admin` sigue siendo subida manual.
- DB, rol Postgres, unit systemd, vhosts nginx + SSL (Certbot, `--expand` sobre el certificado existente de `micasachurch.co`) para `api.micasachurch.co` y `admin.micasachurch.co`: **creados y verificados** en `nolost-vps`.
- `sudoers` de `srdejo` ampliado con `NOPASSWD: /usr/bin/systemctl restart micasachurch`.
- **`nolost` no se tocó** — sigue sirviendo `micasachurch.co` sin cambios, tal como estaba.

## Bug encontrado y corregido (2026-08-31)

Los dos frontends usaban `environment.ts` (con `apiUrl: http://localhost:8088/api`) incluso en el build de producción — a `angular.json` le faltaba el `fileReplacements` de `production` para sustituir por `environment.prod.ts`. Esto causaba que el login del admin fallara en el navegador (mostrando el mensaje genérico "Usuario o clave inválidos", aunque el backend funcionaba bien — confirmado con `curl` antes de encontrar la causa real). Corregido en ambos `angular.json`, rebuild y redeploy — verificado que el bundle desplegado ahora apunta a `https://api.micasachurch.co/api` y el login funciona end-to-end.

## Bloqueos o problemas conocidos

- Fotos reales de congregación/pastores no disponibles (el MCP de diseño limita descargas binarias a 256 KiB, las imágenes del mockup superan ese límite) — placeholders de color de marca hasta que el cliente suba fotos reales.
- Admin de imágenes con upload queda fuera de este MVP — vista "Enlaces" solo cubre enlaces/cuentas.
- **Password de admin sembrada (`admin`/`password`) sigue siendo el placeholder — ya está expuesta en un backend público real.** Cambiarla es la prioridad de seguridad más alta pendiente.
- `npm run test`/`ng test` no se corrió en ninguno de los dos frontends (fuera de alcance de la verificación pedida, que se limitó a build).
- Brechas de fidelidad visual frente al mockup — ver `docs/ROADMAP.md` Etapa 8 (devocional embebido inline en el home, indicador "en vivo", `<title>`/metadatos — ambos frontends siguen con el `<title>` default de Angular CLI, "FrontendLanding"/"FrontendAdmin", link del footer al admin).

## Próximo paso recomendado

1. Etapa 8 del roadmap: cerrar las brechas de fidelidad visual con el diseño (devocional inline en home es la más visible; `<title>` de ambos frontends es rápido y visible).
2. Cuando el cliente provea fotos reales, reemplazar los placeholders de color.
3. Confirmar `JWT_SECRET` real en el `.env` del VPS (no el placeholder de `application.yml`) — ver `docs/ROADMAP.md` Etapa 9.
