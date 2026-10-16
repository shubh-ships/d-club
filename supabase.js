// Plain fetch to Supabase's REST API — same pattern as frontend.
const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/(rest\/v1)?\/?$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const TIMEOUT_MS = 15000

const MESSAGES = {
  config: 'Registration is not configured yet.',
  offline: "You're offline. Check your internet connection and try again.",
  network: 'Network problem — please check your connection and try again.',
  timeout: 'This is taking too long. Please check your connection and try again.',
  invalid: 'Please check your name, mobile number, age, PIN code and gender and try again.',
  busy: 'Too many attempts right now. Please wait a minute and try again.',
  generic: 'Could not register right now. Please try again.',
}

function headers() {
  const h = { apikey: key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`
  return h
}

// Resolves to { duplicate: true } when the number is already registered; throws an Error with a
// user-facing message otherwise.
export async function registerGuest({ name, phone, age, pincode, gender }) {
  if (!url || !key) throw new Error(MESSAGES.config)
  if (navigator.onLine === false) throw new Error(MESSAGES.offline)

  let res
  try {
    res = await fetch(`${url}/rest/v1/registrations`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name, phone, age, pincode, gender }),
      signal: AbortSignal.timeout?.(TIMEOUT_MS),
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') throw new Error(MESSAGES.timeout)
    throw new Error(navigator.onLine === false ? MESSAGES.offline : MESSAGES.network)
  }

  if (res.ok) return { duplicate: false }

  const { code } = await res.json().catch(() => ({}))
  if (code === '23505') return { duplicate: true }
  if (code === '23514' || code === '22001') throw new Error(MESSAGES.invalid)
  if (res.status === 429) throw new Error(MESSAGES.busy)
  throw new Error(MESSAGES.generic)
}

// Total registrations via the `registration_count` RPC (returns a number only, no rows).
// A plain GET with the public key in the query string is a "simple" CORS request: one round trip,
// no preflight. The result is cached per tab for 5 minutes so reloads don't hit Supabase again.
// Resolves to null when it isn't set up or the network fails — callers just hide the counter.
const COUNT_CACHE_KEY = 'bc:registration-count'
const COUNT_TTL_MS = 5 * 60 * 1000

export async function fetchRegistrationCount() {
  if (!url || !key) return null
  try {
    const cached = JSON.parse(sessionStorage.getItem(COUNT_CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.at < COUNT_TTL_MS) return cached.n
  } catch {}
  try {
    const res = await fetch(`${url}/rest/v1/rpc/registration_count?apikey=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout?.(TIMEOUT_MS),
    })
    const body = res.ok ? await res.json() : null
    const n = Number.isInteger(body) ? body : null
    // Cache failures too, so a missing function or an outage isn't retried on every reload.
    try {
      sessionStorage.setItem(COUNT_CACHE_KEY, JSON.stringify({ n, at: Date.now() }))
    } catch {}
    return n
  } catch {
    return null
  }
}
