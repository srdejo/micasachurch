# DEPLOYMENT.md

**Estado: desplegado en producción y verificado (2026-08-31).** Fases A, B y C (abajo) ejecutadas — `micasachurch.co`/`api.micasachurch.co`/`admin.micasachurch.co` sirven el proyecto nuevo, `nolost.micasachurch.co`/`nolost-api.micasachurch.co` sirven `nolost` sin cambios. Este documento queda como referencia del runbook usado y para el próximo deploy (`infra/deploy.ps1 -Projects micasachurch`, que ya funciona para backend + `frontend-landing`; `frontend-admin` sigue siendo subida manual, ver `docs/DECISIONS.md`).

**Orden que se siguió** (no cambiarlo si se repite en otro entorno): primero migrar `nolost` a sus subdominios propios (Fase A), después liberar `micasachurch.co` (Fase B), recién ahí aprovisionar `micasachurch` (Fase C — en la práctica, Fase C se hizo antes que A/B porque no dependía de ellas, solo el corte del dominio raíz sí respetó el orden A→B).

## Subdominios previstos

- `micasachurch.co` → `frontend-landing` (sitio público).
- `api.micasachurch.co` → `backend`.
- `admin.micasachurch.co` → `frontend-admin` (panel administrativo). Confirmado por el usuario el 2026-08-31 (creó el DNS) — ver `docs/DECISIONS.md`.
- `nolost.micasachurch.co` / `nolost-api.micasachurch.co` → migración de `nolost` fuera de `micasachurch.co` (proyecto ajeno a este repo, ver Fase A).

## Fase A — Migrar `nolost` a sus subdominios propios (previo, no toca `micasachurch`)

Verificado (solo lectura, esta sesión): el frontend de `nolost` llama a la API con **rutas relativas** (`/api/v1/...`, sin dominio hardcodeado — revisado en `nolost/frontend/libs/api/src/lib/*.service.ts`). Esto significa que **no hace falta rebuild ni redeploy del frontend de `nolost`** — el mismo `dist` ya publicado en `/home/srdejo/apps/nolost/frontend` funciona en cualquier dominio, siempre que nginx sirva ese mismo `root` y proxee `/api` al backend (puerto 8080, sin cambios).

1. Subir los dos vhosts nuevos (HTTP primero, Certbot agrega el bloque 443 solo):

   `/etc/nginx/sites-available/nolost.micasachurch.co`:
   ```nginx
   server {
       listen 80;
       server_name nolost.micasachurch.co;

       root /home/srdejo/apps/nolost/frontend;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       location = /contact/api/send {
           return 404;
       }

       location /contact/ {
           proxy_pass http://127.0.0.1:3000/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   `/etc/nginx/sites-available/nolost-api.micasachurch.co`:
   ```nginx
   server {
       listen 80;
       server_name nolost-api.micasachurch.co;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   Comandos (usan los `NOPASSWD` ya existentes en el `sudoers` de `srdejo`, confirmados en esta sesión: `tee /etc/nginx/sites-available/*`, `ln -sf .../sites-enabled/*`, `nginx -t`, `certbot *`, `systemctl reload nginx`):
   ```bash
   cat nolost.micasachurch.co | ssh srdejo@nolost-vps "sudo tee /etc/nginx/sites-available/nolost.micasachurch.co > /dev/null"
   cat nolost-api.micasachurch.co | ssh srdejo@nolost-vps "sudo tee /etc/nginx/sites-available/nolost-api.micasachurch.co > /dev/null"
   ssh srdejo@nolost-vps "sudo ln -sf /etc/nginx/sites-available/nolost.micasachurch.co /etc/nginx/sites-enabled/nolost.micasachurch.co"
   ssh srdejo@nolost-vps "sudo ln -sf /etc/nginx/sites-available/nolost-api.micasachurch.co /etc/nginx/sites-enabled/nolost-api.micasachurch.co"
   ssh srdejo@nolost-vps "sudo nginx -t && sudo systemctl reload nginx"
   ```

2. Certificados SSL (Certbot reescribe estos dos archivos agregando el bloque `443 ssl` — mismo patrón que `hotel`/`api-hotel`):
   ```bash
   ssh srdejo@nolost-vps "sudo certbot --nginx -d nolost.micasachurch.co -d nolost-api.micasachurch.co --non-interactive --agree-tos -m <email real>"
   ```

3. Verificar antes de seguir:
   ```bash
   curl -I https://nolost.micasachurch.co
   curl -I https://nolost-api.micasachurch.co/api/health   # o el endpoint de salud real de nolost
   ```
   Confirmar login y una acción real desde `https://nolost.micasachurch.co` (no solo que cargue el HTML) antes de pasar a la Fase B.

## Fase B — Liberar `micasachurch.co`

Solo después de confirmar que `nolost` funciona en sus subdominios nuevos. Hoy `micasachurch.co` lo sirven **dos** archivos de vhost a la vez (`/etc/nginx/sites-available/nolost` con el bloque `443 ssl` real, y `/etc/nginx/sites-available/micasachurch.co` con solo el redirect 80→443) — revisar ambos antes de tocar nada:
```bash
ssh srdejo@nolost-vps "cat /etc/nginx/sites-available/nolost /etc/nginx/sites-available/micasachurch.co"
```
Quitar `micasachurch.co`/`www.micasachurch.co` de `server_name` en el archivo `nolost` (dejando solo `usvds7000x33.startdedicated.com`), y reemplazar el contenido de `micasachurch.co` por el vhost nuevo de la Fase C (frontend-landing). No enlazar/recargar hasta tener listo el contenido de la Fase C, para no dejar el dominio sin servir en el medio.

## Fase C — Aprovisionar `micasachurch`

Mismo patrón de subdominios separados que `hotel`/`consulting` (no un solo dominio con `/api/` como `nolost`/`agent-project`) — por eso el backend necesita CORS habilitado para los orígenes de ambos frontends (`platform/security/SecurityConfig.java`, property `cors.allowed-origin` ← env var `CORS_ALLOWED_ORIGIN`, admite una lista separada por comas).

## Puerto

Backend reservado en `127.0.0.1:8088` (loopback, nginx haría proxy). Ver `PORTS.md` raíz del workspace.

DNS ya resuelto (ver arriba). Pendiente todo lo del servidor:

1. PostgreSQL: crear base y rol. `psql`/`sudo -u postgres psql` piden contraseña de `sudo` que esta sesión no tiene — ejecutar manualmente:
   ```sql
   CREATE DATABASE micasachurch;
   CREATE USER micasachurch WITH PASSWORD '<password real>';
   GRANT ALL PRIVILEGES ON DATABASE micasachurch TO micasachurch;
   ALTER DATABASE micasachurch OWNER TO micasachurch;
   ```
   (Agregar también a `infra/postgres/init-databases.ps1` del workspace para que quede documentado junto a `hotel`/`distriapp`/etc.)

2. nginx: vhosts + certificados SSL (Certbot) para `micasachurch.co`, `api.micasachurch.co` y `admin.micasachurch.co`. Mismo patrón que `hotel`/`api-hotel` (`/etc/nginx/sites-available/hotel.srdejo.com.co` y `api-hotel.srdejo.com.co`, revisados en esta sesión):

   `/etc/nginx/sites-available/micasachurch.co` (reemplaza el contenido actual, que hoy apunta a `nolost` — solo tocar después de la Fase B):
   ```nginx
   server {
       listen 80;
       server_name micasachurch.co www.micasachurch.co;
       root /home/srdejo/apps/micasachurch/frontend;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   `/etc/nginx/sites-available/api.micasachurch.co`:
   ```nginx
   server {
       listen 80;
       server_name api.micasachurch.co;

       location / {
           proxy_pass http://127.0.0.1:8088;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   `/etc/nginx/sites-available/admin.micasachurch.co`:
   ```nginx
   server {
       listen 80;
       server_name admin.micasachurch.co;
       root /home/srdejo/apps/micasachurch/frontend-admin;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   ```bash
   ssh srdejo@nolost-vps "sudo ln -sf /etc/nginx/sites-available/api.micasachurch.co /etc/nginx/sites-enabled/api.micasachurch.co"
   ssh srdejo@nolost-vps "sudo ln -sf /etc/nginx/sites-available/admin.micasachurch.co /etc/nginx/sites-enabled/admin.micasachurch.co"
   ssh srdejo@nolost-vps "sudo nginx -t && sudo systemctl reload nginx"
   ssh srdejo@nolost-vps "sudo certbot --nginx -d micasachurch.co -d www.micasachurch.co -d api.micasachurch.co -d admin.micasachurch.co --non-interactive --agree-tos -m <email real>"
   ```

3. DNS: ya creado por el usuario (2026-08-31), los tres subdominios (+ apex) apuntan a la IP del VPS — confirmado por resolución en esta sesión.

4. Unit systemd `micasachurch.service` — **requiere contraseña de `sudo`** (el `NOPASSWD` actual solo cubre `restart nolost`/`restart hotel`/`restart nginx`, no un servicio nuevo), ejecutar manualmente en una sesión con esa contraseña:
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
   Después de crearlo (como root o con `sudo`):
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable micasachurch
   sudo systemctl start micasachurch
   ```
   Y agregar el NOPASSWD equivalente al de `nolost`/`hotel` si se quiere que `infra/deploy.ps1` pueda reiniciarlo solo (editar `/etc/sudoers.d/` con `visudo`, agregar `systemctl restart micasachurch` a la línea `(ALL) NOPASSWD: ...` existente) — también requiere contraseña la primera vez.

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
5. Estructura de directorios esperada (convención `apps/<proyecto>/` del workspace, crear con el usuario `srdejo` sin sudo):
   ```
   /home/srdejo/apps/micasachurch/
   ├── app.jar              -> symlink a releases/bootstrap-0.0.1-SNAPSHOT.jar
   ├── releases/
   ├── .env
   ├── frontend/              build de frontend-landing (dist/frontend-landing/browser)
   └── frontend-admin/        build de frontend-admin (dist/frontend-admin/browser)
   ```
6. Primer deploy: `infra/deploy.ps1 -Projects micasachurch` (ver `docs/DECISIONS.md` sobre el manejo de los dos frontends en ese script) — copia los builds, pero el `.jar`/`.env`/unit systemd/DB de los pasos 1 y 4 deben existir antes del primer `restart`.

## Antes de ir a producción — checklist obligatorio

- [ ] Fase A: `nolost` funcionando y verificado en `nolost.micasachurch.co` / `nolost-api.micasachurch.co`.
- [ ] Fase B: `micasachurch.co` liberado del vhost de `nolost`.
- [ ] **Cambiar la contraseña del `AdminUser` sembrado.** La migración `V2__church_seed.sql` siembra usuario `admin` / clave `password` (hash bcrypt) — es un placeholder de desarrollo, no debe usarse en producción. Cambiarla directamente en la base de datos (o agregar una migración nueva) antes del primer deploy real.
- [x] Confirmar el subdominio `admin.micasachurch.co` con el usuario — confirmado 2026-08-31 (DNS creado).
- [ ] Generar `JWT_SECRET` real y `.env` en el servidor.
- [ ] Verificar que las migraciones Flyway corran limpio contra la base real (no se probó en esta sesión — ver `docs/PROGRESS.md`).
- [ ] Agregar NOPASSWD de `systemctl restart micasachurch` al sudoers de `srdejo` si se quiere que `infra/deploy.ps1` reinicie el backend sin intervención manual (mismo patrón que `nolost`/`hotel`).
