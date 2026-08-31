# CLAUDE.md

Instrucciones de trabajo para Claude Code en este repositorio. Léelo antes de tocar cualquier archivo.

## Qué es este proyecto

Sitio web de una iglesia (Mi Casa Church, Ocaña, Colombia). Proyecto **deliberadamente sencillo**: un solo tenant, un solo administrador. Monorepo con tres proyectos independientes:

- `backend/` — API en Java + Spring Boot.
- `frontend-landing/` — sitio público en Angular (SSR).
- `frontend-admin/` — panel administrativo en Angular (SPA, sin SSR).

## Cómo continuar trabajo entre sesiones

1. Lee este archivo completo.
2. Lee `docs/ROADMAP.md` para entender las etapas y sus criterios de cierre.
3. Lee `docs/PROGRESS.md` para saber el estado actual y los bloqueos conocidos.
4. Si hay dudas sobre una decisión técnica ya tomada, revisa `docs/DECISIONS.md` antes de proponer una alternativa.
5. Verifica el estado real del código (no confíes solo en la documentación). Si encuentras una discrepancia, corrige la documentación — no asumas cuál versión es la correcta sin mirar el código.
6. Actualiza `docs/PROGRESS.md` a medida que completas tareas.

## Stack tecnológico

**Backend**
- Java 21 (toolchain), Spring Boot 3.4.x, Gradle multi-módulo con Groovy DSL.
- PostgreSQL + Spring Data JPA/Hibernate + Flyway.
- Seguridad: JWT (jjwt), login único de administrador (usuario + clave).

**Frontend**
- Angular 22 (standalone components, sin NgModules).
- `frontend-landing` con SSR (`@angular/ssr`), `frontend-admin` sin SSR (SPA pura, requiere login).
- Tailwind CSS v4 (plugin PostCSS `@tailwindcss/postcss`).

**Infraestructura**
- Sin Docker. Postgres nativo compartido (proyecto `infra/` del workspace), despliegue con systemd + nginx, mismo patrón que `hotel`/`distriapp`. Aún no desplegado en producción — ver `docs/DEPLOYMENT.md`.

## Principios de arquitectura

### Backend: Clean Architecture, monolito simple (sin multitenancy)

- El módulo de negocio `modules/church` es un subproyecto Gradle con 3 paquetes internos: `domain`, `application`, `infrastructure`.
- Regla de dependencia estricta: `infrastructure → application → domain`. `domain` no importa Spring/JPA. `application` orquesta casos de uso contra puertos (interfaces en `domain`), implementados por adaptadores en `infrastructure`.
- `bootstrap` es el único módulo con `@SpringBootApplication`.
- `platform/*` (`security`, `web-common`) son transversales, sin lógica de negocio.
- **No hay multitenancy.** Un solo `AdminUser`, sin `tenant_id`/`hotel_id` en ninguna tabla. No agregues ese concepto — está fuera de alcance a propósito.

### Devocional: sin persistencia

"Nuestro Pan Diario" se consulta en vivo desde el cliente Angular (`frontend-landing`) directamente contra la API pública de Our Daily Bread — **el backend nunca lo toca**. Ver `docs/ARCHITECTURE.md` para el razonamiento.

### Frontend

- `frontend-landing`: una sola página larga con anchors (`#inicio`, `#devocional`, etc.) más una ruta `/devocional` para navegar por fecha. Debe poder prerenderizarse.
- `frontend-admin`: login previo obligatorio (JWT), luego sidebar + 6 vistas. Los cambios se guardan al vuelo (PUT/PATCH por campo/recurso) — no hay concepto de "borrador vs. publicado".
- Tokens de diseño (colores, tipografías) centralizados en `tailwind.config.js` de cada frontend — no hardcodear hex nuevos en componentes.

## Convenciones de código

- **Todo el código en inglés.** Clases, campos, tablas/columnas Flyway — sin excepción.
- **Mensajes en español (los que ve el usuario) van por i18n, nunca hardcodeados.** El código lanza una clave en inglés (ej. `"event.not_found"`); `platform/web-common/GlobalExceptionHandler` la resuelve vía `MessageSource` (`bootstrap/src/main/resources/messages.properties`, `Locale.forLanguageTag("es")`).
- **Sin comentarios explicando QUÉ hace el código.** Comentarios solo para un PORQUÉ no obvio.
- No añadir abstracciones, roles, feature flags ni mecanismos de multi-tenant "por si acaso" — este proyecto es intencionalmente pequeño.
- Paquetes backend: `co.com.srdejo.micasachurch.<modulo>.domain/application/infrastructure`.

## Reglas que debes respetar

1. **No inventes funcionalidad ni endpoints** que no estén en el roadmap o pedidos explícitamente.
2. **No marques una tarea como completada en `docs/PROGRESS.md` sin verificarla ejecutando el comando correspondiente** (build, test).
3. **No dupliques documentación** — referencia el archivo existente en vez de repetir contenido.
4. **Antes de tocar un módulo, revisa si ya tiene código** de una sesión anterior.
5. **No hagas cambios fuera del alcance pedido.**
6. **Cambios de alto impacto** (versión de framework, `git push`, DNS/nginx de producción) — confírmalos con el usuario antes.
7. **Nada se marca "listo para producción" sin que el usuario lo confirme.**
8. **No toques nada de `nolost`** (otro proyecto del mismo workspace, dominio de producción real) salvo que se pida explícitamente.
