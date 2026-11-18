import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFlights,
  calculateConnection,
  getMatchingActivities,
  NETWORK_MESSAGE,
} from '../api/layover'
import { loadLayover, saveLayover } from '../layover/layoverStorage'

const CABINS = ['Economy', 'Business', 'First']
const CATEGORIES = [
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'relaxation', label: 'Relaxation' },
]

// colours and wording for the three layover states (FR2.4)
const STATE_STYLE = {
  full: 'border-emerald-600 bg-emerald-50 text-emerald-950',
  airside_only: 'border-sky-600 bg-sky-50 text-sky-950',
  caution: 'border-amber-600 bg-amber-50 text-amber-950',
}
const STATE_LABEL = {
  full: 'Full access',
  airside_only: 'Airport only',
  caution: 'Stay near your gate',
}

const field =
  'mt-1 block min-h-11 w-full rounded-md border border-stone-400 bg-white px-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700'

function flightLabel(f) {
  return `${f.flight_no} · ${f.other_airport} · ${f.scheduled_time.slice(11)}`
}

export default function ConnectionSelect() {
  const navigate = useNavigate()
  const saved = loadLayover()

  const [flights, setFlights] = useState({ inbound: [], outbound: [] })
  const [loadingFlights, setLoadingFlights] = useState(true)
  const [inboundId, setInboundId] = useState(saved?.inboundId ?? '')
  const [outboundId, setOutboundId] = useState(saved?.outboundId ?? '')
  const [cabin, setCabin] = useState(saved?.cabin ?? 'Economy')
  const [categories, setCategories] = useState(saved?.categories ?? [])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getFlights().then((r) => {
      if (cancelled) return
      setLoadingFlights(false)
      if (r.ok) setFlights(r.data)
      else setError(r.status === 0 ? NETWORK_MESSAGE : r.data.error || 'Could not load flights.')
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function retryFlights() {
    setError('')
    setLoadingFlights(true)
    setReloadKey((k) => k + 1)
  }

  // FR2.1: only outbound flights that depart after the chosen inbound flight arrives
  const inbound = flights.inbound.find((f) => String(f.id) === String(inboundId))
  const outboundOptions = inbound
    ? flights.outbound.filter((f) => f.scheduled_time > inbound.scheduled_time)
    : []

  // recalculate whenever the connection changes (FR2.2 to FR2.4 are done by the server)
  useEffect(() => {
    if (!inboundId || !outboundId) return
    let cancelled = false
    calculateConnection({
      inboundFlightId: Number(inboundId),
      outboundFlightId: Number(outboundId),
      cabinClass: cabin,
    }).then((r) => {
      if (cancelled) return
      if (r.ok) {
        setResult(r.data)
        setError('')
      } else {
        setResult(null)
        setError(r.status === 0 ? NETWORK_MESSAGE : r.data.error || 'Could not calculate your layover.')
      }
    })
    return () => {
      cancelled = true
    }
  }, [inboundId, outboundId, cabin])

  // remember the choices on this device (NFR3)
  useEffect(() => {
    saveLayover({ ...(loadLayover() || {}), inboundId, outboundId, cabin, categories })
  }, [inboundId, outboundId, cabin, categories])

  function changeInbound(id) {
    setInboundId(id)
    setOutboundId('')
    setResult(null)
    setNotice('')
  }

  function changeOutbound(id) {
    setOutboundId(id)
    if (!id) setResult(null)
    setNotice('')
  }

  function toggleCategory(id) {
    setNotice('')
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const shown = inboundId && outboundId ? result : null
  const canContinue = shown?.bookable && categories.length > 0 && !busy

  async function handleContinue() {
    setBusy(true)
    setError('')
    setNotice('')
    const r = await getMatchingActivities({
      inboundFlightId: Number(inboundId),
      outboundFlightId: Number(outboundId),
      cabinClass: cabin,
      categories,
    })
    setBusy(false)
    if (!r.ok) {
      setError(r.status === 0 ? NETWORK_MESSAGE : r.data.error || 'Something went wrong. Try again.')
      return
    }
    // FR3.6: nothing matches
    if (r.data.noMatch) {
      setNotice(
        shown.airsideOnly
          ? 'No airport activities match those interests. Try other categories.'
          : 'No activities match those interests and your time. Try other categories.'
      )
      return
    }
    saveLayover({
      inboundId,
      outboundId,
      cabin,
      categories,
      usableMinutes: r.data.connection.usableMinutes,
      departureTime: r.data.connection.outbound.scheduled_time,
      activities: r.data.activities,
    })
    navigate('/itinerary')
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50 px-5 py-6 text-stone-900">
      <h1 className="text-2xl font-bold">Plan your layover</h1>
      <p className="mt-1 text-stone-600">
        Pick your two flights and we will work out how much time you really have in Dubai.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-700 bg-red-50 p-3 text-red-900">
          <p>{error}</p>
          {flights.inbound.length === 0 && (
            <button type="button" onClick={retryFlights} className="mt-2 min-h-11 font-semibold underline">
              Try again
            </button>
          )}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Your flights</h2>

        <label htmlFor="inbound" className="mt-3 block text-sm font-medium">Arriving flight</label>
        <select
          id="inbound"
          className={field}
          value={inboundId}
          disabled={loadingFlights}
          onChange={(e) => changeInbound(e.target.value)}
        >
          <option value="">{loadingFlights ? 'Loading flights…' : 'Select your arriving flight'}</option>
          {flights.inbound.map((f) => (
            <option key={f.id} value={f.id}>{flightLabel(f)}</option>
          ))}
        </select>

        <label htmlFor="outbound" className="mt-4 block text-sm font-medium">Departing flight</label>
        <select
          id="outbound"
          className={field}
          value={outboundId}
          disabled={!inboundId}
          onChange={(e) => changeOutbound(e.target.value)}
        >
          <option value="">
            {inboundId ? 'Select your departing flight' : 'Choose your arriving flight first'}
          </option>
          {outboundOptions.map((f) => (
            <option key={f.id} value={f.id}>{flightLabel(f)}</option>
          ))}
        </select>
        {inboundId && outboundOptions.length === 0 && (
          <p className="mt-2 text-sm text-stone-600">No departing flights leave after that arrival.</p>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Cabin class</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {CABINS.map((c) => (
              <label
                key={c}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border text-base font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red-700 ${
                  cabin === c ? 'border-red-700 bg-red-700 text-white' : 'border-stone-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="cabin"
                  value={c}
                  checked={cabin === c}
                  onChange={() => setCabin(c)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {shown && (
        <section
          aria-live="polite"
          className={`mt-6 rounded-md border-l-4 p-4 ${STATE_STYLE[shown.state]}`}
        >
          <p className="text-sm font-semibold">{STATE_LABEL[shown.state]}</p>
          <p className="mt-1 text-3xl font-bold">{shown.usableText}</p>
          <p className="mt-1">{shown.message}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="opacity-75">Total layover</dt>
              <dd className="font-semibold">{shown.layoverText}</dd>
            </div>
            <div>
              <dt className="opacity-75">Be at your gate by</dt>
              <dd className="font-semibold">{shown.backAtGate}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs opacity-75">
            We allow 45 minutes after landing and 90 minutes before departure.
          </p>
        </section>
      )}

      {shown?.bookable && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">What are you into?</h2>
          <p className="text-sm text-stone-600">Choose one or more.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={categories.includes(c.id)}
                onClick={() => toggleCategory(c.id)}
                className={`min-h-11 rounded-md border px-3 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${
                  categories.includes(c.id)
                    ? 'border-red-700 bg-red-700 text-white'
                    : 'border-stone-400 bg-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="mt-2 text-sm text-stone-600">Choose at least one interest to continue.</p>
          )}
          {notice && (
            <p role="status" className="mt-3 rounded-md bg-stone-200 p-3 text-sm">{notice}</p>
          )}
          <button
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className="mt-5 min-h-12 w-full rounded-md bg-red-700 px-4 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
          >
            {busy ? 'Finding activities…' : 'Find activities'}
          </button>
        </section>
      )}

      <p className="mt-10 text-xs text-stone-500">
        Student prototype with mock data. Not affiliated with Emirates or Skywards.
      </p>
    </main>
  )
}
