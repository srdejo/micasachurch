# Spec Delta

## Purpose

Carrusel de la portada del landing con banners (imagen, textos y botón) que el administrador crea, ordena, activa y edita desde el panel sin redesplegar.

## ADDED Requirements

### Requirement: Carrusel de portada
La portada del landing SHALL mostrar los banners activos en el orden definido, uno a la vez, con transición de opacidad. Cada banner muestra su imagen de fondo con un degradado oscuro, antetítulo en el color de acento, título grande, texto, un botón principal con su texto y enlace, y un botón fijo "Planea tu visita" (solo en escritorio). El carrusel MUST avanzar solo cada 6,5 segundos, MUST pausarse mientras el mouse está sobre la portada o la ventana de horarios está abierta, y MUST tener indicadores por banner, contador "01 / 03" y flechas anterior y siguiente en escritorio. En móvil MUST permitir deslizar a izquierda o derecha (más de 40 px) para cambiar de banner. Solo el banner visible recibe clics y es visible para lectores de pantalla.

#### Scenario: Rotación automática
- **WHEN** hay tres banners activos y el visitante no interactúa
- **THEN** cada 6,5 s se muestra el siguiente y después del tercero vuelve al primero

#### Scenario: Pausa al pasar el mouse
- **WHEN** el visitante deja el mouse sobre la portada
- **THEN** el banner visible no cambia hasta que el mouse sale

#### Scenario: Banner sin imagen
- **WHEN** un banner activo no tiene imagen
- **THEN** se muestra sobre fondo tinta con el mismo texto y los mismos botones, sin imagen rota

#### Scenario: Enlace a la ventana de horarios
- **WHEN** el enlace del botón de un banner es `#horarios` y el visitante lo pulsa
- **THEN** se abre la ventana de horarios en vez de navegar

#### Scenario: Sin banners activos
- **WHEN** no hay ningún banner activo o la API no responde
- **THEN** la portada muestra el banner por defecto "Mi casa es tu casa" con el botón "Ver horarios"

### Requirement: Administración de banners
El administrador SHALL poder, desde la vista "Banner principal", crear un banner, editar su antetítulo, título, texto, texto del botón y enlace del botón, activarlo o desactivarlo, eliminarlo y subir su imagen (PNG, JPEG o WebP, máximo 5 MB). La vista MUST mostrar una vista previa 16:9 de la imagen, o "Sin imagen", con el número de orden del banner. Los cambios se guardan al vuelo y el landing los muestra en la siguiente carga. El título MUST ser obligatorio; si falta, el cambio se rechaza con un mensaje en español. El enlace del botón MUST aceptar un ancla (`#…`), una ruta del sitio (`/…`) o una URL `https://`.

#### Scenario: Crear y publicar un banner
- **WHEN** el administrador crea un banner con título "Conferencia 2026", sube su imagen y lo deja activo
- **THEN** en la siguiente carga el landing incluye ese banner en el carrusel con su imagen

#### Scenario: Desactivar un banner
- **WHEN** el administrador desactiva un banner
- **THEN** el banner deja de aparecer en el landing pero sigue en el panel como inactivo

#### Scenario: Imagen demasiado grande
- **WHEN** el administrador sube una imagen de 8 MB
- **THEN** el sistema rechaza la subida con un mensaje en español y conserva la imagen anterior

#### Scenario: Enlace inválido
- **WHEN** el administrador escribe `javascript:alert(1)` como enlace del botón
- **THEN** el sistema rechaza el cambio con un mensaje en español

### Requirement: Banners iniciales
Al aplicar la migración, el sistema SHALL tener sembrados los tres banners del diseño: "Mi casa es tu casa" (botón "Ver horarios" → `#horarios`, imagen de la congregación), "Empieza el día con la Palabra" (botón "Leer el devocional de hoy" → `/devocional`, imagen de los pastores) y "¿Ya estás en una red?" (botón "Quiero entrar a una red" → `#redes`, sin imagen).

#### Scenario: Primera carga después del despliegue
- **WHEN** se despliega el cambio sobre la base de datos de producción
- **THEN** el carrusel muestra los tres banners iniciales
