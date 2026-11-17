-- Seed data (mock only). Run after schema.sql.

-- Makes this file safe to re-run: wipes all tables first (demo/dev only)
TRUNCATE points_ledger, bookings, connections, password_reset_tokens, users, flights, activities, skywards_records RESTART IDENTITY CASCADE;

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
  ('Al Fahidi Heritage Tour', 'Guided stroll through wind-tower houses and art galleries.', 'culture', 80, 120, 35, 'landside', FALSE, 25.2637, 55.2989),
  ('Jumeirah Mosque Guided Visit', 'Guided tour with an introduction to local culture and customs.', 'culture', 30, 75, 25, 'landside', FALSE, 25.2337, 55.2653),
  ('Private Burj Khalifa Sky Experience', 'Premium observation deck visit with lounge access and a private host.', 'culture', 450, 120, 30, 'landside', TRUE, 25.1972, 55.2744),
  ('Airport Art and Heritage Walk', 'Short guided walk past the art installations in the terminal.', 'culture', 20, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Karama Street Food Crawl', 'Tasting stops at local eateries in Karama.', 'food', 90, 120, 25, 'landside', FALSE, 25.2411, 55.3040),
  ('Creek Dhow Dinner Cruise', 'Dinner on a traditional dhow along Dubai Creek.', 'food', 200, 210, 30, 'landside', FALSE, 25.2650, 55.3010),
  ('Emirati Breakfast at Al Fahidi', 'Traditional breakfast in a heritage cafe.', 'food', 70, 75, 35, 'landside', FALSE, 25.2640, 55.2985),
  ('Deira Shawarma and Karak Walk', 'Quick street-food walk ending with karak tea.', 'food', 45, 60, 30, 'landside', FALSE, 25.2711, 55.3081),
  ('Airside Arabic Mezze Tasting', 'Mezze platter tasting at a terminal restaurant.', 'food', 60, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Lounge Gourmet Brunch', 'Premium lounge brunch with chef stations.', 'food', 250, 90, 0, 'airside', TRUE, 25.2532, 55.3657);

-- Activities part 2: shopping and relaxation
INSERT INTO activities (name, description, category, price_aed, duration_min, travel_min_one_way, zone, is_premium, latitude, longitude) VALUES
  ('Dubai Mall Highlights', 'Browse the world''s largest mall and its waterfall and aquarium views.', 'shopping', 40, 150, 30, 'landside', FALSE, 25.1985, 55.2796),
  ('Gold Souk Shopping Trip', 'Guided shopping and bargaining tips in the Deira gold souk.', 'shopping', 50, 90, 30, 'landside', FALSE, 25.2869, 55.2976),
  ('Dubai Festival City Mall Quick Stop', 'Nearby mall visit with easy shopping and a food court.', 'shopping', 20, 75, 20, 'landside', FALSE, 25.2220, 55.3550),
  ('Mall of the Emirates Shopping', 'Shopping and the indoor ski slope viewing area.', 'shopping', 35, 120, 40, 'landside', FALSE, 25.1181, 55.2008),
  ('Personal Shopper at Dubai Mall', 'Private shopper and VIP lounge access at the mall.', 'shopping', 500, 150, 30, 'landside', TRUE, 25.1985, 55.2796),
  ('Airside Duty Free Browse', 'Time to browse the terminal duty free shops.', 'shopping', 0, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Kite Beach Relaxation', 'Sit on the beach with views of the skyline.', 'relaxation', 30, 120, 40, 'landside', FALSE, 25.1500, 55.1930),
  ('Creekside Park Stroll', 'Walk and relax in Creekside Park with a cable car ride.', 'relaxation', 35, 90, 25, 'landside', FALSE, 25.2250, 55.3360),
  ('Spa and Shower Suite', 'Freshen up with a shower and a rest in the quiet area.', 'relaxation', 60, 60, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Airport Spa Massage', 'Short massage at the terminal spa.', 'relaxation', 150, 45, 0, 'airside', FALSE, 25.2532, 55.3657),
  ('Premium Lounge Access', 'Premium lounge with spa treatment and sleep pods.', 'relaxation', 300, 120, 0, 'airside', TRUE, 25.2532, 55.3657),
  ('Private Beach Cabana', 'Private cabana at a Jumeirah beach resort, with towels and drinks.', 'relaxation', 600, 180, 40, 'landside', TRUE, 25.1412, 55.1853);

-- Extra flights for boundary test cases
INSERT INTO flights (flight_no, direction, other_airport, scheduled_time) VALUES
  ('EK501', 'inbound',  'Frankfurt (FRA)', '2026-12-01 08:00'),
  ('EK232', 'outbound', 'Mumbai (BOM)',    '2026-12-01 12:15'),
  ('EK070', 'outbound', 'Muscat (MCT)',    '2026-12-01 10:15');

-- Demo passengers (demo only)
INSERT INTO users (name, email, password_hash, role, skywards_number) VALUES
  ('Passenger A', 'passenger.a@skywards.test', '$2b$10$v9of4y7OzSs0nd3mbjXg.uqLzz2Sb/fdAspzgfBxTN5aFqWaDH/Aq', 'passenger', 'EK 0000 0001'),
  ('Passenger B', 'passenger.b@skywards.test', '$2b$10$v9of4y7OzSs0nd3mbjXg.uqLzz2Sb/fdAspzgfBxTN5aFqWaDH/Aq', 'passenger', 'EK 0000 0002'),
  ('Passenger C', 'passenger.c@skywards.test', '$2b$10$v9of4y7OzSs0nd3mbjXg.uqLzz2Sb/fdAspzgfBxTN5aFqWaDH/Aq', 'passenger', 'EK 0000 0003');
