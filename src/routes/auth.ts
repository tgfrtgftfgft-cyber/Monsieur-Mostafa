import { Hono } from 'hono'
import { fsGet, fsSet, fsUpdate, fromFsDoc, sha256, normalizePhone, isValidEgyptPhone } from '../firebase'

export const authRoutes = new Hono()

/**
 * تخزين المستخدمين في Firestore:
 * users/{phone} => { name, phone, parentPhone, email, governorate, city, grade,
 *                    isAzhari, passwordHash, verified, verifyStatus, telegramPhone,
 *                    telegramChatId, deviceId, createdAt }
 * tg_codes/{code} => { phone, createdAt }   ← ربط كود البدء بالمستخدم
 */

// ============ التسجيل ============
authRoutes.post('/register', async (c) => {
  const b = await c.req.json().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'بيانات غير صالحة' })

  const name = String(b.name || '').trim()
  const phone = normalizePhone(String(b.phone || ''))
  const parentPhone = normalizePhone(String(b.parentPhone || ''))
  const email = String(b.email || '').trim()
  const governorate = String(b.governorate || '').trim()
  const city = String(b.city || '').trim()
  const grade = String(b.grade || '').trim()
  const isAzhari = !!b.isAzhari
  const password = String(b.password || '')

  // فاليديشن من السيرفر
  if (name.split(/\s+/).filter(Boolean).length < 3)
    return c.json({ ok: false, field: 'reg-name', step: 1, error: 'اكتب اسمك الثلاثي كاملًا' })
  if (!isValidEgyptPhone(phone))
    return c.json({ ok: false, field: 'reg-phone', step: 1, error: 'رقم هاتف غير صحيح' })
  if (!isValidEgyptPhone(parentPhone) || parentPhone === phone)
    return c.json({ ok: false, field: 'reg-parent-phone', step: 1, error: 'رقم هاتف الوالد غير صحيح أو مطابق لرقمك' })
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return c.json({ ok: false, field: 'reg-email', step: 1, error: 'بريد إلكتروني غير صحيح' })
  if (!governorate) return c.json({ ok: false, field: 'reg-gov', step: 2, error: 'اختر المحافظة' })
  if (!city) return c.json({ ok: false, field: 'reg-city', step: 2, error: 'اكتب المدينة' })
  if (!grade) return c.json({ ok: false, field: 'reg-grade', step: 2, error: 'اختر الصف' })
  if (password.length < 6)
    return c.json({ ok: false, field: 'reg-password', step: 3, error: 'كلمة المرور 6 أحرف على الأقل' })

  // هل الرقم مسجل قبل كدا؟
  const existing = await fsGet(`users/${phone}`)
  if (existing) return c.json({ ok: false, field: 'reg-phone', step: 1, error: 'هذا الرقم مسجل بالفعل — سجل دخولك' })

  const passwordHash = await sha256(password + '::mostafa-salt')
  const verifyCode = 'v' + Math.random().toString(36).slice(2, 10)

  const saveRes: any = await fsSet(`users/${phone}`, {
    name, phone, parentPhone, email, governorate, city, grade, isAzhari,
    passwordHash,
    verified: false,
    verifyStatus: 'pending', // pending | verified | mismatch | skipped
    telegramPhone: '',
    telegramChatId: '',
    deviceId: '',
    createdAt: new Date().toISOString()
  })
  if (saveRes?.error) {
    return c.json({ ok: false, error: 'خطأ في الاتصال بقاعدة البيانات — حاول مرة أخرى أو تواصل مع الدعم' })
  }
  await fsSet(`tg_codes/${verifyCode}`, { phone, createdAt: new Date().toISOString() })

  return c.json({ ok: true, verifyCode })
})

// ============ تخطي التأكيد (ليس لدي تلجرام) ============
authRoutes.post('/skip-verify', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const user = await fsGet(`users/${phone}`)
  if (!user) return c.json({ ok: false })
  await fsUpdate(`users/${phone}`, { verifyStatus: 'skipped', verified: false })
  return c.json({ ok: true })
})

// ============ فحص حالة التأكيد (polling) ============
authRoutes.get('/check-verify', async (c) => {
  const phone = normalizePhone(c.req.query('phone') || '')
  const doc = await fsGet(`users/${phone}`)
  const user = fromFsDoc(doc)
  if (!user) return c.json({ verified: false })
  const verified = user.verifyStatus === 'verified' || user.verifyStatus === 'mismatch'
  return c.json({ verified, mismatch: user.verifyStatus === 'mismatch' })
})

// ============ اعتماد رقم التلجرام بدل الرقم المسجل ============
authRoutes.post('/use-telegram-phone', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const oldPhone = normalizePhone(String(b.phone || ''))
  const doc = await fsGet(`users/${oldPhone}`)
  const user = fromFsDoc(doc)
  if (!user || !user.telegramPhone) return c.json({ ok: false })

  const newPhone = normalizePhone(user.telegramPhone)
  if (newPhone !== oldPhone && isValidEgyptPhone(newPhone)) {
    // انسخ الحساب للرقم الجديد واحذف القديم
    await fsSet(`users/${newPhone}`, { ...user, phone: newPhone, verified: true, verifyStatus: 'verified' })
    const { fsDelete } = await import('../firebase')
    await fsDelete(`users/${oldPhone}`)
  } else {
    await fsUpdate(`users/${oldPhone}`, { verified: true, verifyStatus: 'verified' })
  }
  return c.json({ ok: true })
})

// ============ بيانات المستخدم الحالي (للمنزل) ============
authRoutes.post('/me', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const deviceId = String(b.deviceId || '')

  const doc = await fsGet(`users/${phone}`)
  const user = fromFsDoc(doc)
  if (!user) return c.json({ ok: false, reason: 'not_found' })
  if (user.banned) return c.json({ ok: false, reason: 'banned' })
  // نظام الجهاز الواحد: لو الجهاز المخزن مختلف عن الحالي → خروج إجباري
  if (user.deviceId && deviceId && user.deviceId !== deviceId)
    return c.json({ ok: false, reason: 'device_conflict' })

  return c.json({
    ok: true,
    user: {
      name: user.name, phone: user.phone, parentPhone: user.parentPhone,
      email: user.email || '', governorate: user.governorate || '', city: user.city || '',
      grade: user.grade, isAzhari: !!user.isAzhari,
      verified: user.verifyStatus === 'verified',
      verifyStatus: user.verifyStatus || 'pending',
      createdAt: user.createdAt || ''
    }
  })
})

// ============ تسجيل الدخول ============
authRoutes.post('/login', async (c) => {
  const b = await c.req.json().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'بيانات غير صالحة' })

  const phone = normalizePhone(String(b.phone || ''))
  const password = String(b.password || '')
  const deviceId = String(b.deviceId || '')

  const doc = await fsGet(`users/${phone}`)
  const user = fromFsDoc(doc)
  if (!user) return c.json({ ok: false, error: 'الرقم ده مش مسجل عندنا — اعمل حساب جديد' })

  const passwordHash = await sha256(password + '::mostafa-salt')

  // هل دخل بكلمة السر المؤقتة (من استرجاع تلجرام)؟
  let viaTempPass = false
  if (user.passwordHash !== passwordHash) {
    const tempHash = String(user.tempPassHash || '')
    const tempExp = String(user.tempPassExpiresAt || '')
    if (tempHash && tempHash === passwordHash) {
      if (!tempExp || new Date(tempExp).getTime() < Date.now()) {
        return c.json({ ok: false, error: 'كلمة المرور المؤقتة انتهت صلاحيتها (ساعتين) — اعمل استرجاع جديد من البوت' })
      }
      viaTempPass = true
    } else {
      return c.json({ ok: false, error: 'كلمة المرور غير صحيحة' })
    }
  }

  if (user.banned) return c.json({ ok: false, error: 'هذا الحساب محظور — تواصل مع الدعم' })

  // نظام الجهاز الواحد: أول دخول يسجل الجهاز، وأي جهاز جديد يستبدل القديم (يسجل خروج القديم)
  await fsUpdate(`users/${phone}`, { deviceId, lastLoginAt: new Date().toISOString() })

  return c.json({
    ok: true,
    mustChangePassword: viaTempPass || !!user.mustChangePassword,
    session: {
      phone: user.phone, name: user.name, grade: user.grade,
      verified: user.verifyStatus === 'verified', deviceId
    }
  })
})

// ============ تغيير كلمة المرور (بعد الدخول بكلمة مؤقتة أو من الإعدادات) ============
authRoutes.post('/change-password', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const newPassword = String(b.newPassword || '')
  const confirm = String(b.confirm || '')

  if (newPassword.length < 6) return c.json({ ok: false, error: 'كلمة المرور 6 أحرف على الأقل' })
  if (newPassword !== confirm) return c.json({ ok: false, error: 'كلمتا المرور غير متطابقتين' })

  const doc = await fsGet(`users/${phone}`)
  const user = fromFsDoc(doc)
  if (!user) return c.json({ ok: false, error: 'الحساب غير موجود' })

  const newHash = await sha256(newPassword + '::mostafa-salt')
  await fsUpdate(`users/${phone}`, {
    passwordHash: newHash,
    tempPassHash: '',
    tempPassExpiresAt: '',
    mustChangePassword: false,
    passwordChangedAt: new Date().toISOString()
  })
  return c.json({ ok: true })
})
