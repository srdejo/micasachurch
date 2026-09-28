# Design

## Context

- Fuente del diseño: proyecto de Claude Design `355f07fc-cf88-404d-9008-dc0c64286996`, leído con el MCP `DesignSync` (`get_file`). Archivos: `Mi Casa Church Ocaña.dc.html` (escritorio), `Mi Casa Church Ocaña · Móvil.dc.html`, `Admin.dc.html`, `fonts/*` y `fotos/*`. `support.js` e `image-slot.js` son el runtime del prototipo (componentes `<x-dc>`, `<sc-if>` e `<image-slot>`) y no se portan. Los prototipos guardan todo en `localStorage` (`mcc-site-v1`); aquí eso se reemplaza por la API.
- Estado actual (ver `docs/PROGRESS.md`, "Bugs de QA y marca visual"): el landing tiene hero fijo con imagen `hero` y franja "En vivo" controlada por `SiteSettings.liveBannerVisible`. Los colores son `--brand-primary/secondary/tertiary`, aplicados por `BrandThemeService`. Las fuentes son League Gothic y Montserrat. `ServiceSchedule` guarda `day` y `time` como texto libre, más `streamed` y `displayOrder`. Hay `ImageStorage` (5 MB, PNG/JPEG/WebP/SVG) con claves fijas, y una cola de borradores (`PublishService`) solo para eventos, contenido y ministerios.
- Restricciones de `CLAUDE.md`: Clean Architecture (`domain` sin Spring), código en inglés, mensajes vía i18n y tokens de diseño en `tailwind.config.js`, sin hex nuevos en los componentes.

## Goals / Non-Goals

**Goals:**
- Fidelidad visual a los tres `.dc.html` en escritorio (1440 px) y móvil (360/375/390 px) dentro de un solo `home` responsive.
- Mantener el prerender/SSR del landing: todo cálculo que depende del reloj o de `window` corre solo en el navegador.

**Non-Goals:**
- Dos aplicaciones o rutas separadas para escritorio y móvil. El prototipo móvil es una página aparte con menos secciones; aquí se usa el mismo `home` con puntos de quiebre, se conservan todas las secciones y se aplican los estilos móviles del diseño.
- Pasar horarios, banners, transmisiones o temas por la cola de borradores.
- Cambiar el contenido de `/devocional` más allá de tipografía y colores.

## Decisions

### 1. Fuentes: archivos oficiales convertidos a woff2
Los `.otf`/`.ttf` del diseño (Dharma Light/ExBold/Heavy y Gotham Book/BookItalic/Bold/Black) se descargan con `DesignSync get_file` (base64), se convierten a `.woff2` y se colocan en `public/fonts/` de ambos frontends con `@font-face` y `font-display: swap`. En `tailwind.config.js`: `font-display: ['Dharma', 'Oswald', 'sans-serif']` y `font-sans: ['Gotham', 'Montserrat', 'system-ui', 'sans-serif']`. Se eliminan los woff2 y los `OFL-*.txt` de League Gothic, Montserrat y Poppins.
- *Alternativa descartada*: servir los `.otf`/`.ttf` directamente. Pesan de 2 a 3 veces más.
- La licencia web la confirmó el usuario; queda en `docs/DECISIONS.md` y revierte la decisión del 2026-09-27.

### 2. Temas: tabla `theme_palettes` + `site_settings.active_theme`
- `theme_palettes(name VARCHAR(32) PK, accent_color, deep_color, soft_color VARCHAR(7), display_order INT)`, sembrada con Naranja, Coral y Celeste. `site_settings.active_theme VARCHAR(32) NOT NULL DEFAULT 'Naranja'` con FK a `theme_palettes(name)`.
- Dominio `ThemePalette` con la validación hex que hoy está en `SiteSettings.isValidColor` (se mueve ahí). `SiteSettings` pierde los tres colores.
- API:
  - `GET /api/site-settings` devuelve `{ liveBannerVisible, activeTheme, accentColor, deepColor, softColor }` con los colores ya resueltos, para que el landing no haga dos llamadas.
  - `GET /api/admin/themes` lista los temas.
  - `PATCH /api/admin/themes/{name}` recibe `{ accentColor?, deepColor?, softColor? }`.
  - `PATCH /api/admin/site-settings` recibe `{ liveBannerVisible?, activeTheme? }`.
- Los temas son fijos (tres). No se pueden crear ni borrar: el diseño no lo pide.
- Frontend: variables CSS `--accent`, `--accent-deep` y `--accent-soft` con los valores de Naranja en `styles.css`. `BrandThemeService` las sobrescribe en el navegador. Tailwind expone `accent`, `accent-deep` y `accent-soft` (`var(...)`) y los neutros fijos `ink #111110`, `ink-2 #1C1B19`, `cream #FAF8F4`, `cream-2 #F1EEE8`, `paper #F7F5F0`, `muted #5B5750` y `body #4A4744`. Se eliminan `primary`, `secondary` y `tertiary` del config y se reemplazan en todas las plantillas de ambos frontends.
- *Alternativa descartada*: mantener tres columnas y guardar un JSON de paletas en `site_settings`. Pierde la validación por columna y complica el PATCH.

### 3. Banners: entidad `HeroBanner`
- Tabla `hero_banners(id UUID, kicker, title NOT NULL, text, cta_label, cta_href, image_key, active BOOLEAN, display_order INT)`.
- El enlace se valida en el dominio con `^(#[\w-]+|/[\w\-/]*|https://\S+)$`.
- La imagen reutiliza `ImageStorage` con clave `banner-{id}`. `POST /api/admin/banners/{id}/image` (multipart) guarda el archivo y registra la clave en el banner. `GET /api/images/{key}` ya sirve cualquier clave registrada en `site_images`, así que el alta de la imagen crea también la fila en `site_images`. Se reutiliza `SiteImageService.recordUpload`, y `AdminImageController.ALLOWED_KEYS` no se toca porque la subida de banners va por su propio endpoint.
- Al eliminar un banner se borra también su archivo de imagen.
- CRUD: `GET/POST /api/admin/banners`, `PATCH/DELETE /api/admin/banners/{id}` y `PUT /api/admin/banners/order` (lista de ids, siguiendo el patrón de V8 para horarios). Público: `GET /api/banners` devuelve solo los activos, ordenados, con `imageUrl` o `null`.
- Siembra de V10: tres banners. Las imágenes `congregacion.png` y `pastores.png` no pueden ir en una migración SQL, así que la tarea de despliegue las sube por la API (o se reutiliza la imagen `hero` existente para el primer banner copiando la fila de `site_images` con la clave `banner-{id}`). Ver Migration Plan.
- El carrusel se implementa como componente `HeroCarousel` en `frontend-landing/src/app/shared/`, con signals. El temporizador y el swipe solo se activan en el navegador (`afterNextRender`/`isPlatformBrowser`). El SSR renderiza el primer banner.

### 4. Estado en vivo: cálculo en el cliente con zona `America/Bogota`
- El cálculo es una función pura en `frontend-landing/src/app/core/live-status.ts`, equivalente a `schedule()` del prototipo. Recibe `(services, liveEvents, now)` y devuelve `{ live, next, specialRows, rows }`, y tiene tests unitarios (Vitest/`ng test`) para los escenarios del spec `live-status`.
- `now` se obtiene con `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })`. Se evalúan hoy y los 7 días siguientes.
- Parser de hora igual al del prototipo (`7:00 p.m.`, `19:00`, `8:30 a.m.`). Mapa de días en español: "Todos los días" vale para cualquier día. Si la hora no se puede interpretar, el horario se ignora.
- Duración: nueva columna `service_schedules.duration_minutes INT NOT NULL DEFAULT 120`. V10 inserta el horario "Todos los días · 7:00 a.m. · Devocional diario en vivo" con `streamed=true`, 45 min y `display_order=0`.
- El título en vivo de un horario es "Servicio del {día}" y, para "Todos los días", "Devocional diario", como en el prototipo.
- Transmisiones especiales: tabla `live_events(id UUID, title NOT NULL, event_date DATE NOT NULL, start_time TIME NOT NULL, duration_minutes INT NOT NULL CHECK (>=15), url NOT NULL, active BOOLEAN)`. CRUD en `/api/admin/live-events`. `GET /api/live-events` devuelve las activas desde hoy (Colombia) en adelante. Aquí sí se usan tipos `DATE` y `TIME`, porque se capturan con `<input type="date|time">`.
- El recálculo corre con `setInterval` de 30 s en el navegador. En SSR se renderiza "Próxima transmisión" sin hora concreta, con el texto de respaldo "Todos los días a las 7:00 a.m.", para evitar un desajuste de hidratación.
- *Alternativa descartada*: calcular en el backend (`GET /api/live-status`). Obliga a hacer polling o a cachear, y el prerender quedaría con un estado viejo. El cálculo local es barato y funciona con la página ya cargada.

### 5. Ventana de horarios y franja
Se implementa como componente `ScheduleModal` en `shared/`, con `role="dialog"` y `aria-modal`, cierre con Escape y clic fuera, y foco inicial en el botón ✕. Mientras está abierta bloquea el scroll del `body` y pausa el carrusel. La franja de horarios queda en `home.html` y reutiliza el `heroSchedule` computado actual, al que se agrega la entrada "Devocional".

### 6. Admin
- Rutas nuevas: `banner`, `transmisiones` y `apariencia`. El orden del sidebar sigue el diseño y conserva las vistas que el diseño no trae pero que la especificación exige: Panel, Eventos, Peticiones de oración, Redes, Horarios y en vivo, Transmisiones especiales, Banner principal, Imágenes, Enlaces, Contenido, Apariencia y Cuenta.
- La vista "Pendientes por publicar" del diseño no se implementa (proposal, Impact). El header del shell conserva "Publicar cambios" con el conteo, con el estilo del diseño.
- Panel: tarjetas "Devocional de hoy" (llama a la API de Nuestro Pan Diario desde el admin: "Listo" o "Sin conexión"), "Eventos activos", "Peticiones sin leer" y "Franja en vivo" ("Visible" u "Oculta"), más los bloques "Qué cambia y cada cuánto" (texto fijo) y "Contenido automático".
- La vista Imágenes pierde el slot `hero`: el carrusel lo reemplaza, y la fila de `site_images` se conserva para la siembra del primer banner.

### 7. Imágenes del diseño
`logo-icon-black.png` y `logo-text-white.png` se descargan con `DesignSync get_file` y se optimizan (≤150 KB). El isotipo se usa como `mask-image`, así que basta la versión negra. `icon-180.png`, `icon-512.png` y `og-image.png` reemplazan los íconos y la imagen OG actuales solo si pesan menos de 256 KiB, que es el límite de `get_file`. Si una descarga supera el límite, se deja la imagen actual y se anota en `PROGRESS.md` como pendiente de exportar a mano. Esto ya pasó con las fotos, ver "Bloqueos".

## Risks / Trade-offs

- [El límite de 256 KiB de `get_file` impide bajar las fotos o alguna fuente] → Las fuentes pesan menos. Para las fotos, el administrador sube las imágenes de banner desde el panel nuevo, que es justo para lo que existe.
- [Desajuste de hidratación en SSR por estado dependiente de la hora] → El render del servidor usa un estado neutro y el cálculo real se hace después de hidratar.
- [Una hora escrita libremente ("7 pm", "19h") no se interpreta] → El parser acepta `h`, `h:mm`, `a.m./p.m./am/pm` y 24 h. El admin muestra al lado de cada horario transmitido "No se reconoce la hora" cuando el parser del frontend falla (misma función compartida por copia).
- [Cambiar el tipo de tokens de Tailwind rompe clases en muchas plantillas] → Se reemplazan con búsqueda por `primary|secondary|tertiary` y se verifica que `ng build` no deje clases huérfanas. Además se hace una revisión visual a 1440 y 375 px.
- [Eliminar las columnas de color de V9 no tiene vuelta atrás] → En producción siguen con sus valores por defecto (no se han personalizado), así que no se pierde información. Queda anotado en la migración.

## Migration Plan

1. `./gradlew build` con V10. Luego despliegue normal con `infra/deploy.ps1 -Projects micasachurch`, primero backend y luego frontends: el landing nuevo depende de `/api/banners` y `/api/live-events`, y el viejo ignora los campos nuevos de `/api/site-settings`.
2. Después de desplegar, subir desde el panel las imágenes de los banners 1 y 2 si la siembra no las dejó puestas.
3. Rollback: volver al build anterior de los frontends. El backend nuevo sigue sirviendo los endpoints viejos, salvo los colores de `/api/site-settings`, que el landing viejo trata como opcionales con valores por defecto.

## Open Questions

- Si las fotos reales de la congregación y de los pastores del diseño (`fotos/congregacion.png`, `fotos/pastores.png`) superan 256 KiB, hay que exportarlas a mano desde Claude Design. No cambia el plan.
