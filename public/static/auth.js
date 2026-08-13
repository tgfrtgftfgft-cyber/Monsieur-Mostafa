/* منصة مسيو مصطفى - التسجيل وتسجيل الدخول */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  let mode = qs.get('mode') === 'login' ? 'login' : 'register';
  let currentStep = 1;
  let pendingUser = null; // بيانات المستخدم بعد التسجيل (لتأكيد تلجرام)

  /* ============ Alert modal ============ */
  const alertModal = $('alert-modal');
  function showAlert(icon, title, msg, actions) {
    $('alert-icon').textContent = icon;
    $('alert-title').textContent = title;
    $('alert-msg').textContent = msg;
    const wrap = $('alert-actions');
    wrap.innerHTML = '';
    (actions || [{ text: 'تمام 👍', cls: 'btn-primary', fn: closeAlert }]).forEach(a => {
      const b = document.createElement('button');
      b.className = a.cls + ' w-full !py-2.5';
      b.innerHTML = a.text;
      b.onclick = a.fn;
      wrap.appendChild(b);
    });
    alertModal.classList.add('open');
  }
  function closeAlert() { alertModal.classList.remove('open'); }
  window.closeAlert = closeAlert;

  /* ============ تغيير كلمة السر بعد الدخول بكلمة مؤقتة ============ */
  function openChangePassModal(phone) {
    $('alert-icon').textContent = '🔐';
    $('alert-title').textContent = 'اكتب كلمة سر جديدة';
    $('alert-msg').textContent = 'دخلت بكلمة سر مؤقتة — لازم تحط كلمة سر جديدة خاصة بيك عشان تكمل';
    const wrap = $('alert-actions');
    wrap.innerHTML =
      '<input type="password" id="cp-new" placeholder="كلمة السر الجديدة (6 أحرف على الأقل)" style="width:100%;border:2px solid #e8eaf2;border-radius:12px;padding:12px;font-family:inherit;margin-bottom:8px;direction:ltr;text-align:right">' +
      '<input type="password" id="cp-confirm" placeholder="تأكيد كلمة السر" style="width:100%;border:2px solid #e8eaf2;border-radius:12px;padding:12px;font-family:inherit;margin-bottom:10px;direction:ltr;text-align:right">' +
      '<p id="cp-err" style="color:#e63946;font-size:.8rem;font-weight:700;margin-bottom:8px;display:none"></p>' +
      '<button class="btn-primary w-full !py-2.5" id="cp-save">حفظ كلمة السر والدخول ✅</button>';
    document.getElementById('cp-save').onclick = async () => {
      const np = document.getElementById('cp-new').value;
      const cf = document.getElementById('cp-confirm').value;
      const err = document.getElementById('cp-err');
      if (np.length < 6) { err.textContent = 'كلمة السر 6 أحرف على الأقل'; err.style.display = 'block'; return; }
      if (np !== cf) { err.textContent = 'كلمتا السر غير متطابقتين'; err.style.display = 'block'; return; }
      err.style.display = 'none';
      const sb = document.getElementById('cp-save');
      sb.disabled = true; sb.textContent = 'جاري الحفظ...';
      try {
        const r = await fetch('/api/auth/change-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, newPassword: np, confirm: cf })
        });
        const j = await r.json();
        if (!j.ok) { err.textContent = j.error || 'حصل خطأ'; err.style.display = 'block'; sb.disabled = false; sb.textContent = 'حفظ كلمة السر والدخول ✅'; return; }
        sb.textContent = '✅ تم! جاري الدخول...';
        setTimeout(() => { location.href = '/home'; }, 600);
      } catch (e) {
        err.textContent = 'خطأ في الاتصال — جرب تاني'; err.style.display = 'block';
        sb.disabled = false; sb.textContent = 'حفظ كلمة السر والدخول ✅';
      }
    };
    alertModal.classList.add('open');
  }

  /* ============ Tabs ============ */
  const tabs = document.querySelectorAll('.auth-tab');
  function setMode(m) {
    mode = m;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === m));
    $('login-form').classList.toggle('hidden', m !== 'login');
    $('register-form').classList.toggle('hidden', m !== 'register');
    const url = new URL(location.href);
    url.searchParams.set('mode', m);
    history.replaceState(null, '', url);
  }
  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.tab)));

  /* ============ Policy modal ============ */
  const policyModal = $('policy-modal');
  const policyHidden = localStorage.getItem('policy_hide') === '1';
  const policyAgreed = localStorage.getItem('policy_agreed') === '1';

  function openPolicy() { policyModal.classList.add('open'); }

  $('policy-ok').addEventListener('click', () => {
    if (!$('policy-agree').checked) {
      $('policy-warn').classList.remove('hidden');
      setTimeout(() => $('policy-warn').classList.add('hidden'), 3000);
      return;
    }
    localStorage.setItem('policy_agreed', '1');
    if ($('policy-hide').checked) localStorage.setItem('policy_hide', '1');
    policyModal.classList.remove('open');
  });

  // تظهر السياسة أول ما يدخل صفحة التسجيل/الدخول (إلا لو اختار عدم الظهور + وافق قبل كدا)
  setMode(mode);
  if (!(policyHidden && policyAgreed)) openPolicy();

  /* ============ Toggle password visibility ============ */
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.target);
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });

  /* ============ Validation helpers ============ */
  function setErr(id, msg) {
    const el = $('err-' + id);
    const input = $(id);
    if (msg) { el.textContent = msg; el.classList.add('show'); input && input.classList.add('error'); }
    else { el.classList.remove('show'); input && input.classList.remove('error'); }
    return !msg;
  }
  const normPhone = (p) => {
    let s = (p || '').replace(/[^\d+]/g, '');
    if (s.startsWith('+20')) s = '0' + s.slice(3);
    else if (s.startsWith('0020')) s = '0' + s.slice(4);
    else if (s.startsWith('20') && s.length === 12) s = '0' + s.slice(2);
    return s;
  };
  const validPhone = (p) => /^01[0125]\d{8}$/.test(p);

  /* ============ Register steps ============ */
  function goStep(n) {
    currentStep = n;
    document.querySelectorAll('.reg-step').forEach(s => s.classList.toggle('hidden', +s.dataset.step !== n));
    document.querySelectorAll('.step-dot').forEach(d => d.classList.toggle('active', +d.dataset.step <= n));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(n) {
    let ok = true;
    if (n === 1) {
      const name = $('reg-name').value.trim();
      ok = setErr('reg-name', name.split(/\s+/).filter(Boolean).length >= 3 ? '' : 'اكتب اسمك الثلاثي كاملًا (3 أسماء على الأقل)') && ok;
      const phone = normPhone($('reg-phone').value);
      ok = setErr('reg-phone', validPhone(phone) ? '' : 'رقم هاتف مصري غير صحيح (01xxxxxxxxx)') && ok;
      const pphone = normPhone($('reg-parent-phone').value);
      let pErr = '';
      if (!validPhone(pphone)) pErr = 'رقم هاتف الوالد غير صحيح';
      else if (pphone === phone) pErr = 'رقم الوالد لازم يكون مختلف عن رقمك';
      ok = setErr('reg-parent-phone', pErr) && ok;
      const email = $('reg-email').value.trim();
      ok = setErr('reg-email', !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'بريد إلكتروني غير صحيح') && ok;
    } else if (n === 2) {
      ok = setErr('reg-gov', $('reg-gov').value ? '' : 'اختر المحافظة') && ok;
      ok = setErr('reg-city', $('reg-city').value.trim() ? '' : 'اكتب المدينة أو المركز') && ok;
      ok = setErr('reg-grade', $('reg-grade').value ? '' : 'اختر صفك الدراسي') && ok;
    } else if (n === 3) {
      const p1 = $('reg-password').value;
      ok = setErr('reg-password', p1.length >= 6 ? '' : 'كلمة المرور 6 أحرف على الأقل') && ok;
      ok = setErr('reg-password2', $('reg-password2').value === p1 ? '' : 'كلمتا المرور غير متطابقتين') && ok;
    }
    return ok;
  }

  document.querySelectorAll('.next-step').forEach(b => b.addEventListener('click', () => {
    if (validateStep(currentStep)) goStep(currentStep + 1);
  }));
  document.querySelectorAll('.prev-step').forEach(b => b.addEventListener('click', () => goStep(currentStep - 1)));

  /* Azhari toggle */
  let isAzhari = false;
  $('azhari-toggle').addEventListener('click', () => {
    isAzhari = !isAzhari;
    $('azhari-toggle').classList.toggle('on', isAzhari);
  });

  /* ============ Submit register ============ */
  $('register-btn').addEventListener('click', async () => {
    if (!validateStep(3)) return;
    if (localStorage.getItem('policy_agreed') !== '1') { openPolicy(); return; }

    const btn = $('register-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner mx-auto"></div>';

    const payload = {
      name: $('reg-name').value.trim(),
      phone: normPhone($('reg-phone').value),
      parentPhone: normPhone($('reg-parent-phone').value),
      email: $('reg-email').value.trim(),
      governorate: $('reg-gov').value,
      city: $('reg-city').value.trim(),
      grade: $('reg-grade').value,
      isAzhari: isAzhari,
      password: $('reg-password').value
    };

    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!j.ok) {
        btn.disabled = false;
        btn.innerHTML = 'إتمام التسجيل <i class="fas fa-check"></i>';
        if (j.field) { setErr(j.field, j.error); goStep(j.step || 1); }
        else showAlert('😕', 'حصلت مشكلة', j.error || 'حاول مرة أخرى');
        return;
      }
      pendingUser = { phone: payload.phone, verifyCode: j.verifyCode };
      // رسالة: يجب تأكيد الرقم بتلجرام
      showAlert('📲', 'يجب تأكيد الرقم بتلجرام', 'هل لديك تلجرام على هذا الرقم؟', [
        { text: '<i class="fab fa-telegram-plane"></i> لدي تلجرام — تأكيد الرقم', cls: 'btn-primary', fn: () => { closeAlert(); goTelegramStep(); } },
        { text: 'ليس لدي تلجرام', cls: 'btn-outline', fn: () => { closeAlert(); noTelegramFlow(); } }
      ]);
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = 'إتمام التسجيل <i class="fas fa-check"></i>';
      showAlert('😕', 'خطأ في الاتصال', 'اتأكد من النت وحاول تاني');
    }
  });

  function goTelegramStep() {
    goStep(4);
    const link = 'https://t.me/' + window.__CFG.botUsername + '?start=' + pendingUser.verifyCode;
    $('tg-link').href = link;
    $('tg-waiting').classList.remove('hidden');
    startPolling();
  }

  function noTelegramFlow() {
    showAlert('⚠️', 'تحذير', 'رقمك هيتسجل كغير مؤكد، وهيظهر للإشراف إن الرقم غير مؤكد بتلجرام. تقدر تأكده في أي وقت لاحقًا. هل تريد الإكمال؟', [
      { text: 'الإكمال بدون تأكيد', cls: 'btn-primary', fn: async () => {
          closeAlert();
          await fetch('/api/auth/skip-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: pendingUser.phone }) });
          finishRegistration(false);
        } },
      { text: 'رجوع — سأؤكد بتلجرام', cls: 'btn-outline', fn: () => { closeAlert(); goTelegramStep(); } }
    ]);
  }

  /* polling للتحقق من التأكيد */
  let pollTimer = null;
  function startPolling() {
    stopPolling();
    pollTimer = setInterval(checkVerified, 4000);
  }
  function stopPolling() { if (pollTimer) clearInterval(pollTimer); pollTimer = null; }

  async function checkVerified() {
    if (!pendingUser) return;
    try {
      const r = await fetch('/api/auth/check-verify?phone=' + encodeURIComponent(pendingUser.phone));
      const j = await r.json();
      if (j.verified) { stopPolling(); finishRegistration(true, j.mismatch); }
    } catch (e) { /* ignore */ }
  }
  $('tg-check-btn') && $('tg-check-btn').addEventListener('click', checkVerified);

  $('no-tg-btn').addEventListener('click', noTelegramFlow);

  function finishRegistration(verified, mismatch) {
    if (verified && mismatch) {
      // الرقم اللي أكده تلجرام مختلف عن اللي سجله
      showAlert('🤔', 'الرقم مختلف!', 'الرقم اللي أكدته على تلجرام مش نفس الرقم اللي سجلت بيه. تفضل تغيير رقمك للرقم اللي يدعم تلجرام ولا الإكمال كما أنت؟ (لو أكملت هيظهر للإشراف إن الرقمين مختلفين)', [
        { text: 'تغيير رقمي لرقم التلجرام', cls: 'btn-primary', fn: async () => {
            closeAlert();
            await fetch('/api/auth/use-telegram-phone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: pendingUser.phone }) });
            successAndGo('تم تحديث رقمك وتأكيده ✅');
          } },
        { text: 'الإكمال كما أنا', cls: 'btn-outline', fn: () => { closeAlert(); successAndGo('تم إنشاء حسابك ✅'); } }
      ]);
      return;
    }
    successAndGo(verified ? 'تم تأكيد رقمك وإنشاء حسابك بنجاح ✅' : 'تم إنشاء حسابك (الرقم غير مؤكد) ⚠️');
  }

  function successAndGo(msg) {
    showAlert('🎉', 'مبروك!', msg + ' .. سجل دخولك الآن وابدأ رحلتك', [
      { text: 'تسجيل الدخول', cls: 'btn-primary', fn: () => { closeAlert(); location.href = '/auth?mode=login'; } }
    ]);
  }

  /* ============ Login ============ */
  $('login-btn').addEventListener('click', async () => {
    const phone = normPhone($('login-phone').value);
    const pass = $('login-password').value;
    let ok = setErr('login-phone', validPhone(phone) ? '' : 'رقم هاتف غير صحيح');
    ok = setErr('login-password', pass ? '' : 'اكتب كلمة المرور') && ok;
    if (!ok) return;

    const btn = $('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner mx-auto"></div>';
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: pass, deviceId: getDeviceId() })
      });
      const j = await r.json();
      btn.disabled = false;
      btn.innerHTML = 'تسجيل الدخول <i class="fas fa-arrow-left"></i>';
      if (!j.ok) { showAlert('🔒', 'فشل تسجيل الدخول', j.error || 'بيانات غير صحيحة'); return; }
      localStorage.setItem('session', JSON.stringify(j.session));
      if (j.mustChangePassword) {
        // دخل بكلمة سر مؤقتة → لازم يكتب كلمة سر جديدة قبل ما يكمل
        openChangePassModal(phone);
        return;
      }
      btn.innerHTML = '✅ أهلاً ' + j.session.name.split(' ')[0] + '! جاري الدخول...';
      btn.disabled = true;
      setTimeout(() => { location.href = '/home'; }, 600);
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = 'تسجيل الدخول <i class="fas fa-arrow-left"></i>';
      showAlert('😕', 'خطأ في الاتصال', 'اتأكد من النت وحاول تاني');
    }
  });

  /* forgot password → telegram bot */
  $('forgot-btn').addEventListener('click', () => {
    showAlert('🔑', 'استرجاع كلمة المرور', 'هيفتح معاك بوت التلجرام.. ابعتله رقم هاتف الوالد واسم المستخدم وهو هيتأكد منهم ويبعتلك كلمة المرور', [
      { text: '<i class="fab fa-telegram-plane"></i> فتح البوت', cls: 'btn-primary', fn: () => { window.open('https://t.me/' + window.__CFG.botUsername + '?start=forgot', '_blank'); closeAlert(); } },
      { text: 'إلغاء', cls: 'btn-outline', fn: closeAlert }
    ]);
  });

  /* device id (جهاز واحد لكل حساب) */
  function getDeviceId() {
    let d = localStorage.getItem('device_id');
    if (!d) { d = 'dev_' + crypto.randomUUID(); localStorage.setItem('device_id', d); }
    return d;
  }
})();
