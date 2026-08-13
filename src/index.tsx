import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { landingHtml } from './pages/landing'
import { authHtml } from './pages/auth'
import { homeHtml } from './pages/home'
import { adminHtml } from './pages/admin'
import { authRoutes } from './routes/auth'
import { telegramRoutes } from './routes/telegram'
import { coursesRoutes } from './routes/courses'
import { adminRoutes } from './routes/admin'
import { trackRoutes } from './routes/track'
import { banksRoutes } from './routes/banks'
import { filesRoutes } from './routes/files'
import { aiToolsRoutes } from './routes/aitools'

const app = new Hono()

app.use('/api/*', cors())

// ===== الصفحات =====
app.get('/', (c) => c.html(landingHtml()))
app.get('/auth', (c) => c.html(authHtml()))
app.get('/home', (c) => c.html(homeHtml()))
app.get('/admin', (c) => c.html(adminHtml))

// ===== الـ API =====
app.route('/api/auth', authRoutes)
app.route('/api/telegram', telegramRoutes)
app.route('/api/courses', coursesRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/track', trackRoutes)
app.route('/api/banks', banksRoutes)
app.route('/api/files', filesRoutes)
app.route('/api/ai', aiToolsRoutes)

app.get('/api/health', (c) => c.json({ ok: true, name: 'منصة مسيو مصطفى', time: new Date().toISOString() }))

export default app
