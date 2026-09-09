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
  var PROGRAMS_KEY = 'samt_admin_releases';

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
      syncCoursesToCloud: function () { return Promise.resolve(); },
      syncProgramsToCloud: function () { return Promise.reject(new Error('firebase-offline')); },
      saveProgramAssets: function () { return Promise.reject(new Error('firebase-offline')); },
      loadProgramAssets: function () { return Promise.resolve(null); }
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
  function programsCol() { return db.collection('programs'); }
  // Screenshots live in their own documents so listing programs stays light;
  // a card only fetches its assets once it actually scrolls into view.
  function assetsCol() { return db.collection('programAssets'); }

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

  function writeLocalPrograms(programs) {
    try {
      localStorage.setItem('samt_v2026_clean_slate', 'true');
      localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
      if (window.AgentProData) window.AgentProData.releases = programs;
    } catch (e) {}
  }

  // Firestore -> browser. Unlike courses we do not reload the page: the
  // downloads page listens for the event and re-renders in place.
  function startProgramsMirror() {
    try {
      programsCol().orderBy('createdAt', 'desc').onSnapshot(function (snap) {
        var programs = [];
        snap.forEach(function (docSnap) {
          var pr = docSnap.data() || {};
          pr.id = pr.id || docSnap.id;
          programs.push(pr);
        });
        writeLocalPrograms(programs);
        window.dispatchEvent(new CustomEvent('samt-programs-updated', { detail: programs }));
      }, function (err) {
        console.warn('[SAMT] تعذّر الاستماع للبرامج:', err && err.message);
      });
    } catch (e) {
      console.warn('[SAMT] programs mirror error:', e && e.message);
    }
  }
  startProgramsMirror();

  function requireAdmin() {
    var user = auth.currentUser;
    if (!user || (user.email || '').toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Error('not-admin');
    }
    return null;
  }

  // browser -> Firestore. Uploads all programs and removes the ones that went away.
  function syncProgramsToCloud(programs) {
    if (!programs) {
      try { programs = JSON.parse(localStorage.getItem(PROGRAMS_KEY)) || []; } catch (e) { programs = []; }
    }
    var bad = requireAdmin();
    if (bad) return Promise.reject(bad);
    return programsCol().get().then(function (snap) {
      var batch = db.batch();
      var keepIds = {};
      var now = Date.now();
      programs.forEach(function (pr, i) {
        if (!pr.id) pr.id = 'app-' + now + '-' + i;
        keepIds[pr.id] = true;
        var data = Object.assign({}, pr);
        delete data.shots; // screenshots are stored separately
        if (data.createdAt == null) data.createdAt = now - i;
        data.updatedAt = now;
        batch.set(programsCol().doc(String(pr.id)), data);
      });
      var orphans = [];
      snap.forEach(function (docSnap) {
        if (!keepIds[docSnap.id]) {
          batch.delete(docSnap.ref);
          orphans.push(docSnap.id);
        }
      });
      return batch.commit().then(function () {
        // drop the screenshots of deleted programs too
        return Promise.all(orphans.map(function (id) {
          return assetsCol().doc(id).delete().catch(function () {});
        }));
      });
    });
  }

  function saveProgramAssets(id, assets) {
    var bad = requireAdmin();
    if (bad) return Promise.reject(bad);
    if (!id) return Promise.reject(new Error('no-id'));
    var shots = (assets && assets.shots) || [];
    if (!shots.length) {
      return assetsCol().doc(String(id)).delete().catch(function () {});
    }
    return assetsCol().doc(String(id)).set({ shots: shots, updatedAt: Date.now() });
  }

  function loadProgramAssets(id) {
    if (!id) return Promise.resolve(null);
    return assetsCol().doc(String(id)).get().then(function (d) {
      return d.exists ? (d.data() || null) : null;
    }).catch(function () { return null; });
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
    syncCoursesToCloud: syncCoursesToCloud,
    syncProgramsToCloud: syncProgramsToCloud,
    saveProgramAssets: saveProgramAssets,
    loadProgramAssets: loadProgramAssets
  };
})();
