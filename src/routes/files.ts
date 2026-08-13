import { Hono } from 'hono'
import { fsGet, fsSet, fsDelete, fromFsDoc } from '../firebase'


/**
 * رفع الملفات على المنصة (Firestore) — مقسمة أجزاء أصغر من نص ميجا
 * file_meta/{id} => { name, type, size, totalChunks, createdAt }
 * file_chunks/{id}_{i} => { data (base64 ≤ 480KB) }
 */
export const filesRoutes = new Hono()

const ADMIN_PASSWORD = '123321'

// رفع جزء (أدمن فقط)
filesRoutes.post('/upload-chunk', async (c) => {
  if (c.req.header('x-admin-pass') !== ADMIN_PASSWORD) return c.json({ ok: false, error: 'غير مصرح' }, 401)
  const b = await c.req.json().catch(() => ({}))
  const uploadId = String(b.uploadId || '').replace(/[^\w-]/g, '')
  const index = Number(b.index)
  const data = String(b.data || '')
  if (!uploadId || isNaN(index) || !data) return c.json({ ok: false, error: 'بيانات ناقصة' })
  if (data.length > 700000) return c.json({ ok: false, error: 'الجزء أكبر من المسموح' })
  const r: any = await fsSet(`file_chunks/${uploadId}_${index}`, { data, index })
  if (r?.error) return c.json({ ok: false, error: 'فشل حفظ الجزء — جرب تاني' })
  return c.json({ ok: true, index })
})

// إنهاء الرفع (أدمن فقط)
filesRoutes.post('/finish', async (c) => {
  if (c.req.header('x-admin-pass') !== ADMIN_PASSWORD) return c.json({ ok: false, error: 'غير مصرح' }, 401)
  const b = await c.req.json().catch(() => ({}))
  const uploadId = String(b.uploadId || '').replace(/[^\w-]/g, '')
  const name = String(b.name || 'file')
  const type = String(b.type || 'application/octet-stream')
  const size = Number(b.size || 0)
  const totalChunks = Number(b.totalChunks || 0)
  if (!uploadId || !totalChunks) return c.json({ ok: false, error: 'بيانات ناقصة' })
  await fsSet(`file_meta/${uploadId}`, { name, type, size, totalChunks, createdAt: new Date().toISOString() })
  return c.json({ ok: true, id: uploadId, url: `/api/files/f/${uploadId}` })
})

// حذف ملف (أدمن فقط)
filesRoutes.post('/delete', async (c) => {
  if (c.req.header('x-admin-pass') !== ADMIN_PASSWORD) return c.json({ ok: false, error: 'غير مصرح' }, 401)
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').replace(/[^\w-]/g, '')
  const meta = fromFsDoc(await fsGet(`file_meta/${id}`))
  if (meta) {
    for (let i = 0; i < Number(meta.totalChunks || 0); i++) await fsDelete(`file_chunks/${id}_${i}`)
    await fsDelete(`file_meta/${id}`)
  }
  return c.json({ ok: true })
})

// تحميل الملف — يفتح في تبويب خارجي
filesRoutes.get('/f/:id', async (c) => {
  const id = c.req.param('id').replace(/[^\w-]/g, '')
  const meta = fromFsDoc(await fsGet(`file_meta/${id}`))
  if (!meta) return c.text('الملف غير موجود', 404)
  const total = Number(meta.totalChunks || 0)
  const parts: Uint8Array[] = []
  for (let i = 0; i < total; i++) {
    const ch = fromFsDoc(await fsGet(`file_chunks/${id}_${i}`))
    if (!ch) return c.text('جزء من الملف مفقود', 500)
    const bin = atob(String(ch.data || ''))
    const arr = new Uint8Array(bin.length)
    for (let j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j)
    parts.push(arr)
  }
  const totalLen = parts.reduce((a, p) => a + p.length, 0)
  const out = new Uint8Array(totalLen)
  let off = 0
  for (const p of parts) { out.set(p, off); off += p.length }
  return new Response(out, {
    headers: {
      'Content-Type': String(meta.type || 'application/octet-stream'),
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(String(meta.name || 'file'))}`,
      'Cache-Control': 'public, max-age=3600'
    }
  })
})
