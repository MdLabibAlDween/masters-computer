-- =====================================================================
-- Add an admin from the Supabase Auth dashboard (no script needed)
-- =====================================================================
-- Steps:
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--      → enter the owner's email + password → Create user
--   2. Click the new user row and copy its UUID
--      (the "id" column, e.g. 1a2b3c4d-... — also visible in the URL)
--   3. Replace <USER_UUID> and <OWNER_NAME> below, then click Run
-- =====================================================================

insert into public.admin_users (user_id, name, role, active)
values ('<USER_UUID>', '<OWNER_NAME>', 'super_admin', true);

-- If login fails with "Email not confirmed":
--   Supabase Dashboard → Authentication → Providers → Email
--   → turn OFF "Confirm email" (or click the confirmation link
--     that Supabase emailed to the address above).
