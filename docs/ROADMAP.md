# ROADMAP.md

Etapas hacia el sitio completo de `micasachurch`, alineado con el diseño de referencia (Claude Design, `claude.ai/design/p/355f07fc-cf88-404d-9008-dc0c64286996` — `Mi Casa Church Ocaña.dc.html`, `Admin.dc.html`, `Devocional.dc.html`). Los `.dc.html` son la especificación de UI/copy/dominio, no código a portar literalmente (ver `CLAUDE.md`).

## Etapa 1 — Backend: dominio y aplicación ✅

Entidades de dominio, puertos de repositorio y casos de uso para `Event`, `Network`, `PrayerRequest`, `ServiceSchedule`, `LinkEntry`, `SiteSettings`, `AdminUser`. Verificado: compila (`./gradlew compileJava`).

## Etapa 2 — Backend: infraestructura, controllers y bootstrap ✅

Adaptadores JPA completos para las 7 entidades, controladores REST públicos y de administración, `ChurchConfig` (wiring de beans), módulo `bootstrap` con `application.yml`, migraciones Flyway (schema + seed), `messages.properties`. Verificado: `./gradlew build -x test` genera el jar sin errores; en producción responde con datos reales (`/api/events`, login admin) — ver Etapa 7.

## Etapa 3 — `frontend-landing`: sitio público ✅ (contenido) / ⚠️ fidelidad visual pendiente

Angular 22 + SSR, Tailwind v4 con la paleta de marca. Página única con las 14 secciones especificadas, ruta `/devocional` con navegación por fecha. Verificado: `ng build` genera bundles (browser + server) sin errores; desplegado y accesible en `api.micasachurch.co`-backed data en producción.

Brechas frente al mockup real (`Mi Casa Church Ocaña.dc.html`), a resolver en la Etapa 8:
- La sección `#devocional` del home hoy es un teaser (título + botón a `/devocional`); el diseño muestra el devocional del día **completo e inline** en el home (título, cita, versículo destacado, contenido, selector de fecha, audio si existe, compartir, A+/A−) — solo la página `/devocional` standalone lo tiene completo hoy.
- Hero y "Quiénes somos" usan gradientes de marca como placeholder — el diseño usa fotos reales de la congregación/pastores (no disponibles todavía, ver `docs/DECISIONS.md`).
- Indicador de "En vivo" usa un emoji (`📡`) en vez de un punto/dot animado como en el diseño.
- `<title>` del documento y metadatos (Open Graph, description) no confirmados — revisar que no haya quedado el default de Angular CLI.
- Footer enlaza a `/admin` (ruta relativa dentro del propio dominio de landing) — debe apuntar a `https://admin.micasachurch.co` (dominio separado, ver Etapa 7).

## Etapa 4 — `frontend-admin`: panel administrativo ✅ (funcional) / ⚠️ detalle pendiente

Angular 22 SPA (sin SSR), login JWT, sidebar + 6 vistas (Panel, Eventos, Peticiones de oración, Redes, Horarios y en vivo, Enlaces). Verificado: `ng build` sin errores; **desplegado y probado en producción** (`admin.micasachurch.co`) — login real con JWT funcionando de punta a punta (2026-08-31, después de corregir el bug de `fileReplacements`, ver `docs/DECISIONS.md`).

Pendiente menor: `<title>` del documento quedó en el default `FrontendAdmin` — cambiar a algo como "Mi Casa Church · Admin".

## Etapa 5 — Documentación ✅

`README.md`, `CLAUDE.md`, `LICENSE`, `docs/{ARCHITECTURE,DECISIONS,ROADMAP,PROGRESS,DEPLOYMENT}.md`.

## Etapa 6 — Infra: wiring y documentación (sin desplegar) ✅

`PORTS.md` actualizado (puerto 8088 reservado), `infra/deploy.ps1` con entrada `micasachurch` (config preparada, dos frontends), sintaxis validada.

## Etapa 7 — Aprovisionamiento real en el VPS — 🟡 en curso (2026-08-31)

DNS de los 4 subdominios creado por el usuario. Ejecutado hasta ahora, en una sesión con SSH autorizado:

- [x] DB y rol `micasachurch` creados en Postgres del VPS.
- [x] `.env` con secretos reales en `~/apps/micasachurch/.env`.
- [x] Unit systemd `micasachurch.service` creado, habilitado y corriendo (puerto 8088), con `NOPASSWD` agregado al sudoers para poder reiniciarlo sin intervención manual.
- [x] Vhosts nginx + SSL (Certbot, certificado ampliado con `--expand`) para `api.micasachurch.co` y `admin.micasachurch.co`.
- [x] Primer deploy real vía `infra/deploy.ps1 -Projects micasachurch` (backend + `frontend-landing`) más subida manual de `frontend-admin` (no automatizado todavía, ver `docs/DECISIONS.md`).
- [x] Verificado end-to-end en producción: `GET /api/events` responde con datos seed reales, login admin (`admin`/`password` — placeholder, ver checklist abajo) devuelve JWT válido, panel carga y autentica correctamente en `admin.micasachurch.co`.

Pendiente dentro de esta etapa:
- [ ] **Fase A** (`docs/DEPLOYMENT.md`): migrar `nolost` de `micasachurch.co/api` a `nolost.micasachurch.co` / `nolost-api.micasachurch.co`.
- [ ] **Fase B**: liberar el vhost de `micasachurch.co` de `nolost` una vez la Fase A esté verificada.
- [ ] Apuntar el vhost de `micasachurch.co` al `frontend-landing` de este proyecto (hoy sigue sirviendo `nolost` — ver tabla de estado en `docs/PROGRESS.md`).
- [ ] Cambiar la contraseña del `AdminUser` sembrado (`admin`/`password`, placeholder de desarrollo, ya expuesto en un backend público).

## Etapa 8 — Fidelidad visual con el diseño (pendiente, no iniciada)

Cerrar las brechas listadas en la Etapa 3 y 4 frente al mockup real:

1. Embeber el devocional completo del día en la sección `#devocional` del home (no solo el teaser), reutilizando la lógica ya construida en la página `/devocional` (`DevotionalApiService`) — extraerla a un componente compartido en vez de duplicar la llamada a la API de Our Daily Bread.
2. Reemplazar el indicador "En vivo" (emoji) por un punto/dot animado en CSS, como en el diseño.
3. Confirmar/ajustar `<title>` y metadatos (Open Graph, `description`) en ambos frontends — landing para SEO real, admin para claridad de pestaña.
4. Corregir el enlace del footer de `frontend-landing` (`/admin` → `https://admin.micasachurch.co`).
5. Cuando el cliente entregue fotos reales de la congregación/pastores: reemplazar los gradientes placeholder del hero y "Quiénes somos" — subir las imágenes como asset estático versionado (no hay admin de imágenes, ver `docs/DECISIONS.md`), sin necesidad de rehacer el layout.

Criterio de cierre de esta etapa: comparación lado a lado del sitio desplegado contra los `.dc.html` del proyecto de diseño, sección por sección, confirmando que no quedan desviaciones de copy/estructura no documentadas como decisión explícita.

## Etapa 9 — Seguridad antes de producción real (pendiente)

- [ ] Cambiar la contraseña del `AdminUser` sembrado (ver Etapa 7).
- [ ] Confirmar que `JWT_SECRET` en el `.env` del VPS es un valor generado (`openssl rand -base64 32`), no el placeholder de `application.yml`.
- [ ] Revisar `CORS_ALLOWED_ORIGIN` en el `.env` del VPS una vez `micasachurch.co` esté sirviendo el `frontend-landing` real (Etapa 7, Fase B) — hoy solo incluye los subdominios, falta agregar el dominio raíz si el footer/CORS lo necesita.

## Fuera de alcance de este MVP (documentado, no pendiente de ejecutar)

- Admin de imágenes con upload (grilla de fotos) — ver `docs/DECISIONS.md`.
- Automatizar el deploy de `frontend-admin` dentro de `infra/deploy.ps1` (hoy es subida manual) — ver `docs/DECISIONS.md`.
