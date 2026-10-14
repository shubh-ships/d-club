// Draws the guest pass on a canvas. The same image is shown on screen, downloaded, shared and printed.
import { ICON_PATHS } from './Decor.jsx'

export const PASS_W = 1080
export const PASS_H = 1800

const C = {
  maroon: '#7a1428',
  maroonDeep: '#3d0812',
  gold: '#e9b44c',
  goldLight: '#fff0c2',
  goldDeep: '#a8731c',
  cream: '#fdf6e7',
  cream2: '#f1e0bd',
  ink: '#2b1308',
  inkSoft: '#6e4b33',
  red: '#a3141c',
  line: 'rgba(168,115,28,.45)',
}

const DISPLAY = '"Playfair Display", Georgia, serif'
const CAPS = 'Cinzel, Georgia, serif'
const BODY = 'Poppins, sans-serif'

// Pointed (Mughal) arch: two straight sides and two cubic curves meeting at the apex.
function archSegments(x, y, w, h, r) {
  return [
    ['line', [x, y + h], [x, y + r]],
    ['cubic', [x, y + r], [x, y + r * 0.45], [x + w * 0.3, y + r * 0.22], [x + w / 2, y]],
    ['cubic', [x + w / 2, y], [x + w * 0.7, y + r * 0.22], [x + w, y + r * 0.45], [x + w, y + r]],
    ['line', [x + w, y + r], [x + w, y + h]],
  ]
}

function archPath(ctx, x, y, w, h, r) {
  const [, a, b] = archSegments(x, y, w, h, r)
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.bezierCurveTo(...a[2], ...a[3], ...a[4])
  ctx.bezierCurveTo(...b[2], ...b[3], ...b[4])
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

// Evenly spaced points along the arch outline (for the pearl border).
function archPoints(x, y, w, h, r, step) {
  const fine = []
  for (const [kind, ...p] of archSegments(x, y, w, h, r)) {
    for (let i = 0; i <= 60; i++) {
      const t = i / 60
      if (kind === 'line') fine.push([p[0][0] + (p[1][0] - p[0][0]) * t, p[0][1] + (p[1][1] - p[0][1]) * t])
      else {
        const u = 1 - t
        const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
        fine.push([0, 1].map((d) => k[0] * p[0][d] + k[1] * p[1][d] + k[2] * p[2][d] + k[3] * p[3][d]))
      }
    }
  }
  const out = [fine[0]]
  let acc = 0
  for (let i = 1; i < fine.length; i++) {
    acc += Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1])
    if (acc >= step) {
      out.push(fine[i])
      acc = 0
    }
  }
  return out
}

function goldGradient(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  g.addColorStop(0, C.goldLight)
  g.addColorStop(0.45, '#f3c968')
  g.addColorStop(1, C.goldDeep)
  return g
}

function rosette(ctx, cx, cy, r, color, alpha) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (const [count, r1, r2, w, off] of [
    [32, r * 0.7, r * 0.98, r * 0.08, 0],
    [24, r * 0.42, r * 0.68, r * 0.09, 0.5],
    [12, r * 0.12, r * 0.4, r * 0.1, 0],
  ]) {
    for (let i = 0; i < count; i++) {
      ctx.save()
      ctx.rotate((Math.PI * 2 * (i + off)) / count)
      const h = r2 - r1
      ctx.beginPath()
      ctx.moveTo(0, -r1)
      ctx.bezierCurveTo(w, -r1 - h * 0.25, w * 0.55, -r2 + h * 0.2, 0, -r2)
      ctx.bezierCurveTo(-w * 0.55, -r2 + h * 0.2, -w, -r1 - h * 0.25, 0, -r1)
      ctx.stroke()
      ctx.restore()
    }
  }
  for (const rr of [r * 0.1, r * 0.41, r * 0.69, r]) {
    ctx.beginPath()
    ctx.arc(0, 0, rr, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function stick(ctx, x, y, len, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const w = 15
  ctx.beginPath()
  ctx.roundRect(-w / 2, -len / 2, w, len, w / 2)
  ctx.save()
  ctx.clip()
  ctx.fillStyle = '#f4c04e'
  ctx.fillRect(-w, -len, w * 2, len * 2)
  ctx.rotate(-0.55)
  for (let s = -len; s < len; s += 20) {
    ctx.fillStyle = '#b3161f'
    ctx.fillRect(-len, s, len * 2, 7)
    ctx.fillStyle = '#1f6b3a'
    ctx.fillRect(-len, s + 7, len * 2, 3)
  }
  ctx.restore()
  const shade = ctx.createLinearGradient(-w / 2, 0, w / 2, 0)
  shade.addColorStop(0, 'rgba(0,0,0,.35)')
  shade.addColorStop(0.45, 'rgba(255,255,255,.25)')
  shade.addColorStop(1, 'rgba(0,0,0,.45)')
  ctx.fillStyle = shade
  ctx.fill()
  ctx.fillStyle = goldGradient(ctx, -10, 10)
  for (const cy of [-len / 2, len / 2 - 13]) {
    ctx.beginPath()
    ctx.roundRect(-w / 2 - 3, cy, w + 6, 13, 4)
    ctx.fill()
  }
  ctx.strokeStyle = '#d1202a'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  for (const dx of [-9, 0, 9]) {
    ctx.beginPath()
    ctx.moveTo(0, -len / 2)
    ctx.quadraticCurveTo(dx * 0.4, -len / 2 - 10, dx, -len / 2 - 20)
    ctx.stroke()
  }
  ctx.restore()
}

// Gold banner with folded tails tucked behind.
function ribbon(ctx, cx, cy, w, h, text, size) {
  const x = cx - w / 2
  const y = cy - h / 2
  const tail = h * 0.9
  const drop = h * 0.28
  ctx.save()
  for (const side of [-1, 1]) {
    const inner = side < 0 ? x + 18 : x + w - 18
    const outer = side < 0 ? x - tail : x + w + tail
    const notch = outer - side * h * 0.32
    const tg = ctx.createLinearGradient(0, y + drop, 0, y + h + drop)
    tg.addColorStop(0, '#d9a03c')
    tg.addColorStop(1, '#8c5a12')
    ctx.fillStyle = tg
    ctx.beginPath()
    ctx.moveTo(inner, y + drop)
    ctx.lineTo(outer, y + drop)
    ctx.lineTo(notch, y + drop + h / 2)
    ctx.lineTo(outer, y + h + drop)
    ctx.lineTo(inner, y + h + drop)
    ctx.closePath()
    ctx.fill()
    // fold shadow where the tail tucks under the band
    ctx.fillStyle = '#5e3a08'
    ctx.beginPath()
    const edge = side < 0 ? x : x + w
    ctx.moveTo(edge, y + h)
    ctx.lineTo(edge, y + h + drop)
    ctx.lineTo(edge - side * 18, y + h + drop)
    ctx.closePath()
    ctx.fill()
  }
  ctx.shadowColor = 'rgba(30,0,8,.35)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  const g = ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, '#fff0c2')
  g.addColorStop(0.35, '#f2c55f')
  g.addColorStop(1, '#b8822a')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(94,58,8,.45)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(x + 7, y + 7, w - 14, h - 14)
  ctx.fillStyle = C.maroonDeep
  ctx.font = `700 ${size}px ${CAPS}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  spaced(ctx, text, cx, cy + 2, size * 0.16)
  ctx.restore()
}

function diamond(ctx, x, y, r, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// A short gold rule with a diamond in the middle.
function ornamentRule(ctx, cx, y, half, color) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - half, y)
  ctx.lineTo(cx - 16, y)
  ctx.moveTo(cx + 16, y)
  ctx.lineTo(cx + half, y)
  ctx.stroke()
  diamond(ctx, cx, y, 8, color)
  diamond(ctx, cx - half - 8, y, 4, color)
  diamond(ctx, cx + half + 8, y, 4, color)
  ctx.restore()
}

function icon(ctx, name, x, y, size, color) {
  ctx.save()
  ctx.translate(x - size / 2, y - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.strokeStyle = color
  ctx.lineWidth = 1.7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const d of ICON_PATHS[name]) ctx.stroke(new Path2D(d))
  ctx.restore()
}

function fitFont(ctx, text, maxW, weight, size, family, min = 30) {
  let s = size
  ctx.font = `${weight} ${s}px ${family}`
  while (s > min && ctx.measureText(text).width > maxW) {
    s -= 2
    ctx.font = `${weight} ${s}px ${family}`
  }
  return s
}

function spaced(ctx, text, x, y, spacing) {
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${spacing}px`
    ctx.fillText(text, x + spacing / 2, y)
    ctx.letterSpacing = '0px'
  } else ctx.fillText(text, x, y)
}

function spacedWidth(ctx, text, spacing) {
  return ctx.measureText(text).width + ('letterSpacing' in ctx ? spacing * text.length : 0)
}

// Cream ticket with a tear-off perforation; notches are real cut-outs.
function ticket(w, h, perfY) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const t = c.getContext('2d')
  t.beginPath()
  t.roundRect(0, 0, w, h, 26)
  const g = t.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, C.cream)
  g.addColorStop(1, C.cream2)
  t.fillStyle = g
  t.fill()
  t.save()
  t.clip()
  rosette(t, w / 2, perfY * 0.55, 330, C.goldDeep, 0.09)
  t.restore()
  t.strokeStyle = C.gold
  t.lineWidth = 4
  t.beginPath()
  t.roundRect(2, 2, w - 4, h - 4, 25)
  t.stroke()
  t.strokeStyle = C.line
  t.lineWidth = 1.5
  t.beginPath()
  t.roundRect(16, 16, w - 32, h - 32, 16)
  t.stroke()
  // perforation
  t.setLineDash([3, 12])
  t.lineCap = 'round'
  t.lineWidth = 4
  t.strokeStyle = 'rgba(110,75,51,.45)'
  t.beginPath()
  t.moveTo(46, perfY)
  t.lineTo(w - 46, perfY)
  t.stroke()
  t.setLineDash([])
  // notches
  t.globalCompositeOperation = 'destination-out'
  for (const nx of [0, w]) {
    t.beginPath()
    t.arc(nx, perfY, 28, 0, Math.PI * 2)
    t.fill()
  }
  t.globalCompositeOperation = 'source-over'
  t.strokeStyle = C.gold
  t.lineWidth = 3
  for (const [nx, a0, a1] of [
    [0, -Math.PI / 2, Math.PI / 2],
    [w, Math.PI / 2, (Math.PI * 3) / 2],
  ]) {
    t.beginPath()
    t.arc(nx, perfY, 28, a0, a1)
    t.stroke()
  }
  return c
}

export async function renderPass({ name, ticket: ticketNo, event }) {
  await Promise.all(
    [`800 140px ${DISPLAY}`, `700 60px ${DISPLAY}`, `700 40px ${CAPS}`, `600 30px ${CAPS}`, `600 36px ${BODY}`, `400 28px ${BODY}`].map((f) =>
      document.fonts.load(f).catch(() => {})
    )
  )
  const canvas = document.createElement('canvas')
  canvas.width = PASS_W
  canvas.height = PASS_H
  const ctx = canvas.getContext('2d')
  const W = PASS_W
  const H = PASS_H

  // ── Arch frame ──
  const fx = 40
  const fy = 40
  const fw = W - 80
  const fh = H - 80
  const rise = 300
  archPath(ctx, fx, fy, fw, fh, rise)
  const bg = ctx.createLinearGradient(0, fy, 0, fy + fh)
  bg.addColorStop(0, '#93203a')
  bg.addColorStop(0.5, C.maroon)
  bg.addColorStop(1, C.maroonDeep)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.save()
  ctx.clip()
  const glow = ctx.createRadialGradient(W / 2, 470, 30, W / 2, 470, 620)
  glow.addColorStop(0, 'rgba(255,176,70,.32)')
  glow.addColorStop(1, 'rgba(255,176,70,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  rosette(ctx, W / 2, 470, 360, C.gold, 0.16)
  ctx.restore()

  ctx.strokeStyle = C.gold
  ctx.lineWidth = 6
  archPath(ctx, fx, fy, fw, fh, rise)
  ctx.stroke()
  ctx.lineWidth = 1.5
  archPath(ctx, fx + 16, fy + 20, fw - 32, fh - 36, rise - 8)
  ctx.stroke()
  // pearl string just inside the frame
  for (const [i, [px, py]] of archPoints(fx + 30, fy + 38, fw - 60, fh - 68, rise - 18, 24).entries()) {
    ctx.beginPath()
    ctx.arc(px, py, i % 2 ? 2.4 : 4, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? 'rgba(255,240,194,.7)' : C.gold
    ctx.fill()
  }

  // ── Emblem + title ──
  stick(ctx, W / 2, 236, 160, -0.5)
  stick(ctx, W / 2, 236, 160, 0.5)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(30,0,5,.55)'
  ctx.shadowOffsetY = 6
  ctx.shadowBlur = 16
  ctx.fillStyle = goldGradient(ctx, 320, 580)
  ctx.font = `800 140px ${DISPLAY}`
  ctx.fillText('Bhajan', W / 2, 440)
  ctx.fillText('Clubbing', W / 2, 575)
  ctx.shadowColor = 'transparent'

  ribbon(ctx, W / 2, 655, 460, 64, event.subtitle.toUpperCase(), 32)

  // both halves of the night
  ctx.font = `700 28px ${CAPS}`
  ctx.fillStyle = C.goldLight
  const left = 'BHAJAN CLUBBING'
  const right = 'DANDIYA RAAS'
  const sp = 4
  const gap = 46
  const lw = spacedWidth(ctx, left, sp)
  const rw = spacedWidth(ctx, right, sp)
  const startX = W / 2 - (lw + gap + rw) / 2
  ctx.textAlign = 'left'
  spaced(ctx, left, startX, 760, sp)
  spaced(ctx, right, startX + lw + gap, 760, sp)
  diamond(ctx, startX + lw + gap / 2, 750, 8, C.gold)

  // ── Ticket ──
  const tx = 110
  const ty = 830
  const tw = W - 220
  const th = 770
  const perf = 350
  ctx.save()
  ctx.shadowColor = 'rgba(20,0,6,.45)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 14
  ctx.drawImage(ticket(tw, th, perf), tx, ty)
  ctx.restore()

  ribbon(ctx, W / 2, ty + 2, 400, 70, 'GUEST PASS', 36)

  ctx.textAlign = 'center'
  ctx.fillStyle = C.inkSoft
  ctx.font = `600 22px ${CAPS}`
  spaced(ctx, 'ADMIT ONE', W / 2, ty + 98, 6)
  ctx.fillStyle = C.ink
  const ns = fitFont(ctx, name, tw - 140, 700, 66, DISPLAY)
  ctx.font = `700 ${ns}px ${DISPLAY}`
  ctx.fillText(name, W / 2, ty + 172)
  ornamentRule(ctx, W / 2, ty + 210, 150, C.gold)

  // ticket no. | entry
  const colL = tx + tw * 0.3
  const colR = tx + tw * 0.7
  ctx.fillStyle = C.inkSoft
  ctx.font = `600 22px ${CAPS}`
  spaced(ctx, 'TICKET NO.', colL, ty + 262, 5)
  spaced(ctx, 'ENTRY', colR, ty + 262, 5)
  ctx.fillStyle = C.red
  ctx.font = `800 58px ${DISPLAY}`
  ctx.fillText(ticketNo, colL, ty + 322)
  ctx.fillText('FREE', colR, ty + 322)
  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2, ty + 238)
  ctx.lineTo(W / 2, ty + 330)
  ctx.stroke()

  // stub: date | time, then venue
  const sy = ty + perf
  for (const [ic, a, b, cx] of [
    ['calendar', event.dateLabel, event.dayName, colL],
    ['clock', event.timeLabel, 'Onwards', colR],
  ]) {
    icon(ctx, ic, cx, sy + 68, 44, C.red)
    ctx.fillStyle = C.ink
    ctx.font = `600 34px ${BODY}`
    ctx.fillText(a, cx, sy + 140)
    ctx.fillStyle = C.inkSoft
    ctx.font = `400 26px ${BODY}`
    ctx.fillText(b, cx, sy + 178)
  }
  ctx.strokeStyle = C.line
  ctx.beginPath()
  ctx.moveTo(W / 2, sy + 44)
  ctx.lineTo(W / 2, sy + 186)
  ctx.moveTo(tx + 70, sy + 222)
  ctx.lineTo(tx + tw - 70, sy + 222)
  ctx.stroke()
  icon(ctx, 'pin', W / 2, sy + 272, 44, C.red)
  ctx.fillStyle = C.ink
  ctx.font = `600 34px ${BODY}`
  ctx.fillText(event.venue, W / 2, sy + 340)
  ctx.fillStyle = C.inkSoft
  ctx.font = `400 26px ${BODY}`
  ctx.fillText(event.address, W / 2, sy + 378)

  // ── Send-off ──
  ctx.fillStyle = 'rgba(255,240,210,.85)'
  ctx.font = `600 22px ${CAPS}`
  spaced(ctx, 'SHOW THIS PASS AT THE ENTRY GATE', W / 2, H - 140, 5)
  ornamentRule(ctx, W / 2, H - 116, 120, C.gold)
  ctx.fillStyle = C.gold
  ctx.font = `700 30px ${CAPS}`
  spaced(ctx, `${event.name.toUpperCase()} · ${event.subtitle.toUpperCase()}`, W / 2, H - 76, 4)

  return canvas
}
