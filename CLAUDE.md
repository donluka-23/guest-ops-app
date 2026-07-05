# Aparthotel Guest Communication Tool

## Project summary

A guest-communication and operations tool for a small aparthotel (10+ rooms) in Batumi, Georgia. The property takes bookings from multiple channels (Booking.com, Airbnb, home.ge, myhome.ge, ss.ge, direct/Instagram, walk-ins) and currently coordinates every guest by hand over WhatsApp — WiFi codes, checkout times, house rules, directions, review requests, typed out repeatedly per guest. This tool removes the repetition without replacing human contact. Front desk enters each guest once (30–60 sec); that unlocks one-click WhatsApp messages at each stage of the stay and a per-room digital guidebook page guests open via a link (no login). Staff get a "Today" dashboard: arrivals/departures, one-click send, messages-sent/time-saved stats. This is a real pilot for one real property, not a demo — treated as production software (real DB, real auth, real security boundaries) but intentionally scoped to a single property.

## Tech stack (final — do not re-litigate)

- **Frontend:** Next.js (App Router) + TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui — mobile-first (staff mostly use phones)
- **Database + auth + storage:** Supabase (hosted Postgres, RLS, auth)
- **Hosting:** Vercel, deployed from GitHub `main`
- **Version control:** GitHub, incremental commits per feature

## Data model (update this section whenever schema changes — schema, not aspiration)

Not yet implemented. Planned (per project spec):

- `properties` — one row per aparthotel
- `rooms` — belongs to a property; room number, WiFi credentials, checkout time, house rules notes (guidebook content source)
- `guests` — belongs to a room; name, phone, check-in date, check-out date, language, source channel (`booking_com` / `airbnb` / `home_ge` / `myhome_ge` / `ss_ge` / `direct` / `walk_in`), status
- `message_templates` — belongs to a property; stage (`welcome` / `pre_arrival` / `checkin_day` / `checkout` / `review_request`), language, content — editable by host
- `message_log` — one row per send; guest id, template used, timestamp, sent-by user — audit trail and real source for "time saved" / "messages sent" stats (never fake these client-side)

## Security architecture

Two distinct access zones:

1. **Authenticated zone** — dashboard, add/edit guest, template editor, room settings. Requires login. Protected by Supabase row-level security scoped to the property.
2. **Public zone** — guest-facing guidebook page, one per room. No login, but must not leak other guests'/properties' data. RLS policies and route structure must structurally enforce this separation, not just hide it in the UI.

Guest names/phone numbers are real PII from real bookings: no PII logging to console/analytics, no secrets committed, `.env.local` gitignored from commit one.

## Decisions log

- 2026-07-05: Project initialized. Using plain `wa.me` deep links for WhatsApp (no Business API/bot/template approval). No OTA API booking import (none of the channels grant small-property API access) — front desk manual entry is the only intake path, by design.
- 2026-07-05: Step 1 complete. GitHub repo: [donluka-23/guest-ops-app](https://github.com/donluka-23/guest-ops-app) (branch `main`). Supabase project connected (URL/anon key in `.env.local`, gitignored; `.env.local.example` documents the required vars — note `.gitignore` uses `.env*` with a `!.env*.example` exception, so new example files must follow that naming). Vercel import deferred — user will connect the GitHub repo via the Vercel dashboard themselves when ready (not yet done as of this entry).

## Explicitly out of scope (do not build, do not scaffold placeholders for)

- WhatsApp Business API / Meta app verification / bot / per-message billing
- Automatic booking imports from any OTA
- Multi-property / multi-tenant admin, billing, or subscription logic
- Automated test suite beyond basic sanity checks (manual QA checklist instead)
- Any AI chatbot or auto-reply to guests

## File/folder structure conventions

- Scaffolded with `create-next-app@latest`: TypeScript, Tailwind, App Router, `src/` dir, `@/*` import alias, Turbopack (default in this Next version, no flag needed).
- App code lives under `src/app`; shared UI/components under `src/components` (shadcn convention); Supabase client helpers under `src/lib/supabase`.

## Next.js version note (IMPORTANT — read before writing routes/middleware/data fetching)

This project uses **Next.js 16.2.10**, which has real breaking changes vs. Next 14/15 (what most training data assumes). Key differences to follow:

- **No `middleware.ts`.** Use `proxy.ts` at the project root (or `src/`) exporting `proxy()`. Runs Node runtime only (no Edge). Used for Supabase session refresh (`@supabase/ssr`) and optimistic auth redirects — never as the sole auth gate; always re-verify in Server Components/Actions.
- **`params` and `searchParams` are always async** (`Promise<...>`) in pages, layouts, route handlers, and metadata/image functions — no sync fallback exists anymore. Always `await` them.
- **`fetch()` and Route Handlers are uncached by default.** No implicit full-route caching. Opt into caching explicitly (`use cache` directive) only if actually needed — default (uncached) is almost certainly correct for this app's dashboard/guest data.
- Turbopack is the default bundler already; don't add webpack config.
- `next lint` is removed — lint via the `eslint` CLI script already wired in `package.json`.

## Build order status

1. Project scaffold — done
2. DB schema + RLS — not started
3. Auth — not started
4. Add/edit guest flow — not started
5. Today dashboard + WhatsApp send — not started
6. Public guidebook page — not started
7. Styling/empty-state pass — not started
8. Deploy + pilot walkthrough — not started
