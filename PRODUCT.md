# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Young people in Delhi (Gen-Z, college-age) who hear about the event through WhatsApp/Instagram shares and open the link on their phones. Their job: decide in seconds whether it's worth going, then grab a free pass.

## Product Purpose
Single-page registration site for **Bhajan Clubbing — Dandiya Edition** (21 Oct 2026, 5:30 PM onwards, Ramleela Ground, Sector 1, R.K. Puram, Delhi). Visitors register name, mobile and age for a free entry pass (stored in Supabase), get an on-screen guest pass to download, and are nudged to invite friends. Success = registrations and shares.

## Positioning
A fusion night: devotional bhajans remixed with club beats, plus dandiya raas — tradition that turns the volume up. Not a parents' dandiya night, not a generic club night.

## Capabilities and Constraints
- React 18 + Vite, single-file build (vite-plugin-singlefile): JS, CSS, self-hosted fonts (assets/fonts, OFL) and photos are all inlined, so a visit is one request to Vercel. Keep new assets small; they ship inside index.html. Deployed on Vercel.
- Registration via Supabase (`supabase.js`): name, mobile, age (5–100), 6-digit PIN code. Schema in `supabase/schema.sql`. Duplicate numbers shown as "already registered".
- Thank-you view: on-screen guest pass with two actions only — Download Pass and Invite Friends (Web Share / WhatsApp).
- No navbar (matches frontend/). The Wowsly URL stays in `EVENT.wowslyUrl` but is not linked on the page.
- No social media accounts exist; do not add social links.
- Bhajan Clubbing and Dandiya Night get equal billing ("One Night, Two Vibes").
- Page order: hero (artists in top corners, title, details, countdown) → form → lineup → One Night Two Vibes → food stalls → footer (map link, "Organized by").
- Food stalls will be available at the venue; complimentary dandiya sticks are given at the venue (thank-you page).
- Pass downloads as a ~275 KB JPEG; in-app browsers get a full-screen long-press save view.
- FOMO/conversion: escalating countdown, "Don't watch it on someone else's story", sticky mobile pass bar, live registration counter (RPC `registration_count`, shown only at 50+), Invite Friends shares the pass image.
- Hidden admin dashboard at /admin (public/admin.html, not linked, noindex): username/password from server env (ADMIN_USERNAME / ADMIN_PASSWORD) checked by the Vercel function api/registrations.js, which reads Supabase with SUPABASE_SERVICE_ROLE_KEY. Lists registrations with search, PIN, age and date filters, and CSV export. Secrets never use the VITE_ prefix.
- Map link: https://maps.app.goo.gl/wuFRFftdA895KVMt6 (Ramleela Ground, Sector 1, R.K. Puram).

## Brand Commitments
- The official event poster (supplied 2026-10-15) is the visual reference: warm maroon night, gold Cinzel capitals "BHAJAN CLUBBING", orange brush-script "Dandiya Edition" (Allura), Cormorant italic tagline, lotus dividers, marigold garlands and brass lanterns, the dancing crowd. Page imagery is cropped from the poster (`assets/poster/`).
- Copy from the poster: "You're invited to", "Dandiya · Music · Friends · Good Vibes", "An evening where tradition meets the dance floor, for a night of bhajans, beats, and dandiya.", "Free Entry · Registration Required".
- Lineup: DJ Beat Crush (instagram.com/beatcrushmusic); live: Palak Oberoi (instagram.com/palakoberoilive) — replaced Malhotra Sisters on 2026-10-16.
- Host (from poster): Rama Krishna Puram Ramleela Dharmic Samiti. Venue spelled "Ramleela Ground".
- Page structure follows the sibling `frontend/` project: no navbar, one hero holding title + details + form + countdown, then a venue card and footer.

## Evidence on Hand
- Artist photos supplied by the owner (BeatCrush, Palak Oberoi); hero imagery cropped from the owner's poster. Section photos (club night, dandiya night, street food) are CC0 — no attribution needed.
- No capacity limit supplied. Owner chose (2026-10-16, after being told it is misleading) a clock-based "passes left" counter that is not tied to real registrations (`SCARCITY` in App.jsx). Do not invent sponsors, attendance numbers or testimonials beyond that.

## Product Principles
- The offer (free pass, date, place) is readable within one glance on a phone.
- Register first, everything else second.
- Feels like Navratri itself — festive and Gujarati-rooted — while reading young and loud.
- Every share should look good: the pass is the souvenir.
