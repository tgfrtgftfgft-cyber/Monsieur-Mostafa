import { CONFIG } from '../config'

export const landingHtml = () => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<script>try{if(localStorage.getItem('session'))location.replace('/home')}catch(e){}</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>منصة مسيو مصطفى | اللغة الفرنسية للثانوية والإعدادية</title>
<meta name="description" content="منصة مسيو مصطفى حماده لتعليم اللغة الفرنسية للمرحلتين الإعدادية والثانوية في مصر">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Lalezar&display=swap" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
<link rel="icon" type="image/webp" href="/static/img/logo.webp">
</head>
<body>

<!-- ===================== NAVBAR ===================== -->
<header id="navbar">
  <nav class="max-w-7xl mx-auto flex items-center justify-between px-3 md:px-8 py-3">
    <a href="#hero-section" class="flex items-center gap-2 shrink-0">
      <img src="/static/img/logo.webp" alt="لوجو منصة مسيو مصطفى" class="h-11 w-11 md:h-14 md:w-14 object-contain rounded-xl">
      <div class="leading-tight hidden xs:block sm:block">
        <span class="font-display text-lg md:text-2xl block" style="color:#1b2a6b">مسيو مصطفى</span>
        <span class="text-[9px] md:text-xs font-bold text-red-600 tracking-wide">Monsieur Mostafa 🇫🇷</span>
      </div>
    </a>

    <div class="hidden lg:flex items-center gap-8">
      <a href="#hero-section" class="nav-link">الرئيسية</a>
      <a href="#grades-section" class="nav-link">السنوات الدراسية</a>
      <a href="#courses-section" class="nav-link">الكورسات</a>
      <a href="#steps-section" class="nav-link">إزاي تذاكر؟</a>
      <a href="#social-section" class="nav-link">تابعنا</a>
    </div>

    <div class="flex items-center gap-1.5 md:gap-3">
      <a href="/auth?mode=login" class="btn-outline text-xs md:text-sm !py-2 !px-3 md:!px-6">دخول</a>
      <a href="/auth?mode=register" class="btn-primary text-xs md:text-sm !py-2 !px-3 md:!px-6">حساب جديد <i class="fas fa-user-plus"></i></a>
      <button id="menu-btn" class="lg:hidden w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center text-lg text-[#1b2a6b] shrink-0" aria-label="القائمة">
        <i class="fas fa-bars"></i>
      </button>
    </div>
  </nav>
</header>

<!-- Mobile menu -->
<div id="menu-overlay" class="hidden fixed inset-0 bg-black/40 z-[140]"></div>
<aside id="mobile-menu">
  <div class="flex items-center justify-between mb-4">
    <img src="/static/img/logo.webp" alt="لوجو" class="h-12 w-12 object-contain">
    <button id="menu-close" class="w-10 h-10 rounded-full bg-gray-100 text-[#1b2a6b]" aria-label="إغلاق"><i class="fas fa-xmark"></i></button>
  </div>
  <a href="#hero-section" class="mobile-link"><i class="fas fa-home text-red-500"></i> الرئيسية</a>
  <a href="#grades-section" class="mobile-link"><i class="fas fa-layer-group text-red-500"></i> السنوات الدراسية</a>
  <a href="#courses-section" class="mobile-link"><i class="fas fa-graduation-cap text-red-500"></i> الكورسات</a>
  <a href="#steps-section" class="mobile-link"><i class="fas fa-route text-red-500"></i> إزاي تذاكر؟</a>
  <a href="#social-section" class="mobile-link"><i class="fas fa-share-nodes text-red-500"></i> تابعنا</a>
  <hr class="my-3">
  <a href="/auth?mode=register" class="btn-primary w-full">إنشاء حساب جديد</a>
  <a href="/auth?mode=login" class="btn-outline w-full mt-2">تسجيل الدخول</a>
</aside>

<!-- ===================== HERO ===================== -->
<section id="hero-section" class="pt-24 md:pt-28">
  <div class="hero-grid-bg"></div>

  <div class="hero-blob float-y" style="top:14%;right:6%;width:70px;height:70px;background:rgba(230,57,70,.14)"></div>
  <div class="hero-blob float-y-2" style="top:60%;right:44%;width:44px;height:44px;background:rgba(212,169,55,.22)"></div>
  <div class="hero-blob float-x" style="top:24%;left:8%;width:90px;height:90px;background:rgba(27,42,107,.1)"></div>
  <i class="fas fa-archway eiffel-bg text-[16rem] hidden lg:block" style="bottom:4%;left:2%"></i>

  <div class="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-8 items-center min-h-[88vh]">
    <div class="order-2 lg:order-1 text-center lg:text-right pb-10">
      <div class="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow font-bold text-sm mb-5 reveal visible">
        <span class="fr-strip"><span style="background:#0055A4"></span><span style="background:#fff"></span><span style="background:#EF4135"></span></span>
        منصة اللغة الفرنسية الأولى للإعدادية والثانوية
      </div>

      <h1 class="font-display text-4xl md:text-6xl leading-[1.15] mb-4">
        نعشق الفرنسية مع
        <span class="hero-title-gradient block mt-1">مسيو مصطفى حماده</span>
      </h1>

      <p class="text-lg md:text-2xl font-bold text-gray-700 h-9 mb-3">
        <span id="typed-text" class="typing-caret"></span>
      </p>

      <p class="text-gray-500 font-semibold text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-8">
        شرح مبسّط لمنهج اللغة الفرنسية للمرحلتين الإعدادية والثانوية..
        تدريبات وتطبيقات، امتحانات دورية، ومتابعة مستمرة حتى ليلة الامتحان 💪
      </p>

      <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
        <a href="/auth?mode=register" class="btn-primary btn-cta-pulse text-base md:text-lg">أنشئ حسابك الآن <i class="fas fa-arrow-left"></i></a>
        <a href="#grades-section" class="btn-outline text-base md:text-lg">تصفح الكورسات</a>
      </div>

      <!-- Feature pillars -->
      <div class="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 mt-10 stagger">
        <div class="pillar-card reveal" style="--i:0">
          <div class="pillar-icon" style="background:linear-gradient(135deg,#e63946,#c62b38)"><i class="fas fa-puzzle-piece"></i></div>
          <div class="font-display text-xl md:text-2xl text-[#1b2a6b]">تكامل</div>
          <div class="text-[11px] font-bold text-gray-400">منهج متكامل A→Z</div>
        </div>
        <div class="pillar-card reveal" style="--i:1">
          <div class="pillar-icon" style="background:linear-gradient(135deg,#1b2a6b,#3448a0)"><i class="fas fa-cubes-stacked"></i></div>
          <div class="font-display text-xl md:text-2xl text-[#1b2a6b]">تأسيس</div>
          <div class="text-[11px] font-bold text-gray-400">من الصفر للاحتراف</div>
        </div>
        <div class="pillar-card reveal" style="--i:2">
          <div class="pillar-icon" style="background:linear-gradient(135deg,#d4a937,#b8902a)"><i class="fas fa-lightbulb"></i></div>
          <div class="font-display text-xl md:text-2xl text-[#1b2a6b]">فهم</div>
          <div class="text-[11px] font-bold text-gray-400">مش حفظ.. فهم حقيقي</div>
        </div>
      </div>
    </div>

    <div class="order-1 lg:order-2 relative flex justify-center items-end h-[46vh] lg:h-auto">
      <div class="absolute bottom-0 w-[300px] h-[300px] md:w-[430px] md:h-[430px] rounded-full spin-slow"
           style="background:conic-gradient(from 0deg,#e63946,#d4a937,#1b2a6b,#e63946);opacity:.18;filter:blur(8px)"></div>
      <div class="absolute bottom-0 w-[270px] h-[270px] md:w-[390px] md:h-[390px] rounded-full bg-gradient-to-tr from-[#1b2a6b] to-[#e63946] opacity-90"></div>
      <img id="hero-teacher-img" src="/static/img/teacher-hero.webp" alt="مسيو مصطفى حماده"
           class="teacher-hero-img relative z-10 h-[46vh] lg:h-[74vh] object-contain transition-transform duration-300">

      <div class="badge-float float-y" style="top:12%;right:4%"><span class="text-xl">🇫🇷</span> Parle français!</div>
      <div class="badge-float float-y-2" style="bottom:22%;left:0%"><i class="fas fa-medal text-[#d4a937] text-lg"></i> نتائج مضمونة</div>
      <div class="badge-float float-x hidden md:flex" style="top:38%;left:-4%"><i class="fas fa-book-open text-red-500 text-lg"></i> شرح مبسط وواضح</div>
    </div>
  </div>

  <div class="marquee-band py-3 overflow-hidden relative z-10">
    <div class="marquee-track font-display text-lg md:text-xl text-white/90" dir="ltr">
      <span>🇫🇷 Bonjour! • اتعلم الفرنسية صح • Le français c'est facile • تأسيس • مراجعات • امتحانات • متابعة مستمرة •</span>
      <span>🇫🇷 Bonjour! • اتعلم الفرنسية صح • Le français c'est facile • تأسيس • مراجعات • امتحانات • متابعة مستمرة •</span>
    </div>
  </div>
</section>

<!-- ===================== GRADES (SECONDARY) ===================== -->
<section id="grades-section" class="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
    <div class="reveal">
      <h2 class="font-display text-3xl md:text-5xl section-title">المرحلة الثانوية</h2>
      <p class="text-gray-500 font-semibold mt-5 max-w-xl">اختار صفك الدراسي وابدأ رحلتك مع الفرنسية.. المنصة متاحة على الموبايل والتابلت واللابتوب 📱💻</p>
    </div>
    <a href="/auth?mode=register" class="btn-gold reveal self-start md:self-auto">انشئ حسابك الآن <i class="fas fa-bolt"></i></a>
  </div>

  <div class="grid md:grid-cols-3 gap-6 stagger">
    <article data-grade="الصف الأول الثانوي" class="grade-card grade-img-card reveal-scale" style="--i:0">
      <img src="/static/img/grade-sec1.webp" alt="الصف الأول الثانوي" class="grade-bg-img">
      <span class="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الصف الأول الثانوي</span>
      <div class="grade-overlay"></div>
      <div class="relative z-10 p-6 text-white w-full">
        <h3 class="font-display text-2xl mb-1">الصف الأول الثانوي</h3>
        <p class="text-white/75 text-sm font-semibold mb-4">تأسيس قوي من الصفر.. قواعد ومفردات ومحادثة</p>
        <span class="inline-flex items-center gap-2 font-bold text-[#f0cd6e]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
      </div>
    </article>

    <article data-grade="الصف الثاني الثانوي" class="grade-card grade-img-card reveal-scale" style="--i:1">
      <img src="/static/img/grade-sec2.webp" alt="الصف الثاني الثانوي" class="grade-bg-img">
      <span class="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الصف الثاني الثانوي</span>
      <div class="grade-overlay"></div>
      <div class="relative z-10 p-6 text-white w-full">
        <h3 class="font-display text-2xl mb-1">الصف الثاني الثانوي</h3>
        <p class="text-white/75 text-sm font-semibold mb-4">بناء متكامل للمنهج.. شرح وتدريبات ومراجعات</p>
        <span class="inline-flex items-center gap-2 font-bold text-[#a8d4ff]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
      </div>
    </article>

    <article data-grade="الصف الثالث الثانوي" class="grade-card grade-img-card reveal-scale" style="--i:2">
      <img src="/static/img/grade-sec3.webp" alt="الصف الثالث الثانوي" class="grade-bg-img">
      <span class="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الثانوية العامة</span>
      <div class="grade-overlay"></div>
      <div class="relative z-10 p-6 text-white w-full">
        <h3 class="font-display text-2xl mb-1">الصف الثالث الثانوي</h3>
        <p class="text-white/75 text-sm font-semibold mb-4">سنة الحسم.. مراجعات نهائية وامتحانات بنظام الوزارة</p>
        <span class="inline-flex items-center gap-2 font-bold text-[#ffd57a]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
      </div>
    </article>
  </div>

  <!-- PREP GRADES -->
  <div class="mt-16">
    <div class="reveal mb-8">
      <h2 class="font-display text-3xl md:text-5xl section-title">المرحلة الإعدادية</h2>
      <p class="text-gray-500 font-semibold mt-5">ابدأ حب الفرنسية من بدري.. تأسيس ممتع للمرحلة الإعدادية ✨</p>
    </div>
    <div class="grid md:grid-cols-3 gap-6 stagger">
      <article data-grade="الصف الأول الإعدادي" class="grade-card grade-img-card reveal-scale" style="--i:0">
        <img src="/static/img/grade-prep1.webp" alt="الصف الأول الإعدادي" class="grade-bg-img">
        <span class="absolute top-4 right-4 z-10 bg-white/25 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الصف الأول الإعدادي</span>
        <div class="grade-overlay"></div>
        <div class="relative z-10 p-6 text-white w-full">
          <h3 class="font-display text-2xl mb-1">الصف الأول الإعدادي</h3>
          <p class="text-white/75 text-sm font-semibold mb-4">أول خطوة في عالم الفرنسية.. بأسلوب ممتع</p>
          <span class="inline-flex items-center gap-2 font-bold text-[#b6ffd9]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
        </div>
      </article>
      <article data-grade="الصف الثاني الإعدادي" class="grade-card grade-img-card reveal-scale" style="--i:1">
        <img src="/static/img/grade-prep2.webp" alt="الصف الثاني الإعدادي" class="grade-bg-img">
        <span class="absolute top-4 right-4 z-10 bg-white/25 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الصف الثاني الإعدادي</span>
        <div class="grade-overlay"></div>
        <div class="relative z-10 p-6 text-white w-full">
          <h3 class="font-display text-2xl mb-1">الصف الثاني الإعدادي</h3>
          <p class="text-white/75 text-sm font-semibold mb-4">خطوة بخطوة نحو الإتقان.. قواعد وتدريبات</p>
          <span class="inline-flex items-center gap-2 font-bold text-[#ffd0a8]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
        </div>
      </article>
      <article data-grade="الصف الثالث الإعدادي" class="grade-card grade-img-card reveal-scale" style="--i:2">
        <img src="/static/img/grade-prep3.webp" alt="الصف الثالث الإعدادي" class="grade-bg-img">
        <span class="absolute top-4 right-4 z-10 bg-white/25 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">الصف الثالث الإعدادي</span>
        <div class="grade-overlay"></div>
        <div class="relative z-10 p-6 text-white w-full">
          <h3 class="font-display text-2xl mb-1">الصف الثالث الإعدادي</h3>
          <p class="text-white/75 text-sm font-semibold mb-4">الاستعداد الحقيقي للثانوية.. تفوق وامتياز</p>
          <span class="inline-flex items-center gap-2 font-bold text-[#ffe9a8]">الدخول لجميع الكورسات <i class="fas fa-arrow-left card-arrow"></i></span>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ===================== COURSES (CAROUSEL) ===================== -->
<section id="courses-section" class="py-16 md:py-20 overflow-hidden" style="background:linear-gradient(180deg,#fff 0%,#faf7f0 100%)">
  <div class="max-w-7xl mx-auto px-4 md:px-8">
    <div class="flex items-end justify-between gap-4 mb-8 reveal">
      <div>
        <h2 class="font-display text-3xl md:text-5xl">كورساتنا المتاحة للعام <span class="text-red-600">2026/2027</span></h2>
        <p class="text-gray-500 font-semibold mt-3">اسحب يمين وشمال لتشوف كل الكورسات ← →</p>
      </div>
      <div class="hidden md:flex gap-2 shrink-0">
        <button id="courses-next" class="carousel-btn" aria-label="التالي"><i class="fas fa-chevron-right"></i></button>
        <button id="courses-prev" class="carousel-btn" aria-label="السابق"><i class="fas fa-chevron-left"></i></button>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto md:px-8 relative">
    <div id="courses-track" class="courses-track px-4 md:px-0">

      <!-- Course 1: foundation (free) -->
      <article class="course-card course-slide reveal" style="--i:0">
        <div class="course-thumb relative">
          <img src="/static/img/course-foundation.webp" alt="كورس التأسيس المجاني" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 price-tag free-tag text-sm">مجاني 🎁</span>
        </div>
        <div class="p-5">
          <h3 class="font-black text-xl mb-1">كورس التأسيس في الفرنسية</h3>
          <p class="text-gray-500 text-sm font-semibold mb-3"><i class="far fa-calendar ml-1 text-red-500"></i> متاح لجميع الصفوف — جرّب بنفسك</p>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl font-black text-green-600">مجاناً</span>
          </div>
          <div class="flex gap-2">
            <button data-course class="btn-primary flex-1 !py-2.5 text-sm">الدخول للكورس <i class="fas fa-arrow-left"></i></button>
          </div>
        </div>
      </article>

      <!-- Course 2: term1 (discount) -->
      <article class="course-card course-slide reveal" style="--i:1">
        <div class="course-thumb relative">
          <img src="/static/img/course-term1.webp" alt="كورس الترم الأول" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 discount-badge">خصم 25%</span>
        </div>
        <div class="p-5">
          <h3 class="font-black text-xl mb-1">كورس الترم الأول — 3 ثانوي</h3>
          <p class="text-gray-500 text-sm font-semibold mb-3"><i class="far fa-calendar ml-1 text-red-500"></i> بداية نزول المحتوى قريبًا</p>
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl font-black text-red-600">150 <span class="text-sm">جنيه</span></span>
            <span class="old-price">200 جنيه</span>
          </div>
          <div class="flex gap-2">
            <button data-course class="btn-outline flex-1 !py-2.5 text-sm">الدخول</button>
            <button data-course class="btn-primary flex-1 !py-2.5 text-sm">الاشتراك !</button>
          </div>
        </div>
      </article>

      <!-- Course 3: conversation -->
      <article class="course-card course-slide reveal" style="--i:2">
        <div class="course-thumb relative">
          <img src="/static/img/course-conversation.webp" alt="كورس المحادثة" class="w-full h-full object-cover">
          <span class="absolute top-3 right-3 price-tag text-sm">100 جنيه</span>
        </div>
        <div class="p-5">
          <h3 class="font-black text-xl mb-1">كورس المحادثة والنطق الصح</h3>
          <p class="text-gray-500 text-sm font-semibold mb-3"><i class="far fa-calendar ml-1 text-red-500"></i> Parle avec confiance 🎤</p>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl font-black text-red-600">100 <span class="text-sm">جنيه</span></span>
          </div>
          <div class="flex gap-2">
            <button data-course class="btn-outline flex-1 !py-2.5 text-sm">الدخول</button>
            <button data-course class="btn-primary flex-1 !py-2.5 text-sm">الاشتراك !</button>
          </div>
        </div>
      </article>

    </div>
  </div>
</section>

<!-- ===================== STEPS ===================== -->
<section id="steps-section" class="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
  <div class="text-center mb-12 reveal">
    <h2 class="font-display text-3xl md:text-5xl">إزاي تذاكر على المنصة؟ 🤔</h2>
    <p class="text-gray-500 font-semibold mt-3">خمس خطوات بسيطة وتبقى جاهز</p>
  </div>

  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
    <div class="step-card reveal text-white" style="--i:0;background:linear-gradient(145deg,#1b2a6b,#2a3a8c)">
      <div class="step-num text-white/25">1</div>
      <h3 class="font-black text-lg mb-2">اختار صفك ومادتك</h3>
      <p class="text-white/75 text-sm font-semibold">أول حاجة بتختار الصف الدراسي (إعدادي أو ثانوي) وبعدين تدخل على كورسات الفرنسية.</p>
    </div>
    <div class="step-card reveal" style="--i:1;background:#dbeafe">
      <div class="step-num text-blue-300">2</div>
      <h3 class="font-black text-lg mb-2">شوف الكورسات</h3>
      <p class="text-gray-600 text-sm font-semibold">هتلاقي الكورسات متقسمة حسب المواضيع والشهور والمراجعات.. اختار اللي يناسبك.</p>
    </div>
    <div class="step-card reveal" style="--i:2;background:#dcfce7">
      <div class="step-num text-green-300">3</div>
      <h3 class="font-black text-lg mb-2">اشترك في الكورس</h3>
      <p class="text-gray-600 text-sm font-semibold">لقيت كورسك؟ دوس "اشترك الآن" وابدأ تتعلم فورًا.. من الموبايل أو اللابتوب في أي وقت.</p>
    </div>
    <div class="step-card reveal text-white" style="--i:3;background:linear-gradient(145deg,#0891b2,#06b6d4)">
      <div class="step-num text-white/25">4</div>
      <h3 class="font-black text-lg mb-2">ذاكر واتمرّن</h3>
      <p class="text-white/80 text-sm font-semibold">اتفرج على الفيديوهات، حل الامتحانات، خُد نقاط، وارجع للمحتوى وقت ما تحب.</p>
    </div>
    <div class="step-card reveal" style="--i:4;background:#fef3c7">
      <div class="step-num text-amber-300">5</div>
      <h3 class="font-black text-lg mb-2">اسأل، شارك، ونافس</h3>
      <p class="text-gray-600 text-sm font-semibold">اسأل عن أي حاجة مش واضحة، وتابع مستواك ومكانك بين زمايلك من صفحة حالتك.</p>
    </div>
    <div class="step-card reveal text-white flex flex-col justify-center items-center text-center" style="--i:5;background:linear-gradient(145deg,#c62b38,#e63946)">
      <span class="text-4xl mb-3">🇫🇷</span>
      <h3 class="font-display text-2xl mb-3">جاهز تبدأ؟</h3>
      <a href="/auth?mode=register" class="btn-gold !py-2.5">ابدأ رحلتك الآن</a>
    </div>
  </div>
</section>

<!-- ===================== CTA ===================== -->
<section id="cta-section" class="py-16 md:py-24 px-4 md:px-8">
  <div class="max-w-6xl mx-auto cta-card-curve overflow-hidden bg-white grid lg:grid-cols-2 items-stretch reveal-scale shadow-2xl">
    <div class="p-8 md:p-14 flex flex-col justify-center text-center lg:text-right order-2 lg:order-1">
      <h2 class="font-display text-3xl md:text-5xl leading-tight mb-3">
        إبدأ رحلة تحقيق حلمك <span class="text-red-600">دلوقتي</span> <span class="wave-hand">✨</span>
      </h2>
      <p class="text-gray-500 font-semibold mb-8">جرّب أول محاضرة مجانًا وشوف الفرق بنفسك.. ومع مسيو مصطفى هتحب الفرنسية من أول حصة 🇫🇷❤️</p>
      <div class="flex flex-wrap gap-3 justify-center lg:justify-start">
        <a href="/auth?mode=register" class="btn-primary btn-cta-pulse text-lg">ابدأ رحلتك <i class="fas fa-arrow-left"></i></a>
        <a href="#grades-section" class="btn-outline text-lg">شوف الكورسات</a>
      </div>
    </div>
    <div class="relative order-1 lg:order-2 min-h-[320px] flex items-end justify-center"
         style="background:radial-gradient(600px 300px at 70% 20%,rgba(212,169,55,.25),transparent 60%),linear-gradient(145deg,#141c3f,#1b2a6b)">
      <i class="fas fa-archway absolute top-6 left-8 text-white/10 text-9xl"></i>
      <div class="badge-float float-y" style="top:14%;right:8%"><span class="text-lg">🗼</span> Bienvenue!</div>
      <img src="/static/img/teacher-cta.webp" alt="مسيو مصطفى حماده" class="relative z-10 h-[340px] md:h-[420px] object-contain teacher-hero-img">
    </div>
  </div>
</section>

<!-- ===================== SOCIAL ===================== -->
<section id="social-section" class="py-16 md:py-20 max-w-6xl mx-auto px-4 md:px-8">
  <div class="text-center mb-10 reveal">
    <div class="text-4xl mb-2 wave-hand inline-block">👇</div>
    <h2 class="font-display text-3xl md:text-5xl">تابعنا على السوشيال ميديا</h2>
    <p class="text-gray-500 font-semibold mt-3">كل الأخبار والمواعيد ومقاطع الشرح المجانية هتلاقيها هنا</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
    <div data-social="فيسبوك" data-url="${CONFIG.SITE.facebook}" class="social-card reveal flex items-center justify-between" style="--i:0">
      <div class="flex items-center gap-4">
        <div class="social-icon-wrap" style="background:linear-gradient(135deg,#1877f2,#0c5bc4)"><i class="fab fa-facebook-f"></i></div>
        <div><div class="font-black text-xl">فيسبوك</div><div class="text-gray-400 text-sm font-bold">تابعنا من هنا</div></div>
      </div>
      <i class="fas fa-chevron-left text-gray-300 text-xl"></i>
    </div>
    <div data-social="يوتيوب" data-url="${CONFIG.SITE.youtube}" class="social-card reveal flex items-center justify-between" style="--i:1">
      <div class="flex items-center gap-4">
        <div class="social-icon-wrap" style="background:linear-gradient(135deg,#ff0000,#c00)"><i class="fab fa-youtube"></i></div>
        <div><div class="font-black text-xl">يوتيوب</div><div class="text-gray-400 text-sm font-bold">تابعنا من هنا</div></div>
      </div>
      <i class="fas fa-chevron-left text-gray-300 text-xl"></i>
    </div>
    <div data-social="انستغرام" data-url="${CONFIG.SITE.instagram}" class="social-card reveal flex items-center justify-between" style="--i:2">
      <div class="flex items-center gap-4">
        <div class="social-icon-wrap" style="background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"><i class="fab fa-instagram"></i></div>
        <div><div class="font-black text-xl">انستغرام</div><div class="text-gray-400 text-sm font-bold">تابعنا من هنا</div></div>
      </div>
      <i class="fas fa-chevron-left text-gray-300 text-xl"></i>
    </div>
    <div data-social="تيك توك" data-url="${CONFIG.SITE.tiktok}" class="social-card reveal flex items-center justify-between" style="--i:3">
      <div class="flex items-center gap-4">
        <div class="social-icon-wrap" style="background:linear-gradient(135deg,#010101,#333)"><i class="fab fa-tiktok"></i></div>
        <div><div class="font-black text-xl">تيك توك</div><div class="text-gray-400 text-sm font-bold">تابعنا من هنا</div></div>
      </div>
      <i class="fas fa-chevron-left text-gray-300 text-xl"></i>
    </div>
  </div>
</section>

<!-- ===================== FOOTER ===================== -->
<footer id="footer" class="pt-14 pb-8 px-4 md:px-8">
  <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
    <section id="footer-about">
      <div class="flex items-center gap-3 mb-4">
        <img src="/static/img/logo.webp" alt="لوجو" class="h-14 w-14 object-contain rounded-xl bg-white/95 p-1">
        <div>
          <div class="font-display text-2xl text-white">منصة مسيو مصطفى</div>
          <div class="text-xs font-bold text-[#f0cd6e]">Monsieur Mostafa Hamada 🇫🇷</div>
        </div>
      </div>
      <p class="text-sm font-semibold leading-relaxed text-white/60">
        منصة مسيو مصطفى حماده المتخصصة في شرح اللغة الفرنسية للمرحلتين الإعدادية والثانوية..
        شرح مبسط، تدريبات، امتحانات، ومتابعة مستمرة. Le français, c'est facile! 💙
      </p>
    </section>

    <section id="footer-contact">
      <h3 class="font-black text-white text-lg mb-4">تواصل معنا</h3>
      <ul class="space-y-3 text-sm font-bold">
        <li class="flex items-center gap-3"><i class="fas fa-phone text-[#f0cd6e]"></i> <a href="tel:${CONFIG.SITE.phone}" dir="ltr" class="footer-link">${CONFIG.SITE.phone}</a></li>
        <li class="flex items-center gap-3"><i class="fab fa-whatsapp text-[#f0cd6e]"></i> <a href="https://wa.me/2${CONFIG.SITE.phone}" target="_blank" class="footer-link">تواصل واتساب</a></li>
        <li class="flex items-center gap-3"><i class="fas fa-location-dot text-[#f0cd6e]"></i> <span>${CONFIG.SITE.center}</span></li>
      </ul>
    </section>

    <section id="footer-links">
      <h3 class="font-black text-white text-lg mb-4">روابط سريعة</h3>
      <ul class="space-y-2 text-sm font-bold">
        <li><a href="#hero-section" class="footer-link">الرئيسية</a></li>
        <li><a href="#grades-section" class="footer-link">السنوات الدراسية</a></li>
        <li><a href="#courses-section" class="footer-link">الكورسات</a></li>
        <li><a href="/auth?mode=register" class="footer-link">إنشاء حساب</a></li>
      </ul>
      <div class="flex gap-3 mt-5">
        <button data-social="فيسبوك" data-url="${CONFIG.SITE.facebook}" class="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1877f2] transition flex items-center justify-center text-white" aria-label="فيسبوك"><i class="fab fa-facebook-f"></i></button>
        <button data-social="يوتيوب" data-url="${CONFIG.SITE.youtube}" class="w-10 h-10 rounded-full bg-white/10 hover:bg-red-600 transition flex items-center justify-center text-white" aria-label="يوتيوب"><i class="fab fa-youtube"></i></button>
        <button data-social="انستغرام" data-url="${CONFIG.SITE.instagram}" class="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 transition flex items-center justify-center text-white" aria-label="انستغرام"><i class="fab fa-instagram"></i></button>
        <button data-social="تيك توك" data-url="${CONFIG.SITE.tiktok}" class="w-10 h-10 rounded-full bg-white/10 hover:bg-black transition flex items-center justify-center text-white" aria-label="تيك توك"><i class="fab fa-tiktok"></i></button>
      </div>
    </section>
  </div>
  <div class="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 text-center text-xs font-bold text-white/40">
    © 2026 منصة مسيو مصطفى حماده — جميع الحقوق محفوظة 🇫🇷 Merci!
    <p class="mt-2 text-white/30">تصميم وتطوير: فريق <span class="text-[#f0cd6e]/70">عمرو كارم محمود</span> وفريقه — جميع حقوق التصميم محفوظة</p>
  </div>
</footer>

<button id="back-to-top" aria-label="العودة للأعلى"><i class="fas fa-arrow-up"></i></button>

<div id="coming-modal" class="modal-backdrop">
  <div class="modal-box">
    <div class="text-5xl mb-3">🗼</div>
    <h3 id="modal-title" class="font-display text-2xl mb-2"></h3>
    <p id="modal-msg" class="text-gray-500 font-semibold text-sm mb-6"></p>
    <button onclick="closeModal()" class="btn-primary w-full">تمام 👍</button>
  </div>
</div>

<script src="/static/app.js"></script>
</body>
</html>`
