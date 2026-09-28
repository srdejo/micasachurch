# Proposal

## Why

La iglesia terminó en Claude Design (proyecto `355f07fc…`, archivos `Mi Casa Church Ocaña.dc.html`, `Mi Casa Church Ocaña · Móvil.dc.html` y `Admin.dc.html`) un rediseño del sitio y del panel. El diseño cambia la portada a un carrusel administrable, hace que "En vivo" se encienda solo según los horarios, agrega transmisiones especiales, una ventana de horarios y temas de color. Además, usa las tipografías oficiales (Gotham y Dharma Gothic), para las que la iglesia confirma tener licencia web. El sitio en producción sigue con la versión anterior (portada fija, franja "En vivo" encendida o apagada a mano, sustitutos libres de las fuentes).

## What Changes

**Marca visual**
- **BREAKING**: se reemplazan League Gothic, Montserrat y Poppins por las fuentes oficiales: **Dharma Gothic E** (Light 300, ExBold 800, Heavy 900) en títulos, en mayúsculas, y **Gotham** (Book 400, Book Italic, Bold 700, Black 900) en texto, etiquetas y botones. Se autoalojan en ambos frontends.
- **BREAKING**: el modelo de color de tres colores (primario, secundario, terciario) se reemplaza por **temas**. Cada tema tiene tres colores: acento, profundo y suave. Hay tres temas predefinidos: Naranja `#FBA504/#9A5B00/#FFF1D2` (activo por defecto), Coral y Celeste. El administrador elige el tema activo y puede editar sus tres colores. Los neutros pasan a ser fijos: tinta `#111110`, crema `#FAF8F4`/`#F1EEE8` y texto claro `#F7F5F0`.
- Logo del header, del footer, del modal y del sidebar del admin: isotipo teñido con el color de acento (máscara CSS) junto al texto "Mi Casa Church" en blanco.

**Landing (escritorio y móvil)**
- Header oscuro en escritorio, con el enlace "Horarios" y el botón "En vivo" cuando hay transmisión. En móvil (≤980 px), header claro con botones de WhatsApp y menú, menú desplegable de página completa y una barra inferior fija con "En vivo" y "WhatsApp".
- **Carrusel de banners** en la portada: N banners administrables (imagen, antetítulo, título, texto, botón, enlace, activo). Rotan cada 6,5 s, con puntos, contador, flechas, pausa al pasar el mouse y deslizamiento táctil en móvil.
- **"En vivo" automático**: la franja muestra "En vivo ahora" durante un horario transmitido o una transmisión especial (hora de Colombia) y, si no hay ninguna, muestra "Próxima transmisión en vivo".
- **Franja de horarios** bajo la portada y **ventana "Horarios"** (horario fijo, transmisiones especiales, dirección, "Cómo llegar" y WhatsApp).
- Todas las secciones se reestilizan según el diseño (Prédicas, Eventos, Redes, Devocional, Oración, Quiénes somos, Ministerios, Ofrendas, Visitar, Síguenos y footer), manteniendo los datos del backend y las correcciones de QA ya especificadas.

**Panel admin**
- Nueva vista **Banner principal**: crear, editar, activar o desactivar, eliminar y subir la imagen de cada banner.
- Nueva vista **Transmisiones especiales**: título, fecha, hora, minutos, enlace y activa. Muestra además el resumen de los horarios fijos que encienden "En vivo".
- Nueva vista **Apariencia**: tres tarjetas de tema con selector y campo hexadecimal por color, y un botón para usar ese tema.
- Horarios: se agrega la duración de cada horario transmitido.
- Shell y Panel reestilizados: sidebar con isotipo, 4 indicadores (devocional de hoy, eventos activos, peticiones sin leer, franja en vivo) y el bloque "Qué cambia y cada cuánto".

## Capabilities

### New Capabilities
- `hero-banners`: carrusel de portada administrable.
- `live-status`: cálculo automático de "En vivo" y "Próxima transmisión", transmisiones especiales y ventana de horarios.

### Modified Capabilities
- `brand-theme`: tipografías oficiales, temas acento/profundo/suave en lugar de tres colores, y uso del isotipo teñido.
- `public-landing`: los accesos "En vivo" usan el enlace de la transmisión activa y el landing tiene una barra inferior fija en móvil.

## Impact

- **Backend**: migración Flyway `V10` (tablas `hero_banners`, `live_events` y `theme_palettes`; `active_theme` en `site_settings`; se eliminan las columnas de color de V9; `duration_minutes` en `service_schedules`; fila sembrada del devocional diario de las 7:00 a.m.). Dominio, servicios y controladores admin/públicos para banners, transmisiones especiales y temas. Imagen por banner usando el `ImageStorage` existente. Nuevas claves i18n en `messages.properties`.
- **frontend-landing**: `home.html/ts` rehecho, `brand-theme.service.ts` pasa a temas, nuevo cálculo de estado en vivo, `styles.css`, `tailwind.config.js`, `public/fonts`, `public/img/brand`, `index.html` (metadatos OG del diseño). `/devocional` solo cambia de tipografía y colores.
- **frontend-admin**: `shell`, `dashboard`, `schedules` y nuevas páginas `banners`, `live-events` y `appearance`; se retira el editor de tres colores del Panel.
- **Licencias**: se usan los archivos Gotham y Dharma que entregó la iglesia; la licencia web queda registrada en `docs/DECISIONS.md`.
- **Fuera de alcance**: la cola "Pendientes por publicar" con el detalle de cada campo (el diseño la muestra; hoy solo existe el conteo y "Publicar cambios"). Los banners, transmisiones y temas se guardan al vuelo, como hoy horarios y enlaces. También quedan fuera la página `Devocional.dc.html`, los correos y la imagen OG como pantalla.
