# Design

## Context

- `frontend-landing` es una página prerenderizada (`RenderMode.Prerender` para `**`, `/devocional` en cliente). Los datos (contenido, enlaces, ajustes) se piden a la API en `ngOnInit`, así que el HTML estático lleva los valores del build y el cliente los refresca.
- La paleta vive en `tailwind.config.js` de cada frontend (Tailwind v4 vía `@config`) con tokens `cream`, `ink.*`, `terracotta`, `gold`, `section.*`; las fuentes vienen de Google Fonts (`Instrument Serif`, `Karla`) en `styles.css`. `h1, h2, h3` usan `font-serif`.
- `site_settings` es una fila única (`live_banner_visible`), se edita al vuelo con `PATCH /api/admin/site-settings` (fuera del flujo de borrador/publicación de V7) y la lee el landing en `/api/public/...`.
- `site_contents` es clave/valor con `label` y borrador (`draft_value`, `has_draft`, V7). No tiene noción de sección ni orden.
- Invitación y restablecimiento comparten `PasswordResetToken` y la ruta `/restablecer-clave?token=…`. El usuario (`username`) es distinto del correo y el correo no es único.
- El modal "En vivo" incrusta `facebook.com/plugins/page.php`; ese plugin lo bloquean muchos navegadores/antirrastreo y en móvil no muestra video. El enlace `facebook` sembrado en V2 (`https://facebook.com/micasachurch`) no coincide con la página usada en el iframe (`100064597875305`).
- Los QR de ofrendas son las piezas gráficas completas (JPEG de 720 px) mostradas a ~160 px, con el QR ocupando menos de la mitad.
- Los logos HD (`pginaweb/Logos`, 4500×4500) incluyen: logotipo horizontal a color (`Mi CasaChurch_2.jpg`, fondo blanco), variante con texto blanco (`Mi CasaChurch_1.jpg`/`MiCasaChurch_1.png`), isotipo negro (`Mi CasaChurch_3.jpg`, `MiCasaChurch_5.png`) y variantes blancas (`Mi CasaChurch_4.jpg`, `MiCasaChurch_2.png`, `MiCasaChurch_6.png`). Los PNG se asumen con transparencia — verificar al procesarlos.

## Goals / Non-Goals

**Goals:**
- Un único punto de verdad para la paleta (variables CSS) que sirva a Tailwind y que el landing pueda sobreescribir en tiempo de ejecución.
- Resolver los bugs de raíz (quitar el embed de Facebook) en vez de parchar síntomas.

**Non-Goals:**
- Aplicar los colores configurados al propio panel: el admin usa la paleta de marca fija; solo el landing refleja los colores guardados.
- Editor de tipografías o de logos desde el admin; la carga de imágenes existente (`logo`, `hero`, `quienes_somos`) no cambia.
- Regenerar favicons/íconos PWA u OG image.
- Login por correo.

## Decisions

### 1. Paleta como variables CSS + tokens Tailwind semánticos
`styles.css` define `--color-primary: #f89e1b; --color-secondary: #000000; --color-tertiary: #ffffff;` en `:root`, y `tailwind.config.js` mapea `primary`, `secondary`, `tertiary` a `var(--color-…)`. Los tonos intermedios que hoy dan `ink-soft/muted/subtle` y `section-alt/light` se derivan con `color-mix()` sobre esas tres variables (p. ej. `secondary-muted = color-mix(in srgb, var(--color-secondary) 62%, var(--color-tertiary))`), así un cambio de color desde el admin mantiene coherentes los derivados. Los modificadores de opacidad de Tailwind v4 (`bg-secondary/10`) funcionan sobre `var()` porque generan `color-mix`.
Se renombran las clases en los templates (`ink`→`secondary`, `cream`→`tertiary`, `terracotta`/`gold`→`primary`) en lugar de redefinir los nombres viejos, para que el código no mienta sobre el color.
*Alternativa descartada*: mantener hex fijos en `tailwind.config.js` — impide colores dinámicos.

### 2. Colores dinámicos vía `site_settings`
Migración `V9` agrega `primary_color`, `secondary_color`, `tertiary_color VARCHAR(7) NOT NULL` con los valores de marca por defecto. `SiteSettings` gana los tres campos con validación de dominio (`^#[0-9a-fA-F]{6}$`, clave i18n `sitesettings.invalid_color`). El `PATCH` existente acepta los campos (parcial: los ausentes no cambian). La respuesta pública de ajustes incluye los colores. Se guardan al vuelo, igual que `liveBannerVisible` (no entran al flujo de borrador).
En el landing, al recibir los ajustes se escribe `document.documentElement.style.setProperty('--color-primary', …)` solo en el navegador (`isPlatformBrowser`). El HTML prerenderizado lleva los colores por defecto; si hay colores personalizados habrá un cambio breve al hidratar — aceptable para un sitio de una sola iglesia.
En el admin, la edición va en una tarjeta propia del Panel (el interruptor del banner vive en "Horarios y en vivo", que no es lugar para la marca), con `<input type="color">` + campo hex, vista previa y botón "Restablecer colores de marca". El panel usa la paleta fija y agrega `primary-strong` (`#9c5800`) para texto naranja sobre fondo claro, porque el naranja de marca no alcanza contraste legible como texto.
*Alternativa descartada*: inyectar los colores en el render del servidor — el landing es prerender estático; exigiría pasar a SSR por petición.

### 3. Tipografías libres autoalojadas
Gotham y Dharma Gothic son comerciales, así que se usan los equivalentes libres (OFL) más cercanos con la misma estructura de roles:
- **Títulos**: League Gothic, sustituto de Dharma Gothic E ExBold (gótica condensada, con minúsculas). Se descarta Bebas Neue porque solo tiene mayúsculas y Dharma no; Oswald es menos condensada.
- **Subtítulos, etiquetas, botones y cifras**: Montserrat Bold, sustituto habitual de Gotham Bold (misma familia geométrica, ya presente en el proyecto).
- **Texto**: Montserrat Regular, con Poppins Regular como alternativa.

Copiar a `public/fonts/` de cada frontend solo los archivos usados, en `woff2` (`npx ttf2woff2`): `LeagueGothic-Regular` (descargado del repositorio de Google Fonts, `ofl/leaguegothic`), `Montserrat-Regular`, `Montserrat-Bold`, `Poppins-Regular` (de `pginaweb/MI CASA`). `@font-face` con `font-display: swap`. Tokens Tailwind: `font-display` (League Gothic → Impact → sans-serif) y `font-sans` (Montserrat → Poppins → system-ui). `h1, h2` usan `font-display`; `h3`, etiquetas en mayúscula, botones y cifras destacadas usan `font-bold` (Montserrat 700 es un peso de la misma familia, así que no hace falta un token aparte). Se elimina el `@import` de Google Fonts.

Escala de tamaños ajustada a League Gothic (condensada: necesita más tamaño que la serif actual para mantener presencia) y a Montserrat Bold (más ancha que Instrument Serif: necesita menos):

| Elemento | Actual | Nuevo (escritorio / móvil) |
|---|---|---|
| h1 del hero | `clamp(52px,6vw,86px)` / 46px | `clamp(64px,7.5vw,104px)` / 56px, `leading-[0.92]` |
| h2 de sección | 50–54px / 34px | 60px / 42px, `leading-[0.95]`, `tracking-[0.01em]` |
| Títulos de tarjeta (serif 26–40px) | 26–40px | Montserrat Bold 20–22px / 18–20px |
| Cifras (días, cuentas) | serif 22–30px | Montserrat Bold 20–24px |
| Etiquetas en mayúscula | Karla 12.5px | Montserrat Bold 12px, `tracking-[0.16em]` |
| Texto corrido | Karla 15–18px | Montserrat 15–17px, `leading-[1.65]` |

La misma escala aplica al panel (títulos de vista con `font-display`). Se valida a ojo en 1440, 375 y 360 px.
*Alternativa descartada*: cargar desde Google Fonts. Mezcla orígenes y depende de terceros; autoalojar es más simple y predecible.

### 4. Logos
Generar con `npx sharp-cli` versiones recortadas al contenido y reducidas (≈ 480 px de ancho para el logotipo, 256 px para el isotipo), PNG transparente o WebP, en `public/img/brand/` de cada frontend: `logo-horizontal.png` (texto negro), `logo-horizontal-light.png` (texto blanco), `isotipo.png`, `isotipo-light.png`. Header del landing: logotipo horizontal (reemplaza el círculo + texto); footer y secciones oscuras: variante clara. Admin: isotipo en login/forgot/reset; logotipo claro en el sidebar oscuro. La imagen `logo` subida por el admin sigue existiendo pero el header deja de depender de ella (evita el fallback con "M").

### 5. "En vivo" = enlace a Facebook
Se eliminan `liveModalOpen`, `openLiveModal`, `closeLiveModal` y el modal. Todos los controles pasan a `<a [href]="facebookUrl()" target="_blank" rel="noopener">`, con `facebookUrl()` = enlace `facebook` administrable o, por defecto, `https://www.facebook.com/micasachurchocana`. `V9` actualiza el enlace `facebook` a esa URL solo si aún tiene el valor sembrado (`https://facebook.com/micasachurch`), para no pisar un cambio hecho desde el admin. Esto elimina los bugs 4 (plugin sin imagen), 5 y 10 (salto de scroll al cerrar: el modal desmontaba el iframe/foco). Registrar la decisión en `docs/DECISIONS.md`.

### 6. Contenido: nuevas claves y agrupación por sección
`V9` agrega a `site_contents` las columnas `section VARCHAR(32)` y `display_order INT`, rellena las claves existentes y siembra `predicas_title`, `predicas_copy`, `quienes_somos_title` con los textos actuales. Secciones: `inicio`, `predicas`, `quienes_somos`, `ofrendas`. Las etiquetas pasan a ser cortas ("Título", "Párrafo 1") porque el grupo ya da el contexto. La API admin devuelve `section` y el panel agrupa por él con un nombre legible definido en el frontend. Los nuevos textos siguen el flujo de borrador/publicación existente.

### 7. Invitación: mostrar el usuario
Nuevo endpoint público `GET /api/admin/auth/reset-token?token=…` → `{ username }` si el token existe, no está usado ni vencido; 404 con `passwordreset.invalid_token` si no. Un token es un secreto de un solo uso con TTL, así que revelar el usuario a su portador no expone nada nuevo. La página `/restablecer-clave` lo consulta al cargar, muestra "Tu usuario es: X" y, al terminar, "Ir a iniciar sesión" navega a `/login?usuario=X`; el login prellena el campo. La plantilla `invite-admin.html` hoy solo saluda con el usuario ("Hola, X:"), así que se agrega un bloque destacado "Tu usuario para ingresar: X".
*Alternativa descartada*: permitir el login con correo. `admin_users.email` no es único (V6), así que un correo podría corresponder a varias cuentas; habría que agregar una restricción de unicidad y resolver los duplicados que existan. Enviar el usuario en el correo resuelve el bug sin cambiar la autenticación.

### 8. Confirmación de clave
El formulario de restablecer y el de "Mi cuenta" pasan a leer los valores de los controles del formulario en el `submit` (no solo los signals), limpian el error al editar cualquiera de los campos y bloquean el envío si no coinciden. La primera tarea es reproducir el bug (pegar/autocompletar con el gestor de claves de Chrome) para confirmar la causa; si es otra, la corrección se ajusta sin cambiar la spec.

### 9. Validación del formulario de oración
Validación en el cliente con los patrones de la spec (`^[\p{L} ]{1,80}$`u y `^\+?\d{7,15}$`), mensajes por campo y el botón que siempre muestra el motivo si no se envía. En el backend, `PrayerRequestSubmission` agrega `@Pattern`/`@Size` con claves i18n. Los valores se recortan (`trim`) antes de validar.

### 10. QR y responsive
- QR: recortar el código de cada pieza (`sharp-cli extract`) a `qr-crediservir-code.png` / `qr-bancolombia-code.png`, con margen blanco (zona de silencio), mostrarlos hasta 340 px envueltos en un enlace a la misma imagen en tamaño completo (936 px). El QR de Bancolombia es denso: se verificó con `jsqr` que se decodifica desde ~240 px, por eso no se muestra más pequeño. Probar con la app de cada banco; si el recorte de 720 px no escanea, pedir a la iglesia los QR originales (ver Riesgos).
- Móvil: en Síguenos, tamaño de texto menor y `break-words`/`min-w-0` en las tarjetas; eliminar el `-mx-[22px]` del carrusel de eventos si es la causa del ancho extra y añadir `overflow-x: clip` en `html, body` como red de seguridad. Verificar en 360 y 375 px con el navegador.

## Risks / Trade-offs

- [League Gothic y Montserrat Bold no son idénticas a Dharma y Gotham] → Son los equivalentes libres más cercanos; si la iglesia compra las licencias, basta cambiar los archivos y el `font-family` de los tokens `display`/`heading`.
- [Un color configurado puede dejar texto ilegible, p. ej. primario claro con texto terciario] → Regla fija: texto sobre primario usa el secundario; el panel muestra una vista previa de contraste. No se valida contraste automáticamente (fuera de alcance).
- [Breve cambio de color al hidratar si hay colores personalizados] → Aceptado; los valores por defecto son los de marca, así que el caso normal no parpadea.
- [QR recortados de un JPEG de 720 px pueden seguir sin escanear] → Pedir los QR originales en alta resolución a la iglesia; el cambio de layout funciona igual con los nuevos archivos.
- [Quitar el modal significa que el visitante sale del sitio para ver el en vivo] → Se abre en pestaña nueva; el sitio queda donde estaba.
- [Renombrar clases de color en muchos templates] → Hacerlo por búsqueda/reemplazo por token y revisar visualmente cada sección; builds de ambos frontends deben pasar.

## Migration Plan

1. Backend: `V9__brand_colors_and_content_sections.sql` (colores en `site_settings`, `section`/`display_order` en `site_contents`, nuevas claves, enlace de Facebook). Es aditiva; los valores por defecto hacen que un frontend viejo siga funcionando.
2. Desplegar backend, luego ambos frontends.
3. Rollback: frontends anteriores siguen funcionando con el backend nuevo (campos extra ignorados). Revertir la migración no es necesario.
