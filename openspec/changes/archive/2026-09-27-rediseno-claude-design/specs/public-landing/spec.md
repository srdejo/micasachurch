# Spec Delta

## MODIFIED Requirements

### Requirement: Acceso a la transmisión en vivo
Todo control "En vivo" del landing (franja en vivo, botón del header, botón de Prédicas, tarjeta de Facebook en Síguenos, barra inferior de móvil y fila en vivo de la ventana de horarios) SHALL abrir en una pestaña nueva el enlace de la transmisión activa. Ese enlace es el de la transmisión especial en curso si la tiene y, si no, el enlace `facebook` administrado desde el panel. Los controles que no dependen de una transmisión en curso (botón "En vivo 7:00 a.m." de Prédicas, tarjeta de Facebook y "En vivo" de la barra móvil cuando no hay transmisión) SHALL abrir el enlace `facebook`. El landing MUST NOT incrustar el reproductor ni el plugin de Facebook, ni abrir un modal para la transmisión.

#### Scenario: Clic en "En vivo 7:00 a.m."
- **WHEN** un visitante pulsa "En vivo 7:00 a.m." en Prédicas
- **THEN** se abre la página de Facebook de la iglesia en una pestaña nueva y el landing conserva su posición

#### Scenario: Tarjeta de Facebook en Síguenos
- **WHEN** un visitante pulsa la tarjeta de Facebook
- **THEN** se abre la página de Facebook en una pestaña nueva

#### Scenario: Transmisión especial con enlace propio
- **WHEN** está en curso una transmisión especial con enlace `https://youtube.com/live/abc` y el visitante pulsa "Ver transmisión"
- **THEN** se abre `https://youtube.com/live/abc` en una pestaña nueva

## ADDED Requirements

### Requirement: Navegación de escritorio y móvil según el diseño
En escritorio (más de 980 px), el landing SHALL mostrar un header oscuro fijo con los enlaces Prédicas, Eventos, Redes, Devocional, Oración y Horarios (este último abre la ventana de horarios), el botón "En vivo" si hay transmisión en curso y el botón "Planea tu visita". En 980 px o menos, SHALL mostrar un header claro con botones de WhatsApp y de menú, un menú desplegable con todas las secciones más "Ver en vivo · 7:00 a.m." y "Escribir por WhatsApp", y una barra inferior fija con los botones "En vivo" y "WhatsApp" que respeta el área segura del dispositivo. El orden de secciones y las demás reglas de este spec (Síguenos al final, sin "Ya estoy en una", "Cómo llegar" a Google Maps, sin desborde horizontal) MUST mantenerse aunque el diseño de origen las muestre de otra forma.

#### Scenario: Menú móvil
- **WHEN** un visitante en un teléfono de 375 px pulsa el botón de menú y luego "Oración"
- **THEN** el menú se cierra y la página se desplaza a la sección de oración

#### Scenario: Barra inferior en móvil
- **WHEN** un visitante hace scroll en un teléfono
- **THEN** la barra con "En vivo" y "WhatsApp" queda visible al pie de la pantalla y no tapa el final del footer

#### Scenario: Horarios desde el header
- **WHEN** un visitante de escritorio pulsa "Horarios" en el header
- **THEN** se abre la ventana de horarios
