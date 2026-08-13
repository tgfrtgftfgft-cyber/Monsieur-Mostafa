export const adminHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة الإشراف | منصة مسيو مصطفى</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Lalezar&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script>
    // حارس: لازم كلمة سر الإشراف تكون موجودة
    if (!sessionStorage.getItem('admin_pass')) { location.replace('/home'); }
  </script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Cairo',sans-serif;background:linear-gradient(160deg,#eef1fa,#f7f4ec,#eef6f0);background-attachment:fixed;min-height:100vh;color:#141c3f}
    .adm-topbar{background:linear-gradient(135deg,#141c3f,#1b2a6b);color:#fff;padding:14px 20px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:50;box-shadow:0 4px 16px rgba(20,28,63,.25)}
    .adm-topbar h1{font-family:'Lalezar',cursive;font-size:1.3rem;color:#ffd166;flex:1}
    .adm-topbar h1 i{margin-left:8px}
    .adm-exit{background:rgba(230,57,70,.9);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-family:'Cairo',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer}
    .adm-tabs{display:flex;gap:8px;padding:14px 20px;flex-wrap:wrap;background:#fff;border-bottom:2px solid #e8eaf2;position:sticky;top:62px;z-index:40}
    .adm-tab{border:2px solid #e8eaf2;background:#fff;color:#5a6180;border-radius:12px;padding:9px 18px;font-family:'Cairo',sans-serif;font-weight:800;font-size:.9rem;cursor:pointer;transition:all .2s}
    .adm-tab i{margin-left:6px}
    .adm-tab.active{background:linear-gradient(135deg,#141c3f,#2a3a7d);color:#ffd166;border-color:#141c3f;box-shadow:0 6px 16px rgba(20,28,63,.28);transform:translateY(-2px)}
    .adm-tab:hover{transform:translateY(-2px);border-color:#c9d2f0}
    .adm-main{padding:20px;max-width:1100px;margin:0 auto}
    .adm-section{display:none}
    .adm-section.active{display:block;animation:fadeIn .3s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
    .stat-card{background:#fff;border-radius:18px;padding:22px;border:2px solid #e8eaf2;display:flex;align-items:center;gap:16px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s}
    .stat-card:hover{transform:translateY(-4px);box-shadow:0 10px 26px rgba(20,28,63,.12)}
    .stat-card::after{content:'';position:absolute;left:-24px;top:-24px;width:80px;height:80px;border-radius:50%;background:rgba(212,169,55,.08)}
    .stat-icon{width:54px;height:54px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#fff}
    .stat-num{font-family:'Lalezar',cursive;font-size:1.9rem;line-height:1}
    .stat-lbl{font-size:.85rem;color:#7a8199;font-weight:700}
    .adm-card{background:#fff;border-radius:18px;border:2px solid #e8eaf2;padding:18px;margin-bottom:16px;overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:.85rem;min-width:640px}
    th{background:#f3f5fb;color:#1b2a6b;padding:10px 8px;text-align:right;font-weight:800;white-space:nowrap}
    td{padding:10px 8px;border-bottom:1px solid #eef1f9;vertical-align:middle}
    tr:hover td{background:#fbfcff}
    .b{border:none;border-radius:8px;padding:6px 10px;font-family:'Cairo',sans-serif;font-weight:700;font-size:.75rem;cursor:pointer;margin:2px;color:#fff;white-space:nowrap}
    .b-green{background:#2a9d54}.b-red{background:#e63946}.b-navy{background:#1b2a6b}.b-gold{background:#d4a937;color:#141c3f}.b-gray{background:#8a90a5}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:800}
    .bg-ok{background:#e3f6ea;color:#2a9d54}.bg-warn{background:#fdeaea;color:#e63946}.bg-mid{background:#fff6dd;color:#a07c14}
    .inp{width:100%;border:2px solid #e8eaf2;border-radius:10px;padding:10px 12px;font-family:'Cairo',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s;background:#fff}
    .inp:focus{border-color:#1b2a6b}
    label.fl{display:block;font-weight:800;font-size:.8rem;color:#1b2a6b;margin:10px 0 4px}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
    .adm-card h3{font-family:'Lalezar',cursive;color:#1b2a6b;margin-bottom:12px;font-size:1.15rem}
    .adm-card h3 i{color:#d4a937;margin-left:8px}
    .lec-editor{border:2px dashed #cfd6ea;border-radius:14px;padding:14px;margin-bottom:14px;background:#fbfcff}
    .lec-editor-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    .lec-editor-head .lecno{width:34px;height:34px;border-radius:10px;background:#141c3f;color:#ffd166;display:flex;align-items:center;justify-content:center;font-family:'Lalezar',cursive}
    .sub-item{display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap}
    .sub-item .inp{flex:1;min-width:120px}
    .mini-title{font-weight:800;font-size:.8rem;color:#5a6180;margin:10px 0 6px}
    .mini-title i{color:#d4a937;margin-left:5px}
    .q-block{border:1px solid #e8eaf2;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff}
    .toast{position:fixed;bottom:20px;right:50%;transform:translateX(50%);background:#141c3f;color:#ffd166;padding:12px 26px;border-radius:12px;font-weight:800;z-index:99;display:none;box-shadow:0 8px 24px rgba(0,0,0,.3)}
    .toast.show{display:block;animation:fadeIn .25s ease}
    .empty-msg{text-align:center;color:#9aa1b8;padding:26px;font-size:.95rem}
    .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
    .chart-card{background:#fff;border-radius:18px;border:2px solid #e8eaf2;padding:18px}
    .chart-card h4{font-weight:800;color:#1b2a6b;font-size:.9rem;margin-bottom:10px}
    .chart-card h4 i{color:#d4a937;margin-left:6px}
    .chart-box{height:220px;position:relative}
    .sp-overlay{position:fixed;inset:0;background:rgba(10,14,30,.65);z-index:80;display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto}
    .sp-overlay.show{display:flex}
    .sp-modal{background:#f0f2f8;border-radius:22px;width:100%;max-width:860px;overflow:hidden;margin:auto}
    .sp-head{background:linear-gradient(135deg,#141c3f,#1b2a6b);padding:18px 20px;display:flex;align-items:center;gap:12px}
    .sp-body{padding:18px;max-height:76vh;overflow-y:auto}
    .sp-stat{background:#fff;border-radius:14px;border:2px solid #e8eaf2;padding:14px;text-align:center}
    .sp-stat .n{font-family:'Lalezar',cursive;font-size:1.6rem}
    .sp-stat .l{font-size:.72rem;color:#7a8199;font-weight:700}
    .sp-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
    .sp-row{display:flex;gap:14px;flex-wrap:wrap;font-size:.82rem;margin-bottom:14px}
    .sp-row span{background:#fff;border:1px solid #e8eaf2;border-radius:10px;padding:6px 12px;font-weight:700}
    .student-row{cursor:pointer}
    @media(max-width:700px){.chart-grid{grid-template-columns:1fr}.sp-grid4{grid-template-columns:repeat(2,1fr)}}
    .banks-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
    .bank-card{background:#fff;border:2px solid #e8eaf2;border-radius:16px;padding:16px;transition:all .2s;position:relative}
    .bank-card:hover{border-color:#d4a937;transform:translateY(-3px);box-shadow:0 10px 24px rgba(212,169,55,.15)}
    .bk-ico{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#141c3f,#2a3a7d);color:#ffd166;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:10px}
    .bank-group-title{font-family:'Lalezar',cursive;color:#1b2a6b;font-size:1.1rem;margin:18px 0 10px;display:flex;align-items:center;gap:10px}
    .bank-group-title i{color:#d4a937}
    .bank-group-title::after{content:'';flex:1;height:2px;background:linear-gradient(to left,#e8eaf2,transparent);border-radius:2px}
    @keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(42,157,84,.5)}70%{box-shadow:0 0 0 8px rgba(42,157,84,0)}100%{box-shadow:0 0 0 0 rgba(42,157,84,0)}}
    .online-dot{width:10px;height:10px;border-radius:50%;background:#2a9d54;display:inline-block;animation:pulseDot 1.6s infinite}
    .online-chip{display:flex;align-items:center;gap:10px;background:#fff;border:2px solid #e8eaf2;border-radius:14px;padding:10px 14px}
    .online-chip .av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#141c3f,#2a3a7d);color:#ffd166;display:flex;align-items:center;justify-content:center;font-weight:800}
    .img-pick{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .img-pick .ip{width:72px;height:52px;border-radius:10px;object-fit:cover;cursor:pointer;border:3px solid transparent;transition:all .15s}
    .img-pick .ip:hover{transform:scale(1.06)}
    .img-pick .ip.sel{border-color:#d4a937;box-shadow:0 4px 12px rgba(212,169,55,.35)}
    .ai-box{border:2px dashed #9d6bce;border-radius:16px;padding:16px;background:linear-gradient(135deg,#faf6ff,#f3ecfc);margin-top:14px}
    .ai-box h4{color:#7b3fb5;font-weight:800;font-size:.95rem;margin-bottom:8px}
    .ai-box h4 i{margin-left:6px}
    .b-purple{background:linear-gradient(135deg,#8b4fc4,#6a30a0)}
    .step-pill{display:inline-flex;align-items:center;gap:6px;background:#fff;border:2px solid #e8eaf2;border-radius:20px;padding:4px 12px;font-size:.75rem;font-weight:800;color:#5a6180}
    .step-pill b{color:#d4a937}
    .exam-pick-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#f3ecfc;border-radius:10px;padding:8px;margin-bottom:6px}
    @media(max-width:640px){.row2,.row3{grid-template-columns:1fr}.adm-tabs{top:58px}}
    /* ===== بطاقات كورسات مربعة ===== */
    .ccards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
    .ccard{background:#fff;border:2px solid #e8eaf2;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:all .2s}
    .ccard:hover{transform:translateY(-4px);box-shadow:0 12px 28px rgba(20,28,63,.13);border-color:#d4a937}
    .ccard .cimg{width:100%;aspect-ratio:1/1;object-fit:cover;background:#f3f5fb;display:block}
    .ccard .cemoji{display:flex;align-items:center;justify-content:center;font-size:3.4rem}
    .cb-img-area{width:100%;aspect-ratio:1/1;background:#f6f8fe;border-bottom:2px dashed #cfd6ea;display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer;color:#7a8199;font-weight:800;font-size:.9rem;position:relative;overflow:hidden;line-height:1.9}
    .cb-img-area:hover{background:#eef3ff;color:#1b2a6b}
    .cb-img-area img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    /* ===== مستطيلات المحاضرات داخل الكورس ===== */
    .lec-rect{border:2px solid #e8eaf2;border-radius:16px;background:#fff;margin-bottom:12px;overflow:hidden;transition:border-color .2s}
    .lec-rect.open{border-color:#d4a937;box-shadow:0 8px 22px rgba(212,169,55,.12)}
    .lec-rect-head{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;flex-wrap:wrap}
    .lec-rect-head:hover{background:#fbfcff}
    .lec-body{display:none;padding:12px 14px 16px;border-top:2px dashed #eef1f9;background:#fdfdff}
    .lec-rect.open .lec-body{display:block;animation:fadeIn .25s ease}
    .opt3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
    .opt3 button{border:2px dashed #cfd6ea;background:#fbfcff;border-radius:14px;padding:16px 8px;font-family:'Cairo',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .15s;color:#1b2a6b;line-height:1.8}
    .opt3 button:hover{border-color:#d4a937;background:#fffdf2;transform:translateY(-2px)}
    .opt3 button .big{font-size:1.6rem;display:block}
    .item-chip{display:flex;align-items:center;gap:8px;background:#f6f8fe;border:1px solid #e8eaf2;border-radius:12px;padding:8px 10px;margin-bottom:6px;font-size:.8rem;font-weight:700;flex-wrap:wrap}
    .item-chip .inp{flex:1;min-width:110px;padding:7px 10px;font-size:.8rem}
    .yt-thumb{width:78px;height:46px;object-fit:cover;border-radius:8px;border:2px solid #d4a937}
    /* ===== تبويبات فرعية ===== */
    .subtabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;background:#fff;border:2px solid #e8eaf2;border-radius:16px;padding:10px}
    .subtab{border:none;background:transparent;color:#5a6180;border-radius:12px;padding:10px 16px;font-family:'Cairo',sans-serif;font-weight:800;font-size:.88rem;cursor:pointer;transition:all .2s}
    .subtab.active{background:linear-gradient(135deg,#141c3f,#2a3a7d);color:#ffd166;box-shadow:0 4px 12px rgba(20,28,63,.25)}
    .subtab:hover{transform:translateY(-1px)}
    .subpanel{display:none}
    .subpanel.active{display:block;animation:fadeIn .25s ease}
    @media(max-width:640px){.opt3{grid-template-columns:1fr}.ccards{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
  </style>
</head>
<body>
  <header class="adm-topbar">
    <h1><i class="fas fa-user-shield"></i>لوحة الإشراف — منصة مسيو مصطفى</h1>
    <button class="adm-exit" id="adm-exit"><i class="fas fa-sign-out-alt"></i> خروج</button>
  </header>

  <nav class="adm-tabs" id="adm-tabs">
    <button class="adm-tab active" data-tab="stats"><i class="fas fa-chart-pie"></i>إحصائيات</button>
    <button class="adm-tab" data-tab="students"><i class="fas fa-user-graduate"></i>الطلاب</button>
    <button class="adm-tab" data-tab="enrolls"><i class="fas fa-id-card"></i>الاشتراكات</button>
    <button class="adm-tab" data-tab="courses"><i class="fas fa-book"></i>الكورسات</button>
    <button class="adm-tab" data-tab="content"><i class="fas fa-robot"></i>قسم الذكاء الاصطناعي والتلجرام</button>
    <button class="adm-tab" data-tab="banks"><i class="fas fa-database"></i>بنوك الأسئلة</button>
    <button class="adm-tab" data-tab="grades"><i class="fas fa-ranking-star"></i>درجات الطلاب</button>
    <button class="adm-tab" data-tab="online"><i class="fas fa-tower-broadcast"></i>المتواجدون الآن <span id="online-count-badge" class="badge bg-ok" style="display:none">0</span></button>
  </nav>

  <main class="adm-main">
    <!-- إحصائيات -->
    <section class="adm-section active" id="sec-stats">
      <div class="stat-grid" id="stats-grid">
        <div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
      </div>
      <div class="chart-grid">
        <div class="chart-card"><h4><i class="fas fa-right-to-bracket"></i>طلاب دخلوا المنصة كل يوم (آخر 14 يوم)</h4><div class="chart-box"><canvas id="ch-logins"></canvas></div></div>
        <div class="chart-card"><h4><i class="fas fa-id-card"></i>طلبات اشتراك كل يوم</h4><div class="chart-box"><canvas id="ch-subs"></canvas></div></div>
        <div class="chart-card"><h4><i class="fas fa-circle-play"></i>مشاهدات الفيديوهات كل يوم</h4><div class="chart-box"><canvas id="ch-videos"></canvas></div></div>
        <div class="chart-card"><h4><i class="fas fa-user-plus"></i>تسجيلات جديدة كل يوم</h4><div class="chart-box"><canvas id="ch-regs"></canvas></div></div>
      </div>
    </section>

    <!-- الطلاب -->
    <section class="adm-section" id="sec-students">
      <div class="adm-card">
        <h3><i class="fas fa-user-graduate"></i>الطلاب المسجلين</h3>
        <input class="inp" id="student-search" placeholder="🔍 ابحث بالاسم أو رقم الموبايل..." style="margin-bottom:12px">
        <div id="students-table"><div class="empty-msg">جاري التحميل...</div></div>
      </div>
    </section>

    <!-- الاشتراكات -->
    <section class="adm-section" id="sec-enrolls">
      <div class="adm-card">
        <h3><i class="fas fa-plus-circle"></i>إضافة اشتراك يدوي</h3>
        <div class="row2">
          <div><label class="fl">رقم موبايل الطالب</label><input class="inp" id="add-en-phone" placeholder="01xxxxxxxxx"></div>
          <div><label class="fl">الكورس</label><select class="inp" id="add-en-course"></select></div>
        </div>
        <button class="b b-green" id="add-en-btn" style="margin-top:12px;padding:10px 22px;font-size:.85rem"><i class="fas fa-check"></i> تفعيل الاشتراك</button>
      </div>
      <div class="adm-card">
        <h3><i class="fas fa-id-card"></i>كل الاشتراكات</h3>
        <div id="enrolls-table"><div class="empty-msg">جاري التحميل...</div></div>
      </div>
    </section>

    <!-- الكورسات -->
    <section class="adm-section" id="sec-courses">
      <!-- 🏠 شاشة الكورسات -->
      <div id="courses-home">
        <div class="adm-card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <h3 style="margin:0;flex:1"><i class="fas fa-graduation-cap"></i>🎓 الكورسات</h3>
          <button class="b b-gold" id="course-new-btn" style="padding:12px 26px;font-size:.95rem"><i class="fas fa-plus"></i> نبدأ كورس جديد ✨</button>
        </div>

        <!-- 🆕 بطاقة إنشاء كورس (مربعة زي بطاقة الطالب) -->
        <div class="adm-card" id="course-builder" style="display:none">
          <h3>🆕 كورس جديد <span style="font-size:.75rem;color:#7a8199;font-weight:700">— املأ البطاقة زي ما الطالب هيشوفها</span></h3>
          <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start">
            <div class="ccard" style="width:250px;flex-shrink:0">
              <div class="cb-img-area" id="cb-img-area">
                <img id="cb-img-preview" style="display:none" alt="صورة الكورس">
                <div id="cb-img-hint"><span style="font-size:2.4rem">📷</span><br>أضف صورة<br><span style="font-size:.68rem;color:#9aa1b8">اضغط للرفع من جهازك</span></div>
              </div>
              <div style="padding:12px;display:grid;gap:8px">
                <input class="inp" id="c-title" placeholder="✏️ اسم الكورس">
                <input class="inp" id="c-desc" placeholder="📝 وصف قصير (اختياري)" style="font-size:.8rem">
                <div style="display:flex;gap:8px">
                  <input class="inp" id="c-price" type="number" placeholder="💰 السعر" style="flex:1">
                  <input class="inp" id="c-discount" type="number" min="0" max="100" placeholder="🔥 خصم %" style="flex:1">
                </div>
                <div id="c-final-price" style="display:none;background:#eafaf0;border:1px dashed #2a9d54;border-radius:10px;padding:8px 10px;font-size:.8rem;font-weight:900;color:#1d7a3f;text-align:center"></div>
                <select class="inp" id="c-grade"><option value="all">🌍 كل الصفوف</option><option value="prep1">1️⃣ أولى إعدادي</option><option value="prep2">2️⃣ تانية إعدادي</option><option value="prep3">3️⃣ تالتة إعدادي</option><option value="sec1">🎓 أولى ثانوي</option><option value="sec2">🎓 تانية ثانوي</option><option value="sec3">🎓 تالتة ثانوي</option></select>
                <textarea class="inp" id="c-longdesc" rows="4" placeholder="📋 وصف الكورس — التواريخ والمواعيد وأي تفاصيل للطلاب..." style="font-size:.8rem;resize:vertical;line-height:1.7"></textarea>
              </div>
            </div>
            <div style="flex:1;min-width:230px;display:grid;gap:12px;align-content:start">
              <div style="background:#eef4ff;border:1px solid #c9d8f5;border-radius:12px;padding:12px;font-size:.8rem;font-weight:800;color:#2b3a67">🪄 الاسم التعريفي بيتولّد <b>تلقائي</b> — مش محتاج تكتب حاجة</div>
              <label style="font-weight:800;font-size:.88rem;display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="c-published" checked> 🟢 منشور للطلاب فورًا</label>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span style="font-weight:800;font-size:.82rem">⏰ أو موعد النشر:</span>
                <input class="inp" id="c-publish-at" type="datetime-local" style="max-width:210px">
              </div>
              <div style="background:#fff4ec;border:1px solid #ffd9bd;border-radius:12px;padding:12px;display:grid;gap:8px">
                <span style="font-weight:900;font-size:.85rem;color:#b45309">⏳ عدّاد تنازلي لانتهاء الخصم</span>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <button class="b b-gold" id="c-discount-timer-btn" type="button" style="padding:8px 14px;font-size:.8rem">⏰ ضبط وقت الخصم</button>
                  <input class="inp" id="c-discount-end" type="datetime-local" style="max-width:210px;display:none">
                  <button class="b b-gray" id="c-discount-timer-clear" type="button" style="padding:8px 12px;font-size:.78rem;display:none">✖️</button>
                </div>
                <span style="font-size:.72rem;color:#9a6b3f;font-weight:700">الطالب هيشوف عدّاد ⏳ لحد الوقت ده — وبعده الخصم بيختفي تلقائي</span>
              </div>
              <span id="c-img-upload-status" style="font-size:.78rem;font-weight:800;color:#7b3fb5"></span>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button class="b b-green" id="c-save-btn" style="padding:12px 28px;font-size:.9rem">💾 حفظ الكورس</button>
                <button class="b b-gray" id="c-clear-btn" style="padding:12px 18px;font-size:.9rem">✖️ إلغاء</button>
              </div>
            </div>
          </div>
          <input type="hidden" id="c-id"><input type="hidden" id="c-img" value="🇫🇷"><input type="hidden" id="c-order" value="1"><input type="hidden" id="c-oldprice" value="0">
          <input type="file" id="c-img-file" accept="image/*" style="display:none">
        </div>

        <div class="adm-card">
          <h3><i class="fas fa-book"></i>📚 كل الكورسات</h3>
          <div id="courses-table" class="ccards"><div class="empty-msg">⏳ جاري التحميل...</div></div>
        </div>
      </div>

      <!-- 🚪 داخل الكورس -->
      <div id="course-inside" style="display:none">
        <div class="adm-card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <button class="b b-gray" id="ci-back" style="padding:10px 16px">⬅️ رجوع</button>
          <h3 id="ci-title" style="margin:0;flex:1">📘 الكورس</h3>
          <button class="b b-green" id="ci-save" style="padding:10px 22px;font-size:.88rem">💾 حفظ الكل</button>
        </div>
        <div class="adm-card">
          <div id="lectures-rects"><div class="empty-msg">⏳ جاري التحميل...</div></div>
          <button class="b b-gold" id="ci-add-lec" style="padding:13px 26px;font-size:.92rem;margin-top:10px">➕ أضف محاضرة أو درس</button>
        </div>
      </div>

      <!-- عناصر قديمة مخفية (توافق مع الكود) -->
      <div style="display:none">
        <select id="content-course"></select><div id="lectures-editor"></div>
        <button id="add-lecture-btn"></button><button id="save-content-btn"></button>
        <button id="c-img-upload-btn"></button><div id="c-img-pick"></div>
      </div>
    </section>

    <!-- قسم الذكاء الاصطناعي والتلجرام -->
    <section class="adm-section" id="sec-content">
      <!-- 🧭 تبويبات فرعية -->
      <div class="subtabs" id="ai-subtabs">
        <button class="subtab active" data-sub="tools">🛠️ أدوات المساعدة</button>
        <button class="subtab" data-sub="curriculum">📚 ملفات المنهج</button>
        <button class="subtab" data-sub="telegram">✈️ التلجرام</button>
        <button class="subtab" data-sub="analytics">📊 التحليلات</button>
      </div>

      <!-- 🛠️ أدوات المساعدة -->
      <div class="subpanel active" id="sub-tools">
        <div class="adm-card">
          <h3>🛠️ أدوات المساعدة لكل بنك</h3>
          <p style="font-size:.78rem;color:#7a8199;font-weight:700;margin-bottom:10px">🌐 ترجمة + 🤖 شات AI — فعّلهم أو اقفلهم لكل بنك</p>
          <div id="tools-banks-list"><div class="empty-msg">⏳ جاري التحميل...</div></div>
        </div>
      </div>

      <!-- 📚 ملفات المنهج -->
      <div class="subpanel" id="sub-curriculum">
        <div class="adm-card">
          <h3>📚 ملفات المنهج</h3>
          <p style="font-size:.78rem;color:#7a8199;font-weight:700;margin-bottom:10px">🤖 الذكاء الاصطناعي بيستخدمها في تحليل ملف الطالب</p>
          <div class="row3">
            <div><label class="fl">🎓 الصف</label>
              <select class="inp" id="cur-grade">
                <option value="prep1">أولى إعدادي</option><option value="prep2">تانية إعدادي</option><option value="prep3">تالتة إعدادي</option>
                <option value="sec1">أولى ثانوي</option><option value="sec2">تانية ثانوي</option><option value="sec3" selected>تالتة ثانوي</option>
              </select>
            </div>
            <div style="grid-column:span 2"><label class="fl">✏️ عنوان الملف</label><input class="inp" id="cur-title" placeholder="مثال: الوحدة الأولى — Les vêtements"></div>
          </div>
          <label class="fl">📄 محتوى المنهج</label>
          <textarea class="inp" id="cur-content" rows="6" placeholder="الصق محتوى المنهج هنا..."></textarea>
          <input type="hidden" id="cur-id">
          <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">
            <button class="b b-green" id="cur-save" style="padding:9px 20px;font-size:.82rem">💾 حفظ</button>
            <button class="b b-gray" id="cur-clear" style="padding:9px 14px;font-size:.82rem">🆕 جديد</button>
          </div>
          <div class="mini-title" style="margin-top:14px">🗂️ الملفات المحفوظة</div>
          <div id="cur-list"><div class="empty-msg">⏳ جاري التحميل...</div></div>
        </div>
      </div>

      <!-- ✈️ التلجرام -->
      <div class="subpanel" id="sub-telegram">
        <div class="adm-card">
          <h3>✈️ التلجرام — كلمات المرور المؤقتة</h3>
          <div class="stat-grid" style="margin-bottom:14px">
            <div class="stat-card"><span style="font-size:2rem">🔑</span><div><div class="stat-num" style="font-size:1.1rem">كلمة مؤقتة</div><div class="stat-lbl">من البوت لو الطالب نسي</div></div></div>
            <div class="stat-card"><span style="font-size:2rem">⏰</span><div><div class="stat-num" style="font-size:1.1rem">ساعتين</div><div class="stat-lbl">صلاحية الكلمة المؤقتة</div></div></div>
            <div class="stat-card"><span style="font-size:2rem">3️⃣</span><div><div class="stat-num" style="font-size:1.1rem">3 محاولات</div><div class="stat-lbl">حد أقصى في اليوم</div></div></div>
            <div class="stat-card"><span style="font-size:2rem">🔒</span><div><div class="stat-num" style="font-size:1.1rem">تغيير إجباري</div><div class="stat-lbl">أول دخول بالمؤقتة</div></div></div>
          </div>
          <div id="tg-stats"></div>
        </div>
      </div>

      <!-- 📊 التحليلات -->
      <div class="subpanel" id="sub-analytics">
        <div class="adm-card">
          <h3>📊 التحليلات — أكتر الأسئلة غلطًا</h3>
          <button class="b b-navy" id="analytics-refresh" style="padding:9px 18px;font-size:.82rem;margin-bottom:10px">🔄 تحديث</button>
          <div id="most-missed-box"><div class="empty-msg">👆 اضغط تحديث</div></div>
        </div>
      </div>
    </section>

    <!-- بنوك الأسئلة -->
    <section class="adm-section" id="sec-banks">
      <div class="adm-card">
        <h3><i class="fas fa-database"></i>إنشاء / تعديل بنك أسئلة</h3>
        <div class="row3">
          <div><label class="fl">اسم البنك</label><input class="inp" id="bk-title" placeholder="مثال: بنك الوحدة الأولى"></div>
          <div><label class="fl">المجموعة</label><input class="inp" id="bk-group" list="bk-groups" placeholder="مثال: الترم الأول"><datalist id="bk-groups"></datalist></div>
          <div><label class="fl">معرّف البنك (تلقائي)</label><input class="inp" id="bk-id" placeholder="يتولّد تلقائياً" readonly></div>
        </div>
        <div class="ai-box">
          <h4><i class="fas fa-wand-magic-sparkles"></i>توليد أسئلة بالذكاء الاصطناعي (فرنساوي فقط — من المنهج فقط)</h4>
          <label class="fl">الصق هنا مادة المنهج (نص الدرس / الكلمات / القواعد)</label>
          <textarea class="inp" id="ai-material" rows="6" placeholder="الصق محتوى الدرس بالفرنسية هنا... الذكاء الاصطناعي مش هيطلع بره اللي هتحطه"></textarea>
          <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
            <label class="fl" style="margin:0">نوع التوليد:</label>
            <select class="inp" id="ai-mode" style="max-width:260px">
              <option value="qcm">اختيار من متعدد (4 اختيارات)</option>
              <option value="truefalse">صح وخطأ (Vrai/Faux) — بالعدد المظبوط</option>
              <option value="essay">أسئلة مقالية مباشرة وبسيطة</option>
              <option value="intellectual">النسخ الفكري (حلل امتحان وولّد بنفس الأسلوب)</option>
              <option value="extract">استخراج الأسئلة من ملف بنك جاهز (زي ما هي)</option>
              <option value="models">نماذج متطابقة الصعوبة</option>
            </select>
            <label class="fl" style="margin:0">عدد الأسئلة:</label>
            <input class="inp" id="ai-count" type="number" min="1" max="30" value="10" style="width:90px">
          </div>
          <div id="ai-models-row" style="display:none;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
            <label class="fl" style="margin:0">عدد النماذج:</label>
            <input class="inp" id="ai-num-models" type="number" min="1" max="6" value="2" style="width:80px">
            <label class="fl" style="margin:0">أسئلة لكل نموذج:</label>
            <input class="inp" id="ai-per-model" type="number" min="1" max="30" value="10" style="width:80px">
          </div>
          <p id="ai-mode-hint" style="font-size:.75rem;font-weight:800;color:#7b3fb5;margin-top:8px"></p>
          <div style="display:flex;gap:10px;align-items:center;margin-top:10px;flex-wrap:wrap">
            <button class="b b-purple" id="ai-gen-btn" style="padding:10px 20px;font-size:.85rem"><i class="fas fa-wand-magic-sparkles"></i> ولّد الأسئلة</button>
            <span id="ai-status" style="font-size:.8rem;font-weight:700;color:#7b3fb5"></span>
          </div>
          <div id="ai-analysis-box" style="display:none;margin-top:10px;background:#f3ecfd;border:1px solid #d9c7f5;border-radius:12px;padding:12px;font-size:.8rem;font-weight:700;color:#5a2d91;line-height:1.9"></div>
        </div>
        <div class="mini-title" style="margin-top:16px"><i class="fas fa-list-check"></i>أسئلة البنك (<span id="bk-count">0</span> سؤال)</div>
        <div id="bk-questions"></div>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
          <button class="b b-gold" id="bk-add-q" style="padding:9px 18px;font-size:.82rem"><i class="fas fa-plus"></i> إضافة سؤال يدوي</button>
          <button class="b b-gold" id="bk-add-tf" style="padding:9px 18px;font-size:.82rem"><i class="fas fa-check-double"></i> صح وخطأ يدوي</button>
          <button class="b b-gold" id="bk-add-essay" style="padding:9px 18px;font-size:.82rem"><i class="fas fa-pen-fancy"></i> سؤال مقالي يدوي</button>
          <button class="b b-green" id="bk-save" style="padding:9px 22px;font-size:.82rem"><i class="fas fa-save"></i> حفظ البنك</button>
          <button class="b b-gray" id="bk-clear" style="padding:9px 16px;font-size:.82rem">بنك جديد</button>
        </div>
      </div>
      <div class="adm-card">
        <h3><i class="fas fa-folder-tree"></i>كل البنوك (حسب المجموعة)</h3>
        <div id="banks-list"><div class="empty-msg">جاري التحميل...</div></div>
      </div>
    </section>

    <!-- درجات الطلاب -->
    <section class="adm-section" id="sec-grades">
      <div class="adm-card">
        <h3><i class="fas fa-ranking-star"></i>درجات الطلاب في الامتحانات</h3>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px">
          <label class="fl" style="margin:0">اختر البنك / الامتحان:</label>
          <select class="inp" id="grades-bank" style="max-width:320px"><option value="">كل الامتحانات</option></select>
          <button class="b b-navy" id="grades-refresh" style="padding:9px 16px;font-size:.82rem"><i class="fas fa-rotate"></i> تحديث</button>
        </div>
        <div id="grades-table"><div class="empty-msg">جاري التحميل...</div></div>
      </div>
    </section>

    <!-- المتواجدون الآن -->
    <section class="adm-section" id="sec-online">
      <div class="adm-card">
        <h3><i class="fas fa-tower-broadcast"></i>المتواجدون على المنصة الآن <span class="online-dot" style="margin-right:6px"></span></h3>
        <p style="font-size:.78rem;color:#7a8199;font-weight:700;margin-bottom:12px"><i class="fas fa-circle-info"></i> يتم التحديث تلقائياً كل 30 ثانية — الطالب يعتبر متواجد لو فتح المنصة خلال آخر 5 دقائق</p>
        <div id="online-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px"><div class="empty-msg">جاري التحميل...</div></div>
      </div>
    </section>
  </main>

  <!-- نافذة ملف الطالب -->
  <div class="sp-overlay" id="sp-overlay">
    <div class="sp-modal">
      <div class="sp-head">
        <div style="flex:1">
          <h2 id="sp-name" style="font-family:'Lalezar',cursive;color:#ffd166;font-size:1.3rem">—</h2>
          <p id="sp-sub" style="color:#c9d2f0;font-size:.8rem"></p>
        </div>
        <button class="b b-red" id="sp-close" style="font-size:.85rem"><i class="fas fa-times"></i></button>
      </div>
      <div class="sp-body" id="sp-body">
        <div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="/static/admin.js"></script>
<footer id="design-credit" class="text-center py-3 text-[10px] font-bold text-white/30">تصميم وتطوير: فريق عمرو كارم محمود وفريقه</footer>
</body>
</html>`
