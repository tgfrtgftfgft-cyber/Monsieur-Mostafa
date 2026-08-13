// ===== أداة مشتركة للاتصال بالذكاء الاصطناعي =====
// بترجع أخطاء عربية واضحة (مفتاح منتهي / باقة مجانية)

export type AIResult = { ok: true; content: string } | { ok: false; error: string }

export function getAIKey(env: any): { apiKey: string; baseUrl: string } {
  const e: any = env || {}
  const apiKey = e.OPENAI_API_KEY || (globalThis as any).process?.env?.OPENAI_API_KEY || ''
  const baseUrl = e.OPENAI_BASE_URL || (globalThis as any).process?.env?.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
  return { apiKey, baseUrl }
}

export async function callAI(
  env: any,
  opts: { system: string; user: string; model?: string; messages?: any[] }
): Promise<AIResult> {
  const { apiKey, baseUrl } = getAIKey(env)
  if (!apiKey) return { ok: false, error: 'مفتاح الذكاء الاصطناعي مش متوفر — ضيف مفتاح من إعدادات المشروع (تبويب API Keys)' }

  const messages = opts.messages || [
    { role: 'system', content: opts.system },
    { role: 'user', content: opts.user }
  ]

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: opts.model || 'gpt-5-mini', messages })
    })
    const data: any = await res.json()
    if (data?.detail && String(data.detail).toLowerCase().includes('token')) {
      return { ok: false, error: 'مفتاح الذكاء الاصطناعي منتهي — لازم تحديث المفتاح من إعدادات المشروع (تبويب API Keys)' }
    }
    if (data?.error) {
      return { ok: false, error: 'خطأ من خدمة الذكاء الاصطناعي: ' + String(data.error?.message || data.error).slice(0, 150) }
    }
    const raw = data?.choices?.[0]?.message?.content || ''
    if (/free-plan|purchase credits|subscribe/i.test(raw)) {
      return { ok: false, error: 'خدمة الذكاء الاصطناعي محتاجة باقة مدفوعة أو مفتاح API خاص — ضيف مفتاح OpenAI من إعدادات المشروع' }
    }
    if (!raw) return { ok: false, error: 'الذكاء الاصطناعي رجّع رد فاضي — جرب تاني' }
    return { ok: true, content: raw }
  } catch (_) {
    return { ok: false, error: 'مشكلة في الاتصال بالذكاء الاصطناعي — جرب تاني' }
  }
}

/** استخراج أول JSON object من رد AI */
export function extractJson(raw: string): any | null {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch (_) { return null }
}
