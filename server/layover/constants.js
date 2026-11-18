// FR2.3 / FR2.4: fixed constants for the MVP (SRS Section 6.2, Clarification Q2)
module.exports = {
  ARRIVAL_BUFFER_MIN: 45,   // immigration + baggage after landing
  DEPARTURE_BUFFER_MIN: 90, // be back at the gate before departure
  FULL_ACCESS_MIN: 120,     // >= 120 usable minutes: everything that fits
  AIRSIDE_ONLY_MIN: 60,     // 60-119 usable minutes: airside/lounge only
  LAYOVER_STATES: {
    FULL: 'full',
    AIRSIDE_ONLY: 'airside_only',
    CAUTION: 'caution',
  },
  CABIN_CLASSES: ['Economy', 'Business', 'First'],
  CATEGORIES: ['culture', 'food', 'shopping', 'relaxation'],
}
