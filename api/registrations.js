// Vercel serverless function behind the hidden /admin dashboard.
// Checks a username/password (HTTP Basic, from server env) and returns all registrations.
// The Supabase secret key lives only here, on the server — never in the browser bundle.
import { timingSafeEqual } from 'node:crypto'

const PAGE = 1000

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' })

  const { ADMIN_USERNAME, ADMIN_PASSWORD, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/(rest\/v1)?\/?$/, '')
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return send(res, 500, { error: 'Dashboard login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.' })
  }

  const [scheme, encoded] = (req.headers.authorization || '').split(' ')
  const decoded = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64').toString('utf8') : ''
  const sep = decoded.indexOf(':')
  const user = sep >= 0 ? decoded.slice(0, sep) : ''
  const pass = sep >= 0 ? decoded.slice(sep + 1) : ''
  // Compare both without short-circuiting, and slow down failures to blunt guessing.
  const okUser = safeEqual(user, ADMIN_USERNAME)
  const okPass = safeEqual(pass, ADMIN_PASSWORD)
  if (!(okUser && okPass)) {
    await new Promise((r) => setTimeout(r, 800))
    return send(res, 401, { error: 'Wrong username or password.' })
  }

  if (!url || !key) {
    return send(res, 500, { error: 'Supabase is not configured for the dashboard. Set SUPABASE_SERVICE_ROLE_KEY.' })
  }

  const headers = { apikey: key }
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`

  const rows = []
  try {
    for (let offset = 0; ; offset += PAGE) {
      const r = await fetch(
        `${url}/rest/v1/registrations?select=id,name,phone,age,pincode,created_at&order=created_at.desc&limit=${PAGE}&offset=${offset}`,
        { headers }
      )
      if (!r.ok) return send(res, 502, { error: `Could not read registrations (Supabase ${r.status}).` })
      const batch = await r.json()
      rows.push(...batch)
      if (batch.length < PAGE) break
    }
  } catch {
    return send(res, 502, { error: 'Could not reach Supabase.' })
  }

  send(res, 200, { rows })
}
