import { Hono } from 'hono'
import { CONFIG, FIRESTORE_BASE } from '../config'
import { fromFsDoc, fsGet, fsSet, fsUpdate, fsDelete } from '../firebase'
import { callAI, extractJson } from '../ai'

// بنوك الأسئلة — محمية بكلمة سر الإشراف
export const banksRoutes = new Hono()

const ADMIN_PASSWORD = '123321'

banksRoutes.use('*', async (c, next) => {
  const pass = c.req.header('x-admin-pass') || ''
  if (pass !== ADMIN_PASSWORD) return c.json({ ok: false, error: 'غير مصرح' }, 401)
  await next()
})

// ===== قراءة كل البنوك =====
export async function getAllBanks(): Promise<any[]> {
  const out: any[] = []
  try {
    const res = await fetch(`${FIRESTORE_BASE}/question_banks?pageSize=300&key=${CONFIG.FIREBASE.apiKey}`)
    const data: any = await res.json()
    if (data?.documents?.length) {
      for (const d of data.documents) {
        const obj = fromFsDoc(d) || {}
        let questions: any[] = []
        try { questions = JSON.parse(obj.json || '[]') } catch (_) {}
        out.push({
          id: d.name.split('/').pop(),
          title: obj.title || '',
          group: obj.group || 'عام',
          createdAt: obj.createdAt || '',
          count: questions.length,
          tools: safeParse(obj.tools) || {},
          questions
        })
      }
    }
  } catch (_) {}
  return out
}

function safeParse(s: any): any {
  try { return JSON.parse(String(s || '')) } catch (_) { return null }
}

export async function getBank(bankId: string): Promise<any | null> {
  const obj = fromFsDoc(await fsGet(`question_banks/${bankId}`))
  if (!obj) return null
  let questions: any[] = []
  try { questions = JSON.parse(obj.json || '[]') } catch (_) {}
  return { id: bankId, title: obj.title || '', group: obj.group || 'عام', tools: safeParse(obj.tools) || {}, questions }
}

banksRoutes.get('/', async (c) => {
  const banks = await getAllBanks()
  return c.json({
    ok: true,
    banks: banks.map((b) => ({ id: b.id, title: b.title, group: b.group, count: b.count, tools: b.tools, createdAt: b.createdAt }))
  })
})

banksRoutes.get('/:id', async (c) => {
  const bank = await getBank(c.req.param('id'))
  if (!bank) return c.json({ ok: false, error: 'البنك مش موجود' })
  return c.json({ ok: true, bank })
})

banksRoutes.post('/save', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim() || 'bank_' + Date.now()
  const title = String(b.title || '').trim()
  if (!title) return c.json({ ok: false, error: 'اكتب اسم البنك' })
  const questions = Array.isArray(b.questions) ? b.questions : []
  await fsSet(`question_banks/${id}`, {
    title,
    group: String(b.group || 'عام').trim() || 'عام',
    json: JSON.stringify(questions),
    tools: JSON.stringify(b.tools && typeof b.tools === 'object' ? b.tools : {}),
    createdAt: String(b.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString()
  })
  return c.json({ ok: true, id })
})

// ===== أدوات المساعدة لكل بنك (ترجمة / شات AI) =====
banksRoutes.post('/tools-set', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف مفقود' })
  const bank = await getBank(id)
  if (!bank) return c.json({ ok: false, error: 'البنك مش موجود' })
  const tools = {
    translation: !!(b.tools && b.tools.translation),
    chat: !!(b.tools && b.tools.chat)
  }
  await fsUpdate(`question_banks/${id}`, { tools: JSON.stringify(tools) })
  return c.json({ ok: true, tools })
})

banksRoutes.post('/delete', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const id = String(b.id || '').trim()
  if (!id) return c.json({ ok: false, error: 'معرّف مفقود' })
  await fsDelete(`question_banks/${id}`)
  return c.json({ ok: true })
})

// ===== أنظمة التوليد بالذكاء الاصطناعي =====
// mode: qcm | truefalse | essay | intellectual (النسخ الفكري) | extract (استخراج الأسئلة) | models (نماذج متطابقة الصعوبة)
// كل نظام له تعليماته الصارمة — ممنوع الخلط بين الأنظمة

const BASE_RULES =
  'Tu es un professeur de français égyptien expérimenté. ' +
  'Réponds UNIQUEMENT avec un JSON valide, aucun texte hors du JSON. '

function qcmPrompt(): string {
  return BASE_RULES +
    'MODE QCM STRICT — génère UNIQUEMENT des questions à choix multiples: ' +
    '1) Questions et options UNIQUEMENT en français, DIRECTES et simples (style examen égyptien). ' +
    '2) Ne sors JAMAIS du contenu fourni. ' +
    '3) Chaque question a EXACTEMENT 4 options, UNE seule bonne réponse. ' +
    '4) Format: {"questions":[{"type":"mcq","q":"...","options":["...","...","...","..."],"answer":0,"explain":"تفسير الإجابة بالعربي المصري البسيط — سطر واحد ما قل ودل"}]} — answer = index 0-3. ' +
    '5) explain إجباري لكل سؤال: تفسير قصير جدًا بالعربي البسيط ليه دي الإجابة الصح. ' +
    'INTERDIT: questions vrai/faux, questions ouvertes.'
}

function tfPrompt(): string {
  return BASE_RULES +
    'MODE VRAI/FAUX STRICT — génère UNIQUEMENT des questions vrai/faux: ' +
    '1) Chaque question est une phrase en français, l\'élève décide si elle est vraie ou fausse. ' +
    '2) Ne sors JAMAIS du contenu fourni. ' +
    '3) Format: {"questions":[{"type":"tf","q":"...","options":["Vrai","Faux"],"answer":0,"explain":"تفسير قصير بالعربي البسيط ليه صح أو غلط"}]} — answer: 0=Vrai, 1=Faux. ' +
    '4) Le NOMBRE de questions demandé doit être EXACT — ni plus ni moins. ' +
    'INTERDIT: QCM à 4 options, questions ouvertes.'
}

function essayPrompt(): string {
  return BASE_RULES +
    'MODE QUESTIONS OUVERTES STRICT — génère UNIQUEMENT des questions ouvertes courtes: ' +
    '1) Questions DIRECTES et TRÈS simples avec une réponse courte (un mot ou une phrase courte). ' +
    '2) Ne sors JAMAIS du contenu fourni. ' +
    '3) Format: {"questions":[{"type":"essay","q":"...","modelAnswer":"...","explain":"تفسير قصير بالعربي للإجابة النموذجية"}]} — modelAnswer = la réponse modèle courte en français. ' +
    '4) Le NOMBRE de questions demandé doit être EXACT. ' +
    'INTERDIT: QCM, vrai/faux, questions longues de rédaction.'
}

function intellectualPrompt(): string {
  return BASE_RULES +
    'MODE COPIE INTELLECTUELLE (النسخ الفكري) — analyse d\'abord le STYLE DE PENSÉE de l\'examen fourni: ' +
    'types de pièges, niveau de difficulté, façon de formuler, points de grammaire ciblés, structure des distracteurs. ' +
    'Puis génère des questions NOUVELLES et DIFFÉRENTES qui suivent EXACTEMENT le même style de pensée et la même difficulté. ' +
    'Les questions ne doivent PAS être des copies — mêmes idées, contenu différent. ' +
    'Format: {"analysis":"ملخص قصير بالعربية لأسلوب تفكير الامتحان","questions":[{"type":"mcq","q":"...","options":["...","...","...","..."],"answer":0,"explain":"تفسير الإجابة بالعربي البسيط"}]}'
}

function extractPrompt(): string {
  return BASE_RULES +
    'MODE EXTRACTION STRICT (استخراج الأسئلة) — le texte fourni contient déjà des questions toutes prêtes (banque de questions / fichier). ' +
    'EXTRAIS les questions EXACTEMENT comme elles sont écrites, sans les modifier ni en inventer de nouvelles. ' +
    'Si la réponse correcte est indiquée dans le texte, utilise-la; sinon détermine-la avec précision. ' +
    'Corrige seulement les fautes de frappe évidentes dues au scan/OCR. ' +
    'Pour les QCM: {"type":"mcq","q":"...","options":[4 options],"answer":index}. ' +
    'Pour vrai/faux: {"type":"tf","q":"...","options":["Vrai","Faux"],"answer":0|1}. ' +
    'Pour questions ouvertes: {"type":"essay","q":"...","modelAnswer":"..."}. ' +
    'Ajoute à chaque question un champ "explain": تفسير الإجابة بالعربي المصري البسيط في سطر واحد. ' +
    'Format: {"questions":[...]} — INTERDIT d\'inventer des questions qui ne sont pas dans le texte.'
}

function modelsPrompt(): string {
  return BASE_RULES +
    'MODE MODÈLES ÉQUIVALENTS (نماذج متطابقة الصعوبة) — génère PLUSIEURS modèles d\'examen de difficulté IDENTIQUE: ' +
    '1) Chaque modèle couvre les mêmes points du contenu avec des questions DIFFÉRENTES mais de MÊME difficulté. ' +
    '2) Questions QCM en français, directes, 4 options, une bonne réponse. ' +
    '3) Ne sors JAMAIS du contenu fourni. ' +
    '4) Format: {"models":[{"name":"نموذج 1","questions":[{"type":"mcq","q":"...","options":["...","...","...","..."],"answer":0,"explain":"تفسير بالعربي البسيط"}]}]} ' +
    '5) Le nombre de modèles et le nombre de questions par modèle doivent être EXACTS.'
}

function validateQuestions(list: any[], allowedTypes: string[], max: number): any[] {
  return (Array.isArray(list) ? list : [])
    .filter((q: any) => {
      if (!q || !q.q) return false
      const t = q.type || 'mcq'
      if (!allowedTypes.includes(t)) return false
      if (t === 'mcq') return Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number' && q.answer >= 0 && q.answer <= 3
      if (t === 'tf') return typeof q.answer === 'number' && (q.answer === 0 || q.answer === 1)
      if (t === 'essay') return !!q.modelAnswer
      return false
    })
    .slice(0, max)
    .map((q: any) => {
      const t = q.type || 'mcq'
      const explain = String(q.explain || '').slice(0, 400)
      if (t === 'mcq') return { type: 'mcq', q: String(q.q), options: q.options.map(String), answer: Number(q.answer), explain }
      if (t === 'tf') return { type: 'tf', q: String(q.q), options: ['Vrai', 'Faux'], answer: Number(q.answer), explain }
      return { type: 'essay', q: String(q.q), modelAnswer: String(q.modelAnswer), explain }
    })
}

banksRoutes.post('/ai-generate', async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const material = String(b.material || '').trim()
  const mode = String(b.mode || 'qcm')
  const count = Math.min(Math.max(Number(b.count || 10), 1), 50)

  if (!material || material.length < 30) {
    return c.json({ ok: false, error: 'الصق المحتوى الأول (على الأقل فقرة — نص المنهج أو الامتحان أو ملف البنك)' })
  }

  let system = ''
  let userMsg = ''
  const mat = material.slice(0, 14000)

  if (mode === 'qcm') {
    system = qcmPrompt()
    userMsg = `Crée exactement ${count} questions QCM directes en français à partir de ce contenu (ne sors pas du contenu):\n\n${mat}`
  } else if (mode === 'truefalse') {
    system = tfPrompt()
    userMsg = `Crée EXACTEMENT ${count} questions vrai/faux en français à partir de ce contenu — le nombre doit être exactement ${count}:\n\n${mat}`
  } else if (mode === 'essay') {
    system = essayPrompt()
    userMsg = `Crée EXACTEMENT ${count} questions ouvertes courtes et directes en français à partir de ce contenu — le nombre doit être exactement ${count}:\n\n${mat}`
  } else if (mode === 'intellectual') {
    system = intellectualPrompt()
    userMsg = `Analyse le style de pensée de cet examen puis crée ${count} questions NOUVELLES avec le même style et la même difficulté:\n\n${mat}`
  } else if (mode === 'extract') {
    system = extractPrompt()
    userMsg = `Extrais TOUTES les questions présentes dans ce texte (maximum ${count}), exactement comme elles sont:\n\n${mat}`
  } else if (mode === 'models') {
    const numModels = Math.min(Math.max(Number(b.numModels || 2), 1), 6)
    const perModel = Math.min(Math.max(Number(b.perModel || 10), 1), 30)
    system = modelsPrompt()
    userMsg = `Crée EXACTEMENT ${numModels} modèles d'examen équivalents, chacun avec EXACTEMENT ${perModel} questions QCM, à partir de ce contenu:\n\n${mat}`
    const r = await callAI(c.env, { system, user: userMsg })
    if (!r.ok) return c.json({ ok: false, error: r.error })
    const parsed = extractJson(r.content)
    if (!parsed || !Array.isArray(parsed.models)) return c.json({ ok: false, error: 'الذكاء الاصطناعي رجّع رد غير مفهوم — جرب تاني' })
    const models = parsed.models.slice(0, numModels).map((m: any, i: number) => ({
      name: String(m.name || `نموذج ${i + 1}`),
      questions: validateQuestions(m.questions, ['mcq'], perModel)
    })).filter((m: any) => m.questions.length)
    if (!models.length) return c.json({ ok: false, error: 'معرفش يولّد النماذج — جرب محتوى أوضح' })
    return c.json({ ok: true, models })
  } else {
    return c.json({ ok: false, error: 'نظام توليد غير معروف' })
  }

  const r = await callAI(c.env, { system, user: userMsg })
  if (!r.ok) return c.json({ ok: false, error: r.error })
  const parsed = extractJson(r.content)
  if (!parsed) return c.json({ ok: false, error: 'الذكاء الاصطناعي رجّع رد غير مفهوم — جرب تاني' })

  const allowed = mode === 'truefalse' ? ['tf'] : mode === 'essay' ? ['essay'] : mode === 'extract' ? ['mcq', 'tf', 'essay'] : ['mcq']
  const questions = validateQuestions(parsed.questions, allowed, count)
  if (!questions.length) return c.json({ ok: false, error: 'معرفش يولّد أسئلة من المحتوى ده — جرب محتوى أوضح' })

  // للأنظمة اللي عددها لازم يكون مضبوط
  if ((mode === 'truefalse' || mode === 'essay') && questions.length < count) {
    return c.json({ ok: true, questions, warning: `اتولّد ${questions.length} من ${count} — دوس توليد تاني للباقي أو زوّد المحتوى` })
  }

  const out: any = { ok: true, questions }
  if (mode === 'intellectual' && parsed.analysis) out.analysis = String(parsed.analysis)
  return c.json(out)
})
