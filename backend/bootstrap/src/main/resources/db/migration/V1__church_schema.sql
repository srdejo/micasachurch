CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day VARCHAR(16) NOT NULL,
    month VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    detail TEXT,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_contact VARCHAR(255)
);

CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    phone VARCHAR(64),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE service_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day VARCHAR(32) NOT NULL,
    time VARCHAR(32) NOT NULL,
    note VARCHAR(255)
);

CREATE TABLE link_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(32) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    value TEXT
);

CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_banner_visible BOOLEAN NOT NULL DEFAULT TRUE
);
