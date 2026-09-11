/*!
 * SAMT — admin identity and shared UI helpers.
 *
 * The site has no visitor accounts: every course and program is open to
 * everyone, and watch progress lives in the visitor's own browser. The only
 * identity here is the administrator's, it is owned by Firebase Auth, and the
 * only way in is admin.html. Nothing on a public page can start a sign-in.
 */
(function () {
  'use strict';

  // ---- تحسينات واجهة عامة (تُحقن في كل الصفحات) ----
  // 1) نعومة عند المرور بالماوس (transitions) على الأزرار والكروت والروابط.
  // 2) إصلاح تباين "الوضع الصباحي/الفاتح": ناف بار أبيض بخط غامق مقروء،
  //    وتصحيح خلفية/ألوان الصفحة والكروت (يبطّل مفعول قواعد CSS الناقصة).
  (function injectSamtUiPolish() {
    try {
      var CSS = [
        '/* smooth hover / interaction */',
        'a, button, .glass-card, .glass-nav, .samt-app, .btn-samt-glow, [class*="hover:"], [onclick], input, select, textarea, label, summary {',
        '  transition: background-color .25s ease, color .25s ease, border-color .25s ease, box-shadow .25s ease, transform .25s ease, opacity .25s ease, filter .25s ease;',
        '}',
        '/* light / morning mode contrast (only when NOT dark) */',
        'html:not(.dark) body { background-color:#F8FAFC !important; color:#0F172A !important; }',
        'html:not(.dark) header, html:not(.dark) .glass-nav {',
        '  background: rgba(255,255,255,.94) !important;',
        '  border-bottom: 1px solid #E2E8F0 !important;',
        '  box-shadow: 0 4px 20px rgba(0,0,0,.05) !important;',
        '  -webkit-backdrop-filter: blur(20px) !important; backdrop-filter: blur(20px) !important;',
        '}',
        'html:not(.dark) header a, html:not(.dark) header button, html:not(.dark) header span,',
        'html:not(.dark) .glass-nav a, html:not(.dark) nav a { color:#0F172A !important; }',
        'html:not(.dark) .glass-card { background:#ffffff !important; border:1px solid #E2E8F0 !important; color:#0F172A !important; }',
        'html:not(.dark) .text-white { color:#0F172A !important; }',
        'html:not(.dark) .text-slate-300, html:not(.dark) .text-slate-400, html:not(.dark) .text-slate-500 { color:#475569 !important; }',
        '/* keep the brand accent readable on white */',
        'html:not(.dark) .text-samt-cyan { color:#0E9AAE !important; }'
      ].join('\n');
      var add = function () {
        if (document.getElementById('samt-ui-polish')) return;
        var s = document.createElement('style');
        s.id = 'samt-ui-polish';
        s.textContent = CSS;
        (document.head || document.documentElement).appendChild(s);
      };
      add();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', add);
      }
    } catch (e) {}
  })();

  var COURSES_KEY = 'samt_admin_courses';

  // Accounts from the old visitor-login system are dead weight now - clear
  // them out of every browser that still carries them.
  try {
    ['samt_user_session', 'samt_registered_users', 'samt_subscribers'].forEach(function (k) {
      if (localStorage.getItem(k) !== null) localStorage.removeItem(k);
    });
  } catch (e) {}

  function fb() {
    return (window.SamtFB && window.SamtFB.available) ? window.SamtFB : null;
  }

  function isAdmin() {
    var f = fb();
    try { return !!(f && f.isAdmin()); } catch (e) { return false; }
  }

  function getCoursesList() {
    try {
      var stored = localStorage.getItem(COURSES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return (window.AgentProData && window.AgentProData.courses) || [];
  }

  function saveCoursesList(courses) {
    try { localStorage.setItem(COURSES_KEY, JSON.stringify(courses)); } catch (e) {}
    if (window.AgentProData) window.AgentProData.courses = courses;
    try {
      var f = fb();
      if (f && f.isAdmin()) {
        return f.syncCoursesToCloud(courses).catch(function (e) {
          console.warn('[SAMT] cloud sync failed', e && e.message);
        });
      }
    } catch (e) {}
    return Promise.resolve();
  }

  function toast(msg, type) {
    var el = document.getElementById('samt-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'samt-toast';
      document.body.appendChild(el);
    }
    var base = 'fixed bottom-6 left-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold '
             + 'transition-all duration-300 transform flex items-center gap-2.5 backdrop-blur-lg border ';
    var skin, icon;
    if (type === 'success') {
      skin = 'bg-emerald-950/95 text-emerald-300 border-emerald-500/40';
      icon = '<i class="fa-solid fa-circle-check text-base text-emerald-400"></i>';
    } else if (type === 'error') {
      skin = 'bg-rose-950/95 text-rose-300 border-rose-500/40';
      icon = '<i class="fa-solid fa-circle-exclamation text-base text-rose-400"></i>';
    } else {
      skin = 'bg-slate-900/95 text-white border-cyan-500/30';
      icon = '<i class="fa-solid fa-bell text-base text-cyan-400"></i>';
    }
    el.className = base + 'translate-y-0 opacity-100 ' + skin;
    el.innerHTML = icon + ' <span></span>';
    el.querySelector('span').textContent = String(msg == null ? '' : msg);
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.add('translate-y-10', 'opacity-0'); }, 4000);
  }

  // The header used to hold a login button and a user menu. There is nothing
  // for a visitor to sign into any more, so the slot stays empty and the link
  // to the admin panel shows only once Firebase says we are the admin.
  function updateChrome() {
    var admin = isAdmin();
    try {
      [].forEach.call(document.querySelectorAll('.samt-auth-slot'), function (s) { s.innerHTML = ''; });
      [].forEach.call(document.querySelectorAll('header a[href*="admin.html"]'), function (a) {
        a.style.display = admin ? '' : 'none';
        a.classList.toggle('hidden', !admin);
      });
    } catch (e) {}
  }

  window.SamtAuth = {
    isAdmin: isAdmin,
    getCurrentUser: function () {
      var f = fb();
      var u = f && f.currentUser && f.currentUser();
      return u ? { name: 'المشرف العام', email: u.email || '', role: 'admin' } : null;
    },
    toast: toast,
    openNewCourseInline: function () { window.location.href = './course-builder.html'; },
    editCourseInline: function (id) { window.location.href = './course-builder.html?edit=' + id; },
    deleteCourseInline: function (id) {
      if (!isAdmin()) { toast('محتاج تسجّل دخول المشرف الأول.', 'error'); return; }
      if (!confirm('هل أنت متأكد من حذف هذا الكورس نهائياً؟')) return;
      var courses = getCoursesList().filter(function (c) { return c.id !== id; });
      Promise.resolve(saveCoursesList(courses)).then(function () {
        toast('تم حذف الكورس بنجاح.', 'info');
        setTimeout(function () { window.location.reload(); }, 300);
      });
    },
    getCoursesList: getCoursesList,
    saveCoursesList: saveCoursesList,
    refresh: updateChrome
  };

  function boot() {
    updateChrome();
    var f = fb();
    if (f && f.onAuthChange) { try { f.onAuthChange(updateChrome); } catch (e) {} }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
