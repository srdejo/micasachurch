# Tasks

## 1. Configuración y SDK

- [x] 1.1 Agregar `youversionAppKey: ''` a `src/environments/environment.ts`, `environment.local.ts` y `environment.prod.ts` (design.md §7). Documentar en `docs/DEPLOYMENT.md` cómo obtener la App Key gratuita en platform.youversion.com y dónde ponerla. Verificar con `ng build` en verde
- [x] 1.2 Instalar `@youversion/platform-core` con versión fijada en `package.json`. Con un script desechable en el scratchpad y una App Key de prueba, comprobar que `BibleClient.getPassage(<id>, 'GAL.6', 'html')` devuelve HTML y atribución, y que existe una forma de listar versiones en español (método del SDK o `GET /v1/bibles?language_ranges[]=es`). Anotar en design.md §1 qué camino quedó y qué versiones en español aparecen (¿NTV?, ¿PDT?). Si no hay App Key todavía, dejar la tarea pendiente y seguir con el grupo 2 usando mocks

## 2. Parser de referencias

- [x] 2.1 Crear `core/bible-reference.ts`, con la tabla de los 66 libros (nombre normalizado → USFM, con variantes) y `parseBibleReferences(text)` → `{ label, passages }[]`, un id USFM por capítulo (design.md §2). Verificar con `bible-reference.spec.ts`:
  - `Isaías 3–4; Gálatas 6` → `[ISA.3, ISA.4]`, `[GAL.6]`
  - `Salmos 119:1-24` → `PSA.119.1-24`
  - `1 Corintios 13` → `1CO.13`
  - `Cantares 1–2` → `[SNG.1, SNG.2]`
  - `Juan 3:16` → `JHN.3.16`
  - raya y guion equivalentes; mayúsculas y tildes indiferentes
  - `Texto raro 9` y rangos entre capítulos (`Juan 5:30–6:10`) → `passages: []` sin afectar las otras referencias

## 3. Servicio de YouVersion

- [x] 3.1 Crear `core/bible-api.service.ts` (design.md §1, §5, §6):
  - `isEnabled` según la App Key
  - `import()` dinámico del SDK
  - `listSpanishVersions()` memoizada
  - `getPassage(versionId, usfm)` → `{ html, attribution }`, que falla si no hay atribución
  - `preferredVersion(list)` con orden NTV → PDT → primera y lectura/escritura de `mcc.bibleVersion` en `localStorage` protegida con try/catch e `isPlatformBrowser`

  Verificar con `bible-api.service.spec.ts` (SDK mockeado):
  - sin App Key `isEnabled` es false y no se importa el SDK
  - el orden de versión por defecto
  - una versión guardada que ya no existe se ignora
  - un storage que lanza no rompe el servicio
  - un pasaje sin atribución se rechaza

## 4. Lector modal

- [x] 4.1 Crear `shared/bible-reader/` (design.md §3, §4) siguiendo el patrón de `schedule-modal`:
  - `role="dialog"`, `aria-modal`, nombre "Lectura: <referencia>"
  - pestañas solo con más de una referencia
  - selector "Versión" con abreviatura y nombre
  - texto con `[innerHTML]` y atribución como texto debajo
  - estado de carga
  - error "No pudimos cargar este pasaje." con "Reintentar"
  - cierre con "Cerrar", Escape y toque fuera; bloqueo de scroll y foco atrapado
  - estilos con tokens del tema, sin hex nuevos

  Verificar con `bible-reader.spec.ts` (servicio mockeado):
  - abre con la referencia inicial activa
  - cambiar de pestaña pide el otro USFM
  - cambiar de versión recarga el pasaje activo y guarda la preferencia
  - la atribución se pinta como texto
  - un error muestra "Reintentar" y reintenta
  - Escape emite `close`
  - con una referencia no hay pestañas

## 5. Integración en el devocional

- [x] 5.1 En `shared/devotional-article/`:
  - interpretar `bible_in_a_year_references` con `parseBibleReferences`
  - pintar cada referencia con pasajes como `<button>` que abre `<app-bible-reader>` con esa referencia activa
  - pintar las no reconocidas, o todas si `!isEnabled`, como texto
  - devolver el foco al botón al cerrar

  Verificar ampliando `devotional-article.spec.ts`:
  - el orden de bloques sigue igual
  - con App Key hay dos botones para `Isaías 3–4; Gálatas 6` y pulsar el segundo abre el lector en "Gálatas 6"
  - sin App Key no hay botones
  - `Isaías 3–4; Texto raro 9` da un botón y un texto
  - cargar el artículo sin pulsar nada no llama al servicio
- [x] 5.2 Actualizar `docs/ARCHITECTURE.md` (junto a "El devocional NO se persiste") y `docs/DECISIONS.md` con la segunda fuente externa consultada desde el cliente (YouVersion, App Key pública, atribución obligatoria), referenciando este cambio en vez de repetirlo. Verificar leyendo que no se duplique contenido

## 6. Verificación integral

- [x] 6.1 `ng build` y `ng test` de `frontend-landing` en verde. Con App Key real, publicar en local y revisar `/devocional` en el navegador:
  - a 1440 px: abrir cada referencia, cambiar de pestaña, elegir NTV/PDT (o las disponibles), recargar la página y comprobar que se recuerda la versión, ver la atribución, cerrar con Escape y con toque fuera
  - a 360 px: sin scroll horizontal, scroll dentro del lector
  - con teclado: Tab/Enter
  - con la red a YouVersion bloqueada: "Reintentar"
  - sin App Key: referencias como texto

  Anotar el resultado en `docs/PROGRESS.md`
