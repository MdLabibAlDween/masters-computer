-- =====================================================================
-- Add an admin from the Supabase Auth dashboard (no script needed)
-- =====================================================================
-- Steps:
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--      → enter the owner's email + password → Create user
--   2. Replace <OWNER_EMAIL> with that exact email and <OWNER_NAME>
--      with the owner's name, then click Run
-- =====================================================================

insert into public.admin_users (user_id, name, role, active)
select id, '<OWNER_NAME>', 'super_admin', true
from auth.users
where email = '<OWNER_EMAIL>';

-- If login fails with "Email not confirmed":
--   Supabase Dashboard → Authentication → Providers → Email
--   → turn OFF "Confirm email" (or click the confirmation link
--     that Supabase emailed to the address above).