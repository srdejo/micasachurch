# Tasks

## 1. Home

- [x] 1.1 Quitar el botón "En vivo {{ dailyDevotionalTime() }}" de la tarjeta de Prédicas en `pages/home/home.html`. Verificar con `ng build` y buscando que no quede ningún "En vivo" dentro de `#predicas`
- [x] 1.2 Barra inferior de móvil: envolverla en `@if (live(); as current)`, dejar solo el botón "En vivo" (enlace `current.url`) y quitar "WhatsApp"; aplicar `max-[980px]:pb-32` al footer solo cuando `live()` no sea null. Verificar con un test de `Home` (`home.spec.ts`, reloj simulado): con transmisión en curso hay barra con un único enlace "En vivo"; sin transmisión o con la franja oculta, no hay barra

## 2. Devocional

- [x] 2.1 Crear `shared/audio-player` (design.md §4): botón circular reproducir/pausar, "Escucha la lectura", barra `range` para adelantar, tiempos `m:ss / m:ss`, velocidad 1× / 1.25× / 1.5×, etiquetas en español y sin render si el audio falla. Verificar con `audio-player.spec.ts`: alternar reproducir/pausa (con `play`/`pause` simulados), mover la barra cambia `currentTime`, la velocidad cambia `playbackRate` y un `error` oculta el componente
- [x] 2.2 En `shared/devotional-article/devotional-article.html`, ordenar: Biblia en un año, lectura, título, `<app-audio-player>` (si hay `audio_url`), versículo y reflexión; quitar el `<audio controls>` del final. Verificar con `devotional-article.spec.ts`: la Biblia en un año va antes del título, el reproductor va entre el título y el versículo, y sin audio no hay reproductor
- [x] 2.3 Home: convertir la tarjeta del devocional de `<a>` a `<article>`, con el título y "Leer completo →" como enlaces a `/devocional` y `<app-audio-player variant="light">` entre la lectura y el versículo si hay `audio_url`. Verificar con un test de `Home`: con audio hay reproductor y ningún control queda dentro de un `<a>`, sin audio no hay reproductor, y el título enlaza a `/devocional`

## 3. Integración

- [x] 3.1 `ng build` y `ng test` de `frontend-landing` en verde; publicar en local y revisar en el navegador el landing a 375 px (sin barra fuera de transmisión y con barra durante una transmisión especial de prueba creada desde el admin), la tarjeta de Prédicas a 1440 px y `/devocional` a 1440 y 375 px (reproducir, adelantar y cambiar velocidad con el audio real de Nuestro Pan Diario), y la tarjeta del devocional del inicio a 1440 y 375 px (el audio suena sin salir del inicio y el título lleva a `/devocional`). Anotar el resultado en `docs/PROGRESS.md`
