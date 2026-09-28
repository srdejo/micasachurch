# Proposal

## Why

En `/devocional`, el recuadro "La Biblia en un año" solo muestra las referencias del día como texto (p. ej. `Isaías 3–4; Gálatas 6`). Para leerlas, el visitante tiene que salir del sitio y buscarlas en otra app. Queremos que las lea ahí mismo, con el texto bíblico que ofrece la YouVersion Platform a través de su SDK de TypeScript.

## What Changes

- Cada referencia del recuadro "La Biblia en un año" se vuelve un botón. Al pulsarlo se abre un lector dentro de la misma página, una ventana sobre `/devocional`, con el texto completo del pasaje.
- El lector tiene una pestaña por referencia del día, para pasar de `Isaías 3–4` a `Gálatas 6` sin cerrarlo.
- El visitante elige la versión de la Biblia entre las versiones en español que la YouVersion Platform habilita para la app del sitio. Por defecto se usa NTV, o PDT si NTV no está disponible, o la primera de la lista. La elección se recuerda en ese navegador.
- Debajo del texto se muestra siempre la atribución de copyright de la versión elegida, como exige la licencia.
- El texto se consulta en vivo desde el navegador del visitante contra la YouVersion Platform. El backend no lo toca ni lo guarda, igual que el devocional de Our Daily Bread.
- Si el sitio no tiene configurada la App Key de YouVersion, si una referencia no se puede interpretar o si la API falla, el recuadro sigue funcionando como hoy (referencias en texto) o el lector muestra un error con "Reintentar". La página nunca se rompe.
- Nueva dependencia de `frontend-landing`: `@youversion/platform-core`.
- **Fuera de alcance:** la [Data Exchange](https://developers.youversion.com/api/data-exchange) de YouVersion. Sirve para que un usuario con cuenta YouVersion autorice a la app a leer sus datos (hoy solo los resaltados) y no hace falta para mostrar texto bíblico ni para elegir versión. Tampoco entran el login con YouVersion, los resaltados, el seguimiento de avance del plan, ni llevar el lector a la tarjeta del devocional de la página principal.

## Capabilities

### New Capabilities
- `bible-reader`: lector del texto bíblico dentro del sitio. Cubre la apertura desde una referencia, el selector de versión en español con su preferencia recordada, la atribución de copyright y el comportamiento sin App Key, con referencias no reconocidas o con errores de la API.

### Modified Capabilities
- `public-landing`: el requisito "Audio y Biblia en un año en el devocional" cambia para que las referencias del recuadro sean botones que abren el lector, en lugar de texto plano. El orden de los bloques del artículo no cambia.

## Impact

- **Código:** en `frontend-landing` cambian el recuadro "La Biblia en un año" (`shared/devotional-article/`) y el entorno (`environments/`), y se agregan un servicio en `core/` para YouVersion, un parser de referencias en español a USFM y un componente de lector modal en `shared/`.
- **Dependencias:** `@youversion/platform-core` (Apache 2.0).
- **Configuración:** hace falta una App Key gratuita de [platform.youversion.com](https://platform.youversion.com/). La App Key es pública: viaja en el navegador por diseño de la plataforma. Qué versiones en español quedan disponibles (NTV, PDT u otras) depende de las licencias que la plataforma habilite para esa App Key.
- **Documentación:** `docs/ARCHITECTURE.md` y `docs/DECISIONS.md` (segunda fuente externa consultada desde el cliente) y `docs/DEPLOYMENT.md` (nueva variable de entorno).
- **Backend y admin:** sin cambios.
