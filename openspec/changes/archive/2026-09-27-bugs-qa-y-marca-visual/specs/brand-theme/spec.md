# Spec Delta

## Purpose

Define la identidad visual de Mi Casa Church en el landing y el panel: tipografías oficiales, paleta de tres colores configurable desde el admin y uso de los logos oficiales.

## ADDED Requirements

### Requirement: Tipografías oficiales
El landing y el panel SHALL usar tipografías de licencia libre equivalentes a la guía de marca: League Gothic (en lugar de Dharma Gothic E ExBold) para títulos principales (h1/h2), Montserrat Bold (en lugar de Gotham Bold) para subtítulos, etiquetas, botones y cifras destacadas, y Montserrat Regular para el texto corrido, con Poppins Regular como primera alternativa. Los títulos MUST conservar mayúsculas y minúsculas tal como se escriben. Las fuentes MUST servirse desde el propio sitio (sin depender de un CDN de terceros) y MUST declarar una fuente genérica de respaldo para no bloquear el render.

#### Scenario: Título de sección en el landing
- **WHEN** un visitante abre el landing
- **THEN** los títulos de sección (p. ej. "Prédicas", "Próximos eventos") se muestran en League Gothic, respetando las minúsculas

#### Scenario: Tamaños ajustados a la fuente condensada
- **WHEN** el landing se ve a 1440 px, 375 px y 360 px de ancho
- **THEN** los títulos mantienen jerarquía visual clara sobre el texto y ninguno se corta ni desborda su contenedor

#### Scenario: Texto corrido
- **WHEN** un visitante lee un párrafo del landing o una vista del panel
- **THEN** el texto se muestra en Montserrat Regular

#### Scenario: Fuente no disponible
- **WHEN** un archivo de fuente no carga
- **THEN** el texto se muestra con la alternativa declarada y el contenido sigue legible

### Requirement: Paleta de marca de tres colores
El landing SHALL construir su paleta a partir de tres colores: primario (por defecto `#f89e1b`), secundario (por defecto `#000000`) y terciario (por defecto `#ffffff`). Los colores provisionales anteriores (terracota, crema, dorado) MUST dejar de usarse. Todo texto sobre el color primario MUST usar el color secundario (no el terciario) para mantener contraste legible.

#### Scenario: Paleta por defecto
- **WHEN** no hay colores personalizados guardados
- **THEN** el landing usa `#f89e1b`, `#000000` y `#ffffff`

#### Scenario: Botón principal
- **WHEN** se muestra un botón de acción principal
- **THEN** su fondo es el color primario y su texto el color secundario

### Requirement: Colores editables desde el panel
El administrador SHALL poder editar los colores primario, secundario y terciario desde el panel. Cada valor MUST ser un color hexadecimal de 6 dígitos (`#RRGGBB`); un valor inválido MUST rechazarse con un mensaje en español y sin modificar el color guardado. El panel MUST ofrecer restablecer los tres colores a los valores de marca. El cambio SHALL reflejarse en el landing en la siguiente carga de página, sin redesplegar.

#### Scenario: Cambiar el color primario
- **WHEN** el administrador guarda `#1b6ff8` como primario
- **THEN** la API pública de ajustes devuelve `#1b6ff8` y el landing usa ese color en la siguiente carga

#### Scenario: Valor inválido
- **WHEN** el administrador intenta guardar `naranja` o `#fff` como color
- **THEN** el sistema rechaza el cambio con un mensaje en español y conserva el valor anterior

#### Scenario: Restablecer colores
- **WHEN** el administrador pulsa "Restablecer colores de marca"
- **THEN** los tres colores vuelven a `#f89e1b`, `#000000` y `#ffffff`

#### Scenario: API de ajustes no disponible
- **WHEN** el landing no puede obtener los ajustes
- **THEN** se muestra con la paleta por defecto

### Requirement: Uso de los logos oficiales
El landing SHALL mostrar el logotipo horizontal oficial ("Mi Casa Church") en el header y en el footer, usando la variante clara sobre fondos oscuros. El panel SHALL mostrar el isotipo oficial en login, recuperación y restablecimiento de clave, y el logotipo en el sidebar. Las imágenes servidas MUST estar optimizadas para web (no los originales de 4500 px).

#### Scenario: Header del landing
- **WHEN** un visitante abre el landing
- **THEN** el header muestra el logotipo horizontal oficial en lugar del logo circular con el texto aparte

#### Scenario: Peso de las imágenes
- **WHEN** se construye el landing
- **THEN** ninguna imagen de logo servida supera 150 KB
