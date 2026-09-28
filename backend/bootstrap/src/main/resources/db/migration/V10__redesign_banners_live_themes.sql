-- Temas de color (acento/profundo/suave). Los neutros del sitio son fijos, así que los tres colores
-- de V9 dejan de existir; en producción seguían con sus valores por defecto.
CREATE TABLE theme_palettes (
    name VARCHAR(32) PRIMARY KEY,
    accent_color VARCHAR(7) NOT NULL,
    deep_color VARCHAR(7) NOT NULL,
    soft_color VARCHAR(7) NOT NULL,
    display_order INTEGER NOT NULL
);

INSERT INTO theme_palettes (name, accent_color, deep_color, soft_color, display_order) VALUES
    ('Naranja', '#fba504', '#9a5b00', '#fff1d2', 1),
    ('Coral', '#ff6b35', '#b23a0f', '#ffe6da', 2),
    ('Celeste', '#3fc1e8', '#0a6b8c', '#ddf4fb', 3);

ALTER TABLE site_settings
    ADD COLUMN active_theme VARCHAR(32) NOT NULL DEFAULT 'Naranja' REFERENCES theme_palettes (name),
    DROP COLUMN primary_color,
    DROP COLUMN secondary_color,
    DROP COLUMN tertiary_color;

-- Duración de cada horario: el landing marca "En vivo" desde la hora de inicio hasta inicio + duración.
ALTER TABLE service_schedules ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 120;

UPDATE service_schedules SET duration_minutes = 90 WHERE day = 'Domingo' AND time = '8:30 a.m.';

INSERT INTO service_schedules (id, day, time, note, streamed, display_order, duration_minutes) VALUES
    (gen_random_uuid(), 'Todos los días', '7:00 a.m.', 'Devocional diario en vivo', TRUE, 0, 45);

-- image_key apunta a una clave de site_images; los dos primeros banners reutilizan las fotos que ya
-- estaban subidas para el hero y Quiénes somos.
CREATE TABLE hero_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kicker VARCHAR(120),
    title VARCHAR(160) NOT NULL,
    text TEXT,
    cta_label VARCHAR(80),
    cta_href VARCHAR(500),
    image_key VARCHAR(64),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO hero_banners (kicker, title, text, cta_label, cta_href, image_key, active, display_order) VALUES
    ('Ocaña, Norte de Santander', 'Mi casa es tu casa',
     'Un lugar donde solo pasan cosas buenas. Queremos conocerte: ven y visítanos, tal como estás.',
     'Ver horarios', '#horarios', 'hero', TRUE, 1),
    ('Devocional diario · 7:00 a.m.', 'Empieza el día con la Palabra',
     'Cada mañana transmitimos en vivo por Facebook y publicamos la lectura de Nuestro Pan Diario.',
     'Leer el devocional de hoy', '/devocional', 'quienes_somos', TRUE, 2),
    ('Redes', '¿Ya estás en una red?',
     'Las redes son los grupos donde la iglesia se vive entre semana. Cada persona tiene una red según su etapa.',
     'Quiero entrar a una red', '#redes', NULL, TRUE, 3);

CREATE TABLE live_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(160) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15),
    url VARCHAR(500) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
