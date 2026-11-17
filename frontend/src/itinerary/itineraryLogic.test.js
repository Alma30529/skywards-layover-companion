import { test } from "node:test";
import assert from "node:assert";
import { activities } from "./dummyActivities.js";
import {
  getActivityTime,
  filterByCategory,
  filterByUsableTime,
  sortByCabin,
  getActivityList,
  hasNoMatch,
  getTimeUsed,
  getTimeLeft,
  canAdd,
  addActivity,
  removeActivity,
  getBackAtGateTime,
  formatTime,
  formatMinutes,
  parseFlightTime,
} from "./itineraryLogic.js";

function getIds(list) {
  return list.map((activity) => activity.id);
}

function getActivity(id) {
  return activities.find((activity) => activity.id === id);
}

// activity time

test("TC01 activity time includes travel to and from DXB", () => {
  assert.strictEqual(getActivityTime(getActivity(1)), 160);
});

test("TC02 airside activity has no travel time added", () => {
  assert.strictEqual(getActivityTime(getActivity(8)), 45);
});

// category filter

test("TC03 one category keeps only that category", () => {
  const result = filterByCategory(activities, ["shopping"]);
  assert.deepStrictEqual(getIds(result), [4, 8, 16]);
});

test("TC04 two categories keep both", () => {
  const result = filterByCategory(activities, ["culture", "food"]);
  assert.deepStrictEqual(getIds(result), [1, 2, 3, 5, 7, 9, 10, 13, 14, 15]);
});

test("TC05 no category selected gives an empty list", () => {
  assert.deepStrictEqual(filterByCategory(activities, []), []);
});

// usable time filter

test("TC06 usable time under 60 shows no activities", () => {
  assert.deepStrictEqual(filterByUsableTime(activities, 59), []);
});

test("TC07 usable time of 0 shows no activities", () => {
  assert.deepStrictEqual(filterByUsableTime(activities, 0), []);
});

test("TC08 negative usable time shows no activities", () => {
  assert.deepStrictEqual(filterByUsableTime(activities, -30), []);
});

test("TC09 usable time of exactly 60 shows only airside activities that fit", () => {
  const result = filterByUsableTime(activities, 60);
  assert.deepStrictEqual(getIds(result), [8, 9, 10, 12, 13]);
});

test("TC10 usable time of 119 shows only airside activities", () => {
  const result = filterByUsableTime(activities, 119);
  assert.deepStrictEqual(getIds(result), [8, 9, 10, 11, 12, 13]);
  assert.ok(result.every((activity) => activity.zone === "airside"));
});

test("TC11 usable time of 120 or more shows landside activities too", () => {
  const result = filterByUsableTime(activities, 200);
  assert.ok(result.some((activity) => activity.zone === "landside"));
});

test("TC12 activity that fits exactly is included", () => {
  assert.ok(getIds(filterByUsableTime(activities, 160)).includes(1));
});

test("TC13 activity one minute too long is left out", () => {
  assert.ok(!getIds(filterByUsableTime(activities, 159)).includes(1));
});

// cabin ordering

test("TC14 economy is ordered by price ascending", () => {
  const result = sortByCabin(filterByCategory(activities, ["culture", "food"]), "Economy");
  assert.deepStrictEqual(getIds(result), [9, 7, 10, 1, 2, 13, 5, 3, 14, 15]);
});

test("TC15 business shows premium first, then the rest by price", () => {
  const result = sortByCabin(filterByCategory(activities, ["culture", "food"]), "Business");
  assert.deepStrictEqual(getIds(result), [13, 14, 15, 9, 7, 10, 1, 2, 5, 3]);
});

test("TC16 first class is ordered the same as business", () => {
  const list = filterByCategory(activities, ["culture", "food"]);
  assert.deepStrictEqual(getIds(sortByCabin(list, "First")), getIds(sortByCabin(list, "Business")));
});

test("TC17 sorting does not change the original list", () => {
  const list = filterByCategory(activities, ["culture", "food"]);
  const before = getIds(list);
  sortByCabin(list, "Economy");
  assert.deepStrictEqual(getIds(list), before);
});

// full list

test("TC18 5h 20m economy with culture and food", () => {
  const result = getActivityList(activities, ["culture", "food"], 320, "Economy");
  assert.deepStrictEqual(getIds(result), [9, 7, 10, 1, 2, 13, 5, 3, 14, 15]);
});

test("TC19 80 minutes economy gives airside only, ordered by price", () => {
  const result = getActivityList(activities, ["culture", "food", "shopping", "relaxation"], 80, "Economy");
  assert.deepStrictEqual(getIds(result), [8, 9, 10, 13, 12]);
});

test("TC20 80 minutes business gives premium airside first", () => {
  const result = getActivityList(activities, ["culture", "food", "shopping", "relaxation"], 80, "Business");
  assert.deepStrictEqual(getIds(result), [13, 12, 8, 9, 10]);
});

// no match

test("TC21 no match when the only activity is not airside and time is short", () => {
  const result = getActivityList([getActivity(2)], ["culture"], 100, "Economy");
  assert.strictEqual(hasNoMatch(result), true);
});

test("TC22 a list with activities is not a no match", () => {
  const result = getActivityList(activities, ["food"], 320, "Economy");
  assert.strictEqual(hasNoMatch(result), false);
});

test("TC23 no match when usable time is under 60", () => {
  const result = getActivityList(activities, ["food", "culture"], 15, "Economy");
  assert.strictEqual(hasNoMatch(result), true);
});

// building the itinerary

test("TC24 adding an activity that fits adds it", () => {
  const itinerary = addActivity([], getActivity(1), 320);
  assert.deepStrictEqual(getIds(itinerary), [1]);
});

test("TC25 running total adds up the activities", () => {
  let itinerary = [];
  itinerary = addActivity(itinerary, getActivity(1), 320);
  itinerary = addActivity(itinerary, getActivity(9), 320);
  assert.strictEqual(getTimeUsed(itinerary), 190);
  assert.strictEqual(getTimeLeft(itinerary, 320), 130);
});

test("TC26 activity that no longer fits cannot be added", () => {
  const itinerary = addActivity([], getActivity(1), 320);
  assert.strictEqual(canAdd(itinerary, getActivity(2), 320), false);
  assert.deepStrictEqual(getIds(addActivity(itinerary, getActivity(2), 320)), [1]);
});

test("TC27 activity that fills the time exactly can be added", () => {
  let itinerary = addActivity([], getActivity(1), 340);
  assert.strictEqual(canAdd(itinerary, getActivity(5), 340), true);
  itinerary = addActivity(itinerary, getActivity(5), 340);
  assert.strictEqual(getTimeLeft(itinerary, 340), 0);
});

test("TC28 nothing can be added when no time is left", () => {
  let itinerary = addActivity([], getActivity(1), 340);
  itinerary = addActivity(itinerary, getActivity(5), 340);
  assert.strictEqual(canAdd(itinerary, getActivity(9), 340), false);
});

test("TC29 same activity cannot be added twice", () => {
  let itinerary = addActivity([], getActivity(1), 320);
  itinerary = addActivity(itinerary, getActivity(1), 320);
  assert.deepStrictEqual(getIds(itinerary), [1]);
});

test("TC30 total time never goes over usable time", () => {
  let itinerary = [];
  const list = getActivityList(activities, ["culture", "food", "shopping", "relaxation"], 320, "Economy");
  for (const activity of list) {
    itinerary = addActivity(itinerary, activity, 320);
  }
  assert.ok(getTimeUsed(itinerary) <= 320);
});

test("TC31 removing an activity gives the time back", () => {
  let itinerary = [];
  itinerary = addActivity(itinerary, getActivity(1), 320);
  itinerary = addActivity(itinerary, getActivity(9), 320);
  itinerary = removeActivity(itinerary, getActivity(1));
  assert.deepStrictEqual(getIds(itinerary), [9]);
  assert.strictEqual(getTimeUsed(itinerary), 30);
});

test("TC32 empty itinerary uses no time", () => {
  assert.strictEqual(getTimeUsed([]), 0);
  assert.strictEqual(getTimeLeft([], 320), 320);
});

// be back at gate

test("TC33 be back at gate is 90 minutes before departure", () => {
  const departure = new Date(Date.UTC(2026, 10, 20, 13, 45));
  assert.strictEqual(formatTime(getBackAtGateTime(departure)), "12:15");
});

test("TC34 be back at gate works when departure is after midnight", () => {
  const departure = new Date(Date.UTC(2026, 10, 21, 0, 30));
  const result = getBackAtGateTime(departure);
  assert.strictEqual(formatTime(result), "23:00");
  assert.strictEqual(result.getUTCDate(), 20);
});

test("TC35 times under 10 are shown with a leading zero", () => {
  const departure = new Date(Date.UTC(2026, 10, 20, 9, 5));
  assert.strictEqual(formatTime(getBackAtGateTime(departure)), "07:35");
});

// showing minutes

test("TC36 minutes are shown as hours and minutes", () => {
  assert.strictEqual(formatMinutes(320), "5h 20m");
});

test("TC37 under an hour is shown as minutes only", () => {
  assert.strictEqual(formatMinutes(45), "45m");
});

test("TC38 whole hours are shown without minutes", () => {
  assert.strictEqual(formatMinutes(120), "2h");
});

test("TC39 negative time is shown as 0m", () => {
  assert.strictEqual(formatMinutes(-10), "0m");
});

// flight time text from the database

test("TC40 flight time text gives the right gate time", () => {
  const departure = parseFlightTime("2026-12-01 13:45");
  assert.strictEqual(formatTime(getBackAtGateTime(departure)), "12:15");
});

test("TC41 flight time with a Z at the end is read as written", () => {
  const departure = parseFlightTime("2026-12-01T13:45:00.000Z");
  assert.strictEqual(formatTime(getBackAtGateTime(departure)), "12:15");
});

test("TC42 flight time just after midnight gives the day before", () => {
  const result = getBackAtGateTime(parseFlightTime("2026-12-01 00:30"));
  assert.strictEqual(formatTime(result), "23:00");
  assert.strictEqual(result.getUTCDate(), 30);
});
