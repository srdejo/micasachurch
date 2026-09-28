# brand-theme Specification

## Purpose

Define la identidad visual de Mi Casa Church en el landing y el panel: tipografías oficiales (Gotham y Dharma Gothic), temas de color (acento, profundo y suave) editables y elegibles desde el admin, y uso de los logos oficiales.

## Requirements

### Requirement: Tipografías oficiales
El landing y el panel SHALL usar las tipografías oficiales de la marca: Dharma Gothic E (pesos 300, 800 y 900) para títulos de sección, cifras y nombres destacados, mostrados en mayúsculas, y Gotham (Book 400, Book Italic, Bold 700 y Black 900) para el texto corrido, etiquetas, botones y navegación. Los títulos MAY combinar el peso 300 y el 900 en la misma línea (p. ej. "<ligero>Próximos</ligero> eventos"), como en el diseño. Las fuentes MUST servirse desde el propio sitio (sin CDN de terceros), MUST usar `font-display: swap` y MUST declarar una fuente genérica de respaldo.

#### Scenario: Título de sección en el landing
- **WHEN** un visitante abre el landing
- **THEN** los títulos de sección (p. ej. "Prédicas" o "Próximos eventos") se muestran en Dharma Gothic E, en mayúsculas

#### Scenario: Tamaños ajustados a la fuente condensada
- **WHEN** el landing se ve a 1440 px, 375 px y 360 px de ancho
- **THEN** los títulos mantienen una jerarquía clara sobre el texto y ninguno se corta ni desborda su contenedor

#### Scenario: Texto corrido
- **WHEN** un visitante lee un párrafo del landing o una vista del panel
- **THEN** el texto se muestra en Gotham Book

#### Scenario: Fuente no disponible
- **WHEN** un archivo de fuente no carga
- **THEN** el texto se muestra con la alternativa declarada y sigue legible

### Requirement: Uso de los logos oficiales
El landing SHALL mostrar en el header el isotipo oficial teñido con el color de acento del tema activo, junto al logotipo de texto "Mi Casa Church" en blanco sobre fondo oscuro, o en negro sobre el header claro de móvil. El footer y la ventana de horarios SHALL mostrar el isotipo teñido con el acento. El panel SHALL mostrar el isotipo teñido con el acento en el sidebar y el isotipo oficial en login, recuperación y restablecimiento de clave. Las imágenes servidas MUST estar optimizadas para web.

#### Scenario: Header del landing
- **WHEN** un visitante abre el landing en escritorio
- **THEN** el header oscuro muestra el isotipo en el color de acento y el texto "Mi Casa Church" en blanco

#### Scenario: El isotipo sigue al tema
- **WHEN** el administrador activa el tema Celeste
- **THEN** el isotipo del header y del footer se ve celeste en la siguiente carga

#### Scenario: Peso de las imágenes
- **WHEN** se construye el landing
- **THEN** ninguna imagen de logo servida supera 150 KB

### Requirement: Temas de color
El sitio SHALL construir su color de marca a partir del tema activo, que define tres colores: acento (botones principales, franjas, isotipo, "En vivo"), profundo (antetítulos y enlaces sobre fondo claro) y suave (fondo de la tarjeta del devocional). Los temas predefinidos MUST ser Naranja (`#FBA504`, `#9A5B00`, `#FFF1D2`), Coral (`#FF6B35`, `#B23A0F`, `#FFE6DA`) y Celeste (`#3FC1E8`, `#0A6B8C`, `#DDF4FB`). Naranja es el activo por defecto. Los neutros no dependen del tema: tinta `#111110`, crema `#FAF8F4` y `#F1EEE8`, y texto claro `#F7F5F0`. El texto sobre el color de acento MUST ser la tinta.

#### Scenario: Tema por defecto
- **WHEN** no se ha elegido ningún tema
- **THEN** el landing y el panel usan el tema Naranja

#### Scenario: Botón principal
- **WHEN** se muestra un botón de acción principal
- **THEN** su fondo es el color de acento y su texto es la tinta `#111110`

#### Scenario: API de ajustes no disponible
- **WHEN** el landing no puede obtener el tema
- **THEN** se muestra con los colores de Naranja

### Requirement: Temas editables desde el panel
El administrador SHALL poder, desde la vista "Apariencia", ver los tres temas con una muestra de sus colores, editar cada color con un selector de color o escribiéndolo en hexadecimal, y elegir cuál es el tema activo. Cada color MUST ser hexadecimal de 6 dígitos (`#RRGGBB`); un valor inválido MUST rechazarse con un mensaje en español, se marca el campo y se conserva el valor guardado. El cambio SHALL verse en el landing en la siguiente carga de página, sin redesplegar.

#### Scenario: Activar Coral
- **WHEN** el administrador pulsa "Usar este tema" en Coral
- **THEN** la API pública de ajustes devuelve los colores de Coral como activos y el landing usa `#FF6B35` como acento en la siguiente carga

#### Scenario: Editar el acento de Naranja
- **WHEN** el administrador cambia el acento de Naranja a `#F89E1B`
- **THEN** si Naranja está activo, el landing usa `#f89e1b` como acento en la siguiente carga

#### Scenario: Valor inválido
- **WHEN** el administrador escribe `naranja` o `#fff` como color
- **THEN** el sistema rechaza el cambio con un mensaje en español y conserva el valor anterior
