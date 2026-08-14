-- Run this in Supabase Dashboard → SQL Editor
-- Adds the missing services.url column (used by ServiceForm & ServiceCard)
alter table public.services
  add column if not exists url text not null default '';