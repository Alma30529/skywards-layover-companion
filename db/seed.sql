-- Seed data (mock only). Run after schema.sql.

-- Mock Skywards records (balance is the starting points)
INSERT INTO skywards_records (skywards_number, tier, points_balance) VALUES
  ('EK 0000 0001', 'Silver',   1200),
  ('EK 0000 0002', 'Gold',     3400),
  ('EK 0000 0003', 'Platinum', 8000),
  ('EK 0000 0004', 'Blue',        0),
  ('EK 0000 0005', 'Blue',      300),
  ('EK 0000 0006', 'Silver',    650),
  ('EK 0000 0007', 'Gold',     2100),
  ('EK 0000 0008', 'Platinum', 5600),
  ('EK 0000 0009', 'Blue',      150),
  ('EK 0000 0010', 'Silver',    900);

-- Admin account (demo only)
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@skywards.test', '$2b$10$F13jzaoJdgDFLmidLZpoSe5BXMW1O.sY3MZxvMnRzkaoezjgdLM7K', 'admin');
