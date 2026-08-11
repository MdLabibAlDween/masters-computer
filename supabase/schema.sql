-- =====================================================================
-- Masters Computer — Supabase Schema
-- Run this whole file once in the Supabase SQL Editor.
-- =====================================================================

-- =====================================================================
-- 0. Helpers
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- 1. Admin users
-- =====================================================================

create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  name        text not null default '',
  role        text not null default 'admin' check (role in ('super_admin', 'admin')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Returns true when the currently logged-in user is an active admin.
-- Defined after admin_users so the SQL-language function body validates.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.active
  );
$$;

-- Any user created in the Supabase Auth dashboard (Authentication → Users
-- → Add user) automatically becomes a super admin. No extra SQL needed.
create or replace function public.handle_new_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_users (user_id, name, role, active)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'super_admin', true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin();

drop policy if exists "admins can read admin_users" on public.admin_users;
create policy "admins can read admin_users"
  on public.admin_users for select
  using (public.is_admin());

drop policy if exists "admins can manage admin_users" on public.admin_users;
create policy "admins can manage admin_users"
  on public.admin_users for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 2. Business settings (single row, id = 1)
-- =====================================================================

create table if not exists public.business_settings (
  id             int primary key default 1 check (id = 1),
  name_bn        text not null default 'মাস্টার্স কম্পিউটার',
  name_en        text not null default 'Masters Computer',
  tagline        text not null default '',
  description    text not null default '',
  logo_url       text not null default '',
  phone          text not null default '',
  phone_secondary text not null default '',
  email          text not null default '',
  address        text not null default '',
  maps_url       text not null default '',
  timezone       text not null default 'Asia/Dhaka',
  updated_at     timestamptz not null default now()
);

alter table public.business_settings enable row level security;

drop policy if exists "public read business_settings" on public.business_settings;
create policy "public read business_settings"
  on public.business_settings for select
  using (true);

drop policy if exists "admins manage business_settings" on public.business_settings;
create policy "admins manage business_settings"
  on public.business_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 3. Social links (single row, id = 1)
-- =====================================================================

create table if not exists public.social_links (
  id         int primary key default 1 check (id = 1),
  facebook   text not null default '',
  whatsapp   text not null default '',
  youtube    text not null default '',
  instagram  text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.social_links enable row level security;

drop policy if exists "public read social_links" on public.social_links;
create policy "public read social_links"
  on public.social_links for select
  using (true);

drop policy if exists "admins manage social_links" on public.social_links;
create policy "admins manage social_links"
  on public.social_links for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 4. Opening hours
-- day_of_week: 0 = Saturday ... 6 = Friday (Bangladesh week order)
-- =====================================================================

create table if not exists public.business_hours (
  id          serial primary key,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_open     boolean not null default true,
  open_time   time not null default '09:00:00',
  close_time  time not null default '21:00:00',
  unique (day_of_week)
);

alter table public.business_hours enable row level security;

drop policy if exists "public read business_hours" on public.business_hours;
create policy "public read business_hours"
  on public.business_hours for select
  using (true);

drop policy if exists "admins manage business_hours" on public.business_hours;
create policy "admins manage business_hours"
  on public.business_hours for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 5. Break times
-- =====================================================================

create table if not exists public.break_times (
  id          serial primary key,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  title       text not null default 'বিরতি'
);

alter table public.break_times enable row level security;

drop policy if exists "public read break_times" on public.break_times;
create policy "public read break_times"
  on public.break_times for select
  using (true);

drop policy if exists "admins manage break_times" on public.break_times;
create policy "admins manage break_times"
  on public.break_times for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 6. Holidays
-- =====================================================================

create table if not exists public.holidays (
  id          serial primary key,
  date        date not null unique,
  title       text not null default '',
  description text not null default ''
);

alter table public.holidays enable row level security;

drop policy if exists "public read holidays" on public.holidays;
create policy "public read holidays"
  on public.holidays for select
  using (true);

drop policy if exists "admins manage holidays" on public.holidays;
create policy "admins manage holidays"
  on public.holidays for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 7. Special days (e.g. Friday special opening)
-- =====================================================================

create table if not exists public.special_days (
  id         serial primary key,
  date       date not null unique,
  open_time  time not null default '09:00:00',
  close_time time not null default '21:00:00',
  reason     text not null default ''
);

alter table public.special_days enable row level security;

drop policy if exists "public read special_days" on public.special_days;
create policy "public read special_days"
  on public.special_days for select
  using (true);

drop policy if exists "admins manage special_days" on public.special_days;
create policy "admins manage special_days"
  on public.special_days for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 8. Shop status override (single row, id = 1)
-- normal | force_open | force_closed | temp_closed
-- =====================================================================

create table if not exists public.shop_status_overrides (
  id            int primary key default 1 check (id = 1),
  status        text not null default 'normal' check (status in ('normal', 'force_open', 'force_closed', 'temp_closed')),
  message       text not null default '',
  resume_date   date,
  updated_at    timestamptz not null default now()
);

alter table public.shop_status_overrides enable row level security;

drop policy if exists "public read shop_status_overrides" on public.shop_status_overrides;
create policy "public read shop_status_overrides"
  on public.shop_status_overrides for select
  using (true);

drop policy if exists "admins manage shop_status_overrides" on public.shop_status_overrides;
create policy "admins manage shop_status_overrides"
  on public.shop_status_overrides for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 9. Service categories
-- =====================================================================

create table if not exists public.service_categories (
  id            serial primary key,
  name_bn       text not null,
  name_en       text not null default '',
  slug          text not null unique,
  icon          text not null default '🛠',
  description   text not null default '',
  display_order int not null default 0,
  active        boolean not null default true,
  featured      boolean not null default false
);

alter table public.service_categories enable row level security;

drop policy if exists "public read service_categories" on public.service_categories;
create policy "public read service_categories"
  on public.service_categories for select
  using (public.is_admin() or active);

drop policy if exists "admins manage service_categories" on public.service_categories;
create policy "admins manage service_categories"
  on public.service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 10. Services
-- =====================================================================

create table if not exists public.services (
  id             serial primary key,
  category_id    int references public.service_categories (id) on delete set null,
  name_bn        text not null,
  name_en        text not null default '',
  slug           text not null unique,
  short_desc     text not null default '',
  full_desc      text not null default '',
  instructions   text not null default '',
  icon           text not null default '🛠',
  image_url      text not null default '',
  active         boolean not null default true,
  featured       boolean not null default false,
  display_order  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_services_category on public.services (category_id);
create index if not exists idx_services_active on public.services (active, display_order);

alter table public.services enable row level security;

drop policy if exists "public read services" on public.services;
create policy "public read services"
  on public.services for select
  using (public.is_admin() or active);

drop policy if exists "admins manage services" on public.services;
create policy "admins manage services"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 11. Required documents per service
-- =====================================================================

create table if not exists public.service_documents (
  id            serial primary key,
  service_id    int not null references public.services (id) on delete cascade,
  document_name text not null,
  note          text not null default '',
  display_order int not null default 0
);

create index if not exists idx_service_documents_service on public.service_documents (service_id);

alter table public.service_documents enable row level security;

drop policy if exists "public read service_documents" on public.service_documents;
create policy "public read service_documents"
  on public.service_documents for select
  using (true);

drop policy if exists "admins manage service_documents" on public.service_documents;
create policy "admins manage service_documents"
  on public.service_documents for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 12. Notices
-- =====================================================================

create table if not exists public.notices (
  id                serial primary key,
  title             text not null,
  type              text not null default 'general'
                    check (type in ('general', 'important', 'holiday', 'shop_status',
                                    'service_update', 'new_service', 'facility', 'emergency')),
  description       text not null default '',
  image_url         text not null default '',
  related_service_id int references public.services (id) on delete set null,
  cta_text          text not null default '',
  cta_url           text not null default '',
  publish_date      date not null default current_date,
  expiry_date       date,
  pinned            boolean not null default false,
  show_on_homepage  boolean not null default true,
  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_notices_window on public.notices (published, publish_date, expiry_date);
create index if not exists idx_notices_type on public.notices (type);

alter table public.notices enable row level security;

drop policy if exists "public read published notices" on public.notices;
create policy "public read published notices"
  on public.notices for select
  using (
    public.is_admin()
    or (
      published
      and publish_date <= current_date
      and (expiry_date is null or expiry_date >= current_date)
    )
  );

drop policy if exists "admins manage notices" on public.notices;
create policy "admins manage notices"
  on public.notices for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger trg_notices_updated_at
  before update on public.notices
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 13. Service requests (customers)
-- =====================================================================

create table if not exists public.service_requests (
  id              serial primary key,
  name            text not null,
  phone           text not null,
  service_id      int references public.services (id) on delete set null,
  service_name    text not null default '',
  message         text not null default '',
  preferred_date  date,
  preferred_time  time,
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'processing', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);

create index if not exists idx_service_requests_status on public.service_requests (status);

alter table public.service_requests enable row level security;

drop policy if exists "customers can create service_requests" on public.service_requests;
create policy "customers can create service_requests"
  on public.service_requests for insert
  with check (true);

drop policy if exists "public read own service_requests" on public.service_requests;
create policy "public read own service_requests"
  on public.service_requests for select
  using (public.is_admin());

drop policy if exists "admins update service_requests" on public.service_requests;
create policy "admins update service_requests"
  on public.service_requests for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete service_requests" on public.service_requests;
create policy "admins delete service_requests"
  on public.service_requests for delete
  using (public.is_admin());

-- =====================================================================
-- 14. Appointments
-- =====================================================================

create table if not exists public.appointments (
  id           serial primary key,
  name         text not null,
  phone        text not null,
  service_id   int references public.services (id) on delete set null,
  service_name text not null default '',
  date         date not null,
  time         time,
  notes        text not null default '',
  status       text not null default 'new'
               check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at   timestamptz not null default now()
);

create index if not exists idx_appointments_date on public.appointments (date);

alter table public.appointments enable row level security;

drop policy if exists "customers can create appointments" on public.appointments;
create policy "customers can create appointments"
  on public.appointments for insert
  with check (true);

drop policy if exists "public read own appointments" on public.appointments;
create policy "public read own appointments"
  on public.appointments for select
  using (public.is_admin());

drop policy if exists "admins update appointments" on public.appointments;
create policy "admins update appointments"
  on public.appointments for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete appointments" on public.appointments;
create policy "admins delete appointments"
  on public.appointments for delete
  using (public.is_admin());

-- =====================================================================
-- 15. Contact messages
-- =====================================================================

create table if not exists public.contact_messages (
  id         serial primary key,
  name       text not null,
  phone      text not null default '',
  email      text not null default '',
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'done')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "customers can create contact_messages" on public.contact_messages;
create policy "customers can create contact_messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "public read own contact_messages" on public.contact_messages;
create policy "public read own contact_messages"
  on public.contact_messages for select
  using (public.is_admin());

drop policy if exists "admins update contact_messages" on public.contact_messages;
create policy "admins update contact_messages"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins delete contact_messages" on public.contact_messages;
create policy "admins delete contact_messages"
  on public.contact_messages for delete
  using (public.is_admin());

-- =====================================================================
-- 16. FAQs
-- =====================================================================

create table if not exists public.faqs (
  id            serial primary key,
  question      text not null,
  answer        text not null,
  link_label    text not null default '',
  link_url      text not null default '',
  display_order int not null default 0,
  active        boolean not null default true
);

alter table public.faqs enable row level security;

drop policy if exists "public read faqs" on public.faqs;
create policy "public read faqs"
  on public.faqs for select
  using (public.is_admin() or active);

drop policy if exists "admins manage faqs" on public.faqs;
create policy "admins manage faqs"
  on public.faqs for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 17. Site settings (key/value misc content)
-- =====================================================================

create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "admins manage site_settings" on public.site_settings;
create policy "admins manage site_settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- 18. Storage bucket for uploads (logo, service images, notice images)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read site-assets" on storage.objects;
create policy "public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "admins upload site-assets" on storage.objects;
create policy "admins upload site-assets"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins update site-assets" on storage.objects;
create policy "admins update site-assets"
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins delete site-assets" on storage.objects;
create policy "admins delete site-assets"
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());

-- =====================================================================
-- 19. Seed data
-- =====================================================================

-- --- Business settings -------------------------------------------------
insert into public.business_settings (name_bn, name_en, tagline, description, address, timezone)
values (
  'মাস্টার্স কম্পিউটার',
  'Masters Computer',
  'অনলাইন আবেদন, টিকিট, ভিসা, NID, জমি সংক্রান্ত সেবা এবং বিভিন্ন ডিজিটাল সেবা।',
  'মাস্টার্স কম্পিউটার সালথা বাজার, ফরিদপুরের একটি বিশ্বস্ত অনলাইন সেবা কেন্দ্র। আমরা পাসপোর্ট ও NID, ভিসা, জমি সংক্রান্ত সেবা, BMET, টিকিট এবং বিভিন্ন ডিজিটাল সেবা প্রদান করে থাকি। সঠিকতা, দ্রুততা এবং সততার সাথে প্রতিটি সেবা দেওয়াই আমাদের প্রতিশ্রুতি।',
  'সালথা বাজার, ফরিদপুর',
  'Asia/Dhaka'
)
on conflict (id) do nothing;

insert into public.social_links (id) values (1) on conflict (id) do nothing;

-- --- Opening hours: Sat–Thu 09:00–21:00, Friday closed ----------------
insert into public.business_hours (day_of_week, is_open, open_time, close_time) values
  (0, true,  '09:00:00', '21:00:00'),
  (1, true,  '09:00:00', '21:00:00'),
  (2, true,  '09:00:00', '21:00:00'),
  (3, true,  '09:00:00', '21:00:00'),
  (4, true,  '09:00:00', '21:00:00'),
  (5, true,  '09:00:00', '21:00:00'),
  (6, false, '09:00:00', '21:00:00')
on conflict (day_of_week) do nothing;

insert into public.shop_status_overrides (id, status)
values (1, 'normal')
on conflict (id) do nothing;

-- --- Categories ---------------------------------------------------------
insert into public.service_categories (name_bn, name_en, slug, icon, description, display_order, featured) values
  ('পাসপোর্ট / NID',       'Passport / NID',      'passport-nid',      '🪪', 'পাসপোর্ট, জাতীয় পরিচয়পত্র ও সংশ্লিষ্ট সেবা', 1,  true),
  ('ভ্রমণ ও ভিসা',          'Travel & Visa',       'travel-visa',       '✈️', 'বিমান টিকিট ও বিভিন্ন দেশের ভিসা সেবা',        2,  true),
  ('জমি সংক্রান্ত সেবা',    'Land Services',       'land-services',     '🌾', 'মিউটেশন, খাজনা, খতিয়ান ও জমি কেনাবেচা',      3,  true),
  ('বিদেশগমন / BMET',       'Foreign Travel / BMET','bmet',             '🌍', 'বিদেশগামীদের BMET ও প্রশিক্ষণ সেবা',         4,  false),
  ('চাকরি ও কর্মসংস্থান',  'Jobs',                'jobs',              '💼', 'অনলাইনে চাকরির আবেদন',                        5,  false),
  ('শিক্ষা',                'Education',           'education',         '🎓', 'স্কুল-কলেজের ভর্তি আবেদন',                    6,  false),
  ('কম্পিউটার ও ডিজিটাল সেবা','Computer Services',  'computer-services', '💻', 'ই-মেইল, চুক্তিপত্র, কম্পোজ ও লেমিনেটিং',      7,  false),
  ('টিকিট সেবা',            'Ticket Service',      'ticket-service',    '🚆', 'অনলাইন রেল ও বিমান টিকিট',                     8,  true),
  ('অন্যান্য অনলাইন সেবা', 'Other Online Services','other-online',      '⚡', 'বিদ্যুৎ মিটার, TIN ও অন্যান্য অনলাইন সেবা',    9,  false)
on conflict (slug) do nothing;

-- --- Services ------------------------------------------------------------
insert into public.services (category_id, name_bn, name_en, slug, short_desc, full_desc, instructions, icon, featured, display_order, active) values
  ((select id from public.service_categories where slug = 'passport-nid'),
    'পাসপোর্টের আবেদন', 'Passport Application', 'passport-application',
    'অনলাইনে পাসপোর্টের নতুন আবেদন ও ফি জমা।',
    'আমাদের মাধ্যমে আপনি অনলাইনে পাসপোর্টের আবেদন করতে পারবেন। আবেদন, ফি জমা, ছবি ও প্রয়োজনীয় কাগজপত্রের সব কাজ আমরা করিয়ে দেই।',
    'দোকানে আসার সময় প্রয়োজনীয় কাগজপত্র সাথে আনুন। আবেদনের পর পাসপোর্ট অফিসের তারিখ অনুযায়ী জমা দেওয়া হয়।',
    '🪪', true, 1, true),
  ((select id from public.service_categories where slug = 'passport-nid'),
    'নতুন ভোটারের আবেদন', 'New Voter / NID Application', 'nid-application',
    'নতুন ভোটার হওয়ার অনলাইন আবেদন।',
    '১৮ বছর পূর্ণ হলে নতুন ভোটার হওয়ার জন্য অনলাইনে আবেদন ও জন্মনিবন্ধন ভেরিফিকেশন করিয়ে দেই।',
    'জন্মনিবন্ধন ও মোবাইল নম্বর সাথে আনুন।',
    '🪪', true, 2, true),
  ((select id from public.service_categories where slug = 'passport-nid'),
    'ন্যাশনাল আইডি কার্ডের ভুল সংশোধন', 'NID Correction', 'nid-correction',
    'NID কার্ডের নাম, ঠিকানা ও অন্যান্য তথ্য সংশোধন।',
    'জাতীয় পরিচয়পত্রে ভুল তথ্য থাকলে অনলাইনে সংশোধনের আবেদন করিয়ে দেই।',
    'NID, জন্মনিবন্ধন এবং সংশোধন করতে চাওয়া তথ্যের প্রমাণপত্র সাথে আনুন।',
    '🪪', false, 3, true),
  ((select id from public.service_categories where slug = 'passport-nid'),
    'NID নমুনা কপি', 'NID Sample Copy', 'nid-sample-copy',
    'NID কার্ডের নমুনা কপি সংগ্রহ।',
    'হারিয়ে গেলে বা প্রয়োজনে জাতীয় পরিচয়পত্রের নমুনা কপি তুলে দেই।',
    'NID নম্বর জানতে হবে।',
    '🪪', false, 4, true),
  ((select id from public.service_categories where slug = 'passport-nid'),
    'পুলিশ ক্লিয়ারেন্সের আবেদন', 'Police Clearance', 'police-clearance',
    'পুলিশ ক্লিয়ারেন্স সার্টিফিকেটের আবেদন।',
    'বিদেশ যাত্রা ও চাকরির প্রয়োজনে পুলিশ ক্লিয়ারেন্সের অনলাইন আবেদন করিয়ে দেই।',
    'NID, পাসপোর্ট ও ছবি সাথে আনুন।',
    '🪪', false, 5, true),
  ((select id from public.service_categories where slug = 'passport-nid'),
    'অনলাইনে GD-এর আবেদন', 'General Diary (GD)', 'gd-application',
    'অনলাইনে সাধারণ ডায়েরি করার আবেদন।',
    'হারানো নথি বা অন্যান্য প্রয়োজনে অনলাইনে GD করার আবেদন করিয়ে দেই।',
    'ঘটনার বিবরণ ও প্রয়োজনীয় তথ্য সাথে আনুন।',
    '🪪', false, 6, true),

  ((select id from public.service_categories where slug = 'travel-visa'),
    'বিমান টিকিট ও তারিখ পরিবর্তন', 'Air Ticket & Date Change', 'air-ticket-date-change',
    'বিমানের টিকিট কেনা ও তারিখ পরিবর্তন।',
    'দেশি-বিদেশি সব ফ্লাইটের টিকিট করিয়ে দেই এবং প্রয়োজনে টিকিটের তারিখ পরিবর্তনও করা হয়।',
    'পাসপোর্ট ও প্রয়োজনীয় তথ্য নিয়ে আসুন।',
    '✈️', false, 1, true),
  ((select id from public.service_categories where slug = 'travel-visa'),
    'ভারতের ভিসার আবেদন', 'India Visa Application', 'india-visa',
    'ভারত ভ্রমণের ভিসার আবেদন।',
    'ভারতের ভিসার জন্য অনলাইন আবেদন, অ্যাপয়েন্টমেন্ট ও প্রয়োজনীয় কাগজপত্রের সহায়তা দেই।',
    'পাসপোর্ট, ছবি ও অন্যান্য প্রয়োজনীয় কাগজপত্র সাথে আনুন।',
    '✈️', true, 2, true),
  ((select id from public.service_categories where slug = 'travel-visa'),
    'বিভিন্ন দেশের ভিসা চেক', 'Visa Check', 'visa-check',
    'বিভিন্ন দেশে ভিসার প্রয়োজনীয়তা যাচাই।',
    'কোন দেশে ভ্রমণের জন্য কী কী লাগবে, ভিসার ধরন ও প্রক্রিয়া সম্পর্কে সঠিক তথ্য দেই।',
    'যে দেশে যাবেন তার পাসপোর্ট উল্লেখ করুন।',
    '✈️', false, 3, true),

  ((select id from public.service_categories where slug = 'land-services'),
    'জমির মিউটেশনের আবেদন', 'Land Mutation', 'land-mutation',
    'জমির নামজারি / মিউটেশনের অনলাইন আবেদন।',
    'জমির মালিকানা পরিবর্তনে অনলাইনে মিউটেশন (নামজারি) আবেদন করিয়ে দেই।',
    'দলিল, খতিয়ান ও অন্যান্য কাগজপত্র সাথে আনুন।',
    '🌾', true, 1, true),
  ((select id from public.service_categories where slug = 'land-services'),
    'খাজনা প্রদান', 'Land Tax (Khajna) Payment', 'khajna-payment',
    'জমির খাজনা অনলাইনে পরিশোধ।',
    'জমির বার্ষিক খাজনা অনলাইনে পরিশোধ করে রশিদ প্রদান করা হয়।',
    'জমির মালিকের তথ্য ও মোবাইল নম্বর লাগবে।',
    '🌾', false, 2, true),
  ((select id from public.service_categories where slug = 'land-services'),
    'জমির খতিয়ান / পর্চা উত্তোলন', 'Khatian / Parcha', 'khatian-parcha',
    'জমির খতিয়ান ও পর্চা উত্তোলন।',
    'জমির খতিয়ান ও পর্চার অনলাইন উত্তোলন করে দেই।',
    'জমির খতিয়ান নম্বর / এসএ ফর্ম নম্বর জানতে হবে।',
    '🌾', false, 3, true),
  ((select id from public.service_categories where slug = 'land-services'),
    'জমি ক্রয় ও বিক্রয়', 'Land Buy & Sell', 'land-buy-sell',
    'জমি ক্রয় এবং বিক্রয়ের সহায়তা।',
    'জমি কেনা-বেচার ক্ষেত্রে নথি যাচাই, চুক্তিপত্র ও রেজিস্ট্রেশনের প্রয়োজনীয় সহায়তা প্রদান করি।',
    'জমির সব নথিপত্র সাথে আনুন; নথি যাচাই করে সহায়তা দেওয়া হয়।',
    '🌾', false, 4, true),

  ((select id from public.service_categories where slug = 'bmet'),
    'বিদেশগামীদের BMET কার্ড', 'BMET Card', 'bmet-card',
    'বিদেশ যাত্রীদের BMET কার্ড সংগ্রহ।',
    'বিদেশে কাজ করতে যাওয়া শ্রমিকদের BMET কার্ড ও জরুরি ব্যবস্থার সহায়তা দেই।',
    'পাসপোর্ট ও প্রয়োজনীয় কাগজপত্র সাথে আনুন।',
    '🌍', false, 1, true),
  ((select id from public.service_categories where slug = 'bmet'),
    'PDO প্রশিক্ষণের আবেদন', 'PDO Training Application', 'pdo-training',
    'PDO প্রশিক্ষণের অনলাইন আবেদন।',
    'বিদেশগমনের জন্য PDO প্রশিক্ষণের আবেদন করিয়ে দেই।',
    'পাসপোর্ট ও ছবি সাথে আনুন।',
    '🌍', false, 2, true),

  ((select id from public.service_categories where slug = 'jobs'),
    'অনলাইনে চাকরির আবেদন', 'Online Job Application', 'job-application',
    'সরকারি-বেসরকারি চাকরির অনলাইন আবেদন।',
    'চাকরির বিজ্ঞপ্তি অনুযায়ী অনলাইন আবেদন, ফি জমা ও প্রয়োজনীয় তথ্য প্রদানে সহায়তা করি।',
    'সিভি ও প্রয়োজনীয় সনদপত্র নিয়ে আসুন।',
    '💼', false, 1, true),

  ((select id from public.service_categories where slug = 'education'),
    'স্কুল-কলেজের ভর্তি আবেদন', 'School & College Admission', 'school-admission',
    'শিক্ষাপ্রতিষ্ঠানে ভর্তির অনলাইন আবেদন।',
    'স্কুল-কলেজে ভর্তির জন্য অনলাইন আবেদন ও বাছাই সহায়তা দেই।',
    'জন্মনিবন্ধন, ছবি ও অভিভাবকের তথ্য সাথে আনুন।',
    '🎓', false, 1, true),

  ((select id from public.service_categories where slug = 'computer-services'),
    'ই-মেইল', 'E-mail Services', 'email-service',
    'ই-মেইল খোলা ও প্রয়োজনীয় কাজ।',
    'ই-মেইল অ্যাকাউন্ট খোলা এবং দরকারি ই-মেইল সংক্রান্ত কাজ করে দেই।',
    'মোবাইল নম্বর সাথে আনুন।',
    '💻', false, 1, true),
  ((select id from public.service_categories where slug = 'computer-services'),
    'বিভিন্ন চুক্তিপত্র', 'Agreements & Contracts', 'agreements',
    'বিভিন্ন ধরনের চুক্তিপত্র তৈরি।',
    'দরকার অনুযায়ী চুক্তিপত্র, দরপত্র ও অন্যান্য নথি কম্পোজ করা হয়।',
    'চুক্তির বিবরণ ও প্রয়োজনীয় তথ্য আনুন।',
    '💻', false, 2, true),
  ((select id from public.service_categories where slug = 'computer-services'),
    'কম্পিউটার কম্পোজ', 'Computer Composition', 'computer-compose',
    'যেকোনো নথি বা বইয়ের কম্পিউটার কম্পোজ।',
    'দরখাস্ত, প্রতিবেদন, বই কিংবা যেকোনো নথির কম্পিউটার কম্পোজ ও প্রিন্ট করা হয়।',
    'আসল নথি / খসড়া সাথে আনুন।',
    '💻', false, 3, true),
  ((select id from public.service_categories where slug = 'computer-services'),
    'লেমিনেটিং', 'Laminating', 'laminating',
    'নথিপত্র লেমিনেটিং ও প্লাস্টিক জ্যাকেট।',
    'প্রয়োজনীয় নথিপত্র লেমিনেটিং করে দেওয়া হয়।',
    'লেমিনেট করতে চাওয়া নথি আনুন।',
    '💻', false, 4, true),

  ((select id from public.service_categories where slug = 'ticket-service'),
    'অনলাইন রেল টিকিট', 'Online Rail Ticket', 'rail-ticket',
    'অনলাইনে ট্রেনের টিকিট বুকিং।',
    'কাউন্টার ছাড়াই অনলাইনে রেল টিকিট বুকিং করিয়ে দেই।',
    'যাত্রীর নাম ও NID / জন্ম নিবন্ধন নম্বর জানিয়ে আসুন।',
    '🚆', true, 1, true),
  ((select id from public.service_categories where slug = 'ticket-service'),
    'বিমান টিকিট', 'Air Ticket', 'air-ticket',
    'দেশি-বিদেশি ফ্লাইটের টিকিট।',
    'সব এয়ারলাইন্সের বিমান টিকিট সাশ্রয়ী মূল্যে করিয়ে দেই।',
    'পাসপোর্ট ও গন্তব্য ঠিকানা জানিয়ে আসুন।',
    '🚆', false, 2, true),

  ((select id from public.service_categories where slug = 'other-online'),
    'বিদ্যুৎ মিটারের আবেদন', 'Electric Meter Application', 'electric-meter',
    'নতুন বিদ্যুৎ সংযোগ ও মিটারের আবেদন।',
    'নতুন বিদ্যুৎ সংযোগ, মিটার অর্পণ ও পরিবর্তনের আবেদন করিয়ে দেই।',
    'বাড়ির মালিকের জাতীয় পরিচয়পত্র ও মোবাইল নম্বর লাগবে।',
    '⚡', false, 1, true),
  ((select id from public.service_categories where slug = 'other-online'),
    'TIN Certificate', 'TIN Certificate', 'tin-certificate',
    'TIN সার্টিফিকেট সংগ্রহ।',
    'নতুন TIN সার্টিফিকেট সংগ্রহ ও e-TIN সংক্রান্ত সেবা দেই।',
    'NID ও মোবাইল নম্বর সাথে আনুন।',
    '⚡', false, 2, true),
  ((select id from public.service_categories where slug = 'other-online'),
    'অন্যান্য অনলাইন সেবা', 'Other Online Services', 'other-online-services',
    'উপরের তালিকার বাইরে অন্যান্য অনলাইন সেবা।',
    'প্রয়োজন অনুযায়ী অন্যান্য যেকোনো অনলাইন সেবা দেওয়া হয়। যোগাযোগ করে জানিয়ে দিন কী দরকার।',
    'সেবার ধরন অনুযায়ী প্রয়োজনীয় কাগজপত্র আনুন।',
    '⚡', false, 3, true)
on conflict (slug) do nothing;

-- --- Required documents --------------------------------------------------
insert into public.service_documents (service_id, document_name, note, display_order) values
  ((select id from public.services where slug = 'passport-application'), 'NID', '', 1),
  ((select id from public.services where slug = 'passport-application'), 'প্রয়োজনীয় ব্যক্তিগত তথ্য', '', 2),
  ((select id from public.services where slug = 'passport-application'), 'মোবাইল নম্বর', '', 3),
  ((select id from public.services where slug = 'nid-application'), 'জন্মনিবন্ধন সনদ', '', 1),
  ((select id from public.services where slug = 'nid-application'), 'ছবি', '', 2),
  ((select id from public.services where slug = 'nid-application'), 'মোবাইল নম্বর', '', 3),
  ((select id from public.services where slug = 'nid-correction'), 'NID', '', 1),
  ((select id from public.services where slug = 'nid-correction'), 'জন্মনিবন্ধন সনদ', '', 2),
  ((select id from public.services where slug = 'nid-correction'), 'ভুল সংশোধনের প্রমাণপত্র', '', 3),
  ((select id from public.services where slug = 'india-visa'), 'পাসপোর্ট', '', 1),
  ((select id from public.services where slug = 'india-visa'), 'ছবি', '', 2),
  ((select id from public.services where slug = 'india-visa'), 'ফ্লাইট ও হোটেল বুকিংয়ের কাগজ', '', 3),
  ((select id from public.services where slug = 'land-mutation'), 'দলিল', '', 1),
  ((select id from public.services where slug = 'land-mutation'), 'খতিয়ান', '', 2),
  ((select id from public.services where slug = 'land-mutation'), 'এসএ ফর্ম', '', 3),
  ((select id from public.services where slug = 'rail-ticket'), 'যাত্রীর নাম', '', 1),
  ((select id from public.services where slug = 'rail-ticket'), 'NID / জন্ম নিবন্ধন নম্বর', '', 2),
  ((select id from public.services where slug = 'rail-ticket'), 'মোবাইল নম্বর', '', 3)
on conflict do nothing;

-- --- Notices --------------------------------------------------------------
insert into public.notices (title, type, description, related_service_id, cta_text, cta_url, pinned, show_on_homepage, published) values
  ('নতুন সুবিধা যুক্ত হয়েছে', 'facility',
   'এখন থেকে আমাদের এখানে অনলাইন রেল টিকিটের সেবা পাওয়া যাচ্ছে। কাউন্টার ছাড়াই ঘরে বসে টিকিট।',
   (select id from public.services where slug = 'rail-ticket'),
   'রেল টিকিট সেবা দেখুন', '/services/rail-ticket', true, true, true),
  ('পাসপোর্ট ও NID সেবা চলছে', 'service_update',
   'পাসপোর্টের আবেদন, নতুন ভোটারসহ সব NID সেবা নিয়মিত চলছে। প্রয়োজনীয় কাগজপত্র নিয়ে দোকানে আসুন।',
   (select id from public.services where slug = 'passport-application'),
   'সেবাগুলো দেখুন', '/services', false, true, true),
  ('দোকানের নতুন পরিচিতি', 'important',
   'সালথা বাজার, ফরিদপুরে বিশ্বস্ত অনলাইন সেবা কেন্দ্র মাস্টার্স কম্পিউটার। প্রতিদিন সকাল ৯টা থেকে রাত ৯টা পর্যন্ত সেবা পাওয়া যায়।',
   null, '', '', false, true, true)
on conflict do nothing;

-- --- FAQs -------------------------------------------------------------------
insert into public.faqs (question, answer, link_label, link_url, display_order, active) values
  ('দোকান কখন খোলা?', 'সপ্তাহে শনিবার থেকে শুক্রবার পর্যন্ত সকাল ৯টা থেকে রাত ৯টা পর্যন্ত দোকান খোলা থাকে। শুক্রবার দোকান বন্ধ থাকে। লাইভ খোলা-বন্ধের অবস্থা দেখুন।', 'দোকানের বর্তমান অবস্থা দেখুন', '/status', 1, true),
  ('পাসপোর্টের জন্য কী কী লাগবে?', 'পাসপোর্টের আবেদনের জন্য NID বা জন্মনিবন্ধন, প্রয়োজনীয় ব্যক্তিগত তথ্য ও মোবাইল নম্বর লাগে। বিস্তারিত দেখুন।', 'পাসপোর্ট সেবা দেখুন', '/services/passport-application', 2, true),
  ('NID সংশোধনের জন্য কী কী লাগবে?', 'NID, জন্মনিবন্ধন সনদ ও যে তথ্য সংশোধন করতে চান তার প্রমাণপত্র লাগে।', 'NID সংশোধন সেবা দেখুন', '/services/nid-correction', 3, true),
  ('দোকানের ঠিকানা কোথায়?', 'সালথা বাজার, ফরিদপুর। মানচিত্রে লোকেশন দেখুন।', 'লোকেশন দেখুন', '/location', 4, true),
  ('অনলাইনে রেল টিকিট পাওয়া যায়?', 'হ্যাঁ, আমাদের মাধ্যমে অনলাইনে রেল টিকিট বুকিং করা যায়। যাত্রীর নাম এবং NID/জন্ম নিবন্ধন নম্বর জানিয়ে আসুন।', 'রেল টিকিট সেবা দেখুন', '/services/rail-ticket', 5, true)
on conflict do nothing;

-- --- Site settings ------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('documents_note', 'প্রয়োজনীয় কাগজপত্র সেবার ধরন অনুযায়ী পরিবর্তিত হতে পারে। সঠিক তালিকার জন্য দোকানে যোগাযোগ করুন।'),
  ('home_about_title', 'আমাদের সম্পর্কে'),
  ('home_services_title', 'আমাদের সেবাসমূহ'),
  ('home_facilities_title', 'নতুন সুবিধা'),
  ('home_exclusive_title', 'বিশেষ সেবাসমূহ')
on conflict (key) do nothing;

-- =====================================================================
-- Done. You can now run the app and scripts/setup-admin.mjs
-- =====================================================================
