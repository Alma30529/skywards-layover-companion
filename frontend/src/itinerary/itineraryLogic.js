const DEPARTURE_BUFFER = 90;

// total time an activity takes: the activity itself + travel to and from DXB
export function getActivityTime(activity) {
  return activity.duration + 2 * activity.travelTime;
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
      if (a.isPremium !== b.isPremium) {
        return a.isPremium ? -1 : 1;
      }
      return a.price - b.price;
    });
  } else {
    sorted.sort((a, b) => a.price - b.price);
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

export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return hours + ":" + minutes;
}
