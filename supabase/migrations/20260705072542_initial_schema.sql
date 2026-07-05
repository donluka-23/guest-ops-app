-- Initial schema: properties, staff membership, rooms, guests, message
-- templates, message log. Two access zones:
--   1. Authenticated zone: every table below has RLS enabled with NO
--      public policies at all. Access is staff-only, scoped by
--      property_staff membership via the is_staff_of() helper.
--   2. Public zone: guest-facing guidebook. There is deliberately no
--      public SELECT policy on `rooms`. Instead, get_room_guidebook()
--      is a SECURITY DEFINER function granted to `anon` that returns
--      only guidebook-safe columns for one room UUID. New columns added
--      to `rooms` later stay private by default unless someone
--      deliberately adds them to that function's return list.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

-- ---------------------------------------------------------------------
-- property_staff — membership join table. Not part of the original
-- data-model list; added so RLS scoping is driven by membership rows
-- instead of a hardcoded property id, so adding a second property or a
-- second role later doesn't require touching any policy.
-- ---------------------------------------------------------------------
create table public.property_staff (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  unique (property_id, user_id)
);

alter table public.property_staff enable row level security;

create index property_staff_user_id_idx on public.property_staff (user_id);
create index property_staff_property_id_idx on public.property_staff (property_id);

-- ---------------------------------------------------------------------
-- is_staff_of() — SECURITY DEFINER helper reused by every locked
-- table's policies. Runs as the function owner (bypassing RLS on
-- property_staff itself), which is what avoids recursive-RLS problems
-- when property_staff's own policies also call this function.
-- ---------------------------------------------------------------------
create or replace function public.is_staff_of(p_property_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.property_staff
    where property_id = p_property_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_staff_of(uuid) from public;
grant execute on function public.is_staff_of(uuid) to authenticated;

-- properties policies: a user can see/manage a property only if they
-- are already staff of it.
create policy "staff can select their properties"
  on public.properties for select
  to authenticated
  using (public.is_staff_of(id));

create policy "staff can update their properties"
  on public.properties for update
  to authenticated
  using (public.is_staff_of(id))
  with check (public.is_staff_of(id));

-- No insert/delete policy on properties for the app role: creating a
-- brand-new property is a manual bootstrap step (see property_staff
-- bootstrap note below and CLAUDE.md), not an in-app flow for this pilot.

-- property_staff policies: a user can see/manage staff rows only for
-- properties they themselves already belong to.
create policy "staff can select property_staff rows for their property"
  on public.property_staff for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can add staff to their property"
  on public.property_staff for insert
  to authenticated
  with check (public.is_staff_of(property_id));

create policy "staff can remove staff from their property"
  on public.property_staff for delete
  to authenticated
  using (public.is_staff_of(property_id));

-- ---------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  wifi_ssid text,
  wifi_password text,
  checkout_time time,
  house_rules text,
  map_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create index rooms_property_id_idx on public.rooms (property_id);

create policy "staff can select their property's rooms"
  on public.rooms for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can insert rooms for their property"
  on public.rooms for insert
  to authenticated
  with check (public.is_staff_of(property_id));

create policy "staff can update their property's rooms"
  on public.rooms for update
  to authenticated
  using (public.is_staff_of(property_id))
  with check (public.is_staff_of(property_id));

create policy "staff can delete their property's rooms"
  on public.rooms for delete
  to authenticated
  using (public.is_staff_of(property_id));

-- No policy of any kind on `rooms` for `anon`. Public guidebook access
-- is exposed only through get_room_guidebook() below.

-- ---------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  name text not null,
  phone text not null,
  check_in_date date not null,
  check_out_date date not null,
  language text not null default 'en' check (language in ('en', 'ru', 'ka')),
  source_channel text not null check (
    source_channel in (
      'booking_com', 'airbnb', 'home_ge', 'myhome_ge', 'ss_ge', 'direct', 'walk_in'
    )
  ),
  status text not null default 'upcoming' check (
    status in ('upcoming', 'checked_in', 'checked_out')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out_date > check_in_date)
);

alter table public.guests enable row level security;

create index guests_property_id_idx on public.guests (property_id);
create index guests_room_id_idx on public.guests (room_id);

create policy "staff can select their property's guests"
  on public.guests for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can insert guests for their property"
  on public.guests for insert
  to authenticated
  with check (public.is_staff_of(property_id));

create policy "staff can update their property's guests"
  on public.guests for update
  to authenticated
  using (public.is_staff_of(property_id))
  with check (public.is_staff_of(property_id));

create policy "staff can delete their property's guests"
  on public.guests for delete
  to authenticated
  using (public.is_staff_of(property_id));

-- ---------------------------------------------------------------------
-- message_templates
-- ---------------------------------------------------------------------
create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  stage text not null check (
    stage in ('welcome', 'pre_arrival', 'checkin_day', 'checkout', 'review_request')
  ),
  language text not null default 'en' check (language in ('en', 'ru', 'ka')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.message_templates enable row level security;

create index message_templates_property_id_idx on public.message_templates (property_id);

create policy "staff can select their property's templates"
  on public.message_templates for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can insert templates for their property"
  on public.message_templates for insert
  to authenticated
  with check (public.is_staff_of(property_id));

create policy "staff can update their property's templates"
  on public.message_templates for update
  to authenticated
  using (public.is_staff_of(property_id))
  with check (public.is_staff_of(property_id));

create policy "staff can delete their property's templates"
  on public.message_templates for delete
  to authenticated
  using (public.is_staff_of(property_id));

-- ---------------------------------------------------------------------
-- message_log — append-only audit trail. INSERT and SELECT only, for
-- staff. No UPDATE or DELETE policy for any role: this is the source of
-- truth for "messages sent" / "time saved" stats, and a log that can be
-- edited or deleted after the fact stops being an audit trail. If a
-- send is ever mis-logged, the fix is a new corrective row at the app
-- layer, not mutating history.
-- ---------------------------------------------------------------------
create table public.message_log (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  template_id uuid references public.message_templates(id) on delete set null,
  sent_by uuid not null references auth.users(id),
  sent_at timestamptz not null default now()
);

alter table public.message_log enable row level security;

create index message_log_property_id_idx on public.message_log (property_id);
create index message_log_guest_id_idx on public.message_log (guest_id);

create policy "staff can select their property's message log"
  on public.message_log for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can insert into their property's message log"
  on public.message_log for insert
  to authenticated
  with check (public.is_staff_of(property_id));

-- Deliberately no update or delete policy on message_log for any role.

-- ---------------------------------------------------------------------
-- get_room_guidebook() — the only public-facing read in the schema.
-- SECURITY DEFINER, granted to anon. Returns guidebook content for a
-- room UUID indefinitely, with no check against any guest's stay
-- dates: this content (WiFi, house rules, checkout time, map) is
-- evergreen, room-scoped information reused by every future guest of
-- that room, not guest-specific data. It carries no guest PII, so a
-- stale or reused link isn't a privacy leak — gating it by an active
-- reservation would only add complexity and risk breaking legitimate
-- early/extended access, for no real security benefit.
-- ---------------------------------------------------------------------
create or replace function public.get_room_guidebook(p_room_id uuid)
returns table (
  room_label text,
  wifi_ssid text,
  wifi_password text,
  checkout_time time,
  house_rules text,
  map_url text,
  property_name text,
  property_address text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.label,
    r.wifi_ssid,
    r.wifi_password,
    r.checkout_time,
    r.house_rules,
    r.map_url,
    p.name,
    p.address
  from public.rooms r
  join public.properties p on p.id = r.property_id
  where r.id = p_room_id;
$$;

revoke all on function public.get_room_guidebook(uuid) from public;
grant execute on function public.get_room_guidebook(uuid) to anon, authenticated;
