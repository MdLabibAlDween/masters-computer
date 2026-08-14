-- Run this in Supabase Dashboard → SQL Editor
-- Adds the show_in_slider flag: only notices marked true appear in the
-- homepage notice slider (controlled from Admin → নোটিশ স্লাইডার).
alter table public.notices
  add column if not exists show_in_slider boolean not null default false;