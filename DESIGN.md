# Design — Festive night poster

Dark maroon/gold poster sections over real garba photography, alternating with warm parchment. Pinned by the user's reference mock; structure follows `../frontend` (no navbar, hero holds the form).

## Page
1. **Hero (dark, photo)**: overline, gold title + dandiya sticks + ribbon, tagline, date/time/venue row, parchment register card, FOMO line + countdown. Desktop: copy left, card right, countdown under copy. Brush-stroke edge into parchment.
2. **Venue (parchment)**: maroon venue card with facts and Maps button.
3. **Footer (dark)**: brand, meta, photo credit. No socials.
4. **Thank-you (parchment)**: maroon check badge, canvas-rendered arch pass (`components/pass.js`) shown as an image, Download Pass (maroon; share sheet on phones) + Invite Friends (orange), one-line "Don't go alone" note. Print CSS still isolates the pass if someone prints.

## Color (tokens in `styles.css :root`)
| Role | Tokens |
|---|---|
| Night | `--night` #16040a, `--night-2` #210811 |
| Maroon | `--maroon` #7a1428, `--maroon-deep` #4a0a17, `--maroon-bright` #9b1d36 |
| Gold | `--gold` #e9b44c, `--gold-light` #ffe39a, `--gold-deep` #a8731c, `--gold-text` gradient (titles only) |
| Fire (CTA) | `--orange` #f07a1a → `--orange-deep` #c8461b |
| Parchment | `--parchment` #f8eedb, `--parchment-2` #efdcb8, `--ink` #2b1308, `--ink-soft` #6e4b33, `--line` #dcc69c, `--red` #a3141c |

## Type
Playfair Display 700/800 (titles, numbers), Cinzel 600/700 (ribbons, tracked caps), Poppins 400–600 (body, UI, uppercase buttons). Gold gradient text is deliberate (reference) and limited to display titles.

## Components
- `.ribbon`: gold notched banner (clip-path), Cinzel caps.
- `BrushEdge` (seeded SVG): joins dark and parchment sections; `currentColor` = parchment.
- `DandiyaStick`, `Mandala` (line, gold at ~13% on parchment / 16% on photo), `Icon` (1.7 stroke; same paths drawn on the pass canvas).
- Buttons: pills, uppercase, tracked. Orange = primary on dark; maroon = primary on parchment; maroon outline = secondary.
- Cards: 18px radius, 1px gold border + soft 6px gold halo ring.

## Motion
Hero photo slow settle (scale 1.08→1), mandala 160s spin, pass drop-in, confetti burst. All off under `prefers-reduced-motion`.
