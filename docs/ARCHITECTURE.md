# ARCHITECTURE.md

Cómo está construido `micasachurch` hoy.

## Visión general

Tres proyectos independientes en un monorepo:

- `backend/` — API REST en Java + Spring Boot, monolito de un solo módulo de negocio (`church`).
- `frontend-landing/` — sitio público en Angular con SSR.
- `frontend-admin/` — panel administrativo en Angular, SPA sin SSR, protegido con login JWT.

No hay multitenancy: una sola congregación, un solo `AdminUser` sembrado por migración.

## Backend

### Estructura Gradle

```
backend/
├── bootstrap/            único @SpringBootApplication, application.yml, migraciones Flyway
├── platform/
│   ├── security/          JWT (emisión/validación), SecurityConfig, filtro
│   └── web-common/        ApiResponse, GlobalExceptionHandler, MessageResolver, excepciones base
└── modules/
    └── church/             domain + application + infrastructure
```

### Clean Architecture dentro de `modules/church`

- `domain/` — entidades POJO puras (`Event`, `Network`, `PrayerRequest`, `ServiceSchedule`, `LinkEntry`, `SiteSettings`, `AdminUser`) y sus interfaces de repositorio (puertos). Sin anotaciones de framework.
- `application/` — casos de uso (`EventService`, `NetworkService`, `PrayerRequestService`, `ServiceScheduleService`, `LinkEntryService`, `SiteSettingsService`, `LoginUseCase`), orquestan los puertos de `domain`.
- `infrastructure/` — adaptadores JPA (`*JpaEntity` + `*SpringDataRepository` + `*RepositoryAdapter` implementando el puerto de `domain`), controladores REST (`PublicController` para endpoints públicos, `Admin*Controller` para endpoints protegidos), y `ChurchConfig` (wiring de beans de los casos de uso, ya que las clases de `application` son POJOs sin `@Service`).

Regla de dependencia: `infrastructure → application → domain`, nunca al revés.

### Seguridad

JWT stateless. `AdminAuthController` (`POST /api/admin/auth/login`) valida usuario/clave (bcrypt) vía `LoginUseCase` y emite un token con `JwtService` (`platform/security`). `JwtAuthenticationFilter` puebla el `SecurityContext` en cada request con rol `ROLE_ADMIN` si el token es válido. `SecurityConfig` permite público `/api/events`, `/api/services`, `/api/networks`, `/api/links`, `/api/site-settings`, `/api/prayer-requests` (POST) y el login; todo `/api/admin/**` requiere `ROLE_ADMIN`.

### Persistencia

PostgreSQL + Spring Data JPA. Migraciones Flyway en `bootstrap/src/main/resources/db/migration`:
- `V1__church_schema.sql` — esquema de las 7 tablas.
- `V2__church_seed.sql` — datos semilla: el admin único, los 4 horarios de servicio, los 6 enlaces (con los valores reales de cuentas/redes), las 6 redes fijas, `site_settings` (singleton), y 2 eventos de ejemplo.

## El devocional NO se persiste

**Decisión clave**: "Nuestro Pan Diario" (Our Daily Bread) se consulta **directamente desde el navegador del visitante** contra `https://api.experience.odb.org/devotionals/v2`, sin pasar por nuestro backend en ningún punto. Razones:

1. Es contenido de terceros que cambia diariamente y ya tiene su propia API pública gratuita — replicarlo en nuestra base de datos sería sincronización innecesaria para un MVP de una sola congregación.
2. Evita mantener un job/cron de sincronización y una tabla más solo para cachear contenido ajeno.
3. El costo es aceptable: si la API de Our Daily Bread cae, el sitio muestra un estado de error con reintento (ver `frontend-landing/src/app/pages/devocional`), pero el resto del sitio (horarios, eventos, oración, etc.) sigue funcionando porque no depende de esa llamada.

Si en el futuro se necesita, por ejemplo, un archivo histórico propio o traducción editorial, esto se puede revisar — no está descartado para siempre, solo fuera de alcance del MVP actual.

## Frontend — `frontend-landing`

Una sola página larga (`pages/home`) con secciones ancladas (`#inicio`, `#devocional`, `#predicas`, `#eventos`, `#grupos`, `#ministerios`, `#oracion`, `#visitar`), más una ruta separada `/devocional` para navegar el devocional por fecha (query param `?fecha=YYYY-MM-DD`). SSR vía `@angular/ssr`; la ruta `/devocional` se sirve en modo cliente (`RenderMode.Client`) porque su contenido depende de la fecha y de una API externa — el resto se prerenderiza.

## Frontend — `frontend-admin`

SPA pura (sin SSR) protegida por `authGuard` + interceptor que agrega el JWT a las llamadas `/api/admin/**`. Sidebar de 268px + 6 vistas (Panel, Eventos, Peticiones de oración, Redes, Horarios y en vivo, Enlaces). Cada edición persiste al vuelo con su propio PUT/PATCH — no existe un flujo de "guardar todo" ni de borrador/publicado.

## Imágenes

No hay fotos reales de la congregación o pastores disponibles en este momento (ver `docs/PROGRESS.md`, bloqueos). Todas las imágenes del sitio son placeholders de color/gradiente construidos con la paleta de marca, hasta que el cliente provea fotos reales.
