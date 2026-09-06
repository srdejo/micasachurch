-- Los horarios se leian con findAll() sin ORDER BY, asi que el orden lo decidia el orden fisico de
-- las filas y cambiaba cada vez que se editaba uno: el sitio publico mostraba los servicios en
-- distinto orden segun el ultimo guardado. No se puede ordenar por `day`/`time` porque son texto
-- libre ('10:00 a.m.' va antes que '8:30 a.m.' alfabeticamente), asi que se agrega un orden
-- explicito, igual que en ministries y networks.
ALTER TABLE service_schedules ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Orden inicial para los servicios que hay hoy: primero el domingo, luego el resto de la semana.
UPDATE service_schedules SET display_order = CASE
    WHEN day = 'Domingo'  AND time = '8:30 a.m.'  THEN 1
    WHEN day = 'Domingo'  AND time = '10:00 a.m.' THEN 2
    WHEN day = 'Miércoles'                        THEN 3
    WHEN day = 'Sábado'                           THEN 4
    ELSE 99
END;
