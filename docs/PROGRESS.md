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

## Deploy 2026-09-01

Commit `5252bf2` desplegado a producción: flujo de publicación con borradores (eventos/ministerios/contenido del sitio,
cola de cambios pendientes vía `PublishService`/`AdminPublishController`), recuperación de password del admin por email
(`ForgotPasswordUseCase`/`ResetPasswordUseCase`, tokens en `password_reset_tokens`, envío vía el servicio `contact`
compartido del VPS), responsive mobile-first en el home de `frontend-landing`, enlace de TikTok, y ajuste de nginx
(`client_max_body_size 6M` en `api.micasachurch.co`, redirect `www`→apex documentado). Backend, `frontend-landing` y
`frontend-admin` (manual) desplegados y verificados (`200` en los tres subdominios, migraciones Flyway V5–V7 corridas
limpio). Verificado por el usuario (2026-09-01): el correo de recuperación de password llega y el link apunta
correctamente a `admin.micasachurch.co` con los defaults de `application.yml` (`ADMIN_PUBLIC_URL`/`CONTACT_API_URL`) —
no hizo falta fijarlos en el `.env` del VPS.

## Bloqueos o problemas conocidos

- Fotos reales de congregación/pastores no disponibles (el MCP de diseño limita descargas binarias a 256 KiB, las imágenes del mockup superan ese límite) — placeholders de color de marca hasta que el cliente suba fotos reales.
- Galería de fotos (N imágenes con alta/baja/orden) fuera del MVP. **Aclaración 2026-09-06**: el upload de imágenes sí existe — vista **Imágenes** del panel, 4 slots fijos (`logo`, `hero`, `quienes_somos`, `og_image`), `POST /api/admin/images/{key}` multipart, máx. 5 MB, PNG/JPEG/WebP/SVG. Lo que no existe es una grilla de fotos libres.
- ~~Password de admin sembrada (`admin`/`password`)~~ **Resuelto (2026-09-02)**: el usuario cambió la contraseña de admin en producción usando la función de cambio de contraseña de la propia app. Ya no queda ninguna credencial por defecto expuesta en el backend público.
- ~~`JWT_SECRET` sin confirmar~~ **Resuelto (2026-09-02)**: el usuario confirma que el `JWT_SECRET` del `.env` del VPS se generó siguiendo las instrucciones documentadas (`docs/ROADMAP.md` Etapa 9), no es el placeholder de `application.yml`. No quedan pendientes de seguridad abiertos en este proyecto.
- ~~`CORS_ALLOWED_ORIGIN` sin revisar tras liberar el dominio raíz~~ **Resuelto (2026-09-06)**: verificado funcionalmente desde el navegador — `fetch` a `https://api.micasachurch.co/api/events` con origen `https://micasachurch.co` devuelve `200` con cuerpo legible, así que el apex ya está permitido. Los checkboxes de `docs/ROADMAP.md` Etapa 9 (JWT_SECRET y CORS) quedaron marcados ese mismo día; estaban desfasados frente a este archivo y por eso el dashboard seguía mostrando el proyecto en BLOCKED.
- ~~Deploy de `frontend-admin` sin automatizar~~ **Resuelto (2026-09-06)**: `infra/deploy.ps1` ya despliega los dos frontends (`Deploy-OneFrontend` + `AdminFrontendPath`); `docs/DECISIONS.md` decía lo contrario y quedó corregido. Falta correr `infra/deploy.ps1 -Projects micasachurch` una vez para verificarlo end-to-end.
- `npm run test`/`ng test` no se corrió en ninguno de los dos frontends (fuera de alcance de la verificación pedida, que se limitó a build).
- Brechas de fidelidad visual frente al mockup — ver `docs/ROADMAP.md` Etapa 8 (devocional embebido inline en el home, indicador "en vivo", link del footer al admin). **Corrección (2026-09-02)**: los `<title>` ya NO son los defaults del Angular CLI — verificado en producción, la landing sirve "Mi Casa Church — Ocaña" y el admin "Mi Casa Church · Admin". Esa parte de la brecha está cerrada; actualizar `docs/ROADMAP.md` Etapa 8 en consecuencia.

## Próximo paso recomendado

1. Etapa 8 del roadmap: cerrar las brechas de fidelidad visual con el diseño (devocional inline en home es la más visible; `<title>` de ambos frontends es rápido y visible).
2. Cuando el cliente provea fotos reales, reemplazar los placeholders de color.
3. ~~Confirmar `JWT_SECRET` real en el `.env` del VPS~~ — hecho 2026-09-02, generado según las instrucciones de `docs/ROADMAP.md` Etapa 9.

## Observabilidad HTTP en backend (2026-09-05)

El backend corre bajo systemd y no dejaba ninguna linea de log en tiempo de ejecucion (`journalctl -u micasachurch -f` no mostraba nada tras el arranque). Se agrego `RequestLoggingFilter` (fuera de la cadena de Spring Security, HIGHEST_PRECEDENCE) que loguea metodo/ruta/status/duracion de cada peticion incluyendo los 401/403, MDC con `requestId`/`userId` (`co.com.srdejo.micasachurch.platform.webcommon.logging`), y se cerro el hueco de `GlobalExceptionHandler.handleGeneric` que no dejaba rastro alguno en los 500. `JwtAuthenticationFilter` ahora pone el `userId` en el MDC al autenticar y loguea en DEBUG el motivo cuando rechaza un token.

## Revisión punto a punto del panel (2026-09-06)

Se recorrieron las nueve vistas del `frontend-admin` en producción con clics reales, se probó el ciclo
completo de un evento (crear → publicar → verificar en el sitio → borrar), una red, un horario, un
enlace y una petición de oración de punta a punta. **13 fallos corregidos en el repo** (sesión que no
volvía al login tras un 401, "Cerrar sesión" fuera de pantalla, borrado de eventos sin confirmar,
filas que seguían diciendo "Cambios sin publicar" después de publicar, enlaces de WhatsApp sin
indicativo, fechas en inglés, auto-borrado de administradores, entre otros) y una lista de pendientes
abiertos. Detalle completo en [`docs/REVISION-ADMIN-2026-09-06.md`](REVISION-ADMIN-2026-09-06.md).

**Nada de esto está en producción todavía**: falta `ng build` de los dos frontends, `./gradlew build`
del backend y `infra/deploy.ps1 -Projects micasachurch` desde la máquina de Daniel.

**Incidente durante la revisión**: probando el borrado de administradores contra el API se eliminó el
usuario `admin` (el backend desplegado aún no tiene la protección de auto-borrado). Se recreó por
invitación a srdejo@gmail.com; la clave hubo que definirla de nuevo.

