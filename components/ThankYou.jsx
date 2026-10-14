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

export default function ThankYou({ registration, event, onBack }) {
  const headingRef = useRef(null)
  const { name, duplicate } = registration
  const firstName = name.split(' ')[0]
  const [ticket] = useState(() => `BC-${Math.floor(1000 + Math.random() * 9000)}`)
  const [pass, setPass] = useState(null) // { url, blob }

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    let url
    let cancelled = false
    renderPass({ name, ticket, event }).then((canvas) =>
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return
        url = URL.createObjectURL(blob)
        setPass({ url, blob })
      }, 'image/png')
    )
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [name, ticket, event])

  const fileName = `bhajan-clubbing-pass-${ticket}.png`

  const download = async () => {
    if (!pass) return
    const file = new File([pass.blob], fileName, { type: 'image/png' })
    // On phones the share sheet is how a picture gets saved to the gallery.
    if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My Bhajan Clubbing pass' })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }
    const a = document.createElement('a')
    a.href = pass.url
    a.download = fileName
    a.click()
  }

  const shareText = `I just got my FREE pass for ${event.name} — ${event.subtitle} 🎶🥢 Bhajans remixed with club beats + dandiya raas, ${event.dayName} ${event.dateLabel}, ${event.timeLabel} at ${event.venue}. Don't make me go alone — grab yours:`
  const shareUrl = window.location.origin

  // Sharing the pass itself (not just a link) is what makes friends want one.
  const invite = async () => {
    const message = `${shareText} ${shareUrl}`
    if (navigator.share) {
      const file = pass && new File([pass.blob], fileName, { type: 'image/png' })
      const withPass = file && navigator.canShare?.({ files: [file], text: message })
      try {
        await navigator.share(withPass ? { files: [file], text: message } : { title: `${event.name} — ${event.subtitle}`, text: shareText, url: shareUrl })
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
        </div>
        <p className="invite-note">
          Don't go alone. Send your pass to the group chat — passes are free, but everyone needs their own.
        </p>

        <button type="button" className="thanks-back" onClick={onBack}>
          ← Register someone else
        </button>
      </div>
    </section>
  )
}
