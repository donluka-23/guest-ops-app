# Aparthotel Guest Communication Tool

## Project summary

A guest-communication and operations tool for a small aparthotel (10+ rooms) in Batumi, Georgia. The property takes bookings from multiple channels (Booking.com, Airbnb, home.ge, myhome.ge, ss.ge, direct/Instagram, walk-ins) and currently coordinates every guest by hand over WhatsApp — WiFi codes, checkout times, house rules, directions, review requests, typed out repeatedly per guest. This tool removes the repetition without replacing human contact. Front desk enters each guest once (30–60 sec); that unlocks one-click WhatsApp messages at each stage of the stay and a per-room digital guidebook page guests open via a link (no login). Staff get a "Today" dashboard: arrivals/departures, one-click send, messages-sent/time-saved stats. This is a real pilot for one real property, not a demo — treated as production software (real DB, real auth, real security boundaries) but intentionally scoped to a single property.

## Tech stack (final — do not re-litigate)

- **Frontend:** Next.js (App Router) + TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui — mobile-first (staff mostly use phones)
- **Database + auth + storage:** Supabase (hosted Postgres, RLS, auth)
- **Hosting:** Vercel, deployed from GitHub `main`
- **Version control:** GitHub, incremental commits per feature
- **i18n:** `next-intl` (added step 4.5, host-requested — see "Internationalization" section)

## Data model (update this section whenever schema changes — schema, not aspiration)

Implemented in `supabase/migrations/20260705072542_initial_schema.sql`:

- `properties` — id, name, address, created_at, **default_checkout_time** (`time`, not null, default `12:00` — added in `20260705091753_property_default_checkout_time.sql`). One row per aparthotel.
- `property_staff` *(new — not in original spec)* — id, property_id, user_id (→ `auth.users`), role (`owner`/`staff`), created_at. Join table driving all RLS scoping; added so policies check membership rows instead of a hardcoded property id.
- `rooms` — id (uuid, also doubles as the unguessable public guidebook link token), property_id, label, wifi_ssid, wifi_password, checkout_time, house_rules, map_url, created_at, updated_at. `checkout_time` is nullable and now means "inherit `properties.default_checkout_time`" when null, or an explicit per-room override when set. One real room exists so far (`"ოთახი 1"`, ORBI City, label only — placeholder pending real room data; host-editable now via Settings → Rooms).
- `property_extras` *(new, `20260705102613_property_extras.sql`)* — id, property_id, category (`recommendation`/`taxi`/`offering`), title, description (nullable), contact_info (nullable), price (nullable `text`, e.g. "from 25 GEL"), display_order, created_at, updated_at. Host-managed "Local guide" content — see that section for scope/deferred-guest-exposure notes.
- `guests` — id, property_id (denormalized for RLS), room_id, name, phone, check_in_date, check_out_date, language (`en`/`ru`/`ka`), source_channel (`booking_com`/`airbnb`/`home_ge`/`myhome_ge`/`ss_ge`/`direct`/`walk_in`), status (`upcoming`/`checked_in`/`checked_out`), created_at, updated_at.
- `message_templates` — id, property_id, stage (`welcome`/`pre_arrival`/`checkin_day`/`checkout`/`review_request`), language, content, created_at, updated_at. **15 starter templates seeded for ORBI City** (5 stages × 3 languages) — see "Starter template content" below; host-editable now via Settings → Templates.
- `message_log` — id, property_id, guest_id, template_id (nullable, `on delete set null`), sent_by (→ `auth.users`), sent_at. Append-only: insert/select policies only, no update/delete for any role (see decisions log).

Enum-like fields (`language`, `source_channel`, `status`, `stage`) use `text` + `CHECK` constraints rather than Postgres `enum` types — cheaper to loosen later (`ALTER TABLE ... DROP/ADD CONSTRAINT`) than `ALTER TYPE`.

## Security architecture

Two distinct access zones:

1. **Authenticated zone** — dashboard, add/edit guest, template editor, room settings. Requires login. Every table has RLS enabled with no public policies; access is staff-only via the `is_staff_of(property_id)` SQL helper (`SECURITY DEFINER`, reused by every table's policies so new tables just call the same helper). `is_staff_of` checks `property_staff` membership for `auth.uid()`.

   **Login implementation (step 3):** login-only, no signup UI (staff are bootstrapped manually — see below). Two layers, both required:
   - `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) runs on every request via `src/lib/supabase/middleware.ts`'s `updateSession()`, which calls `supabase.auth.getUser()` — not `getSession()` — so the token is actually validated against Supabase Auth, not just read from an unverified cookie. It redirects unauthenticated requests away from `PROTECTED_PREFIXES` (currently `["/dashboard"]`) to `/login?next=<path>`, and redirects already-authenticated requests away from `/login` to `/dashboard`. Confirmed by direct `curl` request (no cookies) to `/dashboard` returning `307` to `/login` — this blocks direct URL navigation, not just hidden nav links.
   - `src/lib/supabase/dal.ts`'s `verifySession()` is the authoritative, close-to-the-data check, called inside the `/dashboard` page itself (and any future protected Server Component/Action). This exists because proxy is explicitly documented by Next.js as an optimistic first pass — a matcher edit or a Server Action reached from an unprotected path can silently skip it — so every protected page/action must check for itself, not rely on proxy alone.
   - **Session expiry:** `getUser()` on every request transparently refreshes the access token via the refresh token as long as the refresh token is still valid — no re-login prompt, cookie is silently rewritten. Only when the refresh token itself is invalid/expired (or after `signOut()` revokes it) does `getUser()` return no user, and proxy redirects to `/login?next=<path>` so the user returns to where they were after re-authenticating.
   - Full login → dashboard → logout → blocked-again flow tested against the running dev server: verified via server logs that `login()` only redirects (303) on real credential success (a failed `signInWithPassword` returns `{error}` and re-renders instead of redirecting), `logout()` calls `supabase.auth.signOut()` before redirecting, and a `/dashboard` request immediately after logout resolves to `/login` again (proving the cookie was actually invalidated, not just navigated away from).
2. **Public zone** — guest-facing guidebook page, one per room, no login. There is **no public RLS policy on any table** — `rooms` and `property_extras` (which hold WiFi/house rules/checkout time/local recommendations) are fully locked. The only public surface is `get_room_guidebook(room_id uuid)`, a `SECURITY DEFINER` function granted `EXECUTE` to `anon`, returning just the guidebook-safe columns for one room plus a `jsonb` array of that property's `property_extras`. This makes the split structural rather than UI-hidden: new columns added to `rooms` later are private by default and only become guest-visible if deliberately added to that function's return list. `get_room_guidebook` is not gated by guest stay dates (see decisions log) — it's evergreen per-room content, not guest-specific. Built in step 6 — see "Public guidebook page" section for the actual page.

**Add/edit guest flow (step 4):** `src/app/dashboard/guests/actions.ts`'s `createGuest`/`updateGuest` never trust a client-supplied `property_id`. They look up the selected room through the caller's own RLS-scoped Supabase client and derive `property_id` from that room row. This closes a gap that would otherwise exist even with `is_staff_of(property_id)` alone: without this, a staff member of property A could submit `property_id=A` (passes the check) with a `room_id` actually belonging to property B, inserting a guest whose room doesn't match its own property_id. Deriving `property_id` from the room makes that combination impossible to submit in the first place, and RLS still rejects it as a second layer if the room lookup ever returned something it shouldn't.

**Property-isolation test (2026-07-05):** verified directly at the database layer, not just through the UI, using `set local role authenticated; set local request.jwt.claim.sub = '<uid>'` inside a rolled-back transaction to exercise the real RLS policies as our ORBI City staff member (`35cbb6f1-...`), against a throwaway second property/room created and deleted for this test only:

1. `SELECT` on a room belonging to the other (unlinked) property → 0 rows — invisible, so it could never appear in the room dropdown.
2. `INSERT` into `guests` with that other property's `property_id`/`room_id` → rejected: `ERROR 42501: new row violates row-level security policy for table "guests"`.
3. `SELECT` on ORBI City's own room → 1 row (positive control — RLS isn't just blocking everything).
4. `INSERT` into `guests` using ORBI City's own room → succeeded, row returned, then rolled back so no test data persisted.

**Bootstrapping a new property:** every insert (including into `property_staff`) requires the inserter to already be staff, so the first property row and first `property_staff` row must be created manually via the Supabase SQL editor (runs as `postgres`, bypasses RLS) or the service-role key — a deliberate one-time step per property, not an in-app flow. No signup/invite UI is built.

Guest names/phone numbers are real PII from real bookings: no PII logging to console/analytics, no secrets committed, `.env.local` gitignored from commit one.

## Decisions log

- 2026-07-05: Project initialized. Using plain `wa.me` deep links for WhatsApp (no Business API/bot/template approval). No OTA API booking import (none of the channels grant small-property API access) — front desk manual entry is the only intake path, by design.
- 2026-07-05: Schema/RLS design decisions (see `supabase/migrations/20260705072542_initial_schema.sql`): (a) `message_log` is append-only — insert/select policies only, no update/delete for any role, because it's the audit trail behind "messages sent"/"time saved" stats and a mutable log isn't an audit trail; a mis-logged send gets a corrective new row, not an edit. (b) `property_staff` (and every other insert) requires the inserter to already be staff, so the first staff row for a new property can't come through the app — it's inserted once, manually, via the Supabase SQL editor (runs as `postgres`, bypasses RLS) or the service-role key, as a deliberate one-time bootstrap step, not a gap. No signup/invite flow is built. (c) `get_room_guidebook(room_id)` returns content indefinitely, not gated by any guest's stay dates — the guidebook describes the room (WiFi, house rules, checkout time, map), not a specific guest, carries no guest PII, and every future guest of that room needs the same content, so date-gating would add complexity without reducing real exposure. Revisit this if guest-specific content is ever added to the guidebook.
- 2026-07-05: Bootstrapped the first real property (ORBI City) and its first staff row via `supabase db query --linked` (not the app, not a tracked migration — one-time data, see "Manual setup" section below). Assigned role `owner` rather than `staff` since this person holds the account and is the sole staff member; the two roles behave identically under `is_staff_of()` today but the distinction is preserved for when hired staff are added later.
- 2026-07-05: Step 3 (auth) built as login-only, no signup UI — matches the manual-bootstrap staffing model already in place. Two-layer protection (`proxy.ts` optimistic redirect + `verifySession()` DAL check in each protected page) rather than relying on proxy alone, per Next.js's own guidance that a routing/matcher change can silently drop proxy coverage. Tested end-to-end against a running dev server rather than just typechecked. See security architecture section for full detail.
- 2026-07-05: Step 4 (add/edit guest) built with inline field-level validation (hand-rolled, no schema library — the form is small enough not to need one, and Zod isn't in the approved stack). `property_id` is always derived server-side from the selected room, never trusted from client input, closing a room/property-mismatch gap that `is_staff_of(property_id)` alone wouldn't catch. Cross-property isolation verified directly against the database with a real RLS-scoped role/JWT test (not just via the UI) — see security architecture section for the 4-part test and result. Seeded one placeholder room ("Room 1", ORBI City) to unblock testing since no real room data existed yet; needs replacing during the real room-seeding pass.
- 2026-07-05: Step 4.5 (i18n + property settings) inserted ahead of step 5 on host feedback. i18n: `next-intl`, cookie-based locale (not URL-prefixed) — internal tool, no SEO/shareable-link need, avoids doubling every route; default `ka`, fallback `en`. Confirmed via live `pg_policies` check (not assumption) that `rooms` and `message_templates` already had full staff CRUD policies from the step-2 migration — no new RLS needed for the settings screens. Added `properties.default_checkout_time` (new migration) so room-level `checkout_time` can mean "inherit" (null) vs. explicit override. Seeded 15 starter templates for ORBI City focused on non-obvious information (not repeating what's already on the OTA listing) — explicitly host-editable starting points, not final copy. `property_extras` ("Local guide" tab) confirmed as the next increment in this phase but not yet built — guest-facing exposure of it is explicitly deferred to step 6, not implied by the table existing.
- 2026-07-05: Bug-fix pass on settings screens after host testing. Root cause of the "language switching"/"Templates tab stuck in English" reports was `revalidatePath("/")` in `setLocale()` only busting the Router Cache for the literal `/` path, not the whole app (locale is read in the root layout) — already-visited routes kept serving stale cached RSC output in the old language. Fixed with `revalidatePath("/", "layout")`. Verified via a script (not eyeballing) that no translation keys were actually missing in the settings feature; the "confusing string" report was traced to the English placeholder seed value "Room 1", renamed to "ოთახი 1". Added two standing process rules (identity-field lock; i18n completeness check before calling a screen done) — see "Process rules" section — plus a dev-mode missing-key console warning in `src/i18n/request.ts` so a future miss is caught while building, not during testing.
- 2026-07-05: Local guide tab (`property_extras`) built — third settings tab, completing the step-4.5 mini-phase. Migration/RLS shown for confirmation before applying, per standing practice. Identity-field lock applied to `category` from the start (per the process rule established in the prior bug-fix pass) rather than needing a follow-up fix. i18n completeness verified via script before calling it done (73 paths resolved in both message files). Property-isolation verified with the same RLS-scoped role/JWT test pattern as rooms/templates/guests.
- 2026-07-05: Step 5 (Today dashboard) built with contextual one-click buttons (arrivals get check-in-info; departures get checkout reminder + review request) rather than exposing all five template stages per guest — favors the dashboard's one-click-per-context intent over full flexibility; revisit if welcome/pre_arrival need surfacing here too. Time-saved stat uses a documented 3-min-per-message placeholder assumption, not a measured figure. Template selection falls back to the `en` variant if a guest's own language template is missing, rather than erroring, with a disabled "no template" button as the final fallback. Testing surfaced a real Base UI bug (not the earlier i18n one): `Select.Value` can't resolve an item's label until that item has rendered in the popup, so any preselected value (edit-mode defaults, the locale switcher) showed its raw stored value instead — a room's UUID, or `"ka"` instead of `"ქართული"`. Fixed app-wide with Base UI's documented `items` prop on every `Select`; see the shadcn/ui note for the pattern to use on any new `Select` going forward.
- 2026-07-05: Step 6 (public guidebook page) built. Extended `get_room_guidebook()` to also return `property_extras` as a `jsonb` array (Postgres requires `DROP`+`CREATE`, not `CREATE OR REPLACE`, to change a function's return columns) and to fall back to the property's default checkout time — a latent gap from when `default_checkout_time` was added but this function wasn't updated to match. Guest-facing language handling is a deliberately separate, small dictionary (`ka`/`en`/`ru`, in-page toggle), not an extension of the staff-only `src/i18n` cookie system, since they serve different audiences with different needs. Verified fully public access (zero cookies) and graceful not-found handling via direct `curl`, not just code review.
- 2026-07-05: Step 7 (styling/empty-state pass) built around one terracotta accent (`#e14d2c`) + warm-neutral base, applied at the shared component level (Button/Input/Select/Card) so it took effect everywhere at once. Verification initially relied on the user photographing a physical screen with a phone, which flattened real changes (shadows, saturation, spacing) to the point of looking like no change happened — not a code problem, a verification-method problem. Fixed by setting up Playwright-based real screenshots (CLI for public pages, a small scripted login for authenticated ones) as the standing verification method for all future UI work — see "UI verification process" section. Exact color/component values captured in "Design system" section so future changes work from real numbers, not adjectives.
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

Starter message templates for a new property are seed **data**, not schema — insert them the same way (`supabase db query --linked`), not as a migration. See "Starter template content" below for the actual 15-row insert used for ORBI City; copy that pattern with a new `property_id` for a new property.

## Internationalization (i18n)

Added as step 4.5, on host feedback: the actual dashboard users are Georgian-speaking staff, several not comfortable in English or Russian.

- **Library: `next-intl`** (v4). Chosen over `react-i18next`/hand-rolled because it has full React Server Component support (`getTranslations()` server-side, `useTranslations()` client-side) — an App-Router-heavy codebase like this one would otherwise have to convert Server Components to Client Components just to read a string.
- **Default locale `ka` (Georgian), fallback `en`.** Config in `src/i18n/config.ts` (`LOCALES`, `DEFAULT_LOCALE`), request-scoped resolution in `src/i18n/request.ts`.
- **Locale strategy: cookie-based, no `[locale]` URL segment** — deliberately the *opposite* of next-intl's most common example. This is an internal staff tool with a handful of users, not indexed content; nobody needs a shareable `/en/dashboard` link. URL-prefixing would double every route and complicate `proxy.ts`'s `PROTECTED_PREFIXES` matcher for no benefit here. Locale is stored in a `NEXT_LOCALE` cookie (1-year expiry), read in `src/i18n/request.ts`, switchable via `src/i18n/locale-switcher.tsx` (a `Select` calling the `setLocale` Server Action in `src/i18n/actions.ts`). If shareable per-language URLs are ever needed, next-intl's documented migration path from cookie-based to URL-prefixed doesn't touch the message JSON files — this isn't a one-way door on the translation content, only on routing.
- **Messages live in `messages/ka.json` / `messages/en.json`**, namespaced by screen (`login`, `dashboard`, `guests`, `settings`, etc.) plus shared value-label namespaces (`guestStatus`, `sourceChannel`, `language`, `templateStage`) keyed by the exact DB value so a lookup is just `t(dbValue)`. Adding a language later is a new `messages/<locale>.json` file plus adding it to `LOCALES` — no component changes.
- **Validation/error messages are translation keys, not text**, returned from Server Actions and pure validation functions (`src/lib/guests/validation.ts`, `src/lib/settings/validation.ts`) and translated at render time in the client form. Keeps that logic i18n-agnostic and testable independent of language.
- **Retrofitted now (before more screens exist):** login, dashboard shell/nav (`src/app/dashboard/layout.tsx`), guest list, guest add/edit form. New screens (settings tabs) were built i18n-first rather than retrofitted.
- These are working, reviewed-for-correctness translations, not a native speaker's final copy — the host should feel free to correct phrasing that sounds unnatural, same caveat as the starter template content below.
- **Missing-key dev warning:** `src/i18n/request.ts`'s `onError`/`getMessageFallback` log `[i18n] Missing translation key: ...` to the console and render a `⚠️ missing: namespace.key` marker in non-production, instead of next-intl's default silent `namespace.key` render. See the i18n-completeness-check process rule below.

**Bug-fix pass (2026-07-05) — root cause was route caching, not missing keys:** host testing reported a "language keeps switching / Templates tab stuck in English" bug after the settings screens shipped. Investigated by exhaustively resolving every translation key actually referenced in the settings feature against both message files with a script (not eyeballing) — all keys resolved correctly in both `ka.json` and `en.json`. The real cause: `setLocale()` called `revalidatePath("/")`, which only busts the Next.js Router Cache for the literal `/` segment. Locale is read in the **root layout** and provided to the whole tree via `NextIntlClientProvider`, but a route visited *before* switching locale (e.g. Settings, opened while still in English) could keep serving its stale cached RSC payload in the old language after switching, since only `/` was explicitly invalidated. **Fixed by changing to `revalidatePath("/", "layout")`**, which busts the cache for every route nested under the root layout — i.e. the whole app. Lesson: a global preference (locale, theme, etc.) read in a shared layout must invalidate at the layout level, not a single path, or already-visited routes silently go stale.

## Property settings (`/dashboard/settings`)

New authenticated section, RLS-scoped identically to guests via the existing `is_staff_of()` pattern — **no new RLS policies were needed**. Before building, both `rooms` and `message_templates` were checked (migration file + live `pg_policies` on the linked project) and already had full `SELECT`/`INSERT`/`UPDATE`/`DELETE` staff policies from the very first schema migration (step 2) — the "Room 1" manual seed earlier just used the service role to bypass RLS for one-off data entry; it never implied the policies themselves were missing.

Two tabs (shadcn `Tabs`, Base UI — same composition notes as elsewhere apply):

- **Rooms tab** (`rooms-tab.tsx`, `room-dialog.tsx`, `property-defaults-form.tsx`): a property-defaults form (`default_checkout_time`) above a room list; add/edit via a `Dialog` (no delete — not needed yet, revisit if a room is ever actually decommissioned). `checkout_time` left blank on a room means "inherit the property default."
- **Templates tab** (`templates-tab.tsx`, `template-dialog.tsx`): grouped by stage, create/edit/delete. Language picker in the template form is independent of the staff member's own dashboard locale (a host writing a Russian-language template while their own dashboard is in Georgian is the expected case). **Stage and language are locked (shown as static read-only text, submitted via hidden inputs) once editing an existing template** — only selectable when creating a new one. See the identity-field-lock process rule below for why.
- **Variable-insertion helper:** `TEMPLATE_VARIABLES` in `src/lib/settings/constants.ts` (`guest_name`, `room_label`, `checkin_date`, `checkout_time`, `wifi_ssid`, `wifi_password`). Clicking a chip above the textarea inserts `{token}` at the current cursor position via the textarea's `selectionStart`/`selectionEnd` (plain DOM, no library) and restores focus/cursor after. **Actual substitution of these tokens happens at send-time in step 5 (Today dashboard) — not implemented yet.** This step only builds the editor-side insertion.
- Both dialogs use `useActionState` + a `success` flag in the action's return state (not `redirect()`, since we want to stay on the settings page) — a `useEffect` closes the dialog when `state.success` is true, and `revalidatePath("/dashboard/settings")` inside each action refreshes the underlying list.
- `src/lib/property/current.ts`'s `getOwnProperty()` fetches "the" property the signed-in user is staff of (RLS-scoped, `.limit(1)`) — used to supply `property_id` on insert. Picks the first if a user is ever staff of more than one property; fine for this single-property pilot, but a real multi-property build would need an explicit property switcher instead of this helper.

**Rooms/templates property-isolation test (2026-07-05):** same method as the step-4 guests test (`set local role authenticated; set local request.jwt.claim.sub = '<uid>'`, rolled back), against a second throwaway property/room/template:

1. `SELECT` a foreign room → 0 rows.
2. `UPDATE` a foreign room's label → matches 0 rows, silently no-ops (confirmed unchanged afterward) — Postgres `UPDATE` RLS policies filter invisible rows rather than raising an error; `INSERT`'s `WITH CHECK` is what raises `42501`, as seen next.
3. `SELECT` a foreign template → 0 rows.
4. `INSERT` a template with the foreign `property_id` → rejected: `ERROR 42501: new row violates row-level security policy for table "message_templates"`.
5. `UPDATE` own room (`"ოთახი 1"`, formerly seeded as "Room 1" — renamed during the i18n bug-fix pass so a Georgian-locale host doesn't see a stray English placeholder) → succeeds (rolled back).
6. `INSERT` a template with own `property_id` → succeeds (rolled back).

All temporary test properties/rooms/templates were deleted afterward; verified 0 guests / 1 property / 1 room / 15 templates remained.

## Starter template content

15 templates seeded for ORBI City (5 stages × `en`/`ru`/`ka`) via `supabase db query --linked` (data, not a migration — see the bootstrap SQL pattern above). Deliberately written around information that is **not** already visible on Booking.com/Airbnb/home.ge listings — exact arrival coordination, direct host contact + hours, unit-specific quirks (elevator, quiet hours, trash, parking — left as edit-me placeholders since ORBI's specifics weren't provided), and genuinely private info (real WiFi password, lockbox/gate details) via the `{wifi_ssid}`/`{wifi_password}` tokens. **These are starting points the host is expected to edit, not final copy** — bracketed placeholders like `[add your directions here]` mark spots that need the host's actual specifics, and the Georgian/Russian wording is a capable-but-non-native translation the host should feel free to correct. Edit via Settings → Templates, not by re-running SQL.

## Process rules (apply automatically to every new screen — don't wait to be told)

Established 2026-07-05 after a bug-fix pass on the settings screens. Both apply to the upcoming Local guide tab and everything built after it:

1. **Identity-field lock.** If a record has fields that determine *which record it is* (not just its content) — `message_templates`' `(stage, language)`, and `property_extras`' `category` once built — those fields must be locked (rendered read-only, submitted via a hidden input carrying the existing value) once the user is editing that record's *existing* content. They're only choosable when creating a new record. Reasoning: freely editable identity fields let a save silently repurpose which stage/language (or category) slot a row represents, which reads to the user as content randomly "moving" or "switching" elsewhere in the list — confusing and hard to distinguish from an actual bug. To work on a different combination, exit and create/select a different record instead of retasking the current one.
2. **i18n completeness check before calling a screen done.** Before reporting any new screen/tab as finished: (a) apply rule 1 if it has any editable record with identity-determining fields, and (b) verify every string the screen renders resolves in *both* `messages/ka.json` and `messages/en.json` — don't rely on the next round of user testing to catch a missing key. `src/i18n/request.ts` now logs `[i18n] Missing translation key: ...` to the console (and renders a `⚠️ missing:` marker in dev) when a key is missing, specifically so this is catchable during development — check the console during your own testing, not just visually.

## Local guide (`/dashboard/settings` third tab — host-side management only)

Third settings tab, built 2026-07-05: `property_extras` table (`supabase/migrations/20260705102613_property_extras.sql`) — `property_id`, `category` (`text` + `CHECK` in `recommendation`/`taxi`/`offering`), `title` (required), `description`/`contact_info`/`price` (all nullable — `price` is `text` not numeric, e.g. "from 25 GEL"), `display_order` (`integer`, host-controlled). RLS: identical `is_staff_of(property_id)` CRUD pattern as rooms/templates, applied directly, no new design work. Informational only — no booking/payment/availability logic; guest messages the host directly, same as everything else.

- **UI** (`local-guide-tab.tsx`, `extra-dialog.tsx`): one `Card`, list grouped by category (recommendations/taxi/offerings) sorted by `display_order`, single "Add entry" button (category chosen in the dialog, no default — same pattern as templates' stage field). **`category` is locked (read-only + hidden input) once editing an existing entry**, per the identity-field-lock process rule — only choosable when creating new.
- **Property-isolation test (2026-07-05):** same method as rooms/templates — `SELECT` a foreign property's extra → 0 rows; `INSERT` with a foreign `property_id` → rejected (`42501`); `INSERT` with own `property_id` → succeeds (rolled back). Temporary test property deleted afterward.

**Guest-facing exposure was built in step 6** — see "Public guidebook page" below. `get_room_guidebook()` now returns this data too; there is still no standalone public function/policy for `property_extras` itself.

## Today dashboard (`/dashboard`, step 5)

Rebuilt from the placeholder stub. Scoped exactly to the original spec's wording — arrivals/departures *today*, not a full-stay messaging hub:

- **"Today" is computed server-side in `src/lib/dates.ts`'s `todayInBatumiISO()`** via a fixed UTC+4 offset, not the server's own clock (Vercel runs UTC) — Georgia has no DST since 2017, so a fixed offset is reliable without a timezone library. Same reasoning as the guest form's client-side "today" default, but this one runs on the server since the dashboard is a Server Component.
- **Sections:** "Arriving today" (`check_in_date = today`) and "Departing today" (`check_out_date = today`), each a simple list — no general "all guests, all stages" messaging UI here (that's available via Settings/guest edit; the Today view is deliberately narrow).
- **One-click send buttons are contextual, not a 5-stage menu per guest:** arrivals get one primary button ("Send check-in info" → `checkin_day` template); departures get two ("Send checkout reminder" → `checkout`, primary; "Send review request" → `review_request`, secondary/outline). `welcome`/`pre_arrival` aren't surfaced here since they don't fit "today's arrivals/departures" (welcome is sent at booking time, pre_arrival a day or two ahead) — this was a judgment call favoring the dashboard's stated one-click-per-context simplicity over exposing all five stages; revisit if the host wants pre_arrival reachable from here too.
- **Template selection:** `src/lib/messaging/render-template.ts`'s `renderTemplate()` substitutes `{guest_name}`, `{room_label}`, `{checkin_date}`, `{checkout_time}` (room override or property default), `{wifi_ssid}`, `{wifi_password}` into the template matching the guest's own `language`, **falling back to the `en` template if that language's version doesn't exist** for the stage (rather than erroring) — if no template exists in either, the button renders disabled with a "no template" tooltip instead of producing a broken link.
- **Sending:** `src/lib/messaging/whatsapp.ts`'s `buildWhatsAppLink()` builds a plain `wa.me` link (digits-only phone, no `+`/spaces) — no Business API, matching the existing decision. `SendButton` (`src/app/dashboard/send-button.tsx`) opens it synchronously in the click handler (some browsers block `window.open` from async callbacks as a popup), shows a checkmark + "Sent" optimistically for 2s with no loading wait, and fires `logMessageSent()` (`src/app/dashboard/actions.ts`) without blocking the UI on it. The button stays clickable afterward (a real resend logs a new row — accurate audit trail, not a one-time lock).
- **Stats bar:** total `message_log` row count (all-time, not just today — "running count" per the original spec) and an estimated time saved. **Time-saved assumption: 3 minutes of manual typing/lookup saved per message sent — a documented starting estimate, not a measured figure.** Change the constant in `src/app/dashboard/page.tsx` if a different number is wanted; this is a product/marketing number worth revisiting once there's real usage to calibrate against.

## Public guidebook page (`/guidebook/[roomId]`, step 6)

Fully public, no auth of any kind — not in `proxy.ts`'s `PROTECTED_PREFIXES` or `AUTH_ROUTES`, so it passes through untouched. The page never calls `verifySession()`; the Supabase client has no session cookie for an anonymous guest, so it operates as `anon`, exactly the role `get_room_guidebook()` is granted `EXECUTE` to. Verified with zero cookies via direct `curl` (not just "should work") — correct data, correct checkout-time fallback, and both invalid-UUID and unknown-room requests return a clean 404 with no Postgres error or data leak (`notFound()` in `page.tsx`, backed by `not-found.tsx` in the same route segment).

- **Separate i18n from the staff dashboard, on purpose.** The staff `src/i18n` system is cookie-based, scoped to `ka`/`en`, and tied to one staff account's preference — none of that fits an anonymous guest who needs `ka`/`en`/`ru` and a simple in-page toggle. `src/app/guidebook/[roomId]/labels.ts` is a small standalone dictionary (not next-intl); `GuidebookView` (a Client Component) holds the selected language in local state, defaulting to `ka`. Don't try to unify this with `src/i18n` — the two systems solve different problems for different audiences.
- **Sections render only when there's content** — WiFi card, checkout time, house rules, map link, and the Local guide (grouped by category, same three categories as the settings tab) each disappear entirely rather than showing empty/blank when the host hasn't filled them in yet.
- **WiFi network/password are tap-to-copy** (`copyable-text.tsx`, `navigator.clipboard.writeText`) — copies to the guest's own device clipboard only; nothing is sent anywhere or visible to the host/anyone else. Purely a convenience over manually retyping a password into phone WiFi settings.
- `property_extras`' `contact_info` renders as plain text, not a `wa.me` link — it's free text (could be a phone, an Instagram handle, "ask reception") and isn't safe to assume is always a dialable/messageable number.

## Explicitly out of scope (do not build, do not scaffold placeholders for)

- WhatsApp Business API / Meta app verification / bot / per-message billing
- Automatic booking imports from any OTA
- Multi-property / multi-tenant admin, billing, or subscription logic
- Automated test suite beyond basic sanity checks (manual QA checklist instead)
- Any AI chatbot or auto-reply to guests

## shadcn/ui note (Base UI, not Radix)

This project's shadcn/ui was scaffolded on `@base-ui/react`, not Radix. Composition uses a `render` prop (`<Button render={<Link href="..." />}>text</Button>`), not `asChild`. When rendering `Button` as a non-`<button>` element (e.g. a `Link`), also pass `nativeButton={false}` — otherwise Base UI logs a console warning that it expected a native button and native button semantics are lost.

**`Select` always needs an `items` prop when the display label differs from the stored value.** `Select.Value` has no way to know an item's label until that `SelectItem` has actually rendered inside the popup — which normally doesn't happen until the user opens it. On first render with a preselected value (`defaultValue` on edit, or a controlled `value` like the locale switcher), it falls back to showing the raw stored value instead of the label — e.g. a room's UUID instead of its name, or `"ka"` instead of `"ქართული"`. Found via a real screenshot (2026-07-05) after step 5 testing — the guest edit form's Room field showed a raw UUID, and the locale switcher showed `"ka"`, not `"ქართული"`. Fixed everywhere by passing `items={Object.fromEntries(values.map(v => [v, label(v)]))}` (or the plain label record, for the locale switcher) directly to `<Select>` — this is Base UI's own documented mechanism for exactly this case, resolves synchronously, and needs no popup interaction. **Any new `Select` whose items have a different label than their value must get this from the start.**

## Design system (step 7)

One warm-neutral base palette + one terracotta accent, per the original spec. Defined as OKLCH custom properties in `src/app/globals.css`; exact sRGB values (computed via the standard OKLCH→sRGB math, not eyeballed) for reference/reuse:

| Token | OKLCH | Hex |
|---|---|---|
| `--background` | `oklch(0.985 0.004 60)` | `#fcf9f7` |
| `--foreground` | `oklch(0.2 0.008 50)` | `#191513` |
| `--card` | `oklch(0.995 0.003 60)` | `#fffdfb` |
| `--primary` (the one accent) | `oklch(0.62 0.19 34)` | `#e14d2c` |
| `--primary-foreground` | `oklch(0.99 0.005 60)` | `#fefbf8` |
| `--muted` / `--secondary` | `oklch(0.955 0.008 55)` | `#f5efeb` |
| `--muted-foreground` | `oklch(0.5 0.014 50)` | `#6a615c` |
| `--border` / `--input` | `oklch(0.9 0.01 55)` | `#e4dcd8` |

Dark-mode tokens are also defined (lighter primary `oklch(0.72 0.17 34)` / `#fc7659` for contrast on a dark card) but nothing in the app currently toggles the `.dark` class from a user control — the app always renders in light mode today. The dark tokens are used deliberately in one place: `.dark` can be applied to a scoped wrapper (not just `<html>`) to get an already-contrast-tuned "dark section on a light page" effect for free, since every shadcn primitive reads the same CSS variables.

Component primitives (all shared, so a change here applies everywhere at once): **Button** default size `h-10`/`px-4`/`rounded-lg`/`shadow-sm`, primary variant filled solid; **Input**/**Select** trigger both `h-10` to align in form rows; **Card** `rounded-xl`, `shadow-sm` + `ring-1 ring-foreground/8`, `20px` internal padding. Page containers: `p-4 sm:p-8`, `gap-5`–`gap-6` between sections.

**Destructive stays its own red** (`oklch(0.577 0.245 27.325)`), not terracotta-tinted — adjacent warm hues would blur "primary action" and "danger" together.

## UI verification process (established 2026-07-05 — apply to every future styling/UI change)

A build/lint pass and a `curl` 200 response prove the code compiles and the server responds — **neither proves the intended visual change is actually visible on the page.** A styling pass was reported done multiple times on that basis alone while the user, verifying via phone photos of a physical screen, kept seeing what looked like no change. Two real problems compounded: (a) phone photos of a monitor genuinely flatten shadows, subtle saturation, and small spacing/sizing differences almost completely — a real limitation of that feedback loop, not the user's error; (b) a mid-pass edit was rejected by the user and the response moved on without confirming the file was actually left in a known state.

**The fix, now standard practice for this project:**

- `npx playwright screenshot <url> <file>` works in this environment without adding `playwright` to the project's `package.json` (it's a verification tool, not a product dependency) — confirmed working, browser binaries already available, no install step needed.
- For pages requiring login, a small Node script using the full `playwright` package (installed with `npm install playwright --no-save` in the scratchpad directory, never the project) drives an actual login (selectors: `#email`, `#password`, `button[type="submit"]`, waits for `waitForURL` to `/dashboard`) and screenshots the authenticated pages. The login password was provided once, used only as an in-memory env var for that script invocation, never written to any file or logged.
- **After any styling/UI change, take a real screenshot of the actual changed page and look at it before reporting anything done.** If the intended change isn't visibly present in the screenshot, the task isn't done — go find out why, don't report completion.
- Confirm every edit actually landed, especially after a tool-reported failure or rejection — re-read the file to verify its actual current content rather than assuming an edit applied.
- For a multi-primitive pass (Button, Input, Card, nav, etc. all at once), consider verifying incrementally rather than only at the very end — a single failed edit in the middle is easy to miss five files later.

## File/folder structure conventions

- Scaffolded with `create-next-app@latest`: TypeScript, Tailwind, App Router, `src/` dir, `@/*` import alias, Turbopack (default in this Next version, no flag needed).
- App code lives under `src/app`; shared UI/components under `src/components` (shadcn convention); Supabase client helpers under `src/lib/supabase`; i18n config/actions/switcher under `src/i18n`; translation message files at repo-root `messages/<locale>.json` (not under `src/`, matching next-intl's own convention referenced from `next.config.ts`).
- Feature-scoped validation/constants live under `src/lib/<feature>/` (`src/lib/guests`, `src/lib/settings`) — pure, framework/i18n-agnostic functions returning translation *keys* on error, not text.

## Next.js version note (IMPORTANT — read before writing routes/middleware/data fetching)

This project uses **Next.js 16.2.10**, which has real breaking changes vs. Next 14/15 (what most training data assumes). Key differences to follow:

- **No `middleware.ts`.** Use `proxy.ts` at the project root (or `src/`) exporting `proxy()`. Runs Node runtime only (no Edge). Used for Supabase session refresh (`@supabase/ssr`) and optimistic auth redirects — never as the sole auth gate; always re-verify in Server Components/Actions.
- **`params` and `searchParams` are always async** (`Promise<...>`) in pages, layouts, route handlers, and metadata/image functions — no sync fallback exists anymore. Always `await` them.
- **`fetch()` and Route Handlers are uncached by default.** No implicit full-route caching. Opt into caching explicitly (`use cache` directive) only if actually needed — default (uncached) is almost certainly correct for this app's dashboard/guest data.
- Turbopack is the default bundler already; don't add webpack config.
- `next lint` is removed — lint via the `eslint` CLI script already wired in `package.json`.

## Build order status

1. Project scaffold — done
2. DB schema + RLS — done
3. Auth — done (login only, no signup UI; see security architecture section for how)
4. Add/edit guest flow — done (see security architecture section for the property-isolation test)
4.5. i18n + property settings (Rooms/Templates/Local guide tabs) — done, inserted ahead of step 5 on host feedback; see "Internationalization", "Property settings", and "Local guide" sections below. Guest-facing exposure of Local guide content is explicitly deferred to step 6.
5. Today dashboard + WhatsApp send — done, see "Today dashboard" section below
6. Public guidebook page — done, see "Public guidebook page" section below
7. Styling/empty-state pass — done, see "Design system" and "UI verification process" sections below
8. Deploy + pilot walkthrough — not started
