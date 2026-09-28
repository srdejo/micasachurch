# Spec Delta

## MODIFIED Requirements

### Requirement: Acceso a la transmisión en vivo
Todo control "En vivo" del landing (franja en vivo, botón del header, tarjeta de Facebook en Síguenos, botón de la barra inferior de móvil y fila en vivo de la ventana de horarios) SHALL abrir en una pestaña nueva el enlace de la transmisión activa. Ese enlace es el de la transmisión especial en curso si la tiene y, si no, el enlace `facebook` administrado desde el panel. La tarjeta de Facebook en Síguenos no depende de una transmisión en curso y SHALL abrir siempre el enlace `facebook`. La tarjeta de Prédicas MUST NOT tener un botón "En vivo"; solo ofrece "Suscribirse" al canal. El landing MUST NOT incrustar el reproductor ni el plugin de Facebook, ni abrir un modal para la transmisión.

#### Scenario: Clic en "En vivo 7:00 a.m."
- **WHEN** un visitante mira la tarjeta de Prédicas
- **THEN** ve el botón "Suscribirse" y no ve ningún botón "En vivo 7:00 a.m."

#### Scenario: Tarjeta de Facebook en Síguenos
- **WHEN** un visitante pulsa la tarjeta de Facebook
- **THEN** se abre la página de Facebook en una pestaña nueva

#### Scenario: Transmisión especial con enlace propio
- **WHEN** está en curso una transmisión especial con enlace `https://youtube.com/live/abc` y el visitante pulsa "Ver transmisión"
- **THEN** se abre `https://youtube.com/live/abc` en una pestaña nueva

### Requirement: Navegación de escritorio y móvil según el diseño
En escritorio (más de 980 px), el landing SHALL mostrar un header oscuro fijo con los enlaces Prédicas, Eventos, Redes, Devocional, Oración y Horarios (este último abre la ventana de horarios), el botón "En vivo" si hay transmisión en curso y el botón "Planea tu visita". En 980 px o menos, SHALL mostrar un header claro con botones de WhatsApp y de menú, y un menú desplegable con todas las secciones más "Ver en vivo · 7:00 a.m." y "Escribir por WhatsApp". Solo mientras haya una transmisión en curso (un horario transmitido o una transmisión especial, según el estado "En vivo" automático), SHALL mostrar además una barra inferior fija con un único botón "En vivo", que respeta el área segura del dispositivo. Fuera de las transmisiones, la barra MUST NOT mostrarse y el footer MUST NOT reservar espacio para ella. La barra MUST NOT tener botón de WhatsApp. El orden de secciones y las demás reglas de este spec (Síguenos al final, sin "Ya estoy en una", "Cómo llegar" a Google Maps, sin desborde horizontal) MUST mantenerse aunque el diseño de origen las muestre de otra forma.

#### Scenario: Menú móvil
- **WHEN** un visitante en un teléfono de 375 px pulsa el botón de menú y luego "Oración"
- **THEN** el menú se cierra y la página se desplaza a la sección de oración

#### Scenario: Barra inferior en móvil
- **WHEN** un visitante en un teléfono hace scroll mientras se transmite el devocional diario de las 7:00 a.m.
- **THEN** una barra al pie de la pantalla muestra solo el botón "En vivo", que abre la transmisión, y no tapa el final del footer

#### Scenario: Sin transmisión no hay barra
- **WHEN** un visitante abre el landing en un teléfono a las 3:00 p.m. de un miércoles sin transmisiones
- **THEN** no aparece la barra inferior y el footer termina sin un espacio vacío debajo

#### Scenario: Horarios desde el header
- **WHEN** un visitante de escritorio pulsa "Horarios" en el header
- **THEN** se abre la ventana de horarios

## ADDED Requirements

### Requirement: Audio y Biblia en un año en el devocional
En la página `/devocional`, el recuadro "La Biblia en un año" SHALL mostrarse al comienzo del artículo, antes de la referencia de la lectura y del título, cuando la lectura del día lo trae. El audio va ligado a la lectura, así que su reproductor SHALL mostrarse justo debajo del título y antes del versículo. Ese reproductor MUST ser propio del sitio, con los colores y tipografías del tema, y no el control nativo del navegador. Tiene un botón circular de reproducir/pausar en el color de acento, la etiqueta "Escucha la lectura", una barra de progreso que permite adelantar o retroceder (con teclado y con toque), el tiempo transcurrido y el total, y un selector de velocidad (1×, 1.25×, 1.5×). Si la lectura no trae audio o el archivo no carga, el reproductor no se muestra y no queda un hueco. El tamaño de texto ajustable sigue aplicando al artículo, pero no cambia el tamaño del reproductor.

#### Scenario: Devocional con audio y plan anual
- **WHEN** un visitante abre `/devocional` y la lectura del día trae audio y referencias de la Biblia en un año
- **THEN** ve primero el recuadro "La Biblia en un año", luego la referencia de la lectura y el título, justo debajo el reproductor "Escucha la lectura" y después el versículo y la reflexión

#### Scenario: Reproducir y adelantar
- **WHEN** el visitante pulsa reproducir y luego toca la mitad de la barra de progreso
- **THEN** el audio suena, el botón cambia a pausa, el audio salta a la mitad y el tiempo transcurrido se actualiza

#### Scenario: Cambiar velocidad
- **WHEN** el visitante elige 1.5× en el selector de velocidad
- **THEN** el audio sigue desde el mismo punto a velocidad 1.5×

#### Scenario: Devocional sin audio
- **WHEN** la lectura del día no trae audio
- **THEN** después del título viene directamente el versículo, sin reproductor ni hueco

#### Scenario: Accesible con teclado
- **WHEN** un visitante navega con Tab hasta el reproductor
- **THEN** puede reproducir o pausar con Enter o Espacio y mover la barra de progreso con las flechas; cada control tiene una etiqueta en español para lectores de pantalla

### Requirement: Audio del devocional en la página principal
En la tarjeta del devocional de la página principal (sección `#devocional`), cuando la lectura del día trae audio, el sitio SHALL mostrar el mismo reproductor propio de `/devocional`, en su versión clara (tinta sobre el fondo suave del tema), entre el título y el versículo. El audio se escucha sin salir de la página principal. El título y "Leer completo →" SHALL seguir llevando a `/devocional`, pero usar el reproductor MUST NOT navegar. Si no hay audio o el archivo no carga, la tarjeta se ve como antes, sin hueco.

#### Scenario: Escuchar desde el inicio
- **WHEN** un visitante en la página principal pulsa reproducir en la tarjeta del devocional
- **THEN** el audio de la lectura del día empieza a sonar y el visitante sigue en la página principal

#### Scenario: Ir a la lectura completa
- **WHEN** el visitante pulsa el título del devocional o "Leer completo →"
- **THEN** llega a `/devocional`

#### Scenario: Día sin audio
- **WHEN** la lectura del día no trae audio
- **THEN** la tarjeta muestra la fecha, el título, la lectura y el versículo sin reproductor
