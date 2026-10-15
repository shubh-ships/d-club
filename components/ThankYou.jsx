import { useEffect, useRef, useState } from 'react'
import { Icon, Mandala } from './Decor.jsx'
import { PASS_H, PASS_W, renderPass } from './pass.js'

const CONFETTI_COLORS = ['#e9b44c', '#f07a1a', '#ffe39a', '#a3141c', '#7a1428', '#fff4e0', '#1f6b3a']

// Lightweight canvas confetti — one burst, ~4s, no library.
function Confetti() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    addEventListener('resize', resize)

    const count = innerWidth < 640 ? 110 : 180
    const pieces = Array.from({ length: count }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: innerHeight * 0.22,
      vx: (Math.random() - 0.5) * (innerWidth < 640 ? 9 : 16),
      vy: -Math.random() * 14 - 4,
      size: Math.random() * 7 + 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      round: Math.random() < 0.3,
    }))

    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = now - start
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      ctx.globalAlpha = t > 3000 ? Math.max(0, 1 - (t - 3000) / 1200) : 1
      for (const p of pieces) {
        p.vy += 0.32
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.round) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        }
        ctx.restore()
      }
      if (t < 4200) frame = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, innerWidth, innerHeight)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}

// In-app browsers (Instagram, Facebook, Snapchat, LinkedIn, Line, iOS app web views) silently ignore
// file downloads, so there we show the pass full-screen with a long-press hint instead.
const UA = navigator.userAgent
const IOS = /iPhone|iPad|iPod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const IN_APP_BROWSER =
  /Instagram|FBAN|FBAV|FB_IAB|Snapchat|LinkedInApp|Line\/|; wv\)/i.test(UA) || (IOS && !/Safari\//.test(UA))

export default function ThankYou({ registration, event, lineup = [], onBack }) {
  const headingRef = useRef(null)
  const { name, duplicate } = registration
  const firstName = name.split(' ')[0]
  const [ticket] = useState(() => `BC-${Math.floor(1000 + Math.random() * 9000)}`)
  const [pass, setPass] = useState(null) // { url: data URL (for <img> and long-press), blob }
  const [saveView, setSaveView] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  // JPEG on a cream ground keeps the pass ~300 KB (a 1.4 MB PNG data URL was too big for mobile
  // Chrome to download). The data URL feeds the <img> so long-press "Save image" always works.
  useEffect(() => {
    let cancelled = false
    renderPass({ name, ticket, event }).then((art) => {
      const canvas = document.createElement('canvas')
      canvas.width = art.width
      canvas.height = art.height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#f8eedb'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(art, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (!cancelled && blob) setPass({ url: canvas.toDataURL('image/jpeg', 0.9), blob })
        },
        'image/jpeg',
        0.9
      )
    })
    return () => {
      cancelled = true
    }
  }, [name, ticket, event])

  const fileName = `bhajan-clubbing-pass-${ticket}.jpg`

  const download = () => {
    if (!pass) return
    if (IN_APP_BROWSER) {
      setSaveView(true)
      return
    }
    const href = URL.createObjectURL(pass.blob)
    const a = document.createElement('a')
    a.href = href
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(href), 60_000)
    setSaved(true)
  }

  // Exact invite copy supplied by the organisers.
  const shareUrl = 'https://dandiaxbhajanclubbing.vercel.app'
  const message = `I just got my FREE pass for Bhajan Clubbing — Dandiya Edition with DJ BeatCrush and Malhotra Sister 🎶🥢 Don't make me go alone — grab yours: ${shareUrl}`

  // Sharing the pass itself (not just a link) is what makes friends want one.
  const invite = async () => {
    if (navigator.share) {
      const file = pass && new File([pass.blob], fileName, { type: 'image/png' })
      const withPass = file && navigator.canShare?.({ files: [file], text: message })
      try {
        await navigator.share(withPass ? { files: [file], text: message } : { text: message })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
  }


  return (
    <section className="thanks parchment">
      <Confetti />
      <Mandala className="thanks-mandala" />

      <div className="container thanks-inner">
        <div className="thanks-check" aria-hidden="true">
          <Icon name="check" />
        </div>
        <h1 className="thanks-title" ref={headingRef} tabIndex={-1}>
          {duplicate ? `You're already in, ${firstName}!` : 'Registration Successful!'}
        </h1>
        <p className="thanks-lead">
          {duplicate
            ? `This number is already registered for ${event.name}. Here's your pass again — download it and show it at the gate.`
            : `You're in, ${firstName}. Your pass is ready — download it and show it at the gate.`}
        </p>

        <figure className="pass">
          {pass ? (
            <img
              src={pass.url}
              width={PASS_W}
              height={PASS_H}
              alt={`Guest pass for ${name}, ticket ${ticket}. ${event.name} ${event.subtitle}, ${event.dateLabel}, ${event.timeLabel} onwards, ${event.venue}, ${event.address}.`}
            />
          ) : (
            <div className="pass-loading" role="status">
              Preparing your pass…
            </div>
          )}
        </figure>

        <div className="pass-actions">
          <button type="button" className="btn btn-maroon" onClick={download} disabled={!pass}>
            <Icon name="download" /> Download Pass
          </button>
          <button type="button" className="btn btn-orange" onClick={invite}>
            <Icon name="share" /> Invite Friends
          </button>
          <a className="btn btn-outline-maroon pass-map" href={event.mapUrl} target="_blank" rel="noreferrer">
            <Icon name="pin" /> Open in Google Maps
          </a>
        </div>
        <p className="save-tip" role="status">
          {saved
            ? IOS
              ? 'Saved to your Files → Downloads. To add it to Photos, long-press the pass above and tap “Save to Photos”.'
              : 'Pass downloaded — check your Downloads or Gallery.'
            : 'Tip: you can also long-press the pass to save it to your photos.'}
        </p>
        <p className="invite-note">
          Don't go alone. Send your pass to the group chat — passes are free, but everyone needs their own.
        </p>

        {lineup.length > 0 && (
          <div className="thanks-lineup">
            <h2>Who's playing</h2>
            <ul>
              {lineup.map((a) => (
                <li key={a.name}>
                  <img src={a.face} alt="" width="160" height="160" />
                  <span className="thanks-act">
                    <span className="thanks-act-role">{a.role}</span>
                    <strong>{a.name}</strong>
                    <a href={`https://instagram.com/${a.insta}`} target="_blank" rel="noopener noreferrer">
                      <Icon name="instagram" /> @{a.insta}
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="know-before">
          <li>
            <span className="know-icon">
              <Icon name="sticks" />
            </span>
            <span>
              <strong>Bring your dandiyas</strong>
              Carry your own pair of dandiya sticks and jump straight into the circles.
            </span>
          </li>
          <li>
            <span className="know-icon">
              <Icon name="food" />
            </span>
            <span>
              <strong>Food stalls at the venue</strong>
              Refuel between rounds — food stalls will be set up at the venue.
            </span>
          </li>
        </ul>

        <p className="thanks-sendoff">Come with your festive spirit and leave with memories that last a lifetime.</p>

        <button type="button" className="thanks-back" onClick={onBack}>
          ← Register someone else
        </button>
      </div>

      {saveView && pass && (
        <div className="save-view" role="dialog" aria-modal="true" aria-label="Save your pass">
          <p className="save-view-hint">
            Long-press the pass and tap <strong>{IOS ? '“Save to Photos”' : '“Download image”'}</strong>
          </p>
          <img src={pass.url} alt={`Guest pass for ${name}, ticket ${ticket}`} />
          <p className="save-view-alt">Or open this page in {IOS ? 'Safari' : 'Chrome'} to download it directly.</p>
          <button type="button" className="btn btn-orange" onClick={() => setSaveView(false)}>
            Done
          </button>
        </div>
      )}
    </section>
  )
}
