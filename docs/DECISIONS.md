# DECISIONS.md

Decisiones técnicas tomadas y por qué.

## Sin multitenancy, sin roles complejos

El sitio es para una sola congregación con un único administrador. Se descartó explícitamente cualquier mecanismo de multi-tenant (columna `tenant_id`, filtros de Hibernate, etc.) y cualquier sistema de roles — hay un solo `AdminUser`, sin niveles de permiso. Sobre-diseñar esto para un caso de uso de un solo cliente añadiría complejidad sin beneficio.

## Devocional consultado en vivo, sin persistir

Ver `docs/ARCHITECTURE.md` § "El devocional NO se persiste". Resumen: `frontend-landing` llama directo a la API pública de Our Daily Bread desde el navegador del visitante; el backend nunca ve ni guarda ese contenido.

## Cambios del admin persisten al vuelo, sin "borrador vs. publicado"

Cada vista del panel administrativo hace su propio PUT/PATCH por campo o recurso en el momento en que el admin edita — no existe un estado intermedio de "borrador" que luego se "publique". Esto es apropiado para un solo administrador editando contenido de bajo riesgo (horarios, enlaces, eventos); un flujo de aprobación/publicación sería sobre-ingeniería aquí.

## Sin admin de imágenes con upload (fuera del MVP)

La vista "Enlaces" del panel solo cubre enlaces y cuentas (WhatsApp, redes sociales, cuentas de ofrenda) — no incluye una grilla de fotos con carga de imágenes. Se decidió dejarlo fuera del MVP porque no hay fotos reales disponibles todavía (ver `docs/PROGRESS.md`) y el placeholder actual (color/gradiente por CSS) no requiere gestión desde el admin. Cuando el cliente provea fotos reales, esto se revisa como una tarea aparte.

## Contraseña de administrador sembrada es un placeholder

La migración `V2__church_seed.sql` siembra un único `AdminUser` con usuario `admin` y clave `password` (hash bcrypt). **Debe cambiarse antes de producción** — ver `docs/DEPLOYMENT.md`.

## Subdominio de `frontend-admin`: `admin.micasachurch.co` (confirmado 2026-08-31)

Se infirió inicialmente `admin.micasachurch.co` sin confirmación del usuario. El 2026-08-31 el usuario creó el registro DNS para ese subdominio (junto con `api`, `nolost` y `nolost-api`), confirmando la elección. Ya no es una decisión pendiente.

## Migración de `nolost` a subdominio propio: pendiente de ejecución (DNS ya creado 2026-08-31)

Existe una tarea pendiente para migrar `nolost` de su ruta actual (`micasachurch.co/api`, compartiendo dominio con el proyecto de contacto/landing legado) a subdominios propios (`nolost.micasachurch.co` para el frontend, `nolost-api.micasachurch.co` para el backend). El usuario ya creó los registros DNS de los 4 subdominios (`admin`, `api`, `nolost`, `nolost-api`) el 2026-08-31, pero el aprovisionamiento del lado del servidor (nginx/SSL/systemd en `nolost-vps`, y el cambio de dominio raíz de `nolost` a `micasachurch`) **todavía no se ejecutó** — sigue pendiente de una sesión con acceso SSH autorizado al VPS. Ver `docs/PROGRESS.md` para el plan de pasos.

## Bug: faltaba `fileReplacements` de producción en ambos `angular.json` (corregido 2026-08-31)

Ninguno de los dos frontends tenía configurado `fileReplacements` en la configuración `production` de `angular.json`, así que `ng build --configuration production` seguía usando `environment.ts` (apuntando a `http://localhost:8088/api`) en vez de `environment.prod.ts` (`https://api.micasachurch.co/api`). Síntoma: el login del admin fallaba en el navegador con "Usuario o clave inválidos" — un mensaje genérico que el `Login` component muestra para cualquier error HTTP, lo que ocultó la causa real hasta comparar el `apiUrl` embebido en el bundle desplegado. El backend nunca tuvo el problema (confirmado con `curl` directo antes de encontrar el bug). Corregido agregando el `fileReplacements` estándar de Angular CLI a ambos `angular.json`.

## Deploy de `frontend-admin`: subida manual, no automatizada en `deploy.ps1`

Como ya estaba documentado en la decisión de abajo, `infra/deploy.ps1` (`Deploy-Frontend`) solo maneja un `FrontendPath` por proyecto — para el primer deploy real (2026-08-31) se corrió `infra/deploy.ps1 -Projects micasachurch` para backend + `frontend-landing`, y `frontend-admin` se compiló y subió a mano (`ng build` + `scp` directo a `~/apps/micasachurch/frontend-admin`). Automatizar esto en `deploy.ps1` queda fuera de alcance de este MVP (ver `docs/ROADMAP.md`).

## Infra: `deploy.ps1` extendido con dos rutas de frontend

`micasachurch` es el primer proyecto del workspace con dos frontends. El flujo genérico `Deploy-Frontend` de `infra/deploy.ps1` solo maneja un `FrontendPath` por proyecto, así que se dejó `FrontendPath` apuntando a `frontend-landing` (el sitio público, prioridad de despliegue) y se agregaron `LandingFrontendPath`/`AdminFrontendPath` como campos informativos para cuando ese flujo se extienda a manejar ambos frontends. No se modificó la lógica genérica de despliegue de otros proyectos.

## Observabilidad HTTP: filtro de logging fuera de Spring Security (2026-09-05)

Se agrego `RequestLoggingFilter` en `platform/web-common` registrado con `FilterRegistrationBean` en `Ordered.HIGHEST_PRECEDENCE`, por fuera de la cadena de Spring Security, para poder loguear tambien las peticiones rechazadas con 401/403 antes de llegar a un controlador. El `requestId` se genera en el filtro y nunca se acepta de un header del cliente. `platform:security` paso a depender de `platform:web-common` (antes no la declaraba) para poder poner el `userId` en el MDC desde `JwtAuthenticationFilter`.

## Bug: peticiones sin token respondian 403 en vez de 401 (corregido 2026-09-05)

`SecurityConfig` no registraba `.exceptionHandling(...)`, asi que Spring Security usaba su entry point por defecto (`Http403ForbiddenEntryPoint`): una peticion sin token y una de un usuario autenticado sin permiso daban el mismo 403, y sin cuerpo. Se agrego `SecurityErrorResponder` (`AuthenticationEntryPoint` + `AccessDeniedHandler` en una sola clase) en `platform:security`, registrado en el `filterChain`, que responde 401 sin token y 403 sin permiso, ambos con el `ApiResponse` de `platform:web-common`.
