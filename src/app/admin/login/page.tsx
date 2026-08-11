import LoginForm from '@/components/admin/LoginForm'

export const metadata = { title: 'অ্যাডমিন লগইন' }

export default async function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700">
      <LoginForm />
    </div>
  )
}