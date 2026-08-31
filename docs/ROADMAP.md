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

- [x] **Fase A** (`docs/DEPLOYMENT.md`): `nolost` migrado a `nolost.micasachurch.co` / `nolost-api.micasachurch.co` — hecho y verificado 2026-08-31 (sin rebuild de frontend, ver `docs/DECISIONS.md`).
- [x] **Fase B**: vhost de `micasachurch.co` liberado de `nolost` — hecho 2026-08-31.
- [x] `micasachurch.co`/`www.micasachurch.co` apuntando al `frontend-landing` de este proyecto — verificado en producción (contenido real confirmado, no la página de `nolost`).
- [x] Cambiar la contraseña del `AdminUser` sembrado — hecho 2026-08-31 (contraseña real generada y aplicada directo en la base). Además se agregó soporte para cambiarla desde el propio panel (ver Etapa 4.1).

**`micasachurch` está completamente en producción en su dominio final** (`micasachurch.co`, `api.micasachurch.co`, `admin.micasachurch.co`), con `nolost` intacto en sus subdominios propios.

## Etapa 4.1 — Cuenta: cambio de clave propio y gestión de otros admins ✅ (2026-08-31)

No estaba en el alcance original, se agregó a pedido del usuario tras detectar que la única forma de cambiar la contraseña sembrada era por SQL directo:

- Backend: `ChangePasswordUseCase` (self-service, requiere clave actual), `AdminUserService` (listar/crear/eliminar otros admins, con guard que impide eliminar el último administrador restante). Endpoints `PATCH /api/admin/auth/change-password` y `GET/POST/DELETE /api/admin/admin-users`, protegidos por JWT como el resto de `/api/admin/**`.
- Corrigió de paso un bug real: `LoginUseCase` lanzaba una excepción propia (`InvalidCredentialsException`) sin handler registrado en `GlobalExceptionHandler`, así que una clave incorrecta devolvía `500` en vez de `401` — cambiado a `BadCredentialsException` (ya manejada).
- `frontend-admin`: nueva vista "Cuenta" en el sidebar, con las dos funciones.
- **Verificado en producción**: `curl` end-to-end contra `api.micasachurch.co` — clave incorrecta da 401, cambio de clave propia funciona, crear/listar/eliminar otros admins funciona, y el guard de "último admin" rechaza correctamente el intento de dejar el sitio sin ningún administrador.

## Etapa 8 — Fidelidad visual con el diseño ✅ (2026-08-31, salvo fotos reales — ver Etapa 11)

Brechas cerradas frente al mockup real:

1. [x] Devocional completo del día embebido inline en `#devocional` del home (título, cita, versículo, contenido, audio, Biblia en un año), vía componente compartido `DevotionalArticle` reutilizado también en `/devocional`. De paso se corrigió un bug real: la API de Our Daily Bread devuelve un array plano, no `{entry:[...]}` — el mapeo anterior estaba roto en ambos lugares.
2. [x] Indicador "En vivo" reemplazado por un punto animado en CSS (banner del home y badge por horario transmitido, ver Etapa 4.2).
3. [x] `<title>` y metadatos (Open Graph, Twitter Card, `description`) ajustados en ambos frontends; favicon e `apple-touch-icon` reales aplicados (ver Etapa 11).
4. [x] Footer de `frontend-landing` corregido: enlaza a `https://admin.micasachurch.co` en vez de `/admin`.
5. [ ] Fotos reales de congregación/pastores — sigue pendiente, ver Etapa 11 (encontradas en el proyecto de diseño pero truncadas por el límite del MCP).

## Etapa 4.2 — Horarios: indicar si un servicio se transmite en vivo ✅ (2026-08-31)

A pedido del usuario: no todos los servicios semanales se transmiten, hacía falta poder marcarlo por servicio (distinto del banner general "en vivo" de las 7:00 a.m., que es una franja aparte).

- Backend: campo `streamed` (boolean) en `ServiceSchedule`, migración `V3__service_schedule_streamed.sql` (`ALTER TABLE` + default `false`, con el servicio de Domingo 10:00 a.m. marcado `true` como valor inicial razonable — **no confirmado con la iglesia, revisar en el panel**).
- `frontend-admin`: checkbox "Este servicio se transmite en vivo" en Horarios, guarda al toque.
- `frontend-landing`: badge "En vivo" (mismo dot animado) en la tarjeta del horario correspondiente.
- **Verificado en producción**: `GET /api/services` devuelve el campo, el checkbox persiste correctamente.

## Etapa 9 — Seguridad antes de producción real

- [x] Cambiar la contraseña del `AdminUser` sembrado — hecho 2026-08-31.
- [ ] Confirmar que `JWT_SECRET` en el `.env` del VPS es un valor generado (`openssl rand -base64 32`), no el placeholder de `application.yml`.
- [ ] Revisar `CORS_ALLOWED_ORIGIN` en el `.env` del VPS una vez `micasachurch.co` esté sirviendo el `frontend-landing` real (Etapa 7, Fase B) — hoy solo incluye los subdominios, falta agregar el dominio raíz si el footer/CORS lo necesita.

## Etapa 10 — Automatización de deploy y detalle menor (pendiente)

- [ ] Automatizar el deploy de `frontend-admin` dentro de `infra/deploy.ps1` (hoy es subida manual `ng build` + `scp`) — ver `docs/DECISIONS.md`.
- [ ] Admin de imágenes con upload (grilla de fotos) — fuera de alcance del MVP, ver `docs/DECISIONS.md`. Reevaluar una vez el cliente tenga fotos reales que rotar con frecuencia.

## Etapa 11 — Contenido dinámico pendiente: imágenes y texto reales (checklist de lanzamiento)

Todo lo que hoy es placeholder, dato de ejemplo, o texto/imagen que un administrador de la iglesia debería revisar y reemplazar antes de considerar el sitio "listo" en el sentido de contenido (no de código). Nada de esto bloquea que el sitio funcione — es la lista de qué falta para que hable con la voz real de la iglesia.

### Imágenes — todas editables desde el panel (Imágenes) ✅ (2026-08-31)

A pedido del usuario, se construyó subida de imágenes desde el admin en vez de dejarlas fijas en el código — ver Etapa 12. Las 4 imágenes clave del sitio (logo, hero, "Quiénes somos", Open Graph) ahora son un slot subible con recomendación de tamaño/formato visible en el panel; mientras no se suba nada, el sitio público sigue mostrando el placeholder anterior (gradiente / círculo con "M") automáticamente.

| Elemento | Estado |
|---|---|
| Favicon (pestaña del navegador) | ✅ real, aplicado directo en el código (no es un dato editable — cambia poco y requiere rebuild) |
| `apple-touch-icon` (ícono iOS) | ✅ real, aplicado directo en el código (ídem) |
| Ícono 512×512 (PWA) | ⏭️ omitido — no hay `manifest.json`/instalación como app |
| Logo del header | 🟡 subible desde Imágenes → "Logo (header)" — todavía no se subió ninguno, sigue mostrando el círculo "M" |
| Foto de portada del hero | 🟡 subible desde Imágenes → "Foto de portada (hero)" — todavía no se subió ninguna, sigue mostrando el gradiente |
| Foto de "Quiénes somos" | 🟡 subible desde Imágenes → "Foto Quiénes somos" — ídem |
| Imagen Open Graph | 🟡 subible desde Imágenes → "Imagen para compartir" — el archivo real (1200×630) existía en el diseño pero llegó truncado por el límite del MCP, así que hay que conseguirlo por otro medio y subirlo por acá |
| QR de donación Crediservir / Bancolombia | ✅ real, aplicado directo en el código (`frontend-landing/public/img/`) — no pasa por el sistema de subida porque no cambia con frecuencia |

### Texto — editable desde el panel (Contenido) ✅ (2026-08-31)

A pedido del usuario, se sacó del código el copy que antes era estático — ver Etapa 12.

| Elemento | Estado | Dónde se edita |
|---|---|---|
| Eventos (`#eventos`) | 🟡 dato de ejemplo — el seed trae 2 eventos ficticios | Panel → Eventos (ya era editable desde antes) |
| Líder/contacto de cada Red | 🟡 vacío en todas | Panel → Redes (ya era editable desde antes) |
| Enlaces y cuentas | 🟢 sembrados con valores reales, conviene que la iglesia los confirme | Panel → Enlaces (ya era editable desde antes) |
| `streamed` por horario | 🟡 valor inicial puesto por decisión técnica, no confirmado con la iglesia | Panel → Horarios (Etapa 4.2) |
| Ministerios (Niños, Jóvenes, Matrimonios, Alabanza) | 🟢 sembrados con el copy real del diseño, ahora con CRUD completo (agregar/editar/eliminar) | Panel → Contenido |
| Subtítulo del hero, párrafos de "Quiénes somos", copy de Ofrendas | 🟢 sembrados con el copy real del diseño original | Panel → Contenido |
| Contraseña del `AdminUser` | ✅ ya cambiada | Panel → Cuenta |

Criterio de cierre de esta etapa: la iglesia (no un desarrollador) revisó cada fila marcada 🟡 de esta tabla y subió/escribió el contenido real, usando el panel — ya no requiere ninguna intervención de código.

## Etapa 12 — Contenido totalmente editable desde el admin (imágenes + texto) ✅ (2026-08-31)

A pedido explícito del usuario: en vez de dejar el logo, las fotos del hero/"Quiénes somos", la imagen OG, los Ministerios y el copy de "Quiénes somos"/hero/ofrendas fijos en el código (como se había planteado inicialmente en la Etapa 11), se construyó la lógica para que un administrador de la iglesia los cargue y edite desde el panel, sin tocar código ni redeploy.

- **Backend**: 3 entidades nuevas —
  - `SiteImage` + `ImageStorage`: subida multipart (`POST /api/admin/images/{key}`, máx. 5 MB, solo PNG/JPG/WEBP/SVG), guardado en disco (`app.uploads-dir`, configurable por `UPLOADS_DIR`) y servido públicamente sin autenticación en `GET /api/images/{key}` (con caché de 1 hora). 4 claves fijas: `logo`, `hero`, `quienes_somos`, `og_image`.
  - `SiteContent`: pares clave/valor de texto largo, editable por `PATCH /api/admin/site-content/{id}`, listado público en `GET /api/site-content`.
  - `Ministry`: CRUD completo (antes era un array hardcodeado en `home.ts`), público en `GET /api/ministries`.
  - Migración `V4__site_content_ministries_images.sql`, sembrada con el copy y los 4 ministerios que ya estaban en el código — **cero cambio visual** hasta que el admin suba/edite algo.
- **`frontend-admin`**: dos vistas nuevas — "Contenido" (textos + CRUD de ministerios) e "Imágenes" (4 slots con recomendación de tamaño/formato por imagen, preview, botón de reemplazo).
- **`frontend-landing`**: logo/hero/"Quiénes somos" son ahora `<img>` apuntando a `GET /api/images/{key}`, con `(error)` haciendo fallback automático al placeholder anterior (círculo "M" / gradiente) si la imagen todavía no fue subida — el sitio nunca muestra una imagen rota. Ministerios, subtítulo del hero, párrafos de "Quiénes somos" y copy de Ofrendas ahora vienen de `GET /api/site-content` / `GET /api/ministries`, con el mismo texto de siempre como valor por defecto si la llamada falla.
- **Verificado en producción**: `GET /api/ministries` y `GET /api/site-content` responden con los datos sembrados; `GET /api/images/logo` devuelve `404` (ninguna imagen subida todavía, comportamiento esperado); el endpoint de subida rechaza sin token (`403`). La subida real de un archivo no se pudo probar por `curl` en esta sesión porque la contraseña de admin ya había sido cambiada por el usuario desde el panel — pendiente que el usuario la pruebe directamente en `admin.micasachurch.co` → Imágenes.
