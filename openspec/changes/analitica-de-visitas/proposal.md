# Proposal

## Why

Hoy no hay forma de saber cuántas personas visitan micasachurch.co, qué páginas leen ni qué acciones usan (ver la transmisión, escribir por WhatsApp, enviar una petición de oración, leer la Biblia en un año). Queremos medirlo con **Google Analytics 4**, sin instalar nada en el servidor.

## What Changes

- El sitio público (`frontend-landing`) carga la etiqueta de GA4 (`gtag.js`) solo en el navegador y solo si hay un ID de medición configurado. Mide visitas, páginas vistas (incluida la navegación a `/devocional` sin recarga), procedencia, país y dispositivo.
- **Sin banner de cookies**, por decisión del usuario: GA4 mide desde que el visitante entra.
- Se registran como eventos de GA4 los clics importantes:
  - "En vivo", por origen.
  - WhatsApp, por origen.
  - Petición de oración enviada con éxito, sin su contenido.
  - Abrir una lectura de "La Biblia en un año".
  - Reproducir el audio del devocional.
  - "Cómo llegar".
  - Redes sociales.
- El panel administrativo gana una vista **"Estadísticas"** que muestra incrustado un informe de **Looker Studio** conectado a GA4, con un enlace para abrir Google Analytics.
- En el entorno local la etiqueta se carga en modo depuración, y las visitas locales quedan fuera de los informes gracias al filtro de "tráfico de desarrolladores" de GA4.
- Sin ID configurado (desarrollo, tests), no se carga nada y el sitio funciona igual.
- **Fuera de alcance:**
  - Banner o gestión de consentimiento.
  - Medir el panel administrativo.
  - Excluir las visitas del propio administrador.
  - Reportes propios en el backend.
  - Instalar cualquier cosa en el VPS.

## Capabilities

### New Capabilities
- `site-analytics`: medición de visitas y eventos del sitio público con GA4, reglas de privacidad de los eventos (sin datos personales, nada se carga sin configuración) y consulta de estadísticas desde el panel.

### Modified Capabilities
<!-- Ninguna: los eventos se agregan sin cambiar el comportamiento que ya describen public-landing, bible-reader ni admin-accounts. -->

## Impact

- **`frontend-landing`**:
  - La configuración `analytics` (ID de medición y modo depuración) en `environments/`.
  - Un servicio en `core/` que carga `gtag.js` y expone `track()`.
  - Una directiva para registrar clics.
  - Marcas en los controles de `pages/home`, `shared/schedule-modal`, `shared/audio-player` y `shared/devotional-article`.
- **`frontend-admin`**: la ruta y la vista `estadisticas`, el ítem en el sidebar, y `statsReportUrl` y `statsAppUrl` en `environments/`.
- **Backend e infraestructura**: sin cambios.
- **Acciones del usuario en Google** (con su cuenta, desde el navegador):
  - Crear la propiedad GA4 y su flujo web para `micasachurch.co` y entregar el ID `G-…`.
  - Registrar las dimensiones personalizadas de los eventos.
  - Activar el filtro de tráfico de desarrolladores.
  - Armar el informe de Looker Studio y activar su inserción.
- **Documentación**: `docs/ARCHITECTURE.md` y `docs/DECISIONS.md` (GA4 sin banner y sus implicaciones) y `docs/DEPLOYMENT.md` (IDs y URLs por entorno).
