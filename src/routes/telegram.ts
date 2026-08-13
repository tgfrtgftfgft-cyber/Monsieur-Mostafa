import { Hono } from 'hono'
import { TG_API, FIRESTORE_BASE, CONFIG } from '../config'
import { fsGet, fsSet, fsUpdate, fsDelete, fromFsDoc, normalizePhone, sha256 } from '../firebase'

export const telegramRoutes = new Hono()

/**
 * جلسات البوت في Firestore:
 * tg_sessions/{chatId} => { mode: 'verify'|'verify_any'|'forgot_parent'|'forgot_name', phone?, parentPhone?, updatedAt }
 * tg_codes/{code} => { phone } — كود بدء التحقق من صفحة التسجيل
 */

async function tgSend(chatId: number | string, text: string, extra: Record<string, any> = {}) {
  await fetch(`${TG_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra })
  })
}

const contactKeyboard = {
  reply_markup: {
    keyboard: [[{ text: '📱 مشاركة رقمي للتأكيد', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
}

const removeKeyboard = { reply_markup: { remove_keyboard: true } }

// استخراج رقم موبايل مصري من نص مختلط (حتى لو معه اسم أو أسطر متعددة)
function extractEgyptPhone(text: string): string {
  const cleaned = text.replace(/[+\-()]/g, '').replace(/^0020/, '0').replace(/(^|\s)20(1[0125]\d{8})/g, '$10$2')
  const m = cleaned.match(/01[0125]\d{8}/)
  return m ? m[0] : ''
}

// أول كلمتين من الاسم للمطابقة المرنة
function firstTwo(name: string): string {
  return name.replace(/\s+/g, ' ').trim().split(' ').slice(0, 2).join(' ')
}

// ============ معالجة خطوة الاسم في استعادة كلمة المرور ============
async function handleForgotName(c: any, chatId: number, rawName: string, session: Record<string, any>) {
  let user: Record<string, any> | null = null
  let userPhone = ''

  // بحث Firestore: runQuery على parentPhone
  const q = await fetch(`${FIRESTORE_BASE.replace(/\/documents$/, '')}/documents:runQuery?key=${CONFIG.FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'parentPhone' },
            op: 'EQUAL',
            value: { stringValue: session.parentPhone }
          }
        },
        limit: 5
      }
    })
  })
  const results: any[] = await q.json().catch(() => [])
  const nameNorm = rawName.replace(/\s+/g, ' ').trim()
  const nameTwo = firstTwo(nameNorm)

  for (const r of results) {
    if (!r.document) continue
    const u = fromFsDoc(r.document)
    if (!u) continue
    const uName = String(u.name || '').replace(/\s+/g, ' ').trim()
    const uTwo = firstTwo(uName)
    if (
      uName === nameNorm ||
      uName.includes(nameNorm) || nameNorm.includes(uName) ||
      (nameTwo && uTwo && (uTwo === nameTwo || uName.includes(nameTwo) || nameNorm.includes(uTwo)))
    ) {
      user = u
      userPhone = String(u.phone || '')
      break
    }
  }

  await fsDelete(`tg_sessions/${chatId}`)

  if (!user || !userPhone) {
    await tgSend(chatId,
      '❌ <b>مش لاقيين حساب مطابق</b> للبيانات دي.\n\nاتأكد من رقم الوالد والاسم زي ما هما مسجلين بالظبط وجرب تاني بـ /forgot\nأو تواصل مع الدعم: ' + CONFIG.SITE.phone)
    return c.json({ ok: true })
  }

  // ===== نظام كلمات السر المؤقتة =====
  // لكل طالب 3 محاولات استرجاع فقط، وكل كلمة سر مؤقتة صالحة ساعتين وفريدة لكل طالب
  const resetCount = Number(user.passwordResetCount || 0)
  if (resetCount >= 3) {
    await tgSend(chatId,
      '⛔ <b>وصلت للحد الأقصى (3 مرات) لاسترجاع كلمة المرور.</b>\n\nتواصل مع الدعم لفك القفل: ' + CONFIG.SITE.phone)
    return c.json({ ok: true })
  }

  // كلمة سر مؤقتة فريدة (مش ثابتة لكل الطلاب) — صالحة ساعتين فقط
  const rand = crypto.getRandomValues(new Uint32Array(2))
  const tempPass = 'ms' + rand[0].toString(36).slice(0, 4) + rand[1].toString(36).slice(0, 4)
  const tempHash = await sha256(tempPass + '::mostafa-salt')
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  await fsUpdate(`users/${userPhone}`, {
    tempPassHash: tempHash,
    tempPassExpiresAt: expiresAt,
    mustChangePassword: true,
    passwordResetCount: resetCount + 1,
    passwordResetAt: new Date().toISOString()
  })

  await tgSend(chatId,
    `✅ <b>تم التحقق من بياناتك يا ${firstTwo(String(user.name || ''))}!</b>\n\n🔑 كلمة المرور المؤقتة:\n<code>${tempPass}</code>\n\n⏰ <b>صالحة لمدة ساعتين فقط</b>\n🔁 استخدمت ${resetCount + 1} من 3 محاولات استرجاع\n\n🔒 أول ما تسجل دخول هيطلب منك كتابة كلمة سر جديدة.\n\n<b>منصة مسيو مصطفى</b> 🇫🇷`)
  return c.json({ ok: true })
}

// ============ الويب هوك ============
telegramRoutes.post('/webhook', async (c) => {
  const update: any = await c.req.json().catch(() => null)
  if (!update) return c.json({ ok: true })

  const msg = update.message
  if (!msg || !msg.chat) return c.json({ ok: true })

  const chatId = msg.chat.id
  const text: string = (msg.text || '').trim()

  try {
    // ---------- /start ----------
    if (text.startsWith('/start')) {
      const param = text.split(/\s+/)[1] || ''

      if (param === 'forgot') {
        await fsSet(`tg_sessions/${chatId}`, { mode: 'forgot_parent', updatedAt: new Date().toISOString() })
        await tgSend(chatId,
          '🔑 <b>استعادة كلمة المرور</b>\n\nمن فضلك ابعت <b>رقم هاتف الوالد</b> المسجل في حسابك:',
          removeKeyboard)
        return c.json({ ok: true })
      }

      if (param.startsWith('v')) {
        const codeDoc = fromFsDoc(await fsGet(`tg_codes/${param}`))
        if (!codeDoc || !codeDoc.phone) {
          // الكود غير صالح → نحوّل لتأكيد مباشر بدل رسالة الخطأ
          await fsSet(`tg_sessions/${chatId}`, { mode: 'verify_any', updatedAt: new Date().toISOString() })
          await tgSend(chatId,
            '👋 أهلًا بيك في <b>منصة مسيو مصطفى</b>!\n\nمش مشكلة الكود — نقدر نأكد رقمك مباشرةً ✅\nاضغط الزر تحت وشارك رقم تليفونك 👇',
            contactKeyboard)
          return c.json({ ok: true })
        }
        await fsSet(`tg_sessions/${chatId}`, { mode: 'verify', phone: codeDoc.phone, updatedAt: new Date().toISOString() })
        await tgSend(chatId,
          `👋 أهلًا بيك في <b>منصة مسيو مصطفى</b>!\n\nعشان نأكد رقمك، اضغط على الزر تحت وشارك رقم تليفونك 👇`,
          contactKeyboard)
        return c.json({ ok: true })
      }

      // /start بدون كود → تأكيد مباشر بمشاركة الرقم
      await fsSet(`tg_sessions/${chatId}`, { mode: 'verify_any', updatedAt: new Date().toISOString() })
      await tgSend(chatId,
        '👋 أهلًا بيك في بوت <b>منصة مسيو مصطفى</b>! 🇫🇷\n\n✅ <b>لتأكيد حسابك:</b> اضغط الزر تحت وشارك رقم تليفونك.\n🔑 <b>لاستعادة كلمة المرور:</b> ابعت /forgot',
        contactKeyboard)
      return c.json({ ok: true })
    }

    if (text === '/forgot') {
      await fsSet(`tg_sessions/${chatId}`, { mode: 'forgot_parent', updatedAt: new Date().toISOString() })
      await tgSend(chatId, '🔑 <b>استعادة كلمة المرور</b>\n\nمن فضلك ابعت <b>رقم هاتف الوالد</b> المسجل في حسابك:', removeKeyboard)
      return c.json({ ok: true })
    }

    // ---------- استلام جهة الاتصال (تأكيد الرقم) ----------
    if (msg.contact) {
      // لازم تكون جهة اتصال المستخدم نفسه
      if (msg.contact.user_id && msg.contact.user_id !== msg.from?.id) {
        await tgSend(chatId, '⚠️ لازم تشارك <b>رقمك أنت</b> مش رقم حد تاني. اضغط الزر تاني 👇', contactKeyboard)
        return c.json({ ok: true })
      }

      const tgPhone = normalizePhone(msg.contact.phone_number || '')
      const session = fromFsDoc(await fsGet(`tg_sessions/${chatId}`))

      // ===== تأكيد مباشر بدون كود (verify_any أو مفيش جلسة) =====
      if (!session || session.mode === 'verify_any' || !session.phone) {
        const user = fromFsDoc(await fsGet(`users/${tgPhone}`))
        if (user) {
          await fsUpdate(`users/${tgPhone}`, {
            verified: true, verifyStatus: 'verified',
            telegramPhone: tgPhone, telegramChatId: String(chatId)
          })
          await tgSend(chatId,
            `✅ <b>تم تأكيد حسابك بنجاح يا ${firstTwo(String(user.name || ''))}!</b>\n\nتقدر دلوقتي تدخل المنصة وتستفيد بكل المميزات 🎉\n\n<b>منصة مسيو مصطفى</b> 🇫🇷`,
            removeKeyboard)
        } else {
          await tgSend(chatId,
            `⚠️ <b>الرقم ده مش مسجل عندنا</b>\n\nرقم التلجرام: <code>${tgPhone}</code>\n\nلو سجلت برقم مختلف، ادخل من صفحة التسجيل في المنصة واضغط زر التأكيد من هناك.\nولو لسه معملتش حساب، سجل الأول من المنصة.`,
            removeKeyboard)
        }
        await fsDelete(`tg_sessions/${chatId}`)
        return c.json({ ok: true })
      }

      // ===== تأكيد بكود من صفحة التسجيل =====
      const regPhone = normalizePhone(session.phone)
      const user = fromFsDoc(await fsGet(`users/${regPhone}`))
      if (!user) {
        await tgSend(chatId, '⚠️ مش لاقيين حسابك. ارجع لصفحة التسجيل وحاول تاني.', removeKeyboard)
        await fsDelete(`tg_sessions/${chatId}`)
        return c.json({ ok: true })
      }

      if (tgPhone === regPhone) {
        await fsUpdate(`users/${regPhone}`, {
          verified: true, verifyStatus: 'verified',
          telegramPhone: tgPhone, telegramChatId: String(chatId)
        })
        await tgSend(chatId,
          '✅ <b>تم تأكيد رقمك بنجاح!</b>\n\nارجع لصفحة التسجيل في المنصة وكمّل — أهلًا بيك معانا 🎉',
          removeKeyboard)
      } else {
        await fsUpdate(`users/${regPhone}`, {
          verifyStatus: 'mismatch',
          telegramPhone: tgPhone, telegramChatId: String(chatId)
        })
        await tgSend(chatId,
          `⚠️ <b>الرقم مختلف!</b>\n\nرقم التلجرام: <code>${tgPhone}</code>\nالرقم المسجل: <code>${regPhone}</code>\n\nارجع لصفحة التسجيل في المنصة واختار: تغيير رقمك لرقم التلجرام أو الاستمرار بالرقم المسجل.`,
          removeKeyboard)
      }
      await fsDelete(`tg_sessions/${chatId}`)
      return c.json({ ok: true })
    }

    // ---------- خطوات استعادة كلمة المرور ----------
    const session = fromFsDoc(await fsGet(`tg_sessions/${chatId}`))

    if (session && session.mode === 'forgot_parent' && text) {
      // استخرج الرقم حتى لو الرسالة فيها اسم أو أسطر متعددة
      const parentPhone = extractEgyptPhone(text)
      if (!parentPhone) {
        await tgSend(chatId, '⚠️ الرقم مش صحيح. ابعت رقم هاتف الوالد بصيغة 01XXXXXXXXX:')
        return c.json({ ok: true })
      }

      // لو الرسالة فيها اسم كمان (كلمتين أو أكثر بعد إزالة الرقم) → كمّل مباشرةً
      const remaining = text.replace(/[+\-()0-9]/g, ' ').replace(/\s+/g, ' ').trim()
      const nameWords = remaining.split(' ').filter(w => w.length >= 2)
      if (nameWords.length >= 2) {
        return await handleForgotName(c, chatId, nameWords.join(' '), { mode: 'forgot_name', parentPhone })
      }

      await fsUpdate(`tg_sessions/${chatId}`, { mode: 'forgot_name', parentPhone })
      await tgSend(chatId, '👤 تمام! دلوقتي ابعت <b>اسمك الثلاثي</b> زي ما هو مسجل في المنصة:')
      return c.json({ ok: true })
    }

    if (session && session.mode === 'forgot_name' && text) {
      return await handleForgotName(c, chatId, text, session)
    }

    // ---------- أي رسالة أخرى ----------
    if (text) {
      // لو الرسالة تحتوي رقم + اسم بدون جلسة → اعتبرها استعادة كلمة مرور مباشرة
      const maybePhone = extractEgyptPhone(text)
      const remaining = text.replace(/[+\-()0-9]/g, ' ').replace(/\s+/g, ' ').trim()
      const nameWords = remaining.split(' ').filter(w => w.length >= 2)
      if (maybePhone && nameWords.length >= 2) {
        return await handleForgotName(c, chatId, nameWords.join(' '), { mode: 'forgot_name', parentPhone: maybePhone })
      }

      await tgSend(chatId,
        'ℹ️ الأوامر المتاحة:\n• /start — تأكيد حسابك (مشاركة رقمك)\n• /forgot — استعادة كلمة المرور\n\nأو ابعت رقم الوالد + اسمك الثلاثي في رسالة واحدة لاستعادة كلمة المرور.')
    }
  } catch (e) {
    // لا نرجع خطأ للتلجرام حتى لا يعيد الإرسال بلا نهاية
  }

  return c.json({ ok: true })
})
