# public-landing Specification

## Purpose

Comportamiento del sitio público de Mi Casa Church: acceso a la transmisión en vivo, navegación entre secciones, formularios, donaciones y visualización en móvil.

## Requirements

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

### Requirement: Sección de Redes sin botón "Ya estoy en una"
La sección "¿Ya estás en una red?" SHALL ofrecer solo la acción "Quiero entrar a una red".

#### Scenario: Sección de Redes
- **WHEN** un visitante ve la sección de Redes
- **THEN** no aparece el botón "Ya estoy en una"

### Requirement: "Cómo llegar" abre Google Maps
El enlace "Cómo llegar" de Quiénes somos SHALL abrir la ubicación del templo en Google Maps en una pestaña nueva, en lugar de desplazar la página.

#### Scenario: Clic en "Cómo llegar"
- **WHEN** un visitante pulsa "Cómo llegar"
- **THEN** se abre Google Maps con la ubicación de la iglesia en una pestaña nueva

### Requirement: Orden de secciones
La sección "Síguenos" SHALL ser la última sección de contenido del landing, inmediatamente antes del footer. Los enlaces del menú a `#siguenos` MUST seguir funcionando.

#### Scenario: Recorrido completo de la página
- **WHEN** un visitante hace scroll hasta el final
- **THEN** la última sección antes del footer es "Síguenos"

### Requirement: Validación del formulario de oración
El formulario de petición de oración SHALL validar en el cliente antes de enviar y mostrar mensajes en español junto a cada campo inválido:
- "Tu petición" es obligatoria (no vacía ni solo espacios).
- "Nombre" (opcional) solo admite letras, incluidas tildes y ñ, y espacios; máximo 80 caracteres.
- "WhatsApp" (opcional) solo admite dígitos con un `+` inicial opcional, entre 7 y 15 dígitos.
Con algún campo inválido el formulario MUST NOT enviarse. El backend MUST aplicar las mismas reglas y responder un error de validación si no se cumplen.

#### Scenario: Petición vacía
- **WHEN** un visitante pulsa "Enviar petición" sin escribir la petición
- **THEN** se muestra "Escribe tu petición antes de enviarla." y no se envía nada

#### Scenario: Nombre con números
- **WHEN** el nombre contiene "Ana 123"
- **THEN** se muestra un mensaje indicando que el nombre solo admite letras y no se envía

#### Scenario: WhatsApp con letras
- **WHEN** el campo WhatsApp contiene "300-abc"
- **THEN** se muestra un mensaje indicando que solo se admiten números y no se envía

#### Scenario: Envío válido
- **WHEN** la petición tiene texto, el nombre es "María José" y el WhatsApp es "+573001234567"
- **THEN** la petición se envía y se muestra la confirmación

### Requirement: QR de ofrendas escaneables
Cada QR de donación SHALL mostrarse como imagen propia del código (no la pieza gráfica completa), con al menos 220 px de lado en pantalla, y MUST poder abrirse en tamaño completo al tocarlo. El número de cuenta y el NIT MUST seguir visibles como texto.

#### Scenario: Escanear desde otro teléfono
- **WHEN** alguien escanea con la app bancaria el QR mostrado en pantalla de escritorio
- **THEN** la app reconoce el código

#### Scenario: Abrir QR en grande
- **WHEN** un visitante toca un QR
- **THEN** se abre la imagen del QR en tamaño completo

### Requirement: Volver al inicio desde el devocional
La página `/devocional` SHALL mostrar un enlace "Volver al inicio" visible sin hacer scroll, que lleva a la página principal.

#### Scenario: Volver desde el devocional
- **WHEN** un visitante en `/devocional` pulsa "Volver al inicio"
- **THEN** navega a la página principal

### Requirement: Landing sin desborde horizontal en móvil
En anchos de 320 px a 980 px, ningún elemento del landing SHALL sobrepasar el ancho del viewport ni el de su tarjeta contenedora; la página MUST NOT tener scroll horizontal. Los textos largos (p. ej. `@micasachurchocana`) MUST ajustarse dentro de su tarjeta.

#### Scenario: Tarjetas de Síguenos en 360 px
- **WHEN** el landing se ve en un teléfono de 360 px de ancho
- **THEN** los textos de las tarjetas de TikTok e Instagram quedan dentro de su recuadro

#### Scenario: Ancho completo en móvil
- **WHEN** el landing se ve en un teléfono de 375 px de ancho
- **THEN** el contenido ocupa todo el ancho sin franja lateral vacía y no hay scroll horizontal

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

### Requirement: Audio y Biblia en un año en el devocional
En la página `/devocional`, el recuadro "La Biblia en un año" SHALL mostrarse al comienzo del artículo, antes de la referencia de la lectura y del título, cuando la lectura del día lo trae. Cada referencia del recuadro (separadas por `;` en la lectura del día) SHALL mostrarse como un botón que abre el lector de pasajes (ver capability `bible-reader`) sin salir de la página. Las referencias que el lector no puede interpretar, o todas si el lector no está disponible, se muestran como texto plano. El audio va ligado a la lectura, así que su reproductor SHALL mostrarse justo debajo del título y antes del versículo. Ese reproductor MUST ser propio del sitio, con los colores y tipografías del tema, y no el control nativo del navegador. Tiene un botón circular de reproducir/pausar en el color de acento, la etiqueta "Escucha la lectura", una barra de progreso que permite adelantar o retroceder (con teclado y con toque), el tiempo transcurrido y el total, y un selector de velocidad (1×, 1.25×, 1.5×). Si la lectura no trae audio o el archivo no carga, el reproductor no se muestra y no queda un hueco. El tamaño de texto ajustable sigue aplicando al artículo, pero no cambia el tamaño del reproductor.

#### Scenario: Devocional con audio y plan anual
- **WHEN** un visitante abre `/devocional` y la lectura del día trae audio y referencias de la Biblia en un año
- **THEN** ve primero el recuadro "La Biblia en un año", luego la referencia de la lectura y el título, justo debajo el reproductor "Escucha la lectura" y después el versículo y la reflexión

#### Scenario: Referencias como botones
- **WHEN** la lectura del día trae "Isaías 3–4; Gálatas 6"
- **THEN** el recuadro muestra dos botones, "Isaías 3–4" y "Gálatas 6", y al pulsar "Gálatas 6" se abre el lector con ese pasaje sin salir de `/devocional`

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
