-- Extends get_room_guidebook() (the sole public-facing surface in the
-- schema, unchanged security posture: SECURITY DEFINER, granted to anon,
-- still takes only a room UUID) for step 6, the public guidebook page:
--   1. checkout_time now falls back to the property's default when the
--      room's own checkout_time is null, matching the same coalesce logic
--      already used in the staff dashboard and Rooms tab. This was a
--      latent gap: rooms.checkout_time became nullable-meaning-"inherit"
--      after default_checkout_time was added, but this function was never
--      updated to match — a room using the default would have shown a
--      blank checkout time to guests.
--   2. Adds `extras`, a jsonb array of the property's `property_extras`
--      rows (recommendations/taxi/offerings), ordered by display_order.
--      Still scoped only by the resolved room's property_id — no new
--      input parameter, no new way to enumerate anything.
-- Postgres won't let CREATE OR REPLACE change a function's return columns
-- (adding `extras` here) — must drop and recreate.
drop function if exists public.get_room_guidebook(uuid);

create function public.get_room_guidebook(p_room_id uuid)
returns table (
  room_label text,
  wifi_ssid text,
  wifi_password text,
  checkout_time time,
  house_rules text,
  map_url text,
  property_name text,
  property_address text,
  extras jsonb
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
    coalesce(r.checkout_time, p.default_checkout_time),
    r.house_rules,
    r.map_url,
    p.name,
    p.address,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'category', e.category,
            'title', e.title,
            'description', e.description,
            'contact_info', e.contact_info,
            'price', e.price
          )
          order by e.display_order
        )
        from public.property_extras e
        where e.property_id = r.property_id
      ),
      '[]'::jsonb
    ) as extras
  from public.rooms r
  join public.properties p on p.id = r.property_id
  where r.id = p_room_id;
$$;

revoke all on function public.get_room_guidebook(uuid) from public;
grant execute on function public.get_room_guidebook(uuid) to anon, authenticated;
