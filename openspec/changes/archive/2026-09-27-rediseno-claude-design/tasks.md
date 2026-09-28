# Tasks

## 1. Recursos del diseño

- [x] 1.1 Descargar con `DesignSync get_file` (proyecto `355f07fc-cf88-404d-9008-dc0c64286996`) las 7 fuentes de `fonts/`, convertirlas a `.woff2` y copiarlas a `frontend-landing/public/fonts/` y `frontend-admin/public/fonts/`; eliminar League Gothic, Montserrat, Poppins y sus `OFL-*.txt`. Verificar que los 7 `.woff2` existen en ambos proyectos
- [x] 1.2 Descargar `fotos/logo-icon-black.png`, `fotos/logo-text-white.png`, `fotos/icon-180.png`, `fotos/icon-512.png` y `fotos/og-image.png`, optimizarlas y colocarlas en `public/img/brand/` (y los íconos y la OG del landing). Verificar que ninguna supera 150 KB; anotar en `docs/PROGRESS.md` las que no se pudieron bajar por el límite de 256 KiB
- [x] 1.3 Intentar bajar `fotos/congregacion.png` y `fotos/pastores.png` para sembrar los banners; si superan el límite, anotarlo en `docs/PROGRESS.md` (bloqueo existente de fotos). Verificar el resultado en el log de la descarga
- [x] 1.4 Registrar en `docs/DECISIONS.md` la licencia web de Gotham/Dharma (revierte la decisión OFL del 2026-09-27), los temas de color y el cálculo de "En vivo" en el cliente. Verificar que la entrada existe y enlaza este cambio

## 2. Backend: migración y temas

- [x] 2.1 Crear `V10__redesign_banners_live_themes.sql`: `theme_palettes` (sembrada con Naranja, Coral y Celeste), `site_settings.active_theme` con FK, eliminar `primary/secondary/tertiary_color`, `service_schedules.duration_minutes` (120 por defecto) más la fila "Todos los días · 7:00 a.m." de 45 min, `hero_banners` con los 3 banners sembrados y `live_events`. Verificar con `./gradlew :bootstrap:bootRun` contra el Postgres local que Flyway aplica V10 sin errores
- [x] 2.2 Dominio y aplicación de temas: `ThemePalette` con la validación hex movida desde `SiteSettings`, repositorio, `ThemePaletteService` y `SiteSettings` con `activeTheme` y sin colores. Verificar con tests unitarios de validación (`#fff`, `naranja` rechazados; `#F89E1B` normalizado)
- [x] 2.3 Infraestructura de temas: entidad/adaptador JPA, `GET /api/admin/themes`, `PATCH /api/admin/themes/{name}`, `PATCH /api/admin/site-settings` con `activeTheme` y `GET /api/site-settings` con `activeTheme`, `accentColor`, `deepColor` y `softColor`. Claves i18n `theme.invalid_color` y `theme.not_found` en `messages.properties`. Verificar con `./gradlew build` y `curl` al endpoint público

## 3. Backend: banners

- [x] 3.1 Dominio `HeroBanner` (título obligatorio, validación de enlace `#…`/`/…`/`https://…`), repositorio y `HeroBannerService` (crear, actualizar, activar, eliminar, ordenar y asignar imagen). Verificar con tests unitarios del enlace inválido `javascript:` y del título vacío
- [x] 3.2 Infraestructura: JPA/adaptador, `AdminHeroBannerController` (`GET/POST /api/admin/banners`, `PATCH/DELETE /{id}`, `PUT /order`, `POST /{id}/image` con `ImageStorage` y clave `banner-{id}`, borrando el archivo al eliminar) y `GET /api/banners` público (solo activos y ordenados, con `imageUrl`). Claves i18n `hero_banner.*`. Verificar con `./gradlew build` y `curl`: crear, subir imagen (y rechazo de 8 MB), listar público y eliminar

## 4. Backend: transmisiones especiales y duración de horarios

- [x] 4.1 Dominio `LiveEvent` (título, fecha y hora obligatorios, duración ≥15 en múltiplos de 15, URL `https://`), repositorio y servicio. Verificar con tests unitarios de duración 5 min rechazada y URL no https rechazada
- [x] 4.2 Infraestructura: `AdminLiveEventController` (`/api/admin/live-events` CRUD) y `GET /api/live-events` público (activas desde hoy en `America/Bogota`). Claves i18n `live_event.*`. Verificar con `./gradlew build` y `curl`
- [x] 4.3 `ServiceSchedule.durationMinutes` en dominio, JPA, DTOs admin/público y validación (≥15). Verificar con `./gradlew build` y que `GET /api/services` incluye `durationMinutes` y la fila del devocional

## 5. frontend-landing: base visual

- [x] 5.1 `styles.css` y `tailwind.config.js`: `@font-face` de Dharma y Gotham, variables `--accent`, `--accent-deep` y `--accent-soft` (Naranja por defecto), tokens de neutros (`ink`, `ink-2`, `cream`, `cream-2`, `paper`, `muted`, `body`) y `font-display`/`font-sans`; quitar `primary`, `secondary` y `tertiary`. Verificar que `ng build` pasa y que no queda ninguna clase `primary|secondary|tertiary` (grep vacío)
- [x] 5.2 `ChurchApiService` con `getBanners()`, `getLiveEvents()` y `SiteSettings` nuevo; `BrandThemeService` aplica los tres colores del tema activo. Verificar con un test unitario del servicio que ignora hex inválidos
- [x] 5.3 Función pura `core/live-status.ts` (hora de Bogotá, parser de horas, "Todos los días", prioridad de las especiales, `next`, filas del modal) con tests para cada escenario de `specs/live-status`. Verificar con `ng test` en verde

## 6. frontend-landing: página

- [x] 6.1 Header de escritorio oscuro (isotipo con máscara en el acento, logotipo de texto, nav, Horarios, En vivo condicional, Planea tu visita) y header/menú móvil claro con WhatsApp. Verificar a 1440 y 375 px contra las capturas del diseño
- [x] 6.2 Componente `HeroCarousel` (rotación cada 6,5 s, pausa con hover y con el modal, puntos, contador, flechas, swipe, banner por defecto, `#horarios` abre el modal, solo el visible es interactivo; SSR renderiza el primero). Verificar con tests del componente (avance, pausa, sin banners) y a mano en el navegador
- [x] 6.3 Franjas "En vivo ahora" / "Próxima transmisión" (respetando `liveBannerVisible`), recálculo cada 30 s, y franja de horarios en el acento con "Todos los horarios"; en móvil, tarjeta "En vivo · 7:00 a.m." y tarjetas de horarios. Verificar simulando la hora (test de `live-status` + prueba manual cambiando el reloj del sistema a las 7:10 a.m.)
- [x] 6.4 Componente `ScheduleModal` (filas del horario con la fila en vivo resaltada, especiales de 7 días, dirección, Cómo llegar y WhatsApp; Escape, ✕ y clic fuera; `role="dialog"`). Verificar con test del componente (cierre con Escape) y a mano
- [x] 6.5 Reestilizar Prédicas, Eventos (carrusel horizontal en móvil), Redes, Devocional (tarjeta `accent-soft`), Oración, Quiénes somos, Ministerios, Ofrendas (QR recortados actuales), Visitar, Síguenos (al final) y el footer según el diseño, conservando los datos del backend y las reglas de `openspec/specs/public-landing`. Verificar con `ng test` en verde y recorrido a 1440/375/360 px sin scroll horizontal
- [x] 6.6 Barra inferior fija en móvil (En vivo / WhatsApp, `env(safe-area-inset-bottom)`) y `index.html` con los metadatos OG y `theme-color #111110` del diseño. Verificar que el footer queda visible por encima de la barra a 375 px
- [x] 6.7 `/devocional` con las nuevas fuentes y tokens. Verificar `ng build` y revisión visual

## 7. frontend-admin

- [x] 7.1 Fuentes, tokens y shell: sidebar oscuro de 268 px con el isotipo en el acento, "Mi Casa Church · Administración", nav en el orden de `design.md` §6, "Ver la página →" y header de vista con título en Dharma más "Publicar cambios" con conteo; el admin aplica el tema activo. Verificar con `ng build` y revisión visual a 1440 px
- [x] 7.2 Panel reestilizado con las 4 tarjetas (devocional de hoy, eventos activos, peticiones sin leer, franja en vivo), "Qué cambia y cada cuánto" y "Contenido automático"; se retira el editor de tres colores. Verificar a mano con el backend local
- [x] 7.3 Vista **Banner principal** (`/banner`): lista con vista previa 16:9 y número, subir imagen, antetítulo, título, texto, texto y enlace del botón, activar/desactivar, eliminar con confirmación, nuevo banner y errores del backend visibles. Verificar creando, editando, subiendo imagen y desactivando un banner, y viendo el resultado en el landing local
- [x] 7.4 Vista **Transmisiones especiales** (`/transmisiones`): resumen de horarios transmitidos, lista editable (título, fecha, hora, minutos y enlace), activar, eliminar y estado vacío. Verificar creando una transmisión para dentro de 5 minutos y viendo "En vivo ahora" en el landing local
- [x] 7.5 Vista **Apariencia** (`/apariencia`): tres tarjetas con muestra de colores, selector y campo hex por color (borde de error si es inválido), "Usar este tema" con indicación del activo. Verificar activando Coral y viendo el landing local en coral
- [x] 7.6 Horarios: campo de duración por horario y aviso "No se reconoce la hora" cuando el parser falla; Imágenes sin el slot `hero`. Verificar con `ng build` y `ng test` (Node 24) en verde

## 8. Integración

- [x] 8.1 Recorrido completo en local (backend `:8088`, landing `:4200`, admin `:4300`) a 1440, 390, 375 y 360 px: carrusel, En vivo automático, modal, temas y banners editados desde el admin. Anotar el resultado en `docs/PROGRESS.md` sin marcar nada "en producción" hasta que Daniel despliegue y confirme
- [x] 8.2 `./gradlew build`, `ng build` y `ng test` de ambos frontends en verde; `openspec validate rediseno-claude-design --strict` sin errores
