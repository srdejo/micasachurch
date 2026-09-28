# Design

## Context

Ver proposal.md. Estado actual:
- No hay analítica en ningún proyecto del workspace (búsqueda de `gtag`, `googletagmanager` y `analytics` sin resultados en código).
- `frontend-landing` es Angular 22 con SSR. `/devocional` se renderiza en cliente y el resto se prerenderiza (`app.routes.server.ts`). `src/index.html` es estático y compartido por todos los entornos.
- `frontend-admin` es una SPA con `Shell` + sidebar (`layout/shell/shell.ts`, lista `path`/`label`) y rutas hijas protegidas por `authGuard`.
- El usuario eligió GA4 sin instalar nada en el servidor, sin banner de consentimiento y con un informe de Looker Studio en el admin. Antes se había evaluado Umami autoalojado y se descartó por esta decisión.

## Goals / Non-Goals

**Goals:**
- GA4 con la configuración mínima de código y sin tocar backend ni VPS.
- Eventos declarados en las plantillas, con un único punto de envío.
- Sin impacto en el sitio si la etiqueta falta o está bloqueada.

**Non-Goals:**
- Consent Mode o un banner (decisión del usuario).
- Google Tag Manager: una capa más para un sitio pequeño y con pocos eventos fijos.
- Medir el admin.

## Decisions

1. **Carga de `gtag.js` desde Angular, no desde `index.html`.**
   - `core/analytics.service.ts` lee `environment.analytics = { measurementId, debug }`.
   - Solo en el navegador (`isPlatformBrowser`) y con `measurementId` no vacío:
     - define `window.dataLayer` y `window.gtag`
     - llama `gtag('js', new Date())` y `gtag('config', id, { debug_mode })`; `debug_mode` solo se pasa cuando `debug` es true
     - inyecta una vez `<script async src="https://www.googletagmanager.com/gtag/js?id=…">`
   - Corre desde un `provideAppInitializer` que no espera a que cargue.
   - Las navegaciones del router las cuenta la "medición mejorada" de GA4 ("cambios de página según eventos del historial del navegador", activa por defecto en el flujo web), así que no hace falta enviar `page_view` a mano ni engancharse al router.
   - El prerender y el SSR no ejecutan nada.
   - *Alternativa:* el snippet en `index.html`. Se descarta porque se ejecutaría en el prerender y no se puede variar por entorno.

2. **Nombres de evento en snake_case.** GA4 solo acepta letras, números y guion bajo en nombres de evento y parámetros, así que el spec usa `en_vivo`, `biblia_en_un_ano`, etc. Para ver `origen`, `referencia`, `pagina` y `red` en los informes hay que registrarlos como **dimensiones personalizadas** de evento en GA4. Lo hace el usuario en la tarea 1.1; sin eso, los eventos se cuentan pero sin desglose.

3. **Directiva de clic para eventos declarativos.**
   - GA4 no tiene atributos automáticos como `data-umami-event`.
   - Una directiva `shared/track-click` (`[appTrackClick]="'en_vivo'"` y `[trackParams]="{ origen: 'header' }"`) escucha `click` y llama `AnalyticsService.track`.
   - No hace `preventDefault` ni espera, y `track` usa `transport_type: 'beacon'` (el valor por defecto de gtag), así el evento sale aunque el enlace abra otra pestaña.
   - Dos eventos van por código:
     - `peticion_oracion`: tras la respuesta exitosa del POST.
     - `devocional_audio`: en el primer `play` por cada `src` del reproductor, con una entrada `pagina` del componente (`inicio` o `devocional`).
   - `track` llama `window.gtag?.(...)` dentro de try/catch y no hace nada si no está configurado.

4. **Tráfico local de desarrollador.**
   - `environment.local.ts` usa el mismo `measurementId` de producción con `debug: true`.
   - Eso envía `debug_mode`, las visitas aparecen en DebugView, y el filtro de datos "Tráfico de desarrolladores" de GA4 en estado **Activo** las excluye de los informes.
   - `environment.ts` (`ng serve`) va sin ID.
   - *Alternativa:* una segunda propiedad GA4 para pruebas. Se descarta por ser más configuración que mantener.

5. **"Estadísticas" en el admin con Looker Studio.**
   - GA4 no permite incrustarse, pero un informe de Looker Studio conectado a GA4 sí, con "Habilitar inserción" en su configuración.
   - La vista `pages/stats` muestra un `<iframe>` a `environment.statsReportUrl` (la URL `https://lookerstudio.google.com/embed/reporting/…`), marcada segura con `DomSanitizer.bypassSecurityTrustResourceUrl` porque viene de configuración propia. También muestra un enlace a `environment.statsAppUrl`, la propiedad en `analytics.google.com`.
   - El informe se comparte como **"Cualquier persona con el enlace puede ver"**, para que se vea en el iframe sin depender de que el navegador del admin tenga sesión en la cuenta de Google correcta.
   - *Alternativa:* restringirlo a cuentas concretas. Mostraría la pantalla de acceso de Google dentro del iframe a cualquier otro administrador.
   - Riesgo aceptado: solo muestra cifras agregadas.

## Risks / Trade-offs

- [GA4 con cookies y sin banner] → Decisión explícita del usuario. Queda anotado en `docs/DECISIONS.md` para revisarlo si cambia la normativa o el público. Los eventos nunca llevan datos personales (spec).
- [Los bloqueadores de anuncios impiden cargar `gtag.js`] → Esas visitas no se cuentan, así que las cifras son una estimación inferior. El sitio sigue funcionando (spec "Sitio intacto sin analítica").
- [Sin registrar las dimensiones personalizadas, los parámetros no se ven en los informes] → La tarea 1.1 las registra antes de desplegar. GA4 no rellena datos hacia atrás.
- [Informe de Looker Studio con enlace público] → Solo cifras agregadas. Se puede revocar el enlace desde Looker Studio.
- [Carga extra de `gtag.js` (unos 100 kB) en el navegador] → Es `async` y se inyecta después del arranque, así que no bloquea el primer render.

## Migration Plan

1. El usuario crea la propiedad GA4 y entrega el ID `G-…`, registra las dimensiones y activa el filtro de desarrolladores.
2. Se implementa y se prueba en local (`micasachurch.test`) contra DebugView.
3. El usuario arma el informe de Looker Studio y entrega su URL de inserción.
4. Se configuran `environment.prod.ts` y `environment.local.ts` de ambos frontends y se despliega con `deploy.ps1 -Action Frontend`.

Rollback: vaciar `measurementId` en producción y volver a desplegar el frontend.

## Open Questions

- Ninguna que cambie el diseño. El contenido exacto del informe de Looker Studio se arma en la tarea 5.1 con la plantilla de GA4 como base.
