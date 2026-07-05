-- Adds "mid_stay" as an allowed message_templates.stage value — a day-after-
-- arrival check-in message, reachable from the guest detail page, meant to
-- catch small issues before they become a bad review (protects the
-- review_request stage already built). No RLS change: message_templates'
-- existing is_staff_of(property_id) policies already cover any stage value.
alter table public.message_templates
  drop constraint message_templates_stage_check;

alter table public.message_templates
  add constraint message_templates_stage_check
  check (stage in ('welcome', 'pre_arrival', 'checkin_day', 'mid_stay', 'checkout', 'review_request'));
