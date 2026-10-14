# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Young people in Delhi (Gen-Z, college-age) who hear about the event through WhatsApp/Instagram shares and open the link on their phones. Their job: decide in seconds whether it's worth going, then grab a free pass.

## Product Purpose
Single-page registration site for **Bhajan Clubbing — Dandiya Edition** (21 Oct 2026, 5:30 PM onwards, Ramlila Ground, Sector 1, R.K. Puram, Delhi). Visitors register name, mobile and age for a free entry pass (stored in Supabase), get an on-screen guest pass to download, and are nudged to invite friends. Success = registrations and shares.

## Positioning
A fusion night: devotional bhajans remixed with club beats, plus dandiya raas — tradition that turns the volume up. Not a parents' dandiya night, not a generic club night.

## Capabilities and Constraints
- React 18 + Vite, single-file build (vite-plugin-singlefile): JS, CSS, self-hosted fonts (assets/fonts, OFL) and photos are all inlined, so a visit is one request to Vercel. Keep new assets small; they ship inside index.html. Deployed on Vercel.
- Registration via Supabase (`supabase.js`): name, mobile, age (5–100). Schema in `supabase/schema.sql`. Duplicate numbers shown as "already registered".
- Thank-you view: on-screen guest pass with two actions only — Download Pass and Invite Friends (Web Share / WhatsApp).
- No navbar (matches frontend/). The Wowsly URL stays in `EVENT.wowslyUrl` but is not linked on the page.
- No social media accounts exist; do not add social links.
- Bhajan Clubbing and Dandiya Raas get equal billing ("One night. Two vibes.").
- FOMO/conversion: escalating countdown, "Don't watch it on someone else's story", sticky mobile pass bar, live registration counter (RPC `registration_count`, shown only at 50+), Invite Friends shares the pass image.
- Map link: https://maps.app.goo.gl/wuFRFftdA895KVMt6 (Ramleela Ground, Sector 1, R.K. Puram).

## Brand Commitments
- Visual direction is pinned by the user's reference mock (2026-10-14): dark maroon/black + gold over festive night photography, alternating with cream parchment; gold Playfair title with striped dandiya sticks and a gold "Dandiya Edition" ribbon; arch-framed guest pass with Download and Print.
- Page structure follows the sibling `frontend/` project: no navbar, one hero holding title + details + form + countdown, then a venue card and footer.

## Evidence on Hand
- Photos (footer credit removed at owner request 2026-10-14; CC BY / BY-SA photos legally need attribution — replace with own or CC0 photos): "Garba night" by Archi465, CC BY-SA 4.0 (hero); "Concert Show" by Nainoa Shizuru, CC0 (Bhajan Clubbing panel); "Gujarat Fairs & Festivals" by Milan1969, CC BY 4.0 (Dandiya panel).
- No logo, artist names, sponsors, capacity limit or registration counts supplied. Do not invent performers, sponsors, attendance numbers, scarcity, or testimonials; FOMO uses only the real date, countdown, and "free but pass required".

## Product Principles
- The offer (free pass, date, place) is readable within one glance on a phone.
- Register first, everything else second.
- Feels like Navratri itself — festive and Gujarati-rooted — while reading young and loud.
- Every share should look good: the pass is the souvenir.
