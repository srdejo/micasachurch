ALTER TABLE events
    ADD COLUMN draft_day VARCHAR(32),
    ADD COLUMN draft_month VARCHAR(32),
    ADD COLUMN draft_title VARCHAR(255),
    ADD COLUMN draft_detail TEXT,
    ADD COLUMN draft_published BOOLEAN,
    ADD COLUMN has_draft BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE site_contents
    ADD COLUMN draft_value TEXT,
    ADD COLUMN has_draft BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ministries
    ADD COLUMN published BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN draft_name VARCHAR(255),
    ADD COLUMN draft_description TEXT,
    ADD COLUMN draft_published BOOLEAN,
    ADD COLUMN has_draft BOOLEAN NOT NULL DEFAULT FALSE;
