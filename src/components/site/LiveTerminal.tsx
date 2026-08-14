'use client'

import { useEffect, useReducer, useSyncExternalStore } from 'react'

const BN = '০১২৩৪৫৬৭৮৯'
const padBn = (n: number) =>
  String(n).padStart(2, '0').replace(/[0-9]/g, (d) => BN[Number(d)])

const emptySubscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

function useMounted() {
  return useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot)
}

function nowDhaka() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  return { h: get('hour'), m: get('minute'), s: get('second') }
}

export default function LiveTerminal({
  emoji,
  label,
  countdown,
}: {
  emoji: string
  label: string
  countdown: { kind: 'open' | 'close'; atMin: number } | null
}) {
  const mounted = useMounted()
  const [, tick] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const { h, m, s } = nowDhaka()
  let total = 0
  if (countdown) {
    total = countdown.atMin * 60 - (h * 3600 + m * 60 + s)
    if (total < 0) total += 24 * 3600
  }
  const clock = `${padBn(h)}:${padBn(m)}:${padBn(s)}`

  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-md overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="h-2 w-2 rounded-full bg-red-400/90" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/90" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
        <span className="ml-2 text-[10px] font-mono font-bold text-brand-200">mc@masters-computer</span>
        <span className="ml-auto text-[10px] font-mono text-brand-300/70">bash — লাইভ স্ট্যাটাস</span>
      </div>

      {/* Terminal body */}
      <div className="px-3.5 py-3 font-mono text-[13px] leading-relaxed">
        <div className="text-brand-100">
          <span className="text-gold-400">$</span> mc status --live
        </div>
        <div className="mt-1 text-white font-semibold">
          {emoji} {label}
        </div>
        {countdown && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-brand-100">
            <span>{countdown.kind === 'close' ? '⏳ বন্ধ হতে বাকি' : '⏰ খোলা হতে বাকি'}</span>
            {mounted ? (
              <span className="font-extrabold tracking-widest text-gold-300" dir="ltr">
                {padBn(Math.floor(total / 3600))}:{padBn(Math.floor((total % 3600) / 60))}:
                {padBn(total % 60)}
              </span>
            ) : (
              <span dir="ltr">--:--:--</span>
            )}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2 text-brand-300/80">
          <span className="text-gold-400">$</span>
          <span className="text-[11px]">ঢাকা সময়: {mounted ? clock : '--:--:--'}</span>
          <span className="ml-1 inline-block h-3.5 w-2 animate-pulse bg-gold-400/90" />
        </div>
      </div>
    </div>
  )
}