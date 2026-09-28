# Tasks

## 1. Propiedad de Google Analytics 4

- [x] 1.1 **Con el usuario**, en analytics.google.com con la cuenta de la iglesia:
  - crear la propiedad "Mi Casa Church" (zona horaria Colombia, moneda COP) y el flujo web `https://micasachurch.co`, con la medición mejorada activa, incluidos los cambios de página por historial
  - registrar las dimensiones personalizadas de evento `origen`, `referencia`, `pagina` y `red` (design.md §2)
  - activar el filtro de datos "Tráfico de desarrolladores" en estado **Activo** (design.md §4)

  Verificar que el usuario entrega el ID `G-…` y que las cuatro dimensiones y el filtro aparecen en Administrar.

## 2. Medición en `frontend-landing`

- [x] 2.1 Agregar `analytics: { measurementId, debug }` a los tres `environments/`:
  - `environment.ts` sin ID
  - `environment.local.ts` con el ID y `debug: true`
  - `environment.prod.ts` con el ID y `debug: false`

  Crear `core/analytics.service.ts` (design.md §1) y registrarlo con `provideAppInitializer` en `app.config.ts`. Verificar con `analytics.service.spec.ts`:
  - sin ID no inyecta nada ni define `gtag`
  - en plataforma servidor no inyecta nada
  - en navegador inyecta un único `<script async>` con el ID y deja en `dataLayer` el `config` con `debug_mode` solo cuando `debug` es true
  - `track` sin `gtag`, o con uno que lanza, no rompe
- [x] 2.2 Crear la directiva `shared/track-click` (design.md §3) y aplicarla según el spec `site-analytics`:
  - `pages/home/home.html`: controles "En vivo" (header, franja, barra móvil, menú móvil, tarjeta móvil), enlaces de WhatsApp con su `origen`, "Cómo llegar" y redes sociales con `red`
  - `shared/schedule-modal`: "En vivo" con `origen: horarios` y WhatsApp
  - `shared/devotional-article`: botones de "La Biblia en un año" con `referencia`

  Verificar con `track-click.spec.ts` (el clic llama `track` con nombre y parámetros sin impedir la acción del control) y ampliando `home.spec.ts`, `schedule-modal.spec.ts` y `devotional-article.spec.ts` para comprobar que cada control envía su evento.
- [x] 2.3 Eventos por código (design.md §3):
  - `peticion_oracion` tras el POST exitoso del formulario de oración en `pages/home`
  - `devocional_audio` en el primer `play` por `src` de `shared/audio-player`, con una entrada nueva `pagina` que pasan `home` (`inicio`) y `devotional-article` (`devocional`)

  Verificar con tests:
  - envío válido llama `track('peticion_oracion')` sin parámetros
  - envío inválido y error del servidor no lo llaman
  - reproducir, pausar y reproducir lo llama una sola vez con `{ pagina }`
  - cambiar `src` y reproducir lo llama de nuevo
- [ ] 2.4 `ng build` y `ng test` en verde. Luego `local-deploy.ps1 -Project micasachurch` y, en `http://micasachurch.test` con DebugView de GA4 abierto:
  - navegar inicio → `/devocional` → otra fecha
  - pulsar "Cómo llegar", WhatsApp, una red social y un botón de la Biblia
  - reproducir el audio
  - enviar una petición válida y otra vacía

  Verificar en DebugView las vistas de `/` y `/devocional` y cada evento con su parámetro, y que la petición vacía no aparece.

## 3. Vista "Estadísticas" en `frontend-admin`

- [x] 3.1 Agregar `statsReportUrl` y `statsAppUrl` a los `environments/` del admin (vacíos hasta la tarea 5.1). Crear `pages/stats` con:
  - `iframe` a ancho completo y alto de la ventana
  - "Abrir Google Analytics" en pestaña nueva
  - el mensaje "Las estadísticas no están disponibles en este momento." sin `statsReportUrl`

  Agregar la ruta `estadisticas` y el ítem "Estadísticas" en `layout/shell/shell.ts`, después de "Panel". Verificar con `stats.spec.ts`:
  - con URL hay `iframe` con ese `src` y el enlace
  - sin URL, el mensaje y el enlace

  Además, `ng build` en verde.

## 4. Documentación

- [x] 4.1 `docs/ARCHITECTURE.md` y `docs/DECISIONS.md`: GA4 cargado desde el cliente, sin banner por decisión del usuario, eventos sin datos personales, y Umami evaluado y descartado. `docs/DEPLOYMENT.md`: ID de medición y URLs del informe por entorno, filtro de desarrolladores y dimensiones personalizadas. Verificar leyendo que no se duplique contenido.

## 5. Informe y publicación

- [ ] 5.1 **Con el usuario**, en lookerstudio.google.com:
  - crear un informe conectado a la propiedad GA4 con visitantes, vistas, páginas más vistas, procedencia, países, dispositivos, eventos por nombre con sus dimensiones, y control de periodo
  - "Habilitar inserción"
  - compartir como "Cualquier persona con el enlace puede ver" (design.md §5)

  Poner la URL de inserción en `statsReportUrl` y la de la propiedad en `statsAppUrl` de `environment.prod.ts` y `environment.local.ts` del admin. Verificar que la URL de inserción abre el informe en una ventana privada sin sesión de Google.
- [ ] 5.2 `ng build` y `ng test` de ambos frontends en verde. Desplegar con `infra/deploy.ps1 -Projects micasachurch -Action Frontend` desde PowerShell, y también en local. En producción verificar:
  - en "Tiempo real" de GA4 aparecen la visita a `https://micasachurch.co/`, `/devocional` y un evento pulsado
  - con `gtag.js` bloqueado en el navegador, "En vivo" y el lector siguen funcionando sin errores
  - en `https://admin.micasachurch.co/estadisticas` se ve el informe incrustado y "Abrir Google Analytics" abre la propiedad

  Anotar el resultado en `docs/PROGRESS.md`.
