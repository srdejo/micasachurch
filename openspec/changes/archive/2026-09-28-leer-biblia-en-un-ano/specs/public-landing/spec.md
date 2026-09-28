# Spec Delta

## MODIFIED Requirements

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
