/*!
 * SAMT — visitor stats, consent gate and new-content notifications.
 *
 * Nothing here runs until the visitor has explicitly agreed. What is stored is
 * a random id kept in their own browser, a two-letter country code, and which
 * program/course they opened. No IP address, no name, no email.
 */
(function () {
  'use strict';
  if (window.SamtStats) return;

  var CONSENT_KEY = 'samt_consent_v1';   // 'yes' | 'no'
  var VID_KEY     = 'samt_vid';          // random, per browser
  var GEO_KEY     = 'samt_geo';          // cached country + timestamp
  var SEEN_KEY    = 'samt_seen_ts';      // newest content already shown
  var GEO_TTL     = 30 * 24 * 3600 * 1000;

  /* ------------------------------------------------------------------ utils */
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  function db() {
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  function consented() { return ls(CONSENT_KEY) === 'yes'; }
  function answered()  { return ls(CONSENT_KEY) === 'yes' || ls(CONSENT_KEY) === 'no'; }

  function visitorId() {
    var v = ls(VID_KEY);
    if (!v) {
      v = (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).replace(/[^a-z0-9]/g, '');
      ss(VID_KEY, v);
    }
    return v;
  }

  /* --------------------------------------------------------------- country */
  // Only the two-letter code is kept. The lookup service sees the visitor's IP
  // the same way any web server does; we never store or forward it.
  function country() {
    try {
      var c = JSON.parse(ls(GEO_KEY) || 'null');
      if (c && c.code && (Date.now() - c.at) < GEO_TTL) return Promise.resolve(c.code);
    } catch (e) {}

    var save = function (code) {
      code = String(code || '').toUpperCase().slice(0, 2) || 'ZZ';
      try { ss(GEO_KEY, JSON.stringify({ code: code, at: Date.now() })); } catch (e) {}
      return code;
    };

    return fetch('https://api.country.is/', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) { return save(j && j.country); })
      .catch(function () {
        return fetch('https://ipapi.co/country/', { cache: 'no-store' })
          .then(function (r) { return r.text(); })
          .then(function (t) { return save(t && t.trim()); })
          .catch(function () { return save('ZZ'); });   // blocked or offline
      });
  }

  function countryName(code) {
    if (!code || code === 'ZZ') return 'غير معروف';
    try { return new Intl.DisplayNames(['ar'], { type: 'region' }).of(code) || code; }
    catch (e) { return code; }
  }

  /* -------------------------------------------------------------- tracking */
  function trackVisit() {
    var d = db();
    if (!d || !consented()) return;
    country().then(function (code) {
      var id = today() + '_' + visitorId();
      d.collection('analytics_visits').doc(id).set({
        day: today(),
        country: code,
        page: location.pathname.split('/').pop() || 'index.html',
        ts: Date.now()
      }, { merge: true }).catch(function () {});
    });
  }

  function trackEvent(type, refId, refName) {
    var d = db();
    if (!d || !consented()) return;
    country().then(function (code) {
      d.collection('analytics_events').add({
        type: type, refId: String(refId || ''), refName: String(refName || ''),
        vid: visitorId(), country: code, day: today(), ts: Date.now()
      }).catch(function () {});
    });
  }

  function trackDownload(app) {
    if (!app) return;
    trackEvent('download', app.id, app.name);
  }

  // Any link marked data-track-download counts, wherever it is rendered.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-track-download]');
    if (!a) return;
    trackEvent('download', a.getAttribute('data-track-id'), a.getAttribute('data-track-name'));
  }, true);

  // One row per (visitor, course) so the average is over people, not page views.
  function trackCourse(courseId, title, percent, completed) {
    var d = db();
    if (!d || !consented() || !courseId) return;
    percent = Math.max(0, Math.min(100, Math.round(percent || 0)));
    country().then(function (code) {
      d.collection('analytics_progress').doc(visitorId() + '_' + courseId).set({
        courseId: String(courseId), courseTitle: String(title || ''),
        vid: visitorId(), percent: percent, completed: !!completed,
        country: code, day: today(), updatedAt: Date.now()
      }, { merge: true }).catch(function () {});
    });
  }

  /* --------------------------------------------------------- consent gate */
  function consentHtml() {
    return '' +
    '<div id="samtConsent" style="position:fixed;inset:auto 0 0 0;z-index:9999;padding:14px 16px;' +
         'background:rgba(7,10,18,.98);border-top:1px solid rgba(0,245,212,.35);' +
         'box-shadow:0 -12px 40px rgba(0,0,0,.6);font-family:Cairo,system-ui,sans-serif" dir="rtl">' +
      '<div style="max-width:900px;margin:0 auto">' +
        '<p style="margin:0 0 10px;font-size:12.5px;line-height:1.9;color:#cbd5e1">' +
          'بنسجّل إحصائيات مجهولة عن استخدام الموقع — عدد الزيارات، الدولة، البرامج اللي بتتحمّل، ' +
          'ونسبة إكمال الكورسات — عشان نحسّن المحتوى. مش بنسجّل اسمك ولا إيميلك ولا عنوان الـ IP. ' +
          '<a href="./privacy.html" style="color:#00F5D4;text-decoration:underline">الشروط وسياسة الخصوصية</a>' +
        '</p>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#e2e8f0;cursor:pointer;margin-bottom:10px">' +
          '<input type="checkbox" id="samtConsentBox" style="width:16px;height:16px;accent-color:#00F5D4;cursor:pointer">' +
          '<span>قرأت ووافقت على الشروط والأحكام وسياسة الخصوصية</span>' +
        '</label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button id="samtConsentYes" disabled style="padding:8px 20px;border-radius:10px;border:0;' +
            'font-size:12px;font-weight:700;font-family:inherit;cursor:not-allowed;opacity:.45;' +
            'background:linear-gradient(135deg,#00F5D4,#00BBF9);color:#070A12">موافق</button>' +
          '<button id="samtConsentNo" style="padding:8px 20px;border-radius:10px;font-size:12px;font-weight:700;' +
            'font-family:inherit;cursor:pointer;background:transparent;color:#94a3b8;' +
            'border:1px solid rgba(255,255,255,.2)">تصفّح بدون إحصائيات</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function showConsent() {
    if (document.getElementById('samtConsent')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = consentHtml();
    var el = wrap.firstChild;
    document.body.appendChild(el);

    var box = el.querySelector('#samtConsentBox');
    var yes = el.querySelector('#samtConsentYes');
    var no  = el.querySelector('#samtConsentNo');

    box.addEventListener('change', function () {
      yes.disabled = !box.checked;
      yes.style.opacity = box.checked ? '1' : '.45';
      yes.style.cursor = box.checked ? 'pointer' : 'not-allowed';
    });
    yes.addEventListener('click', function () {
      ss(CONSENT_KEY, 'yes'); el.remove(); trackVisit(); askNotify();
    });
    no.addEventListener('click', function () { ss(CONSENT_KEY, 'no'); el.remove(); });
  }

  /* --------------------------------------------- new-content notifications */
  function askNotify() {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') Notification.requestPermission().catch(function () {});
    } catch (e) {}
  }

  function notify(title, body, url) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        var n = new Notification(title, { body: body, icon: './assets/img/icon-192.png', tag: 'samt-new' });
        n.onclick = function () { window.focus(); if (url) location.href = url; n.close(); };
      }
    } catch (e) {}
  }

  function badge(count) {
    var el = document.getElementById('samtNewBadge');
    if (!count) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('a');
      el.id = 'samtNewBadge';
      el.href = './downloads.html';
      el.style.cssText = 'position:fixed;bottom:16px;inset-inline-start:16px;z-index:9998;' +
        'padding:9px 14px;border-radius:999px;font-family:Cairo,system-ui,sans-serif;font-size:12px;' +
        'font-weight:700;text-decoration:none;color:#070A12;background:linear-gradient(135deg,#00F5D4,#00BBF9);' +
        'box-shadow:0 8px 24px rgba(0,245,212,.35)';
      document.body.appendChild(el);
    }
    el.textContent = '🔔 ' + count + ' إضافة جديدة';
  }

  // Watches both collections and reports anything created after the newest item
  // this browser has already been shown. Works with no permission at all (the
  // badge); the system notification is the bonus when permission is granted.
  function watchNewContent() {
    var d = db();
    if (!d) return;
    var seen = parseInt(ls(SEEN_KEY) || '0', 10) || 0;
    var fresh = [];

    function handle(snap, label, url) {
      var newest = seen;
      snap.forEach(function (doc) {
        var x = doc.data() || {};
        var t = x.createdAt || x.updatedAt || 0;
        if (t > newest) newest = t;
        if (seen && t > seen) fresh.push({ label: label, name: x.title || x.name || '', url: url });
      });
      if (newest > (parseInt(ls(SEEN_KEY) || '0', 10) || 0)) ss(SEEN_KEY, String(newest));
      if (!seen) return;                       // first ever visit: nothing is "new"
      if (fresh.length) {
        badge(fresh.length);
        notify('جديد في سمت', fresh[0].label + ': ' + fresh[0].name, fresh[0].url);
      }
    }

    d.collection('programs').get()
      .then(function (s) { handle(s, 'برنامج جديد', './downloads.html'); }).catch(function () {});
    d.collection('courses').get()
      .then(function (s) { handle(s, 'كورس جديد', './courses.html'); }).catch(function () {});
  }

  /* ------------------------------------------------------------------ boot */
  function boot() {
    if (!answered()) { showConsent(); }
    else if (consented()) { trackVisit(); }
    watchNewContent();
  }

  window.SamtStats = {
    consented: consented,
    trackDownload: trackDownload,
    trackCourse: trackCourse,
    trackEvent: trackEvent,
    countryName: countryName,
    askNotify: askNotify,
    reopenConsent: function () { try { localStorage.removeItem(CONSENT_KEY); } catch (e) {} showConsent(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
