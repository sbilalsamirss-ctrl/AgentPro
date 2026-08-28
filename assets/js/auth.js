/**
 * ==========================================================================
 * سمت SAMT - محرك المصادقة، إعدادات الحساب، وحذف الحساب نهائياً
 * ==========================================================================
 * 1. تسجيل الدخول الموحد للعملاء والمشرفين.
 * 2. نافذة إعدادات الحساب الشاملة (تعديل الاسم، تغيير الإيميل، تغيير الباسوورد).
 * 3. خاصية حذف الحساب والبريد نهائياً (Delete Account & Data).
 * 4. إرسال كود التحقق OTP إلى البريد الحقيقي + إخفاء الكود من الشاشة.
 * 5. أزرار إظهار وإخفاء الباسوورد بالعين 👁️.
 * 6. قائمة منسدلة ثابتة 100% بالضغط (Click-to-Toggle).
 */

(function () {
  'use strict';

  // إعدادات خدمة البريد الإلكتروني الحقيقي (EmailJS)
  const EMAIL_SERVICE_CONFIG = {
    SERVICE_ID: 'service_samt',
    TEMPLATE_ID: 'template_samt_otp',
    PUBLIC_KEY: '',
    ENABLED: false
  };

  // الإعدادات الافتراضية لحساب المشرف الرئيسي
  const MASTER_ADMIN = {
    name: 'المشرف العام',
    email: 'admin@samt.com',
    password: 'admin1234',
    role: 'admin',
    avatar: '👑',
    emailVerified: true,
    notificationsEnabled: true
  };

  const MASTER_ADMIN_PASSCODE = 'SAMT-ADMIN-2026';

  const STORAGE_KEYS = {
    SESSION: 'samt_user_session',
    USERS: 'samt_registered_users',
    COURSES: 'samt_admin_courses',
    SUBSCRIBERS: 'samt_subscribers'
  };

  let pendingRegistration = null;

  function initUsers() {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch (e) {
      users = [];
    }

    const adminExists = users.some(u => u.email.toLowerCase() === MASTER_ADMIN.email.toLowerCase());
    if (!adminExists) {
      users.push(MASTER_ADMIN);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  }

  async function dispatchRealOtpEmail(recipientEmail, recipientName, otpCode) {
    if (EMAIL_SERVICE_CONFIG.PUBLIC_KEY && EMAIL_SERVICE_CONFIG.PUBLIC_KEY.trim() !== '') {
      try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAIL_SERVICE_CONFIG.SERVICE_ID,
            template_id: EMAIL_SERVICE_CONFIG.TEMPLATE_ID,
            user_id: EMAIL_SERVICE_CONFIG.PUBLIC_KEY,
            template_params: {
              to_email: recipientEmail,
              to_name: recipientName,
              otp_code: otpCode,
              app_name: 'منظومة سمت SAMT'
            }
          })
        });
        if (response.ok) {
          console.log('✅ تم إرسال كود التحقق بنجاح إلى البريد الإلكتروني.');
          return true;
        }
      } catch (err) {
        console.warn('تعذر الإرسال عبر السيرفر الخارجي، جاري العمل بالوضع المحلي:', err);
      }
    }
    return false;
  }

  const SamtAuth = {
    MASTER_ADMIN_EMAIL: MASTER_ADMIN.email,

    getCurrentUser: function () {
      try {
        const session = localStorage.getItem(STORAGE_KEYS.SESSION);
        return session ? JSON.parse(session) : null;
      } catch (e) {
        return null;
      }
    },

    isAdmin: function () {
      const user = this.getCurrentUser();
      return user !== null && user.role === 'admin';
    },

    login: function (email, password) {
      const users = initUsers();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
      if (user) {
        const sessionData = {
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.role === 'admin' ? '👑' : '👤',
          emailVerified: user.emailVerified !== undefined ? user.emailVerified : true,
          notificationsEnabled: user.notificationsEnabled !== undefined ? user.notificationsEnabled : true,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
      }
      return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    },

    startRegister: function (name, email, password, confirmPassword, adminPasscode) {
      const users = initUsers();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();
      const cleanPass = (password || '').trim();
      const cleanConfirmPass = (confirmPassword || '').trim();

      if (!cleanEmail || !cleanPass || !cleanName || !cleanConfirmPass) {
        return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة.' };
      }

      if (cleanPass !== cleanConfirmPass) {
        return { success: false, message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين!' };
      }

      if (cleanPass.length < 6) {
        return { success: false, message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.' };
      }

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'هذا البريد الإلكتروني مسجل مسبقاً.' };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const isGrantingAdmin = adminPasscode && adminPasscode.trim() === MASTER_ADMIN_PASSCODE;

      pendingRegistration = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: isGrantingAdmin ? 'admin' : 'user',
        avatar: isGrantingAdmin ? '👑' : '👤',
        otp: otpCode,
        notificationsEnabled: true,
        createdAt: Date.now()
      };

      dispatchRealOtpEmail(cleanEmail, cleanName, otpCode);

      return {
        success: true,
        email: cleanEmail,
        otp: otpCode,
        isAdmin: isGrantingAdmin
      };
    },

    verifyAndCompleteRegister: function (enteredOtp) {
      if (!pendingRegistration) {
        return { success: false, message: 'انتهت صلاحية جلسة التسجيل، يرجى إعادة المحاولة.' };
      }

      const cleanEntered = (enteredOtp || '').trim();
      if (cleanEntered !== pendingRegistration.otp) {
        return { success: false, message: 'رمز التحقق غير صحيح، يرجى مراجعة البريد والمحاولة ثانية.' };
      }

      const users = initUsers();
      const newUser = {
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        role: pendingRegistration.role,
        avatar: pendingRegistration.avatar,
        emailVerified: true,
        notificationsEnabled: true,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      try {
        let subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || window.AgentProData?.subscribers || [];
        if (!subs.some(s => s.email.toLowerCase() === newUser.email.toLowerCase())) {
          subs.unshift({
            name: newUser.name,
            email: newUser.email,
            date: new Date().toISOString().split('T')[0]
          });
          localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));
        }
      } catch (e) {}

      const sessionData = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        emailVerified: true,
        notificationsEnabled: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      const isAdm = newUser.role === 'admin';
      pendingRegistration = null;

      return {
        success: true,
        user: sessionData,
        message: isAdm ? 'تم تأكيد البريد وإنشاء حساب المشرف (Admin) بنجاح! 👑' : 'تم تأكيد البريد الإلكتروني وتفعيل الإشعارات بنجاح! 🎉'
      };
    },

    // حفظ تعديلات الملف الشخصي (الاسم والبريد الإلكتروني)
    updateProfile: function (newName, newEmail) {
      const user = this.getCurrentUser();
      if (!user) return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };

      const cleanName = (newName || '').trim();
      const cleanEmail = (newEmail || '').trim().toLowerCase();

      if (!cleanName || !cleanEmail) {
        return { success: false, message: 'يرجى ملء جميع الحقول.' };
      }

      let users = initUsers();
      // التحقق إن كان الإيميل الجديد مستخدماً من حساب آخر
      const emailTaken = users.some(u => u.email.toLowerCase() === cleanEmail && u.email.toLowerCase() !== user.email.toLowerCase());
      if (emailTaken) {
        return { success: false, message: 'هذا البريد الإلكتروني مستخدم لحساب آخر.' };
      }

      const oldEmail = user.email.toLowerCase();

      // تحديث في جدول المستخدمين
      const userIdx = users.findIndex(u => u.email.toLowerCase() === oldEmail);
      if (userIdx !== -1) {
        users[userIdx].name = cleanName;
        users[userIdx].email = cleanEmail;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // تحديث في جدول المشتركين
      try {
        let subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || [];
        subs = subs.map(s => s.email.toLowerCase() === oldEmail ? { ...s, name: cleanName, email: cleanEmail } : s);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));
      } catch (e) {}

      // تحديث الجلسة
      user.name = cleanName;
      user.email = cleanEmail;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));

      return { success: true, message: 'تم تحديث بيانات الحساب والبريد بنجاح!' };
    },

    // تغيير كلمة المرور
    updatePassword: function (oldPass, newPass, confirmPass) {
      const user = this.getCurrentUser();
      if (!user) return { success: false, message: 'يرجى تسجيل الدخول أولاً.' };

      const cleanOld = (oldPass || '').trim();
      const cleanNew = (newPass || '').trim();
      const cleanConfirm = (confirmPass || '').trim();

      if (!cleanOld || !cleanNew || !cleanConfirm) {
        return { success: false, message: 'يرجى ملء جميع حقول كلمة المرور.' };
      }

      if (cleanNew !== cleanConfirm) {
        return { success: false, message: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين!' };
      }

      if (cleanNew.length < 6) {
        return { success: false, message: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف.' };
      }

      let users = initUsers();
      const uIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (uIdx === -1 || users[uIdx].password !== cleanOld) {
        return { success: false, message: 'كلمة المرور الحالية غير صحيحة!' };
      }

      users[uIdx].password = cleanNew;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return { success: true, message: 'تم تغيير كلمة المرور بنجاح!' };
    },

    // حذف الحساب والبريد نهائياً (Delete Account)
    deleteCurrentAccount: function () {
      const user = this.getCurrentUser();
      if (!user) return;

      const confirmMsg = `هل أنت متأكد تماماً من حذف حسابك (${user.email}) نهائياً؟\n\nسيتم مسح بياناتك واشتراكاتك بالكامل ولا يمكن التراجع عن هذا الإجراء.`;
      if (!confirm(confirmMsg)) return;

      const targetEmail = user.email.toLowerCase();

      // حذف من المستخدمين
      let users = initUsers();
      users = users.filter(u => u.email.toLowerCase() !== targetEmail);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // حذف من المشتركين
      try {
        let subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || [];
        subs = subs.filter(s => s.email.toLowerCase() !== targetEmail);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));
      } catch (e) {}

      // مسح الجلسة
      localStorage.removeItem(STORAGE_KEYS.SESSION);

      this.toast('تم حذف حسابك وإلغاء تسجيل البريد الإلكتروني بنجاح 🗑️', 'info');
      setTimeout(() => {
        window.location.href = './index.html';
      }, 700);
    },

    toggleNotifications: function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const user = this.getCurrentUser();
      if (!user) return;

      const currentStatus = user.notificationsEnabled !== false;
      const newStatus = !currentStatus;

      user.notificationsEnabled = newStatus;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));

      let users = initUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        users[idx].notificationsEnabled = newStatus;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      if (newStatus) {
        this.toast('تم تفعيل إشعارات البريد الإلكتروني للتحديثات 🔔', 'success');
      } else {
        this.toast('تم إيقاف استلام إشعارات البريد 🔕', 'info');
      }

      updateNavbars();
    },

    logout: function () {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.location.reload();
    },

    toast: function (msg, type = 'info') {
      let toastEl = document.getElementById('samt-toast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'samt-toast';
        toastEl.className = 'fixed bottom-6 left-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2.5 backdrop-blur-lg border';
        document.body.appendChild(toastEl);
      }

      if (type === 'success') {
        toastEl.className = 'fixed bottom-6 left-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2.5 backdrop-blur-lg border bg-emerald-950/95 text-emerald-300 border-emerald-500/40';
        toastEl.innerHTML = `<i class="fa-solid fa-circle-check text-base text-emerald-400"></i> <span>${msg}</span>`;
      } else if (type === 'error') {
        toastEl.className = 'fixed bottom-6 left-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2.5 backdrop-blur-lg border bg-rose-950/95 text-rose-300 border-rose-500/40';
        toastEl.innerHTML = `<i class="fa-solid fa-circle-exclamation text-base text-rose-400"></i> <span>${msg}</span>`;
      } else {
        toastEl.className = 'fixed bottom-6 left-6 z-[99999] px-5 py-3 rounded-xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2.5 backdrop-blur-lg border bg-slate-900/95 text-white border-cyan-500/30';
        toastEl.innerHTML = `<i class="fa-solid fa-bell text-base text-cyan-400"></i> <span>${msg}</span>`;
      }

      setTimeout(() => {
        toastEl.classList.add('translate-y-10', 'opacity-0');
      }, 4000);
    }
  };

  // حقن نافذة تسجيل الدخول وإنشاء الحساب
  function injectAuthModal() {
    if (document.getElementById('samtAuthModal')) return;

    const modalHTML = `
    <div id="samtAuthModal" class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
      <div class="glass-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/15 text-right bg-[#0B132B]">
        
        <!-- Header -->
        <div class="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-lg font-black font-cairo text-white">سَـمْـت</span>
            <span class="text-sm font-extrabold text-samt-cyan font-readex">SAMT</span>
          </div>
          <button type="button" onclick="window.SamtAuth.closeAuthModal()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Auth Tabs -->
        <div id="authTabsHeader" class="flex border-b border-white/10 bg-black/20 text-xs font-bold">
          <button type="button" id="authTabLogin" onclick="window.SamtAuth.switchAuthTab('login')" class="flex-1 py-3 text-center border-b-2 border-samt-cyan text-samt-cyan transition-colors">
            <i class="fa-solid fa-right-to-bracket ml-1"></i> تسجيل الدخول
          </button>
          <button type="button" id="authTabRegister" onclick="window.SamtAuth.switchAuthTab('register')" class="flex-1 py-3 text-center border-b-2 border-transparent text-slate-400 hover:text-white transition-colors">
            <i class="fa-solid fa-user-plus ml-1"></i> حساب جديد
          </button>
        </div>

        <!-- Form Area -->
        <div class="p-6 space-y-4">
          
          <!-- 1. LOGIN FORM -->
          <form id="samtLoginForm" onsubmit="window.SamtAuth.handleLoginSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">البريد الإلكتروني:</label>
              <div class="relative">
                <input type="email" id="authLoginEmail" required placeholder="admin@samt.com" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-3 pr-10 pl-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold font-cairo text-slate-300">كلمة المرور:</label>
                <button type="button" onclick="window.SamtAuth.fillDemoAdmin()" class="text-[10px] text-samt-cyan hover:underline font-bold">تجربة حساب الأدمن</button>
              </div>
              <div class="relative">
                <input type="password" id="authLoginPassword" required placeholder="••••••••" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-3 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authLoginPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="إظهار/إخفاء كلمة المرور">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div id="authLoginError" class="hidden p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>

            <button type="submit" class="btn-samt-glow w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              <span>دخول إلى المنظومة</span>
            </button>
          </form>

          <!-- 2. REGISTER FORM -->
          <form id="samtRegisterForm" onsubmit="window.SamtAuth.handleRegisterSubmit(event)" class="space-y-3.5 hidden">
            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">الاسم الكامل:</label>
              <div class="relative">
                <input type="text" id="authRegName" required placeholder="مثال: بلال سمير" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-3 outline-none bg-black/40 text-white" />
                <i class="fa-solid fa-user absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">البريد الإلكتروني:</label>
              <div class="relative">
                <input type="email" id="authRegEmail" required placeholder="name@gmail.com" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">كلمة المرور:</label>
              <div class="relative">
                <input type="password" id="authRegPassword" required placeholder="6 أحرف فأكثر" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="إظهار/إخفاء كلمة المرور">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">أعد كتابة كلمة المرور:</label>
              <div class="relative">
                <input type="password" id="authRegConfirmPassword" required placeholder="تأكيد كلمة المرور" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-shield-check absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegConfirmPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="إظهار/إخفاء كلمة المرور">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <!-- Optional Admin Upgrade Code -->
            <div>
              <label class="block text-[11px] font-semibold mb-1 font-cairo text-slate-400">
                رمز الصلاحية الإدارية (اختياري للمشرفين):
              </label>
              <div class="relative">
                <input type="password" id="authRegAdminCode" placeholder="كود المشرف: SAMT-ADMIN-2026" class="w-full glass-card border border-white/10 focus:border-samt-gold text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left font-mono bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-crown absolute right-3.5 top-1/2 -translate-y-1/2 text-yellow-500/70 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegAdminCode', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 text-xs p-1 focus:outline-none" title="إظهار/إخفاء الكود">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div id="authRegError" class="hidden p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>

            <button type="submit" class="btn-samt-glow w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid fa-paper-plane"></i>
              <span>متابعة والتحقق من البريد</span>
            </button>
          </form>

          <!-- 3. EMAIL VERIFICATION OTP STEP -->
          <div id="samtOtpStep" class="hidden space-y-5 text-center py-2">
            <div class="w-16 h-16 rounded-2xl bg-samt-cyan/10 border border-samt-cyan/30 text-samt-cyan text-3xl flex items-center justify-center mx-auto shadow-inner">
              <i class="fa-solid fa-envelope-circle-check animate-pulse"></i>
            </div>

            <div>
              <h3 class="text-base font-bold font-cairo text-white">تحقق من بريدك الإلكتروني</h3>
              <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                تم إرسال رمز التحقق المكون من 6 أرقام إلى:
                <br>
                <strong id="otpTargetEmail" class="text-samt-cyan font-mono text-xs"></strong>
              </p>
              <p class="text-[11px] text-slate-400 mt-2 bg-white/5 py-2 px-3 rounded-xl border border-white/10">
                📩 يرجى فتح صندوق الوارد في بريدك (أو مجلد Spam) ونسخ الرمز هنا.
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold mb-2 font-cairo text-slate-300">أدخل رمز التحقق (OTP):</label>
              <input type="text" id="otpInput" maxlength="6" placeholder="------" class="w-full glass-card border border-white/20 focus:border-samt-cyan text-center text-2xl font-mono tracking-[0.5em] font-black rounded-xl py-3 outline-none bg-black/60 text-samt-cyan shadow-inner" />
            </div>

            <div id="otpError" class="hidden p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>

            <div class="flex items-center gap-2 pt-2">
              <button type="button" onclick="window.SamtAuth.resendOtp()" class="flex-1 py-2.5 rounded-xl glass-card text-xs font-bold text-slate-300 hover:text-white bg-white/5">
                <i class="fa-solid fa-rotate-right ml-1"></i> إعادة إرسال
              </button>
              <button type="button" onclick="window.SamtAuth.submitOtpVerification()" class="flex-1 btn-samt-glow py-2.5 rounded-xl text-xs font-bold">
                <i class="fa-solid fa-check ml-1"></i> تأكيد وتفعيل
              </button>
            </div>

            <button type="button" onclick="window.SamtAuth.switchAuthTab('register')" class="text-[11px] text-slate-400 hover:text-white underline">
              تعديل بيانات التسجيل
            </button>
          </div>

        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // نافذة إعدادات وتعديل الحساب وحذف الإيميل (User Account Settings Modal)
  function injectUserSettingsModal() {
    if (document.getElementById('samtUserSettingsModal')) return;

    const modalHTML = `
    <div id="samtUserSettingsModal" class="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
      <div class="glass-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/15 text-right bg-[#0B132B]">
        
        <!-- Header -->
        <div class="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-samt-cyan text-lg"><i class="fa-solid fa-user-gear"></i></span>
            <h3 class="text-sm font-bold font-cairo text-white">إعدادات الحساب والبريد الإلكتروني</h3>
          </div>
          <button type="button" onclick="window.SamtAuth.closeUserSettingsModal()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <!-- 1. EDIT PROFILE FORM -->
          <form onsubmit="window.SamtAuth.handleProfileUpdateSubmit(event)" class="space-y-3.5">
            <h4 class="text-xs font-extrabold text-samt-cyan flex items-center gap-1.5 pb-1 border-b border-white/10">
              <i class="fa-solid fa-id-card"></i> البيانات الشخصية
            </h4>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">الاسم الكامل:</label>
              <input type="text" id="settingsUserName" required class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">البريد الإلكتروني:</label>
              <input type="email" id="settingsUserEmail" required class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
            </div>

            <div class="flex justify-end pt-1">
              <button type="submit" class="btn-samt-glow px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <i class="fa-solid fa-floppy-disk"></i>
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>

          <!-- 2. CHANGE PASSWORD FORM -->
          <form onsubmit="window.SamtAuth.handlePasswordChangeSubmit(event)" class="space-y-3.5 pt-3 border-t border-white/10">
            <h4 class="text-xs font-extrabold text-yellow-400 flex items-center gap-1.5 pb-1 border-b border-white/10">
              <i class="fa-solid fa-lock"></i> تغيير كلمة المرور
            </h4>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">كلمة المرور الحالية:</label>
              <div class="relative">
                <input type="password" id="settingsCurrentPass" required placeholder="••••••••" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsCurrentPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">كلمة المرور الجديدة:</label>
              <div class="relative">
                <input type="password" id="settingsNewPass" required placeholder="6 أحرف فأكثر" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsNewPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">تأكيد كلمة المرور الجديدة:</label>
              <div class="relative">
                <input type="password" id="settingsConfirmNewPass" required placeholder="إعادة كتابة كلمة المرور الجديدة" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsConfirmNewPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div class="flex justify-end pt-1">
              <button type="submit" class="px-5 py-2.5 rounded-xl glass-card text-yellow-400 hover:border-yellow-400 text-xs font-bold flex items-center gap-2 border border-yellow-500/30">
                <i class="fa-solid fa-key"></i>
                <span>تحديث كلمة المرور</span>
              </button>
            </div>
          </form>

          <!-- 3. DANGER ZONE (DELETE ACCOUNT) -->
          <div class="pt-4 border-t border-rose-500/20">
            <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3">
              <div class="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>منطقة الخطر (Danger Zone)</span>
              </div>
              <p class="text-[11px] text-rose-200/70 leading-relaxed">
                عند حذف حسابك، سيتم مسح بريدك الإلكتروني وبياناتك واشتراكاتك بالكامل من النظام ولن تتمكن من استرجاعها.
              </p>
              <div class="flex justify-end pt-1">
                <button type="button" onclick="window.SamtAuth.deleteCurrentAccount()" class="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5">
                  <i class="fa-solid fa-trash-can"></i>
                  <span>حذف الحساب والبريد نهائياً</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // نافذة إضافة / تعديل كورس فوري من المتصفح
  function injectCourseModal() {
    if (document.getElementById('samtInlineCourseModal')) return;

    const modalHTML = `
    <div id="samtInlineCourseModal" class="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
      <div class="glass-card rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-white/15 text-right bg-[#0B132B]">
        
        <div class="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-samt-gold text-lg"><i class="fa-solid fa-pen-to-square"></i></span>
            <h3 id="inlineModalTitle" class="text-sm font-bold font-cairo text-white">إضافة كورس جديد</h3>
          </div>
          <button type="button" onclick="window.SamtAuth.closeInlineCourseModal()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="inlineCourseForm" onsubmit="window.SamtAuth.handleInlineCourseSave(event)" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <input type="hidden" id="inlineCourseId" />

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">عنوان الكورس / الدرس:</label>
            <input type="text" id="inlineFormTitle" required placeholder="مثال: أسرار التصفح السريع والإنتاجية" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">التصنيف:</label>
              <select id="inlineFormCategory" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white">
                <option value="basics">دليل المبتدئين</option>
                <option value="productivity">الإنتاجية والتنظيم</option>
                <option value="analytics">التحليلات والـ KPIs</option>
                <option value="database">قواعد البيانات</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">المستوى:</label>
              <select id="inlineFormLevel" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white">
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="شامل">شامل</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">المدة:</label>
              <input type="text" id="inlineFormDuration" placeholder="10:30" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">رابط الفيديو (YouTube Embed أو Watch):</label>
            <input type="text" id="inlineFormVideoUrl" required placeholder="https://www.youtube.com/watch?v=..." class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">الوصف والشرح:</label>
            <textarea id="inlineFormDesc" rows="3" placeholder="ملخص ما يتعلمه الطالب في هذا الكورس..." class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white"></textarea>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button type="button" onclick="window.SamtAuth.closeInlineCourseModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white">إلغاء</button>
            <button type="submit" class="btn-samt-glow px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>حفظ الكورس</span>
            </button>
          </div>
        </form>

      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // تحديث شريط التنقل (Navbar) مع زر وقائمة ثابتة بالضغط (Click-to-Toggle)
  function updateNavbars() {
    const user = SamtAuth.getCurrentUser();
    const isAdmin = SamtAuth.isAdmin();

    const navSlots = document.querySelectorAll('.samt-auth-slot');
    
    const headers = document.querySelectorAll('header');
    headers.forEach(header => {
      const oldAdminLinks = header.querySelectorAll('a[href*="admin.html"]');
      oldAdminLinks.forEach(link => {
        if (!isAdmin) {
          link.classList.add('hidden');
          link.style.display = 'none';
        } else {
          link.classList.remove('hidden');
          link.style.display = '';
        }
      });
    });

    navSlots.forEach((slot, slotIdx) => {
      if (!user) {
        slot.innerHTML = `
          <button type="button" onclick="window.SamtAuth.openAuthModal()" class="px-4 py-2 rounded-full glass-card hover:border-samt-cyan text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
            <i class="fa-regular fa-user text-samt-cyan"></i>
            <span>تسجيل الدخول</span>
          </button>
        `;
      } else {
        const isAdm = user.role === 'admin';
        const notifOn = user.notificationsEnabled !== false;
        const dropdownId = `samtUserDropdown_${slotIdx}`;

        slot.innerHTML = `
          <div class="relative inline-block text-right" style="position: relative;">
            <!-- زر الحساب (يفتح ويثبت القائمة بالضغط) -->
            <button type="button" onclick="window.SamtAuth.toggleDropdown(event, '${dropdownId}')" class="px-3.5 py-1.5 rounded-full glass-card border ${isAdm ? 'border-samt-gold/50 text-samt-gold' : 'border-samt-cyan/40 text-white'} text-xs font-bold flex items-center gap-2 shadow-md hover:border-samt-cyan transition-all select-none cursor-pointer">
              <span class="w-6 h-6 rounded-full flex items-center justify-center bg-black/50 text-xs">${user.avatar || (isAdm ? '👑' : '👤')}</span>
              <span class="truncate max-w-[100px] sm:max-w-[140px]">${user.name}</span>
              <i class="fa-solid fa-chevron-down text-[10px] opacity-70"></i>
            </button>

            <!-- القائمة المنسدلة الثابتة على الضغط -->
            <div id="${dropdownId}" onclick="event.stopPropagation()" class="samt-dropdown-menu absolute left-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border border-white/20 py-2 z-[99999] text-right bg-[#0B132B] text-white" style="display: none;">
              
              <!-- User Info Card -->
              <div class="px-4 py-2.5 border-b border-white/10">
                <div class="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>${user.name}</span>
                  <span class="text-[11px] text-emerald-400 flex items-center gap-1" title="حساب موثق"><i class="fa-solid fa-circle-check"></i></span>
                </div>
                <div class="text-[10px] text-slate-400 truncate mt-0.5" dir="ltr">${user.email}</div>
                <div class="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isAdm ? 'bg-samt-gold/20 text-samt-gold border border-samt-gold/40' : 'bg-samt-cyan/20 text-samt-cyan border border-samt-cyan/40'}">
                  ${isAdm ? '👑 مشرف المنظومة (Admin)' : '👤 حساب مستخدم موثق'}
                </div>
              </div>

              <!-- زر إعدادات الحساب (تعديل الاسم والبريد والباسوورد) -->
              <button type="button" onclick="window.SamtAuth.openUserSettingsModal()" class="w-full text-right px-4 py-2.5 text-xs text-samt-cyan hover:bg-white/5 font-bold transition-colors flex items-center gap-2 border-b border-white/10">
                <i class="fa-solid fa-gear text-xs"></i>
                <span>إعدادات الحساب والبريد</span>
              </button>

              <!-- Notifications Toggle Row (تشغيل / إيقاف الإشعارات) -->
              <div onclick="window.SamtAuth.toggleNotifications(event)" class="px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs hover:bg-white/5 cursor-pointer select-none transition-colors">
                <div class="flex items-center gap-2">
                  <i class="fa-solid ${notifOn ? 'fa-bell text-samt-cyan' : 'fa-bell-slash text-slate-400'} text-xs"></i>
                  <span class="text-[11px] font-bold text-slate-300">إشعارات التحديثات</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${notifOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}">
                  ${notifOn ? 'مفعلة ✅' : 'معطلة 🔕'}
                </span>
              </div>

              ${isAdm ? `
                <a href="./admin.html" class="block px-4 py-2 text-xs text-samt-gold hover:bg-white/5 font-bold transition-colors">
                  <i class="fa-solid fa-chart-line ml-2"></i> لوحة التحكم الشاملة
                </a>
                <button type="button" onclick="window.SamtAuth.openNewCourseInline()" class="w-full text-right px-4 py-2 text-xs text-samt-cyan hover:bg-white/5 font-bold transition-colors">
                  <i class="fa-solid fa-plus-circle ml-2"></i> إضافة كورس جديد
                </button>
                <button type="button" onclick="window.SamtAuth.exportDataFile()" class="w-full text-right px-4 py-2 text-xs text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                  <i class="fa-solid fa-download ml-2"></i> تصدير البيانات (Export)
                </button>
              ` : ''}

              <a href="./courses.html" class="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                <i class="fa-solid fa-graduation-cap ml-2"></i> مكتبة الكورسات
              </a>

              <div class="border-t border-white/10 my-1"></div>
              
              <!-- زر حذف الحساب -->
              <button type="button" onclick="window.SamtAuth.deleteCurrentAccount()" class="w-full text-right px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-colors flex items-center gap-1.5">
                <i class="fa-solid fa-trash-can ml-1 text-xs"></i>
                <span>حذف الحساب نهائياً</span>
              </button>

              <!-- زر تسجيل الخروج -->
              <button type="button" onclick="window.SamtAuth.logout()" class="w-full text-right px-4 py-2 text-xs text-slate-400 hover:bg-white/5 font-bold transition-colors flex items-center gap-1.5">
                <i class="fa-solid fa-right-from-bracket ml-1 text-xs"></i>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        `;
      }
    });

    if (isAdmin) {
      injectAdminTopBar();
    }
  }

  // إغلاق القوائم عند النقر في أي مكان خارجها
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.samt-dropdown-menu') && !e.target.closest('button[onclick*="toggleDropdown"]')) {
      document.querySelectorAll('.samt-dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });

  // حقن شريط الأدمن التفاعلي السريع أعلى الصفحة
  function injectAdminTopBar() {
    if (document.getElementById('samtAdminLiveBar')) return;

    const bar = document.createElement('div');
    bar.id = 'samtAdminLiveBar';
    bar.className = 'fixed top-20 left-0 right-0 z-40 bg-[#0B132B]/95 border-b border-yellow-500/30 px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md shadow-lg';
    bar.innerHTML = `
      <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div class="flex items-center gap-2 text-yellow-400 font-bold">
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>وضع المشرف نشط (Admin Mode)</span>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" onclick="window.SamtAuth.openNewCourseInline()" class="btn-samt-glow px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-plus"></i>
            <span>إضافة كورس</span>
          </button>
          <a href="./admin.html" class="px-3 py-1 rounded-lg glass-card text-yellow-400 hover:border-yellow-400 text-[11px] font-bold">
            <i class="fa-solid fa-sliders ml-1"></i> لوحة الإدارة
          </a>
          <button type="button" onclick="window.SamtAuth.exportDataFile()" class="px-3 py-1 rounded-lg glass-card text-slate-300 hover:text-white text-[11px] font-bold">
            <i class="fa-solid fa-file-code ml-1"></i> تصدير البيانات
          </button>
        </div>
      </div>
    `;
    document.body.prepend(bar);
  }

  function getCoursesList() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return window.AgentProData?.courses || [];
  }

  function saveCoursesList(courses) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    if (window.AgentProData) {
      window.AgentProData.courses = courses;
    }
  }

  // الواجهة البرمجية العامة window.SamtAuth
  window.SamtAuth = {
    ...SamtAuth,

    // فتح نافذة إعدادات الحساب
    openUserSettingsModal: function () {
      injectUserSettingsModal();
      const user = SamtAuth.getCurrentUser();
      if (!user) return;

      document.getElementById('settingsUserName').value = user.name || '';
      document.getElementById('settingsUserEmail').value = user.email || '';
      document.getElementById('settingsCurrentPass').value = '';
      document.getElementById('settingsNewPass').value = '';
      document.getElementById('settingsConfirmNewPass').value = '';

      // إغلاق القائمة المنسدلة
      document.querySelectorAll('.samt-dropdown-menu').forEach(m => m.style.display = 'none');

      const modal = document.getElementById('samtUserSettingsModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    closeUserSettingsModal: function () {
      const modal = document.getElementById('samtUserSettingsModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    // معالجة تحديث الاسم والبريد
    handleProfileUpdateSubmit: function (e) {
      e.preventDefault();
      const name = document.getElementById('settingsUserName').value;
      const email = document.getElementById('settingsUserEmail').value;

      const res = SamtAuth.updateProfile(name, email);
      if (res.success) {
        SamtAuth.toast(res.message, 'success');
        this.closeUserSettingsModal();
        setTimeout(() => window.location.reload(), 400);
      } else {
        SamtAuth.toast(res.message, 'error');
      }
    },

    // معالجة تغيير كلمة المرور
    handlePasswordChangeSubmit: function (e) {
      e.preventDefault();
      const oldP = document.getElementById('settingsCurrentPass').value;
      const newP = document.getElementById('settingsNewPass').value;
      const confP = document.getElementById('settingsConfirmNewPass').value;

      const res = SamtAuth.updatePassword(oldP, newP, confP);
      if (res.success) {
        SamtAuth.toast(res.message, 'success');
        document.getElementById('settingsCurrentPass').value = '';
        document.getElementById('settingsNewPass').value = '';
        document.getElementById('settingsConfirmNewPass').value = '';
      } else {
        SamtAuth.toast(res.message, 'error');
      }
    },

    togglePasswordVisibility: function (inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash', 'text-samt-cyan');
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('fa-eye-slash', 'text-samt-cyan');
          icon.classList.add('fa-eye');
        }
      }
    },

    toggleDropdown: function (e, dropdownId) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const menu = document.getElementById(dropdownId);
      if (!menu) return;

      const isCurrentlyOpen = menu.style.display === 'block';

      document.querySelectorAll('.samt-dropdown-menu').forEach(m => {
        m.style.display = 'none';
      });

      if (!isCurrentlyOpen) {
        menu.style.display = 'block';
      }
    },

    openAuthModal: function (tab = 'login') {
      injectAuthModal();
      const modal = document.getElementById('samtAuthModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      this.switchAuthTab(tab);
    },

    closeAuthModal: function () {
      const modal = document.getElementById('samtAuthModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    switchAuthTab: function (tab) {
      const tabsHeader = document.getElementById('authTabsHeader');
      const loginTab = document.getElementById('authTabLogin');
      const regTab = document.getElementById('authTabRegister');
      const loginForm = document.getElementById('samtLoginForm');
      const regForm = document.getElementById('samtRegisterForm');
      const otpStep = document.getElementById('samtOtpStep');
      const loginErr = document.getElementById('authLoginError');
      const regErr = document.getElementById('authRegError');

      if (loginErr) loginErr.classList.add('hidden');
      if (regErr) regErr.classList.add('hidden');

      if (tabsHeader) tabsHeader.classList.remove('hidden');
      if (otpStep) otpStep.classList.add('hidden');

      if (tab === 'login') {
        if (loginTab) loginTab.className = 'flex-1 py-3 text-center border-b-2 border-samt-cyan text-samt-cyan transition-colors';
        if (regTab) regTab.className = 'flex-1 py-3 text-center border-b-2 border-transparent text-slate-400 hover:text-white transition-colors';
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
      } else {
        if (regTab) regTab.className = 'flex-1 py-3 text-center border-b-2 border-samt-cyan text-samt-cyan transition-colors';
        if (loginTab) loginTab.className = 'flex-1 py-3 text-center border-b-2 border-transparent text-slate-400 hover:text-white transition-colors';
        if (regForm) regForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
      }
    },

    fillDemoAdmin: function () {
      document.getElementById('authLoginEmail').value = MASTER_ADMIN.email;
      document.getElementById('authLoginPassword').value = MASTER_ADMIN.password;
    },

    handleLoginSubmit: function (e) {
      e.preventDefault();
      const email = document.getElementById('authLoginEmail').value;
      const pass = document.getElementById('authLoginPassword').value;
      const errEl = document.getElementById('authLoginError');

      const res = SamtAuth.login(email, pass);
      if (res.success) {
        this.closeAuthModal();
        SamtAuth.toast(`مرحباً بك يا ${res.user.name} (${res.user.role === 'admin' ? 'مشرف' : 'مستخدم'})`, 'success');
        setTimeout(() => window.location.reload(), 400);
      } else {
        errEl.textContent = res.message;
        errEl.classList.remove('hidden');
      }
    },

    handleRegisterSubmit: async function (e) {
      e.preventDefault();
      const name = document.getElementById('authRegName').value;
      const email = document.getElementById('authRegEmail').value;
      const pass = document.getElementById('authRegPassword').value;
      const confirmPass = document.getElementById('authRegConfirmPassword').value;
      const code = document.getElementById('authRegAdminCode').value;
      const errEl = document.getElementById('authRegError');

      const res = SamtAuth.startRegister(name, email, pass, confirmPass, code);
      if (res.success) {
        document.getElementById('authTabsHeader').classList.add('hidden');
        document.getElementById('samtRegisterForm').classList.add('hidden');
        
        const otpStep = document.getElementById('samtOtpStep');
        otpStep.classList.remove('hidden');

        document.getElementById('otpTargetEmail').textContent = res.email;
        document.getElementById('otpInput').value = '';
        document.getElementById('otpInput').focus();

        SamtAuth.toast(`تم إرسال رمز التحقق إلى بريدك الإلكتروني 📩`, 'info');
      } else {
        errEl.textContent = res.message;
        errEl.classList.remove('hidden');
      }
    },

    submitOtpVerification: function () {
      const enteredOtp = document.getElementById('otpInput').value;
      const errEl = document.getElementById('otpError');

      const res = SamtAuth.verifyAndCompleteRegister(enteredOtp);
      if (res.success) {
        this.closeAuthModal();
        SamtAuth.toast(res.message, 'success');
        setTimeout(() => window.location.reload(), 400);
      } else {
        errEl.textContent = res.message;
        errEl.classList.remove('hidden');
      }
    },

    resendOtp: function () {
      if (pendingRegistration) {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        pendingRegistration.otp = newOtp;
        dispatchRealOtpEmail(pendingRegistration.email, pendingRegistration.name, newOtp);
        document.getElementById('otpError').classList.add('hidden');
        SamtAuth.toast(`تمت إعادة إرسال رمز التحقق إلى بريدك 📩`, 'info');
      }
    },

    openNewCourseInline: function () {
      injectCourseModal();
      document.getElementById('inlineCourseId').value = '';
      document.getElementById('inlineModalTitle').textContent = 'إضافة كورس جديد';
      document.getElementById('inlineFormTitle').value = '';
      document.getElementById('inlineFormDuration').value = '10:00';
      document.getElementById('inlineFormVideoUrl').value = '';
      document.getElementById('inlineFormDesc').value = '';
      
      const modal = document.getElementById('samtInlineCourseModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    editCourseInline: function (id) {
      injectCourseModal();
      const list = getCoursesList();
      const course = list.find(c => c.id === id);
      if (!course) return;

      document.getElementById('inlineCourseId').value = course.id;
      document.getElementById('inlineModalTitle').textContent = `تعديل: ${course.title}`;
      document.getElementById('inlineFormTitle').value = course.title;
      document.getElementById('inlineFormCategory').value = course.category || 'basics';
      document.getElementById('inlineFormLevel').value = course.level || 'مبتدئ';
      document.getElementById('inlineFormDuration').value = course.duration || '';
      document.getElementById('inlineFormVideoUrl').value = course.videoUrl || '';
      document.getElementById('inlineFormDesc').value = course.description || '';

      const modal = document.getElementById('samtInlineCourseModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    },

    closeInlineCourseModal: function () {
      const modal = document.getElementById('samtInlineCourseModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    handleInlineCourseSave: function (e) {
      e.preventDefault();
      const id = document.getElementById('inlineCourseId').value;
      const title = document.getElementById('inlineFormTitle').value.trim();
      const category = document.getElementById('inlineFormCategory').value;
      const level = document.getElementById('inlineFormLevel').value;
      const duration = document.getElementById('inlineFormDuration').value.trim() || '10:00';
      const videoUrl = document.getElementById('inlineFormVideoUrl').value.trim();
      const description = document.getElementById('inlineFormDesc').value.trim();

      const categoryNames = {
        basics: 'دليل المبتدئين',
        productivity: 'الإنتاجية والتنظيم',
        analytics: 'التحليلات ومؤشرات الأداء',
        database: 'قواعد البيانات والسيرفرات'
      };

      let courses = getCoursesList();

      if (id) {
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
          courses[index] = {
            ...courses[index],
            title,
            category,
            categoryName: categoryNames[category] || 'شروحات عامة',
            level,
            duration,
            videoUrl,
            description
          };
          SamtAuth.toast('تم تحديث بيانات الكورس بنجاح!', 'success');
        }
      } else {
        const newCourse = {
          id: 'course-' + Date.now().toString().slice(-4),
          title,
          category,
          categoryName: categoryNames[category] || 'شروحات عامة',
          level,
          duration,
          videoUrl,
          description,
          attachments: [
            { name: '📄 دليل الشرح والملفات المرفقة', url: 'downloads.html' }
          ]
        };
        courses.unshift(newCourse);
        SamtAuth.toast('تمت إضافة الكورس الجديد بنجاح!', 'success');
      }

      saveCoursesList(courses);
      this.closeInlineCourseModal();
      setTimeout(() => window.location.reload(), 400);
    },

    deleteCourseInline: function (id) {
      if (!confirm('هل أنت متأكد من حذف هذا الكورس نهائياً؟')) return;
      let courses = getCoursesList();
      courses = courses.filter(c => c.id !== id);
      saveCoursesList(courses);
      SamtAuth.toast('تم حذف الكورس بنجاح.', 'info');
      setTimeout(() => window.location.reload(), 400);
    },

    exportDataFile: function () {
      const courses = getCoursesList();
      const releases = window.AgentProData?.releases || [];
      const subscribers = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || window.AgentProData?.subscribers || [];

      const fullData = {
        releases,
        courses,
        subscribers
      };

      const codeContent = `/**\n * سمت SAMT - قاعدة البيانات المركزية المحدثة\n * تم التصدير بواسطة لوحة تحكم المشرف\n */\n\nconst AgentProData = ${JSON.stringify(fullData, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.AgentProData = AgentProData;\n}\n`;

      const blob = new Blob([codeContent], { type: 'application/javascript;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'courses-data.js';
      link.click();
      SamtAuth.toast('تم تحميل ملف courses-data.js المحدث!', 'success');
    }
  };

  function cleanupOldDummyData() {
    try {
      if (localStorage.getItem('samt_v2026_clean_slate') !== 'true') {
        localStorage.removeItem(STORAGE_KEYS.COURSES);
        localStorage.removeItem('samt_admin_releases');
        localStorage.removeItem(STORAGE_KEYS.SUBSCRIBERS);
        localStorage.setItem('samt_v2026_clean_slate', 'true');
      }
    } catch (e) {}
  }

  function init() {
    cleanupOldDummyData();
    initUsers();
    injectAuthModal();
    injectUserSettingsModal();
    injectCourseModal();
    updateNavbars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
