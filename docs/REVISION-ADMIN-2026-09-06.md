# Revisión punto a punto del panel administrativo — 2026-09-06

Recorrido de las nueve vistas del `frontend-admin` en producción (`admin.micasachurch.co`), con
clics reales y pruebas de alta, edición, publicación y baja, más lectura del código de cada vista y
de los endpoints que consume. Lo que sigue son los fallos encontrados, separados entre lo que quedó
arreglado en el repo (pendiente de compilar y desplegar) y lo que sigue abierto.

## Cómo se probó

- Las nueve vistas cargadas y revisadas una por una con la sesión de un administrador real.
- Ciclo completo de un evento: crear → editar → guardar → publicar → verificar en `GET /api/events`
  público → eliminar.
- Red creada y eliminada; horario alternado y devuelto a su valor original; enlace guardado.
- Petición de oración enviada desde el formulario público de `micasachurch.co` y atendida desde el
  panel (flujo completo de punta a punta).
- Validaciones del backend de imágenes probadas contra el API: tipo no permitido y clave inexistente
  responden `422` con el mensaje ya traducido; sin token, `401`.

## Fallos corregidos en el repo (faltan `ng build` + deploy para que lleguen a producción)

1. **Un 401 dejaba el panel colgado.** El interceptor sólo añadía el token y no miraba la respuesta,
   y el guard daba por buena la sesión con sólo existir el token, sin mirar su vencimiento. Con el
   token vencido (el de la sesión revisada venció el 1 de septiembre) el panel se quedaba en la
   pantalla actual fallando en silencio, sin volver al login. Ahora el guard lee el `exp` del JWT, el
   interceptor cierra la sesión ante cualquier `401` fuera de `/admin/auth/`, y el login explica
   "Tu sesión expiró. Ingresa de nuevo.".
2. **"Cerrar sesión" invisible.** El botón existe al pie de la barra lateral, pero el `aside` mide
   ~694px y no tenía scroll: en una ventana de menos de esa altura (la revisada: 633px) el pie
   quedaba cortado y no había forma de llegar a él. Ahora el menú scrollea y el pie queda siempre a
   la vista.
3. **Eliminar un evento no pedía confirmación** — único borrado del panel sin resguardo, y el botón
   está pegado a "Guardar". Verificado en vivo: un clic y el evento desapareció. Ahora confirma, y
   además avisa si el borrado falla.
4. **Tras publicar, las filas seguían diciendo "Cambios sin publicar"** mientras la cabecera ya decía
   "Todo publicado" (comprobado: `hasDraft` ya era `false` en el servidor). Publicar ahora avisa a
   las vistas de eventos y contenido para que se recarguen.
5. **Un fallo al publicar no se veía.** `PublishStateService` se tragaba el error y el botón volvía a
   su estado normal como si nada. Ahora se muestra el mensaje.
6. **El check "se transmite en vivo" mentía si el guardado fallaba**: se pintaba el valor nuevo antes
   de la respuesta y no se revertía. Ahora vuelve a su estado anterior si el `PATCH` falla.
7. **Los enlaces de WhatsApp de las peticiones no abrían.** `wa.me/3001234567` sin indicativo no es un
   número válido; la gente escribe su celular como lo marca en Colombia. Ahora se antepone `57` a los
   números de 10 dígitos que empiezan por 3.
8. **Fechas en inglés** ("Sep 6, 2026, 5:09:52 PM") en un panel en español: faltaba registrar el
   locale. Configurado `es-CO`.
9. **Un administrador podía eliminarse a sí mismo.** El backend sólo protegía al último administrador,
   así que con dos o más cualquiera podía dejarse fuera: el JWT sigue vivo pero el usuario ya no
   existe. Comprobado en producción de la peor manera durante esta revisión — se borró el usuario
   `admin` y hubo que recrearlo por invitación. Ahora `AdminUserService.delete` rechaza el
   auto-borrado (`adminuser.self_delete`) y el panel ya no ofrece "Eliminar" sobre uno mismo.
10. **Texto de desarrollador en la interfaz de la iglesia**: la vista Enlaces decía "La grilla de
    fotos con carga de imágenes queda fuera de este MVP". Reemplazado.
11. **Voseo suelto** ("Subí un archivo", "Cambiá tu clave") en un panel que tutea en el resto.
12. **No se avisaba qué secciones se publican solas.** Redes, Enlaces y Horarios no pasan por el botón
    "Publicar cambios" — sólo eventos, textos y ministerios tienen borrador. Ahora esas tres vistas lo
    dicen.
13. **El hero del sitio público perdía un servicio.** `services().slice(0, 3)` sobre una lista que el
    backend devuelve sin `ORDER BY`: con cuatro servicios, el "Domingo 8:30 a.m." desaparecía del
    hero, y como el orden lo decide el orden físico de las filas, cambia cada vez que se edita un
    horario. Verificado en vivo: al alternar un check, la lista salió en otro orden. El hero ahora
    agrupa por día y ordena por día de la semana y hora real.

## Resuelto después de la revisión

- **El interruptor del banner "En vivo"**: decidido con Daniel (2026-09-06) que apaga *sólo* el banner
  superior; los enlaces "En vivo 7:00 a.m." de Prédicas y Facebook siguen visibles a propósito. El
  código ya se comportaba así, lo que engañaba era el texto del panel, ahora corregido.

## Cerrado el mismo día (Etapa 12)

Además del interruptor: `display_order` en los horarios, alta y baja de horarios desde el panel, el
alta de redes que ya no publica tarjetas vacías, el filtro de peticiones de oración, el respaldo de
`uploads/` dentro de `Backup-Database` y los diálogos de confirmación propios en lugar de `confirm()`.
Ver `docs/ROADMAP.md`, Etapa 12.

## Lo que sigue abierto

- **Queda un solo administrador.** `daniloduarte` y `robinson` no tenían correo registrado y se
  eliminaron a pedido de Daniel (2026-09-06); los recreará por invitación, que es el camino que sí deja
  correo y clave propia. Mientras tanto `admin` es el único acceso al panel: conviene invitar a un
  segundo administrador pronto.
- **Las peticiones de oración siguen sin poder borrarse** (sólo marcarse como atendidas). Ya hay filtro
  por estado, que era lo urgente; borrarlas necesitaría un endpoint nuevo.
- **Las imágenes subidas no se pueden borrar ni restaurar desde el panel.** Cada slot guarda una sola
  imagen y subir reemplaza, sin historial. El respaldo de la carpeta ya está en `deploy.ps1`, pero
  restaurar sigue siendo manual.
- **Ningún frontend tiene tests corridos** (`ng test` nunca se ejecutó en los dos proyectos).

## Notas de estado

- Las fotos reales ya no son un pendiente ciego: el logo y la foto de portada del sitio son reales y
  están cargadas desde el panel. Lo que falta es contenido de eventos y las fotos de la sección
  "Quiénes somos".
- No hay eventos publicados: el único evento cargado ("Noche de alabanza", 15 de septiembre) está sin
  publicar, así que la sección del sitio muestra "Por ahora no hay eventos publicados".
