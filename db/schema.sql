-- Skywards Layover Companion: database schema (PostgreSQL)
-- All flight times are stored as Dubai local time.

-- Mock Skywards records (seeded). Registration links to one of these.
CREATE TABLE skywards_records (
  skywards_number TEXT PRIMARY KEY,
  tier            TEXT NOT NULL CHECK (tier IN ('Blue','Silver','Gold','Platinum')),
  points_balance  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('passenger','admin')),
  skywards_number TEXT UNIQUE REFERENCES skywards_records(skywards_number),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reset tokens are stored hashed, single-use, 30 min expiry
CREATE TABLE password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP,
  verified_at TIMESTAMP,
  reset_token_hash TEXT,
  attempts   INTEGER NOT NULL DEFAULT 0
);

-- Seeded mock EK flights
CREATE TABLE flights (
  id             SERIAL PRIMARY KEY,
  flight_no      TEXT NOT NULL,
  direction      TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  other_airport  TEXT NOT NULL,          -- origin (inbound) or destination (outbound)
  scheduled_time TIMESTAMP NOT NULL      -- arrival or departure at DXB
);

-- Mock airline bookings. One PNR (booking reference) gives the whole connection,
-- so the passenger types it instead of picking flights and a cabin from lists (FR2.1).
CREATE TABLE pnr_bookings (
  pnr                TEXT PRIMARY KEY CHECK (pnr ~ '^[A-Z0-9]{6}$'),
  inbound_flight_id  INTEGER NOT NULL REFERENCES flights(id),
  outbound_flight_id INTEGER NOT NULL REFERENCES flights(id),
  cabin_class        TEXT NOT NULL CHECK (cabin_class IN ('Economy','Business','First'))
);

-- A passenger's selected connection
CREATE TABLE connections (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inbound_flight_id  INTEGER NOT NULL REFERENCES flights(id),
  outbound_flight_id INTEGER NOT NULL REFERENCES flights(id),
  cabin_class       TEXT NOT NULL CHECK (cabin_class IN ('Economy','Business','First')),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seeded activities (20-24)
CREATE TABLE activities (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL CHECK (category IN ('culture','food','shopping','relaxation')),
  price_aed       INTEGER NOT NULL,
  duration_min    INTEGER NOT NULL,
  travel_min_one_way INTEGER NOT NULL DEFAULT 0,  -- 0 for airside
  zone            TEXT NOT NULL CHECK (zone IN ('airside','landside')),
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE, -- lounge/premium: shown first to Business/First
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6)
);

CREATE TABLE bookings (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id),
  connection_id     INTEGER NOT NULL REFERENCES connections(id),
  activity_id       INTEGER NOT NULL REFERENCES activities(id),
  amount_aed        INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','completed')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_ref TEXT UNIQUE,
  card_last4        CHAR(4),              -- never store full card numbers or CVC
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMP
);

-- One ledger line per booking at most (UNIQUE = points awarded once)
CREATE TABLE points_ledger (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  booking_id    INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
  points        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
