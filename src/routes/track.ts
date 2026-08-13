import { Hono } from 'hono'
import { fromFsDoc, fsGet, fsSet, fsUpdate, normalizePhone } from '../firebase'

export const trackRoutes = new Hono()

// ===== قراءة سجل نشاط طالب =====
export async function getActivity(phone: string): Promise<{ logins: string[]; videos: any[]; exams: any[] }> {
  const doc = fromFsDoc(await fsGet(`student_activity/${phone}`))
  if (doc && doc.json) {
    try {
      const a = JSON.parse(doc.json)
      return { logins: a.logins || [], videos: a.videos || [], exams: a.exams || [] }
    } catch (_) {}
  }
  return { logins: [], videos: [], exams: [] }
}

async function saveActivity(phone: string, act: { logins: string[]; videos: any[]; exams: any[] }) {
  // نحافظ على حجم معقول للمستند
  if (act.logins.length > 400) act.logins = act.logins.slice(-400)
  if (act.videos.length > 500) act.videos = act.videos.slice(-500)
  if (act.exams.length > 200) act.exams = act.exams.slice(-200)
  await fsSet(`student_activity/${phone}`, { json: JSON.stringify(act), updatedAt: new Date().toISOString() })
}

// ===== تسجيل حدث (دخول / فتح فيديو / نتيجة امتحان) =====
trackRoutes.post('/event', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const type = String(b.type || '')
  if (!phone || !type) return c.json({ ok: false, error: 'بيانات ناقصة' })

  const act = await getActivity(phone)
  const now = new Date().toISOString()

  if (type === 'login') {
    // دخول واحد محسوب لكل يوم
    const today = now.slice(0, 10)
    if (!act.logins.some((d) => String(d).slice(0, 10) === today)) act.logins.push(now)
    else return c.json({ ok: true, skipped: true })
  } else if (type === 'video') {
    act.videos.push({
      courseId: String(b.courseId || ''),
      lecture: String(b.lecture || ''),
      title: String(b.title || ''),
      at: now
    })
  } else if (type === 'exam') {
    // تسجيل الأسئلة اللي غلط فيها الطالب (للتحليل بالذكاء الاصطناعي)
    const wrong = Array.isArray(b.wrong)
      ? b.wrong.slice(0, 100).map((w: any) => ({
          q: String(w.q || '').slice(0, 500),
          chosen: String(w.chosen || '').slice(0, 300),
          correct: String(w.correct || '').slice(0, 300)
        }))
      : []
    const rec = {
      courseId: String(b.courseId || ''),
      lecture: String(b.lecture || ''),
      title: String(b.title || ''),
      examId: String(b.examId || ''),
      bankId: String(b.bankId || ''),
      score: Number(b.score || 0),
      total: Number(b.total || 0),
      pct: Number(b.pct || 0),
      wrong,
      at: now
    }
    act.exams.push(rec)
    // سجل مركزي للدرجات (لقائمة درجات الإشراف)
    try {
      const user = fromFsDoc(await fsGet(`users/${phone}`))
      await fsSet(`exam_results/${phone}_${Date.now()}`, {
        phone,
        name: (user && user.name) || '',
        grade: (user && user.grade) || '',
        ...rec,
        wrong: JSON.stringify(wrong) // Firestore fields لا تدعم المصفوفات في helper بتاعنا
      })
    } catch (_) {}
  } else {
    return c.json({ ok: false, error: 'نوع حدث غير معروف' })
  }

  await saveActivity(phone, act)
  return c.json({ ok: true })
})

// ===== نبضة اتصال (مين فاتح المنصة دلوقتي) =====
trackRoutes.post('/ping', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  if (!phone) return c.json({ ok: false })
  try { await fsUpdate(`users/${phone}`, { lastSeenAt: new Date().toISOString() }) } catch (_) {}
  return c.json({ ok: true })
})

// ===== ملخص نشاط الطالب (لرسومه البيانية في المنزل) =====
trackRoutes.get('/summary', async (c) => {
  const phone = normalizePhone(String(c.req.query('phone') || ''))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })

  const act = await getActivity(phone)

  // فيديوهات آخر 7 أيام (يوم بيوم)
  const days: string[] = []
  const videosPerDay: number[] = []
  const loginsPerDay: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    days.push(d)
    videosPerDay.push(act.videos.filter((v) => String(v.at || '').slice(0, 10) === d).length)
    loginsPerDay.push(act.logins.some((l) => String(l).slice(0, 10) === d) ? 1 : 0)
  }

  const examScores = act.exams.slice(-10).map((e) => ({ title: e.title || 'امتحان', pct: e.pct || 0, at: e.at }))
  const avgPct = act.exams.length
    ? Math.round(act.exams.reduce((s, e) => s + (e.pct || 0), 0) / act.exams.length)
    : 0

  return c.json({
    ok: true,
    summary: {
      days,
      videosPerDay,
      loginsPerDay,
      totalVideos: act.videos.length,
      totalExams: act.exams.length,
      totalLogins: act.logins.length,
      avgPct,
      examScores,
      lastVideos: act.videos.slice(-6).reverse()
    }
  })
})
