CREATE TABLE site_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    value TEXT NOT NULL
);

CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL
);

CREATE TABLE site_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) NOT NULL UNIQUE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO site_contents (key, label, value) VALUES
    ('hero_subtitle', 'Hero — subtítulo', 'Queremos conocerte. Ven y visítanos: aquí hay un lugar para ti, tal como estás.'),
    ('quienes_somos_paragraph_1', 'Quiénes somos — párrafo 1', 'En Mi Casa Church creemos que la iglesia es, ante todo, una familia. Un lugar donde cada persona es recibida con calidez, sin importar de dónde venga o qué esté viviendo.'),
    ('quienes_somos_paragraph_2', 'Quiénes somos — párrafo 2', 'Somos una comunidad en Ocaña que busca vivir el evangelio de manera cercana, sencilla y real, acompañándonos unos a otros en cada etapa de la vida.'),
    ('ofrendas_copy', 'Ofrendas — copy', 'Tu ofrenda sostiene el trabajo de la iglesia en Ocaña. Gracias por sembrar con generosidad.');

INSERT INTO ministries (name, description, display_order) VALUES
    ('Niños', 'Un espacio seguro y divertido para que los más pequeños conozcan a Jesús.', 1),
    ('Jóvenes', 'Comunidad, propósito y fe para la nueva generación.', 2),
    ('Matrimonios', 'Acompañamiento para fortalecer el hogar y la pareja.', 3),
    ('Alabanza', 'Un equipo dedicado a guiar la adoración cada semana.', 4);
