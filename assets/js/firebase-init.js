/**
 * ==========================================================================
 * سمت SAMT - ربط فايربيز: تسجيل دخول المشرف + مشاركة الكورسات عبر Firestore
 * ==========================================================================
 * - قاعدة بيانات سحابية للكورسات: أي كورس يضيفه المشرف يظهر لكل الزوار فوراً.
 * - تسجيل دخول المشرف عبر Firebase Authentication (كلمة السر مش مخزّنة في الكود).
 * - آمن بالفشل: لو فايربيز مش متاح، الموقع يشتغل بالوضع المحلي زي ما هو.
 */
(function () {
  'use strict';

  var CONFIG = {
    apiKey: "AIzaSyBSJVBN9zyjpS7A8PHX_x2m6_VjO5UzSK0",
    authDomain: "samt-platform.firebaseapp.com",
    projectId: "samt-platform",
    storageBucket: "samt-platform.firebasestorage.app",
    messagingSenderId: "297846061850",
    appId: "1:297846061850:web:eafc520daa8b67b0c58aa3"
  };
  var ADMIN_EMAIL = 'sbilalsamirss@gmail.com';
  var COURSES_KEY = 'samt_admin_courses';
  var SIG_KEY = 'samt_courses_sig';

  function offlineStub(reason) {
    console.warn('[SAMT] Firebase غير متاح (' + reason + ') — الوضع المحلي.');
    window.SamtFB = {
      available: false,
      ADMIN_EMAIL: ADMIN_EMAIL,
      isAdmin: function () { return false; },
      currentUser: function () { return null; },
      onAuthChange: function () {},
      adminSignIn: function () { return Promise.reject(new Error('firebase-offline')); },
      signOut: function () { return Promise.resolve(); },
      syncCoursesToCloud: function () { return Promise.resolve(); }
    };
  }

  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    return offlineStub('SDK not loaded');
  }

  var auth, db;
  try {
    firebase.initializeApp(CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    // إبقاء جلسة المشرف بعد إعادة تحميل الصفحة
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function () {});
  } catch (e) {
    return offlineStub('init failed: ' + (e && e.message));
  }

  function coursesCol() { return db.collection('courses'); }

  function signatureOf(courses) {
    return (courses || []).map(function (c) {
      return (c.id || '') + ':' + (c.updatedAt || c.title || '');
    }).join('|');
  }

  function writeLocalCourses(courses) {
    try {
      // منع صفحات الموقع من مسح البيانات عند التحميل
      localStorage.setItem('samt_v2026_clean_slate', 'true');
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
      if (window.AgentProData) window.AgentProData.courses = courses;
    } catch (e) {}
  }

  // مزامنة القراءة: Firestore -> المتصفح (لحظية). عند تغيّر البيانات نعيد التحميل مرة واحدة.
  function startCoursesMirror() {
    try {
      coursesCol().orderBy('createdAt', 'desc').onSnapshot(function (snap) {
        var courses = [];
        snap.forEach(function (docSnap) {
          var c = docSnap.data() || {};
          c.id = c.id || docSnap.id;
          courses.push(c);
        });
        var newSig = signatureOf(courses);
        var prevSig = '';
        try { prevSig = localStorage.getItem(SIG_KEY) || ''; } catch (e) {}
        writeLocalCourses(courses);
        try { localStorage.setItem(SIG_KEY, newSig); } catch (e) {}
        window.dispatchEvent(new CustomEvent('samt-courses-updated', { detail: courses }));
        if (newSig !== prevSig && !window.__samtReloadedForCourses) {
          window.__samtReloadedForCourses = true;
          setTimeout(function () { try { location.reload(); } catch (e) {} }, 60);
        }
      }, function (err) {
        console.warn('[SAMT] تعذّر الاستماع للكورسات:', err && err.message);
      });
    } catch (e) {
      console.warn('[SAMT] mirror error:', e && e.message);
    }
  }
  startCoursesMirror();

  // مزامنة الكتابة: المتصفح -> Firestore (تحتاج تسجيل دخول المشرف). ترفع الكل وتحذف الزائد.
  function syncCoursesToCloud(courses) {
    if (!courses) {
      try { courses = JSON.parse(localStorage.getItem(COURSES_KEY)) || []; } catch (e) { courses = []; }
    }
    var user = auth.currentUser;
    if (!user || (user.email || '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return Promise.reject(new Error('not-admin'));
    }
    return coursesCol().get().then(function (snap) {
      var batch = db.batch();
      var keepIds = {};
      var now = Date.now();
      courses.forEach(function (c, i) {
        if (!c.id) c.id = 'course-' + now + '-' + i;
        keepIds[c.id] = true;
        var data = Object.assign({}, c);
        if (data.createdAt == null) data.createdAt = now - i; // ترتيب ثابت
        data.updatedAt = now;
        batch.set(coursesCol().doc(String(c.id)), data);
      });
      snap.forEach(function (docSnap) {
        if (!keepIds[docSnap.id]) batch.delete(docSnap.ref);
      });
      return batch.commit();
    });
  }

  window.SamtFB = {
    available: true,
    ADMIN_EMAIL: ADMIN_EMAIL,
    auth: auth,
    db: db,
    isAdmin: function () {
      var u = auth.currentUser;
      return !!(u && (u.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase());
    },
    currentUser: function () { return auth.currentUser; },
    onAuthChange: function (cb) { return auth.onAuthStateChanged(cb); },
    adminSignIn: function (email, password) {
      return auth.signInWithEmailAndPassword((email || '').trim(), (password || '').trim());
    },
    signOut: function () { return auth.signOut(); },
    syncCoursesToCloud: syncCoursesToCloud
  };
})();
