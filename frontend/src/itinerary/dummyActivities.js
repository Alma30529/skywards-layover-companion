// dummy data until Alma's seed data is ready
// price is in AED, duration and travelTime are in minutes
// travelTime is one way from DXB (0 for airside)

export const activities = [
  { id: 1, name: "Karama Street Food Crawl", category: "food", zone: "landside", price: 90, duration: 120, travelTime: 20, isPremium: false },
  { id: 2, name: "Old Dubai Souks Walk", category: "culture", zone: "waterside", price: 120, duration: 150, travelTime: 40, isPremium: false },
  { id: 3, name: "Creek Dhow Dinner Cruise", category: "food", zone: "waterside", price: 200, duration: 210, travelTime: 35, isPremium: false },
  { id: 4, name: "Dubai Mall Visit", category: "shopping", zone: "landside", price: 0, duration: 180, travelTime: 30, isPremium: false },
  { id: 5, name: "Burj Khalifa Observation Deck", category: "culture", zone: "landside", price: 190, duration: 120, travelTime: 30, isPremium: false },
  { id: 6, name: "Jumeirah Beach Walk", category: "relaxation", zone: "landside", price: 0, duration: 150, travelTime: 25, isPremium: false },
  { id: 7, name: "Dubai Frame and Zabeel Park", category: "culture", zone: "landside", price: 50, duration: 120, travelTime: 25, isPremium: false },
  { id: 8, name: "Airport Duty Free Shopping", category: "shopping", zone: "airside", price: 0, duration: 45, travelTime: 0, isPremium: false },
  { id: 9, name: "Terminal Art and Mosque Walk", category: "culture", zone: "airside", price: 0, duration: 30, travelTime: 0, isPremium: false },
  { id: 10, name: "Airside Food Court Tasting", category: "food", zone: "airside", price: 60, duration: 45, travelTime: 0, isPremium: false },
  { id: 11, name: "Business Lounge Access", category: "relaxation", zone: "airside", price: 100, duration: 90, travelTime: 0, isPremium: true },
  { id: 12, name: "Airport Spa Treatment", category: "relaxation", zone: "airside", price: 180, duration: 60, travelTime: 0, isPremium: true },
  { id: 13, name: "Lounge Fine Dining Buffet", category: "food", zone: "airside", price: 150, duration: 60, travelTime: 0, isPremium: true },
  { id: 14, name: "Skyline Fine Dining", category: "food", zone: "landside", price: 350, duration: 120, travelTime: 30, isPremium: true },
  { id: 15, name: "Private Burj Khalifa Lounge", category: "culture", zone: "landside", price: 400, duration: 120, travelTime: 30, isPremium: true },
  { id: 16, name: "Luxury Mall Personal Shopper", category: "shopping", zone: "landside", price: 300, duration: 150, travelTime: 30, isPremium: true },
];
