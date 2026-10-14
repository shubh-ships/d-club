import { useEffect, useState } from 'react'
import ThankYou from './components/ThankYou.jsx'
import { fetchRegistrationCount, registerGuest } from './supabase.js'
import { BrushEdge, DandiyaStick, Icon, Mandala } from './components/Decor.jsx'
import heroPhoto from './assets/hero-garba-night.webp'
import bhajanPhoto from './assets/bhajan-clubbing-stage.webp'
import dandiyaPhoto from './assets/dandiya-dancers.webp'

// ---- Event content: edit here ----
const EVENT = {
  name: 'Bhajan Clubbing',
  subtitle: 'Dandiya Edition',
  year: '2026',
  start: '2026-10-21T17:30:00+05:30',
  end: '2026-10-21T23:00:00+05:30',
  dateLabel: '21 October 2026',
  dayName: 'Wednesday',
  dateShort: '21 Oct 2026',
  calendarDates: '20261021T120000Z/20261021T173000Z',
  timeLabel: '5:30 PM',
  venue: 'Ramlila Ground',
  address: 'Sector 1, R.K. Puram, Delhi',
  mapUrl: 'https://maps.app.goo.gl/wuFRFftdA895KVMt6',
  wowslyUrl: 'https://app.wowsly.com/e/3642/bhajan-clubbing-dandiya-edition/',
}

const VIBES = [
  {
    id: 'bhajan',
    name: 'Bhajan Clubbing',
    icon: 'music',
    photo: bhajanPhoto,
    hook: 'Bhajans, remixed for the dance floor',
    text: 'Soulful bhajans remixed with electronic beats by top artists, with club-grade lighting, sound and stage.',
  },
  {
    id: 'dandiya',
    name: 'Dandiya Raas',
    icon: 'sticks',
    photo: dandiyaPhoto,
    hook: 'Sticks up. Circles spinning.',
    text: 'Classic dandiya circles with colourful sticks and festive energy, plus selfie zones to capture every moment.',
  },
]

// Live count is shown only once it is big enough to persuade.
const SOCIAL_PROOF_MIN = 50

// -----------------------------------

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const lead = diff < 86400000 ? 'Last call — gates open in' : diff < 3 * 86400000 ? 'Final days — gates open in' : 'Gates open in'
  return {
    done: diff === 0,
    ended: now > new Date(EVENT.end).getTime(),
    lead,
    parts: [
      ['Days', Math.floor(diff / 86400000)],
      ['Hours', Math.floor(diff / 3600000) % 24],
      ['Mins', Math.floor(diff / 60000) % 60],
      ['Secs', Math.floor(diff / 1000) % 60],
    ],
  }
}

const pad = (n) => String(n).padStart(2, '0')

// One lookup per visit (cached 5 min) — no polling, so traffic spikes don't multiply Supabase calls.
function useRegistrationCount() {
  const [count, setCount] = useState(null)
  useEffect(() => {
    let alive = true
    fetchRegistrationCount().then((n) => alive && n !== null && setCount(n))
    return () => {
      alive = false
    }
  }, [])
  return count
}

// Gold title with crossed dandiya sticks, as on the poster.
function BrandTitle() {
  return (
    <h1 className="brand-title">
      <span className="brand-line brand-line--1">
        Bhajan
        <DandiyaStick className="brand-stick brand-stick--solo" />
      </span>
      <span className="brand-line brand-line--2">
        <span className="brand-sticks" aria-hidden="true">
          <DandiyaStick className="brand-stick brand-stick--a" />
          <DandiyaStick className="brand-stick brand-stick--b" />
        </span>
        Clubbing
      </span>
      <span className="ribbon brand-ribbon">Dandiya Edition</span>
    </h1>
  )
}

// ---- Registration form ----
function RegisterCard({ onRegistered }) {
  const count = useRegistrationCount()
  const [form, setForm] = useState({ name: '', phone: '', age: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const update = (e) => {
    const { name } = e.target
    const value = name === 'age' ? e.target.value.replace(/\D/g, '').slice(0, 3) : e.target.value
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((errs) => (errs[name] ? { ...errs, [name]: undefined } : errs))
  }

  const submit = async (e) => {
    e.preventDefault()
    const name = form.name.trim().replace(/\s+/g, ' ')
    const phone = form.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')
    const next = {}
    if (name.length < 2) next.name = 'Please enter your name'
    if (!/^[6-9]\d{9}$/.test(phone)) next.phone = 'Enter a valid 10-digit mobile number'
    const age = Number(form.age)
    if (!Number.isInteger(age) || age < 5 || age > 100) next.age = 'Enter a valid age (5–100)'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('sending')
    try {
      const { duplicate } = await registerGuest({ name, phone, age })
      setForm({ name: '', phone: '', age: '' })
      setStatus('idle')
      onRegistered({ name, phone, age, duplicate })
    } catch (err) {
      setMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <form className="register-card form parchment" id="register" onSubmit={submit} noValidate>
      <span className="ribbon card-ribbon">Free Entry Pass</span>
      <h2 className="form-title">Grab your free pass</h2>
      <p className="form-sub">Bhajan Clubbing + Dandiya Raas · Free entry with a pass</p>
      {count >= SOCIAL_PROOF_MIN && (
        <p className="social-proof">
          <span className="live-dot" aria-hidden="true" />
          <strong>{count.toLocaleString('en-IN')}</strong> people already have their pass
        </p>
      )}
      <label>
        <span className="label-text">
          Full Name <abbr title="required">*</abbr>
        </span>
        <span className="field">
          <Icon name="user" />
          <input
            name="name"
            value={form.name}
            onChange={update}
            autoComplete="name"
            maxLength={80}
            placeholder="Enter your full name"
            aria-invalid={!!errors.name}
          />
        </span>
        {errors.name && <small>{errors.name}</small>}
      </label>
      <label>
        <span className="label-text">
          Mobile Number <abbr title="required">*</abbr>
        </span>
        <span className="field field--phone">
          <span className="phone-prefix">
            <Icon name="phone" /> +91
          </span>
          <input
            name="phone"
            value={form.phone}
            onChange={update}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10 digit mobile number"
            maxLength={14}
            aria-invalid={!!errors.phone}
          />
        </span>
        {errors.phone && <small>{errors.phone}</small>}
      </label>
      <label>
        <span className="label-text">
          Age <abbr title="required">*</abbr>
        </span>
        <span className="field field--age">
          <Icon name="cake" />
          <input
            name="age"
            value={form.age}
            onChange={update}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Your age"
            maxLength={3}
            aria-invalid={!!errors.age}
          />
          <span className="field-suffix">years</span>
        </span>
        {errors.age && <small>{errors.age}</small>}
      </label>
      {status === 'error' && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <button className="btn btn-maroon btn-block" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Registering…' : 'Get My Free Pass'}
        {status !== 'sending' && <Icon name="arrow" />}
      </button>
    </form>
  )
}

// ---- Hero: everything that matters, form included ----
function Hero({ onRegistered }) {
  const { done, ended, lead, parts } = useCountdown(EVENT.start)
  return (
    <section className="hero dark">
      <img className="hero-photo" src={heroPhoto} alt="" fetchpriority="high" />
      <div className="hero-shade" />
      <Mandala className="hero-mandala" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="overline">One Night · Two Vibes</p>
          <BrandTitle />
          <p className="vibes-line">
            <span>
              <Icon name="music" /> Bhajan Clubbing
            </span>
            <span className="vibes-plus" aria-hidden="true">
              +
            </span>
            <span>
              <Icon name="sticks" /> Dandiya Raas
            </span>
          </p>

          <dl className="info-row">
            <div>
              <Icon name="calendar" />
              <dt>{EVENT.dateShort}</dt>
              <dd>{EVENT.dayName}</dd>
            </div>
            <div>
              <Icon name="clock" />
              <dt>{EVENT.timeLabel}</dt>
              <dd>Onwards</dd>
            </div>
            <div>
              <Icon name="pin" />
              <dt>{EVENT.venue}</dt>
              <dd>{EVENT.address}</dd>
            </div>
          </dl>
        </div>

        <div className="hero-form">
          <RegisterCard onRegistered={onRegistered} />
        </div>

        <div className="hero-fomo" aria-live="off">
          {done ? (
            <p className="fomo-live">
              {ended ? "That's a wrap — thank you for celebrating with us!" : 'The celebration is LIVE — come now!'}
            </p>
          ) : (
            <>
              <p className="fomo-title">
                Don't watch it on <em>someone else's</em> story.
              </p>
              <p className="fomo-lead">
                <span>One night only · No pass, no entry</span>
                <span>{lead}</span>
              </p>
              <div className="countdown">
                {parts.map(([label, value]) => (
                  <div key={label} className="countdown-cell">
                    <span className="countdown-num">{pad(value)}</span>
                    <span className="countdown-label">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <BrushEdge className="hero-edge" variant={0} />
    </section>
  )
}

// ---- Two vibes: equal billing for both halves of the night ----
function Vibes() {
  return (
    <section className="vibes parchment">
      <div className="container">
        <h2 className="vibes-title">
          One night. <em>Two vibes.</em>
        </h2>
        <p className="vibes-sub">Come for the bhajans, stay for the dandiya — or the other way round.</p>
        <div className="vibes-grid">
          {VIBES.map((v) => (
            <article className={`vibe vibe--${v.id}`} key={v.id}>
              <img src={v.photo} alt="" loading="lazy" />
              <div className="vibe-body">
                <p className="vibe-name">
                  <Icon name={v.icon} /> {v.name}
                </p>
                <h3>{v.hook}</h3>
                <p>{v.text}</p>
              </div>
            </article>
          ))}
        </div>
        <a href="#register" className="btn btn-maroon btn-lg vibes-cta">
          Get My Free Pass <Icon name="arrow" />
        </a>
      </div>
    </section>
  )
}

// ---- Venue ----
function Venue() {
  return (
    <section className="section venue parchment">
      <Mandala className="venue-mandala" />
      <div className="container narrow">
        <div className="venue-card">
          <h2 className="venue-title">{EVENT.venue}</h2>
          <p className="venue-address">{EVENT.address}</p>
          <dl className="venue-facts">
            <div>
              <Icon name="calendar" />
              <dt>Date</dt>
              <dd>
                {EVENT.dateLabel}
                <small>{EVENT.dayName}</small>
              </dd>
            </div>
            <div>
              <Icon name="clock" />
              <dt>Time</dt>
              <dd>
                {EVENT.timeLabel} onwards
                <small>Till 11:00 PM</small>
              </dd>
            </div>
            <div>
              <Icon name="check" />
              <dt>Entry</dt>
              <dd>
                Free with pass
                <small>Show it at the gate</small>
              </dd>
            </div>
          </dl>
          <a className="btn btn-orange" href={EVENT.mapUrl} target="_blank" rel="noreferrer">
            <Icon name="pin" /> Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  )
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="footer dark">
      <BrushEdge className="footer-edge" variant={1} flip />
      <div className="container footer-inner">
        <p className="footer-brand">Bhajan Clubbing</p>
        <p className="footer-sub">Dandiya Edition</p>
        <p className="footer-meta">
          {EVENT.dateLabel} · {EVENT.timeLabel} Onwards · {EVENT.venue}, {EVENT.address}
        </p>
        <p className="fine">Tradition Meets Beats 🙏</p>
      </div>
    </footer>
  )
}

// ---- Sticky pass bar (phones): shows whenever the form is off screen ----
function StickyPassBar() {
  const { done, parts } = useCountdown(EVENT.start)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const form = document.getElementById('register')
    if (!form) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && window.scrollY > 200))
    io.observe(form)
    return () => io.disconnect()
  }, [])

  if (done) return null
  return (
    <div className={`pass-bar ${show ? 'is-visible' : ''}`} aria-hidden={!show}>
      <p>
        <span>Free pass · Gates open in</span>
        <strong>
          {parts[0][1]}d {pad(parts[1][1])}h {pad(parts[2][1])}m
        </strong>
      </p>
      <a href="#register" className="btn btn-orange" tabIndex={show ? 0 : -1}>
        Get Pass
      </a>
    </div>
  )
}

// ---- App root ----
export default function App() {
  const [registration, setRegistration] = useState(null)

  // The thank-you view gets its own history entry so the phone's back button returns to the form.
  useEffect(() => {
    if (window.location.hash === '#thank-you') history.replaceState(null, '', window.location.pathname)
    const onPop = (e) => {
      if (!e.state?.thanks) setRegistration(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const showThanks = (reg) => {
    setRegistration(reg)
    history.pushState({ thanks: true }, '', '#thank-you')
    window.scrollTo(0, 0)
  }

  const backToForm = () => {
    if (history.state?.thanks) history.back()
    else setRegistration(null)
  }

  return (
    <>
      <main>
        {registration ? (
          <ThankYou registration={registration} event={EVENT} onBack={backToForm} />
        ) : (
          <>
            <Hero onRegistered={showThanks} />
            <Vibes />
            <Venue />
          </>
        )}
      </main>
      <Footer />
      {!registration && <StickyPassBar />}
    </>
  )
}
