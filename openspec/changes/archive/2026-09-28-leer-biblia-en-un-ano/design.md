# Design

## Context

Ver proposal.md. Todo el cambio vive en `frontend-landing`:
- `shared/devotional-article/devotional-article.html:18-23` pinta `entry.bible_in_a_year_references` como un solo texto. Viene en formato ODB, p. ej. `Isaías 3–4; Gálatas 6`: `;` separa las lecturas, raya `–` en los rangos y nombres de libro en español con tildes.
- El devocional ya se consulta desde el cliente contra una API de terceros (`core/devotional-api.service.ts`, `docs/ARCHITECTURE.md` § "El devocional NO se persiste"). El texto bíblico sigue el mismo patrón.
- `frontend-landing` es SSR/prerender. `shared/schedule-modal/` es el patrón de modal que ya existe: Escape cierra, bloquea el scroll del body en `afterNextRender` y enfoca el botón de cerrar.
- `src/environments/environment{,.local,.prod}.ts` hoy solo tienen `apiUrl`.
- YouVersion Platform:
  - SDK JS/TS `@youversion/platform-core`: `new ApiClient({ appKey })` y `new BibleClient(apiClient)`, con `getPassage(versionId, usfm, 'text'|'html')` y `getVersion(id)`.
  - REST equivalente: `GET https://api.youversion.com/v1/bibles?language_ranges[]=es` (versiones licenciadas para la App Key) y `GET /v1/bibles/{id}/passages/{usfm}?format=html&include_headings=true`.
  - Los ids de pasaje son USFM: `ISA.3-4`, `GAL.6`, `JHN.3.16-18`, `MAT.28.18-MRK.1.3`.
  - La atribución es obligatoria y se pinta como texto (`attribution.text`).
  - La App Key es pública por diseño.

## Goals / Non-Goals

**Goals:**
- Usar el SDK oficial (`@youversion/platform-core`), como pidió el usuario.
- Todo queda dentro de `frontend-landing`; el backend no cambia.
- Sin App Key, o si la API falla, el sitio se comporta como hoy.

**Non-Goals:**
- Data Exchange, login con YouVersion y resaltados (ver proposal).
- Los paquetes React (`platform-react-ui`/`-hooks`): requieren React y no encajan en Angular.
- Caché de pasajes entre sesiones y lectura offline.
- Lector en la tarjeta del devocional de la página principal.

## Decisions

1. **El SDK va detrás de un servicio Angular (`core/bible-api.service.ts`).**
   - El servicio crea `ApiClient`/`BibleClient` en diferido con `environment.youversionAppKey` y expone `isEnabled`, `listSpanishVersions()` y `getPassage(versionId, usfm)`, que devuelve el HTML del pasaje y el texto de atribución.
   - Ningún componente importa el SDK, así que los tests mockean un solo servicio.
   - El SDK usa promesas. El servicio las mantiene y los componentes usan signals, sin envolverlas en RxJS.
   - *Alternativa:* llamar la API REST con `HttpClient`. Descartada porque el usuario pidió el SDK y el SDK ya resuelve el codificado de la App Key y el saneo del HTML.
   - *Confirmado al instalar (tarea 1.2, `@youversion/platform-core@2.15.0`):*
     - `BibleClient.getVersions('es')` lista las versiones y `BibleClient.getPassageDisplay({ versionId, passageId, includeHeadings })` devuelve `html` ya transformado y `attribution.text`. Lanza `MissingPassageAttributionError` si la versión no tiene atribución. Todo va por el SDK, sin llamadas REST propias.
     - Con la App Key del sitio, `getVersions('es')` devuelve `spaPdDpt` (Palabra de Dios para ti, 3365), `RVES` (Reina-Valera Antigua, 147) y `VBL` (Versión Biblia Libre, 3291). NTV y PDT no están. Con `all_available` aparecen además NVI, LBLA y NBLA, pero sin licencia para la App Key.
     - 2026-09-28, tras aceptar los contratos de licencia en la plataforma: la lista pasa a 9 versiones (GlossSP, LBLA, NBLA, NVI Español 128, NVIs, PdDpt, RVES, VBL, NVI Castellano 1637). NTV y PDT siguen sin estar, así que hoy el respaldo es la primera versión legible (LBLA).
     - `GlossSP` (4212) da 404 en los pasajes y `RVES` (147) no tiene atribución: se ocultan por id (`HIDDEN_VERSION_IDS`), a pedido del usuario. Además, si otra versión falla por falta de atribución, se descarta en tiempo de ejecución.
     - `getVersions` se pide con `page_size: 99` para no depender de la paginación por defecto.
     - El endpoint de pasajes **no acepta rangos de capítulos** (`ISA.3-4` y `ISA.3.1-4.6` dan 404). Acepta capítulos (`ISA.3`) y rangos de versículos dentro de un capítulo (`PSA.119.1-24`).

2. **Parser de referencias en español como función pura (`core/bible-reference.ts`).**
   - Separa por `;` y normaliza `–`/`—` a `-`.
   - Reconoce `[n ]<libro> <cap>[:<vers>][-<cap|vers>[:<vers>]]`.
   - Mapea el nombre del libro a USFM con una tabla de los 66 libros, indexada por el nombre normalizado (minúsculas, sin tildes), con variantes comunes: `Salmo`/`Salmos`, `Cantares`/`Cantar de los Cantares`, `Hechos`/`Hechos de los Apóstoles`, `1 Corintios`/`1Corintios`. Las abreviaturas (`1 Co`) no se reconocen porque ODB usa nombres completos.
   - Devuelve `{ label, passages }`: la lista de ids USFM a pedir, uno por capítulo, porque la API no acepta rangos de capítulos. `Isaías 3–4` → `['ISA.3', 'ISA.4']`, `Salmos 119:1-24` → `['PSA.119.1-24']`.
   - Si no reconoce la referencia, devuelve `passages: []`. También da `[]` en un rango de versículos entre capítulos (`Juan 5:30–6:10`), que no se puede pedir sin saber cuántos versículos tiene cada capítulo. Así esa referencia queda como texto sin afectar a las demás.
   - *Alternativa:* mandar el texto en español a la API. Descartada porque la API solo acepta USFM.

3. **El lector es un modal (`shared/bible-reader/`) con el patrón de `schedule-modal`.**
   - Recibe la lista de referencias interpretadas y el índice inicial, y emite `close`.
   - Usa `role="dialog"` y `aria-modal`, atrapa el foco, bloquea el scroll y devuelve el foco al botón que lo abrió.
   - Muestra pestañas solo si hay más de una referencia.
   - *Alternativa:* desplegar el texto dentro del artículo. Descartada porque lecturas de 2 a 4 capítulos empujan el devocional muy abajo, mientras que el modal conserva la posición.

4. **Cómo se pinta el pasaje.**
   - El HTML del SDK se enlaza con `[innerHTML]`. El sanitizer de Angular corre encima del saneo del SDK y conserva las clases de estructura de YouVersion (`.yv-v`, títulos, números de versículo).
   - Los estilos van en una hoja con alcance de componente, con los tokens del tema: texto `paper`, `font-display` para los títulos de sección y `--yv-reader-font-size` para el tamaño.
   - La atribución se interpola como texto, nunca como HTML.

5. **Elección de versión.**
   - La lista de versiones en español se carga una vez por carga de página, al abrir el lector por primera vez, y la promesa se memoiza.
   - El orden por defecto es abreviatura `NTV` → `PDT` → la primera de la lista.
   - La versión elegida se guarda en `localStorage` con la clave `mcc.bibleVersion`. Lecturas y escrituras van en try/catch porque el storage puede lanzar. Un id guardado que ya no está en la lista se ignora.

6. **Seguro para SSR.**
   - No se consulta nada hasta que el visitante pulsa una referencia, y eso solo ocurre en el navegador.
   - El SDK se carga con `import()` dinámico en la primera llamada del servicio, así no entra en el bundle inicial ni en el del servidor.
   - El acceso a `localStorage` va protegido con `isPlatformBrowser`.

7. **Configuración de la App Key.**
   - Se agrega `youversionAppKey` a los tres archivos de entorno, con la App Key del sitio que entregó el usuario (es pública, así que puede quedar en el repo).
   - App Key vacía significa `isEnabled === false`, y las referencias se muestran como texto.

## Risks / Trade-offs

- [NTV o PDT podrían no estar licenciadas para la App Key] → El selector muestra solo lo que devuelve la plataforma y el orden de respaldo lo cubre. El spec no promete una versión concreta; el usuario confirma cuáles aparecen al registrar la App Key.
- [El SDK es nuevo y su API puede diferir de la documentación] → La tarea 1.2 fija la versión y comprueba `getPassage` y el listado de versiones antes de tocar la UI. El listado tiene respaldo REST.
- [Formatos de referencia de ODB no cubiertos por el parser] → Esa referencia sola queda como texto. El parser tiene tests con formatos reales de ODB.
- [App Key pública en el bundle] → Es así por diseño de la plataforma; la App Key solo da lectura del texto licenciado.
- [Pasajes largos de varios capítulos en móvil] → El scroll ocurre dentro del modal, y la regla de 320–980 px sin desborde está en el spec.

## Migration Plan

El despliegue es solo de frontend. Sin App Key la función queda inactiva y la página se ve igual que hoy, así que puede publicarse antes de tener la App Key. Para revertir basta con revertir el commit; no hay datos de por medio.

## Open Questions

- Las versiones en español disponibles para la App Key solo se sabrán tras registrarse en platform.youversion.com. Eso no cambia el diseño (la lista es dinámica), solo qué versiones ven los visitantes.
