import { Hono } from 'hono'
import { CONFIG, FIRESTORE_BASE } from '../config'
import { fromFsDoc, fsGet, fsSet, normalizePhone } from '../firebase'
import { getBank } from './banks'

export const coursesRoutes = new Hono()

// كورسات افتراضية تظهر لو مفيش كورسات في قاعدة البيانات
const DEFAULT_COURSES = [
  {
    id: 'foundation',
    title: 'كورس التأسيس الشامل',
    desc: 'ابدأ الفرنساوي من الصفر — نطق، حروف، قواعد أساسية بطريقة مبسطة.',
    price: 0, oldPrice: 0,
    grade: 'all',
    img: '/static/img/course-foundation.webp',
    order: 1
  },
  {
    id: 'term1',
    title: 'كورس الترم الأول',
    desc: 'شرح كامل لمنهج الترم الأول بالفيديوهات والمذكرات وبنوك الأسئلة.',
    price: 150, oldPrice: 200,
    grade: 'all',
    img: '/static/img/course-term1.webp',
    order: 2
  },
  {
    id: 'conversation',
    title: 'كورس المحادثة',
    desc: 'اتكلم فرنساوي بثقة — جمل وحوارات من الحياة اليومية.',
    price: 100, oldPrice: 0,
    grade: 'all',
    img: '/static/img/course-conversation.webp',
    order: 3
  }
]

// ===== محتوى افتراضي: نظام المحاضرات (كل محاضرة = شريط فيه فيديوهات + ملفات + امتحان) =====
const DEFAULT_CONTENT: Record<string, any> = {
  foundation: {
    lectures: [
      {
        id: 'L1', title: 'المحاضرة الأولى — الحروف والنطق',
        videos: [
          { id: 'v1', title: 'الحروف الفرنسية والنطق الصحيح', youtubeId: '', duration: '25 دقيقة' }
        ],
        files: [
          { id: 'f1', title: 'مذكرة الحروف والنطق', url: '', size: 'PDF' }
        ],
        exam: {
          id: 'e1', title: 'امتحان المحاضرة الأولى',
          questions: [
            { q: 'كام حرف في الأبجدية الفرنسية؟', options: ['24', '26', '28', '30'], answer: 1 },
            { q: 'حرف "ç" اسمه…', options: ['cédille', 'accent', 'tréma', 'apostrophe'], answer: 0 },
            { q: 'إزاي تنطق "eau"؟', options: ['إي', 'أو', 'آ', 'أون'], answer: 1 }
          ]
        }
      },
      {
        id: 'L2', title: 'المحاضرة الثانية — التحيات والتعارف',
        videos: [
          { id: 'v1', title: 'التحيات — Les salutations', youtubeId: '', duration: '18 دقيقة' }
        ],
        files: [
          { id: 'f1', title: 'ورقة تدريبات التحيات', url: '', size: 'PDF' }
        ],
        exam: {
          id: 'e1', title: 'امتحان المحاضرة الثانية',
          questions: [
            { q: 'إزاي تقول "صباح الخير"؟', options: ['Bonsoir', 'Bonjour', 'Bonne nuit', 'Salut'], answer: 1 },
            { q: '"Comment tu t\'appelles ?" معناها…', options: ['عامل إيه؟', 'ساكن فين؟', 'اسمك إيه؟', 'عندك كام سنة؟'], answer: 2 },
            { q: 'كلمة "Merci" معناها…', options: ['من فضلك', 'شكرًا', 'آسف', 'مع السلامة'], answer: 1 }
          ]
        }
      },
      {
        id: 'L3', title: 'المحاضرة الثالثة — الأرقام',
        videos: [
          { id: 'v1', title: 'الأرقام من 1 إلى 100 — Les nombres', youtubeId: '', duration: '20 دقيقة' }
        ],
        files: [],
        exam: {
          id: 'e1', title: 'امتحان الأرقام',
          questions: [
            { q: 'الرقم "dix" هو…', options: ['5', '8', '10', '12'], answer: 2 },
            { q: 'الرقم "vingt" هو…', options: ['15', '20', '25', '30'], answer: 1 }
          ]
        }
      }
    ]
  },
  term1: {
    lectures: [
      {
        id: 'L1', title: 'المحاضرة الأولى — الوحدة الأولى (الدرس الأول)',
        videos: [
          { id: 'v1', title: 'شرح الدرس الأول', youtubeId: '', duration: '30 دقيقة' }
        ],
        files: [
          { id: 'f1', title: 'مذكرة الدرس الأول', url: '', size: 'PDF' }
        ],
        exam: {
          id: 'e1', title: 'امتحان الدرس الأول',
          questions: [
            { q: 'اختر أداة التعريف الصحيحة: ___ livre', options: ['la', 'le', 'les', 'l\''], answer: 1 },
            { q: '"Je suis étudiant" معناها…', options: ['أنا مدرس', 'أنا طالب', 'أنا طبيب', 'أنا مهندس'], answer: 1 }
          ]
        }
      },
      {
        id: 'L2', title: 'المحاضرة الثانية — الوحدة الأولى (الدرس الثاني)',
        videos: [
          { id: 'v1', title: 'شرح الدرس الثاني', youtubeId: '', duration: '28 دقيقة' }
        ],
        files: [
          { id: 'f1', title: 'بنك أسئلة الدرس الثاني', url: '', size: 'PDF' }
        ],
        exam: {
          id: 'e1', title: 'امتحان الدرس الثاني',
          questions: [
            { q: 'جمع كلمة "un cahier" هو…', options: ['des cahiers', 'les cahier', 'un cahiers', 'de cahier'], answer: 0 },
            { q: 'فعل "être" مع "nous" يكون…', options: ['suis', 'es', 'sommes', 'sont'], answer: 2 },
            { q: '"Elle a quinze ans" — عندها كام سنة؟', options: ['13', '14', '15', '16'], answer: 2 }
          ]
        }
      },
      {
        id: 'L3', title: 'المحاضرة الثالثة — قواعد: المذكر والمؤنث',
        videos: [
          { id: 'v1', title: 'Le genre — المذكر والمؤنث', youtubeId: '', duration: '22 دقيقة' }
        ],
        files: [],
        exam: null
      }
    ]
  },
  conversation: {
    lectures: [
      {
        id: 'L1', title: 'المحاضرة الأولى — في المطعم',
        videos: [
          { id: 'v1', title: 'حوار: في المطعم — Au restaurant', youtubeId: '', duration: '15 دقيقة' }
        ],
        files: [
          { id: 'f1', title: 'كتيب جمل المطعم', url: '', size: 'PDF' }
        ],
        exam: {
          id: 'e1', title: 'اختبار حوار المطعم',
          questions: [
            { q: 'إزاي تطلب المنيو في المطعم؟', options: ['La carte, s\'il vous plaît', 'Au revoir', 'Je suis fatigué', 'Quelle heure est-il ?'], answer: 0 },
            { q: '"Je voudrais un café" معناها…', options: ['عايز قهوة', 'عايز شاي', 'عايز مية', 'عايز عصير'], answer: 0 }
          ]
        }
      },
      {
        id: 'L2', title: 'المحاضرة الثانية — التسوق',
        videos: [
          { id: 'v1', title: 'حوار: التسوق — Faire les courses', youtubeId: '', duration: '17 دقيقة' }
        ],
        files: [],
        exam: {
          id: 'e1', title: 'اختبار حوار التسوق',
          questions: [
            { q: '"C\'est combien ?" بتسأل بيها عن…', options: ['الوقت', 'السعر', 'المكان', 'الاسم'], answer: 1 }
          ]
        }
      }
    ]
  }
}

// ===== جلب كل الكورسات من Firestore أو الافتراضي =====
// includeScheduled=true للإشراف (يشوف الكورسات المجدولة قبل موعد نشرها)
export async function getAllCourses(includeScheduled = false): Promise<any[]> {
  let courses: any[] = []
  try {
    const res = await fetch(`${FIRESTORE_BASE}/courses?pageSize=100&key=${CONFIG.FIREBASE.apiKey}`)
    const data: any = await res.json()
    if (data?.documents?.length) {
      courses = data.documents
        .map((d: any) => {
          const obj = fromFsDoc(d) || {}
          const id = d.name.split('/').pop()
          return { id, ...obj }
        })
        .filter((cs: any) => cs.published !== false)
    }
  } catch (_) { /* fallback below */ }
  if (!courses.length) courses = DEFAULT_COURSES
  // إخفاء الكورسات المجدولة (publishAt في المستقبل) عن الطلاب
  if (!includeScheduled) {
    const now = new Date().toISOString()
    courses = courses.filter((cs: any) => !cs.publishAt || String(cs.publishAt) <= now)
  }
  return courses
}

// جلب محتوى كورس (محاضرات) من Firestore أو الافتراضي
export async function getCourseContent(courseId: string): Promise<any> {
  let content: any = null
  try {
    const doc = await fsGet(`course_content/${courseId}`)
    const obj = fromFsDoc(doc)
    if (obj && obj.json) content = JSON.parse(String(obj.json))
  } catch (_) {}
  if (!content) content = DEFAULT_CONTENT[courseId] || { lectures: [] }
  if (!Array.isArray(content.lectures)) content.lectures = []
  return content
}

coursesRoutes.get('/', async (c) => {
  const grade = String(c.req.query('grade') || '').trim()
  let courses = await getAllCourses()

  if (grade) {
    courses = courses.filter((cs: any) => !cs.grade || cs.grade === 'all' || cs.grade === grade)
  }

  courses.sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
  return c.json({ ok: true, courses })
})

// ===== الاشتراك في كورس (تسجيل الطلب فقط — الواجهة تفتح واتساب مباشرة) =====
coursesRoutes.post('/subscribe', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const courseId = String(b.courseId || '').trim()
  if (!phone || !courseId) return c.json({ ok: false, error: 'بيانات ناقصة' })

  const courses = await getAllCourses()
  const course = courses.find((cs: any) => cs.id === courseId)
  if (!course) return c.json({ ok: false, error: 'الكورس ده مش موجود' })

  const docId = `${phone}_${courseId}`
  const existing = fromFsDoc(await fsGet(`enrollments/${docId}`))
  if (existing) {
    return c.json({ ok: true, enrollment: { courseId, status: existing.status }, already: true })
  }

  const status = Number(course.price || 0) === 0 ? 'active' : 'pending'
  await fsSet(`enrollments/${docId}`, {
    phone, courseId,
    courseTitle: course.title || '',
    price: Number(course.price || 0),
    status,
    requestedAt: new Date().toISOString()
  })
  return c.json({ ok: true, enrollment: { courseId, status } })
})

// ===== اشتراكات الطالب =====
coursesRoutes.get('/my', async (c) => {
  const phone = normalizePhone(String(c.req.query('phone') || ''))
  if (!phone) return c.json({ ok: false, error: 'رقم مفقود' })

  let enrollments: any[] = []
  try {
    const res = await fetch(`${FIRESTORE_BASE}:runQuery?key=${CONFIG.FIREBASE.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'enrollments' }],
          where: { fieldFilter: { field: { fieldPath: 'phone' }, op: 'EQUAL', value: { stringValue: phone } } }
        }
      })
    })
    const rows: any = await res.json()
    if (Array.isArray(rows)) {
      enrollments = rows
        .filter((r: any) => r.document)
        .map((r: any) => fromFsDoc(r.document))
        .filter(Boolean)
    }
  } catch (_) {}

  const courses = await getAllCourses()
  const subs = enrollments.map((e: any) => {
    const course = courses.find((cs: any) => cs.id === e.courseId) || {}
    return {
      courseId: e.courseId,
      title: e.courseTitle || course.title || e.courseId,
      desc: course.desc || '',
      img: course.img || '/static/img/course-term1.webp',
      price: e.price ?? course.price ?? 0,
      status: e.status || 'pending',
      requestedAt: e.requestedAt || ''
    }
  })
  subs.sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)))
  return c.json({ ok: true, subs })
})

// ===== محتوى الكورس من الداخل (نظام المحاضرات) =====
coursesRoutes.get('/content/:id', async (c) => {
  const courseId = c.req.param('id')
  const phone = normalizePhone(String(c.req.query('phone') || ''))

  const courses = await getAllCourses()
  const course = courses.find((cs: any) => cs.id === courseId)
  if (!course) return c.json({ ok: false, error: 'الكورس ده مش موجود' })

  // تحديد صلاحية الوصول
  let access: 'full' | 'locked' = Number(course.price || 0) === 0 ? 'full' : 'locked'
  let enrollment: any = null
  if (phone) {
    const e = fromFsDoc(await fsGet(`enrollments/${phone}_${courseId}`))
    if (e) {
      enrollment = { status: e.status }
      if (e.status === 'active') access = 'full'
    }
  }

  let content = await getCourseContent(courseId)

  // إخفاء المحاضرات المجدولة (موعد نشرها لسه مجاش) عن الطلاب
  const nowIso = new Date().toISOString()
  content = { ...content, lectures: (content.lectures || []).filter((lec: any) => !lec.publishAt || String(lec.publishAt) <= nowIso) }

  // لو الامتحان مربوط ببنك أسئلة: نجيب الأسئلة من البنك (للوصول الكامل فقط)
  if (access === 'full') {
    for (const lec of content.lectures || []) {
      if (lec.exam && lec.exam.bankId) {
        try {
          const bank = await getBank(lec.exam.bankId)
          if (bank && bank.questions.length) {
            const n = Math.min(Number(lec.exam.count || bank.questions.length), bank.questions.length)
            const shuffled = bank.questions.slice().sort(() => Math.random() - 0.5)
            lec.exam = {
              id: lec.exam.id || 'e_' + lec.exam.bankId,
              bankId: lec.exam.bankId,
              title: lec.exam.title || bank.title,
              tools: bank.tools || {}, // أدوات المساعدة المفعّلة للبنك (ترجمة / شات)
              questions: shuffled.slice(0, n)
            }
          }
        } catch (_) {}
      }
    }
  }

  // لو مقفول: نخفي روابط الفيديو والملفات وأسئلة الامتحانات
  if (access === 'locked') {
    content = {
      lectures: (content.lectures || []).map((lec: any) => ({
        id: lec.id, title: lec.title,
        videos: (lec.videos || []).map((v: any) => ({ id: v.id, title: v.title, duration: v.duration || '' })),
        files: (lec.files || []).map((f: any) => ({ id: f.id, title: f.title, size: f.size || '' })),
        exam: lec.exam ? { id: lec.exam.id, title: lec.exam.title, count: (lec.exam.questions || []).length || Number(lec.exam.count || 0) } : null
      }))
    }
  }

  return c.json({ ok: true, course, access, enrollment, content })
})
