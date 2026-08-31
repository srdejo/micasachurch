ALTER TABLE service_schedules ADD COLUMN streamed BOOLEAN NOT NULL DEFAULT false;

UPDATE service_schedules SET streamed = true WHERE day = 'Domingo' AND time = '10:00 a.m.';
