export default function SectionHeading({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle?: string
  icon?: string
}) {
  return (
    <div className="mb-8 text-center">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-slate-500 font-medium max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div className="mt-4 mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-brand-600 to-gold-500" />
    </div>
  )
}