/*!
 * SAMT — "what's new" badge and optional browser notifications.
 *
 * This file tracks nothing and stores nothing about the visitor beyond one
 * timestamp in their own browser: the newest item they have already been shown.
 * No ids, no country lookup, no database writes, so there is nothing to ask
 * consent for.
 */
(function () {
  'use strict';
  if (window.SamtNotify) return;

  var SEEN_KEY = 'samt_seen_ts';

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function db() {
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  function notify(title, body, url) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        var n = new Notification(title, { body: body, tag: 'samt-new' });
        n.onclick = function () { window.focus(); if (url) location.href = url; n.close(); };
      }
    } catch (e) {}
  }

  // The badge needs no permission at all - it is just a link. Clicking it is a
  // real user gesture, so that is where we ask about system notifications
  // rather than popping a prompt at page load.
  function badge(count, url) {
    var el = document.getElementById('samtNewBadge');
    if (!count) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('button');
      el.id = 'samtNewBadge';
      el.type = 'button';
      el.style.cssText = 'position:fixed;bottom:16px;inset-inline-start:16px;z-index:9998;border:0;cursor:pointer;'
        + 'padding:9px 14px;border-radius:999px;font-family:Cairo,system-ui,sans-serif;font-size:12px;'
        + 'font-weight:700;color:#070A12;background:linear-gradient(135deg,#00F5D4,#00BBF9);'
        + 'box-shadow:0 8px 24px rgba(0,245,212,.35)';
      el.addEventListener('click', function () {
        try {
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(function () {});
          }
        } catch (e) {}
        location.href = url || './downloads.html';
      });
      document.body.appendChild(el);
    }
    el.textContent = '🔔 ' + count + (count === 1 ? ' إضافة جديدة' : ' إضافات جديدة');
  }

  function watch() {
    var d = db();
    if (!d) return;
    var seen = parseInt(ls(SEEN_KEY) || '0', 10) || 0;
    var fresh = [];
    var newest = seen;

    function handle(snap, label, url) {
      snap.forEach(function (doc) {
        var x = doc.data() || {};
        var t = x.createdAt || x.updatedAt || 0;
        if (t > newest) newest = t;
        if (seen && t > seen) fresh.push({ label: label, name: x.title || x.name || '', url: url });
      });
    }

    Promise.all([
      d.collection('programs').get().then(function (s) { handle(s, 'برنامج جديد', './downloads.html'); }).catch(function () {}),
      d.collection('courses').get().then(function (s) { handle(s, 'كورس جديد', './courses.html'); }).catch(function () {})
    ]).then(function () {
      if (newest > seen) ss(SEEN_KEY, String(newest));
      if (!seen || !fresh.length) return;          // first ever visit: nothing is "new"
      badge(fresh.length, fresh[0].url);
      notify('جديد في سمت', fresh[0].label + ': ' + fresh[0].name, fresh[0].url);
    });
  }

  window.SamtNotify = {
    ask: function () {
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          return Notification.requestPermission();
        }
      } catch (e) {}
      return Promise.resolve(null);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
