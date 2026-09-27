# Spec Delta

## Purpose

Comportamiento del sitio público de Mi Casa Church: acceso a la transmisión en vivo, navegación entre secciones, formularios, donaciones y visualización en móvil.

## ADDED Requirements

### Requirement: Acceso a la transmisión en vivo
Todo control "En vivo" del landing (banner, botón de Prédicas, tarjeta de Facebook en Síguenos, barra inferior móvil) SHALL abrir la página de Facebook de la iglesia en una pestaña nueva, usando el enlace `facebook` administrado desde el panel. El landing MUST NOT incrustar el reproductor/plugin de Facebook ni abrir un modal para la transmisión.

#### Scenario: Clic en "En vivo 7:00 a.m."
- **WHEN** un visitante pulsa "En vivo 7:00 a.m." en Prédicas
- **THEN** se abre la página de Facebook de la iglesia en una pestaña nueva y la página del landing conserva su posición

#### Scenario: Tarjeta de Facebook en Síguenos
- **WHEN** un visitante pulsa la tarjeta de Facebook
- **THEN** se abre la página de Facebook en una pestaña nueva

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
