import { Link } from 'react-router-dom'
import ItineraryScreen from '../itinerary/ItineraryScreen'
import { loadLayover } from '../layover/layoverStorage'

// Hands the layover result from the connection screen to the itinerary builder.
export default function ItineraryPage() {
  const saved = loadLayover()

  if (!saved?.activities || saved.usableMinutes == null) {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-stone-50 p-6">
        <h1 className="text-2xl font-bold">No layover selected</h1>
        <p className="mt-2 text-stone-600">Choose your flights first so we can fit activities to your time.</p>
        <Link to="/layover" className="mt-4 inline-flex min-h-11 items-center font-semibold text-red-700 underline">
          Plan your layover
        </Link>
      </main>
    )
  }

  return (
    <ItineraryScreen
      usableTime={saved.usableMinutes}
      cabin={saved.cabin}
      departureTime={saved.departureTime}
      activities={saved.activities}
      initialCategories={saved.categories}
    />
  )
}
