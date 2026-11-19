import { useState } from "react";
import { seedActivities } from "./seedActivities.js";
import {
  getActivityList,
  hasNoMatch,
  getActivityTime,
  getTimeUsed,
  isAdded,
  canAdd,
  addActivity,
  removeActivity,
  getBackAtGateTime,
  formatTime,
  formatMinutes,
  parseFlightTime,
} from "./itineraryLogic.js";

const allCategories = ["culture", "food", "shopping", "relaxation"];

function ItineraryScreen({
  usableTime = 320,
  cabin = "Economy",
  departureTime = "2026-12-01 13:45",
  activities = seedActivities,
  initialCategories = [],
  onProceed,
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [itinerary, setItinerary] = useState([]);
  const [airportOnly, setAirportOnly] = useState(false);

  // only the interests picked on the layover screen are shown here
  const categoryChoices = initialCategories.length > 0 ? initialCategories : allCategories;

  let list = getActivityList(activities, categories, usableTime, cabin);
  if (airportOnly) {
    list = list.filter((activity) => activity.zone === "airside");
  }

  const tooShort = usableTime < 60;
  const timeUsed = getTimeUsed(itinerary);
  const percent = tooShort ? 0 : Math.min(100, (timeUsed / usableTime) * 100);
  const backAtGate = formatTime(getBackAtGateTime(parseFlightTime(departureTime)));

  function toggleCategory(category) {
    if (categories.includes(category)) {
      setCategories(categories.filter((item) => item !== category));
    } else {
      setCategories([...categories, category]);
    }
  }

  function handleAdd(activity) {
    setItinerary(addActivity(itinerary, activity, usableTime));
  }

  function handleRemove(activity) {
    setItinerary(removeActivity(itinerary, activity));
  }

  function tryAnotherCategory() {
    setAirportOnly(false);
    setCategories([]);
  }

  function showAirportOnly() {
    setAirportOnly(true);
    setCategories(categoryChoices);
  }

  return (
    <div className="mx-auto max-w-md p-4 text-slate-900">
      <h1 className="text-2xl font-semibold">Build your itinerary</h1>
      <div className="mt-1 flex justify-between text-sm">
        <p>You have {formatMinutes(usableTime)} of free time</p>
        <p className="font-medium">{cabin}</p>
      </div>

      {tooShort && (
        <div className="mt-6 rounded border border-red-700 bg-red-50 p-3">
          <p className="font-medium">Your free time is too short for activities.</p>
          <p className="text-sm">Stay near your gate.</p>
        </div>
      )}

      {!tooShort && (
        <div>
          <h2 className="mt-6 font-semibold">What are you into?</h2>
          <p className="text-sm text-slate-600">Pick one or more.</p>
          <div className="mt-2 grid grid-cols-2">
            {categoryChoices.map((category) => (
              <label key={category} className="flex min-h-[44px] items-center gap-2 capitalize">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-red-700"
                  checked={categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            ))}
          </div>

          {airportOnly && (
            <p className="mt-2 text-sm">
              Showing airport-only options.{" "}
              <button className="min-h-[44px] underline" onClick={() => setAirportOnly(false)}>
                Show all options
              </button>
            </p>
          )}

          <h2 className="mt-4 font-semibold">Activities that fit</h2>

          {categories.length === 0 && (
            <p className="mt-2 rounded border border-dashed p-3 text-sm">
              Pick at least one category to see activities.
            </p>
          )}

          {categories.length > 0 && hasNoMatch(list) && (
            <div className="mt-2 rounded border border-dashed p-3">
              <p className="text-sm">No activities match. Try another category or browse airport-only options.</p>
              <button
                className="mt-2 min-h-[44px] w-full rounded border border-red-700 px-3 text-red-700"
                onClick={tryAnotherCategory}
              >
                Try another category
              </button>
              <button
                className="mt-2 min-h-[44px] w-full rounded border border-red-700 px-3 text-red-700"
                onClick={showAirportOnly}
              >
                Show airport-only options
              </button>
            </div>
          )}

          <ul className="mt-2 space-y-3">
            {list.map((activity) => {
              const added = isAdded(itinerary, activity);
              const fits = canAdd(itinerary, activity, usableTime);
              const greyedOut = !added && !fits;

              return (
                <li
                  key={activity.id}
                  className={"rounded border p-3 " + (greyedOut ? "bg-slate-100 text-slate-400" : "bg-white")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="mt-1 flex gap-2 text-xs capitalize">
                        <span className="rounded border px-2 py-0.5">{activity.category}</span>
                        <span className="rounded border px-2 py-0.5">{activity.zone}</span>
                      </p>
                      <p className="mt-1 text-sm">
                        {formatMinutes(activity.duration_min)}, {activity.price_aed === 0 ? "Free" : "AED " + activity.price_aed}
                      </p>
                      {activity.travel_min_one_way > 0 && (
                        <p className="text-xs">Travel: {formatMinutes(2 * activity.travel_min_one_way)} there and back</p>
                      )}
                      {greyedOut && <p className="mt-1 text-sm">Doesn't fit remaining time.</p>}
                    </div>
                    <button
                      className={
                        "min-h-[44px] min-w-[44px] whitespace-nowrap rounded px-3 " +
                        (fits ? "bg-red-700 text-white" : "bg-slate-200 text-slate-500")
                      }
                      disabled={!fits}
                      onClick={() => handleAdd(activity)}
                    >
                      {added ? "Added ✓" : "Add"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded border p-3">
            <h2 className="font-semibold">Your selection</h2>
            {itinerary.length === 0 && <p className="mt-1 text-sm">No activities added yet.</p>}
            <ol className="mt-1">
              {itinerary.map((activity, index) => (
                <li key={activity.id} className="flex items-center justify-between gap-2">
                  <span>
                    {index + 1}. {activity.name}
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap text-sm">
                    {formatMinutes(getActivityTime(activity))}
                    <button className="min-h-[44px] min-w-[44px] underline" onClick={() => handleRemove(activity)}>
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <div
              className="mt-2 h-3 w-full rounded bg-slate-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={usableTime}
              aria-valuenow={timeUsed}
            >
              <div className="h-3 rounded bg-red-700" style={{ width: percent + "%" }}></div>
            </div>
            <p className="mt-1 text-sm">
              Time used {formatMinutes(timeUsed)} of {formatMinutes(usableTime)}
            </p>
            <p className="text-xs text-slate-600">Times include travel to and from the airport.</p>
          </div>
        </div>
      )}

      <div className="mt-4 rounded border border-dashed p-3 text-center">
        <p className="font-medium">Be back at gate by {backAtGate}</p>
      </div>

      {itinerary.length > 0 && (
        <button className="mt-4 min-h-[44px] w-full rounded bg-red-700 px-3 text-white" onClick={onProceed}>
          Proceed to book
        </button>
      )}
    </div>
  );
}

export default ItineraryScreen;
