-- Local guide (host-side management only — see CLAUDE.md "Local guide
-- (planned)" note). Informational content a host curates about the area:
-- recommendations, taxi contact(s), paid offerings. No booking/payment/
-- availability logic; guests message the host directly, same as everything
-- else in this app.
--
-- RLS follows the exact same pattern as rooms/message_templates: locked
-- table, staff CRUD via is_staff_of(property_id), no public policy. Guest-
-- facing exposure is deliberately NOT part of this migration — that's
-- step 6 (public guidebook page), likely via a narrow SECURITY DEFINER
-- function mirroring get_room_guidebook(), not a public table policy.
create table public.property_extras (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  category text not null check (category in ('recommendation', 'taxi', 'offering')),
  title text not null,
  description text,
  contact_info text,
  price text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.property_extras enable row level security;

create index property_extras_property_id_idx on public.property_extras (property_id);

create policy "staff can select their property's extras"
  on public.property_extras for select
  to authenticated
  using (public.is_staff_of(property_id));

create policy "staff can insert extras for their property"
  on public.property_extras for insert
  to authenticated
  with check (public.is_staff_of(property_id));

create policy "staff can update their property's extras"
  on public.property_extras for update
  to authenticated
  using (public.is_staff_of(property_id))
  with check (public.is_staff_of(property_id));

create policy "staff can delete their property's extras"
  on public.property_extras for delete
  to authenticated
  using (public.is_staff_of(property_id));
