# Proposal

## Why

Al revisar el rediseño, la iglesia pidió tres ajustes. El botón "En vivo 7:00 a.m." de Prédicas repite lo que ya dicen la franja y Síguenos. La barra fija de abajo en móvil ocupa pantalla todo el tiempo, aunque no haya transmisión. Y en `/devocional`, el audio y "La Biblia en un año" quedan al final de una lectura larga, donde casi nadie llega, y el reproductor nativo del navegador desentona con el diseño.

## What Changes

- **Prédicas**: se quita el botón "En vivo 7:00 a.m." de la tarjeta; queda solo "Suscribirse".
- **Barra inferior de móvil**: se quita "WhatsApp". La barra solo aparece, con el botón "En vivo", mientras haya una transmisión en curso, sea de un horario transmitido o una transmisión especial. El resto del tiempo no se muestra, y el footer deja de reservar espacio para ella.
- **Sin cambios en móvil**: la tarjeta "En vivo · 7:00 a.m." bajo la portada, el botón de WhatsApp del header, las opciones "Ver en vivo" y "Escribir por WhatsApp" del menú, la franja en vivo y la tarjeta de Facebook de Síguenos. Así lo decidió Daniel al preguntarle.
- **Devocional (`/devocional`)**: el recuadro "La Biblia en un año" pasa al comienzo del artículo. El audio, que va ligado a la lectura, queda justo debajo del título con un reproductor propio del sitio: botón circular de reproducir/pausar en el color de acento, barra de progreso para adelantar, tiempos y velocidad (1×, 1.25×, 1.5×). Reemplaza al control nativo del navegador, que desentona con el diseño.
- **Devocional en la página principal**: la tarjeta del devocional del inicio también trae el reproductor, en versión clara, para escuchar la lectura del día sin salir del inicio. La tarjeta deja de ser un enlace completo (no se puede poner un botón dentro de un enlace); el título y "Leer completo →" siguen llevando a `/devocional`.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `public-landing`: los accesos "En vivo" ya no incluyen el botón de Prédicas, la barra inferior de móvil solo aparece durante una transmisión y el devocional muestra la Biblia en un año arriba y el audio bajo el título con reproductor propio, que también aparece en la tarjeta del devocional de la página principal.

## Impact

- **frontend-landing**: `pages/home/home.html` (Prédicas, barra inferior, padding del footer y tarjeta del devocional), `shared/devotional-article/devotional-article.html` (orden de los bloques) y un componente nuevo `shared/audio-player`. Hay que agregar tests para la barra, el orden del devocional y el reproductor.
- **Sin cambios** en backend, admin ni en el cálculo de `live-status`: la barra usa el estado `live()` que ya existe.
