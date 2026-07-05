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

Implemented in `supabase/migrations/20260705072542_initial_schema.sql`:

- `properties` — id, name, address, created_at. One row per aparthotel.
- `property_staff` *(new — not in original spec)* — id, property_id, user_id (→ `auth.users`), role (`owner`/`staff`), created_at. Join table driving all RLS scoping; added so policies check membership rows instead of a hardcoded property id.
- `rooms` — id (uuid, also doubles as the unguessable public guidebook link token), property_id, label, wifi_ssid, wifi_password, checkout_time, house_rules, map_url, created_at, updated_at.
- `guests` — id, property_id (denormalized for RLS), room_id, name, phone, check_in_date, check_out_date, language (`en`/`ru`/`ka`), source_channel (`booking_com`/`airbnb`/`home_ge`/`myhome_ge`/`ss_ge`/`direct`/`walk_in`), status (`upcoming`/`checked_in`/`checked_out`), created_at, updated_at.
- `message_templates` — id, property_id, stage (`welcome`/`pre_arrival`/`checkin_day`/`checkout`/`review_request`), language, content, created_at, updated_at.
- `message_log` — id, property_id, guest_id, template_id (nullable, `on delete set null`), sent_by (→ `auth.users`), sent_at. Append-only: insert/select policies only, no update/delete for any role (see decisions log).

Enum-like fields (`language`, `source_channel`, `status`, `stage`) use `text` + `CHECK` constraints rather than Postgres `enum` types — cheaper to loosen later (`ALTER TABLE ... DROP/ADD CONSTRAINT`) than `ALTER TYPE`.

## Security architecture

Two distinct access zones:

1. **Authenticated zone** — dashboard, add/edit guest, template editor, room settings. Requires login. Every table has RLS enabled with no public policies; access is staff-only via the `is_staff_of(property_id)` SQL helper (`SECURITY DEFINER`, reused by every table's policies so new tables just call the same helper). `is_staff_of` checks `property_staff` membership for `auth.uid()`.
2. **Public zone** — guest-facing guidebook page, one per room, no login. There is **no public RLS policy on any table** — `rooms` (which holds WiFi/house rules/checkout time) is fully locked. The only public surface is `get_room_guidebook(room_id uuid)`, a `SECURITY DEFINER` function granted `EXECUTE` to `anon`, returning just the guidebook-safe columns for one room. This makes the split structural rather than UI-hidden: new columns added to `rooms` later are private by default and only become guest-visible if deliberately added to that function's return list. `get_room_guidebook` is not gated by guest stay dates (see decisions log) — it's evergreen per-room content, not guest-specific.

**Bootstrapping a new property:** every insert (including into `property_staff`) requires the inserter to already be staff, so the first property row and first `property_staff` row must be created manually via the Supabase SQL editor (runs as `postgres`, bypasses RLS) or the service-role key — a deliberate one-time step per property, not an in-app flow. No signup/invite UI is built.

Guest names/phone numbers are real PII from real bookings: no PII logging to console/analytics, no secrets committed, `.env.local` gitignored from commit one.

## Decisions log

- 2026-07-05: Project initialized. Using plain `wa.me` deep links for WhatsApp (no Business API/bot/template approval). No OTA API booking import (none of the channels grant small-property API access) — front desk manual entry is the only intake path, by design.
- 2026-07-05: Schema/RLS design decisions (see `supabase/migrations/20260705072542_initial_schema.sql`): (a) `message_log` is append-only — insert/select policies only, no update/delete for any role, because it's the audit trail behind "messages sent"/"time saved" stats and a mutable log isn't an audit trail; a mis-logged send gets a corrective new row, not an edit. (b) `property_staff` (and every other insert) requires the inserter to already be staff, so the first staff row for a new property can't come through the app — it's inserted once, manually, via the Supabase SQL editor (runs as `postgres`, bypasses RLS) or the service-role key, as a deliberate one-time bootstrap step, not a gap. No signup/invite flow is built. (c) `get_room_guidebook(room_id)` returns content indefinitely, not gated by any guest's stay dates — the guidebook describes the room (WiFi, house rules, checkout time, map), not a specific guest, carries no guest PII, and every future guest of that room needs the same content, so date-gating would add complexity without reducing real exposure. Revisit this if guest-specific content is ever added to the guidebook.
- 2026-07-05: Bootstrapped the first real property (ORBI City) and its first staff row via `supabase db query --linked` (not the app, not a tracked migration — one-time data, see "Manual setup" section below). Assigned role `owner` rather than `staff` since this person holds the account and is the sole staff member; the two roles behave identically under `is_staff_of()` today but the distinction is preserved for when hired staff are added later.
- 2026-07-05: Step 1 complete. GitHub repo: [donluka-23/guest-ops-app](https://github.com/donluka-23/guest-ops-app) (branch `main`). Supabase project connected (URL/anon key in `.env.local`, gitignored; `.env.local.example` documents the required vars — note `.gitignore` uses `.env*` with a `!.env*.example` exception, so new example files must follow that naming). Vercel import deferred — user will connect the GitHub repo via the Vercel dashboard themselves when ready (not yet done as of this entry).

## Manual setup: bootstrapping a new property

Every insert policy (including on `property_staff`) requires the inserter to already be staff of that property, so the first property + first staff row cannot be created through the app. Process (one-time, per property, done via `supabase db query --linked`, which runs as `postgres` and bypasses RLS — equivalent to using the Supabase SQL editor):

```sql
with new_property as (
  insert into public.properties (name, address)
  values ('<name>', '<address>')
  returning id
)
insert into public.property_staff (property_id, user_id, role)
select id, '<auth.users UID>'::uuid, 'owner'
from new_property;
```

Use role `'owner'` for the person who holds the account and is the first/primary staff member (see decisions log for why `owner` vs `staff` matters later even though both pass `is_staff_of()` identically today). Adding a second staff member later is just `insert into property_staff (property_id, user_id, role) values (...)` with the existing property's id and role `'staff'`.

**ORBI City bootstrap (done 2026-07-05):** `properties.id = 501e3495-aa15-40f2-b60e-08f071cb22bc`, name "ORBI City", address "Khimshiashvili 9a, Batumi". `property_staff` row links `user_id = 35cbb6f1-5a59-4f1b-a5ca-c3013ffa22a8` with role `owner`. Confirmed via a join query before proceeding to step 3.

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
