-- Free-text shift-handoff notes for a guest (quirks, special requests,
-- anything staff need to pass to the next shift). Nullable, no default —
-- most guests won't need one. No RLS change: guests' existing
-- is_staff_of(property_id) policies already cover every column on the row.
alter table public.guests
  add column notes text;
