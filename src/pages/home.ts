import { CONFIG } from '../config'

export function homeHtml(): string {
  const S = CONFIG.SITE
  const bot = CONFIG.TELEGRAM.botUsername
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المنزل — ${S.name}</title>
  <link rel="icon" href="/static/img/logo.webp" type="image/webp">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Lalezar&display=swap" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
</head>
<body class="home-body">

  <!-- شريط علوي -->
  <header id="home-navbar" class="fixed top-0 right-0 left-0 z-40 bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <img src="/static/img/logo.webp" alt="شعار المنصة" class="w-10 h-10 rounded-full object-cover">
        <span class="font-black text-[#141c3f] hidden sm:block" style="font-family:'Lalezar',cursive">${S.name}</span>
      </div>

      <!-- تبويبات الديسكتوب -->
      <nav class="hidden md:flex items-center gap-1">
        <button class="home-tab active" data-view="home"><i class="fas fa-house ml-1"></i> الرئيسية</button>
        <button class="home-tab" data-view="courses"><i class="fas fa-graduation-cap ml-1"></i> كورساتك</button>
        <button class="home-tab" data-view="subs"><i class="fas fa-bookmark ml-1"></i> اشتراكاتك</button>
        <button class="home-tab" data-view="status"><i class="fas fa-user-check ml-1"></i> حالتي</button>
      </nav>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 bg-gray-100 rounded-full py-1 pr-1 pl-3">
          <span id="user-avatar" class="w-8 h-8 rounded-full bg-[#1b2a6b] text-white flex items-center justify-center font-black text-sm">م</span>
          <span id="user-first-name" class="text-sm font-bold text-[#141c3f]">...</span>
        </div>
        <button id="settings-btn" title="الإعدادات" class="w-9 h-9 rounded-full bg-gray-100 text-[#141c3f] hover:bg-gray-200 transition" data-goto="settings">
          <i class="fas fa-gear"></i>
        </button>
        <button id="logout-btn" title="تسجيل الخروج" class="w-9 h-9 rounded-full bg-red-50 text-[#e63946] hover:bg-red-100 transition">
          <i class="fas fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- تبويبات الموبايل (أسفل الشاشة) -->
  <nav id="mobile-nav" class="md:hidden fixed bottom-0 right-0 left-0 z-40 bg-white border-t border-gray-200 flex">
    <button class="home-tab-m active" data-view="home"><i class="fas fa-house"></i><span>الرئيسية</span></button>
    <button class="home-tab-m" data-view="courses"><i class="fas fa-graduation-cap"></i><span>كورساتك</span></button>
    <button class="home-tab-m" data-view="subs"><i class="fas fa-bookmark"></i><span>اشتراكاتك</span></button>
    <button class="home-tab-m" data-view="status"><i class="fas fa-user-check"></i><span>حالتي</span></button>
    <button class="home-tab-m" data-view="settings"><i class="fas fa-gear"></i><span>إعدادات</span></button>
  </nav>

  <main class="max-w-6xl mx-auto px-4 pt-24 pb-28 md:pb-12">

    <!-- ===== الرئيسية ===== -->
    <section id="view-home" class="home-view">
      <!-- بطاقة الترحيب -->
      <div class="welcome-hero relative overflow-hidden rounded-3xl p-6 md:p-8 mb-6">
        <div class="welcome-blob"></div>
        <div class="relative z-10 max-w-[70%] md:max-w-[60%]">
          <p id="welcome-date" class="text-white/70 text-sm mb-1"></p>
          <h1 class="text-2xl md:text-4xl font-black text-white" style="font-family:'Lalezar',cursive">
            أهلًا يا <span id="welcome-name" class="text-[#ffd166]">بطل</span> 👋
          </h1>
          <p class="text-white/80 mt-2 text-sm md:text-base">
            <span id="welcome-grade"></span> — يلا نذاكر فرنساوي النهاردة! 🇫🇷
          </p>
          <p id="welcome-verify" class="mt-3 text-xs md:text-sm"></p>
        </div>
        <img src="/static/img/teacher-cta.webp" alt="مسيو مصطفى حماده" class="welcome-teacher-img">
      </div>

      <!-- بانر التأكيد -->
      <div id="verify-banner" class="hidden mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <i class="fas fa-triangle-exclamation"></i>
        </div>
        <div class="flex-1">
          <p class="font-bold text-amber-800">حسابك لسه متأكدش على تلجرام</p>
          <p class="text-amber-700 text-sm">أكّد رقمك عشان تقدر تستفيد بكل مميزات المنصة وتوصلك إشعاراتك.</p>
        </div>
        <a href="https://t.me/${bot}" target="_blank" class="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-4 py-2 text-sm transition">
          <i class="fab fa-telegram ml-1"></i> أكّد دلوقتي
        </a>
      </div>

      <!-- بطاقات سريعة -->
      <div id="quick-cards" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <button class="quick-card" data-goto="courses">
          <span class="quick-icon" style="background:#1b2a6b"><i class="fas fa-graduation-cap"></i></span>
          <span class="font-black text-[#141c3f]">كورساتك</span>
          <span class="text-xs text-gray-500">تابع دروسك</span>
        </button>
        <button class="quick-card" data-goto="status">
          <span class="quick-icon" style="background:#e63946"><i class="fas fa-user-check"></i></span>
          <span class="font-black text-[#141c3f]">حالتي</span>
          <span class="text-xs text-gray-500">بياناتك وتقدمك</span>
        </button>
        <a class="quick-card" href="https://wa.me/2${S.phone}" target="_blank">
          <span class="quick-icon" style="background:#25d366"><i class="fab fa-whatsapp"></i></span>
          <span class="font-black text-[#141c3f]">تواصل معنا</span>
          <span class="text-xs text-gray-500">واتساب مباشر</span>
        </a>
        <a class="quick-card" href="${S.youtube}" target="_blank">
          <span class="quick-icon" style="background:#ff0000"><i class="fab fa-youtube"></i></span>
          <span class="font-black text-[#141c3f]">اليوتيوب</span>
          <span class="text-xs text-gray-500">فيديوهات مجانية</span>
        </a>
      </div>

      <!-- رسوم بيانية: نشاطك الدراسي -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl md:text-2xl font-black text-[#141c3f]" style="font-family:'Lalezar',cursive">📊 نشاطك الدراسي</h2>
      </div>
      <div id="student-stats-cards" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4 text-center">
          <p id="stat-videos" class="text-2xl font-black text-[#e63946]" style="font-family:'Lalezar',cursive">0</p>
          <p class="text-xs text-gray-500 font-bold">🎬 فيديو اتفتح</p>
        </div>
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4 text-center">
          <p id="stat-exams" class="text-2xl font-black text-[#1b2a6b]" style="font-family:'Lalezar',cursive">0</p>
          <p class="text-xs text-gray-500 font-bold">📝 امتحان خلّصته</p>
        </div>
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4 text-center">
          <p id="stat-avg" class="text-2xl font-black text-[#2a9d54]" style="font-family:'Lalezar',cursive">—</p>
          <p class="text-xs text-gray-500 font-bold">🎯 متوسط درجاتك</p>
        </div>
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4 text-center">
          <p id="stat-logins" class="text-2xl font-black text-[#d4a937]" style="font-family:'Lalezar',cursive">0</p>
          <p class="text-xs text-gray-500 font-bold">📅 يوم مذاكرة</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <h3 class="font-black text-sm text-[#141c3f] mb-3"><i class="fas fa-circle-play ml-1 text-[#e63946]"></i> مشاهداتك آخر 7 أيام</h3>
          <div style="height:180px"><canvas id="chart-videos-week"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <h3 class="font-black text-sm text-[#141c3f] mb-3"><i class="fas fa-clipboard-question ml-1 text-[#1b2a6b]"></i> درجات آخر امتحاناتك</h3>
          <div style="height:180px"><canvas id="chart-exam-scores"></canvas></div>
          <p id="no-exams-msg" class="hidden text-center text-gray-400 text-xs -mt-24">لسه ممتحنتش — ادخل كورس وجرّب امتحان! 💪</p>
        </div>
      </div>

      <!-- كورسات صفك -->
      <div class="flex items-center justify-between mb-4">
        <h2 id="grade-title" class="text-xl md:text-2xl font-black text-[#141c3f]" style="font-family:'Lalezar',cursive">كورسات صفك</h2>
        <button class="text-sm font-bold text-[#1b2a6b] hover:underline" data-goto="courses">عرض الكل <i class="fas fa-arrow-left mr-1"></i></button>
      </div>
      <div id="home-courses" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="text-center text-gray-400 py-10 col-span-full"><i class="fas fa-spinner fa-spin ml-2"></i> جاري تحميل الكورسات...</div>
      </div>
    </section>

    <!-- ===== كورساتك ===== -->
    <section id="view-courses" class="home-view hidden">
      <h2 class="text-xl md:text-2xl font-black text-[#141c3f] mb-4" style="font-family:'Lalezar',cursive">
        <i class="fas fa-graduation-cap ml-2 text-[#e63946]"></i> كل الكورسات المتاحة لصفك
      </h2>
      <div id="all-courses" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="text-center text-gray-400 py-10 col-span-full"><i class="fas fa-spinner fa-spin ml-2"></i> جاري التحميل...</div>
      </div>
    </section>

    <!-- ===== اشتراكاتك ===== -->
    <section id="view-subs" class="home-view hidden">
      <h2 class="text-xl md:text-2xl font-black text-[#141c3f] mb-4" style="font-family:'Lalezar',cursive">
        <i class="fas fa-bookmark ml-2 text-[#e63946]"></i> اشتراكاتك
      </h2>
      <div id="my-subs" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="text-center text-gray-400 py-10 col-span-full"><i class="fas fa-spinner fa-spin ml-2"></i> جاري التحميل...</div>
      </div>
    </section>

    <!-- ===== داخل الكورس ===== -->
    <section id="view-course" class="home-view hidden">
      <button id="course-back" class="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1b2a6b] hover:underline">
        <i class="fas fa-arrow-right"></i> رجوع
      </button>

      <!-- رأس الكورس -->
      <div id="course-hero" class="welcome-hero mb-6">
        <div class="welcome-blob"></div>
        <div class="relative z-10">
          <h1 id="course-title" class="text-2xl md:text-3xl font-black text-white" style="font-family:'Lalezar',cursive">...</h1>
          <p id="course-desc" class="text-white/80 mt-2 text-sm md:text-base max-w-2xl"></p>
          <div id="course-badges" class="mt-3 flex flex-wrap gap-2"></div>
        </div>
      </div>

      <!-- بانر القفل -->
      <div id="course-locked-banner" class="hidden mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><i class="fas fa-lock"></i></div>
        <div class="flex-1">
          <p id="course-locked-title" class="font-bold text-amber-800">الكورس ده محتاج اشتراك</p>
          <p id="course-locked-msg" class="text-amber-700 text-sm">اشترك دلوقتي وهيتفعّل حسابك بعد تأكيد المستر.</p>
        </div>
        <a id="course-subscribe-btn" href="#" target="_blank" class="shrink-0 bg-[#25d366] hover:bg-[#1fb958] text-white font-black rounded-xl px-4 py-2 text-sm transition">
          <i class="fab fa-whatsapp ml-1"></i> اشترك في الكورس
        </a>
      </div>

      <!-- مشغل الفيديو المحمي -->
      <div id="video-player-wrap" class="hidden mb-5">
        <div id="secure-player-shell" class="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg relative">
          <iframe id="video-player" class="w-full h-full" src="" title="مشغل الفيديو — منصة مسيو مصطفى" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>
          <!-- دروع حماية: تغطية شعار يوتيوب وعنوان الفيديو -->
          <div id="shield-top" class="absolute top-0 left-0 right-0 h-[60px] z-10" style="cursor:default"></div>
          <div id="shield-bottom-right" class="absolute bottom-0 left-0 w-[110px] h-[50px] z-10" style="cursor:default"></div>
          <!-- طبقة العلامة المائية -->
          <div id="watermark-layer" class="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <span id="watermark-tag" class="absolute font-black text-white/40 text-xs md:text-sm select-none transition-opacity duration-700 opacity-0" style="text-shadow:0 1px 4px rgba(0,0,0,.6)"></span>
          </div>
        </div>
        <p id="video-player-title" class="mt-2 font-black text-[#141c3f]"></p>
        <!-- قائمة تشغيل فيديوهات المحاضرة -->
        <div id="video-playlist" class="mt-3 bg-white rounded-2xl border-2 border-gray-100 p-3 hidden">
          <p class="font-black text-xs text-gray-500 mb-2"><i class="fas fa-list-ul ml-1 text-[#e63946]"></i> قائمة تشغيل المحاضرة</p>
          <div id="video-playlist-items" class="flex flex-col gap-1"></div>
        </div>
      </div>

      <!-- شرائط المحاضرات -->
      <h3 class="font-black text-[#141c3f] mb-3"><i class="fas fa-layer-group ml-2 text-[#d4a937]"></i> محاضرات الكورس</h3>
      <div id="course-lectures" class="space-y-3"></div>
    </section>

    <!-- ===== صفحة الامتحان (مستقلة) ===== -->
    <section id="view-exam" class="home-view hidden">
      <div class="exam-page max-w-3xl mx-auto">
        <div class="welcome-hero mb-6 !min-h-0 !p-5">
          <div class="welcome-blob"></div>
          <div class="relative z-10 flex items-center justify-between gap-3">
            <div>
              <h1 id="exam-title" class="text-xl md:text-2xl font-black text-white" style="font-family:'Lalezar',cursive">امتحان</h1>
              <p id="exam-meta" class="text-white/70 text-sm mt-1"></p>
            </div>
            <button id="exam-exit" class="shrink-0 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl px-4 py-2 text-sm transition">
              <i class="fas fa-xmark ml-1"></i> خروج
            </button>
          </div>
        </div>
        <div id="exam-questions" class="space-y-5"></div>
        <button id="exam-submit" class="mt-6 w-full bg-[#1b2a6b] hover:bg-[#141c3f] text-white font-black rounded-xl px-6 py-4 transition text-lg">
          <i class="fas fa-paper-plane ml-2"></i> سلّم الامتحان
        </button>
        <div id="exam-result" class="hidden mt-5 rounded-2xl p-6 text-center"></div>
      </div>
    </section>

    <!-- ===== الإعدادات ===== -->
    <section id="view-settings" class="home-view hidden">
      <h2 class="text-xl md:text-2xl font-black text-[#141c3f] mb-4" style="font-family:'Lalezar',cursive">
        <i class="fas fa-gear ml-2 text-[#e63946]"></i> الإعدادات
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="status-card">
          <h3 class="font-black text-[#141c3f] mb-3"><i class="fas fa-circle-info ml-2 text-[#1b2a6b]"></i> عن حسابك</h3>
          <div class="space-y-3">
            <div class="status-row"><span class="status-row-icon" style="background:#1b2a6b"><i class="fas fa-mobile-screen"></i></span><div><p class="text-xs text-gray-400">نظام الجهاز الواحد</p><p class="font-bold text-sm text-[#141c3f]">حسابك مربوط بجهاز واحد فقط لحمايتك</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#0891b2"><i class="fab fa-telegram"></i></span><div><p class="text-xs text-gray-400">بوت المنصة</p><p class="font-bold text-sm text-[#141c3f]">للتحقق واسترجاع كلمة السر من البوت</p></div></div>
            <button id="settings-logout" class="w-full bg-red-50 hover:bg-red-100 text-[#e63946] font-black rounded-xl px-5 py-3 transition">
              <i class="fas fa-arrow-right-from-bracket ml-2"></i> تسجيل الخروج
            </button>
          </div>
        </div>
        <div class="status-card">
          <h3 class="font-black text-[#141c3f] mb-1"><i class="fas fa-user-shield ml-2 text-[#d4a937]"></i> دخول الإشراف</h3>
          <p class="text-xs text-gray-400 mb-3">القسم ده مخصص للمستر فقط — اكتب كلمة سر الإشراف لفتح صفحة الإشراف المتكاملة.</p>
          <div class="flex gap-2">
            <input id="admin-pass-input" type="password" placeholder="كلمة سر الإشراف" class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1b2a6b] outline-none transition" dir="ltr" style="text-align:right">
            <button id="admin-pass-btn" class="bg-[#141c3f] hover:bg-[#1b2a6b] text-white font-black rounded-xl px-5 py-3 text-sm transition">
              <i class="fas fa-unlock ml-1"></i> فتح
            </button>
          </div>
          <p id="admin-pass-err" class="hidden text-[#e63946] text-xs font-bold mt-2"></p>
        </div>
      </div>
    </section>

    <!-- ===== حالتي ===== -->
    <section id="view-status" class="home-view hidden">
      <h2 class="text-xl md:text-2xl font-black text-[#141c3f] mb-4" style="font-family:'Lalezar',cursive">
        <i class="fas fa-user-check ml-2 text-[#e63946]"></i> حالتي
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- بطاقة الهوية -->
        <div class="status-card lg:col-span-1 text-center">
          <span id="status-avatar" class="w-20 h-20 mx-auto rounded-full bg-[#1b2a6b] text-white flex items-center justify-center font-black text-3xl mb-3" style="font-family:'Lalezar',cursive">م</span>
          <h3 id="status-name" class="font-black text-lg text-[#141c3f]">...</h3>
          <p id="status-grade" class="text-sm text-gray-500 mt-1"></p>
          <div class="mt-3 flex items-center justify-center gap-2">
            <span id="verify-status-badge" class="status-badge badge-warn"><i class="fas fa-clock ml-1"></i> <span id="verify-status-text">قيد التأكيد</span></span>
          </div>
          <a id="status-verify-cta" href="https://t.me/${bot}" target="_blank" class="hidden mt-3 inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-4 py-2 text-sm transition">
            <i class="fab fa-telegram ml-1"></i> أكّد حسابك على تلجرام
          </a>
        </div>

        <!-- بطاقة البيانات -->
        <div class="status-card lg:col-span-2">
          <h3 class="font-black text-[#141c3f] mb-4"><i class="fas fa-id-card ml-2 text-[#d4a937]"></i> بياناتك</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="status-row"><span class="status-row-icon" style="background:#1b2a6b"><i class="fas fa-phone"></i></span><div><p class="text-xs text-gray-400">رقم موبايلك</p><p id="status-phone" class="font-bold text-sm text-[#141c3f]" dir="ltr">...</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#e63946"><i class="fas fa-user-shield"></i></span><div><p class="text-xs text-gray-400">رقم الوالد</p><p id="status-parent" class="font-bold text-sm text-[#141c3f]" dir="ltr">...</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#d4a937"><i class="fas fa-map-location-dot"></i></span><div><p class="text-xs text-gray-400">المحافظة</p><p id="status-gov" class="font-bold text-sm text-[#141c3f]">...</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#0e9f6e"><i class="fas fa-city"></i></span><div><p class="text-xs text-gray-400">المدينة</p><p id="status-city" class="font-bold text-sm text-[#141c3f]">...</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#7c3aed"><i class="fas fa-book-quran"></i></span><div><p class="text-xs text-gray-400">النظام</p><p id="status-azhari" class="font-bold text-sm text-[#141c3f]">...</p></div></div>
            <div class="status-row"><span class="status-row-icon" style="background:#0891b2"><i class="fas fa-calendar-check"></i></span><div><p class="text-xs text-gray-400">تاريخ الانضمام</p><p id="status-joined" class="font-bold text-sm text-[#141c3f]">...</p></div></div>
          </div>
        </div>

        <!-- تقدمك (قريبًا) -->
        <div class="status-card lg:col-span-3">
          <h3 class="font-black text-[#141c3f] mb-2"><i class="fas fa-chart-line ml-2 text-[#e63946]"></i> تقدمك الدراسي</h3>
          <div class="rounded-xl bg-gray-50 p-6 text-center text-gray-400">
            <i class="fas fa-hourglass-half text-2xl mb-2"></i>
            <p class="font-bold">قريبًا — هتشوف هنا نسبة مشاهدتك للدروس ودرجاتك في الامتحانات 📊</p>
          </div>
        </div>
      </div>

      <button id="logout-btn-2" class="mt-6 w-full sm:w-auto bg-red-50 hover:bg-red-100 text-[#e63946] font-black rounded-xl px-6 py-3 transition">
        <i class="fas fa-arrow-right-from-bracket ml-2"></i> تسجيل الخروج
      </button>
    </section>
  </main>

  <!-- مودال التنبيهات -->
  <div id="alert-modal" class="modal-overlay hidden">
    <div class="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl">
      <div id="alert-icon" class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"></div>
      <h3 id="alert-title" class="font-black text-lg text-[#141c3f] mb-2"></h3>
      <p id="alert-msg" class="text-gray-500 text-sm mb-4"></p>
      <div id="alert-actions" class="flex gap-2 justify-center"></div>
    </div>
  </div>

  <script>window.__CFG = { botUsername: '${bot}', phone: '${S.phone}' }</script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="/static/home.js"></script>
<!-- شات الذكاء الاصطناعي -->
<div id="ai-chat-modal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col" style="max-height:85vh">
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <p class="font-black text-sm text-[#141c3f]"><i class="fas fa-robot text-purple-500 ml-1"></i> مساعد مسيو مصطفى الذكي</p>
      <button id="ai-chat-close" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"><i class="fas fa-times"></i></button>
    </div>
    <div id="ai-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 text-sm" style="min-height:200px"></div>
    <div class="p-3 border-t border-gray-100 flex gap-2">
      <input id="ai-chat-input" type="text" placeholder="اسأل عن القاعدة أو الكلمة..." class="flex-1 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none px-3 py-2.5 text-sm font-bold" dir="rtl">
      <button id="ai-chat-send" class="bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl px-4 transition"><i class="fas fa-paper-plane"></i></button>
    </div>
  </div>
</div>
<footer id="design-credit" class="text-center py-4 px-4 text-[11px] font-bold text-gray-400">
  © 2026 منصة مسيو مصطفى حماده — تصميم وتطوير: فريق <span class="text-[#1b2a6b]">عمرو كارم محمود</span> وفريقه
</footer>
</body>
</html>`
}
