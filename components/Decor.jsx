// Ornaments for Bhajan Clubbing — maroon, gold and parchment. All vector.
import { useId } from 'react'

const ring = (count, render) => Array.from({ length: count }, (_, i) => render((360 / count) * i, i))

const petal = (r1, r2, w) => {
  const h = r2 - r1
  return `M0,${-r1} C${w},${-r1 - h * 0.25} ${w * 0.55},${-r2 + h * 0.2} 0,${-r2} C${-w * 0.55},${-r2 + h * 0.2} ${-w},${-r1 - h * 0.25} 0,${-r1}Z`
}

// Fine line mandala, drawn in currentColor.
export function Mandala({ className = '' }) {
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.5">
        {ring(72, (a) => (
          <circle key={a} cx="0" cy="-97" r="1" transform={`rotate(${a})`} fill="currentColor" stroke="none" />
        ))}
        {ring(24, (a) => (
          <path key={a} d={petal(62, 92, 11)} transform={`rotate(${a + 7.5})`} />
        ))}
        {ring(24, (a) => (
          <path key={a} d={petal(64, 84, 5)} transform={`rotate(${a + 7.5})`} />
        ))}
        <circle r="60" />
        <circle r="56" strokeDasharray="1 2" />
        {ring(16, (a) => (
          <path key={a} d={petal(24, 54, 10)} transform={`rotate(${a})`} />
        ))}
        {ring(16, (a) => (
          <path key={a} d={petal(28, 46, 4)} transform={`rotate(${a + 11.25})`} />
        ))}
        <circle r="22" />
        {ring(8, (a) => (
          <path key={a} d={petal(5, 20, 6)} transform={`rotate(${a})`} />
        ))}
        <circle r="3" fill="currentColor" />
      </g>
    </svg>
  )
}

// Seeded rough brush-stroke edge. `fill` is the colour of the section it bleeds into.
function brushPath(seed, w = 1440, h = 120) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const pts = []
  for (let x = 0; x <= w; x += 18 + rnd() * 26) pts.push([x, 34 + rnd() * 46 + (rnd() < 0.12 ? -rnd() * 28 : 0)])
  pts.push([w, 50])
  let d = `M0,${h} L0,${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i]
    const [px, py] = pts[i - 1]
    d += ` Q${(px + x) / 2 + (rnd() - 0.5) * 8},${(py + y) / 2 + (rnd() - 0.5) * 18} ${x},${y}`
  }
  d += ` L${w},${h} Z`
  // dry-brush streaks and flecks above the edge
  let streaks = ''
  for (let i = 0; i < 14; i++) {
    const x = rnd() * w
    const y = 12 + rnd() * 40
    const len = 40 + rnd() * 160
    streaks += `M${x},${y} q${len / 2},${(rnd() - 0.5) * 6} ${len},${(rnd() - 0.5) * 4} l0,${2 + rnd() * 3} q${-len / 2},${(rnd() - 0.5) * 4} ${-len},0 Z `
  }
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w
    const y = rnd() * 60
    const r = 1 + rnd() * 3.5
    streaks += `M${x - r},${y} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z `
  }
  return { d, streaks }
}

const BRUSHES = [brushPath(7), brushPath(31), brushPath(113)]

export function BrushEdge({ className = '', variant = 0, flip = false }) {
  const { d, streaks } = BRUSHES[variant % BRUSHES.length]
  return (
    <svg
      className={`brush-edge ${className}`}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
    >
      <path d={d} fill="currentColor" />
      <path d={streaks} fill="currentColor" opacity="0.85" />
    </svg>
  )
}

// Line icons (24 grid). The same path data is reused by the pass renderer.
export const ICON_PATHS = {
  calendar: ['M6 5h12a2.5 2.5 0 0 1 2.5 2.5v10.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5V7.5A2.5 2.5 0 0 1 6 5z', 'M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2'],
  clock: ['M12 3.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17z', 'M12 7.5V12l3 2'],
  pin: ['M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z', 'M12 7.6a2.4 2.4 0 1 1 0 4.8a2.4 2.4 0 0 1 0-4.8z'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  user: ['M12 4a4 4 0 1 1 0 8a4 4 0 0 1 0-8z', 'M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5'],
  phone: ['M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5z', 'M11 18.5h2'],
  download: ['M12 3.5v11M7 10l5 5 5-5', 'M4.5 16.5v2.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5'],
  printer: ['M7 8V3.5h10V8', 'M6 17H4.5A1.5 1.5 0 0 1 3 15.5v-6A1.5 1.5 0 0 1 4.5 8h15A1.5 1.5 0 0 1 21 9.5v6a1.5 1.5 0 0 1-1.5 1.5H18', 'M7 13.5h10v7H7z'],
  share: ['M18 3a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5zM6 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5zM18 16a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5z', 'M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  music: ['M9 18V5.5l11-2V16', 'M6.5 15.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5zM17.5 13.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5z'],
  sticks: ['M5 20L17 4M19 20L7 4', 'M15.5 3l3 2.2M8.5 3l-3 2.2'],
  bolt: ['M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z'],
  hands: ['M12 20c-4-2.5-8-5.6-8-10a4 4 0 0 1 8-1.2A4 4 0 0 1 20 10c0 4.4-4 7.5-8 10z'],
  cake: ['M4 20.5h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7z', 'M4 15.5c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0M12 11.5V8M12 4.5c.8.9.8 1.8 0 2.5-.8-.7-.8-1.6 0-2.5z'],
  food: ['M3.5 12.5h17a8.5 8.5 0 0 1-17 0z', 'M8 8.5c0-1.2 1-1.2 1-2.4S8 4.9 8 3.7M12 8.5c0-1.2 1-1.2 1-2.4s-1-1.2-1-2.4M16 8.5c0-1.2 1-1.2 1-2.4s-1-1.2-1-2.4'],
  instagram: ['M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3z', 'M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z', 'M17.2 6.6h.01'],
  hourglass: ['M6.5 3h11M6.5 21h11', 'M7.5 3c0 4.5 4.5 6 4.5 9s-4.5 4.5-4.5 9M16.5 3c0 4.5-4.5 6-4.5 9s4.5 4.5 4.5 9'],
}

export function Icon({ name, className = 'icon' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

// One striped dandiya stick with gold caps and a tassel; rotate with CSS.
export function DandiyaStick({ className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 24 200" aria-hidden="true">
      <defs>
        <pattern id={`${id}-s`} width="24" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
          <rect width="24" height="16" fill="#f4c04e" />
          <rect width="24" height="6" fill="#b3161f" />
          <rect y="6" width="24" height="2" fill="#1f6b3a" />
        </pattern>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" x2="1">
          <stop offset="0" stopColor="#9a6a17" />
          <stop offset="0.5" stopColor="#ffe7a3" />
          <stop offset="1" stopColor="#9a6a17" />
        </linearGradient>
      </defs>
      <rect x="6" y="18" width="12" height="164" rx="6" fill={`url(#${id}-s)`} />
      <rect x="6" y="18" width="12" height="164" rx="6" fill={`url(#${id}-shade)`} />
      <rect x="4.5" y="12" width="15" height="12" rx="3" fill={`url(#${id}-gold)`} />
      <rect x="4.5" y="176" width="15" height="12" rx="3" fill={`url(#${id}-gold)`} />
      <path d="M12 12 C9 6 7 3 5 0 M12 12 C12 6 12 3 12 0 M12 12 C15 6 17 3 19 0" stroke="#d1202a" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// Small lotus, the poster's divider motif.
export function Lotus({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 32 20" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M16 2c3 3.4 3 9.6 0 14-3-4.4-3-10.6 0-14z" />
        <path d="M16 16c-1.6-4.6-5-7.8-9.6-8.6.4 5 4 8.6 9.6 8.6z" />
        <path d="M16 16c1.6-4.6 5-7.8 9.6-8.6-.4 5-4 8.6-9.6 8.6z" />
        <path d="M16 16c-3.6-2.4-8-3-12.4-1.6C6.8 17.6 11.4 18 16 16zM16 16c3.6-2.4 8-3 12.4-1.6-3.2 3.2-7.8 3.6-12.4 1.6z" />
      </g>
    </svg>
  )
}

// Gold rule — lotus — gold rule.
export function Ornament({ className = '' }) {
  return (
    <span className={`ornament ${className}`} aria-hidden="true">
      <span className="ornament-line" />
      <Lotus className="ornament-lotus" />
      <span className="ornament-line" />
    </span>
  )
}
