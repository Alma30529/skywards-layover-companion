import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  lookupPnr,
  calculateConnection,
  getMatchingActivities,
  NETWORK_MESSAGE,
} from '../api/layover'
import { loadLayover, saveLayover } from '../layover/layoverStorage'

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

  // FR2.1: the passenger enters a PNR and we look up their flights and cabin class
  const [pnrInput, setPnrInput] = useState('')
  const [pnr, setPnr] = useState(saved?.pnr ?? '')
  const [lookingUp, setLookingUp] = useState(false)
  const [inboundId, setInboundId] = useState(saved?.inboundId ?? '')
  const [outboundId, setOutboundId] = useState(saved?.outboundId ?? '')
  const [cabin, setCabin] = useState(saved?.cabin ?? 'Economy')
  const [categories, setCategories] = useState(saved?.categories ?? [])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const hasBooking = Boolean(pnr && inboundId && outboundId)

  // Recalculate when a saved booking is restored after a refresh (FR2.2 to FR2.4 are done by the server).
  // A fresh PNR lookup already has its result, so it is skipped here.
  useEffect(() => {
    if (!hasBooking) return
    if (
      result &&
      String(result.inbound.id) === String(inboundId) &&
      String(result.outbound.id) === String(outboundId) &&
      result.cabinClass === cabin
    ) {
      return
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBooking, inboundId, outboundId, cabin])

  // remember the choices on this device (NFR3)
  useEffect(() => {
    saveLayover({ ...(loadLayover() || {}), pnr, inboundId, outboundId, cabin, categories })
  }, [pnr, inboundId, outboundId, cabin, categories])

  async function handleLookup(e) {
    e.preventDefault()
    const clean = pnrInput.replace(/\s+/g, '').toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(clean)) {
      setError('Enter your 6-character booking reference (PNR).')
      return
    }
    setLookingUp(true)
    setError('')
    setNotice('')
    const r = await lookupPnr(clean)
    setLookingUp(false)
    if (!r.ok) {
      setError(r.status === 0 ? NETWORK_MESSAGE : r.data.error || 'Could not find that booking.')
      return
    }
    setPnr(r.data.pnr)
    setInboundId(r.data.inbound.id)
    setOutboundId(r.data.outbound.id)
    setCabin(r.data.cabinClass)
    setResult(r.data)
  }

  function changeBooking() {
    setPnr('')
    setPnrInput('')
    setInboundId('')
    setOutboundId('')
    setResult(null)
    setError('')
    setNotice('')
  }

  function toggleCategory(id) {
    setNotice('')
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const shown = hasBooking ? result : null
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
      pnr,
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
        Enter your booking reference and we will work out how much time you really have in Dubai.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-md border border-red-700 bg-red-50 p-3 text-red-900">
          <p>{error}</p>
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Your booking</h2>

        {!hasBooking ? (
          <form onSubmit={handleLookup} noValidate>
            <label htmlFor="pnr" className="mt-3 block text-sm font-medium">Booking reference (PNR)</label>
            <input
              id="pnr"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={10}
              placeholder="e.g. K7P2QX"
              className={`${field} uppercase tracking-widest`}
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              aria-describedby="pnr-help"
            />
            <p id="pnr-help" className="mt-1 text-sm text-stone-600">
              6 letters or numbers, shown on your booking confirmation.
            </p>
            <button
              type="submit"
              disabled={lookingUp || !pnrInput.trim()}
              className="mt-4 min-h-12 w-full rounded-md bg-red-700 px-4 text-base font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
            >
              {lookingUp ? 'Finding your flights…' : 'Find my flights'}
            </button>
          </form>
        ) : (
          <div className="mt-3 rounded-md border border-stone-300 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-stone-600">
                Booking reference <span className="font-semibold tracking-widest text-stone-900">{pnr}</span>
              </p>
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold">{cabin}</span>
            </div>
            {result ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-stone-600">Arriving flight</dt>
                  <dd className="font-semibold">{flightLabel(result.inbound)}</dd>
                </div>
                <div>
                  <dt className="text-stone-600">Departing flight</dt>
                  <dd className="font-semibold">{flightLabel(result.outbound)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-stone-600">Loading your flights…</p>
            )}
            <button
              type="button"
              onClick={changeBooking}
              className="mt-3 min-h-11 text-sm font-semibold text-red-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
            >
              Use a different booking reference
            </button>
          </div>
        )}
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
