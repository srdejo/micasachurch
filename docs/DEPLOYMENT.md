# DEPLOYMENT.md

Estado de despliegue de `micasachurch`: **config preparada, VPS aún no provisionado.** Nada de lo descrito abajo se ejecutó todavía — es la referencia para cuando el usuario autorice el primer deploy real.

## Subdominios previstos

- `micasachurch.co` → `frontend-landing` (sitio público).
- `api.micasachurch.co` → `backend`.
- `admin.micasachurch.co` → `frontend-admin` (panel administrativo). **Inferido, no confirmado por el usuario** — ver `docs/DECISIONS.md`.

Mismo patrón de subdominios separados que `hotel`/`consulting` (no un solo dominio con `/api/` como `nolost`/`agent-project`) — por eso el backend necesita CORS habilitado para los orígenes de ambos frontends (`platform/security/SecurityConfig.java`, property `cors.allowed-origin` ← env var `CORS_ALLOWED_ORIGIN`, admite una lista separada por comas).

## Puerto

Backend reservado en `127.0.0.1:8088` (loopback, nginx haría proxy). Ver `PORTS.md` raíz del workspace.

## Pendiente por hacer en el VPS (no ejecutado)

1. PostgreSQL: crear base y rol.
   ```sql
   CREATE DATABASE micasachurch;
   CREATE USER micasachurch WITH PASSWORD '<password real>';
   GRANT ALL PRIVILEGES ON DATABASE micasachurch TO micasachurch;
   ALTER DATABASE micasachurch OWNER TO micasachurch;
   ```
2. nginx: vhosts + certificados SSL (Certbot) para `micasachurch.co`, `api.micasachurch.co` y `admin.micasachurch.co`.
3. DNS: los tres subdominios apuntando a la IP del VPS.
4. Unit systemd `micasachurch.service`:
   ```ini
   [Unit]
   Description=Micasachurch Backend
   After=network.target postgresql.service

   [Service]
   User=srdejo
   WorkingDirectory=/home/srdejo/apps/micasachurch
   EnvironmentFile=/home/srdejo/apps/micasachurch/.env
   ExecStart=/usr/bin/java -jar /home/srdejo/apps/micasachurch/app.jar --spring.profiles.active=prod --server.port=8088
   SuccessExitStatus=143
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
   `.env` (chmod 600, no versionado):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=micasachurch
   DB_USER=micasachurch
   DB_PASSWORD=<password real>
   JWT_SECRET=<secreto real, ≥256 bits, generado con openssl rand — distinto del de los demás proyectos>
   JWT_TTL_MINUTES=720
   CORS_ALLOWED_ORIGIN=https://micasachurch.co,https://admin.micasachurch.co
   ```
5. Estructura de directorios esperada (convención `apps/<proyecto>/` del workspace):
   ```
   /home/srdejo/apps/micasachurch/
   ├── app.jar              -> symlink a releases/bootstrap-0.0.1-SNAPSHOT.jar
   ├── releases/
   ├── .env
   ├── frontend/              build de frontend-landing (dist/frontend-landing/browser)
   └── frontend-admin/        build de frontend-admin (dist/frontend-admin/browser)
   ```
6. Primer deploy: `infra/deploy.ps1 -Projects micasachurch` (ver `docs/DECISIONS.md` sobre el manejo de los dos frontends en ese script).

## Antes de ir a producción — checklist obligatorio

- [ ] **Cambiar la contraseña del `AdminUser` sembrado.** La migración `V2__church_seed.sql` siembra usuario `admin` / clave `password` (hash bcrypt) — es un placeholder de desarrollo, no debe usarse en producción. Cambiarla directamente en la base de datos (o agregar una migración nueva) antes del primer deploy real.
- [ ] Confirmar el subdominio `admin.micasachurch.co` con el usuario (o ajustar si prefiere otro).
- [ ] Generar `JWT_SECRET` real y `.env` en el servidor.
- [ ] Verificar que las migraciones Flyway corran limpio contra la base real (no se probó en esta sesión — ver `docs/PROGRESS.md`).

## Fuera de alcance de este documento

La migración de `nolost` a subdominio propio (`nolost.micasachurch.co`, `nolost-api.micasachurch.co`) es una tarea pendiente separada, no ejecutada, que requiere aprobación explícita del usuario — no se toca desde este proyecto ni desde este documento.
