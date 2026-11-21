-- Adds PNR lookup to an EXISTING database without wiping anything.
-- Run once on Railway (and on any local DB created before this change). Safe to re-run.
-- Fresh databases get the same table and rows from schema.sql and seed.sql instead.
CREATE TABLE IF NOT EXISTS pnr_bookings (
  pnr                TEXT PRIMARY KEY CHECK (pnr ~ '^[A-Z0-9]{6}$'),
  inbound_flight_id  INTEGER NOT NULL REFERENCES flights(id),
  outbound_flight_id INTEGER NOT NULL REFERENCES flights(id),
  cabin_class        TEXT NOT NULL CHECK (cabin_class IN ('Economy','Business','First'))
);

INSERT INTO pnr_bookings (pnr, inbound_flight_id, outbound_flight_id, cabin_class) VALUES
  ('K7P2QX', (SELECT id FROM flights WHERE flight_no = 'EK203'), (SELECT id FROM flights WHERE flight_no = 'EK150'), 'Economy'),  -- 5h 20m layover: full access
  ('M3R8TW', (SELECT id FROM flights WHERE flight_no = 'EK607'), (SELECT id FROM flights WHERE flight_no = 'EK412'), 'Business'), -- 6h 15m: full access, premium first
  ('B9D4LN', (SELECT id FROM flights WHERE flight_no = 'EK311'), (SELECT id FROM flights WHERE flight_no = 'EK570'), 'First'),    -- 13h 15m: long layover
  ('Z5H6JC', (SELECT id FROM flights WHERE flight_no = 'EK501'), (SELECT id FROM flights WHERE flight_no = 'EK232'), 'Economy'),  -- 4h 15m: exactly 120 usable min (boundary)
  ('H2N7VD', (SELECT id FROM flights WHERE flight_no = 'EK311'), (SELECT id FROM flights WHERE flight_no = 'EK088'), 'Economy'),  -- 3h 35m: airport-only state
  ('T4C9WA', (SELECT id FROM flights WHERE flight_no = 'EK607'), (SELECT id FROM flights WHERE flight_no = 'EK070'), 'Economy')   -- 2h 45m: caution, stay near gate
ON CONFLICT (pnr) DO NOTHING;
