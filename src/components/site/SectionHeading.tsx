import type { ReactNode } from 'react'
import { WhiteIcon } from './Icons'

export default function SectionHeading({
  title,
  subtitle,
  icon,
  iconSvg,
}: {
  title: string
  subtitle?: string
  icon?: string
  iconSvg?: ReactNode
}) {
  return (
    <div className="mb-10 text-center">
      {(icon || iconSvg) && (
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-3xl shadow-lg shadow-brand-900/30 ring-1 ring-sage-400/60">
          {iconSvg ?? (icon && <WhiteIcon emoji={icon} />)}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2.5 text-slate-500 font-medium max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div className="mt-4 mx-auto h-1.5 w-20 rounded-full bg-gradient-to-r from-gold-500 to-sage-400" />
    </div>
  )
}