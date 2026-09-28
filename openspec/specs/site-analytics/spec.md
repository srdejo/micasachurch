# site-analytics Specification

## Purpose

Medir con Google Analytics 4 las visitas y las acciones importantes del sitio público de Mi Casa Church, y permitir que el administrador consulte esas estadísticas desde el panel.

## Requirements

### Requirement: Conteo de visitas del sitio público
El sitio público SHALL enviar a Google Analytics 4 cada vista de página, incluidas las navegaciones internas sin recarga (p. ej. de la página principal a `/devocional` y los cambios de fecha del devocional). Con eso GA4 reporta procedencia, país y tipo de dispositivo. La medición MUST hacerse solo desde el navegador del visitante: el HTML prerenderizado y el render del servidor MUST NOT incluir ni ejecutar la etiqueta. El panel administrativo MUST NOT medirse.

#### Scenario: Visita a la página principal
- **WHEN** un visitante abre `https://micasachurch.co/`
- **THEN** GA4 registra una vista de la página `/`

#### Scenario: Navegación al devocional
- **WHEN** el visitante pulsa "Leer completo →" y llega a `/devocional`
- **THEN** GA4 registra además una vista de `/devocional`, sin que la página se recargue

#### Scenario: Panel sin medición
- **WHEN** el administrador navega por `admin.micasachurch.co`
- **THEN** no se envía nada a Google Analytics

### Requirement: Eventos sin datos personales
Ningún evento enviado a GA4 MUST incluir datos personales ni contenido escrito por el visitante: nombres, teléfonos ni el texto de la petición de oración. El sitio MUST NOT mostrar un banner de consentimiento; la medición empieza al cargar la página.

#### Scenario: Petición de oración sin datos
- **WHEN** un visitante envía una petición con su nombre y WhatsApp
- **THEN** el evento enviado no contiene el nombre, el WhatsApp ni el texto de la petición

### Requirement: Eventos de acciones importantes
El sitio público SHALL enviar un evento de GA4, con su nombre y un parámetro de contexto cuando aplica, cada vez que el visitante:
- pulsa un control "En vivo" (evento `en_vivo`, parámetro `origen`: `header`, `franja`, `barra_movil`, `menu`, `tarjeta_movil` o `horarios`). La tarjeta de Facebook de Síguenos abre siempre la página de Facebook, no la transmisión, así que cuenta como red social;
- pulsa un enlace de WhatsApp (evento `whatsapp`, parámetro `origen`: la sección desde la que lo pulsó);
- envía con éxito una petición de oración (evento `peticion_oracion`). Un envío rechazado por validación o por error del servidor MUST NOT contarse;
- abre una lectura de "La Biblia en un año" (evento `biblia_en_un_ano`, parámetro `referencia`, p. ej. `Gálatas 6`);
- reproduce por primera vez el audio del devocional en esa página (evento `devocional_audio`, parámetro `pagina`: `inicio` o `devocional`). Pausar y reanudar no cuenta de nuevo; cambiar de fecha en `/devocional` y reproducir la nueva lectura sí cuenta;
- pulsa "Cómo llegar" (evento `como_llegar`);
- pulsa el enlace de una red social (evento `red_social`, parámetro `red`: `facebook`, `youtube`, `instagram` o `tiktok`).

Enviar un evento MUST NOT cambiar ni retrasar lo que hace el control (abrir el enlace, reproducir el audio, abrir el lector).

#### Scenario: Clic en "En vivo" del header
- **WHEN** un visitante de escritorio pulsa "En vivo" en el header durante una transmisión
- **THEN** se abre la transmisión como siempre y GA4 recibe `en_vivo` con `origen: header`

#### Scenario: Petición fallida
- **WHEN** el visitante pulsa "Enviar petición" con la petición vacía
- **THEN** no se envía `peticion_oracion`

#### Scenario: Leer la Biblia en un año
- **WHEN** el visitante pulsa "Gálatas 6" en el recuadro "La Biblia en un año"
- **THEN** se abre el lector y GA4 recibe `biblia_en_un_ano` con `referencia: Gálatas 6`

#### Scenario: Audio desde el inicio
- **WHEN** el visitante pulsa reproducir en la tarjeta del devocional de la página principal, pausa y vuelve a reproducir
- **THEN** GA4 recibe `devocional_audio` con `pagina: inicio` una sola vez

### Requirement: Sitio intacto sin analítica
Si no hay ID de medición configurado, o la etiqueta de Google no carga o está bloqueada por el navegador, el sitio SHALL funcionar exactamente igual: sin errores visibles, sin demoras en la carga y con todos los controles operativos.

#### Scenario: Bloqueador de anuncios
- **WHEN** un visitante con bloqueador que impide cargar la etiqueta de Google pulsa "En vivo"
- **THEN** la transmisión se abre normalmente y no aparece ningún error

#### Scenario: Sin configuración
- **WHEN** el sitio corre con `ng serve` sin ID de medición
- **THEN** no se hace ninguna petición a Google Analytics

### Requirement: Tráfico de pruebas separado
Las visitas desde el entorno local de pruebas SHALL enviarse marcadas como tráfico de depuración, para verlas en tiempo real en la vista de depuración de GA4 sin que cuenten en los informes del sitio.

#### Scenario: Prueba en local
- **WHEN** alguien navega `http://micasachurch.test` con la analítica local activa
- **THEN** sus visitas aparecen en la vista de depuración de GA4 y no en los informes de visitas del sitio

### Requirement: Estadísticas en el panel
El panel administrativo SHALL tener una vista "Estadísticas" en el sidebar que muestre, sin salir del panel, un informe de estadísticas del sitio público con visitantes, vistas, páginas más vistas, procedencia, países, dispositivos y eventos, con selector de periodo. La vista MUST ofrecer un enlace "Abrir Google Analytics" en una pestaña nueva. Si la dirección del informe no está configurada, la vista MUST mostrar "Las estadísticas no están disponibles en este momento." con el enlace.

#### Scenario: Ver estadísticas
- **WHEN** el administrador pulsa "Estadísticas" en el sidebar
- **THEN** ve el informe con las visitas del periodo elegido y los eventos, sin salir del panel

#### Scenario: Informe no configurado
- **WHEN** el panel corre sin la dirección del informe configurada
- **THEN** la vista muestra "Las estadísticas no están disponibles en este momento."
