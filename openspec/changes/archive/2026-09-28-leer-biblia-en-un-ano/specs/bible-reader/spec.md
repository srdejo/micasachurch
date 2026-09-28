# Spec Delta

## Purpose

Permite leer dentro del sitio público el texto de los pasajes bíblicos (como las lecturas de "La Biblia en un año"), en una versión en español que el visitante elige y con la atribución que exige la licencia.

## ADDED Requirements

### Requirement: Lector de pasajes en la misma página
Al pulsar una referencia bíblica habilitada, el sitio SHALL abrir un lector sobre la página actual, sin navegar ni abrir otra pestaña, que muestre el texto completo del pasaje con números de versículo y los títulos de sección que traiga la versión. El lector MUST mostrar arriba la referencia en español tal como aparece en el devocional. MUST poder cerrarse con un botón "Cerrar", con la tecla Escape y tocando fuera de la ventana. Al cerrarse, el visitante sigue en el mismo punto de la página y el foco vuelve a la referencia que lo abrió. Mientras el lector está abierto, la página de fondo MUST NOT desplazarse.

#### Scenario: Abrir un capítulo
- **WHEN** un visitante en `/devocional` pulsa la referencia "Gálatas 6"
- **THEN** se abre el lector con el título "Gálatas 6" y el texto del capítulo 6 de Gálatas, y la URL no cambia

#### Scenario: Rango de capítulos
- **WHEN** el visitante abre la referencia "Isaías 3–4"
- **THEN** el lector muestra los capítulos 3 y 4 de Isaías, uno detrás del otro

#### Scenario: Cerrar con Escape
- **WHEN** el lector está abierto y el visitante pulsa Escape
- **THEN** el lector se cierra, la página sigue donde estaba y el foco vuelve a la referencia "Gálatas 6"

### Requirement: Pestañas por referencia del día
Cuando la lectura del día trae varias referencias, el lector SHALL mostrar una pestaña por referencia, en el mismo orden del recuadro, con la pulsada como activa. Cambiar de pestaña MUST mostrar el texto de esa referencia sin cerrar el lector. Con una sola referencia no se muestran pestañas.

#### Scenario: Pasar a la segunda lectura
- **WHEN** el visitante abrió "Isaías 3–4" y pulsa la pestaña "Gálatas 6"
- **THEN** el lector muestra Gálatas 6 y la pestaña "Gálatas 6" queda marcada como activa

### Requirement: Selección de versión en español
El lector SHALL ofrecer un selector con las versiones de la Biblia en español que la YouVersion Platform habilita para la app del sitio y que se pueden leer (las que la plataforma lista pero no entregan texto o atribución MUST NOT aparecer), cada una con su abreviatura y su nombre (p. ej. "NTV — Nueva Traducción Viviente"). La primera vez se usa NTV si está disponible, si no PDT y si no la primera versión de la lista. La versión elegida MUST recordarse en ese navegador y aplicarse a todas las referencias y a las siguientes visitas. Si la versión recordada deja de estar disponible, se usa la versión por defecto. Al cambiar de versión, el lector MUST recargar el pasaje activo en la nueva versión sin cerrarse.

#### Scenario: Versión por defecto
- **WHEN** un visitante abre el lector por primera vez y NTV está disponible
- **THEN** el pasaje se muestra en NTV y el selector marca NTV

#### Scenario: Sin NTV
- **WHEN** NTV no está entre las versiones disponibles y PDT sí
- **THEN** el pasaje se muestra en PDT

#### Scenario: Recordar la versión
- **WHEN** el visitante elige PDT, cierra el lector y al día siguiente abre otra referencia
- **THEN** el pasaje se muestra en PDT

### Requirement: Atribución de copyright
Todo texto bíblico mostrado SHALL ir acompañado, debajo del pasaje, de la atribución de copyright que la YouVersion Platform entrega para esa versión, como texto plano. Si la plataforma no entrega atribución para una versión, el pasaje MUST NOT mostrarse.

#### Scenario: Pasaje con atribución
- **WHEN** el lector muestra Gálatas 6 en NTV
- **THEN** debajo del texto aparece la atribución de copyright de NTV

### Requirement: Degradación sin lector disponible
Si el sitio no tiene configurada la App Key de la YouVersion Platform, las referencias SHALL mostrarse como texto plano, sin botón ni lector. Si una referencia no se puede interpretar como libro y capítulos de la Biblia, esa referencia sola se muestra como texto plano y las demás siguen siendo botones. Si la carga del pasaje o de las versiones falla, el lector MUST mostrar "No pudimos cargar este pasaje." con un botón "Reintentar", y la página MUST seguir funcionando.

#### Scenario: Sin App Key
- **WHEN** el sitio se publica sin App Key de YouVersion
- **THEN** el recuadro "La Biblia en un año" muestra las referencias como texto, como antes de este cambio

#### Scenario: Referencia no reconocida
- **WHEN** las referencias del día son "Isaías 3–4; Texto raro 9"
- **THEN** "Isaías 3–4" es un botón que abre el lector y "Texto raro 9" aparece como texto plano

#### Scenario: API caída
- **WHEN** el visitante abre una referencia y la YouVersion Platform no responde
- **THEN** el lector muestra "No pudimos cargar este pasaje." y "Reintentar", y al pulsar "Reintentar" vuelve a intentar la carga

### Requirement: Texto bíblico consultado en vivo sin pasar por el backend
El texto bíblico y la lista de versiones SHALL consultarse desde el navegador del visitante directamente contra la YouVersion Platform, solo cuando el visitante abre el lector. El backend MUST NOT recibir, guardar ni reenviar ese contenido, y el HTML que se prerenderiza MUST NOT incluirlo.

#### Scenario: Página sin abrir el lector
- **WHEN** un visitante carga `/devocional` y no pulsa ninguna referencia
- **THEN** no se hace ninguna petición a la YouVersion Platform

### Requirement: Lector accesible y usable en móvil
El lector SHALL ser un diálogo accesible, con un nombre anunciable ("Lectura: <referencia>"). Recibe el foco al abrirse y el foco no sale de él mientras está abierto. Pestañas, selector de versión, "Cerrar" y "Reintentar" MUST poder operarse con teclado y tener etiquetas en español. En anchos de 320 px a 980 px el lector MUST ocupar el ancho disponible sin scroll horizontal, y el texto largo se desplaza dentro del lector. Colores y tipografías MUST ser los del tema del sitio.

#### Scenario: Teléfono de 360 px
- **WHEN** un visitante abre "Isaías 3–4" en un teléfono de 360 px
- **THEN** el lector ocupa el ancho de la pantalla, el texto se desplaza verticalmente dentro de él y no hay scroll horizontal

#### Scenario: Navegación con teclado
- **WHEN** un visitante abre el lector con Enter y recorre los controles con Tab
- **THEN** el foco pasa por las pestañas, el selector de versión y "Cerrar" sin salir del lector
