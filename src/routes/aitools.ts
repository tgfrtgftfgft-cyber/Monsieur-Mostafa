import { Hono } from 'hono'
import { callAI, extractJson } from '../ai'
import { normalizePhone, fsGet, fromFsDoc } from '../firebase'

// أدوات الذكاء الاصطناعي للطالب (تصحيح مقالي / ترجمة / شات)
export const aiToolsRoutes = new Hono()

// ===== تصحيح الأسئلة المقالية — تصحيح متسامح =====
// القاعدة: الكلمة تتحسب صح لو ≥70% منها مطابقة أو أكثر من 3 أحرف صح
function lenientLocalGrade(student: string, model: string): { correct: boolean; note: string } {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim()
  const a = norm(student)
  const b = norm(model)
  if (!a) return { correct: false, note: 'إجابة فاضية' }
  if (a === b) return { correct: true, note: '' }

  const wordsB = b.split(' ').filter(Boolean)
  const wordsA = a.split(' ').filter(Boolean)
  let matched = 0
  const notes: string[] = []
  for (const wb of wordsB) {
    let best = 0
    for (const wa of wordsA) {
      // عدد الأحرف المشتركة بالترتيب (تشابه بسيط)
      let same = 0
      const len = Math.min(wa.length, wb.length)
      for (let i = 0; i < len; i++) if (wa[i] === wb[i]) same++
      const ratio = same / Math.max(wa.length, wb.length)
      if (ratio > best) best = ratio
      if (same > 3 && same / wb.length >= 0.5) best = Math.max(best, 0.7)
    }
    if (best >= 0.7) matched++
    else if (best >= 0.4) { matched += 0.5; notes.push(`في أخطاء حروف في كلمة قريبة من "${wb}"`) }
  }
  const pct = wordsB.length ? matched / wordsB.length : 0
  if (pct >= 0.7) return { correct: true, note: notes.join(' — ') }
  return { correct: false, note: '' }
}

aiToolsRoutes.post('/grade-essay', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const items = Array.isArray(b.items) ? b.items.slice(0, 30) : []
  if (!items.length) return c.json({ ok: false, error: 'مفيش إجابات للتصحيح' })

  // 1) تصحيح محلي متسامح أولاً (سريع ومجاني)
  const results = items.map((it: any) => {
    const g = lenientLocalGrade(String(it.answer || ''), String(it.modelAnswer || ''))
    return { q: String(it.q || ''), answer: String(it.answer || ''), modelAnswer: String(it.modelAnswer || ''), correct: g.correct, note: g.note, sure: g.correct }
  })

  // 2) الحالات غير المؤكدة (غلط محليًا) نبعتها للذكاء الاصطناعي لو متاح
  const unsure = results.filter((r: any) => !r.sure)
  if (unsure.length) {
    const sys =
      'Tu corriges les réponses courtes d\'élèves égyptiens en français. SOIS TRÈS INDULGENT: ' +
      'si le mot est correct à 70% ou plus, ou si plus de 3 lettres sont correctes, compte la réponse comme CORRECTE. ' +
      'Les fautes d\'orthographe légères ne rendent PAS la réponse fausse — note-les seulement. ' +
      'Une petite faute de grammaire peut être signalée mais la réponse reste correcte si le sens est bon. ' +
      'Réponds UNIQUEMENT en JSON: {"grades":[{"i":0,"correct":true,"note":"ملاحظة قصيرة بالعربية أو فارغة"}]}'
    const payload = unsure.map((r: any, i: number) => ({ i, question: r.q, modelAnswer: r.modelAnswer, studentAnswer: r.answer }))
    const r = await callAI(c.env, { system: sys, user: 'صحّح الإجابات دي بتسامح:\n' + JSON.stringify(payload) })
    if (r.ok) {
      const parsed = extractJson(r.content)
      if (parsed && Array.isArray(parsed.grades)) {
        for (const g of parsed.grades) {
          const idx = Number(g.i)
          if (idx >= 0 && idx < unsure.length) {
            unsure[idx].correct = !!g.correct
            unsure[idx].note = String(g.note || unsure[idx].note || '')
          }
        }
      }
    }
    // لو AI مش متاح: التصحيح المحلي هو النتيجة النهائية
  }

  const score = results.filter((r: any) => r.correct).length
  return c.json({ ok: true, results: results.map((r: any) => ({ correct: r.correct, note: r.note })), score, total: results.length })
})

// ===== ترجمة سؤال للعربية (أداة الترجمة — لما تكون مفعّلة للبنك) =====
aiToolsRoutes.post('/translate', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const q = String(b.q || '').slice(0, 600)
  const options = Array.isArray(b.options) ? b.options.slice(0, 4).map((o: any) => String(o).slice(0, 200)) : []
  if (!q) return c.json({ ok: false, error: 'مفيش سؤال' })

  const sys =
    'ترجم سؤال الفرنساوي واختياراته للعربية المصرية البسيطة عشان طالب ثانوي يفهم. ' +
    'رد بس بصيغة JSON: {"q":"ترجمة السؤال","options":["ترجمة كل اختيار بالترتيب"]} — من غير أي كلام تاني.'
  const r = await callAI(c.env, { system: sys, user: JSON.stringify({ q, options }) })
  if (!r.ok) return c.json({ ok: false, error: r.error })
  const parsed = extractJson(r.content)
  if (!parsed || !parsed.q) return c.json({ ok: false, error: 'الترجمة فشلت — جرب تاني' })
  return c.json({ ok: true, q: String(parsed.q), options: (parsed.options || []).map(String) })
})

// ===== شات الذكاء الاصطناعي (موديل 2.5 flash lite) =====
aiToolsRoutes.post('/chat', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const phone = normalizePhone(String(b.phone || ''))
  const question = String(b.question || '').slice(0, 1500)
  const history = Array.isArray(b.history) ? b.history.slice(-8) : []
  const context = String(b.context || '').slice(0, 2000)
  if (!question) return c.json({ ok: false, error: 'اكتب سؤالك الأول' })

  let studentName = ''
  try {
    const u = fromFsDoc(await fsGet(`users/${phone}`))
    studentName = (u && String(u.name || '').split(' ')[0]) || ''
  } catch (_) {}

  const sys =
    'إنت مساعد ذكي لطلاب مسيو مصطفى حماده مدرس اللغة الفرنسية. ' +
    'بتساعد الطالب يفهم أسئلة الفرنساوي وقواعد اللغة بالعربية المصرية البسيطة. ' +
    (studentName ? `اسم الطالب ${studentName}. ` : '') +
    (context ? `السؤال اللي الطالب واقف عنده حاليًا: ${context}. ` : '') +
    'مهم جدًا: متجاوبش إجابة السؤال مباشرة في الامتحان — اشرح الفكرة والقاعدة وسيبه يجاوب بنفسه. ' +
    'خلي ردودك قصيرة وواضحة.'

  const messages: any[] = [{ role: 'system', content: sys }]
  for (const h of history) {
    if (h && h.role && h.content) messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: String(h.content).slice(0, 1000) })
  }
  messages.push({ role: 'user', content: question })

  // المطلوب موديل 2.5 flash lite — نجربه الأول ولو مش متاح نرجع للموديل الافتراضي
  let r = await callAI(c.env, { system: '', user: '', model: 'gemini-2.5-flash-lite', messages })
  if (!r.ok && /موديل|model|غير مفهوم|خطأ من خدمة/.test(r.error)) {
    r = await callAI(c.env, { system: '', user: '', messages })
  }
  if (!r.ok) return c.json({ ok: false, error: r.error })
  return c.json({ ok: true, reply: r.content })
})
