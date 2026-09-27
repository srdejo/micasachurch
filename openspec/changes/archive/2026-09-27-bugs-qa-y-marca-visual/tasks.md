# Tasks

## 1. Backend: colores, contenido y validaciones

- [x] 1.1 Crear `V9__brand_colors_and_content_sections.sql`: columnas `primary_color`/`secondary_color`/`tertiary_color` en `site_settings` (default `#f89e1b`/`#000000`/`#ffffff`), columnas `section`/`display_order` en `site_contents`, relleno de las 4 claves existentes, siembra de `predicas_title`, `predicas_copy`, `quienes_somos_title` con los textos actuales de `home.html` y etiquetas cortas, y actualización del enlace `facebook` a `https://www.facebook.com/micasachurchocana` solo si conserva el valor sembrado. Verificar que el backend arranca y Flyway aplica V9 sin error contra el Postgres local.
- [x] 1.2 Extender `SiteSettings` (dominio, JPA, adaptador, servicio) con los tres colores y validación `#RRGGBB` (clave `sitesettings.invalid_color` en `messages.properties`); `PATCH /api/admin/site-settings` acepta campos parciales y la respuesta pública incluye los colores. Verificar con `./gradlew build` y `curl` (GET público devuelve colores; PATCH con `#fff` responde 400 con mensaje en español; PATCH con `#1b6ff8` persiste).
- [x] 1.3 Exponer `section` y `display_order` en `SiteContent` y en la API admin/pública de contenido, ordenando por sección y orden. Verificar con `curl` que `/api/admin/site-content` devuelve `section` y las tres claves nuevas.
- [x] 1.4 Agregar `GET /api/admin/auth/reset-token?token=…` público (permitAll en seguridad) que devuelve `{ username }` para tokens vigentes y 404 `passwordreset.invalid_token` en otro caso; agregar a `mail-templates/invite-admin.html` un bloque destacado "Tu usuario para ingresar: {{username}}" con la aclaración de que se ingresa con el usuario, no con el correo. Verificar con `curl` usando un token válido, uno usado y uno inexistente, y enviando una invitación local para revisar que el correo muestra el bloque.
- [x] 1.5 Validar `PrayerRequestSubmission` en backend: nombre `^[\p{L} ]{1,80}$`, teléfono `^\+?\d{7,15}$` (ambos opcionales, con `trim`), mensaje obligatorio; mensajes i18n. Verificar con `curl` (nombre "Ana 123" → 400 en español; datos válidos → 201/200).
- [x] 1.6 Verificar `./gradlew build` en verde y anotar el avance en `docs/PROGRESS.md`.

## 2. Marca: assets (fuentes y logos)

- [x] 2.1 Descargar `LeagueGothic-Regular` (OFL) del repositorio de Google Fonts (`ofl/leaguegothic`, incluir `OFL.txt`) y convertir a `woff2` (`npx ttf2woff2`) junto con `Montserrat-Regular.otf`, `Montserrat-Bold.ttf` y `Poppins-Regular.ttf` de `pginaweb/MI CASA`; copiarlos a `public/fonts/` de ambos frontends. Verificar que existen los 4 `woff2` y la licencia en cada `public/fonts/`.
- [x] 2.2 Revisar transparencia de los PNG de `pginaweb/Logos` y generar con `npx sharp-cli` (recorte al contenido + resize) `logo-horizontal.png`, `logo-horizontal-light.png`, `isotipo.png`, `isotipo-light.png` en `public/img/brand/` de ambos frontends. Verificar que cada archivo pesa < 150 KB y se ve correcto sobre fondo claro/oscuro.
- [x] 2.3 Recortar el código QR de `qr-crediservir.jpeg` y `qr-bancolombia.jpeg` a `qr-crediservir-code.png` y `qr-bancolombia-code.png` en `frontend-landing/public/img/`. Verificar escaneando cada recorte en pantalla con la cámara/app bancaria; si no escanea, registrar en `docs/PROGRESS.md` como bloqueo "pedir QR originales a la iglesia".

## 3. Landing: tema (paleta y tipografías)

- [x] 3.1 En `frontend-landing/src/styles.css` quitar el `@import` de Google Fonts, declarar `@font-face` (swap) y las variables `--color-primary/secondary/tertiary` más derivados con `color-mix`; en `tailwind.config.js` reemplazar `cream/ink/terracotta/gold/section` por `primary`, `secondary(+soft/muted/subtle)`, `tertiary`, `surface(+alt/light)` y fuentes `display`/`heading`/`sans`. Verificar con `npm run build` (fallará hasta 3.2; ejecutar tras 3.2).
- [x] 3.2 Reemplazar las clases de color y fuente en `home.html`, `devocional.html`, `devotional-article` y `app.html` (texto sobre primario = secundario); `h1,h2` en `font-display` (League Gothic), `h3`/etiquetas/botones/cifras en `font-heading` (Montserrat Bold); aplicar la escala de tamaños de `design.md` §3. Verificar `npm run build` sin errores, `grep -rE "terracotta|cream|gold|ink-|#[0-9A-Fa-f]{6}" src/app` sin resultados y revisión visual a 1440, 375 y 360 px sin títulos cortados ni desbordados.
- [x] 3.3 Aplicar colores dinámicos: ampliar `SiteSettings` en `church-api.service.ts` y, solo en navegador, escribir las variables CSS en `document.documentElement` al recibir ajustes; actualizar `church-api.service.spec.ts`. Verificar `npm test` en verde y, en el navegador, que cambiar el primario vía `curl` PATCH se refleja al recargar.
- [x] 3.4 Header con `logo-horizontal.png` y footer/secciones oscuras con la variante clara. Verificar visualmente en escritorio y móvil.

## 4. Landing: bugs

- [x] 4.1 Quitar el modal de Facebook y convertir banner, botón de Prédicas, tarjeta Facebook de Síguenos y barra móvil en enlaces a `facebookUrl()` (pestaña nueva, fallback `https://www.facebook.com/micasachurchocana`). Verificar en el navegador que cada control abre Facebook y la página no cambia de posición (bugs 4, 5, 10).
- [x] 4.2 Usar `predicas_title`/`predicas_copy`/`quienes_somos_title` vía `contentValue` con los textos actuales como fallback. Verificar editando y publicando desde el admin y recargando el landing (bugs 3, 8-nota).
- [x] 4.3 Quitar el botón "Ya estoy en una" y hacer que "Cómo llegar" abra el enlace de Google Maps del templo en pestaña nueva. Verificar en el navegador (bugs 6, 8).
- [x] 4.4 Mover la sección Síguenos al final (antes del footer) y mantener el ancla `#siguenos`. Verificar que el menú lleva a la sección y que es la última antes del footer (bug 9).
- [x] 4.5 Validaciones del formulario de oración con mensajes por campo según la spec y sin envío si hay errores. Verificar los 4 escenarios de la spec en el navegador (bugs 11, 12).
- [x] 4.6 Mostrar los QR recortados a ≥ 220 px enlazados a la pieza completa. Verificar tamaño en pantalla y que al tocar se abre la imagen completa (bug 7).
- [x] 4.7 Añadir "Volver al inicio" visible en `/devocional`. Verificar navegación de vuelta (bug 13).
- [x] 4.8 Corregir desbordes móviles (tarjetas de Síguenos, carrusel de eventos, `overflow-x: clip`). Verificar con el navegador a 360 y 375 px que no hay scroll horizontal ni textos fuera de su tarjeta (bugs 14, 15).
- [x] 4.9 `npm run build` y `npm test` de `frontend-landing` en verde; actualizar `docs/PROGRESS.md` y registrar en `docs/DECISIONS.md` la eliminación del embed de Facebook y los colores dinámicos.

## 5. Admin: tema, cuentas y contenido

- [x] 5.1 Aplicar fuentes (misma escala de `design.md` §3) y paleta de marca fija en `frontend-admin` (`styles.css`, `tailwind.config.js`, clases en templates) y logos (isotipo en login/forgot/reset, logotipo claro en el sidebar). Verificar `npm run build` sin errores y revisión visual de login y shell.
- [x] 5.2 Reproducir el bug 1 en `/restablecer-clave` (pegado y autocompletado de Chrome) y corregir: leer valores del formulario al enviar, limpiar el error al editar, no enviar si no coinciden. Verificar los escenarios "Claves idénticas pegadas" y "Claves distintas" en el navegador (sin petición de red en el segundo).
- [x] 5.3 Agregar confirmación de clave al cambio de clave en "Mi cuenta" con la misma validación. Verificar en el navegador ambos escenarios.
- [x] 5.4 En `/restablecer-clave` consultar `reset-token` al cargar, mostrar "Tu usuario es: X" (o el mensaje de enlace inválido) y navegar a `/login?usuario=X`; el login prellena el usuario. Verificar el flujo completo con una invitación real al entorno local (bug 2).
- [x] 5.5 Agrupar "Contenido" por `section` (Inicio, Prédicas, Quiénes somos, Ofrendas) en el orden del landing, con las etiquetas cortas. Verificar que el grupo "Prédicas" muestra título y texto (bug 3).
- [x] 5.6 Editor de colores en el Dashboard junto al banner en vivo: tres campos (`input type="color"` + hex), guardado al vuelo, error en español para hex inválido, botón "Restablecer colores de marca" y muestra de vista previa. Verificar guardando, recargando el landing y restableciendo.
- [x] 5.7 `npm run build` y `npm test` de `frontend-admin` en verde; actualizar `docs/PROGRESS.md`.

## 6. Verificación integral

- [ ] 6.1 Recorrer `bugs-encontrados-pagina-web.md` punto por punto (1–15) en escritorio y móvil (360 px) con backend + ambos frontends locales y anotar el resultado de cada uno en `docs/PROGRESS.md`. No marcar listo para desplegar sin confirmación del usuario.
