# Proposal

## Why

La revisión de QA de la iglesia (`bugs-encontrados-pagina-web.md`, 15 hallazgos con evidencia en `bugs-img/`) encontró fallos en el panel (cambio de clave, invitaciones) y en el landing (modal de Facebook roto, saltos de scroll, QR que no se escanean, desbordes en móvil, textos no editables). A la vez, la iglesia entregó su identidad visual oficial (logos HD en `pginaweb/Logos`, tipografías en `pginaweb/MI CASA`, paleta `#f89e1b` / `#000000` / `#ffffff`) y el sitio sigue con la paleta y tipografías provisionales (terracota/crema, Instrument Serif + Karla). Conviene resolver ambas cosas antes del despliegue a producción.

## What Changes

**Marca visual**
- Reemplazar tipografías con equivalentes libres (OFL) de la guía de marca: títulos en **League Gothic** (sustituto de Dharma Gothic E ExBold) y **Montserrat Bold** (sustituto de Gotham Bold) para subtítulos, etiquetas y botones; texto en **Montserrat Regular** con **Poppins Regular** como alternativa. Autoalojadas en ambos frontends, con la escala de tamaños ajustada a las nuevas fuentes.
- Reemplazar la paleta provisional por tres colores de marca: primario `#f89e1b`, secundario `#000000`, terciario `#ffffff`.
- **Colores editables desde el admin**: tres campos (primario, secundario, terciario) en Ajustes; el landing los aplica en tiempo de ejecución, con los valores de marca como predeterminados.
- Usar los logos HD: logotipo horizontal en el header y el footer del landing, variante blanca sobre fondos oscuros, isotipo en el login/recuperación del admin y en el sidebar. Íconos y favicon se mantienen.

**Bugs del panel admin**
- (1) Reparar la validación "Las claves no coinciden" al restablecer la clave y agregar confirmación de clave al cambio de clave en "Mi cuenta"; con error visible, nunca se guarda.
- (2) El correo de invitación incluye de forma destacada el **usuario** para ingresar, y la página de invitación/restablecer también lo muestra y lo deja prellenado en el login. El login sigue siendo por usuario (el correo no es único).
- (3, 8) Hacer editables desde "Contenido" el bloque de Prédicas (título y texto) y el título de "Quiénes somos"; agrupar los campos de Contenido por sección del sitio con etiquetas claras.

**Bugs del landing**
- (4, 5, 10) **BREAKING (UX)**: se elimina el modal con el plugin de Facebook. Todos los accesos "En vivo" abren la página de Facebook (enlace `facebook` administrable, `https://www.facebook.com/micasachurchocana`) en una pestaña nueva.
- (6) Se quita el botón "Ya estoy en una" de la sección de Redes.
- (7) Los QR de ofrendas se muestran recortados y a mayor tamaño, con opción de abrirlos en tamaño completo.
- (8) "Cómo llegar" en Quiénes somos abre Google Maps directamente.
- (9) La sección "Síguenos" pasa al final de la página (antes del footer).
- (11, 12) Validaciones del formulario de oración: petición obligatoria con mensaje visible; nombre solo letras y espacios; WhatsApp solo dígitos (con `+` inicial opcional) y longitud válida.
- (13) El devocional tiene un enlace visible "Volver al inicio".
- (14, 15) Corregir desbordes en móvil: tarjetas de Síguenos y ningún scroll horizontal en toda la página.

## Capabilities

### New Capabilities
- `brand-theme`: tipografías, paleta configurable (primario/secundario/terciario) y uso de logos en landing y admin.
- `public-landing`: comportamiento del sitio público afectado por los bugs (en vivo, orden de secciones, formularios, QR, navegación, responsive).
- `admin-accounts`: cambio y restablecimiento de clave e invitación de administradores.
- `site-content`: textos editables del landing desde el panel y su organización por sección.

### Modified Capabilities
<!-- openspec/specs/ está vacío: no hay capacidades previas que modificar. -->

## Impact

- **Backend**: migración Flyway nueva (columnas de color en `site_settings`, nuevas claves y columna de sección en `site_contents`); `SiteSettings` dominio/servicio/controladores; endpoint público para leer el usuario asociado a un token de invitación/restablecimiento; plantilla de correo de invitación; mensajes i18n en `messages.properties`.
- **frontend-landing**: `home.html/ts`, `devocional.html`, `styles.css`, `tailwind.config.js`, `index.html`, `public/fonts`, `public/img/brand`, QR recortados.
- **frontend-admin**: `reset-password`, `account`, `content`, página de ajustes (colores), `shell`, `login`, `tailwind.config.js`, `styles.css`, fuentes y logos.
- **Licencias**: todas las fuentes son libres (OFL); no se usan los archivos de Gotham ni Dharma Gothic de `pginaweb/MI CASA`.
- **Docs**: `docs/PROGRESS.md`, `docs/DECISIONS.md` (decisión de quitar el embed de Facebook y colores dinámicos).
