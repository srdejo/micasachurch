# DECISIONS.md

Decisiones técnicas tomadas y por qué.

## Sin multitenancy, sin roles complejos

El sitio es para una sola congregación con un único administrador. Se descartó explícitamente cualquier mecanismo de multi-tenant (columna `tenant_id`, filtros de Hibernate, etc.) y cualquier sistema de roles — hay un solo `AdminUser`, sin niveles de permiso. Sobre-diseñar esto para un caso de uso de un solo cliente añadiría complejidad sin beneficio.

## Devocional consultado en vivo, sin persistir

Ver `docs/ARCHITECTURE.md` § "El devocional NO se persiste". Resumen: `frontend-landing` llama directo a la API pública de Our Daily Bread desde el navegador del visitante; el backend nunca ve ni guarda ese contenido.

## Cambios del admin persisten al vuelo, sin "borrador vs. publicado"

Cada vista del panel administrativo hace su propio PUT/PATCH por campo o recurso en el momento en que el admin edita — no existe un estado intermedio de "borrador" que luego se "publique". Esto es apropiado para un solo administrador editando contenido de bajo riesgo (horarios, enlaces, eventos); un flujo de aprobación/publicación sería sobre-ingeniería aquí.

## Sin galería de fotos en el admin (fuera del MVP) — **título y alcance corregidos (2026-09-06)**

La vista "Enlaces" del panel solo cubre enlaces y cuentas (WhatsApp, redes sociales, cuentas de ofrenda) — no incluye una grilla de fotos. Se decidió dejar la galería fuera del MVP porque no hay fotos reales disponibles todavía (ver `docs/PROGRESS.md`) y los placeholders actuales (color/gradiente por CSS) no requieren gestión desde el admin.

**Corrección (2026-09-06): el upload de imágenes sí está implementado**, esta sección se escribió antes y su título confundía. Lo que hay es una vista **Imágenes** aparte de "Enlaces": `AdminImageController` expone `GET /api/admin/images` y `POST /api/admin/images/{key}` (multipart, máx. 5 MB, `image/png|jpeg|webp|svg+xml`), `ImageStorage` guarda el archivo en `${UPLOADS_DIR:uploads}` — que con `WorkingDirectory=/home/srdejo/apps/micasachurch` cae en `~/apps/micasachurch/uploads`, fuera de `releases/`, así que un deploy no se las lleva — y `frontend-admin` tiene un `input type="file"` por slot. La restricción real es otra: los slots son **fijos** (`ALLOWED_KEYS` = `logo`, `hero`, `quienes_somos`, `og_image`), uno por imagen, sin borrado y sin orden. Agregar un slot nuevo exige tocar código y desplegar.

Lo que sigue fuera de alcance, entonces, es la **galería**: N fotos arbitrarias con alta, baja y reordenamiento. Se revisa cuando la iglesia entregue fotos reales que valga la pena rotar.

Pendiente asociado, no cubierto hoy: la carpeta `uploads/` del VPS no está en ninguna rutina de backup (la de `deploy.ps1` respalda la base de datos, no el disco). Si se pierde, se pierden las imágenes subidas por la iglesia.

## Contraseña de administrador sembrada es un placeholder

La migración `V2__church_seed.sql` siembra un único `AdminUser` con usuario `admin` y clave `password` (hash bcrypt). **Debe cambiarse antes de producción** — ver `docs/DEPLOYMENT.md`.

## Subdominio de `frontend-admin`: `admin.micasachurch.co` (confirmado 2026-08-31)

Se infirió inicialmente `admin.micasachurch.co` sin confirmación del usuario. El 2026-08-31 el usuario creó el registro DNS para ese subdominio (junto con `api`, `nolost` y `nolost-api`), confirmando la elección. Ya no es una decisión pendiente.

## Migración de `nolost` a subdominio propio: pendiente de ejecución (DNS ya creado 2026-08-31)

Existe una tarea pendiente para migrar `nolost` de su ruta actual (`micasachurch.co/api`, compartiendo dominio con el proyecto de contacto/landing legado) a subdominios propios (`nolost.micasachurch.co` para el frontend, `nolost-api.micasachurch.co` para el backend). El usuario ya creó los registros DNS de los 4 subdominios (`admin`, `api`, `nolost`, `nolost-api`) el 2026-08-31, pero el aprovisionamiento del lado del servidor (nginx/SSL/systemd en `nolost-vps`, y el cambio de dominio raíz de `nolost` a `micasachurch`) **todavía no se ejecutó** — sigue pendiente de una sesión con acceso SSH autorizado al VPS. Ver `docs/PROGRESS.md` para el plan de pasos.

## Bug: faltaba `fileReplacements` de producción en ambos `angular.json` (corregido 2026-08-31)

Ninguno de los dos frontends tenía configurado `fileReplacements` en la configuración `production` de `angular.json`, así que `ng build --configuration production` seguía usando `environment.ts` (apuntando a `http://localhost:8088/api`) en vez de `environment.prod.ts` (`https://api.micasachurch.co/api`). Síntoma: el login del admin fallaba en el navegador con "Usuario o clave inválidos" — un mensaje genérico que el `Login` component muestra para cualquier error HTTP, lo que ocultó la causa real hasta comparar el `apiUrl` embebido en el bundle desplegado. El backend nunca tuvo el problema (confirmado con `curl` directo antes de encontrar el bug). Corregido agregando el `fileReplacements` estándar de Angular CLI a ambos `angular.json`.

## Deploy de `frontend-admin`: subida manual, no automatizada en `deploy.ps1` — **superado (2026-09-06)**

Como ya estaba documentado en la decisión de abajo, `infra/deploy.ps1` (`Deploy-Frontend`) solo maneja un `FrontendPath` por proyecto — para el primer deploy real (2026-08-31) se corrió `infra/deploy.ps1 -Projects micasachurch` para backend + `frontend-landing`, y `frontend-admin` se compiló y subió a mano (`ng build` + `scp` directo a `~/apps/micasachurch/frontend-admin`). Automatizar esto en `deploy.ps1` quedó fuera de alcance de este MVP en su momento.

**Ya no aplica (2026-09-06).** `infra/deploy.ps1` se refactorizó: `Deploy-Frontend` delega en una función `Deploy-OneFrontend` (build + limpieza remota + `scp`) y la invoca una segunda vez si el proyecto declara `AdminFrontendPath`. `micasachurch` ya trae `AdminFrontendPath`, `AdminFrontendDistSubpath` y `RemoteAdminFrontendDir` en su bloque de configuración, así que `infra/deploy.ps1 -Projects micasachurch` despliega backend + `frontend-landing` + `frontend-admin` en una sola corrida. Pendiente: correrlo una vez para verificarlo end-to-end.

## Infra: `deploy.ps1` extendido con dos rutas de frontend

`micasachurch` es el primer proyecto del workspace con dos frontends. El flujo genérico `Deploy-Frontend` de `infra/deploy.ps1` solo maneja un `FrontendPath` por proyecto, así que se dejó `FrontendPath` apuntando a `frontend-landing` (el sitio público, prioridad de despliegue) y se agregaron `LandingFrontendPath`/`AdminFrontendPath` como campos informativos para cuando ese flujo se extienda a manejar ambos frontends. No se modificó la lógica genérica de despliegue de otros proyectos.

**Actualización (2026-09-06):** ese flujo ya se extendió — `AdminFrontendPath` dejó de ser informativo y hoy dispara un segundo `Deploy-OneFrontend`. Los demás proyectos no cambian: sin `AdminFrontendPath`, el bloque simplemente no se ejecuta.

## Observabilidad HTTP: filtro de logging fuera de Spring Security (2026-09-05)

Se agrego `RequestLoggingFilter` en `platform/web-common` registrado con `FilterRegistrationBean` en `Ordered.HIGHEST_PRECEDENCE`, por fuera de la cadena de Spring Security, para poder loguear tambien las peticiones rechazadas con 401/403 antes de llegar a un controlador. El `requestId` se genera en el filtro y nunca se acepta de un header del cliente. `platform:security` paso a depender de `platform:web-common` (antes no la declaraba) para poder poner el `userId` en el MDC desde `JwtAuthenticationFilter`.

## Bug: peticiones sin token respondian 403 en vez de 401 (corregido 2026-09-05)

`SecurityConfig` no registraba `.exceptionHandling(...)`, asi que Spring Security usaba su entry point por defecto (`Http403ForbiddenEntryPoint`): una peticion sin token y una de un usuario autenticado sin permiso daban el mismo 403, y sin cuerpo. Se agrego `SecurityErrorResponder` (`AuthenticationEntryPoint` + `AccessDeniedHandler` en una sola clase) en `platform:security`, registrado en el `filterChain`, que responde 401 sin token y 403 sin permiso, ambos con el `ApiResponse` de `platform:web-common`.

## El interruptor "En vivo" apaga sólo el banner (2026-09-06)

`liveBannerVisible` controla únicamente la franja superior de la landing. El botón "En vivo 7:00 a.m."
de la sección Prédicas (que abre el modal de transmisión) y la tarjeta de Facebook son fijos y no
dependen de él. Se evaluó meterlos bajo el mismo interruptor y Daniel decidió que no: el interruptor
es para la franja, y los enlaces a la transmisión deben seguir disponibles aunque la franja esté
oculta. Lo que se corrigió fue el texto del panel, que describía el interruptor como si apagara todo
aviso de transmisión — ver `docs/REVISION-ADMIN-2026-09-06.md`.

## Orden de los horarios: columna `display_order`, no orden calculado (2026-09-06)

`day` y `time` son texto libre ("Domingo", "8:30 a.m."), así que no sirven para ordenar: alfabéticamente
"10:00 a.m." va antes que "8:30 a.m.". Se evaluó parsear la hora en el backend y se descartó — sería
frágil y dejaría a la iglesia sin poder decidir el orden. Se agregó `display_order` (migración `V8`),
igual que en `ministries` y `networks`, con el orden inicial fijado en la migración. `findAll()` del
repositorio pasa a estar ordenado por contrato.

## Diálogos de confirmación propios en vez de `confirm()` (2026-09-06)

`confirm()` rompía el estilo del panel y bloquea el hilo del navegador, lo que además impedía probar
los borrados con herramientas de automatización. Se creó `shared/confirm-dialog`, un componente
standalone con `input()`/`output()` de señales — los primeros del panel — que sigue el estilo de las
tarjetas. El foco inicial va a "Cancelar" a propósito: la acción destructiva no debe dispararse con un
Enter reflejo.

## Alta de redes y horarios: nada se crea hasta que el formulario está lleno (2026-09-06)

Redes y horarios no pasan por el flujo de borradores, así que se publican en el sitio en cuanto se
guardan. El botón "Agregar red" creaba en el servidor una "Nueva red" vacía que aparecía de inmediato
en `micasachurch.co`. Ahora ambas secciones tienen un formulario de alta y sólo llaman al API cuando
los campos obligatorios están completos. La alternativa —meter redes y horarios en el flujo de
borradores— es más trabajo y más conceptos para la iglesia, y se dejó para si algún día hace falta.

## Los `git push` los hace Daniel, no el agente (2026-09-08)

Las sesiones del agente trabajan en una rama `claude/<tema>-<fecha>` y hacen commit local, pero **no publican nada**: el `push` y el merge a `main` los hace Daniel desde su máquina, y en el entorno del agente no se configuran credenciales de git (ni deploy key, ni token, ni llaves SSH).

El motivo es doble. El entorno del agente es efímero —cada sesión arranca con un `$HOME` limpio—, así que cualquier credencial tendría que quedar en texto plano dentro de la carpeta del workspace para sobrevivir de un día para otro; y el push manual conserva un punto de revisión humano, porque el diff se ve antes de que entre a GitHub. Automatizarlo ahorra ~30 segundos al día a cambio de un secreto en disco, y el cambio no compensa.

Alternativas descartadas: una **deploy key por repo** (son 10 y una llave sirve para un solo repositorio; además no se puede limitar a un patrón de ramas — eso lo hace un *ruleset*, no el tipo de credencial); un **token fino** con `Contents: Read and write` sobre los 10 repos (más simple que 10 llaves y sería la vía si algún día se automatiza, pero deja el token en disco y exigiría proteger `main` con un ruleset); y una **GitHub App** (lo más correcto, demasiado montaje para lo que se gana).

Consecuencia práctica: que `git push` falle en el entorno del agente con `Host key verification failed` es el **comportamiento esperado**, no un problema por resolver ni un bloqueante que reportar. Cada sesión deja las ramas listas y los comandos de push en `RESUMEN-DIARIO.md`, en la raíz del workspace. Aplica a los 10 repos.
