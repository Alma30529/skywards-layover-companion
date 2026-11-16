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

-- Mock EK flights (Dubai local time, all on 2026-12-01)
INSERT INTO flights (flight_no, direction, other_airport, scheduled_time) VALUES
  ('EK203', 'inbound',  'London Heathrow (LHR)',  '2026-12-01 06:10'),
  ('EK607', 'inbound',  'Karachi (KHI)',          '2026-12-01 07:30'),
  ('EK311', 'inbound',  'Manchester (MAN)',       '2026-12-01 09:00'),
  ('EK150', 'outbound', 'Colombo (CMB)',          '2026-12-01 11:30'),
  ('EK088', 'outbound', 'Sydney (SYD)',           '2026-12-01 12:35'),
  ('EK412', 'outbound', 'Singapore (SIN)',        '2026-12-01 13:45'),
  ('EK354', 'outbound', 'Bangkok (BKK)',          '2026-12-01 18:40'),
  ('EK570', 'outbound', 'Manila (MNL)',           '2026-12-01 22:15');

-- Activities part 1: culture and food
INSERT INTO activities (name, description, category, price_aed, duration_min, travel_min_one_way, zone, is_premium, latitude, longitude) VALUES
  ('Old Dubai Souks Walk', 'Guided walk through the spice and gold souks, with a creek crossing by abra.', 'culture', 120, 150, 40, 'landside', FALSE, 25.2697, 55.2972),
  ('Dubai Museum at Al Fahidi Fort', 'Self-guided visit to the city''s oldest standing building.', 'culture', 25, 90, 35, 'landside', FALSE, 25.2635, 55.2972),
  ('Al Fahidi Historical District Tour', 'Guided stroll through wind-tower houses and art galleries.', 'culture', 80, 120, 35, 'landside', FALSE, 25.2637, 55.2989),
  ('Jumeirah Mosque Guided Visit', 'Guided tour with an introduction to local culture and customs.', 'culture', 30, 75, 25, 'landside', FALSE, 25.2337, 55.2653),
  ('Private Burj Khalifa Sky Experience', 'Premium observation deck visit with lounge access and a private host.', 'culture', 450, 120, 30, 'landside', TRUE, 25.1972, 55.2744),
  ('Airport Art and Heritage Walk', 'Short guided walk past the art installations in the terminal.', 'culture', 20, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Karama Street Food Crawl', 'Tasting stops at local eateries in Karama.', 'food', 90, 120, 25, 'landside', FALSE, 25.2411, 55.3040),
  ('Creek Dhow Dinner Cruise', 'Dinner on a traditional dhow along Dubai Creek.', 'food', 200, 210, 30, 'landside', FALSE, 25.2650, 55.3010),
  ('Emirati Breakfast at Al Fahidi', 'Traditional breakfast in a heritage cafe.', 'food', 70, 75, 35, 'landside', FALSE, 25.2640, 55.2985),
  ('Deira Shawarma and Karak Walk', 'Quick street-food walk ending with karak tea.', 'food', 45, 60, 30, 'landside', FALSE, 25.2711, 55.3081),
  ('Airside Arabic Mezze Tasting', 'Mezze platter tasting at a terminal restaurant.', 'food', 60, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Lounge Gourmet Brunch', 'Premium lounge brunch with chef stations.', 'food', 250, 90, 0, 'airside', TRUE, 25.2532, 55.3657);
