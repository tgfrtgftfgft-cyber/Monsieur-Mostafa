/* منصة مسيو مصطفى - الواجهة العامة */
(function () {
  'use strict';

  /* ===== Navbar scroll ===== */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('show', y > 600);
  }, { passive: true });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ===== Mobile menu ===== */
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const openMenu = () => { mobileMenu.classList.add('open'); menuOverlay.classList.remove('hidden'); };
  const closeMenu = () => { mobileMenu.classList.remove('open'); menuOverlay.classList.add('hidden'); };
  document.getElementById('menu-btn').addEventListener('click', openMenu);
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ===== Reveal on scroll ===== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-right, .reveal-left, .reveal-scale').forEach(el => io.observe(el));

  /* ===== Typing effect ===== */
  const typedEl = document.getElementById('typed-text');
  if (typedEl) {
    const phrases = [
      'اتعلم الفرنسية بسهولة 🇫🇷',
      'شرح مبسط وواضح ✨',
      'تأسيس قوي للفهم والتحدث 💬',
      'نتائج مضمونة بإذن الله 🏆'
    ];
    let pi = 0, ci = 0, deleting = false;
    (function type() {
      const current = phrases[pi];
      typedEl.textContent = current.slice(0, ci);
      if (!deleting) {
        if (ci < current.length) { ci++; setTimeout(type, 65); }
        else { deleting = true; setTimeout(type, 1800); }
      } else {
        if (ci > 0) { ci--; setTimeout(type, 30); }
        else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 350); }
      }
    })();
  }

  /* ===== Counters ===== */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counterIO.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.round(val).toLocaleString('en') : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));

  /* ===== Coming soon modal (auth + social placeholders) ===== */
  const modal = document.getElementById('coming-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMsg = document.getElementById('modal-msg');

  window.showComing = function (title, msg) {
    modalTitle.textContent = title;
    modalMsg.textContent = msg;
    modal.classList.add('open');
  };
  window.closeModal = function () { modal.classList.remove('open'); };
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ===== Courses carousel arrows ===== */
  const track = document.getElementById('courses-track');
  if (track) {
    const step = () => Math.min(track.clientWidth * 0.8, 430);
    const prev = document.getElementById('courses-prev');
    const next = document.getElementById('courses-next');
    /* RTL: scrolling "next" moves left (negative) */
    if (next) next.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* Social links: only open if a real URL is configured */
  document.querySelectorAll('[data-social]').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      const name = card.dataset.social;
      if (url && url !== '') window.open(url, '_blank');
      else showComing('صفحة ' + name, 'لا توجد صفحة ' + name + ' مضافة حاليًا، هيتم إضافتها قريبًا من الإدارة.');
    });
  });

  /* Grade cards → courses coming soon */
  document.querySelectorAll('[data-grade]').forEach(card => {
    card.addEventListener('click', () => {
      showComing('كورسات ' + card.dataset.grade + ' 📚', 'الكورسات هتنزل قريبًا جدًا.. سجل حسابك أول ما التسجيل يفتح عشان تحجز مكانك! 🇫🇷');
    });
  });

  /* Course cards buttons */
  document.querySelectorAll('[data-course]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showComing('الاشتراك في الكورس 🎓', 'الاشتراك هيفتح مع بداية الترم.. جهز نفسك وتابعنا عشان تعرف ميعاد الفتح!');
    });
  });

  /* ===== Parallax hero image (subtle) ===== */
  const heroImg = document.getElementById('hero-teacher-img');
  if (heroImg && window.matchMedia('(min-width: 1024px)').matches) {
    document.getElementById('hero-section').addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      heroImg.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
})();
