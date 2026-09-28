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


## Bugs de QA y marca visual (2026-09-26/27)

Cambio OpenSpec `openspec/changes/bugs-qa-y-marca-visual/` (15 hallazgos de `bugs-encontrados-pagina-web.md` +
tipografías/paleta/logos oficiales). Detalle por tarea en su `tasks.md`; decisiones en `DECISIONS.md` (2026-09-27).
**Nada de esto está en producción**: falta build y `infra/deploy.ps1 -Projects micasachurch` desde la máquina de Daniel.

- **Backend** — migración `V9__brand_colors_and_content_sections.sql` (colores en `site_settings`,
  `section`/`display_order` en `site_contents`, textos de Prédicas y título de Quiénes somos editables,
  enlace `facebook` → `https://www.facebook.com/micasachurchocana`); `GET /api/admin/auth/reset-token`;
  bloque "Tu usuario para ingresar" en el correo de invitación; validación de nombre/WhatsApp/petición.
  `./gradlew build` en verde; endpoints verificados con `curl` contra el Postgres de Docker (`:5433`).
- **frontend-landing** — League Gothic + Montserrat autoalojadas, paleta `primary/secondary/tertiary` sobre
  variables `--brand-*` (colores del admin aplicados en el navegador), logos HD optimizados en `public/img/brand`,
  QR recortados (`qr-*-code.png`, decodificados con `jsqr`), "En vivo" como enlace a Facebook, sin "Ya estoy
  en una", "Cómo llegar" a Google Maps, Síguenos al final, validación del formulario de oración, "Volver al
  inicio" en `/devocional`, sin desborde horizontal a 360/375 px. `ng build` y `ng test` (10/10) en verde.
- **frontend-admin** — misma tipografía, paleta fija, isotipo/logotipo; restablecer clave muestra el usuario,
  "Mostrar claves" y compara los valores reales; login prellenado con `?usuario=`; confirmación de clave en
  Cuenta; Contenido agrupado por sección; editor de colores en el Panel. `ng build` en verde.
- **Causa del bug 1 (cambio de clave)**: los navegadores no permiten copiar desde un campo de clave, así que
  "copiar y pegar" la clave pegaba otra cosa y el aviso "Las claves no coinciden" era correcto; el formulario
  nunca enviaba en ese caso. Se agregó "Mostrar claves" para que se vea lo que quedó escrito.
- **Tests del admin con Node 25**: `ng test` falla en `auth.service.spec.ts` (`localStorage.clear is not a
  function`) porque Node 25 expone un `localStorage` global que tapa el de jsdom. No es de este cambio: con
  Node 24 LTS (`nvm`) pasan los 13 tests.
- **Pendiente de Daniel**: escanear los QR con la app de cada banco desde la pantalla (se verificó que se
  decodifican, no con la app); el envío real del correo de invitación (en local `contact` solo es accesible
  dentro de Docker; se verificó la plantilla renderizada).

Recorrido de `bugs-encontrados-pagina-web.md` en local (landing `:4200`, admin `:4300`, backend `:8088`; escritorio 1440 px
y móvil simulado a 360/375 px):

| # | Resultado |
|---|---|
| 1 | Causa encontrada (no se puede copiar desde un campo de clave). "Mostrar claves" + error que se limpia al editar; con claves distintas no se envía nada. Verificado en restablecer y en Cuenta. |
| 2 | La página de invitación muestra "Tu usuario es: …" y el login llega prellenado; el correo trae el usuario destacado. Falta ver un correo real. |
| 3 | Título y texto de Prédicas editables en Contenido → grupo "Prédicas"; editado, publicado y visto en el landing. |
| 4, 5, 10 | Sin modal: todos los "En vivo" abren `facebook.com/micasachurchocana` en pestaña nueva; la posición de la página no cambia. |
| 6 | "Ya estoy en una" eliminado. |
| 7 | QR recortados, con margen y mostrados a 338 px; ambos se decodifican. Falta escanearlos con la app de cada banco. |
| 8 | "Cómo llegar" abre Google Maps; el título de Quiénes somos es editable en Contenido. |
| 9 | Síguenos es la última sección antes del footer. |
| 11, 12 | Petición obligatoria, nombre solo letras, WhatsApp solo números; mensajes por campo, también validado en el backend. |
| 13 | "Volver al inicio" visible sin scroll en `/devocional`. |
| 14, 15 | Ningún elemento fuera del viewport ni de su tarjeta a 360/375 px; `overflow-x: clip` como red de seguridad. |

## Rediseño de Claude Design (2026-09-27, en curso)

Cambio OpenSpec `openspec/changes/rediseno-claude-design/`. Decisiones en `DECISIONS.md` (2026-09-27, "Rediseño…").
**Nada de esto está en producción.**

- **Recursos descargados del diseño** (`DesignSync get_file`): las 7 fuentes Gotham/Dharma (convertidas a
  `.woff2`), `logo-icon-black.png` (isotipo, usado como máscara teñida con el acento), `logo-text-white.png`
  e `icon-180.png` (reemplaza `apple-icon-180x180.png`).
- **No se pudieron bajar** (superan el límite de 256 KiB de `get_file`, llegan truncadas): `fotos/icon-512.png`,
  `fotos/og-image.png`, `fotos/congregacion.png` y `fotos/pastores.png`. Siguen el ícono y la imagen OG actuales;
  las fotos de los banners 1 y 2 hay que exportarlas a mano desde Claude Design y subirlas en el admin
  ("Banner principal"). El banner 1 arranca con la imagen `hero` que ya estaba subida.
- **Backend** (verificado): migración `V10__redesign_banners_live_themes.sql` aplicada contra el Postgres de Docker
  (`:5433`); temas (`/api/admin/themes`, `activeTheme` en ajustes), banners (`/api/banners`, `/api/admin/banners` con
  subida de imagen `banner-{id}`), transmisiones especiales (`/api/live-events`, `/api/admin/live-events`) y
  `durationMinutes` en horarios (+ fila "Todos los días · 7:00 a.m." de 45 min). `./gradlew build` en verde (13 tests
  nuevos) y recorrido con un script contra `bootRun` en `:8098` (validaciones en español, imagen de 8 MB → 413 con mensaje
  en español vía `GlobalExceptionHandler`, que antes respondía en inglés también en la vista Imágenes).
- **frontend-landing**: Gotham/Dharma, tokens `accent/ink/cream/paper`, carrusel (`shared/hero-carousel`), ventana de
  horarios (`shared/schedule-modal`), estado en vivo (`core/live-status.ts`, hora de Bogotá), home reescrito según el
  diseño, `/devocional` con los nuevos tokens, metadatos del diseño en `index.html`. `ng build` y `ng test` (29) en verde.
- **frontend-admin**: mismos tokens y fuentes, shell con isotipo teñido, Panel sin el editor de tres colores, vistas
  nuevas Banner principal, Transmisiones especiales y Apariencia, duración y aviso de hora no reconocida en Horarios,
  sin el slot `hero` en Imágenes. `ng build` en verde; `ng test` (13) en verde con Node 24.
- **Verificado en local (2026-09-27)** con `infra/local-deploy.ps1 -Project micasachurch` (backend y landing) y
  publicación manual del admin (en PowerShell 5.1 el script se corta con cualquier aviso que npm/Angular escriban en
  stderr; con Node 24 y `npm_config_loglevel=error` llega hasta el admin, cuyo `angular.json` avisa "The prerender
  option is not considered when outputMode is specified"):
  landing a 1440 px y en iframe de 375/360 px (sin desborde horizontal, Síguenos al final, barra inferior sin tapar el footer),
  ventana de horarios (Escape, ✕), "En vivo ahora" con una transmisión especial creada desde el admin (enlace propio
  en todos los accesos en vivo), admin: Panel, Banner principal (crear, enlace inválido rechazado, subir imagen,
  publicar, eliminar con confirmación), Transmisiones especiales (duración inválida rechazada), Apariencia (hex inválido
  marcado, Coral activo se ve en landing y panel; se dejó Naranja). `./gradlew build`, `ng build` y `ng test`
  (29 landing, 13 admin con Node 24) en verde. **Falta desplegar a producción** (`infra/deploy.ps1`, lo corre Daniel).

## Ajustes en vivo y devocional (2026-09-27)

Cambio OpenSpec `openspec/changes/ajustes-en-vivo-y-devocional/`. **No está en producción.**

- Prédicas sin el botón "En vivo 7:00 a.m."; la barra fija de móvil solo aparece durante una transmisión y solo con "En vivo"
  (sin WhatsApp); el footer ya no reserva espacio cuando no hay barra.
- Reproductor propio del audio del devocional (`shared/audio-player`, variantes oscura y clara): en `/devocional` va
  debajo del título, con "La Biblia en un año" arriba de todo; en el home, dentro de la tarjeta del devocional
  (que dejó de ser un enlace completo: el título y "Leer completo →" llevan a `/devocional`).
- `ng test` (43) y `ng build` en verde. Verificado en local: orden de `/devocional`, barra móvil con una transmisión especial
  de prueba (solo "En vivo", con su enlace) y sin ella, Prédicas sin "En vivo".
- Daniel confirmó en su navegador (2026-09-27) que el audio real suena, se adelanta con la barra, cambia de velocidad y en el inicio se escucha sin salir de la página.

## Leer "La Biblia en un año" en la página (2026-09-28)

Cambio OpenSpec `openspec/changes/leer-biblia-en-un-ano/`. **No está en producción.**

- En `/devocional`, cada referencia de "La Biblia en un año" es un botón que abre un lector modal (`shared/bible-reader`) con el texto
  de la YouVersion Platform (`@youversion/platform-core` 2.15.0, cargado en diferido), pestañas por lectura, selector de versión
  recordado en el navegador y la atribución de copyright. App Key en `environments/` (ver `docs/DEPLOYMENT.md`).
- Versiones en español (tras aceptar los contratos en platform.youversion.com, 2026-09-28): LBLA, NBLA, NVI (Español y Castellano),
  NVIs, PdDpt y VBL. GlossSP y RVES se ocultan (no se pueden leer). Se prefiere NTV y luego PDT, pero **ninguna está licenciada** hoy, así que sale LBLA.
- La API no acepta rangos de capítulos: el parser (`core/bible-reference.ts`) pide un capítulo por vez; los rangos de versículos
  entre capítulos quedan como texto.
- `angular.json`: `externalDependencies: ["jsdom"]` (el SDK solo lo importa si no hay `DOMParser`, nunca en el navegador).
- `ng test` (71) y `ng build` en verde. Verificado en local contra la API real: abrir Isaías 5–6 (dos capítulos) y Efesios 1,
  cambiar pestaña y versión, atribución, versión recordada tras recargar, RVES descartada, Escape devuelve el foco, foco atrapado
  con Tab, 360 px sin scroll horizontal y con scroll interno, "Reintentar" con la red a YouVersion bloqueada.
