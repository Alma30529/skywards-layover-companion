const DEPARTURE_BUFFER = 90;

// total time an activity takes: the activity itself + travel to and from DXB
export function getActivityTime(activity) {
  return activity.duration_min + 2 * activity.travel_min_one_way;
}

// FR3.1: keep only the chosen categories
export function filterByCategory(activities, categories) {
  return activities.filter((activity) => categories.includes(activity.category));
}

// FR2.4 + FR3.2: keep only the activities that fit in the usable time
export function filterByUsableTime(activities, usableTime) {
  if (usableTime < 60) {
    return [];
  }

  let result = activities;

  if (usableTime < 120) {
    result = result.filter((activity) => activity.zone === "airside");
  }

  return result.filter((activity) => getActivityTime(activity) <= usableTime);
}

// FR3.3: order by cabin class
export function sortByCabin(activities, cabin) {
  const sorted = [...activities];

  if (cabin === "Business" || cabin === "First") {
    sorted.sort((a, b) => {
      if (a.is_premium !== b.is_premium) {
        return a.is_premium ? -1 : 1;
      }
      return a.price_aed - b.price_aed;
    });
  } else {
    sorted.sort((a, b) => a.price_aed - b.price_aed);
  }

  return sorted;
}

// the list shown on the build itinerary screen
export function getActivityList(activities, categories, usableTime, cabin) {
  const byCategory = filterByCategory(activities, categories);
  const byTime = filterByUsableTime(byCategory, usableTime);
  return sortByCabin(byTime, cabin);
}

// FR3.6: nothing matches
export function hasNoMatch(list) {
  return list.length === 0;
}

// FR3.4: the itinerary is an array of activities
export function getTimeUsed(itinerary) {
  let total = 0;
  for (const activity of itinerary) {
    total = total + getActivityTime(activity);
  }
  return total;
}

export function getTimeLeft(itinerary, usableTime) {
  return usableTime - getTimeUsed(itinerary);
}

export function isAdded(itinerary, activity) {
  return itinerary.some((item) => item.id === activity.id);
}

export function canAdd(itinerary, activity, usableTime) {
  if (isAdded(itinerary, activity)) {
    return false;
  }
  return getActivityTime(activity) <= getTimeLeft(itinerary, usableTime);
}

export function addActivity(itinerary, activity, usableTime) {
  if (!canAdd(itinerary, activity, usableTime)) {
    return itinerary;
  }
  return [...itinerary, activity];
}

export function removeActivity(itinerary, activity) {
  return itinerary.filter((item) => item.id !== activity.id);
}

// FR2.5: be back at the gate 90 minutes before departure
export function getBackAtGateTime(departureTime) {
  return new Date(departureTime.getTime() - DEPARTURE_BUFFER * 60 * 1000);
}

// flight times are text like "2026-12-01 13:45" (Dubai local time)
// the time is read exactly as written so the browser's time zone cannot change it
export function parseFlightTime(text) {
  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(5, 7)) - 1;
  const day = Number(text.slice(8, 10));
  const hours = Number(text.slice(11, 13));
  const minutes = Number(text.slice(14, 16));
  return new Date(Date.UTC(year, month, day, hours, minutes));
}

export function formatTime(date) {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return hours + ":" + minutes;
}

// shows minutes as 5h 20m, 45m or 2h
export function formatMinutes(minutes) {
  if (minutes < 0) {
    minutes = 0;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return mins + "m";
  }
  if (mins === 0) {
    return hours + "h";
  }
  return hours + "h " + mins + "m";
}
