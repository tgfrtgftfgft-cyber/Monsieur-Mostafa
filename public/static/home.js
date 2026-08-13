/* المنزل — منصة مسيو مصطفى */
(function () {
  'use strict'

  // ===== حارس الجلسة =====
  var raw = localStorage.getItem('session')
  if (!raw) { location.replace('/auth?mode=login'); return }
  var session
  try { session = JSON.parse(raw) } catch (e) { localStorage.removeItem('session'); location.replace('/auth?mode=login'); return }
  if (!session || !session.phone) { localStorage.removeItem('session'); location.replace('/auth?mode=login'); return }

  var CFG = window.__CFG || {}

  var GRADE_NAMES = {
    prep1: 'الصف الأول الإعدادي',
    prep2: 'الصف الثاني الإعدادي',
    prep3: 'الصف الثالث الإعدادي',
    sec1: 'الصف الأول الثانوي',
    sec2: 'الصف الثاني الثانوي',
    sec3: 'الصف الثالث الثانوي'
  }

  function $(id) { return document.getElementById(id) }
  function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || 'بطل' }

  // ===== مودال التنبيهات =====
  function showAlert(opts) {
    var icon = $('alert-icon'), title = $('alert-title'), msg = $('alert-msg'), actions = $('alert-actions')
    icon.className = 'w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ' + (opts.iconClass || 'bg-blue-50 text-blue-500')
    icon.innerHTML = '<i class="fas ' + (opts.icon || 'fa-circle-info') + '"></i>'
    title.textContent = opts.title || ''
    msg.textContent = opts.msg || ''
    actions.innerHTML = ''
    ;(opts.actions || [{ label: 'تمام', primary: true }]).forEach(function (a) {
      var b = document.createElement('button')
      b.className = a.primary
        ? 'bg-[#1b2a6b] hover:bg-[#141c3f] text-white font-bold rounded-xl px-5 py-2.5 text-sm transition'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl px-5 py-2.5 text-sm transition'
      b.textContent = a.label
      b.onclick = function () { closeAlert(); if (a.onClick) a.onClick() }
      actions.appendChild(b)
    })
    $('alert-modal').classList.remove('hidden')
  }
  function closeAlert() { $('alert-modal').classList.add('hidden') }
  $('alert-modal').addEventListener('click', function (e) { if (e.target === this) closeAlert() })

  // ===== التنقل بين الأقسام =====
  function switchView(view) {
    document.querySelectorAll('.home-view').forEach(function (v) { v.classList.add('hidden') })
    var target = $('view-' + view)
    if (target) target.classList.remove('hidden')
    document.querySelectorAll('.home-tab, .home-tab-m').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-view') === view)
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  document.querySelectorAll('.home-tab, .home-tab-m').forEach(function (t) {
    t.addEventListener('click', function () { switchView(t.getAttribute('data-view')) })
  })
  document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function () { switchView(el.getAttribute('data-goto')) })
  })

  // ===== تسجيل الخروج =====
  function doLogout() {
    showAlert({
      icon: 'fa-arrow-right-from-bracket', iconClass: 'bg-red-50 text-[#e63946]',
      title: 'تسجيل الخروج', msg: 'متأكد إنك عايز تسجل خروجك من المنصة؟',
      actions: [
        { label: 'آه، خروج', primary: true, onClick: function () { localStorage.removeItem('session'); location.replace('/auth?mode=login') } },
        { label: 'لأ، كمل' }
      ]
    })
  }
  $('logout-btn').addEventListener('click', doLogout)
  var lb2 = $('logout-btn-2'); if (lb2) lb2.addEventListener('click', doLogout)

  function forceLogout(msg) {
    localStorage.removeItem('session')
    showAlert({
      icon: 'fa-triangle-exclamation', iconClass: 'bg-amber-50 text-amber-500',
      title: 'تم تسجيل خروجك', msg: msg,
      actions: [{ label: 'تسجيل الدخول', primary: true, onClick: function () { location.replace('/auth?mode=login') } }]
    })
    setTimeout(function () { location.replace('/auth?mode=login') }, 6000)
  }

  // ===== تعبئة فورية من الجلسة =====
  var fn = firstName(session.name)
  $('user-first-name').textContent = fn
  $('user-avatar').textContent = fn.charAt(0)
  $('welcome-name').textContent = fn
  var gradeName = GRADE_NAMES[session.grade] || session.grade || ''
  $('welcome-grade').textContent = gradeName
  $('grade-title').textContent = 'كورسات ' + (gradeName || 'صفك')
  try {
    $('welcome-date').textContent = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch (e) {}

  // ===== تعبئة بيانات "حالتي" =====
  function fillUserData(u) {
    var f = firstName(u.name)
    $('user-first-name').textContent = f
    $('user-avatar').textContent = f.charAt(0)
    $('welcome-name').textContent = f
    $('status-avatar').textContent = f.charAt(0)
    $('status-name').textContent = u.name || ''
    var gn = GRADE_NAMES[u.grade] || u.grade || ''
    $('status-grade').textContent = gn
    $('welcome-grade').textContent = gn
    $('grade-title').textContent = 'كورسات ' + (gn || 'صفك')
    $('status-phone').textContent = u.phone || ''
    $('status-parent').textContent = u.parentPhone || ''
    $('status-gov').textContent = u.governorate || '—'
    $('status-city').textContent = u.city || '—'
    $('status-azhari').textContent = u.isAzhari ? 'أزهري' : 'عام'
    if (u.createdAt) {
      try { $('status-joined').textContent = new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) } catch (e) { $('status-joined').textContent = '—' }
    } else { $('status-joined').textContent = '—' }

    var badge = $('verify-status-badge'), cta = $('status-verify-cta'), banner = $('verify-banner'), wv = $('welcome-verify')
    if (u.verified) {
      badge.className = 'status-badge badge-ok'
      badge.innerHTML = '<i class="fas fa-circle-check ml-1"></i> <span>حساب مؤكد</span>'
      cta.classList.add('hidden')
      banner.classList.add('hidden')
      wv.innerHTML = '<span class="inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1"><i class="fas fa-circle-check text-green-300"></i> حسابك مؤكد ✅</span>'
    } else {
      badge.className = 'status-badge badge-warn'
      badge.innerHTML = '<i class="fas fa-clock ml-1"></i> <span>' + (u.verifyStatus === 'mismatch' ? 'رقم مختلف' : 'غير مؤكد') + '</span>'
      cta.classList.remove('hidden')
      banner.classList.remove('hidden')
      wv.innerHTML = '<span class="inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 rounded-full px-3 py-1"><i class="fas fa-clock"></i> حسابك لسه متأكدش</span>'
    }

    // حدّث الجلسة المخزنة
    session.name = u.name; session.grade = u.grade; session.verified = u.verified
    localStorage.setItem('session', JSON.stringify(session))
  }

  // ===== جلب بيانات المستخدم من السيرفر =====
  function loadMe() {
    var deviceId = localStorage.getItem('device_id') || ''
    fetch('/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: session.phone, deviceId: deviceId })
    })
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (d.ok) { fillUserData(d.user); return }
        if (d.reason === 'device_conflict') return forceLogout('تم تسجيل الدخول لحسابك من جهاز آخر. النظام بيسمح بجهاز واحد بس لكل حساب.')
        if (d.reason === 'banned') return forceLogout('هذا الحساب محظور — تواصل مع الدعم: ' + (CFG.phone || ''))
        if (d.reason === 'not_found') return forceLogout('الحساب ده مش موجود — سجل حساب جديد.')
      })
      .catch(function () { /* استمر بالبيانات المخزنة محليًا */ })
  }

  // ===== رسالة واتساب للاشتراك =====
  function waSubscribeLink(title) {
    var gn = GRADE_NAMES[session.grade] || session.grade || ''
    var txt = encodeURIComponent(
      'السلام عليكم يا مسيو 👋\n' +
      'عايز أشترك في: ' + (title || '') + '\n' +
      'اسمي: ' + (session.name || '') + '\n' +
      'الصف: ' + gn + '\n' +
      'رقمي: ' + (session.phone || '')
    )
    return 'https://wa.me/2' + (CFG.phone || '') + '?text=' + txt
  }

  // ===== تتبع النشاط (دخول / فيديو / امتحان) =====
  function trackEvent(payload) {
    payload.phone = session.phone
    fetch('/api/track/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(function () {})
  }

  // ===== رسوم الطالب البيانية في الرئيسية =====
  var CHARTS = {}
  function dayLabel(d) {
    var names = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت']
    return names[new Date(d + 'T00:00:00').getDay()]
  }
  function loadMyStats() {
    if (typeof Chart === 'undefined') return
    fetch('/api/track/summary?phone=' + encodeURIComponent(session.phone))
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (!d.ok) return
        var s = d.summary
        $('stat-videos').textContent = s.totalVideos
        $('stat-exams').textContent = s.totalExams
        $('stat-avg').textContent = s.totalExams ? s.avgPct + '%' : '—'
        $('stat-logins').textContent = s.totalLogins

        if (CHARTS.videos) CHARTS.videos.destroy()
        CHARTS.videos = new Chart($('chart-videos-week'), {
          type: 'bar',
          data: {
            labels: s.days.map(dayLabel),
            datasets: [{ label: 'فيديوهات', data: s.videosPerDay, backgroundColor: '#e63946', borderRadius: 8, maxBarThickness: 32 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
        })

        if (CHARTS.exams) CHARTS.exams.destroy()
        if (s.examScores.length) {
          $('no-exams-msg').classList.add('hidden')
          CHARTS.exams = new Chart($('chart-exam-scores'), {
            type: 'line',
            data: {
              labels: s.examScores.map(function (e, i) { return 'امتحان ' + (i + 1) }),
              datasets: [{ label: 'الدرجة %', data: s.examScores.map(function (e) { return e.pct }), borderColor: '#1b2a6b', backgroundColor: 'rgba(27,42,107,.12)', fill: true, tension: .35, pointBackgroundColor: '#d4a937', pointRadius: 5 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
          })
        } else {
          $('no-exams-msg').classList.remove('hidden')
        }
      })
      .catch(function () {})
  }

  // ===== كروت الكورسات =====
  var COURSES_CACHE = []
  var MY_SUBS = {}

  function discountActive(cs) {
    var oldPrice = Number(cs.oldPrice || 0)
    var price = Number(cs.price || 0)
    if (!(oldPrice > price && oldPrice > 0)) return false
    if (cs.discountEnd) {
      var end = new Date(cs.discountEnd).getTime()
      if (!isNaN(end) && end <= Date.now()) return false
    }
    return true
  }

  function fmtCountdown(ms) {
    if (ms <= 0) return ''
    var d = Math.floor(ms / 86400000)
    var h = Math.floor((ms % 86400000) / 3600000)
    var m = Math.floor((ms % 3600000) / 60000)
    var sec = Math.floor((ms % 60000) / 1000)
    if (d > 0) return d + ' يوم ' + h + ' س ' + m + ' د'
    if (h > 0) return h + ' س ' + m + ' د ' + sec + ' ث'
    return m + ' د ' + sec + ' ث'
  }

  var COUNTDOWN_TIMER = null
  function startCountdowns() {
    if (COUNTDOWN_TIMER) clearInterval(COUNTDOWN_TIMER)
    var els = document.querySelectorAll('[data-countdown-end]')
    if (!els.length) return
    COUNTDOWN_TIMER = setInterval(function () {
      var anyExpired = false
      document.querySelectorAll('[data-countdown-end]').forEach(function (el) {
        var end = new Date(el.getAttribute('data-countdown-end')).getTime()
        var left = end - Date.now()
        if (left <= 0) { anyExpired = true } else { el.querySelector('.cd-txt').textContent = fmtCountdown(left) }
      })
      if (anyExpired) { clearInterval(COUNTDOWN_TIMER); COUNTDOWN_TIMER = null; renderCourses() }
    }, 1000)
  }

  function courseCard(cs) {
    var hasDiscount = discountActive(cs)
    var price = hasDiscount ? Number(cs.price || 0) : Number(cs.oldPrice > 0 && !hasDiscount && cs.discountEnd ? cs.oldPrice : cs.price || 0)
    var oldPrice = Number(cs.oldPrice || 0)
    var discount = hasDiscount ? (Number(cs.discountPct || 0) || Math.round((1 - Number(cs.price || 0) / oldPrice) * 100)) : 0
    var priceHtml
    if (price === 0) {
      priceHtml = '<span class="font-black text-green-600">مجاناً 🎁</span>'
    } else if (hasDiscount) {
      priceHtml = '<span class="font-black text-[#e63946]">' + Number(cs.price || 0) + ' ج</span>' +
        ' <span class="old-price">' + oldPrice + ' ج</span>'
    } else {
      priceHtml = '<span class="font-black text-[#e63946]">' + price + ' ج</span>'
    }
    var countdownHtml = ''
    if (hasDiscount && cs.discountEnd) {
      countdownHtml = '<div class="mt-1 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1 text-[11px] font-black" data-countdown-end="' + cs.discountEnd + '">⏳ الخصم ينتهي بعد <span class="cd-txt">...</span></div>'
    }
    var sub = MY_SUBS[cs.id]
    var subBadge = ''
    if (sub && sub.status === 'active') {
      subBadge = '<span class="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-black rounded-full px-3 py-1 shadow">✅ مشترك</span>'
    } else if (sub && sub.status === 'pending') {
      subBadge = '<span class="absolute top-2 right-2 bg-amber-500 text-white text-[11px] font-black rounded-full px-3 py-1 shadow">⏳ في انتظار التفعيل</span>'
    }
    var btns
    if (price === 0 || (sub && sub.status === 'active')) {
      btns = '<button class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-xl px-3 py-2.5 transition" data-open-course="' + (cs.id || '') + '"><i class="fas fa-play ml-1"></i> ادخل الكورس</button>'
    } else if (sub && sub.status === 'pending') {
      btns = '<button class="flex-1 bg-amber-100 text-amber-700 text-sm font-black rounded-xl px-3 py-2.5 cursor-default"><i class="fas fa-hourglass-half ml-1"></i> تم إرسال طلبك ✅</button>' +
        '<button class="bg-[#1b2a6b] hover:bg-[#141c3f] text-white text-sm font-black rounded-xl px-4 py-2.5 transition" data-open-course="' + (cs.id || '') + '">ادخل <i class="fas fa-arrow-left mr-1"></i></button>'
    } else {
      btns = '<button class="flex-1 bg-[#25d366] hover:bg-[#1fb958] text-white text-sm font-black rounded-xl px-3 py-2.5 transition" data-subscribe-course="' + (cs.id || '') + '"><i class="fab fa-whatsapp ml-1"></i> اشترك في الكورس</button>' +
        '<button class="bg-[#1b2a6b] hover:bg-[#141c3f] text-white text-sm font-black rounded-xl px-4 py-2.5 transition" data-open-course="' + (cs.id || '') + '">ادخل <i class="fas fa-arrow-left mr-1"></i></button>'
    }
    return '<article class="course-card bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition">' +
      '<div class="relative">' +
        '<img src="' + (cs.img || '/static/img/course-term1.webp') + '" alt="' + (cs.title || '') + '" class="w-full h-40 object-cover" loading="lazy">' +
        (discount ? '<span class="discount-badge">خصم ' + discount + '%</span>' : '') +
        subBadge +
      '</div>' +
      '<div class="p-4">' +
        '<h3 class="font-black text-[#141c3f] mb-1">' + (cs.title || '') + '</h3>' +
        '<p class="text-xs text-gray-500 mb-2 leading-relaxed">' + (cs.desc || '') + '</p>' +
        '<div class="mb-3">' + priceHtml + countdownHtml + '</div>' +
        '<div class="flex gap-2">' + btns + '</div>' +
      '</div>' +
    '</article>'
  }

  function renderCourses() {
    var courses = COURSES_CACHE
    var empty = '<div class="text-center text-gray-400 py-10 col-span-full"><i class="fas fa-box-open text-2xl mb-2"></i><p class="font-bold">مفيش كورسات متاحة دلوقتي — تابعنا قريبًا!</p></div>'
    $('home-courses').innerHTML = courses.length ? courses.slice(0, 3).map(courseCard).join('') : empty
    $('all-courses').innerHTML = courses.length ? courses.map(courseCard).join('') : empty
    bindCourseClicks()
    startCountdowns()
  }

  function loadCourses() {
    fetch('/api/courses?grade=' + encodeURIComponent(session.grade || ''))
      .then(function (r) { return r.json() })
      .then(function (d) {
        COURSES_CACHE = (d && d.courses) || []
        renderCourses()
      })
      .catch(function () {
        var err = '<div class="text-center text-gray-400 py-10 col-span-full">تعذر تحميل الكورسات — جرب تحديث الصفحة.</div>'
        $('home-courses').innerHTML = err
        $('all-courses').innerHTML = err
      })
  }

  function bindCourseClicks() {
    document.querySelectorAll('[data-open-course]').forEach(function (el) {
      el.onclick = function (e) { e.stopPropagation(); openCourse(el.getAttribute('data-open-course')) }
    })
    document.querySelectorAll('[data-subscribe-course]').forEach(function (el) {
      el.onclick = function (e) { e.stopPropagation(); subscribeCourse(el.getAttribute('data-subscribe-course')) }
    })
  }

  // ===== الاشتراك: يفتح واتساب المستر فورًا ويسجل الطلب في الخلفية =====
  function subscribeCourse(courseId) {
    var course = COURSES_CACHE.filter(function (c) { return c.id === courseId })[0] || {}
    window.open(waSubscribeLink(course.title), '_blank')
    fetch('/api/courses/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: session.phone, courseId: courseId })
    })
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (d.ok && d.enrollment) {
          MY_SUBS[courseId] = { status: d.enrollment.status }
          renderCourses()
          loadSubs()
          if (d.enrollment.status === 'active') {
            showAlert({ icon: 'fa-circle-check', iconClass: 'bg-green-50 text-green-600', title: '🎉 تم الاشتراك!', msg: 'اشتراكك في "' + (course.title || 'الكورس') + '" اتفعّل — ادخل الكورس واستمتع!', actions: [{ label: '🚀 ادخل الكورس', primary: true, onClick: function () { openCourse(courseId) } }, { label: 'تمام' }] })
          } else {
            showAlert({ icon: 'fa-circle-check', iconClass: 'bg-green-50 text-green-600', title: '✅ تم إرسال طلب الاشتراك', msg: 'طلبك في "' + (course.title || 'الكورس') + '" اتسجّل — كمّل التواصل مع المستر على واتساب وهيتفعّل اشتراكك قريبًا.', actions: [{ label: 'تمام 👍', primary: true }] })
          }
        }
      })
      .catch(function () {})
  }

  // ===== اشتراكاتك =====
  function subCard(s) {
    var isActive = s.status === 'active'
    var badge = isActive
      ? '<span class="status-badge badge-ok"><i class="fas fa-circle-check ml-1"></i> مفعّل</span>'
      : ''
    var btn = isActive
      ? '<button class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-xl px-3 py-2.5 transition" data-open-course="' + s.courseId + '"><i class="fas fa-play ml-1"></i> ادخل الكورس</button>'
      : '<a href="' + waSubscribeLink(s.title) + '" target="_blank" class="block text-center w-full bg-[#25d366] hover:bg-[#1fb958] text-white text-sm font-black rounded-xl px-3 py-2.5 transition"><i class="fab fa-whatsapp ml-1"></i> تواصل مع المستر للتفعيل</a>'
    return '<article class="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition">' +
      '<img src="' + (s.img || '') + '" alt="' + (s.title || '') + '" class="w-full h-36 object-cover" loading="lazy">' +
      '<div class="p-4">' +
        '<div class="flex items-center justify-between mb-2"><h3 class="font-black text-[#141c3f]">' + (s.title || '') + '</h3>' + badge + '</div>' +
        '<p class="text-xs text-gray-500 mb-3 leading-relaxed">' + (s.desc || '') + '</p>' +
        btn +
      '</div>' +
    '</article>'
  }

  function loadSubs() {
    fetch('/api/courses/my?phone=' + encodeURIComponent(session.phone))
      .then(function (r) { return r.json() })
      .then(function (d) {
        var subs = (d && d.subs) || []
        MY_SUBS = {}
        subs.forEach(function (s) { MY_SUBS[s.courseId] = { status: s.status } })
        var empty = '<div class="text-center text-gray-400 py-12 col-span-full">' +
          '<i class="fas fa-bookmark text-3xl mb-3"></i>' +
          '<p class="font-bold mb-1">لسه مشتركتش في أي كورس</p>' +
          '<p class="text-sm mb-4">اختار كورس من قسم كورساتك واشترك فيه</p>' +
          '<button class="bg-[#1b2a6b] hover:bg-[#141c3f] text-white font-bold rounded-xl px-5 py-2.5 text-sm transition" data-goto2="courses">تصفح الكورسات</button>' +
        '</div>'
        $('my-subs').innerHTML = subs.length ? subs.map(subCard).join('') : empty
        var g = document.querySelector('[data-goto2]')
        if (g) g.onclick = function () { switchView('courses') }
        bindCourseClicks()
        renderCourses()
      })
      .catch(function () {
        $('my-subs').innerHTML = '<div class="text-center text-gray-400 py-10 col-span-full">تعذر تحميل اشتراكاتك — جرب تحديث الصفحة.</div>'
      })
  }

  // ===== داخل الكورس (شرائط المحاضرات) =====
  var CURRENT_COURSE = null
  var LAST_VIEW = 'courses'

  function openCourse(courseId) {
    document.querySelectorAll('.home-view').forEach(function (v) {
      if (!v.classList.contains('hidden') && v.id !== 'view-course' && v.id !== 'view-exam') LAST_VIEW = v.id.replace('view-', '')
    })
    fetch('/api/courses/content/' + encodeURIComponent(courseId) + '?phone=' + encodeURIComponent(session.phone))
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (!d.ok) return showAlert({ icon: 'fa-triangle-exclamation', iconClass: 'bg-red-50 text-[#e63946]', title: 'حصل خطأ', msg: d.error || 'جرب تاني' })
        CURRENT_COURSE = d
        renderCourseView(d)
        document.querySelectorAll('.home-view').forEach(function (v) { v.classList.add('hidden') })
        $('view-course').classList.remove('hidden')
        document.querySelectorAll('.home-tab, .home-tab-m').forEach(function (t) { t.classList.remove('active') })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(function () { showAlert({ icon: 'fa-wifi', iconClass: 'bg-red-50 text-[#e63946]', title: 'مشكلة اتصال', msg: 'اتأكد من النت وجرب تاني' }) })
  }

  $('course-back').addEventListener('click', function () {
    stopVideo()
    switchView(LAST_VIEW === 'course' || LAST_VIEW === 'exam' ? 'courses' : LAST_VIEW)
  })

  function renderCourseView(d) {
    var course = d.course || {}
    var locked = d.access !== 'full'
    var lectures = (d.content && d.content.lectures) || []

    $('course-title').textContent = course.title || ''
    $('course-desc').textContent = course.desc || ''

    // 📋 صندوق وصف الكورس (التواريخ والتفاصيل)
    var ldBox = document.getElementById('course-longdesc-box')
    if (course.longDesc) {
      if (!ldBox) {
        ldBox = document.createElement('div')
        ldBox.id = 'course-longdesc-box'
        ldBox.className = 'mb-6 rounded-2xl bg-white border border-gray-200 shadow p-5'
        var hero = document.getElementById('course-hero')
        hero.parentNode.insertBefore(ldBox, hero.nextSibling)
      }
      ldBox.innerHTML = '<h3 class="font-black text-[#141c3f] mb-2 flex items-center gap-2"><span class="text-xl">📋</span> عن الكورس</h3>' +
        '<p class="text-sm text-gray-600 leading-loose whitespace-pre-line">' + String(course.longDesc).replace(/</g, '&lt;') + '</p>'
      ldBox.classList.remove('hidden')
    } else if (ldBox) {
      ldBox.classList.add('hidden')
    }

    var nv = 0, nf = 0, ne = 0
    lectures.forEach(function (l) {
      nv += (l.videos || []).length
      nf += (l.files || []).length
      if (l.exam) ne++
    })
    var badges = ''
    badges += '<span class="inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-bold"><i class="fas fa-layer-group"></i> ' + lectures.length + ' محاضرة</span>'
    badges += '<span class="inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-bold"><i class="fas fa-circle-play"></i> ' + nv + ' فيديو</span>'
    badges += '<span class="inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-bold"><i class="fas fa-file-pdf"></i> ' + nf + ' ملف</span>'
    badges += '<span class="inline-flex items-center gap-1 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-bold"><i class="fas fa-clipboard-question"></i> ' + ne + ' امتحان</span>'
    if (!locked) badges += '<span class="inline-flex items-center gap-1 bg-green-400/20 text-green-200 rounded-full px-3 py-1 text-xs font-bold"><i class="fas fa-unlock"></i> متاح لك</span>'
    $('course-badges').innerHTML = badges

    var banner = $('course-locked-banner')
    if (locked) {
      banner.classList.remove('hidden')
      $('course-locked-title').textContent = 'الكورس ده محتاج اشتراك 🔒'
      $('course-locked-msg').textContent = 'اشترك عبر واتساب المستر وهيتفعّل حسابك فورًا بعد التأكيد — وهتقدر تشوف كل المحاضرات.'
      $('course-subscribe-btn').href = waSubscribeLink(course.title)
      $('course-subscribe-btn').onclick = function () {
        fetch('/api/courses/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: session.phone, courseId: course.id }) }).then(function () { loadSubs() }).catch(function () {})
      }
    } else {
      banner.classList.add('hidden')
    }

    stopVideo()
    renderLectures(lectures, locked)
  }

  function lockedAlert() {
    showAlert({
      icon: 'fa-lock', iconClass: 'bg-amber-50 text-amber-500',
      title: 'المحتوى ده مقفول 🔒',
      msg: 'اشترك في الكورس عبر واتساب المستر وهيتفعّل بعد التأكيد.',
      actions: [
        { label: 'اشترك عبر واتساب', primary: true, onClick: function () { window.open(waSubscribeLink((CURRENT_COURSE && CURRENT_COURSE.course && CURRENT_COURSE.course.title) || ''), '_blank') } },
        { label: 'بعدين' }
      ]
    })
  }

  // ===== شرائط المحاضرات (أكورديون) =====
  function renderLectures(lectures, locked) {
    var box = $('course-lectures')
    if (!lectures.length) {
      box.innerHTML = '<div class="text-center text-gray-400 py-10"><i class="fas fa-layer-group text-2xl mb-2"></i><p class="font-bold">لسه مفيش محاضرات — قريبًا جدًا 🎬</p></div>'
      return
    }
    box.innerHTML = lectures.map(function (lec, li) {
      var nv = (lec.videos || []).length, nf = (lec.files || []).length
      var meta = []
      if (nv) meta.push(nv + ' فيديو')
      if (nf) meta.push(nf + ' ملف')
      if (lec.exam) meta.push('امتحان')
      return '<div class="lecture-strip' + (locked ? ' locked' : '') + '" data-lec="' + li + '">' +
        '<button class="lecture-head" data-lec-toggle="' + li + '">' +
          '<span class="lecture-num">' + (li + 1) + '</span>' +
          '<span class="flex-1 text-right">' +
            '<span class="block font-black text-sm md:text-base text-[#141c3f]">' + (lec.title || 'محاضرة') + '</span>' +
            '<span class="block text-xs text-gray-400 mt-0.5">' + (meta.join(' • ') || 'قريبًا') + '</span>' +
          '</span>' +
          (locked ? '<i class="fas fa-lock text-amber-500"></i>' : '') +
          '<i class="fas fa-chevron-down lecture-arrow text-gray-400"></i>' +
        '</button>' +
        '<div class="lecture-body hidden" data-lec-body="' + li + '"></div>' +
      '</div>'
    }).join('')

    box.querySelectorAll('[data-lec-toggle]').forEach(function (head) {
      head.addEventListener('click', function () {
        var li = head.getAttribute('data-lec-toggle')
        var body = box.querySelector('[data-lec-body="' + li + '"]')
        var strip = head.closest('.lecture-strip')
        var isOpen = !body.classList.contains('hidden')
        box.querySelectorAll('[data-lec-body]').forEach(function (b) { b.classList.add('hidden') })
        box.querySelectorAll('.lecture-strip').forEach(function (s) { s.classList.remove('open') })
        if (isOpen) { stopVideo(); return }
        if (!body.dataset.filled) {
          body.innerHTML = lectureBodyHtml(lectures[Number(li)], Number(li), locked)
          body.dataset.filled = '1'
          bindLectureItems(body, lectures[Number(li)], locked)
        }
        body.classList.remove('hidden')
        strip.classList.add('open')
      })
    })
  }

  function lectureBodyHtml(lec, li, locked) {
    var html = ''
    var videos = lec.videos || []
    var files = lec.files || []
    if (videos.length) {
      html += '<p class="lecture-sec"><i class="fas fa-circle-play ml-1 text-[#e63946]"></i> الفيديوهات</p>'
      html += videos.map(function (v, vi) {
        return '<div class="lesson-row' + (locked ? ' locked' : '') + '" data-v="' + vi + '">' +
          '<span class="lesson-icon" style="background:' + (locked ? '#94a3b8' : '#e63946') + '"><i class="fas ' + (locked ? 'fa-lock' : 'fa-play') + '"></i></span>' +
          '<div class="flex-1"><p class="font-black text-sm text-[#141c3f]">' + (v.title || '') + '</p>' +
          (v.duration ? '<p class="text-xs text-gray-400 mt-0.5"><i class="fas fa-clock ml-1"></i>' + v.duration + '</p>' : '') + '</div>' +
          '<i class="fas fa-chevron-left text-gray-300"></i></div>'
      }).join('')
    }
    if (files.length) {
      html += '<p class="lecture-sec"><i class="fas fa-file-pdf ml-1 text-[#d4a937]"></i> الملفات والمذكرات</p>'
      html += files.map(function (f, fi) {
        return '<div class="lesson-row' + (locked ? ' locked' : '') + '" data-f="' + fi + '">' +
          '<span class="lesson-icon" style="background:' + (locked ? '#94a3b8' : '#d4a937') + '"><i class="fas ' + (locked ? 'fa-lock' : 'fa-file-pdf') + '"></i></span>' +
          '<div class="flex-1"><p class="font-black text-sm text-[#141c3f]">' + (f.title || '') + '</p>' +
          '<p class="text-xs text-gray-400 mt-0.5">' + (f.size || 'PDF') + '</p></div>' +
          '<i class="fas fa-download text-gray-300"></i></div>'
      }).join('')
    }
    if (lec.exam) {
      var count = lec.exam.questions ? lec.exam.questions.length : (lec.exam.count || 0)
      html += '<p class="lecture-sec"><i class="fas fa-clipboard-question ml-1 text-[#1b2a6b]"></i> الامتحان</p>'
      html += '<div class="lesson-row' + (locked ? ' locked' : '') + '" data-e="1">' +
        '<span class="lesson-icon" style="background:' + (locked ? '#94a3b8' : '#1b2a6b') + '"><i class="fas ' + (locked ? 'fa-lock' : 'fa-clipboard-question') + '"></i></span>' +
        '<div class="flex-1"><p class="font-black text-sm text-[#141c3f]">' + (lec.exam.title || 'امتحان المحاضرة') + '</p>' +
        '<p class="text-xs text-gray-400 mt-0.5">' + count + ' سؤال</p></div>' +
        '<span class="bg-[#1b2a6b] text-white text-xs font-bold rounded-lg px-3 py-1.5">ابدأ <i class="fas fa-arrow-left mr-1"></i></span></div>'
    }
    if (!html) html = '<p class="text-center text-gray-400 text-sm py-4">محتوى المحاضرة دي هيتضاف قريبًا 🎬</p>'
    return html
  }

  function bindLectureItems(body, lec, locked) {
    body.querySelectorAll('[data-v]').forEach(function (row) {
      row.addEventListener('click', function () {
        if (locked) return lockedAlert()
        var v = (lec.videos || [])[Number(row.getAttribute('data-v'))]
        if (!v || !v.youtubeId) {
          return showAlert({ icon: 'fa-clapperboard', iconClass: 'bg-blue-50 text-[#1b2a6b]', title: 'قريبًا 🎬', msg: 'الفيديو ده هيترفع قريبًا جدًا — استعد!' })
        }
        playLectureVideo(lec, Number(row.getAttribute('data-v')), row)
      })
    })
    body.querySelectorAll('[data-f]').forEach(function (row) {
      row.addEventListener('click', function () {
        if (locked) return lockedAlert()
        var f = (lec.files || [])[Number(row.getAttribute('data-f'))]
        if (!f || !f.url) {
          return showAlert({ icon: 'fa-file-arrow-up', iconClass: 'bg-blue-50 text-[#1b2a6b]', title: 'قريبًا 📄', msg: 'الملف ده هيترفع قريبًا جدًا!' })
        }
        window.open(f.url, '_blank')
      })
    })
    var examRow = body.querySelector('[data-e]')
    if (examRow) {
      examRow.addEventListener('click', function () {
        if (locked) return lockedAlert()
        if (!lec.exam || !lec.exam.questions || !lec.exam.questions.length) {
          return showAlert({ icon: 'fa-clipboard', iconClass: 'bg-blue-50 text-[#1b2a6b]', title: 'قريبًا 📝', msg: 'أسئلة الامتحان ده هتتضاف قريبًا!' })
        }
        openExamPage(lec.exam, lec.title)
      })
    }
  }

  // ===== مشغل الفيديو + قائمة التشغيل =====
  function playLectureVideo(lec, vi, row) {
    var v = (lec.videos || [])[vi]
    if (!v || !v.youtubeId) return
    document.querySelectorAll('.lesson-row.playing').forEach(function (r) { r.classList.remove('playing') })
    if (row) row.classList.add('playing')
    // مشغل محمي: youtube-nocookie + إخفاء الشعار والعناوين قدر الإمكان — ميظهرش إنه يوتيوب
    $('video-player').src = 'https://www.youtube-nocookie.com/embed/' + v.youtubeId +
      '?rel=0&modestbranding=1&iv_load_policy=3&fs=1&disablekb=0&playsinline=1&origin=' + encodeURIComponent(location.origin)
    $('video-player-title').textContent = v.title || ''
    $('video-player-wrap').classList.remove('hidden')
    startWatermark()
    renderPlaylist(lec, vi)
    $('video-player-wrap').scrollIntoView({ behavior: 'smooth', block: 'center' })
    trackEvent({
      type: 'video',
      courseId: (CURRENT_COURSE && CURRENT_COURSE.course && CURRENT_COURSE.course.id) || '',
      lecture: lec.title || '',
      title: v.title || ''
    })
  }

  function renderPlaylist(lec, activeVi) {
    var wrap = $('video-playlist')
    var box = $('video-playlist-items')
    var videos = lec.videos || []
    var playable = videos.filter(function (v) { return v.youtubeId }).length
    if (playable < 2) { wrap.classList.add('hidden'); box.innerHTML = ''; return }
    box.innerHTML = videos.map(function (v, vi) {
      var active = vi === activeVi
      var ready = !!v.youtubeId
      return '<button class="flex items-center gap-2 rounded-xl px-3 py-2 text-right transition ' +
        (active ? 'bg-[#141c3f] text-white' : ready ? 'bg-gray-50 hover:bg-gray-100 text-[#141c3f]' : 'bg-gray-50 text-gray-400 cursor-not-allowed') + '"' +
        (ready && !active ? ' data-pl="' + vi + '"' : '') + '>' +
        '<span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ' + (active ? 'bg-[#ffd166] text-[#141c3f]' : 'bg-white border border-gray-200') + '">' +
        (active ? '<i class="fas fa-play"></i>' : ready ? (vi + 1) : '<i class="fas fa-clock"></i>') + '</span>' +
        '<span class="flex-1 text-xs font-bold truncate">' + (v.title || 'فيديو ' + (vi + 1)) + '</span>' +
        (v.duration ? '<span class="text-[10px] opacity-60">' + v.duration + '</span>' : '') +
        '</button>'
    }).join('')
    wrap.classList.remove('hidden')
    box.querySelectorAll('[data-pl]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vi = Number(btn.getAttribute('data-pl'))
        var openBody = document.querySelector('[data-lec-body]:not(.hidden)')
        var lecRow = openBody ? openBody.querySelector('.lesson-row[data-v="' + vi + '"]') : null
        playLectureVideo(lec, vi, lecRow)
      })
    })
  }

  // ===== العلامة المائية المتحركة (أول اسم + آخر 3 أرقام تلفون) =====
  var wmTimer = null
  function startWatermark() {
    var tag = document.getElementById('watermark-tag')
    if (!tag) return
    var firstName = ((session && session.name) || '').split(' ')[0] || 'طالب'
    var phone = String((session && session.phone) || '')
    var last3 = phone.slice(-3)
    tag.textContent = firstName + ' • ' + last3
    stopWatermark()
    function moveOnce() {
      // مكان عشوائي داخل الشاشة
      tag.style.top = (8 + Math.random() * 78) + '%'
      tag.style.left = (5 + Math.random() * 72) + '%'
      tag.style.opacity = '1'
      // تختفي بعد 3-5 ثواني
      setTimeout(function () { tag.style.opacity = '0' }, 3000 + Math.random() * 2000)
    }
    moveOnce()
    wmTimer = setInterval(moveOnce, 7000 + Math.random() * 4000)
  }
  function stopWatermark() {
    if (wmTimer) { clearInterval(wmTimer); wmTimer = null }
    var tag = document.getElementById('watermark-tag')
    if (tag) tag.style.opacity = '0'
  }

  function stopVideo() {
    stopWatermark()
    $('video-player').src = ''
    $('video-player-wrap').classList.add('hidden')
    $('video-playlist').classList.add('hidden')
    document.querySelectorAll('.lesson-row.playing').forEach(function (r) { r.classList.remove('playing') })
  }

  // ===== صفحة الامتحان المستقلة =====
  function openExamPage(exam, lectureTitle) {
    stopVideo()
    document.querySelectorAll('.home-view').forEach(function (v) { v.classList.add('hidden') })
    $('view-exam').classList.remove('hidden')
    document.querySelectorAll('.home-tab, .home-tab-m').forEach(function (t) { t.classList.remove('active') })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    startExam(exam, lectureTitle)
  }

  function exitExamView() {
    window.__examActive = false
    document.querySelectorAll('.home-view').forEach(function (v) { v.classList.add('hidden') })
    $('view-course').classList.remove('hidden')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  $('exam-exit').addEventListener('click', function () {
    if (window.__examActive) {
      showAlert({
        icon: 'fa-triangle-exclamation', iconClass: 'bg-amber-50 text-amber-500',
        title: '⚠️ هتخرج من الامتحان؟',
        msg: 'لو خرجت من غير تسليم إجاباتك مش هتتحسب!',
        actions: [
          { label: '📤 تسليم وخروج', primary: true, onClick: function () { if (window.__examSubmit) window.__examSubmit(true) } },
          { label: '🚪 خروج بدون تسليم', onClick: function () { exitExamView() } },
          { label: '↩️ استكمال' }
        ]
      })
      return
    }
    exitExamView()
  })

  // ===== شات الذكاء الاصطناعي (2.5 flash lite) =====
  var CHAT_HISTORY = []
  function openAiChat(contextQ) {
    var modal = document.getElementById('ai-chat-modal')
    if (!modal) return
    modal.classList.remove('hidden')
    var box = document.getElementById('ai-chat-messages')
    if (box && !box.children.length) {
      box.innerHTML = '<div class="bg-purple-50 text-purple-800 rounded-2xl rounded-tr-sm px-3 py-2 font-bold max-w-[85%]">أهلًا! 👋 اسألني عن أي قاعدة أو كلمة مش فاهمها — مش هجاوبلك إجابة الامتحان، بس هفهمك الفكرة 😉</div>'
    }
    var input = document.getElementById('ai-chat-input')
    var send = document.getElementById('ai-chat-send')
    var close = document.getElementById('ai-chat-close')
    if (close) close.onclick = function () { modal.classList.add('hidden') }
    modal.onclick = function (e) { if (e.target === modal) modal.classList.add('hidden') }

    function push(role, text) {
      var d = document.createElement('div')
      d.className = role === 'user'
        ? 'bg-[#1b2a6b] text-white rounded-2xl rounded-tl-sm px-3 py-2 font-bold max-w-[85%] mr-auto'
        : 'bg-purple-50 text-purple-900 rounded-2xl rounded-tr-sm px-3 py-2 font-bold max-w-[85%] whitespace-pre-wrap'
      d.textContent = text
      box.appendChild(d)
      box.scrollTop = box.scrollHeight
      return d
    }

    function doSend() {
      var msg = (input.value || '').trim()
      if (!msg) return
      input.value = ''
      push('user', msg)
      CHAT_HISTORY.push({ role: 'user', content: msg })
      var loader = push('ai', '... بفكر')
      fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: session.phone,
          question: msg,
          history: CHAT_HISTORY.slice(0, -1),
          context: contextQ ? (contextQ.q || '') : ''
        })
      })
        .then(function (r) { return r.json() })
        .then(function (j) {
          loader.textContent = j.ok ? j.reply : (j.error || 'حصل خطأ — جرب تاني')
          if (j.ok) CHAT_HISTORY.push({ role: 'assistant', content: j.reply })
          box.scrollTop = box.scrollHeight
        })
        .catch(function () { loader.textContent = 'مشكلة اتصال — جرب تاني' })
    }
    if (send) send.onclick = doSend
    if (input) { input.onkeydown = function (e) { if (e.key === 'Enter') doSend() }; input.focus() }
  }

  function startExam(exam, lectureTitle) {
    var QS = exam.questions || []
    var total = QS.length
    var answers = {}    // qi -> index الاختيار (اختياري / صح وخطأ)
    var essayAns = {}   // qi -> نص الإجابة المقالية
    var cur = 0
    var graded = false
    var showingResult = false
    var gradeInfo = {}  // qi -> { correct, note }
    window.__examActive = true
    window.__examSubmit = function (force) { saveEssayDraft(); submitExam(force) }

    $('exam-title').textContent = exam.title || 'امتحان'
    $('exam-meta').textContent = (lectureTitle ? lectureTitle + ' — ' : '') + total + ' سؤال'
    $('exam-result').classList.add('hidden')
    $('exam-result').innerHTML = ''
    $('exam-submit').classList.add('hidden') // نظام السؤال الواحد بيستخدم أزراره الخاصة

    function qType(q) { return q.type === 'tf' ? 'tf' : q.type === 'essay' ? 'essay' : 'mcq' }
    function isAnswered(qi) {
      if (qType(QS[qi]) === 'essay') return !!(essayAns[qi] && String(essayAns[qi]).trim())
      return answers[qi] !== undefined
    }

    // ===== شريط التنقل السريع (فوق) =====
    function navStripHtml() {
      var cells = ''
      for (var i = 0; i < total; i++) {
        var cls = 'exam-nav-cell'
        if (graded) cls += gradeInfo[i] && gradeInfo[i].correct ? ' nav-correct' : ' nav-wrong'
        else if (isAnswered(i)) cls += ' nav-answered'
        if (i === cur) cls += ' nav-current'
        cells += '<button type="button" class="' + cls + '" data-nav="' + i + '">' + (i + 1) + '</button>'
      }
      return '<div class="exam-nav-strip" id="exam-nav-strip">' + cells + '</div>'
    }

    // ===== عرض السؤال الحالي =====
    function questionHtml(qi) {
      var q = QS[qi]
      var t = qType(q)
      var h = '<div class="exam-q" data-q="' + qi + '">'
      h += '<div class="exam-progress"><div style="width:' + Math.round(((qi + 1) / total) * 100) + '%"></div></div>'
      h += '<div class="flex items-center justify-between mb-3">' +
        '<span class="exam-qnum-badge">📝 سؤال ' + (qi + 1) + ' / ' + total + '</span>' +
        (t === 'tf' ? '<span class="exam-type-badge bg-purple-50 text-purple-600">✔️✖️ صح / خطأ</span>' :
         t === 'essay' ? '<span class="exam-type-badge bg-amber-50 text-amber-600">✍️ مقالي</span>' :
         '<span class="exam-type-badge bg-blue-50 text-blue-600">🔤 اختياري</span>') +
        '</div>'
      if (q.img) h += '<img src="' + q.img + '" alt="صورة السؤال" class="w-full max-h-64 object-contain rounded-xl mb-3 bg-gray-50">'
      h += '<p class="font-black text-base md:text-lg text-[#141c3f] mb-1 leading-relaxed" dir="auto">' + q.q + '</p>'
      // الترجمة العربية تحت النص الفرنسي (خط صغير — أزرق — بين قوسين)
      h += '<div id="trans-box" class="hidden text-[11px] md:text-xs font-bold text-blue-600 mb-3" dir="rtl"></div>'
      // أزرار أدوات المساعدة (لو مفعّلة للبنك)
      var tools = exam.tools || {}
      if ((tools.translation || tools.chat) && !graded) {
        h += '<div class="flex gap-2 mb-3">'
        if (tools.translation) h += '<button type="button" id="tool-translate" class="bg-blue-50 hover:bg-blue-100 text-blue-700 font-black rounded-lg px-3 py-1.5 text-[11px] transition"><i class="fas fa-language ml-1"></i> ترجمة للعربية</button>'
        if (tools.chat) h += '<button type="button" id="tool-chat" class="bg-purple-50 hover:bg-purple-100 text-purple-700 font-black rounded-lg px-3 py-1.5 text-[11px] transition"><i class="fas fa-robot ml-1"></i> اسأل الذكاء الاصطناعي</button>'
        h += '</div>'
      }
      h = h.replace('mb-1 leading-relaxed', (tools.translation || tools.chat) ? 'mb-1 leading-relaxed' : 'mb-4 leading-relaxed')

      if (t === 'essay') {
        var dis = graded ? ' disabled' : ''
        h += '<textarea id="essay-input" class="w-full rounded-xl border-2 border-gray-200 focus:border-[#1b2a6b] outline-none p-3 text-sm font-bold min-h-[90px]" placeholder="اكتب إجابتك هنا..." dir="auto"' + dis + '>' + (essayAns[qi] || '') + '</textarea>'
        if (graded) {
          var g = gradeInfo[qi] || {}
          h += '<div class="mt-3 rounded-xl px-3 py-2 text-xs font-bold ' + (g.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600') + '">' +
            (g.correct ? '✓ إجابة صحيحة' : '✗ إجابة غير صحيحة — الإجابة النموذجية: <span dir="ltr">' + (q.modelAnswer || '') + '</span>') +
            (g.note ? '<br><span class="text-amber-600">' + g.note + '</span>' : '') + '</div>'
        }
      } else {
        var opts = t === 'tf' ? (q.options && q.options.length === 2 ? q.options : ['صح', 'خطأ']) : (q.options || [])
        h += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">'
        opts.forEach(function (op, oi) {
          var cls = 'exam-opt'
          if (graded) {
            if (oi === q.answer) cls += ' correct'
            else if (answers[qi] === oi) cls += ' wrong'
          } else if (answers[qi] === oi) cls += ' selected'
          h += '<div class="' + cls + '" data-o="' + oi + '"><span class="opt-letter">' + String.fromCharCode(1571 + oi) + '</span><span dir="auto">' + op + '</span></div>'
        })
        h += '</div>'
      }

      if (graded && q.explain) {
        h += '<div class="exam-explain mt-3 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-bold text-blue-800"><i class="fas fa-lightbulb text-amber-400 ml-1"></i> ' + q.explain + '</div>'
      }
      h += '</div>'
      return h
    }

    // ===== أزرار التنقل (السابق / التالي / تسليم) =====
    function controlsHtml() {
      var answered = 0
      for (var i = 0; i < total; i++) if (isAnswered(i)) answered++
      var h = '<div class="flex flex-wrap items-center gap-2 mt-4">'
      h += '<button type="button" id="exam-prev" class="flex-1 sm:flex-none sm:px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl py-3 text-sm transition disabled:opacity-40"' + (cur === 0 ? ' disabled' : '') + '>⬅️ السابق</button>'
      if (cur < total - 1) {
        h += '<button type="button" id="exam-next" class="flex-[2] sm:flex-none sm:px-10 bg-[#1b2a6b] hover:bg-[#141c3f] text-white font-black rounded-xl py-3 text-sm transition shadow-lg shadow-blue-900/20">التالي ➡️</button>'
      }
      if (!graded) {
        h += '<button type="button" id="exam-finish" class="flex-[2] sm:flex-none sm:px-8 font-black rounded-xl py-3 text-sm transition ' + (answered === total ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 animate-pulse' : 'bg-green-100 text-green-700') + '">📤 تسليم <span class="text-[10px] opacity-80">(' + answered + '/' + total + ')</span></button>'
      }
      h += '</div>'
      return h
    }

    function saveEssayDraft() {
      var ta = document.getElementById('essay-input')
      if (ta) essayAns[cur] = ta.value
    }

    function render() {
      if (graded && showingResult) { renderResultScreen(); return }
      $('exam-questions').innerHTML = navStripHtml() + questionHtml(cur) + controlsHtml()

      $('exam-questions').querySelectorAll('[data-nav]').forEach(function (b) {
        b.addEventListener('click', function () { saveEssayDraft(); cur = Number(b.getAttribute('data-nav')); render() })
      })
      var curCell = $('exam-questions').querySelector('.nav-current')
      if (curCell && curCell.scrollIntoView) curCell.scrollIntoView({ block: 'nearest', inline: 'center' })

      // ===== أدوات المساعدة =====
      var tBtn = document.getElementById('tool-translate')
      if (tBtn) tBtn.onclick = function () {
        var box = document.getElementById('trans-box')
        if (!box) return
        if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return }
        var q = QS[cur]
        if (q._trans) { box.innerHTML = q._trans; box.classList.remove('hidden'); return }
        tBtn.disabled = true
        tBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i> جاري الترجمة...'
        fetch('/api/ai/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: q.q || '', options: q.options || [] })
        })
          .then(function (r) { return r.json() })
          .then(function (j) {
            tBtn.disabled = false
            tBtn.innerHTML = '<i class="fas fa-language ml-1"></i> ترجمة للعربية'
            if (!j.ok) { box.innerHTML = '(' + (j.error || 'الترجمة مش متاحة دلوقتي') + ')'; box.classList.remove('hidden'); return }
            var html = '(' + j.q + ')'
            if (j.options && j.options.length) html += '<br>' + j.options.map(function (o, i) { return '<span class="opacity-80">' + String.fromCharCode(1571 + i) + ') (' + o + ')</span>' }).join(' — ')
            q._trans = html
            box.innerHTML = html
            box.classList.remove('hidden')
          })
          .catch(function () { tBtn.disabled = false; tBtn.innerHTML = '<i class="fas fa-language ml-1"></i> ترجمة للعربية' })
      }

      var cBtn = document.getElementById('tool-chat')
      if (cBtn) cBtn.onclick = function () { openAiChat(QS[cur]) }

      if (!graded) {
        $('exam-questions').querySelectorAll('.exam-opt').forEach(function (opt) {
          opt.addEventListener('click', function () {
            answers[cur] = Number(opt.getAttribute('data-o'))
            render() // الانتقال للسؤال التالي بزر «التالي» فقط
          })
        })
      }

      var pv = document.getElementById('exam-prev')
      if (pv) pv.onclick = function () { if (cur > 0) { saveEssayDraft(); cur--; render() } }
      var nx = document.getElementById('exam-next')
      if (nx) nx.onclick = function () { saveEssayDraft(); cur++; render() }
      var fin = document.getElementById('exam-finish')
      if (fin) fin.onclick = function () { saveEssayDraft(); submitExam() }
    }

    // ===== التسليم والتصحيح =====
    var RESULT_SCORE = 0
    function renderResultScreen() {
      var pct = Math.round((RESULT_SCORE / total) * 100)
      var good = pct >= 50
      var emoji = pct >= 85 ? '🏆' : pct >= 70 ? '🌟' : good ? '👏' : '💪'
      var ringColor = pct >= 85 ? '#16a34a' : good ? '#2563eb' : '#e63946'
      var msg = pct >= 85 ? 'ممتاز يا بطل! 🇫🇷✨' : pct >= 70 ? 'شاطر جدًا! كمّل كده 🚀' : good ? 'كويس — راجع أخطاءك وهتبقى أحسن 📖' : 'متيأسش! راجع الدرس وحاول تاني ❤️'
      $('exam-result').classList.add('hidden')
      $('exam-questions').innerHTML =
        '<div class="rounded-3xl bg-white shadow-lg p-8 text-center max-w-md mx-auto">' +
          '<p class="text-6xl mb-4 animate-bounce">' + emoji + '</p>' +
          '<div class="mx-auto w-36 h-36 rounded-full flex items-center justify-center mb-4" style="background:conic-gradient(' + ringColor + ' ' + (pct * 3.6) + 'deg,#e5e7eb 0deg)">' +
            '<div class="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">' +
              '<span class="font-black text-3xl" style="color:' + ringColor + '">' + pct + '%</span>' +
              '<span class="text-[11px] font-bold text-gray-400">' + RESULT_SCORE + ' من ' + total + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="font-black text-lg text-[#141c3f] mb-6">' + msg + '</p>' +
          '<div class="grid gap-2">' +
            '<button id="res-review" class="bg-blue-50 hover:bg-blue-100 text-[#1b2a6b] font-black rounded-xl py-3 text-sm transition">🔍 مراجعة إجاباتي</button>' +
            '<button id="res-retry" class="bg-[#1b2a6b] hover:bg-[#141c3f] text-white font-black rounded-xl py-3 text-sm transition">🔄 حاول تاني</button>' +
            '<button id="res-back" class="bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl py-3 text-sm transition">🏠 رجوع للكورس</button>' +
          '</div>' +
        '</div>'
      var rv = document.getElementById('res-review'); if (rv) rv.onclick = function () { showingResult = false; cur = 0; render() }
      var rt = document.getElementById('res-retry'); if (rt) rt.onclick = function () { startExam(exam, lectureTitle) }
      var bk = document.getElementById('res-back'); if (bk) bk.onclick = function () { exitExamView() }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function submitExam(force) {
      var unanswered = []
      for (var i = 0; i < total; i++) if (!isAnswered(i)) unanswered.push(i + 1)
      if (unanswered.length && !force) {
        return showAlert({ icon: 'fa-circle-exclamation', iconClass: 'bg-amber-50 text-amber-500', title: 'كمّل الأسئلة', msg: 'لسه فاضل ' + unanswered.length + ' سؤال من غير إجابة (سؤال ' + unanswered.slice(0, 5).join('، ') + (unanswered.length > 5 ? '...' : '') + ')' })
      }

      var score = 0
      var wrongList = []
      var essayItems = []
      QS.forEach(function (q, qi) {
        var t = qType(q)
        if (t === 'essay') {
          essayItems.push({ qi: qi, q: q.q || '', answer: essayAns[qi] || '', modelAnswer: q.modelAnswer || '' })
        } else {
          var ok = answers[qi] === q.answer
          gradeInfo[qi] = { correct: ok }
          if (ok) score++
          else wrongList.push({ q: q.q || '', chosen: (q.options && q.options[answers[qi]]) || '', correct: (q.options && q.options[q.answer]) || '' })
        }
      })

      function finish() {
        graded = true
        showingResult = true
        window.__examActive = false
        cur = 0
        RESULT_SCORE = score
        var pct = Math.round((score / total) * 100)
        trackEvent({
          type: 'exam',
          courseId: (CURRENT_COURSE && CURRENT_COURSE.course && CURRENT_COURSE.course.id) || '',
          lecture: lectureTitle || '',
          title: exam.title || 'امتحان',
          examId: exam.id || '', bankId: exam.bankId || '',
          score: score, total: total, pct: pct,
          wrong: wrongList
        })
        render() // بيعرض شاشة النتيجة المنفصلة
      }

      if (essayItems.length) {
        showAlert({ icon: 'fa-spinner fa-spin', iconClass: 'bg-blue-50 text-blue-500', title: 'جاري التصحيح...', msg: 'بنصحح الأسئلة المقالية — ثواني' })
        fetch('/api/ai/grade-essay', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: essayItems.map(function (e) { return { q: e.q, answer: e.answer, modelAnswer: e.modelAnswer } }) })
        })
          .then(function (r) { return r.json() })
          .then(function (j) {
            closeAlert()
            essayItems.forEach(function (e, i) {
              var g = (j.ok && j.results && j.results[i]) || { correct: false, note: '' }
              gradeInfo[e.qi] = { correct: !!g.correct, note: g.note || '' }
              if (g.correct) score++
              else wrongList.push({ q: e.q, chosen: e.answer, correct: e.modelAnswer })
            })
            finish()
          })
          .catch(function () {
            closeAlert()
            essayItems.forEach(function (e) { gradeInfo[e.qi] = { correct: false, note: 'التصحيح الآلي مش متاح — راجع مع المستر' } })
            finish()
          })
      } else {
        finish()
      }
    }

    render()
  }

  // ===== الإعدادات: دخول الإشراف =====
  var sl = $('settings-logout'); if (sl) sl.addEventListener('click', doLogout)
  var apBtn = $('admin-pass-btn'), apInput = $('admin-pass-input'), apErr = $('admin-pass-err')
  function tryAdminLogin() {
    var pass = (apInput.value || '').trim()
    if (!pass) return
    apBtn.disabled = true
    apBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    })
      .then(function (r) { return r.json() })
      .then(function (d) {
        if (d.ok) {
          sessionStorage.setItem('admin_pass', pass)
          location.href = '/admin'
        } else {
          apErr.textContent = d.error || 'كلمة سر الإشراف غلط'
          apErr.classList.remove('hidden')
          apBtn.disabled = false
          apBtn.innerHTML = '<i class="fas fa-unlock ml-1"></i> فتح'
        }
      })
      .catch(function () {
        apErr.textContent = 'مشكلة اتصال — جرب تاني'
        apErr.classList.remove('hidden')
        apBtn.disabled = false
        apBtn.innerHTML = '<i class="fas fa-unlock ml-1"></i> فتح'
      })
  }
  if (apBtn) apBtn.addEventListener('click', tryAdminLogin)
  if (apInput) apInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryAdminLogin() })

  // ===== تشغيل =====
  loadMe()
  loadSubs()
  loadCourses()
  trackEvent({ type: 'login' })
  loadMyStats()

  // نبضة تواجد كل دقيقة — عشان الإشراف يشوف مين متواجد دلوقتي
  function pingOnline() {
    fetch('/api/track/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: session.phone }) }).catch(function () {})
  }
  pingOnline()
  setInterval(pingOnline, 60000)
})()
