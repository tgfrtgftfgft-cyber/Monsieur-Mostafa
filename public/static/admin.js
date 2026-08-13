// ===== لوحة الإشراف — منصة مسيو مصطفى =====
(() => {
  const PASS = sessionStorage.getItem('admin_pass');
  if (!PASS) { location.replace('/home'); return; }

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const GRADE_NAMES = {
    prep1: 'أولى إعدادي', prep2: 'تانية إعدادي', prep3: 'تالتة إعدادي',
    sec1: 'أولى ثانوي', sec2: 'تانية ثانوي', sec3: 'تالتة ثانوي', all: 'كل الصفوف'
  };

  // ===== طلبات API بكلمة سر الإشراف =====
  async function api(path, opts = {}) {
    const res = await fetch('/api/admin' + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS, ...(opts.headers || {}) }
    });
    if (res.status === 401) { sessionStorage.removeItem('admin_pass'); location.replace('/home'); throw new Error('unauthorized'); }
    return res.json();
  }
  const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });

  // طلبات بنوك الأسئلة (مسار مستقل بنفس كلمة السر)
  async function bapi(path, opts = {}) {
    const res = await fetch('/api/banks' + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS, ...(opts.headers || {}) }
    });
    if (res.status === 401) { sessionStorage.removeItem('admin_pass'); location.replace('/home'); throw new Error('unauthorized'); }
    return res.json();
  }
  const bpost = (path, body) => bapi(path, { method: 'POST', body: JSON.stringify(body) });

  // ===== توست =====
  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ===== التبويبات =====
  const loaded = {};
  document.querySelectorAll('.adm-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.adm-tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.adm-section').forEach((s) => s.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $('sec-' + tab).classList.add('active');
      if (!loaded[tab]) { loaded[tab] = true; loadTab(tab); }
    });
  });

  function loadTab(tab) {
    if (tab === 'stats') loadStats();
    else if (tab === 'students') loadStudents();
    else if (tab === 'enrolls') loadEnrolls();
    else if (tab === 'courses') loadCourses();
    else if (tab === 'content') loadContentTab();
    else if (tab === 'banks') loadBanksTab();
    else if (tab === 'grades') loadGradesTab();
    else if (tab === 'online') loadOnlineTab();
  }

  $('adm-exit').addEventListener('click', () => {
    sessionStorage.removeItem('admin_pass');
    location.href = '/home';
  });

  // ===== إحصائيات + رسوم يومية =====
  const CHARTS = {};
  function dayShort(d) { return d.slice(5).replace('-', '/'); }
  function mkBarChart(canvasId, key, labels, data, color) {
    const el = $(canvasId);
    if (!el || typeof Chart === 'undefined') return;
    if (CHARTS[key]) CHARTS[key].destroy();
    CHARTS[key] = new Chart(el, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color, borderRadius: 6, maxBarThickness: 26 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }

  async function loadStats() {
    try {
      const d = await api('/stats');
      if (!d.ok) throw 0;
      const s = d.stats;
      $('stats-grid').innerHTML = `
        <div class="stat-card"><div class="stat-icon" style="background:#1b2a6b"><i class="fas fa-user-graduate"></i></div><div><div class="stat-num">${s.students}</div><div class="stat-lbl">إجمالي الطلاب</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#2a9d54"><i class="fas fa-check-circle"></i></div><div><div class="stat-num">${s.verified}</div><div class="stat-lbl">طلاب موثّقين</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#d4a937"><i class="fas fa-id-card"></i></div><div><div class="stat-num">${s.enrollments}</div><div class="stat-lbl">إجمالي الاشتراكات</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#e63946"><i class="fas fa-hourglass-half"></i></div><div><div class="stat-num">${s.pending}</div><div class="stat-lbl">اشتراكات في الانتظار</div></div></div>`;
      if (d.daily) {
        const labels = d.daily.days.map(dayShort);
        mkBarChart('ch-logins', 'logins', labels, d.daily.loginsPerDay, '#1b2a6b');
        mkBarChart('ch-subs', 'subs', labels, d.daily.subsPerDay, '#d4a937');
        mkBarChart('ch-videos', 'videos', labels, d.daily.videosPerDay, '#e63946');
        mkBarChart('ch-regs', 'regs', labels, d.daily.regsPerDay, '#2a9d54');
      }
    } catch (_) {
      $('stats-grid').innerHTML = '<div class="empty-msg">تعذّر تحميل الإحصائيات</div>';
    }
  }

  // ===== ملف الطالب (مودال + رسوم) =====
  async function openStudentProfile(phone) {
    $('sp-overlay').classList.add('show');
    $('sp-name').textContent = 'جاري التحميل...';
    $('sp-sub').textContent = phone;
    $('sp-body').innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    try {
      const d = await api('/student-profile/' + encodeURIComponent(phone));
      if (!d.ok) { $('sp-body').innerHTML = `<div class="empty-msg">${esc(d.error || 'حصل خطأ')}</div>`; return; }
      const p = d.profile, u = p.user, a = p.activity;
      $('sp-name').textContent = u.name || phone;
      $('sp-sub').textContent = `${phone} — ${GRADE_NAMES[u.grade] || u.grade || ''}`;

      const enrollsHtml = p.enrollments.length
        ? p.enrollments.map((e) => `<span>${esc(e.courseTitle || e.courseId)} ${e.status === 'active' ? '<span class="badge bg-ok">مفعّل</span>' : '<span class="badge bg-mid">انتظار</span>'}</span>`).join('')
        : '<span style="color:#9aa1b8">مفيش اشتراكات</span>';

      const vidsHtml = a.recentVideos.length
        ? a.recentVideos.map((v) => `<tr><td>${esc(v.title || 'فيديو')}</td><td style="font-size:.72rem;color:#7a8199">${esc(v.lecture || '')}</td><td style="font-size:.72rem;color:#7a8199;direction:ltr;text-align:left">${esc((v.at || '').slice(0, 16).replace('T', ' '))}</td></tr>`).join('')
        : '<tr><td colspan="3" style="text-align:center;color:#9aa1b8">لسه مفتحش فيديوهات</td></tr>';

      $('sp-body').innerHTML = `
        <div class="sp-grid4">
          <div class="sp-stat"><div class="n" style="color:#e63946">${a.totalVideos}</div><div class="l">🎬 فيديو اتفتح</div></div>
          <div class="sp-stat"><div class="n" style="color:#1b2a6b">${a.totalExams}</div><div class="l">📝 امتحان</div></div>
          <div class="sp-stat"><div class="n" style="color:#2a9d54">${a.totalExams ? a.avgPct + '%' : '—'}</div><div class="l">🎯 متوسط الدرجات</div></div>
          <div class="sp-stat"><div class="n" style="color:#d4a937">${a.totalLogins}</div><div class="l">📅 يوم دخول</div></div>
        </div>
        <div class="sp-row">
          <span>${u.banned ? '🚫 محظور' : u.verifyStatus === 'verified' ? '✅ موثّق' : '⏳ غير موثّق'}</span>
          <span>👨‍👩‍👦 ولي الأمر: ${esc(u.parentPhone || '—')}</span>
          <span>📍 ${esc(u.governorate || '—')}${u.city ? ' — ' + esc(u.city) : ''}</span>
          <span>🗓️ سجّل: ${esc((u.createdAt || '').slice(0, 10) || '—')}</span>
          <span>🕑 آخر دخول: ${esc((u.lastLoginAt || '').slice(0, 16).replace('T', ' ') || '—')}</span>
        </div>
        <div class="sp-row"><strong style="align-self:center">الاشتراكات:</strong>${enrollsHtml}</div>
        <div class="chart-grid">
          <div class="chart-card"><h4><i class="fas fa-circle-play"></i>فيديوهات اتفتحت كل يوم (14 يوم)</h4><div class="chart-box"><canvas id="sp-ch-videos"></canvas></div></div>
          <div class="chart-card"><h4><i class="fas fa-chart-line"></i>مستواه في الامتحانات %</h4><div class="chart-box"><canvas id="sp-ch-exams"></canvas></div>${a.examScores.length ? '' : '<p style="text-align:center;color:#9aa1b8;font-size:.8rem;margin-top:-120px">لسه ممتحنش</p>'}</div>
        </div>
        <div class="adm-card" style="margin-top:16px">
          <h3><i class="fas fa-circle-play"></i>آخر الفيديوهات اللي فتحها</h3>
          <table style="min-width:0"><thead><tr><th>الفيديو</th><th>المحاضرة</th><th>الوقت</th></tr></thead><tbody>${vidsHtml}</tbody></table>
        </div>
        <div class="adm-card" style="margin-top:16px">
          <h3><i class="fas fa-ranking-star"></i>درجات كل الامتحانات
            <button class="b b-navy" id="sp-exams-sort" style="font-size:.72rem;margin-right:8px"><i class="fas fa-sort"></i> ترتيب: الأحدث</button>
          </h3>
          <div id="sp-exams-table"><div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div></div>
        </div>
        <div class="adm-card" style="margin-top:16px">
          <h3>🧠 تحليل الطالب بالذكاء الاصطناعي</h3>
          <p style="font-size:.75rem;color:#7a8199;font-weight:700;margin-bottom:10px">🎓 اختار السنة ← ✨ ابدأ التحليل ← 📖 دروس + ⚠️ نقاط ضعف + 📊 رسوم</p>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <select class="inp" id="sp-ai-grade" style="max-width:200px">
              <option value="prep1">أولى إعدادي</option><option value="prep2">تانية إعدادي</option><option value="prep3">تالتة إعدادي</option>
              <option value="sec1">أولى ثانوي</option><option value="sec2">تانية ثانوي</option><option value="sec3">تالتة ثانوي</option>
            </select>
            <button class="b b-purple" id="sp-ai-start" style="padding:9px 20px;font-size:.82rem">✨ ابدأ التحليل</button>
            <span id="sp-ai-status" style="font-size:.78rem;font-weight:800;color:#7b3fb5"></span>
          </div>
          <div id="sp-ai-result" style="display:none;margin-top:14px">
            <div class="chart-grid">
              <div class="adm-card" style="background:#f0f9f2;border:1px solid #bfe5c8">
                <h3 style="font-size:.95rem"><i class="fas fa-book-open" style="color:#2a9d54"></i>الدروس اللي لازم يذاكرها</h3>
                <div id="sp-ai-lessons"></div>
              </div>
              <div class="adm-card" style="background:#fdf1f1;border:1px solid #f0c5c5">
                <h3 style="font-size:.95rem"><i class="fas fa-triangle-exclamation" style="color:#d64545"></i>نقاط الضعف وحلولها</h3>
                <div id="sp-ai-weak"></div>
              </div>
            </div>
            <div class="adm-card" style="margin-top:12px;background:#f4f0fd;border:1px solid #d9c7f5">
              <h3 style="font-size:.95rem"><i class="fas fa-chart-column" style="color:#7b3fb5"></i>رسوم بيانية وإحصائيات</h3>
              <p id="sp-ai-summary" style="font-size:.85rem;font-weight:800;color:#5a2d91;margin-bottom:10px"></p>
              <div class="chart-box" style="max-height:260px"><canvas id="sp-ai-chart"></canvas></div>
            </div>
          </div>
        </div>
        <div class="adm-card" style="margin-top:16px">
          <h3>❌ الأسئلة اللي غلط فيها</h3>
          <div id="sp-wrong-box"><div class="empty-msg">⏳ جاري التحميل...</div></div>
        </div>
`;

      const labels = a.days.map(dayShort);
      if (CHARTS.spVideos) CHARTS.spVideos.destroy();
      CHARTS.spVideos = new Chart($('sp-ch-videos'), {
        type: 'bar',
        data: { labels, datasets: [{ data: a.videosPerDay, backgroundColor: '#e63946', borderRadius: 6, maxBarThickness: 22 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
      });
      if (CHARTS.spExams) CHARTS.spExams.destroy();
      CHARTS.spExams = new Chart($('sp-ch-exams'), {
        type: 'line',
        data: {
          labels: a.examScores.map((e, i) => 'امتحان ' + (i + 1)),
          datasets: [{ data: a.examScores.map((e) => e.pct), borderColor: '#1b2a6b', backgroundColor: 'rgba(27,42,107,.12)', fill: true, tension: .35, pointBackgroundColor: '#d4a937', pointRadius: 5 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
      });

      // ===== درجات كل الامتحانات + ترتيب + الأسئلة الغلط =====
      let SP_EXAMS = [];
      let SP_SORT = 'recent'; // recent | best | worst
      function renderSpExams() {
        const box = $('sp-exams-table');
        if (!SP_EXAMS.length) { box.innerHTML = '<div class="empty-msg">لسه ممتحنش</div>'; return; }
        const list = [...SP_EXAMS];
        if (SP_SORT === 'best') list.sort((a, b) => b.pct - a.pct);
        else if (SP_SORT === 'worst') list.sort((a, b) => a.pct - b.pct);
        else list.sort((a, b) => String(b.at).localeCompare(String(a.at)));
        box.innerHTML = `<table style="min-width:0"><thead><tr><th>الامتحان</th><th>الدرجة</th><th>النسبة</th><th>الأخطاء</th><th>الوقت</th></tr></thead><tbody>${list.map((e) => {
          const cls = e.pct >= 85 ? 'bg-ok' : e.pct >= 50 ? 'bg-mid' : 'bg-warn';
          return `<tr><td><strong>${esc(e.title)}</strong><br><span style="color:#7a8199;font-size:.7rem">${esc(e.lecture || '')}</span></td>
            <td style="white-space:nowrap"><strong>${e.score} / ${e.total}</strong></td>
            <td><span class="badge ${cls}">${e.pct}%</span></td>
            <td>${(e.wrong || []).length ? `<span class="badge bg-warn">${e.wrong.length} ✗</span>` : '—'}</td>
            <td style="font-size:.7rem;color:#7a8199;direction:ltr;text-align:left">${esc((e.at || '').slice(0, 16).replace('T', ' '))}</td></tr>`;
        }).join('')}</tbody></table>`;
      }
      $('sp-exams-sort').addEventListener('click', () => {
        SP_SORT = SP_SORT === 'recent' ? 'best' : SP_SORT === 'best' ? 'worst' : 'recent';
        $('sp-exams-sort').innerHTML = '<i class="fas fa-sort"></i> ترتيب: ' + (SP_SORT === 'recent' ? 'الأحدث' : SP_SORT === 'best' ? 'الأعلى درجة' : 'الأقل درجة');
        renderSpExams();
      });
      try {
        const ex = await api('/student-exams/' + encodeURIComponent(phone));
        SP_EXAMS = ex.exams || [];
        renderSpExams();
        const wrongAll = [];
        SP_EXAMS.forEach((e) => (e.wrong || []).forEach((w) => wrongAll.push({ exam: e.title, ...w })));
        $('sp-wrong-box').innerHTML = wrongAll.length
          ? wrongAll.slice(0, 40).map((w) => `
            <div class="sub-item" style="background:#fdf3f3;border-radius:10px;padding:8px;align-items:center">
              <span class="badge bg-warn" style="white-space:nowrap">${esc(w.exam)}</span>
              <span style="flex:1;direction:ltr;text-align:left;font-size:.8rem;font-weight:700">${esc(w.q)}</span>
              <span style="font-size:.72rem;color:#d64545;direction:ltr">✗ ${esc(w.chosen || '—')}</span>
              <span style="font-size:.72rem;color:#2a9d54;direction:ltr">✓ ${esc(w.correct || '—')}</span>
            </div>`).join('')
          : '<div class="empty-msg">مفيش أخطاء متسجلة — إما بيجاوب صح أو لسه محلش امتحانات بالنظام الجديد</div>';
      } catch (_) {
        $('sp-exams-table').innerHTML = '<div class="empty-msg">تعذّر التحميل</div>';
        $('sp-wrong-box').innerHTML = '<div class="empty-msg">تعذّر التحميل</div>';
      }

      // ===== التحليل بالذكاء الاصطناعي =====
      if (u.grade && $('sp-ai-grade').querySelector(`option[value="${u.grade}"]`)) $('sp-ai-grade').value = u.grade;
      $('sp-ai-start').addEventListener('click', async () => {
        const btn = $('sp-ai-start');
        btn.disabled = true;
        $('sp-ai-status').innerHTML = '<i class="fas fa-spinner fa-spin"></i> بيحلل أخطاء الطالب مع ملفات المنهج...';
        try {
          const r = await post('/analyze-student', { phone, grade: $('sp-ai-grade').value });
          if (!r.ok) { $('sp-ai-status').textContent = r.error || 'حصل خطأ'; btn.disabled = false; return; }
          const an = r.analysis;
          $('sp-ai-result').style.display = 'block';
          $('sp-ai-status').innerHTML = `<i class="fas fa-check-circle" style="color:#2a9d54"></i> اتحلل ${an.wrongCount} خطأ`;
          $('sp-ai-lessons').innerHTML = (an.lessons || []).length
            ? an.lessons.map((l) => `<div style="background:#fff;border-radius:10px;padding:10px;margin-bottom:8px"><strong style="color:#1b6b34">📖 ${esc(l.title)}</strong><p style="font-size:.8rem;font-weight:700;color:#3a5a44;margin-top:4px">${esc(l.how)}</p></div>`).join('')
            : '<div class="empty-msg">مفيش دروس محددة</div>';
          $('sp-ai-weak').innerHTML = (an.weaknesses || []).length
            ? an.weaknesses.map((w) => `<div style="background:#fff;border-radius:10px;padding:10px;margin-bottom:8px"><strong style="color:#b03030">⚠️ ${esc(w.point)}</strong><p style="font-size:.8rem;font-weight:700;color:#5a3a3a;margin-top:4px">💡 ${esc(w.solution)}</p></div>`).join('')
            : '<div class="empty-msg">مفيش نقاط ضعف محددة</div>';
          const topics = (an.stats && an.stats.byTopic) || [];
          $('sp-ai-summary').textContent = (an.stats && an.stats.summary) || '';
          if (CHARTS.spAi) CHARTS.spAi.destroy();
          if (topics.length) {
            CHARTS.spAi = new Chart($('sp-ai-chart'), {
              type: 'bar',
              data: { labels: topics.map((t) => t.topic), datasets: [{ data: topics.map((t) => Number(t.wrongCount) || 0), backgroundColor: '#7b3fb5', borderRadius: 8, maxBarThickness: 34 }] },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
            });
          }
        } catch (_) {
          $('sp-ai-status').textContent = 'مشكلة في الاتصال — جرب تاني';
        }
        btn.disabled = false;
      });
    } catch (_) {
      $('sp-body').innerHTML = '<div class="empty-msg">تعذّر تحميل ملف الطالب</div>';
    }
  }

  $('sp-close').addEventListener('click', () => $('sp-overlay').classList.remove('show'));
  $('sp-overlay').addEventListener('click', (e) => { if (e.target === $('sp-overlay')) $('sp-overlay').classList.remove('show'); });

  // ===== الطلاب =====
  let STUDENTS = [];
  async function loadStudents() {
    try {
      const d = await api('/students');
      STUDENTS = d.students || [];
      renderStudents(STUDENTS);
    } catch (_) {
      $('students-table').innerHTML = '<div class="empty-msg">تعذّر تحميل الطلاب</div>';
    }
  }

  function renderStudents(list) {
    if (!list.length) { $('students-table').innerHTML = '<div class="empty-msg">لا يوجد طلاب</div>'; return; }
    const rows = list.map((u) => `
      <tr class="student-row" data-profile="${esc(u.phone)}">
        <td><strong style="color:#1b2a6b"><i class="fas fa-chart-pie" style="color:#d4a937;margin-left:5px;font-size:.75rem"></i>${esc(u.name)}</strong><br><span style="color:#7a8199;font-size:.75rem">${esc(u.phone)}</span></td>
        <td>${esc(GRADE_NAMES[u.grade] || u.grade)}</td>
        <td>${esc(u.governorate)}${u.city ? ' — ' + esc(u.city) : ''}</td>
        <td>${u.banned ? '<span class="badge bg-warn">محظور</span>' : (u.verifyStatus === 'verified' ? '<span class="badge bg-ok">موثّق</span>' : '<span class="badge bg-mid">غير موثّق</span>')}</td>
        <td>
          ${u.verifyStatus === 'verified' ? `<button class="b b-gray" data-act="unverify" data-p="${esc(u.phone)}">إلغاء التوثيق</button>` : `<button class="b b-green" data-act="verify" data-p="${esc(u.phone)}">توثيق</button>`}
          ${u.banned ? `<button class="b b-navy" data-act="unban" data-p="${esc(u.phone)}">فك الحظر</button>` : `<button class="b b-red" data-act="ban" data-p="${esc(u.phone)}">حظر</button>`}
          <button class="b b-gold" data-act="reset-device" data-p="${esc(u.phone)}">تصفير الجهاز</button>
          <button class="b b-red" data-act="delete" data-p="${esc(u.phone)}" data-confirm="متأكد من حذف الطالب نهائيًا؟">حذف</button>
        </td>
      </tr>`).join('');
    $('students-table').innerHTML = `<table><thead><tr><th>الطالب</th><th>الصف</th><th>المحافظة</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${rows}</tbody></table>`;
    $('students-table').querySelectorAll('button[data-act]').forEach((b) => {
      b.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        if (b.dataset.confirm && !confirm(b.dataset.confirm)) return;
        b.disabled = true;
        const r = await post('/student-update', { phone: b.dataset.p, action: b.dataset.act });
        toast(r.ok ? 'تم التنفيذ ✅' : (r.error || 'حصل خطأ'));
        loadStudents();
      });
    });
    // الضغط على صف الطالب يفتح ملفه بالرسوم
    $('students-table').querySelectorAll('tr[data-profile]').forEach((tr) => {
      tr.addEventListener('click', () => openStudentProfile(tr.dataset.profile));
    });
  }

  $('student-search').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    renderStudents(!q ? STUDENTS : STUDENTS.filter((u) => (u.name || '').includes(q) || (u.phone || '').includes(q)));
  });

  // ===== الاشتراكات =====
  async function loadEnrolls() {
    fillCourseSelect($('add-en-course'));
    try {
      const d = await api('/enrollments');
      const list = d.enrollments || [];
      if (!list.length) { $('enrolls-table').innerHTML = '<div class="empty-msg">لا توجد اشتراكات</div>'; return; }
      const rows = list.map((en) => `
        <tr>
          <td><strong>${esc(en.phone)}</strong></td>
          <td>${esc(en.courseTitle || en.courseId)}</td>
          <td>${Number(en.price || 0) === 0 ? 'مجاني' : Number(en.price) + ' ج'}</td>
          <td>${en.status === 'active' ? '<span class="badge bg-ok">مفعّل</span>' : '<span class="badge bg-mid">في الانتظار</span>'}</td>
          <td style="font-size:.72rem;color:#7a8199">${esc((en.requestedAt || '').slice(0, 10))}</td>
          <td>
            ${en.status === 'active' ? `<button class="b b-gray" data-act="deactivate" data-id="${esc(en._id)}">تعطيل</button>` : `<button class="b b-green" data-act="activate" data-id="${esc(en._id)}">تفعيل ✅</button>`}
            <button class="b b-red" data-act="delete" data-id="${esc(en._id)}" data-confirm="متأكد من حذف الاشتراك؟">حذف</button>
          </td>
        </tr>`).join('');
      $('enrolls-table').innerHTML = `<table><thead><tr><th>الطالب</th><th>الكورس</th><th>السعر</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>${rows}</tbody></table>`;
      $('enrolls-table').querySelectorAll('button[data-act]').forEach((b) => {
        b.addEventListener('click', async () => {
          if (b.dataset.confirm && !confirm(b.dataset.confirm)) return;
          b.disabled = true;
          const r = await post('/enrollment-update', { id: b.dataset.id, action: b.dataset.act });
          toast(r.ok ? 'تم التنفيذ ✅' : (r.error || 'حصل خطأ'));
          loadEnrolls();
        });
      });
    } catch (_) {
      $('enrolls-table').innerHTML = '<div class="empty-msg">تعذّر تحميل الاشتراكات</div>';
    }
  }

  $('add-en-btn').addEventListener('click', async () => {
    const phone = $('add-en-phone').value.trim();
    const courseId = $('add-en-course').value;
    if (!phone || !courseId) { toast('اكتب رقم الطالب واختر الكورس'); return; }
    const r = await post('/enrollment-add', { phone, courseId });
    toast(r.ok ? 'تم تفعيل الاشتراك ✅' : (r.error || 'حصل خطأ'));
    if (r.ok) { $('add-en-phone').value = ''; loadEnrolls(); }
  });

  // ===== الكورسات =====
  let COURSES = [];
  async function fillCourseSelect(sel) {
    if (!COURSES.length) {
      try { const d = await api('/courses'); COURSES = d.courses || []; } catch (_) {}
    }
    sel.innerHTML = COURSES.map((c) => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('') || '<option value="">لا توجد كورسات</option>';
  }

  async function loadCourses() {
    try {
      const d = await api('/courses');
      COURSES = d.courses || [];
      if (!COURSES.length) { $('courses-table').innerHTML = '<div class="empty-msg">لا توجد كورسات</div>'; return; }
      $('courses-table').innerHTML = COURSES.map((c) => {
        const price = Number(c.price || 0);
        const oldP = Number(c.oldPrice || 0);
        const isImg = c.img && String(c.img).indexOf('/') !== -1;
        const scheduled = c.publishAt && new Date(c.publishAt) > new Date();
        const stBadge = c.published === false ? '<span class="badge bg-warn">🙈 مخفي</span>' : scheduled ? '<span class="badge bg-mid">⏰ مجدول</span>' : '<span class="badge bg-ok">🟢 منشور</span>';
        return `
        <div class="ccard">
          ${isImg ? `<img class="cimg" src="${esc(c.img)}" alt="${esc(c.title)}" loading="lazy">` : `<div class="cimg cemoji">${esc(c.img || '🇫🇷')}</div>`}
          <div style="padding:12px;display:flex;flex-direction:column;gap:8px;flex:1">
            <strong style="color:#141c3f;font-size:.95rem">${esc(c.title)}</strong>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:.82rem">
              ${price === 0 ? '<b style="color:#2a9d54">مجاناً 🎁</b>' : `<b style="color:#e63946">${price} ج</b>${oldP > price ? ` <s style="color:#9aa1b8;font-size:.72rem">${oldP} ج</s>` : ''}`}
              ${stBadge}
            </div>
            <span style="font-size:.7rem;color:#7a8199;font-weight:700">🎓 ${esc(GRADE_NAMES[c.grade] || 'كل الصفوف')}</span>
            <div style="display:grid;gap:6px;margin-top:auto">
              <button class="b b-navy" data-enter="${esc(c.id)}" style="padding:9px;font-size:.82rem">🚪 دخول الكورس</button>
              <div style="display:flex;gap:6px">
                <button class="b b-gold" data-edit="${esc(c.id)}" style="flex:1">✏️ تعديل</button>
                <button class="b b-red" data-del="${esc(c.id)}" data-confirm="هيتم إخفاء الكورس عن الطلاب. متأكد؟" style="flex:1">🙈 إخفاء</button>
              </div>
            </div>
          </div>
        </div>`;
      }).join('');
      $('courses-table').querySelectorAll('button[data-enter]').forEach((b) => {
        b.addEventListener('click', () => enterCourse(b.dataset.enter));
      });
      $('courses-table').querySelectorAll('button[data-edit]').forEach((b) => {
        b.addEventListener('click', () => {
          const c = COURSES.find((x) => x.id === b.dataset.edit);
          if (!c) return;
          openCourseBuilder(c);
        });
      });
      $('courses-table').querySelectorAll('button[data-del]').forEach((b) => {
        b.addEventListener('click', async () => {
          if (!confirm(b.dataset.confirm)) return;
          const r = await post('/course-delete', { id: b.dataset.del });
          toast(r.ok ? 'تم الإخفاء 🙈' : (r.error || 'حصل خطأ'));
          loadCourses();
        });
      });
    } catch (_) {
      $('courses-table').innerHTML = '<div class="empty-msg">تعذّر تحميل الكورسات</div>';
    }
  }

  function autoCourseId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }
  $('c-save-btn').addEventListener('click', async () => {
    let id = $('c-id').value.trim();
    const title = $('c-title').value.trim();
    if (!title) { toast('✏️ اكتب اسم الكورس'); return; }
    if (!id) { id = autoCourseId(); $('c-id').value = id; }
    const basePrice = Number($('c-price').value || 0);
    const pct = Math.min(100, Math.max(0, Number($('c-discount').value || 0)));
    const finalPrice = pct > 0 ? Math.round(basePrice * (1 - pct / 100)) : basePrice;
    const r = await post('/course-save', {
      id, title, desc: $('c-desc').value.trim(),
      longDesc: $('c-longdesc').value.trim(),
      price: finalPrice, oldPrice: pct > 0 ? basePrice : 0,
      discountPct: pct,
      discountEnd: (pct > 0 && $('c-discount-end').value) ? new Date($('c-discount-end').value).toISOString() : '',
      grade: $('c-grade').value, img: $('c-img').value.trim() || '🇫🇷',
      order: Number($('c-order').value || 99), published: $('c-published').checked,
      publishAt: $('c-publish-at').value ? new Date($('c-publish-at').value).toISOString() : ''
    });
    toast(r.ok ? 'تم حفظ الكورس ✅' : (r.error || 'حصل خطأ'));
    if (r.ok) { $('course-builder').style.display = 'none'; clearCourseBuilder(); loadCourses(); }
  });

  // ===== بطاقة إنشاء / تعديل الكورس (مربعة) =====
  function clearCourseBuilder() {
    ['c-id', 'c-title', 'c-desc', 'c-longdesc', 'c-discount', 'c-discount-end'].forEach((i) => $(i).value = '');
    $('c-price').value = ''; $('c-oldprice').value = ''; $('c-order').value = 1;
    $('c-discount-end').style.display = 'none'; $('c-discount-timer-clear').style.display = 'none';
    updateFinalPricePreview();
    $('c-grade').value = 'all'; $('c-img').value = '🇫🇷'; $('c-published').checked = true;
    $('c-publish-at').value = '';
    $('cb-img-preview').style.display = 'none';
    $('cb-img-hint').style.display = '';
    $('c-img-upload-status').textContent = '';
  }
  function openCourseBuilder(c) {
    $('course-builder').style.display = '';
    if (c) {
      $('c-id').value = c.id; $('c-title').value = c.title || ''; $('c-desc').value = c.desc || '';
      const pct0 = Number(c.discountPct || 0);
      $('c-price').value = pct0 > 0 ? (c.oldPrice || c.price || 0) : (c.price || 0);
      $('c-discount').value = pct0 > 0 ? pct0 : '';
      $('c-oldprice').value = c.oldPrice || 0; $('c-order').value = c.order || 1;
      $('c-longdesc').value = c.longDesc || '';
      try { $('c-discount-end').value = c.discountEnd ? new Date(c.discountEnd).toISOString().slice(0, 16) : ''; } catch (_) { $('c-discount-end').value = ''; }
      const hasEnd = !!$('c-discount-end').value;
      $('c-discount-end').style.display = hasEnd ? '' : 'none';
      $('c-discount-timer-clear').style.display = hasEnd ? '' : 'none';
      updateFinalPricePreview();
      $('c-grade').value = c.grade || 'all'; $('c-img').value = c.img || '🇫🇷';
      $('c-published').checked = c.published !== false;
      try { $('c-publish-at').value = c.publishAt ? new Date(c.publishAt).toISOString().slice(0, 16) : ''; } catch (_) { $('c-publish-at').value = ''; }
      const isImg = c.img && String(c.img).indexOf('/') !== -1;
      if (isImg) { $('cb-img-preview').src = c.img; $('cb-img-preview').style.display = ''; $('cb-img-hint').style.display = 'none'; }
      else { $('cb-img-preview').style.display = 'none'; $('cb-img-hint').style.display = ''; }
    } else {
      clearCourseBuilder();
    }
    $('course-builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('course-new-btn').addEventListener('click', () => openCourseBuilder(null));
  $('cb-img-area').addEventListener('click', () => $('c-img-file').click());

  // 🔥 معاينة السعر بعد الخصم
  function updateFinalPricePreview() {
    const base = Number($('c-price').value || 0);
    const pct = Math.min(100, Math.max(0, Number($('c-discount').value || 0)));
    const box = $('c-final-price');
    if (base > 0 && pct > 0) {
      box.style.display = '';
      box.textContent = '🔥 السعر بعد الخصم: ' + Math.round(base * (1 - pct / 100)) + ' ج (بدل ' + base + ' ج)';
    } else {
      box.style.display = 'none';
    }
  }
  $('c-price').addEventListener('input', updateFinalPricePreview);
  $('c-discount').addEventListener('input', updateFinalPricePreview);
  $('c-discount-timer-btn').addEventListener('click', () => {
    $('c-discount-end').style.display = '';
    $('c-discount-timer-clear').style.display = '';
    if (!$('c-discount-end').value) {
      const d = new Date(Date.now() + 48 * 3600 * 1000);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      $('c-discount-end').value = d.toISOString().slice(0, 16);
    }
  });
  $('c-discount-timer-clear').addEventListener('click', () => {
    $('c-discount-end').value = '';
    $('c-discount-end').style.display = 'none';
    $('c-discount-timer-clear').style.display = 'none';
  });

  $('c-clear-btn').addEventListener('click', () => {
    clearCourseBuilder();
    $('course-builder').style.display = 'none';
  });



  // ===== رفع ملف للمنصة على أجزاء صغيرة (أقل من نص ميجا) بفواصل زمنية متغيرة =====
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function uploadFileChunked(file, onProgress) {
    const CHUNK = 350 * 1024; // 350KB خام لكل جزء (أقل من نص ميجا بعد الترميز)
    const uploadId = 'f' + Date.now() + Math.random().toString(36).slice(2, 7);
    const total = Math.ceil(file.size / CHUNK) || 1;
    for (let i = 0; i < total; i++) {
      const blob = file.slice(i * CHUNK, (i + 1) * CHUNK);
      const b64 = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result).split(',')[1] || '');
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      });
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        const r = await fetch('/api/files/upload-chunk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS },
          body: JSON.stringify({ uploadId, index: i, data: b64 })
        }).then((x) => x.json()).catch(() => ({ ok: false }));
        ok = !!r.ok;
        if (!ok) await sleep(800 + attempt * 700);
      }
      if (!ok) throw new Error('فشل رفع الجزء ' + (i + 1));
      if (onProgress) onProgress(i + 1, total);
      // فاصل زمني متغير بين الأجزاء عشان الضغط
      if (i < total - 1) await sleep(250 + Math.floor(Math.random() * 650));
    }
    const fin = await fetch('/api/files/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS },
      body: JSON.stringify({ uploadId, name: file.name, type: file.type || 'application/octet-stream', size: file.size, totalChunks: total })
    }).then((x) => x.json());
    if (!fin.ok) throw new Error(fin.error || 'فشل إنهاء الرفع');
    return fin; // { id, url }
  }

  // رفع صورة الكورس من الجهاز
  $('c-img-upload-btn').addEventListener('click', () => $('c-img-file').click());
  $('c-img-file').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('الصورة كبيرة — أقصى حجم 3 ميجا'); return; }
    const st = $('c-img-upload-status');
    try {
      st.textContent = 'جاري الرفع...';
      const r = await uploadFileChunked(file, (i, t) => st.textContent = `📤 جاري الرفع ${i}/${t}...`);
      $('c-img').value = r.url;
      $('cb-img-preview').src = r.url;
      $('cb-img-preview').style.display = '';
      $('cb-img-hint').style.display = 'none';
      st.textContent = 'تم الرفع ✅';
      toast('تم رفع صورة الكورس ✅');
    } catch (err) {
      st.textContent = err.message || 'فشل الرفع';
      toast(err.message || 'فشل الرفع');
    }
    e.target.value = '';
  });

  // ===== 🚪 داخل الكورس: مستطيلات المحاضرات =====
  let CI_COURSE = null;
  let CI = { lectures: [] };
  const OPEN_LECS = {};

  async function enterCourse(courseId) {
    CI_COURSE = COURSES.find((c) => c.id === courseId) || { id: courseId, title: courseId };
    $('courses-home').style.display = 'none';
    $('course-inside').style.display = '';
    $('ci-title').textContent = '📘 ' + (CI_COURSE.title || courseId);
    $('lectures-rects').innerHTML = '<div class="empty-msg">⏳ جاري التحميل...</div>';
    if (!BANKS.length) await loadBanksList();
    try {
      const d = await api('/content/' + courseId);
      CI = (d.content && Array.isArray(d.content.lectures)) ? d.content : { lectures: [] };
    } catch (_) { CI = { lectures: [] }; }
    renderLectureRects();
  }

  $('ci-back').addEventListener('click', () => {
    $('course-inside').style.display = 'none';
    $('courses-home').style.display = '';
  });

  $('ci-add-lec').addEventListener('click', () => {
    CI.lectures.push({ id: uid(), title: '', videos: [], files: [], exam: null });
    OPEN_LECS[CI.lectures.length - 1] = true;
    renderLectureRects();
    toast('➕ محاضرة جديدة — اكتب اسمها');
  });

  $('ci-save').addEventListener('click', async () => {
    if (!CI_COURSE) return;
    const r = await post('/content-save', { courseId: CI_COURSE.id, content: CI });
    toast(r.ok ? '💾 اتحفظ كله ✅' : (r.error || 'حصل خطأ'));
  });

  function renderLectureRects() {
    const box = $('lectures-rects');
    if (!CI.lectures.length) {
      box.innerHTML = '<div class="empty-msg">📭 مفيش محاضرات لسه — اضغط «➕ أضف محاضرة أو درس»</div>';
      return;
    }
    box.innerHTML = CI.lectures.map((lec, li) => {
      const scheduled = lec.publishAt && new Date(lec.publishAt) > new Date();
      const vCount = (lec.videos || []).length, fCount = (lec.files || []).length;
      const open = !!OPEN_LECS[li];
      return `
      <div class="lec-rect ${open ? 'open' : ''}" data-li="${li}">
        <div class="lec-rect-head" data-toggle>
          <div class="lecno" style="width:36px;height:36px;border-radius:10px;background:#141c3f;color:#ffd166;display:flex;align-items:center;justify-content:center;font-family:'Lalezar',cursive">${li + 1}</div>
          <strong style="flex:1;font-size:.95rem;color:#141c3f">${esc(lec.title) || '<span style="color:#9aa1b8">بدون اسم — اضغط للفتح ✏️</span>'}</strong>
          <span style="font-size:.72rem;font-weight:800;color:#7a8199">🎬 ${vCount} · 📄 ${fCount} · ${lec.exam ? '📝 امتحان' : '— بدون امتحان'}</span>
          ${scheduled ? '<span class="badge bg-mid">⏰ مجدولة</span>' : '<span class="badge bg-ok">🟢 منشورة</span>'}
          <i class="fas fa-chevron-${open ? 'up' : 'down'}" style="color:#9aa1b8"></i>
        </div>
        <div class="lec-body">
          <div class="item-chip" style="background:#fff">
            ✏️ <input class="inp" data-lec-title value="${esc(lec.title)}" placeholder="اسم المحاضرة أو الدرس">
            <button class="b b-red" data-lec-del>🗑️</button>
          </div>
          <div class="item-chip" style="background:#f0f6ff">
            <label style="font-weight:800;font-size:.78rem;cursor:pointer"><input type="checkbox" data-lec-pub ${scheduled ? '' : 'checked'}> 🟢 منشورة فورًا</label>
            <span style="font-weight:800;font-size:.75rem">⏰ أو موعد:</span>
            <input class="inp" data-lec-pubat type="datetime-local" value="${lec.publishAt ? new Date(lec.publishAt).toISOString().slice(0, 16) : ''}" style="max-width:190px">
          </div>

          ${(lec.videos || []).map((v, vi) => `
          <div class="item-chip" data-vi="${vi}">
            🎬 <input class="inp" data-v-title value="${esc(v.title)}" placeholder="عنوان الفيديو">
            <input class="inp" data-v-yt value="${esc(v.youtubeId)}" placeholder="رابط يوتيوب" style="direction:ltr">
            <input class="inp" data-v-dur value="${esc(v.duration || '')}" placeholder="⏱️ المدة" style="max-width:100px;direction:ltr">
            ${v.youtubeId ? `<img class="yt-thumb" src="https://img.youtube.com/vi/${esc(v.youtubeId)}/hqdefault.jpg" alt="معاينة">` : ''}
            <button class="b b-green" data-v-ok style="font-size:.7rem">💾 حفظ</button>
            <button class="b b-red" data-v-del>✖️</button>
          </div>`).join('')}

          ${(lec.files || []).map((f, fi) => `
          <div class="item-chip" data-fi="${fi}">
            📄 <input class="inp" data-f-title value="${esc(f.title)}" placeholder="اسم الملف">
            <input class="inp" data-f-url value="${esc(f.url)}" placeholder="الرابط" style="direction:ltr;font-size:.7rem">
            <span style="font-size:.7rem;color:#7a8199">${esc(f.size || '')}</span>
            <button class="b b-red" data-f-del>✖️</button>
          </div>`).join('')}

          ${lec.exam ? (lec.exam.bankId ? `
          <div class="item-chip" style="background:#f3ecfc">
            🏦 <input class="inp" data-e-title value="${esc(lec.exam.title || '')}" placeholder="عنوان الامتحان">
            <select class="inp" data-e-bank style="max-width:210px">${BANKS.map((b) => `<option value="${esc(b.id)}" ${b.id === lec.exam.bankId ? 'selected' : ''}>${esc(b.title)} (${b.count})</option>`).join('')}</select>
            🔢 <input class="inp" data-e-count type="number" min="1" max="100" value="${Number(lec.exam.count || 10)}" style="max-width:70px">
            <button class="b b-red" data-e-del>✖️</button>
          </div>
          <p style="font-size:.7rem;color:#7b3fb5;font-weight:800;margin:2px 0 8px">🔀 الأسئلة عشوائية من البنك لكل طالب</p>` : `
          <div class="item-chip" style="background:#fff6dd">
            📝 <b style="font-size:.78rem">امتحان يدوي: ${esc(lec.exam.title || '')}</b>
            <span style="font-size:.72rem;color:#7a8199">${(lec.exam.questions || []).length} سؤال — عدّله من «بنوك الأسئلة» أفضل</span>
            <button class="b b-red" data-e-del>✖️</button>
          </div>`) : ''}

          <div class="opt3">
            <button data-opt-video><span class="big">🎬</span>أضف فيديو</button>
            <button data-opt-file><span class="big">📄</span>نزّل ملف</button>
            <button data-opt-bank><span class="big">🏦</span>البنوك</button>
          </div>
          <span data-up-status style="font-size:.75rem;font-weight:800;color:#7b3fb5"></span>
        </div>
      </div>`;
    }).join('');

    // ربط الأحداث
    box.querySelectorAll('.lec-rect').forEach((rect) => {
      const li = Number(rect.dataset.li);
      const lec = CI.lectures[li];

      rect.querySelector('[data-toggle]').addEventListener('click', () => {
        OPEN_LECS[li] = !OPEN_LECS[li];
        renderLectureRects();
      });
      rect.querySelector('.lec-body').addEventListener('click', (e) => e.stopPropagation());

      rect.querySelector('[data-lec-title]').addEventListener('input', (e) => { lec.title = e.target.value; });
      rect.querySelector('[data-lec-del]').addEventListener('click', () => {
        if (!confirm('🗑️ حذف المحاضرة بكل محتواها؟')) return;
        CI.lectures.splice(li, 1); delete OPEN_LECS[li]; renderLectureRects();
      });

      const pubCb = rect.querySelector('[data-lec-pub]');
      const pubAt = rect.querySelector('[data-lec-pubat]');
      pubCb.addEventListener('change', () => {
        if (pubCb.checked) { lec.publishAt = ''; pubAt.value = ''; toast('🟢 هتظهر للطلاب فور الحفظ'); }
      });
      pubAt.addEventListener('change', () => {
        if (pubAt.value) { lec.publishAt = new Date(pubAt.value).toISOString(); pubCb.checked = false; toast('⏰ اتحدد الموعد — متنساش 💾 حفظ الكل'); }
        else lec.publishAt = '';
      });

      rect.querySelectorAll('[data-vi]').forEach((row) => {
        const vi = Number(row.dataset.vi);
        row.querySelector('[data-v-title]').addEventListener('input', (e) => { lec.videos[vi].title = e.target.value; });
        row.querySelector('[data-v-yt]').addEventListener('input', (e) => { lec.videos[vi].youtubeId = ytId(e.target.value); });
        row.querySelector('[data-v-dur]').addEventListener('input', (e) => { lec.videos[vi].duration = e.target.value; });
        row.querySelector('[data-v-ok]').addEventListener('click', () => { renderLectureRects(); toast('✅ اتسجل — شوف المعاينة، ومتنساش 💾 حفظ الكل'); });
        row.querySelector('[data-v-del]').addEventListener('click', () => { lec.videos.splice(vi, 1); renderLectureRects(); });
      });

      rect.querySelectorAll('[data-fi]').forEach((row) => {
        const fi = Number(row.dataset.fi);
        row.querySelector('[data-f-title]').addEventListener('input', (e) => { lec.files[fi].title = e.target.value; });
        row.querySelector('[data-f-url]').addEventListener('input', (e) => { lec.files[fi].url = e.target.value; });
        row.querySelector('[data-f-del]').addEventListener('click', () => { lec.files.splice(fi, 1); renderLectureRects(); });
      });

      const eDel = rect.querySelector('[data-e-del]');
      if (eDel) eDel.addEventListener('click', () => {
        if (!confirm('حذف الامتحان؟')) return;
        lec.exam = null; renderLectureRects();
      });
      const eTitle = rect.querySelector('[data-e-title]');
      if (eTitle) eTitle.addEventListener('input', (e) => { lec.exam.title = e.target.value; });
      const eBank = rect.querySelector('[data-e-bank]');
      if (eBank) eBank.addEventListener('change', (e) => { lec.exam.bankId = e.target.value; });
      const eCount = rect.querySelector('[data-e-count]');
      if (eCount) eCount.addEventListener('input', (e) => { lec.exam.count = Math.max(1, Number(e.target.value || 10)); });

      // ===== الاختيارات الثلاثة =====
      rect.querySelector('[data-opt-video]').addEventListener('click', () => {
        lec.videos = lec.videos || [];
        lec.videos.push({ id: uid(), title: '', youtubeId: '', duration: '' });
        renderLectureRects();
        toast('🎬 الصق رابط اليوتيوب وهتشوف المعاينة');
      });

      rect.querySelector('[data-opt-file]').addEventListener('click', () => {
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.addEventListener('change', async () => {
          const file = picker.files && picker.files[0];
          if (!file) return;
          if (file.size > 25 * 1024 * 1024) { toast('📄 الملف كبير — أقصى حجم 25 ميجا'); return; }
          const st = rect.querySelector('[data-up-status]');
          try {
            st.textContent = '📤 جاري الرفع...';
            const r = await uploadFileChunked(file, (i, t) => st.textContent = `📤 ${i}/${t}...`);
            lec.files = lec.files || [];
            lec.files.push({ id: uid(), title: file.name, url: r.url, size: (file.size / (1024 * 1024)).toFixed(1) + ' MB' });
            renderLectureRects();
            toast('✅ اترفع على المنصة — متنساش 💾 حفظ الكل');
          } catch (err) {
            st.textContent = '';
            toast(err.message || 'فشل الرفع');
          }
        });
        picker.click();
      });

      rect.querySelector('[data-opt-bank]').addEventListener('click', async () => {
        if (!BANKS.length) await loadBanksList();
        if (!BANKS.length) { toast('🏦 اعمل بنك أسئلة الأول من تبويب «بنوك الأسئلة»'); return; }
        if (lec.exam) { toast('📝 في امتحان بالفعل — احذفه الأول لو عايز تغيّره'); return; }
        lec.exam = { id: uid(), bankId: BANKS[0].id, count: 10, title: 'امتحان ' + (lec.title || '') };
        renderLectureRects();
        toast('🏦 اختار البنك وعدد الأسئلة');
      });
    });
  }

  // ===== 🧭 التبويبات الفرعية (قسم الذكاء الاصطناعي والتلجرام) =====
  document.querySelectorAll('#ai-subtabs .subtab').forEach((st) => {
    st.addEventListener('click', () => {
      document.querySelectorAll('#ai-subtabs .subtab').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.subpanel').forEach((x) => x.classList.remove('active'));
      st.classList.add('active');
      const panel = document.getElementById('sub-' + st.dataset.sub);
      if (panel) panel.classList.add('active');
    });
  });

  // ===== محرر محتوى المحاضرات =====
  let CONTENT = { lectures: [] };
  const uid = () => 'x' + Math.random().toString(36).slice(2, 9);

  async function loadContentTab() {
    if (!BANKS.length) await loadBanksList();
    await fillCourseSelect($('content-course'));
    if ($('content-course').value) loadContent($('content-course').value);
    loadToolsBanks();
    loadCurriculumList();
    loadTgStats();
  }

  // ===== أدوات المساعدة لكل بنك (ترجمة / شات AI) =====
  async function loadToolsBanks() {
    const box = $('tools-banks-list');
    try {
      const d = await bapi('');
      BANKS = d.banks || [];
      if (!BANKS.length) { box.innerHTML = '<div class="empty-msg">مفيش بنوك لسه — اعمل بنك من تبويب بنوك الأسئلة</div>'; return; }
      box.innerHTML = `<table><thead><tr><th>البنك</th><th>المجموعة</th><th>🌐 ترجمة للعربية</th><th>🤖 شات AI (2.5 flash lite)</th></tr></thead><tbody>${BANKS.map((b) => {
        const t = b.tools || {};
        return `<tr>
          <td><strong>${esc(b.title)}</strong><br><span style="color:#7a8199;font-size:.7rem">${b.count} سؤال</span></td>
          <td>${esc(b.group || 'عام')}</td>
          <td><label style="cursor:pointer;font-weight:800;font-size:.8rem"><input type="checkbox" data-tool-tr="${esc(b.id)}" ${t.translation ? 'checked' : ''}> مفعّلة</label></td>
          <td><label style="cursor:pointer;font-weight:800;font-size:.8rem"><input type="checkbox" data-tool-ch="${esc(b.id)}" ${t.chat ? 'checked' : ''}> مفعّل</label></td>
        </tr>`;
      }).join('')}</tbody></table>`;
      box.querySelectorAll('input[data-tool-tr],input[data-tool-ch]').forEach((cb) => {
        cb.addEventListener('change', async () => {
          const id = cb.dataset.toolTr || cb.dataset.toolCh;
          const tr = box.querySelector(`input[data-tool-tr="${id}"]`).checked;
          const ch = box.querySelector(`input[data-tool-ch="${id}"]`).checked;
          const r = await bpost('/tools-set', { id, tools: { translation: tr, chat: ch } });
          toast(r.ok ? 'تم حفظ أدوات البنك ✅' : (r.error || 'حصل خطأ'));
          const bk = BANKS.find((x) => x.id === id);
          if (bk && r.ok) bk.tools = r.tools;
        });
      });
    } catch (_) {
      box.innerHTML = '<div class="empty-msg">تعذّر التحميل</div>';
    }
  }

  // ===== ملفات المنهج =====
  async function loadCurriculumList() {
    const box = $('cur-list');
    try {
      const d = await api('/curriculum');
      const files = d.files || [];
      if (!files.length) { box.innerHTML = '<div class="empty-msg">مفيش ملفات منهج لسه</div>'; return; }
      box.innerHTML = files.map((f) => `
        <div class="sub-item" style="align-items:center">
          <span class="badge bg-ok" style="white-space:nowrap">${esc(GRADE_NAMES[f.grade] || f.grade)}</span>
          <strong style="flex:1">${esc(f.title)}</strong>
          <span style="font-size:.7rem;color:#7a8199">${Math.round(f.size / 1000)} ألف حرف</span>
          <button class="b b-navy" data-cur-edit="${esc(f.id)}" style="font-size:.72rem">تعديل</button>
          <button class="b b-red" data-cur-del="${esc(f.id)}" style="font-size:.72rem"><i class="fas fa-trash"></i></button>
        </div>`).join('');
      box.querySelectorAll('[data-cur-edit]').forEach((b) => b.addEventListener('click', async () => {
        const r = await api('/curriculum/' + encodeURIComponent(b.dataset.curEdit));
        if (!r.ok) { toast(r.error || 'حصل خطأ'); return; }
        $('cur-id').value = b.dataset.curEdit;
        $('cur-grade').value = r.file.grade || 'sec3';
        $('cur-title').value = r.file.title || '';
        $('cur-content').value = r.file.content || '';
        toast('اتفتح للتعديل — عدّل واحفظ');
      }));
      box.querySelectorAll('[data-cur-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('حذف ملف المنهج ده؟')) return;
        const r = await post('/curriculum-delete', { id: b.dataset.curDel });
        toast(r.ok ? 'تم الحذف' : (r.error || 'حصل خطأ'));
        loadCurriculumList();
      }));
    } catch (_) {
      box.innerHTML = '<div class="empty-msg">تعذّر التحميل</div>';
    }
  }

  $('cur-save').addEventListener('click', async () => {
    const r = await post('/curriculum-save', {
      id: $('cur-id').value || undefined,
      grade: $('cur-grade').value,
      title: $('cur-title').value.trim(),
      content: $('cur-content').value
    });
    if (r.ok) { toast('تم حفظ ملف المنهج ✅'); $('cur-id').value = r.id; loadCurriculumList(); }
    else toast(r.error || 'حصل خطأ');
  });
  $('cur-clear').addEventListener('click', () => { $('cur-id').value = ''; $('cur-title').value = ''; $('cur-content').value = ''; });

  // ===== قسم التلجرام: إحصائية سريعة =====
  async function loadTgStats() {
    try {
      const d = await api('/students');
      const list = d.students || [];
      const verified = list.filter((u) => u.verifyStatus === 'verified').length;
      $('tg-stats').innerHTML = `<div class="sp-row"><span>👥 إجمالي الطلاب: <b>${list.length}</b></span><span>✅ موثّقين بالتلجرام: <b>${verified}</b></span><span>⏳ غير موثّقين: <b>${list.length - verified}</b></span></div>`;
    } catch (_) {}
  }

  // ===== قسم التحليلات: أكتر الأسئلة غلطًا =====
  $('analytics-refresh').addEventListener('click', async () => {
    const box = $('most-missed-box');
    box.innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحليل...</div>';
    try {
      const d = await api('/analytics/most-missed');
      const list = d.missed || [];
      if (!list.length) { box.innerHTML = '<div class="empty-msg">مفيش أخطاء متسجلة لسه — النظام بيسجل أخطاء الطلاب من الامتحانات الجديدة</div>'; return; }
      box.innerHTML = `<p style="font-size:.75rem;font-weight:800;color:#7a8199;margin-bottom:8px">من إجمالي ${d.totalResults} نتيجة امتحان</p>
        <table><thead><tr><th>#</th><th>السؤال</th><th>الإجابة الصحيحة</th><th>عدد مرات الغلط</th><th>الامتحانات</th></tr></thead><tbody>${list.map((m, i) => `
        <tr>
          <td><b>${i + 1}</b></td>
          <td style="direction:ltr;text-align:left;font-size:.8rem">${esc(m.q)}</td>
          <td style="direction:ltr;text-align:left;font-size:.78rem;color:#2a9d54;font-weight:800">${esc(m.correct)}</td>
          <td><span class="badge ${m.count >= 5 ? 'bg-warn' : 'bg-mid'}">${m.count} ✗</span></td>
          <td style="font-size:.7rem;color:#7a8199">${(m.exams || []).map(esc).join('، ')}</td>
        </tr>`).join('')}</tbody></table>`;
    } catch (_) {
      box.innerHTML = '<div class="empty-msg">تعذّر التحميل</div>';
    }
  });

  $('content-course').addEventListener('change', (e) => { if (e.target.value) loadContent(e.target.value); });

  async function loadContent(courseId) {
    $('lectures-editor').innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    try {
      const d = await api('/content/' + courseId);
      CONTENT = (d.content && Array.isArray(d.content.lectures)) ? d.content : { lectures: [] };
      renderLecturesEditor();
    } catch (_) {
      $('lectures-editor').innerHTML = '<div class="empty-msg">تعذّر تحميل المحتوى</div>';
    }
  }

  function examEditorHtml(lec) {
    if (!lec.exam) {
      return `<button class="b b-gold" data-add-exam style="font-size:.72rem"><i class="fas fa-plus"></i> امتحان يدوي</button>
        <button class="b b-purple" data-add-bank-exam style="font-size:.72rem"><i class="fas fa-database"></i> ربط ببنك أسئلة</button>`;
    }
    if (lec.exam.bankId) {
      return `
        <div class="exam-pick-row">
          <i class="fas fa-database" style="color:#7b3fb5"></i>
          <input class="inp" data-e-title value="${esc(lec.exam.title || '')}" placeholder="عنوان الامتحان" style="flex:1;min-width:140px">
          <select class="inp" data-e-bank style="max-width:230px">${BANKS.map((b) => `<option value="${esc(b.id)}" ${b.id === lec.exam.bankId ? 'selected' : ''}>${esc(b.title)} (${b.count} سؤال)</option>`).join('') || '<option value="">لا توجد بنوك</option>'}</select>
          <label style="font-size:.72rem;font-weight:800">عدد الأسئلة:</label>
          <input class="inp" data-e-count type="number" min="1" max="100" value="${Number(lec.exam.count || 10)}" style="max-width:80px">
          <button class="b b-red" data-e-del>حذف</button>
        </div>
        <p style="font-size:.72rem;color:#7b3fb5;font-weight:700"><i class="fas fa-shuffle"></i> الأسئلة بتتاخد عشوائيًا من البنك لكل طالب</p>`;
    }
    return `
          <div class="sub-item"><input class="inp" data-e-title value="${esc(lec.exam.title)}" placeholder="عنوان الامتحان"><button class="b b-red" data-e-del>حذف الامتحان</button></div>
          <div data-questions>${(lec.exam.questions || []).map((q, qi) => `
            <div class="q-block" data-qi="${qi}">
              <div class="sub-item"><input class="inp" data-q-text value="${esc(q.q)}" placeholder="نص السؤال"><button class="b b-red" data-q-del><i class="fas fa-times"></i></button></div>
              <div class="sub-item">${(q.options || ['', '', '', '']).map((op, oi) => `<input class="inp" data-q-opt="${oi}" value="${esc(op)}" placeholder="اختيار ${oi + 1}">`).join('')}</div>
              <div class="sub-item"><label style="font-size:.75rem;font-weight:800">الإجابة الصحيحة:</label>
                <select class="inp" data-q-ans style="max-width:140px">${[0, 1, 2, 3].map((i) => `<option value="${i}" ${q.answer === i ? 'selected' : ''}>اختيار ${i + 1}</option>`).join('')}</select>
              </div>
            </div>`).join('')}</div>
          <button class="b b-gold" data-add-q style="font-size:.72rem"><i class="fas fa-plus"></i> سؤال</button>`;
  }

  function renderLecturesEditor() {
    const box = $('lectures-editor');
    if (!CONTENT.lectures.length) {
      box.innerHTML = '<div class="empty-msg">لا توجد محاضرات — اضغط "إضافة محاضرة"</div>';
      return;
    }
    box.innerHTML = CONTENT.lectures.map((lec, li) => `
      <div class="lec-editor" data-li="${li}">
        <div class="lec-editor-head">
          <div class="lecno">${li + 1}</div>
          <input class="inp" data-lec-title style="flex:1" value="${esc(lec.title)}" placeholder="اسم المحاضرة">
          <button class="b b-red" data-lec-del title="حذف المحاضرة"><i class="fas fa-trash"></i></button>
        </div>
        <div class="sub-item" style="align-items:center;background:#f0f6ff;border-radius:10px;padding:8px">
          <label style="font-size:.75rem;font-weight:800;white-space:nowrap"><input type="checkbox" data-lec-pub ${lec.publishAt && new Date(lec.publishAt) > new Date() ? '' : 'checked'}> منشورة للطلاب الآن</label>
          <label style="font-size:.72rem;font-weight:800;white-space:nowrap">أو موعد النشر:</label>
          <input class="inp" data-lec-pubat type="datetime-local" value="${lec.publishAt ? new Date(lec.publishAt).toISOString().slice(0, 16) : ''}" style="max-width:200px">
          ${lec.publishAt && new Date(lec.publishAt) > new Date() ? '<span class="badge bg-warn">⏰ مجدولة</span>' : ''}
        </div>

        <div class="mini-title"><i class="fas fa-play-circle"></i>الفيديوهات (رابط أو ID من يوتيوب)</div>
        <div data-videos>${(lec.videos || []).map((v, vi) => `
          <div class="sub-item" data-vi="${vi}">
            <input class="inp" data-v-title value="${esc(v.title)}" placeholder="عنوان الفيديو">
            <input class="inp" data-v-yt value="${esc(v.youtubeId)}" placeholder="youtube ID أو رابط" style="direction:ltr">
            <input class="inp" data-v-dur value="${esc(v.duration || '')}" placeholder="المدة (مثال: 25:00)" style="max-width:130px;direction:ltr">
            ${v.youtubeId ? `<img src="https://img.youtube.com/vi/${esc(v.youtubeId)}/hqdefault.jpg" alt="معاينة" style="width:74px;height:44px;object-fit:cover;border-radius:8px;border:2px solid #d4a937">` : ''}
            <button class="b b-red" data-v-del><i class="fas fa-times"></i></button>
          </div>`).join('')}</div>
        <button class="b b-navy" data-add-video style="font-size:.72rem"><i class="fas fa-plus"></i> فيديو</button>

        <div class="mini-title"><i class="fas fa-file-pdf"></i>الملفات</div>
        <div data-files>${(lec.files || []).map((f, fi) => `
          <div class="sub-item" data-fi="${fi}">
            <input class="inp" data-f-title value="${esc(f.title)}" placeholder="اسم الملف">
            <input class="inp" data-f-url value="${esc(f.url)}" placeholder="رابط الملف" style="direction:ltr">
            <input class="inp" data-f-size value="${esc(f.size || '')}" placeholder="الحجم (مثال: 2 MB)" style="max-width:110px;direction:ltr">
            <button class="b b-purple" data-f-upload="${fi}" style="font-size:.7rem" title="رفع الملف على المنصة"><i class="fas fa-cloud-arrow-up"></i></button>
            <button class="b b-red" data-f-del><i class="fas fa-times"></i></button>
          </div>`).join('')}</div>
        <button class="b b-navy" data-add-file style="font-size:.72rem"><i class="fas fa-plus"></i> ملف</button>
        <span data-f-upload-status style="font-size:.72rem;font-weight:800;color:#7b3fb5;margin-right:8px"></span>

        <div class="mini-title"><i class="fas fa-clipboard-question"></i>الامتحان</div>
        ${examEditorHtml(lec)}
      </div>`).join('');

    // ربط الأحداث
    box.querySelectorAll('.lec-editor').forEach((lecEl) => {
      const li = Number(lecEl.dataset.li);
      const lec = CONTENT.lectures[li];
      lecEl.querySelector('[data-lec-title]').addEventListener('input', (e) => lec.title = e.target.value);
      lecEl.querySelector('[data-lec-del]').addEventListener('click', () => {
        if (!confirm('حذف المحاضرة بكل محتواها؟')) return;
        CONTENT.lectures.splice(li, 1); renderLecturesEditor();
      });
      lecEl.querySelector('[data-add-video]').addEventListener('click', () => {
        collectAll();
        lec.videos.push({ id: uid(), title: '', youtubeId: '', duration: '' }); renderLecturesEditor();
      });
      lecEl.querySelector('[data-add-file]').addEventListener('click', () => {
        collectAll();
        lec.files.push({ id: uid(), title: '', url: '', size: '' }); renderLecturesEditor();
      });
      const addExam = lecEl.querySelector('[data-add-exam]');
      if (addExam) addExam.addEventListener('click', () => {
        collectAll();
        lec.exam = { id: uid(), title: 'امتحان ' + (lec.title || ''), questions: [] }; renderLecturesEditor();
      });
      const addBankExam = lecEl.querySelector('[data-add-bank-exam]');
      if (addBankExam) addBankExam.addEventListener('click', async () => {
        collectAll();
        if (!BANKS.length) await loadBanksList();
        if (!BANKS.length) { toast('اعمل بنك أسئلة الأول من تبويب "بنوك الأسئلة"'); return; }
        lec.exam = { id: uid(), bankId: BANKS[0].id, count: 10, title: 'امتحان ' + (lec.title || '') };
        renderLecturesEditor();
      });
      const delExam = lecEl.querySelector('[data-e-del]');
      if (delExam) delExam.addEventListener('click', () => {
        if (!confirm('حذف الامتحان؟')) return;
        collectAll(); lec.exam = null; renderLecturesEditor();
      });
      const addQ = lecEl.querySelector('[data-add-q]');
      if (addQ) addQ.addEventListener('click', () => {
        collectAll();
        lec.exam.questions.push({ q: '', options: ['', '', '', ''], answer: 0 }); renderLecturesEditor();
      });
      lecEl.querySelectorAll('[data-v-del]').forEach((b, vi) => b.addEventListener('click', () => {
        collectAll(); lec.videos.splice(vi, 1); renderLecturesEditor();
      }));
      lecEl.querySelectorAll('[data-f-del]').forEach((b, fi) => b.addEventListener('click', () => {
        collectAll(); lec.files.splice(fi, 1); renderLecturesEditor();
      }));
      lecEl.querySelectorAll('[data-q-del]').forEach((b, qi) => b.addEventListener('click', () => {
        collectAll(); lec.exam.questions.splice(qi, 1); renderLecturesEditor();
      }));
      // معاينة صورة اليوتيوب عند لصق الرابط
      lecEl.querySelectorAll('[data-v-yt]').forEach((inp) => inp.addEventListener('change', () => {
        collectAll(); renderLecturesEditor();
      }));
      // رفع ملف للمنصة (على أجزاء صغيرة بفواصل زمنية)
      lecEl.querySelectorAll('[data-f-upload]').forEach((b) => b.addEventListener('click', () => {
        const fi = Number(b.dataset.fUpload);
        const picker = document.createElement('input');
        picker.type = 'file';
        picker.addEventListener('change', async () => {
          const file = picker.files && picker.files[0];
          if (!file) return;
          if (file.size > 25 * 1024 * 1024) { toast('الملف كبير — أقصى حجم 25 ميجا'); return; }
          const st = lecEl.querySelector('[data-f-upload-status]');
          try {
            collectAll();
            st.textContent = 'جاري الرفع...';
            const r = await uploadFileChunked(file, (i, t) => st.textContent = `جاري رفع الملف ${i}/${t}...`);
            lec.files[fi].url = r.url;
            if (!lec.files[fi].title) lec.files[fi].title = file.name;
            lec.files[fi].size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            renderLecturesEditor();
            toast('تم رفع الملف على المنصة ✅ — متنساش حفظ المحتوى');
          } catch (err) {
            st.textContent = '';
            toast(err.message || 'فشل الرفع');
          }
        });
        picker.click();
      }));
      // نشر / جدولة المحاضرة
      const pubCb = lecEl.querySelector('[data-lec-pub]');
      const pubAt = lecEl.querySelector('[data-lec-pubat]');
      if (pubCb) pubCb.addEventListener('change', () => {
        if (pubCb.checked) { pubAt.value = ''; lec.publishAt = ''; toast('المحاضرة هتظهر للطلاب فور الحفظ'); }
      });
      if (pubAt) pubAt.addEventListener('change', () => {
        if (pubAt.value) { pubCb.checked = false; toast('اتحدد موعد النشر — احفظ المحتوى'); }
      });
    });
  }

  // تحويل رابط يوتيوب لـ ID
  function ytId(v) {
    v = String(v || '').trim();
    const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : v;
  }

  // قراءة القيم الحالية من DOM قبل إعادة الرسم
  function collectFrom(lecEl, lec) {
    lec.title = lecEl.querySelector('[data-lec-title]').value;
    const pubCb = lecEl.querySelector('[data-lec-pub]');
    const pubAt = lecEl.querySelector('[data-lec-pubat]');
    if (pubCb && pubAt) {
      lec.publishAt = (!pubCb.checked && pubAt.value) ? new Date(pubAt.value).toISOString() : (pubAt.value && !pubCb.checked ? new Date(pubAt.value).toISOString() : (pubAt.value ? new Date(pubAt.value).toISOString() : ''));
      if (pubCb.checked) lec.publishAt = '';
    }
    lecEl.querySelectorAll('[data-videos] .sub-item').forEach((row, vi) => {
      if (!lec.videos[vi]) return;
      lec.videos[vi].title = row.querySelector('[data-v-title]').value;
      lec.videos[vi].youtubeId = ytId(row.querySelector('[data-v-yt]').value);
      lec.videos[vi].duration = row.querySelector('[data-v-dur]').value;
    });
    lecEl.querySelectorAll('[data-files] .sub-item').forEach((row, fi) => {
      if (!lec.files[fi]) return;
      lec.files[fi].title = row.querySelector('[data-f-title]').value;
      lec.files[fi].url = row.querySelector('[data-f-url]').value;
      lec.files[fi].size = row.querySelector('[data-f-size]').value;
    });
    if (lec.exam) {
      const et = lecEl.querySelector('[data-e-title]');
      if (et) lec.exam.title = et.value;
      const eb = lecEl.querySelector('[data-e-bank]');
      if (eb) {
        lec.exam.bankId = eb.value;
        const ec = lecEl.querySelector('[data-e-count]');
        lec.exam.count = Math.max(1, Number((ec && ec.value) || 10));
        lec.exam.questions = [];
        return;
      }
      lecEl.querySelectorAll('[data-questions] .q-block').forEach((qb, qi) => {
        if (!lec.exam.questions[qi]) return;
        lec.exam.questions[qi].q = qb.querySelector('[data-q-text]').value;
        lec.exam.questions[qi].options = [0, 1, 2, 3].map((oi) => {
          const el = qb.querySelector(`[data-q-opt="${oi}"]`);
          return el ? el.value : '';
        });
        lec.exam.questions[qi].answer = Number(qb.querySelector('[data-q-ans]').value || 0);
      });
    }
  }

  function collectAll() {
    document.querySelectorAll('.lec-editor').forEach((lecEl) => {
      const li = Number(lecEl.dataset.li);
      if (CONTENT.lectures[li]) collectFrom(lecEl, CONTENT.lectures[li]);
    });
  }

  $('add-lecture-btn').addEventListener('click', () => {
    collectAll();
    CONTENT.lectures.push({ id: uid(), title: 'محاضرة جديدة', videos: [], files: [], exam: null });
    renderLecturesEditor();
  });

  $('save-content-btn').addEventListener('click', async () => {
    const courseId = $('content-course').value;
    if (!courseId) { toast('اختر الكورس الأول'); return; }
    collectAll();
    const r = await post('/content-save', { courseId, content: CONTENT });
    toast(r.ok ? 'تم حفظ المحتوى ✅' : (r.error || 'حصل خطأ'));
  });

  // ===== بنوك الأسئلة =====
  let BANKS = [];
  let BANK_Q = [];

  async function loadBanksList() {
    try { const d = await bapi('/'); BANKS = d.banks || []; } catch (_) { BANKS = []; }
    const groups = [...new Set(BANKS.map((b) => b.group).filter(Boolean))];
    const dl = $('bk-groups');
    if (dl) dl.innerHTML = groups.map((g) => `<option value="${esc(g)}">`).join('');
    const gsel = $('grades-bank');
    if (gsel) {
      const cur = gsel.value;
      gsel.innerHTML = '<option value="">كل الامتحانات</option>' + BANKS.map((b) => `<option value="${esc(b.id)}">${esc(b.title)}${b.group ? ' — ' + esc(b.group) : ''}</option>`).join('');
      gsel.value = cur;
    }
  }

  function renderBanksList() {
    const box = $('banks-list');
    if (!BANKS.length) { box.innerHTML = '<div class="empty-msg"><i class="fas fa-database"></i> مفيش بنوك لسه — اعمل أول بنك من فوق ⬆️</div>'; return; }
    const byGroup = {};
    BANKS.forEach((b) => { const g = b.group || 'بدون مجموعة'; (byGroup[g] = byGroup[g] || []).push(b); });
    box.innerHTML = Object.keys(byGroup).map((g) => `
      <div class="bank-group-title"><i class="fas fa-folder-open"></i>${esc(g)}</div>
      <div class="banks-grid">${byGroup[g].map((b) => `
        <div class="bank-card">
          <div class="bk-ico"><i class="fas fa-database"></i></div>
          <strong style="color:#1b2a6b">${esc(b.title)}</strong>
          <p style="font-size:.75rem;color:#7a8199;font-weight:700;margin:4px 0 10px"><i class="fas fa-list-check" style="color:#d4a937"></i> ${b.count} سؤال</p>
          <div style="display:flex;gap:6px">
            <button class="b b-navy" data-bk-edit="${esc(b.id)}"><i class="fas fa-pen"></i> تعديل</button>
            <button class="b b-red" data-bk-del="${esc(b.id)}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`).join('')}</div>`).join('');
    box.querySelectorAll('[data-bk-edit]').forEach((b) => b.addEventListener('click', async () => {
      const d = await bapi('/' + encodeURIComponent(b.dataset.bkEdit));
      if (!d.ok) { toast(d.error || 'حصل خطأ'); return; }
      $('bk-id').value = d.bank.id; $('bk-title').value = d.bank.title || ''; $('bk-group').value = d.bank.group || '';
      BANK_Q = d.bank.questions || [];
      renderBankQuestions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    box.querySelectorAll('[data-bk-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('متأكد من حذف البنك نهائيًا؟')) return;
      const r = await bpost('/delete', { id: b.dataset.bkDel });
      toast(r.ok ? 'تم حذف البنك' : (r.error || 'حصل خطأ'));
      await loadBanksList(); renderBanksList();
    }));
  }

  const TYPE_NAMES = { mcq: 'اختياري', tf: 'صح/خطأ', essay: 'مقالي' };
  function qType(q) { return q.type === 'tf' || q.type === 'essay' ? q.type : 'mcq'; }

  function renderBankQuestions() {
    $('bk-count').textContent = BANK_Q.length;
    const box = $('bk-questions');
    if (!BANK_Q.length) { box.innerHTML = '<div class="empty-msg" style="padding:14px">مفيش أسئلة لسه — ولّد بالذكاء الاصطناعي أو ضيف يدوي</div>'; return; }
    box.innerHTML = BANK_Q.map((q, qi) => {
      const t = qType(q);
      let body = '';
      if (t === 'mcq') {
        body = `<div class="sub-item">${(q.options || ['', '', '', '']).map((op, oi) => `<input class="inp" data-bq-opt="${oi}" value="${esc(op)}" placeholder="Choix ${oi + 1}" style="direction:ltr">`).join('')}</div>
          <div class="sub-item"><label style="font-size:.75rem;font-weight:800">الإجابة الصحيحة:</label>
            <select class="inp" data-bq-ans style="max-width:140px">${[0, 1, 2, 3].map((i) => `<option value="${i}" ${Number(q.answer) === i ? 'selected' : ''}>اختيار ${i + 1}</option>`).join('')}</select>
          </div>`;
      } else if (t === 'tf') {
        body = `<div class="sub-item"><label style="font-size:.75rem;font-weight:800">الإجابة الصحيحة:</label>
            <select class="inp" data-bq-ans style="max-width:140px"><option value="0" ${Number(q.answer) === 0 ? 'selected' : ''}>Vrai (صح)</option><option value="1" ${Number(q.answer) === 1 ? 'selected' : ''}>Faux (خطأ)</option></select>
          </div>`;
      } else {
        body = `<div class="sub-item"><input class="inp" data-bq-model value="${esc(q.modelAnswer || '')}" placeholder="الإجابة النموذجية (فرنساوي)" style="direction:ltr"></div>`;
      }
      return `
      <div class="q-block" data-bqi="${qi}">
        <div class="sub-item"><span class="step-pill" title="${TYPE_NAMES[t]}"><b>${qi + 1}</b></span><span class="badge ${t === 'essay' ? 'bg-mid' : t === 'tf' ? 'bg-warn' : 'bg-ok'}" style="white-space:nowrap">${TYPE_NAMES[t]}</span><input class="inp" data-bq-text value="${esc(q.q)}" placeholder="نص السؤال (فرنساوي)" style="direction:ltr"><button class="b b-red" data-bq-del><i class="fas fa-times"></i></button></div>
        ${body}
        <div class="sub-item"><input class="inp" data-bq-explain value="${esc(q.explain || '')}" placeholder="تفسير الإجابة بالعربي البسيط (ما قل ودل)"><input class="inp" data-bq-img value="${esc(q.img || '')}" placeholder="رابط صورة للسؤال (اختياري)" style="direction:ltr;max-width:220px"></div>
        ${q.img ? `<img src="${esc(q.img)}" alt="صورة السؤال" style="max-height:90px;border-radius:8px;margin-top:4px">` : ''}
      </div>`;
    }).join('');
    box.querySelectorAll('[data-bq-del]').forEach((b, qi) => b.addEventListener('click', () => {
      collectBankQ(); BANK_Q.splice(qi, 1); renderBankQuestions();
    }));
  }

  function collectBankQ() {
    document.querySelectorAll('#bk-questions .q-block').forEach((qb, qi) => {
      if (!BANK_Q[qi]) return;
      const q = BANK_Q[qi];
      const t = qType(q);
      q.q = qb.querySelector('[data-bq-text]').value;
      q.explain = (qb.querySelector('[data-bq-explain]') || {}).value || '';
      q.img = ((qb.querySelector('[data-bq-img]') || {}).value || '').trim();
      if (t === 'mcq') {
        q.options = [0, 1, 2, 3].map((oi) => { const el = qb.querySelector(`[data-bq-opt="${oi}"]`); return el ? el.value : ''; });
        q.answer = Number(qb.querySelector('[data-bq-ans]').value || 0);
      } else if (t === 'tf') {
        q.options = ['Vrai', 'Faux'];
        q.answer = Number(qb.querySelector('[data-bq-ans]').value || 0);
      } else {
        q.modelAnswer = (qb.querySelector('[data-bq-model]') || {}).value || '';
      }
    });
  }

  async function loadBanksTab() {
    await loadBanksList();
    renderBanksList();
    renderBankQuestions();
  }

  $('bk-add-q').addEventListener('click', () => {
    collectBankQ();
    BANK_Q.push({ type: 'mcq', q: '', options: ['', '', '', ''], answer: 0, explain: '' });
    renderBankQuestions();
  });

  $('bk-add-tf').addEventListener('click', () => {
    collectBankQ();
    BANK_Q.push({ type: 'tf', q: '', options: ['Vrai', 'Faux'], answer: 0, explain: '' });
    renderBankQuestions();
  });

  $('bk-add-essay').addEventListener('click', () => {
    collectBankQ();
    BANK_Q.push({ type: 'essay', q: '', modelAnswer: '', explain: '' });
    renderBankQuestions();
  });

  $('bk-save').addEventListener('click', async () => {
    collectBankQ();
    const title = $('bk-title').value.trim();
    if (!title) { toast('اكتب اسم البنك'); return; }
    const qs = BANK_Q.filter((q) => q.q && (qType(q) === 'essay' ? true : (q.options || []).some((o) => o)));
    if (!qs.length) { toast('ضيف سؤال واحد على الأقل'); return; }
    const r = await bpost('/save', { id: $('bk-id').value.trim() || undefined, title, group: $('bk-group').value.trim(), questions: qs });
    if (r.ok) {
      $('bk-id').value = r.id;
      toast('تم حفظ البنك ✅ (' + qs.length + ' سؤال)');
      await loadBanksList(); renderBanksList();
    } else toast(r.error || 'حصل خطأ');
  });

  $('bk-clear').addEventListener('click', () => {
    $('bk-id').value = ''; $('bk-title').value = ''; $('bk-group').value = '';
    BANK_Q = []; renderBankQuestions();
    $('ai-material').value = ''; $('ai-status').textContent = '';
  });

  // ===== توليد الأسئلة بالذكاء الاصطناعي — 6 أوضاع منفصلة تمامًا =====
  const MODE_HINTS = {
    qcm: '4 اختيارات لكل سؤال — من المحتوى فقط، مفيش خلط بأنواع تانية.',
    truefalse: 'أسئلة Vrai/Faux فقط وبالعدد المظبوط اللي هتكتبه — مفيش اختياري ولا مقالي.',
    essay: 'أسئلة مقالية مباشرة وبسيطة فقط — إجابتها كلمة أو جملة قصيرة، وبالعدد المظبوط.',
    intellectual: 'الصق امتحانًا جاهزًا — الذكاء الاصطناعي بيحلل أسلوب تفكيره ويولّد أسئلة جديدة بنفس الأسلوب والصعوبة.',
    extract: 'الصق ملف بنك جاهز — هيستخرج الأسئلة اللي فيه زي ما هي بالظبط من غير تغيير.',
    models: 'بيولّد عدة نماذج امتحان متطابقة الصعوبة — كل نموذج بيتحفظ كبنك مستقل باسم البنك + رقم النموذج.'
  };
  function syncAiMode() {
    const m = $('ai-mode').value;
    $('ai-models-row').style.display = m === 'models' ? 'flex' : 'none';
    $('ai-count').parentElement && ($('ai-count').style.display = m === 'models' ? 'none' : '');
    $('ai-mode-hint').textContent = MODE_HINTS[m] || '';
    $('ai-analysis-box').style.display = 'none';
  }
  $('ai-mode').addEventListener('change', syncAiMode);
  syncAiMode();

  $('ai-gen-btn').addEventListener('click', async () => {
    const material = $('ai-material').value.trim();
    const mode = $('ai-mode').value;
    const count = Math.min(30, Math.max(1, Number($('ai-count').value || 10)));
    if (material.length < 30) { toast('الصق المحتوى الأول (فقرة على الأقل)'); return; }
    if (mode === 'models' && !$('bk-title').value.trim()) { toast('اكتب اسم البنك الأول — كل نموذج هيتحفظ باسمه + رقم النموذج'); return; }
    const btn = $('ai-gen-btn');
    btn.disabled = true;
    $('ai-analysis-box').style.display = 'none';
    $('ai-status').innerHTML = '<i class="fas fa-spinner fa-spin"></i> بيشتغل... (ثواني)';
    try {
      const body = { material, mode, count };
      if (mode === 'models') {
        body.numModels = Math.min(6, Math.max(1, Number($('ai-num-models').value || 2)));
        body.perModel = Math.min(30, Math.max(1, Number($('ai-per-model').value || 10)));
      }
      const r = await bpost('/ai-generate', body);
      if (!r.ok) { $('ai-status').textContent = r.error || 'حصل خطأ — جرب تاني'; btn.disabled = false; return; }

      if (mode === 'models' && Array.isArray(r.models)) {
        // حفظ كل نموذج كبنك مستقل
        const baseTitle = $('bk-title').value.trim();
        const group = $('bk-group').value.trim();
        let saved = 0;
        for (let mi = 0; mi < r.models.length; mi++) {
          const md = r.models[mi];
          const qs = (md.questions || []).filter((q) => q.q);
          if (!qs.length) continue;
          const sv = await bpost('/save', { title: `${baseTitle} — نموذج ${mi + 1}`, group, questions: qs });
          if (sv.ok) saved++;
        }
        await loadBanksList(); renderBanksList();
        $('ai-status').innerHTML = `<i class="fas fa-check-circle" style="color:#2a9d54"></i> اتحفظ ${saved} نموذج متطابق الصعوبة كبنوك مستقلة`;
        toast(`تم إنشاء ${saved} نموذج ✨`);
      } else if (r.questions && r.questions.length) {
        collectBankQ();
        BANK_Q = BANK_Q.concat(r.questions);
        renderBankQuestions();
        let msg = '<i class="fas fa-check-circle" style="color:#2a9d54"></i> اتولّد ' + r.questions.length + ' سؤال — راجعهم واحفظ البنك';
        if (r.warning) msg += ' — ⚠️ ' + esc(r.warning);
        $('ai-status').innerHTML = msg;
        if (mode === 'intellectual' && r.analysis) {
          $('ai-analysis-box').style.display = 'block';
          $('ai-analysis-box').innerHTML = '<b><i class="fas fa-brain"></i> تحليل أسلوب التفكير:</b><br>' + esc(r.analysis);
        }
        toast('تم توليد ' + r.questions.length + ' سؤال ✨');
      } else {
        $('ai-status').textContent = 'مرجعش أسئلة — جرب تاني';
      }
    } catch (_) {
      $('ai-status').textContent = 'مشكلة في الاتصال — جرب تاني';
    }
    btn.disabled = false;
  });

  // ===== درجات الطلاب =====
  async function loadGradesTab() {
    // إصلاح الفلتر: كل الامتحانات اللي ليها نتايج فعلًا (مش البنوك بس)
    try {
      const d = await api('/exam-filters');
      const opts = (d.filters || []).map((f) => `<option value="${esc(f.bankId || f.key)}">${esc(f.title)} (${f.count} نتيجة)</option>`).join('');
      $('grades-bank').innerHTML = '<option value="">كل الامتحانات</option>' + opts;
    } catch (_) {}
    loadGrades();
  }

  async function loadGrades() {
    $('grades-table').innerHTML = '<div class="empty-msg"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';
    try {
      const bankId = $('grades-bank').value;
      const d = await api('/exam-results' + (bankId ? '?bankId=' + encodeURIComponent(bankId) : ''));
      const list = d.results || [];
      if (!list.length) { $('grades-table').innerHTML = '<div class="empty-msg"><i class="fas fa-ranking-star"></i> مفيش نتايج لسه</div>'; return; }
      const rows = list.map((r, i) => {
        const pct = Number(r.pct || 0);
        const cls = pct >= 85 ? 'bg-ok' : pct >= 50 ? 'bg-mid' : 'bg-warn';
        const medal = i === 0 ? ' 🥇' : i === 1 ? ' 🥈' : i === 2 ? ' 🥉' : '';
        return `<tr>
          <td><strong style="color:#1b2a6b">${esc(r.name || r.phone)}${medal}</strong><br><span style="color:#7a8199;font-size:.72rem">${esc(r.phone)}</span></td>
          <td>${esc(GRADE_NAMES[r.grade] || r.grade || '—')}</td>
          <td>${esc(r.title || 'امتحان')}<br><span style="color:#7a8199;font-size:.7rem">${esc(r.lecture || '')}</span></td>
          <td style="white-space:nowrap"><strong>${Number(r.score || 0)} / ${Number(r.total || 0)}</strong></td>
          <td><span class="badge ${cls}">${pct}%</span></td>
          <td style="font-size:.72rem;color:#7a8199;direction:ltr;text-align:left">${esc((r.at || '').slice(0, 16).replace('T', ' '))}</td>
        </tr>`;
      }).join('');
      $('grades-table').innerHTML = `<table><thead><tr><th>الطالب</th><th>الصف</th><th>الامتحان</th><th>الدرجة</th><th>النسبة</th><th>الوقت</th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch (_) {
      $('grades-table').innerHTML = '<div class="empty-msg">تعذّر تحميل النتايج</div>';
    }
  }

  $('grades-refresh').addEventListener('click', loadGrades);
  $('grades-bank').addEventListener('change', loadGrades);

  // ===== المتواجدون الآن =====
  let onlineTimer = null;
  async function loadOnline() {
    try {
      const d = await api('/online');
      const list = d.online || [];
      const badge = $('online-count-badge');
      badge.textContent = list.length;
      badge.style.display = list.length ? 'inline-block' : 'none';
      if (!list.length) { $('online-list').innerHTML = '<div class="empty-msg" style="grid-column:1/-1"><i class="fas fa-moon"></i> مفيش حد متواجد دلوقتي</div>'; return; }
      $('online-list').innerHTML = list.map((u) => `
        <div class="online-chip">
          <div class="av">${esc((u.name || '؟').trim().charAt(0))}</div>
          <div style="flex:1;min-width:0">
            <strong style="color:#1b2a6b;font-size:.85rem;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(u.name || u.phone)}</strong>
            <span style="font-size:.7rem;color:#7a8199">${esc(GRADE_NAMES[u.grade] || u.grade || '')} — ${esc(u.phone)}</span>
          </div>
          <span class="online-dot"></span>
        </div>`).join('');
    } catch (_) {}
  }

  function loadOnlineTab() {
    loadOnline();
    clearInterval(onlineTimer);
    onlineTimer = setInterval(loadOnline, 30000);
  }
  // حدّث شارة العدد حتى قبل فتح التبويب
  loadOnline();
  setInterval(loadOnline, 60000);

  // ===== بدء التشغيل =====
  loaded.stats = true;
  loadStats();
})();
