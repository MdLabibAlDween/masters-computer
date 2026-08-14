const BN_VOWELS: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri',
  'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
}

const BN_CONSONANTS: Record<string, string> = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh',
  'ঞ': 'ny', 'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd',
  'ধ': 'dh', 'ন': 'n', 'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'j', 'র': 'r',
  'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h', 'ৎ': 't',
}

const BN_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
}

export function transliterateBn(text: string): string {
  let out = ''
  let prevConsonant = false
  for (const ch of text) {
    // virama (্) — join consonant without vowel sound
    if (ch === '্') continue
    // candrabindu, anusvara, visarga → keep as n/h, no added vowel
    if (ch === 'ঁ' || ch === 'ং') { out += 'n'; prevConsonant = false; continue }
    if (ch === 'ঃ') { out += 'h'; prevConsonant = false; continue }
    if (BN_CONSONANTS[ch]) {
      // inherent 'o' after a consonant (except when followed by vowel sign/virama)
      if (prevConsonant) out += 'o'
      out += BN_CONSONANTS[ch]
      prevConsonant = true
      continue
    }
    if (BN_VOWELS[ch]) {
      out += BN_VOWELS[ch]
      prevConsonant = false
      continue
    }
    if (BN_DIGITS[ch]) { out += BN_DIGITS[ch]; prevConsonant = false; continue }
    if (/\s/.test(ch)) { out += ' '; prevConsonant = false; continue }
    out += ch.toLowerCase()
    prevConsonant = ch.toLowerCase() !== ch.toUpperCase()
  }
  return out
}

export function slugifyBn(text: string): string {
  return transliterateBn(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyAny(displayName: string): string {
  const slug = slugifyBn(displayName)
  return slug || 'service'
}
