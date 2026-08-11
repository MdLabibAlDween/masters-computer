# মাস্টার্স কম্পিউটার — Website + Admin Panel

Next.js 16 + Tailwind CSS v4 + Supabase. Public Bengali website (services, shop status, notices, contact) and a password-protected admin panel at `/admin`.

## 1. First-time setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` (do not commit):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only; used ONLY by scripts/setup-admin.mjs
```

Values from Supabase Dashboard → Project Settings → API. The service-role key must **never** be prefixed with `NEXT_PUBLIC_` or used in browser code.

## 2. Create the database

1. Open the Supabase SQL Editor.
2. Paste the entire contents of `supabase/schema.sql` and run it.
3. This creates all tables (services, categories, documents, notices, hours, breaks, holidays, special days, status override, requests, appointments, contacts, FAQs, settings, admins), RLS policies, the `site-assets` storage bucket, and Bengali seed data.

## 3. Create the first Super Admin

```bash
npm run setup-admin -- "owner@email.com" "a-strong-password" "Owner Name"
```

This uses the service-role key locally to create the auth user and link it in `admin_users` with the `super_admin` role. Alternative (manual): create the user in Supabase Auth dashboard, then run:

```sql
insert into public.admin_users (user_id, name, role) values ('<auth-user-uuid>', 'Owner', 'super_admin');
```

## 4. Run locally

```bash
npm run dev     # http://localhost:3000
npm run lint    # eslint
npm run build   # production build
```

- Public site: `/` (home), `/services`, `/status`, `/notices`, `/documents`, `/about`, `/faq`, `/contact`, `/location`
- Admin panel: `/admin` — login with the super admin credentials

## 5. Production checks (Supabase Dashboard)

- **Authentication → URL Configuration**: set Site URL to your site; add `http://localhost:3000/admin/reset-password` and `https://<your-domain>/admin/reset-password` to Redirect URLs (password-reset emails need this).
- **Authentication → Providers**: Email is enabled by default.
- **Storage**: bucket `site-assets` is created by the schema; nothing to do.

## 6. Deploy to Vercel (recommended)

1. Push this repo to GitHub:
   ```bash
   git init                      # already done
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. Import the repo at vercel.com → New Project (Next.js preset, auto-detected).
3. Add environment variables in Vercel → Project → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Do not** add `SUPABASE_SERVICE_ROLE_KEY` unless you move admin-user creation to a server route.
4. Deploy. After the first deploy, update the Supabase Auth redirect URLs (step 5) with the production domain.

## 7. Owner workflow (no code changes)

Everything is data-driven; the owner updates the site entirely from the admin panel:

| Change | Where |
| --- | --- |
| Opening hours / breaks / holidays / special days | `/admin/shop/*` |
| Force open/close, temporary closure message | `/admin/shop` |
| Add/edit/hide/reorder services + documents | `/admin/services` |
| Categories | `/admin/categories` |
| Notices, facility announcements | `/admin/notices` |
| Phone, email, address, maps, social links, logo | `/admin/business` |
| FAQ & homepage texts | `/admin/settings` |
| Manage admin users (super admin only) | `/admin/admins` |
| Handle requests/appointments/contact messages | `/admin/requests`, `/admin/appointments`, `/admin/contacts` |

Shop status (🟢 খোলা / 🔴 বন্ধ / 🟡 বিরতি / 🟠 শীঘ্রই বন্ধ / 🎉 ছুটির দিন / ⛔ সাময়িক বন্ধ) is computed automatically in **Asia/Dhaka** and updates on the website instantly.