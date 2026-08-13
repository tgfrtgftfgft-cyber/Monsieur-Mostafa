import { CONFIG, FIRESTORE_BASE } from './config'

const KEY = `?key=${CONFIG.FIREBASE.apiKey}`

// ===== تحويل بين JSON العادي وصيغة Firestore =====
export function toFsFields(obj: Record<string, any>) {
  const fields: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) fields[k] = { nullValue: null }
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v }
    else if (typeof v === 'number') fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
    else fields[k] = { stringValue: String(v) }
  }
  return fields
}

export function fromFsDoc(doc: any): Record<string, any> | null {
  if (!doc || !doc.fields) return null
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries<any>(doc.fields)) {
    if ('stringValue' in v) out[k] = v.stringValue
    else if ('integerValue' in v) out[k] = parseInt(v.integerValue)
    else if ('doubleValue' in v) out[k] = v.doubleValue
    else if ('booleanValue' in v) out[k] = v.booleanValue
    else out[k] = null
  }
  return out
}

// ===== عمليات المستندات =====
export async function fsGet(path: string) {
  const r = await fetch(`${FIRESTORE_BASE}/${path}${KEY}`)
  if (r.status === 404) return null
  const j: any = await r.json()
  if (j.error) return null
  return j
}

export async function fsSet(path: string, data: Record<string, any>) {
  // patch ينشئ المستند لو مش موجود
  const r = await fetch(`${FIRESTORE_BASE}/${path}${KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFsFields(data) })
  })
  return r.json()
}

export async function fsUpdate(path: string, data: Record<string, any>) {
  const mask = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
  const r = await fetch(`${FIRESTORE_BASE}/${path}${KEY}&${mask}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFsFields(data) })
  })
  return r.json()
}

export async function fsDelete(path: string) {
  await fetch(`${FIRESTORE_BASE}/${path}${KEY}`, { method: 'DELETE' })
}

// ===== أدوات =====
export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** توحيد صيغة رقم الهاتف المصري إلى 01XXXXXXXXX */
export function normalizePhone(p: string): string {
  let s = (p || '').replace(/[^\d+]/g, '')
  if (s.startsWith('+20')) s = '0' + s.slice(3)
  else if (s.startsWith('0020')) s = '0' + s.slice(4)
  else if (s.startsWith('20') && s.length === 12) s = '0' + s.slice(2)
  return s
}

export function isValidEgyptPhone(p: string): boolean {
  return /^01[0125]\d{8}$/.test(p)
}
