ALTER TABLE site_settings
    ADD COLUMN primary_color VARCHAR(7) NOT NULL DEFAULT '#f89e1b',
    ADD COLUMN secondary_color VARCHAR(7) NOT NULL DEFAULT '#000000',
    ADD COLUMN tertiary_color VARCHAR(7) NOT NULL DEFAULT '#ffffff';

ALTER TABLE site_contents
    ADD COLUMN section VARCHAR(32) NOT NULL DEFAULT 'inicio',
    ADD COLUMN display_order INT NOT NULL DEFAULT 0;

UPDATE site_contents SET section = 'inicio', display_order = 1, label = 'Subtítulo' WHERE key = 'hero_subtitle';
UPDATE site_contents SET section = 'quienes_somos', display_order = 2, label = 'Párrafo 1' WHERE key = 'quienes_somos_paragraph_1';
UPDATE site_contents SET section = 'quienes_somos', display_order = 3, label = 'Párrafo 2' WHERE key = 'quienes_somos_paragraph_2';
UPDATE site_contents SET section = 'ofrendas', display_order = 1, label = 'Texto' WHERE key = 'ofrendas_copy';

INSERT INTO site_contents (key, label, value, section, display_order) VALUES
    ('predicas_title', 'Título de la tarjeta', 'Las últimas prédicas, siempre al día', 'predicas', 1),
    ('predicas_copy', 'Texto de la tarjeta', 'El reproductor toma automáticamente los videos más recientes del canal. Usa la lista dentro del reproductor para saltar entre prédicas.', 'predicas', 2),
    ('quienes_somos_title', 'Título', 'Una familia antes que un edificio', 'quienes_somos', 1);

-- Solo si nadie lo cambió desde el admin: el valor sembrado en V2 no era la página real de la iglesia.
UPDATE link_entries SET value = 'https://www.facebook.com/micasachurchocana'
WHERE key = 'facebook' AND value = 'https://facebook.com/micasachurch';
