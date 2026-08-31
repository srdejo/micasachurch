-- Placeholder admin credentials: username "admin", password "password".
-- MUST be changed before production — see docs/DEPLOYMENT.md.
INSERT INTO admin_users (id, username, password_hash) VALUES
    (gen_random_uuid(), 'admin', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW');

INSERT INTO service_schedules (id, day, time, note) VALUES
    (gen_random_uuid(), 'Miércoles', '7:00 p.m.', 'Noche de enseñanza'),
    (gen_random_uuid(), 'Sábado', '7:00 p.m.', 'Servicio de jóvenes'),
    (gen_random_uuid(), 'Domingo', '8:30 a.m.', 'Primer servicio'),
    (gen_random_uuid(), 'Domingo', '10:00 a.m.', 'Segundo servicio');

INSERT INTO link_entries (id, key, label, value) VALUES
    (gen_random_uuid(), 'whatsapp', 'WhatsApp', 'https://wa.me/573045332589'),
    (gen_random_uuid(), 'facebook', 'Facebook', 'https://facebook.com/micasachurch'),
    (gen_random_uuid(), 'instagram', 'Instagram', 'https://instagram.com/micasachurch'),
    (gen_random_uuid(), 'youtube', 'YouTube', 'https://youtube.com/playlist?list=UUsH7cdrkVZi7tQNZJhAkB1g'),
    (gen_random_uuid(), 'crediservir', 'Crediservir', 'Cuenta 2090000303 · NIT 901820827-0'),
    (gen_random_uuid(), 'bancolombia', 'Bancolombia', 'Ahorros 31800003953 · Llave Bre-B 0091740804');

INSERT INTO networks (id, key, name, description, lead_contact) VALUES
    (gen_random_uuid(), 'kids', 'Niños', 'Red para los más pequeños de la casa.', NULL),
    (gen_random_uuid(), 'teens', 'Jóvenes', 'Red para adolescentes.', NULL),
    (gen_random_uuid(), 'jovenes', 'Jóvenes Adultos', 'Red para jóvenes adultos.', NULL),
    (gen_random_uuid(), 'parejas', 'Matrimonios', 'Red para parejas y matrimonios.', NULL),
    (gen_random_uuid(), 'hombres', 'Hombres', 'Red de hombres.', NULL),
    (gen_random_uuid(), 'mujeres', 'Mujeres', 'Red de mujeres.', NULL);

INSERT INTO site_settings (id, live_banner_visible) VALUES
    (gen_random_uuid(), TRUE);

INSERT INTO events (id, day, month, title, detail, published, display_order) VALUES
    (gen_random_uuid(), '15', 'Sep', 'Noche de alabanza', 'Una noche especial de adoración para toda la familia.', TRUE, 1),
    (gen_random_uuid(), '28', 'Sep', 'Retiro de jóvenes', 'Un fin de semana para crecer en comunidad.', TRUE, 2);
