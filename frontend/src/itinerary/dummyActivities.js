// fixed activities used by the tests (same column names as the activities table)
// price_aed is in AED, the other times are in minutes
// travel_min_one_way is one way from DXB (0 for airside)

export const activities = [
  { id: 1, name: "Karama Street Food Crawl", category: "food", zone: "landside", price_aed: 90, duration_min: 120, travel_min_one_way: 20, is_premium: false },
  { id: 2, name: "Old Dubai Souks Walk", category: "culture", zone: "landside", price_aed: 120, duration_min: 150, travel_min_one_way: 40, is_premium: false },
  { id: 3, name: "Creek Dhow Dinner Cruise", category: "food", zone: "landside", price_aed: 200, duration_min: 210, travel_min_one_way: 35, is_premium: false },
  { id: 4, name: "Dubai Mall Visit", category: "shopping", zone: "landside", price_aed: 0, duration_min: 180, travel_min_one_way: 30, is_premium: false },
  { id: 5, name: "Burj Khalifa Observation Deck", category: "culture", zone: "landside", price_aed: 190, duration_min: 120, travel_min_one_way: 30, is_premium: false },
  { id: 6, name: "Jumeirah Beach Walk", category: "relaxation", zone: "landside", price_aed: 0, duration_min: 150, travel_min_one_way: 25, is_premium: false },
  { id: 7, name: "Dubai Frame and Zabeel Park", category: "culture", zone: "landside", price_aed: 50, duration_min: 120, travel_min_one_way: 25, is_premium: false },
  { id: 8, name: "Airport Duty Free Shopping", category: "shopping", zone: "airside", price_aed: 0, duration_min: 45, travel_min_one_way: 0, is_premium: false },
  { id: 9, name: "Terminal Art and Mosque Walk", category: "culture", zone: "airside", price_aed: 0, duration_min: 30, travel_min_one_way: 0, is_premium: false },
  { id: 10, name: "Airside Food Court Tasting", category: "food", zone: "airside", price_aed: 60, duration_min: 45, travel_min_one_way: 0, is_premium: false },
  { id: 11, name: "Business Lounge Access", category: "relaxation", zone: "airside", price_aed: 100, duration_min: 90, travel_min_one_way: 0, is_premium: true },
  { id: 12, name: "Airport Spa Treatment", category: "relaxation", zone: "airside", price_aed: 180, duration_min: 60, travel_min_one_way: 0, is_premium: true },
  { id: 13, name: "Lounge Fine Dining Buffet", category: "food", zone: "airside", price_aed: 150, duration_min: 60, travel_min_one_way: 0, is_premium: true },
  { id: 14, name: "Skyline Fine Dining", category: "food", zone: "landside", price_aed: 350, duration_min: 120, travel_min_one_way: 30, is_premium: true },
  { id: 15, name: "Private Burj Khalifa Lounge", category: "culture", zone: "landside", price_aed: 400, duration_min: 120, travel_min_one_way: 30, is_premium: true },
  { id: 16, name: "Luxury Mall Personal Shopper", category: "shopping", zone: "landside", price_aed: 300, duration_min: 150, travel_min_one_way: 30, is_premium: true },
];
