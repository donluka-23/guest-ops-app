-- Property-level default checkout time. `rooms.checkout_time` remains
-- nullable and now means "inherit the property default" when null, or an
-- explicit per-room override when set. No RLS changes: this column lives on
-- `properties`, which already has staff-only select/update policies scoped
-- via is_staff_of(id).
alter table public.properties
  add column default_checkout_time time not null default '12:00';
