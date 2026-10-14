import { useEffect, useState } from 'react'
import ThankYou from './components/ThankYou.jsx'
import { fetchRegistrationCount, registerGuest } from './supabase.js'
import { BrushEdge, DandiyaStick, Icon, Lotus, Mandala, Ornament } from './components/Decor.jsx'
import heroDance from './assets/poster/hero-dance.webp'
import djDecks from './assets/artists/dj-decks.webp'
import djFace from './assets/artists/dj-beat-crush.webp'
import djFaceLarge from './assets/artists/dj-beat-crush-lg.webp'
import sistersPhoto from './assets/artists/malhotra-sisters.webp'
import sistersFace from './assets/artists/malhotra-sisters-face.webp'
import clubPhoto from './assets/vibes/bhajan-kirtan.webp'
import dandiyaPhoto from './assets/vibes/dandiya-night.webp'
// Loaded from Shutterstock at view time (owner's choice) so it adds nothing to the bundle.
const FOOD_PHOTO_URL = 'https://www.shutterstock.com/shutterstock/videos/4067930735/thumb/1.jpg?ip=x480'


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
  venue: 'Ramleela Ground',
  address: 'Sector 1, R.K. Puram, Delhi',
  mapUrl: 'https://maps.app.goo.gl/wuFRFftdA895KVMt6',
  wowslyUrl: 'https://app.wowsly.com/e/3642/bhajan-clubbing-dandiya-edition/',
  organizer: 'Rama Krishna Puram Ramleela Dharmic Samiti',
}

const LINEUP = [
  { role: 'On the decks', name: 'DJ Beat Crush', short: 'DJ Beat Crush', photo: djDecks, portrait: djFaceLarge, face: djFace, insta: 'beatcrushmusic', note: 'Bhajans remixed with club beats, all night long.' },
  { role: 'Performing live', name: 'Malhotra Sisters', short: 'Malhotra Sisters', photo: sistersPhoto, face: sistersFace, insta: 'malhotrasistersofficial', note: 'Live dandiya and garba favourites to keep every circle spinning.' },
]

const VIBES = [
  {
    id: 'bhajan',
    name: 'Bhajan Clubbing',
    icon: 'music',
    photo: clubPhoto,
    hook: 'Bhajans, remixed for the dance floor',
    text: 'Soulful bhajans remixed with electronic beats, with club-grade lighting, sound and stage.',
    tags: ['Live DJ', 'Bhajan remixes', 'Club lights'],
  },
  {
    id: 'dandiya',
    name: 'Dandiya Night',
    icon: 'sticks',
    photo: dandiyaPhoto,
    hook: 'Sticks up. Circles spinning.',
    text: 'Dandiya circles with colourful sticks and festive energy, plus selfie zones to capture every moment.',
    tags: ['Dandiya circles', 'Live music', 'Selfie zones'],
  },
]

// Warm bokeh orbs floating up through the hero: x, size, colour, speed, delay.
const ORBS = [
  ['8%', 14, '255, 190, 90', '9s', '0s'],
  ['18%', 8, '255, 120, 60', '7s', '-3s'],
  ['29%', 20, '255, 90, 150', '11s', '-6s'],
  ['41%', 10, '255, 210, 120', '8s', '-2s'],
  ['55%', 16, '255, 150, 70', '10s', '-7s'],
  ['67%', 9, '255, 100, 160', '7.5s', '-4s'],
  ['78%', 22, '255, 200, 100', '12s', '-1s'],
  ['90%', 11, '255, 130, 80', '8.5s', '-5s'],
].map(([x, size, c, t, d]) => ({ '--x': x, '--s': `${size}px`, '--c': c, '--t': t, '--d': d }))

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

// Scarcity display (owner's choice): a clock-based "passes left" number, identical for every visitor,
// that only ever goes down — from SCARCITY.from at SCARCITY.launch to SCARCITY.to at gate time.
// It is not tied to real registrations; the live Supabase counter below is the real figure.
const SCARCITY = { launch: '2026-10-14T00:00:00+05:30', from: 1200, to: 37, cap: 2000 }

function passesLeftAt(now) {
  const start = new Date(SCARCITY.launch).getTime()
  const end = new Date(EVENT.start).getTime()
  const p = Math.min(1, Math.max(0, (now - start) / (end - start)))
  // eases so it drops faster as the night gets closer
  return Math.round(SCARCITY.to + (SCARCITY.from - SCARCITY.to) * Math.pow(1 - p, 1.4))
}

function usePassesLeft() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20000)
    return () => clearInterval(id)
  }, [])
  const left = passesLeftAt(now)
  return { left, done: now >= new Date(EVENT.start).getTime(), taken: 1 - left / SCARCITY.cap }
}

function PassesLeft({ compact = false }) {
  const { left, done, taken } = usePassesLeft()
  if (done) return null
  return (
    <div className={`passes-left${compact ? ' passes-left--compact' : ''}`} role="status">
      <p>
        <span className="live-dot" aria-hidden="true" />
        Only <strong>{left.toLocaleString('en-IN')}</strong> free passes left
      </p>
      {!compact && (
        <span className="passes-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${taken.toFixed(3)})` }} />
        </span>
      )}
    </div>
  )
}

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

// A static crossed pair of dandiya sticks.
function CrossedDandiyas({ className = '' }) {
  return (
    <span className={`dandiyas ${className}`} aria-hidden="true">
      <DandiyaStick className="dandiyas-stick dandiyas-stick--a" />
      <DandiyaStick className="dandiyas-stick dandiyas-stick--b" />
    </span>
  )
}

// Gold rule with crossed dandiyas in the middle.
function DandiyaRule() {
  return (
    <span className="ornament dandiya-rule" aria-hidden="true">
      <span className="ornament-line" />
      <CrossedDandiyas />
      <span className="ornament-line" />
    </span>
  )
}

// Poster lockup: gold Cinzel capitals with the brush-script edition line.
function BrandTitle() {
  return (
    <h1 className="brand-title">
      <span className="brand-caps">Bhajan</span>
      <span className="brand-caps">Clubbing</span>
      <span className="brand-script">Dandiya Edition</span>
    </h1>
  )
}

// Artist portraits in the hero's top corners (same idea as the guests in frontend/).
function TopArtists() {
  return (
    <div className="top-artists">
      {LINEUP.map((a, i) => (
        <a
          className={`top-artist top-artist--${i ? 'right' : 'left'}`}
          key={a.name}
          href={`https://instagram.com/${a.insta}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${a.name} on Instagram`}
        >
          <img src={a.face} alt="" width="160" height="160" />
          <span className="top-artist-cap">
            <strong>{a.short}</strong>
            <span>{a.role}</span>
          </span>
        </a>
      ))}
    </div>
  )
}

// ---- Lineup section ----
function Lineup() {
  return (
    <section className="section lineup-section parchment" aria-labelledby="lineup-title">
      <Mandala className="lineup-mandala" />
      <div className="container">
        <h2 className="section-head" id="lineup-title">
          The Lineup <em>live on stage</em>
        </h2>
        <ul className="lineup">
          {LINEUP.map((a) => (
            <li className="act" key={a.name}>
              <span className={`act-photo${a.portrait ? ' act-photo--booth' : ''}`}>
                <img src={a.photo} alt={a.portrait ? '' : a.name} loading="lazy" />
                {a.portrait && <img className="act-portrait" src={a.portrait} alt={a.name} loading="lazy" />}
              </span>
              <span className="act-body">
                <span className="act-role">{a.role}</span>
                <strong className="act-name">{a.name}</strong>
                <span className="act-note">{a.note}</span>
                <a className="act-insta" href={`https://instagram.com/${a.insta}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" /> @{a.insta}
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---- Registration form ----
function RegisterCard({ onRegistered }) {
  const count = useRegistrationCount()
  const [form, setForm] = useState({ name: '', phone: '', age: '', pincode: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const update = (e) => {
    const { name } = e.target
    const digits = { age: 3, pincode: 6 }[name]
    const value = digits ? e.target.value.replace(/\D/g, '').slice(0, digits) : e.target.value
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
    const pincode = form.pincode
    if (!/^[1-9]\d{5}$/.test(pincode)) next.pincode = 'Enter a valid 6-digit PIN code'
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('sending')
    try {
      const { duplicate } = await registerGuest({ name, phone, age, pincode })
      setForm({ name: '', phone: '', age: '', pincode: '' })
      setStatus('idle')
      onRegistered({ name, phone, age, pincode, duplicate })
    } catch (err) {
      setMessage(err.message)
      setStatus('error')
    }
  }

  return (
    <form className="register-card form parchment" id="register" onSubmit={submit} noValidate>
      <span className="ribbon card-ribbon">Free Entry Pass</span>
      <CrossedDandiyas className="dandiyas--form" />
      <h2 className="form-title">Grab your free pass</h2>
      <p className="form-sub">Bhajan Clubbing + Dandiya Night · Free entry with a pass</p>
      <PassesLeft />
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
      <div className="form-row">
        <label>
          <span className="label-text">
            Age <abbr title="required">*</abbr>
          </span>
          <span className="field">
            <Icon name="cake" />
            <input
              name="age"
              value={form.age}
              onChange={update}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Age"
              maxLength={3}
              aria-invalid={!!errors.age}
            />
          </span>
          {errors.age && <small>{errors.age}</small>}
        </label>
        <label>
          <span className="label-text">
            PIN Code <abbr title="required">*</abbr>
          </span>
          <span className="field">
            <Icon name="pin" />
            <input
              name="pincode"
              value={form.pincode}
              onChange={update}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="110022"
              maxLength={6}
              aria-invalid={!!errors.pincode}
            />
          </span>
          {errors.pincode && <small>{errors.pincode}</small>}
        </label>
      </div>
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
      <div className="hero-bg" aria-hidden="true">
        <img className="hero-dance" src={heroDance} alt="" fetchpriority="high" />
        <div className="hero-haze" />
        <div className="rig">
          <span className="spot spot--1" />
          <span className="spot spot--2" />
          <span className="spot spot--3" />
          <span className="spot spot--4" />
          <Mandala className="gobo gobo--a" />
          <Mandala className="gobo gobo--b" />
          {ORBS.map((o, i) => (
            <span key={i} className="orb" style={o} />
          ))}
        </div>
      </div>

      <div className="container">
        <TopArtists />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="invite">You're invited to</p>
          <DandiyaRule />
          <BrandTitle />
          <p className="tagline">Dandiya · Music · Friends · Good Vibes</p>
          <p className="hero-italic">An evening where tradition meets the dance floor, for a night of bhajans, beats, and dandiya.</p>
          <Ornament className="hero-ornament" />

          <dl className="info-row">
            <div>
              <Icon name="calendar" />
              <dt>{EVENT.dateLabel}</dt>
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

          <a className="entry-plaque" href="#register">
            <Lotus className="plaque-lotus" />
            <span>
              Free Entry <i aria-hidden="true">·</i> Registration Required
            </span>
            <Lotus className="plaque-lotus" />
          </a>
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
                Don't watch it on <em>someone else's</em> story
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
    <section className="vibes dark" aria-labelledby="vibes-title">
      <BrushEdge className="vibes-edge" variant={1} flip />
      <div className="container">
        <h2 className="section-head section-head--light" id="vibes-title">
          One Night <em>two vibes</em>
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
                <p className="vibe-text">{v.text}</p>
                <ul className="vibe-tags">
                  {v.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <a href="#register" className="btn btn-orange btn-lg vibes-cta">
          Get My Free Pass <Icon name="arrow" />
        </a>
      </div>
      <BrushEdge className="vibes-edge-bottom" variant={2} />
    </section>
  )
}

// Remote food photo; hides itself if the image ever fails to load.
function FoodPhoto() {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <figure className="food-photo">
      <img
        src={FOOD_PHOTO_URL}
        alt="A night food fair with rows of lit stalls and a big crowd"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setOk(false)}
      />
    </figure>
  )
}

// ---- Food stalls ----
function Food() {
  return (
    <section className="section food parchment" aria-labelledby="food-title">
      <div className="container food-grid">
        <FoodPhoto />
        <div className="food-copy">
          <h2 className="section-head section-head--left" id="food-title">
            Food Stalls <em>eat, dance, repeat</em>
          </h2>
          <p className="food-text">
            Hungry between dandiya rounds? Food stalls will be set up at the venue, so you can refuel and get straight
            back into the circle.
          </p>
          <ul className="food-points">
            <li>
              <Icon name="food" /> Food stalls at the venue
            </li>
            <li>
              <Icon name="sticks" /> Bring your own dandiyas
            </li>
            <li>
              <Icon name="pin" /> {EVENT.venue}, {EVENT.address}
            </li>
          </ul>
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
        <a className="btn btn-orange footer-map" href={EVENT.mapUrl} target="_blank" rel="noreferrer">
          <Icon name="pin" /> Open in Google Maps
        </a>
        <p className="fine">Tradition Meets Beats 🙏</p>
        <p className="footer-org">
          <span>Organized by</span>
          <strong>{EVENT.organizer}</strong>
        </p>
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
        <span>
          Only {passesLeftAt(Date.now()).toLocaleString('en-IN')} passes left · Gates open in
        </span>
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
          <ThankYou registration={registration} event={EVENT} lineup={LINEUP} onBack={backToForm} />
        ) : (
          <>
            <Hero onRegistered={showThanks} />
            <Lineup />
            <Vibes />
            <Food />
          </>
        )}
      </main>
      <Footer />
      {!registration && <StickyPassBar />}
    </>
  )
}
