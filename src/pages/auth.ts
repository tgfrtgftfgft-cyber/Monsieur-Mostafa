import { CONFIG } from '../config'

const GOVERNORATES = ['قنا','الأقصر','أسوان','سوهاج','أسيوط','المنيا','بني سويف','الفيوم','الجيزة','القاهرة','الإسكندرية','القليوبية','الشرقية','الدقهلية','الغربية','المنوفية','البحيرة','كفر الشيخ','دمياط','بورسعيد','الإسماعيلية','السويس','شمال سيناء','جنوب سيناء','البحر الأحمر','الوادي الجديد','مطروح']

const GRADES = [
  { v: 'prep1', t: 'الصف الأول الإعدادي' },
  { v: 'prep2', t: 'الصف الثاني الإعدادي' },
  { v: 'prep3', t: 'الصف الثالث الإعدادي' },
  { v: 'sec1', t: 'الصف الأول الثانوي' },
  { v: 'sec2', t: 'الصف الثاني الثانوي' },
  { v: 'sec3', t: 'الصف الثالث الثانوي' }
]

export const authHtml = () => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>التسجيل | منصة مسيو مصطفى</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Lalezar&display=swap" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
<link rel="icon" type="image/webp" href="/static/img/logo.webp">
</head>
<body>

<!-- Top mini nav -->
<header class="fixed top-0 right-0 left-0 z-50 bg-white/90 backdrop-blur shadow-sm">
  <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-2.5">
    <a href="/" class="flex items-center gap-2">
      <img src="/static/img/logo.webp" alt="لوجو" class="h-10 w-10 object-contain rounded-lg">
      <span class="font-display text-lg" style="color:#1b2a6b">مسيو مصطفى</span>
    </a>
    <a href="/" class="text-sm font-bold text-gray-500 hover:text-red-600 transition"><i class="fas fa-arrow-right ml-1"></i> العودة للرئيسية</a>
  </div>
</header>

<main class="auth-wrap">
  <div class="auth-card">

    <!-- Tabs -->
    <div class="auth-tabs" id="auth-tabs">
      <button class="auth-tab" data-tab="register">إنشاء حساب جديد</button>
      <button class="auth-tab" data-tab="login">تسجيل الدخول</button>
    </div>

    <!-- ============ LOGIN FORM ============ -->
    <section id="login-form" class="hidden">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">👋</div>
        <h1 class="font-display text-2xl md:text-3xl">أهلاً بيك تاني!</h1>
        <p class="text-gray-400 text-sm font-bold">سجل دخولك وكمّل رحلتك مع الفرنسية</p>
      </div>
      <div class="field-group">
        <label class="field-label" for="login-phone">رقم الهاتف</label>
        <input id="login-phone" type="tel" inputmode="numeric" dir="ltr" class="field-input text-left" placeholder="01xxxxxxxxx">
        <div class="field-error" id="err-login-phone"></div>
      </div>
      <div class="field-group">
        <label class="field-label" for="login-password">كلمة المرور</label>
        <div class="relative">
          <input id="login-password" type="password" dir="ltr" class="field-input text-left pl-11" placeholder="••••••••">
          <button type="button" class="toggle-pass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" data-target="login-password"><i class="fas fa-eye"></i></button>
        </div>
        <div class="field-error" id="err-login-password"></div>
      </div>
      <button id="login-btn" class="btn-primary w-full !py-3 text-base mt-2">تسجيل الدخول <i class="fas fa-arrow-left"></i></button>
      <p class="text-center text-sm font-bold text-gray-400 mt-4">
        نسيت كلمة المرور؟ <button id="forgot-btn" class="text-red-600 hover:underline">استرجعها من هنا</button>
      </p>
    </section>

    <!-- ============ REGISTER (multi-step) ============ -->
    <section id="register-form" class="hidden">
      <div class="text-center mb-5">
        <div class="text-4xl mb-2">🇫🇷</div>
        <h1 class="font-display text-2xl md:text-3xl">أنشئ حسابك الجديد</h1>
        <p class="text-gray-400 text-sm font-bold">خطوات بسيطة وتبقى واحد مننا</p>
      </div>

      <div class="steps-bar">
        <div class="step-dot active" data-step="1"></div>
        <div class="step-dot" data-step="2"></div>
        <div class="step-dot" data-step="3"></div>
      </div>

      <!-- STEP 1: personal -->
      <div class="reg-step" data-step="1">
        <div class="field-group">
          <label class="field-label" for="reg-name">الاسم الثلاثي <span class="text-red-500">*</span></label>
          <input id="reg-name" type="text" class="field-input" placeholder="مثال: أحمد محمد علي">
          <div class="field-error" id="err-reg-name"></div>
        </div>
        <div class="field-group">
          <label class="field-label" for="reg-phone">رقم هاتفك <span class="text-red-500">*</span></label>
          <input id="reg-phone" type="tel" inputmode="numeric" dir="ltr" class="field-input text-left" placeholder="01xxxxxxxxx">
          <p class="text-[11px] font-bold text-sky-600 mt-1"><i class="fab fa-telegram"></i> يجب أن يكون لهذا الرقم حساب تلجرام للتأكيد</p>
          <div class="field-error" id="err-reg-phone"></div>
        </div>
        <div class="field-group">
          <label class="field-label" for="reg-parent-phone">رقم هاتف الوالد <span class="text-red-500">*</span></label>
          <input id="reg-parent-phone" type="tel" inputmode="numeric" dir="ltr" class="field-input text-left" placeholder="01xxxxxxxxx">
          <div class="field-error" id="err-reg-parent-phone"></div>
        </div>
        <div class="field-group">
          <label class="field-label" for="reg-email">البريد الإلكتروني <span class="text-gray-400 text-xs">(اختياري)</span></label>
          <input id="reg-email" type="email" dir="ltr" class="field-input text-left" placeholder="example@gmail.com">
          <div class="field-error" id="err-reg-email"></div>
        </div>
        <button class="btn-primary w-full !py-3 next-step">التالي <i class="fas fa-arrow-left"></i></button>
      </div>

      <!-- STEP 2: location & grade -->
      <div class="reg-step hidden" data-step="2">
        <div class="grid grid-cols-2 gap-3">
          <div class="field-group">
            <label class="field-label" for="reg-gov">المحافظة <span class="text-red-500">*</span></label>
            <select id="reg-gov" class="field-input">
              <option value="">اختر المحافظة</option>
              ${GOVERNORATES.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
            <div class="field-error" id="err-reg-gov"></div>
          </div>
          <div class="field-group">
            <label class="field-label" for="reg-city">المدينة / المركز <span class="text-red-500">*</span></label>
            <input id="reg-city" type="text" class="field-input" placeholder="مثال: قفط">
            <div class="field-error" id="err-reg-city"></div>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label" for="reg-grade">الصف الدراسي <span class="text-red-500">*</span></label>
          <select id="reg-grade" class="field-input">
            <option value="">اختر صفك الدراسي</option>
            ${GRADES.map(g => `<option value="${g.v}">${g.t}</option>`).join('')}
          </select>
          <div class="field-error" id="err-reg-grade"></div>
        </div>
        <div class="field-group">
          <div class="azhari-toggle" id="azhari-toggle">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🕌</span>
              <div>
                <div class="font-black text-sm">طالب أزهري؟</div>
                <div class="text-[11px] font-bold text-gray-400">فعّل الزر لو انت في التعليم الأزهري</div>
              </div>
            </div>
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-outline flex-1 !py-3 prev-step"><i class="fas fa-arrow-right"></i> السابق</button>
          <button class="btn-primary flex-1 !py-3 next-step">التالي <i class="fas fa-arrow-left"></i></button>
        </div>
      </div>

      <!-- STEP 3: password -->
      <div class="reg-step hidden" data-step="3">
        <div class="field-group">
          <label class="field-label" for="reg-password">كلمة المرور <span class="text-red-500">*</span></label>
          <div class="relative">
            <input id="reg-password" type="password" dir="ltr" class="field-input text-left pl-11" placeholder="6 أحرف على الأقل">
            <button type="button" class="toggle-pass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" data-target="reg-password"><i class="fas fa-eye"></i></button>
          </div>
          <div class="field-error" id="err-reg-password"></div>
        </div>
        <div class="field-group">
          <label class="field-label" for="reg-password2">تأكيد كلمة المرور <span class="text-red-500">*</span></label>
          <input id="reg-password2" type="password" dir="ltr" class="field-input text-left" placeholder="••••••••">
          <div class="field-error" id="err-reg-password2"></div>
        </div>
        <div class="flex gap-2 mt-2">
          <button class="btn-outline flex-1 !py-3 prev-step"><i class="fas fa-arrow-right"></i> السابق</button>
          <button id="register-btn" class="btn-primary flex-1 !py-3">إتمام التسجيل <i class="fas fa-check"></i></button>
        </div>
      </div>

      <!-- STEP 4: telegram verify -->
      <div class="reg-step hidden text-center" data-step="4">
        <div class="tg-pulse"><i class="fab fa-telegram-plane"></i></div>
        <h2 class="font-display text-2xl mb-2">خطوة أخيرة.. أكّد رقمك! 📲</h2>
        <p class="text-gray-500 text-sm font-bold mb-1">يجب تأكيد رقم هاتفك عن طريق تلجرام</p>
        <p class="text-gray-400 text-xs font-bold mb-5">هيفتح معاك بوت التلجرام.. دوس <b>Start</b> وبعدين شارك رقمك أو ابعته</p>

        <a id="tg-link" href="#" target="_blank" class="btn-primary w-full !py-3 mb-3" style="background:linear-gradient(135deg,#2AABEE,#229ED9)">
          <i class="fab fa-telegram-plane"></i> لدي تلجرام — تأكيد الرقم الآن
        </a>
        <button id="no-tg-btn" class="btn-outline w-full !py-3 !border-amber-500 !text-amber-600 hover:!bg-amber-500 hover:!text-white">
          <i class="fas fa-triangle-exclamation"></i> ليس لدي تلجرام
        </button>

        <div id="tg-waiting" class="hidden mt-5 bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
          <div class="flex items-center justify-center gap-3 text-sky-700 font-bold text-sm">
            <div class="spinner" style="border-color:rgba(2,132,199,.3);border-top-color:#0284c7"></div>
            في انتظار التأكيد من التلجرام.. افتح البوت واتبع التعليمات
          </div>
          <button id="tg-check-btn" class="btn-outline w-full !py-2 mt-3 text-sm">تحققت بالفعل؟ اضغط هنا</button>
        </div>
      </div>
    </section>

  </div>
</main>

<!-- ============ POLICY MODAL ============ -->
<div id="policy-modal" class="modal-backdrop">
  <div class="modal-box !max-w-lg !text-right" style="max-height:90vh;overflow-y:auto">
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">⚠️</div>
      <h3 class="font-display text-2xl text-red-600">تنبيه هام — سياسة الاستخدام</h3>
    </div>
    <ul class="policy-list">
      <li><i class="fas fa-ban"></i> ممنوع منعًا باتًا مشاركة الفيديوهات أو تصويرها أو إعادة نشرها بأي شكل.</li>
      <li><i class="fas fa-user-lock"></i> ممنوع مشاركة حسابك مع أي شخص آخر — الحساب مرتبط بجهاز واحد فقط.</li>
      <li><i class="fas fa-copy"></i> ممنوع نسخ أو توزيع الملفات والامتحانات خارج المنصة.</li>
      <li><i class="fas fa-video"></i> جميع الفيديوهات عليها علامة مائية باسمك ورقمك — أي تسريب يتم تتبعه فورًا.</li>
      <li><i class="fas fa-gavel"></i> مخالفة أي بند من هذه البنود تعرض حسابك للحظر النهائي دون استرداد المبلغ.</li>
      <li><i class="fas fa-heart"></i> المحتوى ده تعب ومجهود مسيو مصطفى.. حافظ عليه عشان نفضل نقدملك الأفضل.</li>
    </ul>
    <hr class="my-4">
    <label class="checkbox-row mb-3">
      <input type="checkbox" id="policy-agree">
      <span class="checkbox-box"><i class="fas fa-check"></i></span>
      <span class="text-sm font-black text-gray-700">أوافق على حقوق وسياسة الاستخدام</span>
    </label>
    <label class="checkbox-row mb-5">
      <input type="checkbox" id="policy-hide">
      <span class="checkbox-box"><i class="fas fa-check"></i></span>
      <span class="text-sm font-bold text-gray-400">لا تظهر مجددًا</span>
    </label>
    <button id="policy-ok" class="btn-primary w-full !py-3">موافق <i class="fas fa-check"></i></button>
    <p id="policy-warn" class="hidden text-center text-red-600 text-xs font-black mt-3">⚠️ يجب أن توافق على سياسة الاستخدام أولًا</p>
  </div>
</div>

<!-- ============ ALERT MODAL ============ -->
<div id="alert-modal" class="modal-backdrop">
  <div class="modal-box">
    <div id="alert-icon" class="text-5xl mb-3">ℹ️</div>
    <h3 id="alert-title" class="font-display text-2xl mb-2"></h3>
    <p id="alert-msg" class="text-gray-500 font-semibold text-sm mb-6"></p>
    <div id="alert-actions" class="flex flex-col gap-2"></div>
  </div>
</div>

<script>
window.__CFG = {
  botUsername: '${CONFIG.TELEGRAM.botUsername}'
};
</script>
<script src="/static/auth.js"></script>
<footer id="design-credit" class="text-center py-4 px-4 text-[11px] font-bold text-gray-400">
  © 2026 منصة مسيو مصطفى حماده — تصميم وتطوير: فريق <span class="text-[#1b2a6b]">عمرو كارم محمود</span> وفريقه
</footer>
</body>
</html>`
