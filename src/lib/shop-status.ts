import type {
  BreakTime,
  BusinessHours,
  Holiday,
  ShopStatusOverride,
  SpecialDay,
} from '@/types/db'
import { DAYS_BN, TIMEZONE } from '@/lib/constants'
import { minToTime, parseTimeToMin } from '@/lib/format'

// ---------------------------------------------------------------- types

export type StatusKind =
  | 'open'
  | 'closed'
  | 'break'
  | 'closing_soon'
  | 'holiday'
  | 'temp_closed'
  | 'force_open'
  | 'force_closed'

export type DhakaWall = {
  year: number
  month: number // 1-12
  day: number
  dateKey: string // YYYY-MM-DD
  weekday: number // 0 = Saturday ... 6 = Friday
  minutesOfDay: number
  secondsWithinMinute: number
}

export type ShopStatusInput = {
  hours: BusinessHours[]
  breaks: BreakTime[]
  holidays: Holiday[]
  specialDays: SpecialDay[]
  override: ShopStatusOverride | null
}

export type CountdownTarget = {
  kind: 'open' | 'close'
  atMin: number // minutes of day (Dhaka wall clock)
  label?: string
}

export type ShopStatusResult = {
  kind: StatusKind
  emoji: string
  label: string
  detail: string
  todayOpen: string | null // HH:mm
  todayClose: string | null
  isOpenToday: boolean
  countdown: CountdownTarget | null
  resumeDate: string | null
  reason: string
}

// ---------------------------------------------------------------- wall clock

export function getDhakaWall(now: Date): DhakaWall {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value
      return acc
    }, {})

  const h = Number(parts.hour)
  const m = Number(parts.minute)
  const s = Number(parts.second)
  // JS weekday: Sun=0..Sat=6 → ours: Sat=0..Fri=6
  const jsWeekday = new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day)
  ).getDay()
  const ourWeekday = (jsWeekday + 1) % 7

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: ourWeekday,
    minutesOfDay: h * 60 + m,
    secondsWithinMinute: s,
  }
}

// ---------------------------------------------------------------- engine

export function computeShopStatus(input: ShopStatusInput, now: Date = new Date()): ShopStatusResult {
  const wall = getDhakaWall(now)

  // --- temporary override --------------------------------------------------
  if (input.override && input.override.status !== 'normal') {
    const o = input.override
    if (o.status === 'temp_closed') {
      return {
        kind: 'temp_closed',
        emoji: '🔴',
        label: 'সাময়িকভাবে বন্ধ',
        detail: o.message || 'দোকান সাময়িকভাবে বন্ধ রয়েছে।',
        todayOpen: null,
        todayClose: null,
        isOpenToday: false,
        countdown: null,
        resumeDate: o.resume_date,
        reason: o.message || '',
      }
    }
    if (o.status === 'force_open') {
      return {
        kind: 'force_open',
        emoji: '🟢',
        label: 'এখন দোকান খোলা',
        detail: o.message || 'বিশেষ কারণে আজ দোকান খোলা রয়েছে।',
        todayOpen: null,
        todayClose: null,
        isOpenToday: true,
        countdown: null,
        resumeDate: null,
        reason: o.message || '',
      }
    }
    return {
      kind: 'force_closed',
      emoji: '🔴',
      label: 'এখন দোকান বন্ধ',
      detail: o.message || 'বিশেষ কারণে আজ দোকান বন্ধ রয়েছে।',
      todayOpen: null,
      todayClose: null,
      isOpenToday: false,
      countdown: null,
      resumeDate: null,
      reason: o.message || '',
    }
  }

  // --- holiday --------------------------------------------------------------
  const holiday = input.holidays.find((h) => h.date === wall.dateKey)
  if (holiday) {
    const detail = holiday.title ? `${holiday.title}${holiday.description ? '। ' + holiday.description : ''}` : 'আজ দোকান বন্ধ।'
    return {
      kind: 'holiday',
      emoji: '🔴',
      label: 'আজ দোকান বন্ধ',
      detail,
      todayOpen: null,
      todayClose: null,
      isOpenToday: false,
      countdown: null,
      resumeDate: null,
      reason: detail,
    }
  }

  // --- special day -----------------------------------------------------------
  const special = input.specialDays.find((s) => s.date === wall.dateKey)
  if (special) {
    return evaluateWindow(
      wall,
      parseTimeToMin(special.open_time),
      parseTimeToMin(special.close_time),
      input,
      special.reason ? `বিশেষ দিন: ${special.reason}` : '',
      special.open_time,
      special.close_time
    )
  }

  // --- weekly hours ----------------------------------------------------------
  const day = input.hours.find((h) => h.day_of_week === wall.weekday)
  if (!day || !day.is_open) {
    const next = findNextOpening(input, wall)
    return {
      kind: 'closed',
      emoji: '🔴',
      label: 'এখন দোকান বন্ধ',
      detail: next
        ? `আগামীকাল ${next.dayName} ${formatOpenMin(next.open)} খোলা হবে।`
        : 'দোকান বর্তমানে বন্ধ।',
      todayOpen: null,
      todayClose: null,
      isOpenToday: false,
      countdown: { kind: 'open', atMin: next?.open ?? 9 * 60, label: next?.dayName },
      resumeDate: null,
      reason: '',
    }
  }

  return evaluateWindow(
    wall,
    parseTimeToMin(day.open_time),
    parseTimeToMin(day.close_time),
    input,
    '',
    day.open_time,
    day.close_time
  )
}

function evaluateWindow(
  wall: DhakaWall,
  openMin: number,
  closeMin: number,
  input: ShopStatusInput,
  extraDetail: string,
  openTimeRaw: string,
  closeTimeRaw: string
): ShopStatusResult {
  const nowMin = wall.minutesOfDay

  if (nowMin < openMin) {
    return {
      kind: 'closed',
      emoji: '🔴',
      label: 'এখন দোকান বন্ধ',
      detail: `আজ ${formatOpen(openTimeRaw)} খোলা হবে।`,
      todayOpen: minToTime(openMin),
      todayClose: minToTime(closeMin),
      isOpenToday: true,
      countdown: { kind: 'open', atMin: openMin },
      resumeDate: null,
      reason: extraDetail,
    }
  }

  if (nowMin >= closeMin) {
    const next = findNextOpening(input, wall)
    return {
      kind: 'closed',
      emoji: '🔴',
      label: 'এখন দোকান বন্ধ',
      detail: next
        ? `আগামীকাল ${next.dayName} ${formatOpenMin(next.open)} খোলা হবে।`
        : 'দোকান বর্তমানে বন্ধ।',
      todayOpen: minToTime(openMin),
      todayClose: minToTime(closeMin),
      isOpenToday: true,
      countdown: next ? { kind: 'open', atMin: next.open, label: next.dayName } : null,
      resumeDate: null,
      reason: extraDetail,
    }
  }

  // inside the open window — check breaks
  const dayBreaks = input.breaks.filter((b) => b.day_of_week === wall.weekday)
  const activeBreak = dayBreaks.find(
    (b) => nowMin >= parseTimeToMin(b.start_time) && nowMin < parseTimeToMin(b.end_time)
  )

  if (activeBreak) {
    return {
      kind: 'break',
      emoji: '🟡',
      label: 'সাময়িক বিরতি চলছে',
      detail: activeBreak.title && activeBreak.title !== 'বিরতি' ? activeBreak.title : 'কিছুক্ষণের মধ্যে আবার সেবা পাওয়া যাবে।',
      todayOpen: minToTime(openMin),
      todayClose: minToTime(closeMin),
      isOpenToday: true,
      countdown: {
        kind: 'close',
        atMin: closeMin,
        label: 'বিরতি শেষে ছুটির সময়',
      },
      resumeDate: null,
      reason: extraDetail,
    }
  }

  if (closeMin - nowMin <= CLOSING_SOON_MINUTES) {
    return {
      kind: 'closing_soon',
      emoji: '🟠',
      label: 'শীঘ্রই বন্ধ হবে',
      detail: `আজ রাত ${formatOpen(closeTimeRaw)} পর্যন্ত খোলা।`,
      todayOpen: minToTime(openMin),
      todayClose: minToTime(closeMin),
      isOpenToday: true,
      countdown: { kind: 'close', atMin: closeMin, label: 'বন্ধ হতে বাকি' },
      resumeDate: null,
      reason: extraDetail,
    }
  }

  return {
    kind: 'open',
    emoji: '🟢',
    label: 'এখন দোকান খোলা',
    detail: `আজকের সময়: ${formatOpen(openTimeRaw)} — ${formatOpen(closeTimeRaw)}`,
    todayOpen: minToTime(openMin),
    todayClose: minToTime(closeMin),
    isOpenToday: true,
    countdown: { kind: 'close', atMin: closeMin, label: 'বন্ধ হতে বাকি' },
    resumeDate: null,
    reason: extraDetail,
  }
}

const CLOSING_SOON_MINUTES = 30

type NextOpening = { dayName: string; open: number }

function findNextOpening(input: ShopStatusInput, wall: DhakaWall): NextOpening | null {
  for (let i = 1; i <= 8; i++) {
    const d = new Date(
      Date.UTC(wall.year, wall.month - 1, wall.day + i, 12, 0, 0)
    )
    const dateKey = d.toISOString().slice(0, 10)
    if (input.holidays.some((h) => h.date === dateKey)) continue
    const special = input.specialDays.find((s) => s.date === dateKey)
    if (special) {
      return {
        dayName: DAYS_BN[(d.getUTCDay() + 1) % 7],
        open: parseTimeToMin(special.open_time),
      }
    }
    const weekday = (d.getUTCDay() + 1) % 7
    const day = input.hours.find((h) => h.day_of_week === weekday)
    if (day && day.is_open) {
      return { dayName: DAYS_BN[weekday], open: parseTimeToMin(day.open_time) }
    }
  }
  return null
}

export function formatOpen(time: string): string {
  const min = parseTimeToMin(time)
  return formatOpenMin(min)
}

export function formatOpenMin(min: number): string {
  const h24 = Math.floor(min / 60)
  const m = min % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const mm = m === 0 ? '' : `:${String(m).padStart(2, '0')}`
  let period = 'রাত'
  if (h24 >= 5 && h24 < 12) period = 'সকাল'
  else if (h24 >= 12 && h24 < 16) period = 'দুপুর'
  else if (h24 >= 16 && h24 < 19) period = 'বিকাল'
  const bn = '০১২৩৪৫৬৭৮৯'
  const nums = (s: string) => s.replace(/[0-9]/g, (d) => bn[Number(d)])
  return `${period} ${nums(String(h12) + mm)}`
}