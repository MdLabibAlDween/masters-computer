const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

export function toBn(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])
}

// "HH:MM(:SS)" → minutes of day
export function parseTimeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// 09:00 → "সকাল ৯:০০", 21:00 → "রাত ৯:০০"
export function formatTimeBn(time: string): string {
  const min = parseTimeToMin(time)
  const h24 = Math.floor(min / 60)
  const m = min % 60
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  let period = 'রাত'
  if (h24 >= 5 && h24 < 12) period = 'সকাল'
  else if (h24 >= 12 && h24 < 16) period = 'দুপুর'
  else if (h24 >= 16 && h24 < 19) period = 'বিকাল'
  return `${period} ${toBn(h12)}:${toBn(String(m).padStart(2, '0'))}`
}

export function formatDateBn(date: string): string {
  // date: YYYY-MM-DD
  const [y, m, d] = date.split('-').map(Number)
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ]
  return `${toBn(d)} ${months[(m || 1) - 1]} ${toBn(y)}`
}

export function formatDurationBn(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${toBn(h)} ঘণ্টা`)
  if (m > 0) parts.push(`${toBn(m)} মিনিট`)
  return parts.join(' ') || `০ মিনিট`
}