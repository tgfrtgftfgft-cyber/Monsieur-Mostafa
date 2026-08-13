import { Hono } from 'hono'
import { CONFIG, FIRESTORE_BASE } from '../config'
import { fromFsDoc, fsGet, fsSet, fsUpdate, fsDelete, normalizePhone } from '../firebase'
import { getAllCourses, getCourseContent } from './courses'
import { getActivity } from './track'

export const adminRoutes = new Hono()

const ADMIN_PASSWORD = '123321'

// ===== حماية: كل الطلبات لازم تبعت كلمة السر في الهيدر =====
adminRoutes.use('*', async (c, next) => {
  // مسار الدخول نفسه بيتحقق من الباسورد في الجسم
  if (c.req.path.endsWith('/login')) return next()
  const pass = c.req.header('x-admin-pass') || ''
  if (pass !== ADMIN_PASSWORD) return c.json({ ok: false, error: 'غير مصرح' }, 401)
  await next()
})

// ===== دخول الإشراف =====
adminRoutes.post('/login', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  if (String(b.password || '') !== ADMIN_PASSWORD) {
    return c.json({ ok: false, error: 'كلمة سر الإشراف غلط' })
  }
  return c.json({ ok: true })
})

// ===== قراءة مجموعة كاملة من Firestore =====
async function listCollection(name: string): Promise<any[]> {
  const out: any[] = []
  let pageToken = ''
  try {
    for (let i = 0; i < 10; i++) {
      const url = `${FIRESTORE_BASE}/${name}?pageSize=300&key=${CONFIG.FIREBASE.apiKey}` + (pageToken ? `&pageToken=${pageToken}` : '')
      const res = await fetch(url)
      const data: any = await res.json()
      if (data?.documents?.length) {
        for (const d of data.documents) {
          const obj = fromFsDoc(d) || {}
          out.push({ _id: d.name.split('/').pop(), ...obj })
        }
      }
      if (!data?.nextPageToken) break
      pageToken = data.nextPageToken
    }
  } catch (_) {}
  return out
}

// ===== إحصائيات لوحة التحكم (مع رسوم يومية) =====
adminRoutes.get('/stats', async (c) => {
  const [users, enrollments, activities] = await Promise.all([
    listCollection('users'),
    listCollection('enrollments'),
    listCollection('student_activity')
  ])

  // تجميع النشاط اليومي لآخر 14 يوم
  const days: string[] = []
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))

  const loginsPerDay = days.map(() => 0)
  const videosPerDay = days.map(() => 0)
  for (const a of activities) {
    try {
      const act = JSON.parse(a.json || '{}')
      for (const l of act.logins || []) {
        const idx = days.indexOf(String(l).slice(0, 10))
        if (idx >= 0) loginsPerDay[idx]++
      }
      for (const v of act.videos || []) {
        const idx = days.indexOf(String(v.at || '').slice(0, 10))
        if (idx >= 0) videosPerDay[idx]++
      }
    } catch (_) {}
  }

  const subsPerDay = days.map((d) => enrollments.filter((e) => String(e.requestedAt || '').slice(0, 10) === d).length)
  const regsPerDay = days.map((d) => users.filter((u) => String(u.createdAt || '').slice(0, 10) === d).length)

  return c.json({
    ok: true,
    stats: {
      students: users.length,
      verified: users.filter((u) => u.verifyStatus === 'verified').length,
      enrollments: enrollments.length,
      pending: enrollments.filter((e) => e.status === 'pending').length
    },
    daily: { days, loginsPerDay, videosPerDay, subsPerDay, regsPerDay }
  })
})

// ===== ملف طالب كامل (بيانات + اشتراكات + نشاط للرسوم) =====
adminRoutes.get('/student-profile/:phone', async (c) => {
  const phone = normalizePhone(c.req.param('phone'))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })

  const [userDoc, enrollments, act] = await Promise.all([
    fsGet(`users/${phone}`),
    listCollection('enrollments'),
    getActivity(phone)
  ])
  const user = fromFsDoc(userDoc)
  if (!user) return c.json({ ok: false, error: 'الطالب مش موجود' })

  const myEnrolls = enrollments.filter((e) => e.phone === phone)

  // نشاط آخر 14 يوم
  const days: string[] = []
  const videosPerDay: number[] = []
  const loginsPerDay: number[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    days.push(d)
    videosPerDay.push(act.videos.filter((v) => String(v.at || '').slice(0, 10) === d).length)
    loginsPerDay.push(act.logins.some((l) => String(l).slice(0, 10) === d) ? 1 : 0)
  }

  const avgPct = act.exams.length
    ? Math.round(act.exams.reduce((s, e) => s + (e.pct || 0), 0) / act.exams.length)
    : 0

  return c.json({
    ok: true,
    profile: {
      user: {
        phone, name: user.name || '', parentPhone: user.parentPhone || '',
        grade: user.grade || '', governorate: user.governorate || '', city: user.city || '',
        verifyStatus: user.verifyStatus || 'pending', banned: !!user.banned,
        createdAt: user.createdAt || '', lastLoginAt: user.lastLoginAt || ''
      },
      enrollments: myEnrolls,
      activity: {
        days, videosPerDay, loginsPerDay,
        totalVideos: act.videos.length,
        totalLogins: act.logins.length,
        totalExams: act.exams.length,
        avgPct,
        examScores: act.exams.slice(-12).map((e) => ({ title: e.title || 'امتحان', pct: e.pct || 0, at: e.at })),
        recentVideos: act.videos.slice(-15).reverse()
      }
    }
  })
})

// ===== الطلاب =====
adminRoutes.get('/students', async (c) => {
  const users = await listCollection('users')
  const list = users.map((u) => ({
    phone: u.phone || u._id, name: u.name || '', parentPhone: u.parentPhone || '',
    grade: u.grade || '', governorate: u.governorate || '', city: u.city || '',
    verifyStatus: u.verifyStatus || 'pending', banned: !!u.banned, createdAt: u.createdAt || ''
  }))
  list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return c.json({ ok: true, students: list })
})

adminRoutes.post('/student-update', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })
  const action = String(b.action || '')
  if (action === 'verify') await fsUpdate(`users/${phone}`, { verifyStatus: 'verified' })
  else if (action === 'unverify') await fsUpdate(`users/${phone}`, { verifyStatus: 'pending' })
  else if (action === 'ban') await fsUpdate(`users/${phone}`, { banned: true })
  else if (action === 'unban') await fsUpdate(`users/${phone}`, { banned: false })
  else if (action === 'reset-device') await fsUpdate(`users/${phone}`, { deviceId: '' })
  else if (action === 'delete') await fsDelete(`users/${phone}`)
  else return c.json({ ok: false, error: 'إجراء غير معروف' })
  return c.json({ ok: true })
})

// ===== الاشتراكات =====
adminRoutes.get('/enrollments', async (c) => {
  const enrollments = await listCollection('enrollments')
  enrollments.sort((a, b) => String(b.requestedAt || '').localeCompare(String(a.requestedAt || '')))
  return c.json({ ok: true, enrollments })
})

adminRoutes.post('/enrollment-update', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف مفقود' })
  const action = String(b.action || '')
  if (action === 'activate') await fsUpdate(`enrollments/${id}`, { status: 'active', activatedAt: new Date().toISOString() })
  else if (action === 'deactivate') await fsUpdate(`enrollments/${id}`, { status: 'pending' })
  else if (action === 'delete') await fsDelete(`enrollments/${id}`)
  else return c.json({ ok: false, error: 'إجراء غير معروف' })
  return c.json({ ok: true })
})

// إضافة اشتراك يدوي (المستر يفعّل طالب مباشرة)
adminRoutes.post('/enrollment-add', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const courseId = String(b.courseId || '').trim()
  if (!phone || !courseId) return c.json({ ok: false, error: 'بيانات ناقصة' })
  const courses = await getAllCourses(true)
  const course = courses.find((cs: any) => cs.id === courseId)
  await fsSet(`enrollments/${phone}_${courseId}`, {
    phone, courseId,
    courseTitle: course?.title || courseId,
    price: Number(course?.price || 0),
    status: 'active',
    requestedAt: new Date().toISOString(),
    activatedAt: new Date().toISOString()
  })
  return c.json({ ok: true })
})

// ===== الكورسات =====
adminRoutes.get('/courses', async (c) => {
  const courses = await getAllCourses(true)
  courses.sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
  return c.json({ ok: true, courses })
})

adminRoutes.post('/course-save', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف الكورس مفقود' })
  await fsSet(`courses/${id}`, {
    title: String(b.title || ''),
    desc: String(b.desc || ''),
    price: Number(b.price || 0),
    oldPrice: Number(b.oldPrice || 0),
    grade: String(b.grade || 'all'),
    img: String(b.img || '/static/img/course-term1.webp'),
    order: Number(b.order || 99),
    published: b.published !== false,
    publishAt: String(b.publishAt || ''),
    longDesc: String(b.longDesc || ''),
    discountPct: Number(b.discountPct || 0),
    discountEnd: String(b.discountEnd || '')
  })
  return c.json({ ok: true })
})

adminRoutes.post('/course-delete', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف مفقود' })
  await fsUpdate(`courses/${id}`, { published: false })
  return c.json({ ok: true })
})

// ===== درجات الطلاب في الامتحانات =====
adminRoutes.get('/exam-results', async (c) => {
  const bankId = String(c.req.query('bankId') || '')
  const results = await listCollection('exam_results')
  let list = results
  if (bankId) list = results.filter((r) => r.bankId === bankId || r.examId === bankId)
  list.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
  return c.json({ ok: true, results: list.slice(0, 300) })
})

// ===== مين فاتح المنصة دلوقتي (آخر 5 دقايق) =====
adminRoutes.get('/online', async (c) => {
  const users = await listCollection('users')
  const cutoff = Date.now() - 5 * 60 * 1000
  const online = users
    .filter((u) => u.lastSeenAt && new Date(u.lastSeenAt).getTime() > cutoff)
    .map((u) => ({ phone: u.phone || u._id, name: u.name || '', grade: u.grade || '', lastSeenAt: u.lastSeenAt }))
  return c.json({ ok: true, online, total: users.length })
})

// ===== تصفير نشاط طالب (مسح البيانات التجريبية/الوهمية) =====
adminRoutes.post('/clear-activity', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })
  await fsDelete(`student_activity/${phone}`)
  const results = await listCollection('exam_results')
  for (const r of results.filter((x) => x.phone === phone)) {
    try { await fsDelete(`exam_results/${r._id}`) } catch (_) {}
  }
  return c.json({ ok: true })
})

// ===== محتوى الكورس (المحاضرات) =====
adminRoutes.get('/content/:id', async (c) => {
  const courseId = c.req.param('id')
  const content = await getCourseContent(courseId)
  return c.json({ ok: true, content })
})

adminRoutes.post('/content-save', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const courseId = String(b.courseId || '').trim()
  if (!courseId) return c.json({ ok: false, error: 'معرّف الكورس مفقود' })
  const content = b.content
  if (!content || !Array.isArray(content.lectures)) return c.json({ ok: false, error: 'صيغة المحتوى غلط' })
  await fsSet(`course_content/${courseId}`, {
    json: JSON.stringify(content),
    updatedAt: new Date().toISOString()
  })
  return c.json({ ok: true })
})

// ===== ملف الطالب الموسع: كل درجاته + الأسئلة اللي غلط فيها =====
adminRoutes.get('/student-exams/:phone', async (c) => {
  const phone = normalizePhone(c.req.param('phone'))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })
  const act = await getActivity(phone)
  const exams = (act.exams || []).map((e: any, i: number) => ({
    i,
    title: e.title || 'امتحان',
    lecture: e.lecture || '',
    courseId: e.courseId || '',
    bankId: e.bankId || '',
    score: e.score || 0,
    total: e.total || 0,
    pct: e.pct || 0,
    at: e.at || '',
    wrong: Array.isArray(e.wrong) ? e.wrong : []
  }))
  return c.json({ ok: true, exams })
})

// ===== ملفات المنهج لكل سنة دراسية (تغذي تحليل الذكاء الاصطناعي) =====
adminRoutes.get('/curriculum', async (c) => {
  const list = await listCollection('curriculum_files')
  return c.json({ ok: true, files: list.map((f: any) => ({ id: f._id, grade: f.grade || '', title: f.title || '', size: (f.content || '').length, updatedAt: f.updatedAt || '' })) })
})

adminRoutes.get('/curriculum/:id', async (c) => {
  const doc = fromFsDoc(await fsGet(`curriculum_files/${c.req.param('id')}`))
  if (!doc) return c.json({ ok: false, error: 'الملف مش موجود' })
  return c.json({ ok: true, file: doc })
})

adminRoutes.post('/curriculum-save', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim() || 'cur_' + Date.now()
  const grade = String(b.grade || '').trim()
  const title = String(b.title || '').trim()
  const content = String(b.content || '')
  if (!grade || !title || content.length < 30) return c.json({ ok: false, error: 'اختار السنة واكتب اسم الملف والصق محتواه (فقرة على الأقل)' })
  await fsSet(`curriculum_files/${id}`, {
    grade, title,
    content: content.slice(0, 400000),
    updatedAt: new Date().toISOString()
  })
  return c.json({ ok: true, id })
})

adminRoutes.post('/curriculum-delete', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف مفقود' })
  await fsDelete(`curriculum_files/${id}`)
  return c.json({ ok: true })
})

// ===== تحليل أخطاء الطالب بالذكاء الاصطناعي (مربوط بملفات المنهج) =====
adminRoutes.post('/analyze-student', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const grade = String(b.grade || '').trim()
  if (!phone || !grade) return c.json({ ok: false, error: 'اختار الطالب والسنة الدراسية' })

  const act = await getActivity(phone)
  const wrongAll: any[] = []
  for (const e of act.exams || []) {
    for (const w of (e.wrong || [])) wrongAll.push({ exam: e.title || '', q: w.q, chosen: w.chosen, correct: w.correct })
  }
  if (!wrongAll.length) return c.json({ ok: false, error: 'مفيش أخطاء مسجلة للطالب ده — لازم يحل امتحانات الأول (بنظام تسجيل الأخطاء الجديد)' })

  const files = (await listCollection('curriculum_files')).filter((f: any) => f.grade === grade)
  if (!files.length) return c.json({ ok: false, error: 'مفيش ملفات منهج متسجلة للسنة دي — ضيفها من قسم الذكاء الاصطناعي الأول' })

  const curriculum = files.map((f: any) => `### ${f.title}\n${String(f.content || '').slice(0, 8000)}`).join('\n\n').slice(0, 20000)

  const { callAI, extractJson } = await import('../ai')
  const sys =
    'إنت محلل تعليمي خبير في اللغة الفرنسية لطلاب مصر. هتاخد أخطاء طالب في الامتحانات + ملفات المنهج، ' +
    'وتحدد بدقة أماكن الضعف في المنهج (الصفحات والدروس لو مذكورة في الملفات). ' +
    'رد بس بصيغة JSON: {' +
    '"lessons":[{"title":"اسم الدرس/الصفحة من ملفات المنهج","how":"إزاي يذاكره صح — خطوات عملية"}],' +
    '"weaknesses":[{"point":"نقطة الضعف","solution":"الحل العملي"}],' +
    '"stats":{"byTopic":[{"topic":"اسم الموضوع","wrongCount":عدد الأخطاء}],"summary":"ملخص سطرين بالعربي"}' +
    '} — كل الكلام بالعربي المصري البسيط، والدروس لازم تكون من ملفات المنهج المرفقة فعلًا.'

  const userMsg = 'أخطاء الطالب:\n' + JSON.stringify(wrongAll.slice(0, 60)) + '\n\nملفات المنهج:\n' + curriculum
  const r = await callAI(c.env, { system: sys, user: userMsg })
  if (!r.ok) return c.json({ ok: false, error: r.error })
  const parsed = extractJson(r.content)
  if (!parsed) return c.json({ ok: false, error: 'التحليل رجّع رد غير مفهوم — جرب تاني' })
  return c.json({
    ok: true,
    analysis: {
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons.slice(0, 12) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 12) : [],
      stats: parsed.stats || {},
      wrongCount: wrongAll.length
    }
  })
})

// ===== تحليلات عامة: أكثر الأسئلة غلطًا بين كل الطلاب =====
adminRoutes.get('/analytics/most-missed', async (c) => {
  const results = await listCollection('exam_results')
  const map: Record<string, { q: string; correct: string; count: number; exams: Set<string> }> = {}
  for (const r of results) {
    let wrong: any[] = []
    try { wrong = JSON.parse(r.wrong || '[]') } catch (_) {}
    for (const w of wrong) {
      const key = String(w.q || '').slice(0, 200)
      if (!key) continue
      if (!map[key]) map[key] = { q: key, correct: String(w.correct || ''), count: 0, exams: new Set() }
      map[key].count++
      if (r.title) map[key].exams.add(String(r.title))
    }
  }
  const list = Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40)
    .map((m) => ({ q: m.q, correct: m.correct, count: m.count, exams: [...m.exams].slice(0, 5) }))
  return c.json({ ok: true, missed: list, totalResults: results.length })
})

// ===== كل الامتحانات/البنوك الموجودة في النتائج (لإصلاح فلتر الدرجات) =====
adminRoutes.get('/exam-filters', async (c) => {
  const results = await listCollection('exam_results')
  const map: Record<string, { key: string; title: string; bankId: string; count: number }> = {}
  for (const r of results) {
    const key = String(r.bankId || r.examId || r.title || '')
    if (!key) continue
    if (!map[key]) map[key] = { key, title: String(r.title || key), bankId: String(r.bankId || ''), count: 0 }
    map[key].count++
  }
  return c.json({ ok: true, filters: Object.values(map).sort((a, b) => b.count - a.count) })
})
