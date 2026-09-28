# Spec Delta

## Purpose

Determinar automáticamente, en hora de Colombia, si la iglesia está transmitiendo en vivo (según el horario fijo y las transmisiones especiales), mostrarlo en el landing y presentar los horarios en una franja y una ventana dedicada.

## ADDED Requirements

### Requirement: Estado "En vivo" automático
El landing SHALL calcular el estado en vivo con la hora de `America/Bogota`, sin importar la zona horaria del visitante. Una transmisión está en curso desde su hora de inicio hasta su hora de inicio más su duración en minutos. Las fuentes son: (a) los horarios marcados como transmitidos, en su día de la semana o todos los días si el día es "Todos los días", con su duración (120 minutos por defecto); y (b) las transmisiones especiales activas, en su fecha. Si coinciden varias, MUST ganar la transmisión especial. El estado MUST recalcularse al menos cada 30 segundos sin recargar la página. Si el administrador ocultó la franja en vivo, el landing MUST NOT mostrar ni la franja "En vivo ahora" ni "Próxima transmisión".

#### Scenario: Durante el devocional diario
- **WHEN** son las 7:10 a.m. en Colombia y existe el horario transmitido "Todos los días · 7:00 a.m." de 45 minutos
- **THEN** el landing muestra la franja "En vivo ahora · Devocional diario" con "Ver transmisión", y el header muestra el botón "En vivo"

#### Scenario: Fuera de transmisión
- **WHEN** son las 3:00 p.m. del miércoles en Colombia y el próximo horario transmitido es el miércoles a las 7:00 p.m.
- **THEN** el landing muestra "Próxima transmisión en vivo · Hoy 7:00 p.m. · Servicio del miércoles" con "Ver horarios"

#### Scenario: Transmisión especial con prioridad
- **WHEN** una transmisión especial activa empieza a la misma hora que un horario fijo
- **THEN** la franja muestra el título de la transmisión especial y usa su enlace

#### Scenario: Visitante en otra zona horaria
- **WHEN** un visitante en Madrid abre el landing a las 14:10 de Madrid (7:10 a.m. en Colombia)
- **THEN** ve el devocional diario como "En vivo ahora"

#### Scenario: Hora que no se puede interpretar
- **WHEN** un horario transmitido tiene como hora un texto que no es una hora válida
- **THEN** ese horario nunca se marca en vivo y el resto del cálculo funciona

### Requirement: Franja de horarios bajo la portada
Debajo de la portada, el landing SHALL mostrar una franja en el color de acento con los horarios agrupados por día ("Domingo 8:30 a.m. y 10:00 a.m."), seguidos de "Devocional · Todos los días 7:00 a.m.", y un botón "Todos los horarios" que abre la ventana de horarios. En móvil, los horarios SHALL mostrarse como tarjetas bajo la tarjeta "En vivo · 7:00 a.m.".

#### Scenario: Horarios agrupados
- **WHEN** existen dos horarios el domingo (8:30 a.m. y 10:00 a.m.)
- **THEN** la franja muestra un solo "Domingo" con "8:30 a.m. y 10:00 a.m."

### Requirement: Ventana de horarios
El landing SHALL ofrecer una ventana modal "Horarios" que se abre desde el header, el menú móvil, la franja de horarios, "Ver horarios" y los banners con enlace `#horarios`. Muestra: la fila "En vivo ahora" si hay transmisión en curso; el horario fijo (día, nota, hora y "En vivo por Facebook", con la fila en curso resaltada en el color de acento y la etiqueta "● En vivo ahora"); las transmisiones especiales futuras de los próximos 7 días ("Hoy", "Mañana" o "Sábado 10 oct" · hora); y la dirección con los botones "Cómo llegar" (Google Maps) y "WhatsApp". La ventana MUST cerrarse con la tecla Escape, con el botón ✕ y con un clic fuera de ella, y MUST declarar `role="dialog"` y `aria-modal="true"`.

#### Scenario: Cerrar con Escape
- **WHEN** la ventana de horarios está abierta y el visitante pulsa Escape
- **THEN** la ventana se cierra y el carrusel vuelve a rotar

#### Scenario: Transmisión especial próxima
- **WHEN** hay una transmisión especial activa mañana a las 7:00 p.m.
- **THEN** la ventana la lista en "Transmisiones especiales" como "Mañana · 7:00 p.m."

### Requirement: Administración de transmisiones especiales
El administrador SHALL poder, desde la vista "Transmisiones especiales", crear, editar, activar o desactivar y eliminar transmisiones especiales, con título, fecha, hora de inicio, duración en minutos (mínimo 15, en pasos de 15) y enlace de la transmisión (por defecto la página de Facebook). La vista MUST mostrar arriba el resumen de los horarios fijos transmitidos que encienden "En vivo" solos, y "No hay transmisiones especiales programadas." si no hay ninguna. Los cambios se guardan al vuelo. Título, fecha y hora MUST ser obligatorios y el enlace MUST ser una URL `https://`; si no, el cambio se rechaza con un mensaje en español.

#### Scenario: Programar una transmisión
- **WHEN** el administrador crea "Noche de alabanza" el 2026-10-10 a las 19:00 por 120 minutos
- **THEN** el 10 de octubre entre las 7:00 y las 9:00 p.m. (Colombia) el landing muestra "En vivo ahora · Noche de alabanza"

#### Scenario: Duración inválida
- **WHEN** el administrador guarda una duración de 5 minutos
- **THEN** el sistema rechaza el cambio con un mensaje en español

### Requirement: Duración de los horarios transmitidos
En la vista "Horarios y en vivo", el administrador SHALL poder definir la duración en minutos de cada horario (por defecto 120). El sistema SHALL tener sembrado el horario transmitido "Todos los días · 7:00 a.m. · Devocional diario en vivo" de 45 minutos. El interruptor existente "Franja de transmisión en vivo" SHALL seguir controlando si el landing muestra la franja.

#### Scenario: Cambiar la duración
- **WHEN** el administrador pone 90 minutos al servicio del domingo de las 8:30 a.m.
- **THEN** el landing lo marca en vivo de 8:30 a 10:00 a.m. del domingo
