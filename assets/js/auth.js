/**
 * ==========================================================================
 * ط³ظ…طھ SAMT - ظ…ط­ط±ظƒ ط§ظ„ظ…طµط§ط¯ظ‚ط©طŒ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨طŒ ظˆط­ط°ظپ ط§ظ„ط­ط³ط§ط¨ ظ†ظ‡ط§ط¦ظٹط§ظ‹
 * ==========================================================================
 * 1. طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط§ظ„ظ…ظˆط­ط¯ ظ„ظ„ط¹ظ…ظ„ط§ط، ظˆط§ظ„ظ…ط´ط±ظپظٹظ†.
 * 2. ظ†ط§ظپط°ط© ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨ ط§ظ„ط´ط§ظ…ظ„ط© (طھط¹ط¯ظٹظ„ ط§ظ„ط§ط³ظ…طŒ طھط؛ظٹظٹط± ط§ظ„ط¥ظٹظ…ظٹظ„طŒ طھط؛ظٹظٹط± ط§ظ„ط¨ط§ط³ظˆظˆط±ط¯).
 * 3. ط®ط§طµظٹط© ط­ط°ظپ ط§ظ„ط­ط³ط§ط¨ ظˆط§ظ„ط¨ط±ظٹط¯ ظ†ظ‡ط§ط¦ظٹط§ظ‹ (Delete Account & Data).
 * 4. ط¥ط±ط³ط§ظ„ ظƒظˆط¯ ط§ظ„طھط­ظ‚ظ‚ OTP ط¥ظ„ظ‰ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط­ظ‚ظٹظ‚ظٹ + ط¥ط®ظپط§ط، ط§ظ„ظƒظˆط¯ ظ…ظ† ط§ظ„ط´ط§ط´ط©.
 * 5. ط£ط²ط±ط§ط± ط¥ط¸ظ‡ط§ط± ظˆط¥ط®ظپط§ط، ط§ظ„ط¨ط§ط³ظˆظˆط±ط¯ ط¨ط§ظ„ط¹ظٹظ† ًں‘پï¸ڈ.
 * 6. ظ‚ط§ط¦ظ…ط© ظ…ظ†ط³ط¯ظ„ط© ط«ط§ط¨طھط© 100% ط¨ط§ظ„ط¶ط؛ط· (Click-to-Toggle).
 */

(function () {
  'use strict';

  // ط¥ط¹ط¯ط§ط¯ط§طھ ط®ط¯ظ…ط© ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط§ظ„ط­ظ‚ظٹظ‚ظٹ (EmailJS)
  const EMAIL_SERVICE_CONFIG = {
    SERVICE_ID: 'service_samt',
    TEMPLATE_ID: 'template_samt_otp',
    PUBLIC_KEY: '',
    ENABLED: false
  };

  // ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط§ظپطھط±ط§ط¶ظٹط© ظ„ط­ط³ط§ط¨ ط§ظ„ظ…ط´ط±ظپ ط§ظ„ط±ط¦ظٹط³ظٹ
  const MASTER_ADMIN = {
    name: 'ط§ظ„ظ…ط´ط±ظپ ط§ظ„ط¹ط§ظ…',
    email: 'admin@samt.com',
    password: 'admin1234',
    role: 'admin',
    avatar: 'ًں‘‘',
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
              app_name: 'ظ…ظ†ط¸ظˆظ…ط© ط³ظ…طھ SAMT'
            }
          })
        });
        if (response.ok) {
          console.log('âœ… طھظ… ط¥ط±ط³ط§ظ„ ظƒظˆط¯ ط§ظ„طھط­ظ‚ظ‚ ط¨ظ†ط¬ط§ط­ ط¥ظ„ظ‰ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ.');
          return true;
        }
      } catch (err) {
        console.warn('طھط¹ط°ط± ط§ظ„ط¥ط±ط³ط§ظ„ ط¹ط¨ط± ط§ظ„ط³ظٹط±ظپط± ط§ظ„ط®ط§ط±ط¬ظٹطŒ ط¬ط§ط±ظٹ ط§ظ„ط¹ظ…ظ„ ط¨ط§ظ„ظˆط¶ط¹ ط§ظ„ظ…ط­ظ„ظٹ:', err);
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
          avatar: user.role === 'admin' ? 'ًں‘‘' : 'ًں‘¤',
          emailVerified: user.emailVerified !== undefined ? user.emailVerified : true,
          notificationsEnabled: user.notificationsEnabled !== undefined ? user.notificationsEnabled : true,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        return { success: true, user: sessionData };
      }
      return { success: false, message: 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط£ظˆ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± طµط­ظٹط­ط©.' };
    },

    startRegister: function (name, email, password, confirmPassword, adminPasscode) {
      const users = initUsers();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();
      const cleanPass = (password || '').trim();
      const cleanConfirmPass = (confirmPassword || '').trim();

      if (!cleanEmail || !cleanPass || !cleanName || !cleanConfirmPass) {
        return { success: false, message: 'ظٹط±ط¬ظ‰ ظ…ظ„ط، ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ„ ط§ظ„ظ…ط·ظ„ظˆط¨ط©.' };
      }

      if (cleanPass !== cleanConfirmPass) {
        return { success: false, message: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظˆطھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± ظ…طھط·ط§ط¨ظ‚طھظٹظ†!' };
      }

      if (cleanPass.length < 6) {
        return { success: false, message: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظٹط¬ط¨ ط£ظ† ظ„ط§ طھظ‚ظ„ ط¹ظ† 6 ط£ط­ط±ظپ ط£ظˆ ط£ط±ظ‚ط§ظ….' };
      }

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'ظ‡ط°ط§ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ…ط³ط¬ظ„ ظ…ط³ط¨ظ‚ط§ظ‹.' };
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const isGrantingAdmin = adminPasscode && adminPasscode.trim() === MASTER_ADMIN_PASSCODE;

      pendingRegistration = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: isGrantingAdmin ? 'admin' : 'user',
        avatar: isGrantingAdmin ? 'ًں‘‘' : 'ًں‘¤',
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
        return { success: false, message: 'ط§ظ†طھظ‡طھ طµظ„ط§ط­ظٹط© ط¬ظ„ط³ط© ط§ظ„طھط³ط¬ظٹظ„طŒ ظٹط±ط¬ظ‰ ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط­ط§ظˆظ„ط©.' };
      }

      const cleanEntered = (enteredOtp || '').trim();
      if (cleanEntered !== pendingRegistration.otp) {
        return { success: false, message: 'ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ ط؛ظٹط± طµط­ظٹط­طŒ ظٹط±ط¬ظ‰ ظ…ط±ط§ط¬ط¹ط© ط§ظ„ط¨ط±ظٹط¯ ظˆط§ظ„ظ…ط­ط§ظˆظ„ط© ط«ط§ظ†ظٹط©.' };
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
        message: isAdm ? 'طھظ… طھط£ظƒظٹط¯ ط§ظ„ط¨ط±ظٹط¯ ظˆط¥ظ†ط´ط§ط، ط­ط³ط§ط¨ ط§ظ„ظ…ط´ط±ظپ (Admin) ط¨ظ†ط¬ط§ط­! ًں‘‘' : 'طھظ… طھط£ظƒظٹط¯ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظˆطھظپط¹ظٹظ„ ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ ط¨ظ†ط¬ط§ط­! ًںژ‰'
      };
    },

    // ط­ظپط¸ طھط¹ط¯ظٹظ„ط§طھ ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ (ط§ظ„ط§ط³ظ… ظˆط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ)
    updateProfile: function (newName, newEmail) {
      const user = this.getCurrentUser();
      if (!user) return { success: false, message: 'ظٹط±ط¬ظ‰ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط£ظˆظ„ط§ظ‹.' };

      const cleanName = (newName || '').trim();
      const cleanEmail = (newEmail || '').trim().toLowerCase();

      if (!cleanName || !cleanEmail) {
        return { success: false, message: 'ظٹط±ط¬ظ‰ ظ…ظ„ط، ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ„.' };
      }

      let users = initUsers();
      // ط§ظ„طھط­ظ‚ظ‚ ط¥ظ† ظƒط§ظ† ط§ظ„ط¥ظٹظ…ظٹظ„ ط§ظ„ط¬ط¯ظٹط¯ ظ…ط³طھط®ط¯ظ…ط§ظ‹ ظ…ظ† ط­ط³ط§ط¨ ط¢ط®ط±
      const emailTaken = users.some(u => u.email.toLowerCase() === cleanEmail && u.email.toLowerCase() !== user.email.toLowerCase());
      if (emailTaken) {
        return { success: false, message: 'ظ‡ط°ط§ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ…ط³طھط®ط¯ظ… ظ„ط­ط³ط§ط¨ ط¢ط®ط±.' };
      }

      const oldEmail = user.email.toLowerCase();

      // طھط­ط¯ظٹط« ظپظٹ ط¬ط¯ظˆظ„ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†
      const userIdx = users.findIndex(u => u.email.toLowerCase() === oldEmail);
      if (userIdx !== -1) {
        users[userIdx].name = cleanName;
        users[userIdx].email = cleanEmail;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      // طھط­ط¯ظٹط« ظپظٹ ط¬ط¯ظˆظ„ ط§ظ„ظ…ط´طھط±ظƒظٹظ†
      try {
        let subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || [];
        subs = subs.map(s => s.email.toLowerCase() === oldEmail ? { ...s, name: cleanName, email: cleanEmail } : s);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));
      } catch (e) {}

      // طھط­ط¯ظٹط« ط§ظ„ط¬ظ„ط³ط©
      user.name = cleanName;
      user.email = cleanEmail;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));

      return { success: true, message: 'طھظ… طھط­ط¯ظٹط« ط¨ظٹط§ظ†ط§طھ ط§ظ„ط­ط³ط§ط¨ ظˆط§ظ„ط¨ط±ظٹط¯ ط¨ظ†ط¬ط§ط­!' };
    },

    // طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±
    updatePassword: function (oldPass, newPass, confirmPass) {
      const user = this.getCurrentUser();
      if (!user) return { success: false, message: 'ظٹط±ط¬ظ‰ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط£ظˆظ„ط§ظ‹.' };

      const cleanOld = (oldPass || '').trim();
      const cleanNew = (newPass || '').trim();
      const cleanConfirm = (confirmPass || '').trim();

      if (!cleanOld || !cleanNew || !cleanConfirm) {
        return { success: false, message: 'ظٹط±ط¬ظ‰ ظ…ظ„ط، ط¬ظ…ظٹط¹ ط­ظ‚ظˆظ„ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±.' };
      }

      if (cleanNew !== cleanConfirm) {
        return { success: false, message: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط© ظˆطھط£ظƒظٹط¯ظ‡ط§ ط؛ظٹط± ظ…طھط·ط§ط¨ظ‚طھظٹظ†!' };
      }

      if (cleanNew.length < 6) {
        return { success: false, message: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط© ظٹط¬ط¨ ط£ظ† ظ„ط§ طھظ‚ظ„ ط¹ظ† 6 ط£ط­ط±ظپ.' };
      }

      let users = initUsers();
      const uIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (uIdx === -1 || users[uIdx].password !== cleanOld) {
        return { success: false, message: 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط© ط؛ظٹط± طµط­ظٹط­ط©!' };
      }

      users[uIdx].password = cleanNew;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return { success: true, message: 'طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¨ظ†ط¬ط§ط­!' };
    },

    // ط­ط°ظپ ط§ظ„ط­ط³ط§ط¨ ظˆط§ظ„ط¨ط±ظٹط¯ ظ†ظ‡ط§ط¦ظٹط§ظ‹ (Delete Account)
    deleteCurrentAccount: function () {
      const user = this.getCurrentUser();
      if (!user) return;

      const confirmMsg = `ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ طھظ…ط§ظ…ط§ظ‹ ظ…ظ† ط­ط°ظپ ط­ط³ط§ط¨ظƒ (${user.email}) ظ†ظ‡ط§ط¦ظٹط§ظ‹طں\n\nط³ظٹطھظ… ظ…ط³ط­ ط¨ظٹط§ظ†ط§طھظƒ ظˆط§ط´طھط±ط§ظƒط§طھظƒ ط¨ط§ظ„ظƒط§ظ…ظ„ ظˆظ„ط§ ظٹظ…ظƒظ† ط§ظ„طھط±ط§ط¬ط¹ ط¹ظ† ظ‡ط°ط§ ط§ظ„ط¥ط¬ط±ط§ط،.`;
      if (!confirm(confirmMsg)) return;

      const targetEmail = user.email.toLowerCase();

      // ط­ط°ظپ ظ…ظ† ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†
      let users = initUsers();
      users = users.filter(u => u.email.toLowerCase() !== targetEmail);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // ط­ط°ظپ ظ…ظ† ط§ظ„ظ…ط´طھط±ظƒظٹظ†
      try {
        let subs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS)) || [];
        subs = subs.filter(s => s.email.toLowerCase() !== targetEmail);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subs));
      } catch (e) {}

      // ظ…ط³ط­ ط§ظ„ط¬ظ„ط³ط©
      localStorage.removeItem(STORAGE_KEYS.SESSION);

      this.toast('طھظ… ط­ط°ظپ ط­ط³ط§ط¨ظƒ ظˆط¥ظ„ط؛ط§ط، طھط³ط¬ظٹظ„ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط¨ظ†ط¬ط§ط­ ًں—‘ï¸ڈ', 'info');
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
        this.toast('طھظ… طھظپط¹ظٹظ„ ط¥ط´ط¹ط§ط±ط§طھ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ„ظ„طھط­ط¯ظٹط«ط§طھ ًں””', 'success');
      } else {
        this.toast('طھظ… ط¥ظٹظ‚ط§ظپ ط§ط³طھظ„ط§ظ… ط¥ط´ط¹ط§ط±ط§طھ ط§ظ„ط¨ط±ظٹط¯ ًں”•', 'info');
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

  // ط­ظ‚ظ† ظ†ط§ظپط°ط© طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ظˆط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨
  function injectAuthModal() {
    if (document.getElementById('samtAuthModal')) return;

    const modalHTML = `
    <div id="samtAuthModal" class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
      <div class="glass-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/15 text-right bg-[#0B132B]">
        
        <!-- Header -->
        <div class="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-lg font-black font-cairo text-white">ط³ظژظ€ظ…ظ’ظ€طھ</span>
            <span class="text-sm font-extrabold text-samt-cyan font-readex">SAMT</span>
          </div>
          <button type="button" onclick="window.SamtAuth.closeAuthModal()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Auth Tabs -->
        <div id="authTabsHeader" class="flex border-b border-white/10 bg-black/20 text-xs font-bold">
          <button type="button" id="authTabLogin" onclick="window.SamtAuth.switchAuthTab('login')" class="flex-1 py-3 text-center border-b-2 border-samt-cyan text-samt-cyan transition-colors">
            <i class="fa-solid fa-right-to-bracket ml-1"></i> طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
          </button>
          <button type="button" id="authTabRegister" onclick="window.SamtAuth.switchAuthTab('register')" class="flex-1 py-3 text-center border-b-2 border-transparent text-slate-400 hover:text-white transition-colors">
            <i class="fa-solid fa-user-plus ml-1"></i> ط­ط³ط§ط¨ ط¬ط¯ظٹط¯
          </button>
        </div>

        <!-- Form Area -->
        <div class="p-6 space-y-4">
          
          <!-- 1. LOGIN FORM -->
          <form id="samtLoginForm" onsubmit="window.SamtAuth.handleLoginSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ:</label>
              <div class="relative">
                <input type="email" id="authLoginEmail" required placeholder="admin@samt.com" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-3 pr-10 pl-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold font-cairo text-slate-300">ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±:</label>
                <button type="button" onclick="window.SamtAuth.fillDemoAdmin()" class="text-[10px] text-samt-cyan hover:underline font-bold">طھط¬ط±ط¨ط© ط­ط³ط§ط¨ ط§ظ„ط£ط¯ظ…ظ†</button>
              </div>
              <div class="relative">
                <input type="password" id="authLoginPassword" required placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-3 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authLoginPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="ط¥ط¸ظ‡ط§ط±/ط¥ط®ظپط§ط، ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <div id="authLoginError" class="hidden p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>

            <button type="submit" class="btn-samt-glow w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid fa-arrow-right-to-bracket"></i>
              <span>ط¯ط®ظˆظ„ ط¥ظ„ظ‰ ط§ظ„ظ…ظ†ط¸ظˆظ…ط©</span>
            </button>
          </form>

          <!-- 2. REGISTER FORM -->
          <form id="samtRegisterForm" onsubmit="window.SamtAuth.handleRegisterSubmit(event)" class="space-y-3.5 hidden">
            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">ط§ظ„ط§ط³ظ… ط§ظ„ظƒط§ظ…ظ„:</label>
              <div class="relative">
                <input type="text" id="authRegName" required placeholder="ظ…ط«ط§ظ„: ط¨ظ„ط§ظ„ ط³ظ…ظٹط±" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-3 outline-none bg-black/40 text-white" />
                <i class="fa-solid fa-user absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ:</label>
              <div class="relative">
                <input type="email" id="authRegEmail" required placeholder="name@gmail.com" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±:</label>
              <div class="relative">
                <input type="password" id="authRegPassword" required oninput="window.SamtAuth.checkRegPasswordStrength(this.value)" placeholder="6 ط£ط­ط±ظپ ظپط£ظƒط«ط±" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-lock absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="ط¥ط¸ظ‡ط§ط±/ط¥ط®ظپط§ط، ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
              
              <!-- Password strength meter (Requirement 6) -->
              <div id="authRegPasswordStrength" class="mt-2 hidden text-[10px] font-bold">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-slate-400">ظ‚ظˆط© ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±:</span>
                  <span id="strengthText" class="text-rose-400">ط¶ط¹ظٹظپ ط¬ط¯ط§ظ‹</span>
                </div>
                <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div id="strengthBar" class="h-full w-1/4 bg-rose-500 transition-all duration-300"></div>
                </div>
              </div>

              <!-- Password recommendation notice (Requirement 7) -->
              <p class="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-cairo">
                â„¹ï¸ڈ ظٹظڈظ†طµط­ ط¨ط£ظ† طھطھظƒظˆظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ…ظ† 8 ط®ط§ظ†ط§طھ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„ طھط­طھظˆظٹ ط¹ظ„ظ‰ ط­ط±ظˆظپ (ظƒط¨ظٹط±ط© ظˆطµط؛ظٹط±ط©) ظˆط£ط±ظ‚ط§ظ… ظˆط±ظ…ظˆط² ط®ط§طµط©.
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1 font-cairo text-slate-300">ط£ط¹ط¯ ظƒطھط§ط¨ط© ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±:</label>
              <div class="relative">
                <input type="password" id="authRegConfirmPassword" required placeholder="طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                <i class="fa-solid fa-shield-check absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegConfirmPassword', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1 focus:outline-none" title="ط¥ط¸ظ‡ط§ط±/ط¥ط®ظپط§ط، ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <!-- Optional Admin Upgrade Toggle & Code (Requirement 5) -->
            <div class="border border-white/10 rounded-xl p-3 bg-white/5 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-bold font-cairo text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" id="regAdminToggle" onchange="window.SamtAuth.toggleAdminRegistrationField(this.checked)" class="rounded border-white/10 text-samt-cyan focus:ring-0 focus:ring-offset-0 bg-black/40">
                  <span>ط§ظ„طھط³ط¬ظٹظ„ ط¨طµظ„ط§ط­ظٹط§طھ ظ…ط´ط±ظپ (ط£ط¯ظ…ظ†)</span>
                </label>
                <i class="fa-solid fa-crown text-samt-gold text-[10px]"></i>
              </div>
              
              <div id="regAdminCodeSection" class="hidden space-y-2 pt-2 border-t border-white/5">
                <p class="text-[10px] text-slate-400 font-cairo leading-relaxed">
                  ًں’، ظ„طھط£ظƒظٹط¯ طµظ„ط§ط­ظٹط© ط§ظ„ط£ط¯ظ…ظ†طŒ ظٹط±ط¬ظ‰ ظƒطھط§ط¨ط© ظƒظˆط¯ ط§ظ„ظ…ط´ط±ظپ ط§ظ„ط§ظپطھط±ط§ط¶ظٹ ظ„ظ„ظ…ظ†ط¸ظˆظ…ط©: <code class="bg-black/50 text-samt-gold font-mono px-1.5 py-0.5 rounded text-[10px] select-all">SAMT-ADMIN-2026</code>
                </p>
                <div class="relative">
                  <input type="password" id="authRegAdminCode" placeholder="ط£ط¯ط®ظ„ ظƒظˆط¯ ط§ظ„ظ…ط´ط±ظپ ظ‡ظ†ط§" class="w-full glass-card border border-white/10 focus:border-samt-gold text-xs rounded-xl py-2.5 pr-10 pl-10 outline-none text-left font-mono bg-black/40 text-white" dir="ltr" />
                  <i class="fa-solid fa-key absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                  <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('authRegAdminCode', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 text-xs p-1 focus:outline-none" title="ط¥ط¸ظ‡ط§ط±/ط¥ط®ظپط§ط، ط§ظ„ظƒظˆط¯">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>
            </div>

            <div id="authRegError" class="hidden p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>

            <button type="submit" class="btn-samt-glow w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid fa-paper-plane"></i>
              <span>ظ…طھط§ط¨ط¹ط© ظˆط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط¨ط±ظٹط¯</span>
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

  // نافذة إعدادات وتعديل الحساب وحذف الإيميل (User Account Settings Modal - Full Screen Browser Style)
  function injectUserSettingsModal() {
    if (document.getElementById('samtUserSettingsModal')) return;

    const modalHTML = `
    <div id="samtUserSettingsModal" class="fixed inset-0 z-[9999] bg-[#070A12] text-right hidden flex-col">
      
      <!-- Header / Top Bar -->
      <div class="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 relative z-10">
        <div class="flex items-center gap-3">
          <span class="text-samt-cyan text-xl"><i class="fa-solid fa-user-gear"></i></span>
          <h3 class="text-sm font-bold font-cairo text-white">إعدادات الحساب والمنظومة</h3>
        </div>
        <button type="button" onclick="window.SamtAuth.closeUserSettingsModal()" class="text-slate-400 hover:text-white text-lg p-2 rounded-full hover:bg-white/5 transition-all" aria-label="إغلاق الإعدادات">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Settings Layout Grid -->
      <div class="flex-grow flex flex-col md:flex-row relative z-10 h-[calc(100vh-64px)]">
        
        <!-- Sidebar Navigation Tabs -->
        <div class="w-full md:w-64 border-l border-white/10 bg-black/20 p-4 space-y-2 flex-shrink-0">
          <button type="button" onclick="window.SamtAuth.switchSettingsTab('profile')" id="settingsTabProfile" class="w-full text-right px-4 py-3 rounded-xl text-xs font-bold bg-samt-cyan/15 text-samt-cyan flex items-center gap-2.5 transition-all">
            <i class="fa-solid fa-id-card"></i> <span>البيانات الشخصية</span>
          </button>
          <button type="button" onclick="window.SamtAuth.switchSettingsTab('security')" id="settingsTabSecurity" class="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 flex items-center gap-2.5 transition-all">
            <i class="fa-solid fa-lock"></i> <span>الأمان وكلمة المرور</span>
          </button>
          <button type="button" onclick="window.SamtAuth.switchSettingsTab('preferences')" id="settingsTabPreferences" class="w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 flex items-center gap-2.5 transition-all">
            <i class="fa-solid fa-bell"></i> <span>التفضيلات والإشعارات</span>
          </button>
        </div>

        <!-- Content Panel -->
        <div class="flex-grow p-6 md:p-8 overflow-y-auto max-w-4xl space-y-8">
          
          <!-- Tab 1: Profile -->
          <div id="settingsPanelProfile" class="space-y-6">
            <div>
              <h2 class="text-xl font-bold font-cairo text-white">البيانات الشخصية</h2>
              <p class="text-xs text-slate-400 mt-1">تحديث معلومات ملفك الشخصي وعنوان البريد الإلكتروني الخاص بك.</p>
            </div>

            <form onsubmit="window.SamtAuth.handleProfileUpdateSubmit(event)" class="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">الاسم الكامل:</label>
                <input type="text" id="settingsUserName" required class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
              </div>

              <div>
                <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">البريد الإلكتروني:</label>
                <input type="email" id="settingsUserEmail" required class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="btn-samt-glow px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <i class="fa-solid fa-floppy-disk"></i>
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Tab 2: Security & Password -->
          <div id="settingsPanelSecurity" class="space-y-6 hidden">
            <div>
              <h2 class="text-xl font-bold font-cairo text-white">الأمان وكلمة المرور</h2>
              <p class="text-xs text-slate-400 mt-1">تحديث كلمة مرور حسابك لحمايته أو إزالة الحساب نهائياً.</p>
            </div>

            <form onsubmit="window.SamtAuth.handlePasswordChangeSubmit(event)" class="glass-card rounded-2xl p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">كلمة المرور الحالية:</label>
                <div class="relative">
                  <input type="password" id="settingsCurrentPass" required placeholder="••••••••" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                  <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsCurrentPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">كلمة المرور الجديدة:</label>
                <div class="relative">
                  <input type="password" id="settingsNewPass" required placeholder="6 أحرف فأكثر" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                  <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsNewPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">تأكيد كلمة المرور الجديدة:</label>
                <div class="relative">
                  <input type="password" id="settingsConfirmNewPass" required placeholder="إعادة كتابة كلمة المرور الجديدة" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl py-2.5 pr-4 pl-10 outline-none text-left bg-black/40 text-white" dir="ltr" />
                  <button type="button" onclick="window.SamtAuth.togglePasswordVisibility('settingsConfirmNewPass', this)" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-samt-cyan text-xs p-1">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="px-6 py-3 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs font-bold flex items-center gap-2">
                  <i class="fa-solid fa-key"></i>
                  <span>تحديث كلمة المرور</span>
                </button>
              </div>
            </form>

            <!-- Danger Zone -->
            <div class="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3">
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

          <!-- Tab 3: Preferences / Notifications Settings (Requirement 9) -->
          <div id="settingsPanelPreferences" class="space-y-6 hidden">
            <div>
              <h2 class="text-xl font-bold font-cairo text-white">التفضيلات والإشعارات</h2>
              <p class="text-xs text-slate-400 mt-1">تفضيلات استقبال التنبيهات المباشرة والإشعارات التحديثية في المتصفح.</p>
            </div>

            <div class="glass-card rounded-2xl p-6 space-y-4">
              <div class="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-white">تفعيل الإشعارات التنبيهية للموقع</h4>
                  <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">الحصول على تنبيهات الفعاليات وتحديثات الدروس فور صدورها.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input type="checkbox" id="settingsNotificationsCheckbox" class="sr-only peer" onchange="window.SamtAuth.toggleNotificationsCheckbox(this)">
                  <div class="w-10 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-samt-cyan"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function injectCourseModal() {
    if (document.getElementById('samtInlineCourseModal')) return;

    const modalHTML = `
    <div id="samtInlineCourseModal" class="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
      <div class="glass-card rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-white/15 text-right bg-[#0B132B]">
        
        <div class="bg-black/50 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="text-samt-gold text-lg"><i class="fa-solid fa-pen-to-square"></i></span>
            <h3 id="inlineModalTitle" class="text-sm font-bold font-cairo text-white">ط¥ط¶ط§ظپط© ظƒظˆط±ط³ ط¬ط¯ظٹط¯</h3>
          </div>
          <button type="button" onclick="window.SamtAuth.closeInlineCourseModal()" class="text-slate-400 hover:text-white text-lg p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form id="inlineCourseForm" onsubmit="window.SamtAuth.handleInlineCourseSave(event)" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <input type="hidden" id="inlineCourseId" />

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط¹ظ†ظˆط§ظ† ط§ظ„ظƒظˆط±ط³ / ط§ظ„ط¯ط±ط³:</label>
            <input type="text" id="inlineFormTitle" required placeholder="ظ…ط«ط§ظ„: ط£ط³ط±ط§ط± ط§ظ„طھطµظپط­ ط§ظ„ط³ط±ظٹط¹ ظˆط§ظ„ط¥ظ†طھط§ط¬ظٹط©" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط§ظ„طھطµظ†ظٹظپ:</label>
              <select id="inlineFormCategory" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white">
                <option value="basics">ط¯ظ„ظٹظ„ ط§ظ„ظ…ط¨طھط¯ط¦ظٹظ†</option>
                <option value="productivity">ط§ظ„ط¥ظ†طھط§ط¬ظٹط© ظˆط§ظ„طھظ†ط¸ظٹظ…</option>
                <option value="analytics">ط§ظ„طھط­ظ„ظٹظ„ط§طھ ظˆط§ظ„ظ€ KPIs</option>
                <option value="database">ظ‚ظˆط§ط¹ط¯ ط§ظ„ط¨ظٹط§ظ†ط§طھ</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط§ظ„ظ…ط³طھظˆظ‰:</label>
              <select id="inlineFormLevel" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white">
                <option value="ظ…ط¨طھط¯ط¦">ظ…ط¨طھط¯ط¦</option>
                <option value="ظ…طھظˆط³ط·">ظ…طھظˆط³ط·</option>
                <option value="ظ…طھظ‚ط¯ظ…">ظ…طھظ‚ط¯ظ…</option>
                <option value="ط´ط§ظ…ظ„">ط´ط§ظ…ظ„</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط§ظ„ظ…ط¯ط©:</label>
              <input type="text" id="inlineFormDuration" placeholder="10:30" class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط±ط§ط¨ط· ط§ظ„ظپظٹط¯ظٹظˆ (YouTube Embed ط£ظˆ Watch):</label>
            <input type="text" id="inlineFormVideoUrl" required placeholder="https://www.youtube.com/watch?v=..." class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none text-left bg-black/40 text-white" dir="ltr" />
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5 font-cairo text-slate-300">ط§ظ„ظˆطµظپ ظˆط§ظ„ط´ط±ط­:</label>
            <textarea id="inlineFormDesc" rows="3" placeholder="ظ…ظ„ط®طµ ظ…ط§ ظٹطھط¹ظ„ظ…ظ‡ ط§ظ„ط·ط§ظ„ط¨ ظپظٹ ظ‡ط°ط§ ط§ظ„ظƒظˆط±ط³..." class="w-full glass-card border border-white/15 focus:border-samt-cyan text-xs rounded-xl p-3 outline-none bg-black/40 text-white"></textarea>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button type="button" onclick="window.SamtAuth.closeInlineCourseModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white">ط¥ظ„ط؛ط§ط،</button>
            <button type="submit" class="btn-samt-glow px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>ط­ظپط¸ ط§ظ„ظƒظˆط±ط³</span>
            </button>
          </div>
        </form>

      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // طھط­ط¯ظٹط« ط´ط±ظٹط· ط§ظ„طھظ†ظ‚ظ„ (Navbar) ظ…ط¹ ط²ط± ظˆظ‚ط§ط¦ظ…ط© ط«ط§ط¨طھط© ط¨ط§ظ„ط¶ط؛ط· (Click-to-Toggle)
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
            <span>طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„</span>
          </button>
        `;
      } else {
        const isAdm = user.role === 'admin';
        const notifOn = user.notificationsEnabled !== false;
        const dropdownId = `samtUserDropdown_${slotIdx}`;

        slot.innerHTML = `
          <div class="relative inline-block text-right" style="position: relative;">
            <!-- ط²ط± ط§ظ„ط­ط³ط§ط¨ (ظٹظپطھط­ ظˆظٹط«ط¨طھ ط§ظ„ظ‚ط§ط¦ظ…ط© ط¨ط§ظ„ط¶ط؛ط·) -->
            <button type="button" onclick="window.SamtAuth.toggleDropdown(event, '${dropdownId}')" class="px-3.5 py-1.5 rounded-full glass-card border ${isAdm ? 'border-samt-gold/50 text-samt-gold' : 'border-samt-cyan/40 text-white'} text-xs font-bold flex items-center gap-2 shadow-md hover:border-samt-cyan transition-all select-none cursor-pointer">
              <span class="w-6 h-6 rounded-full flex items-center justify-center bg-black/50 text-xs">${user.avatar || (isAdm ? 'ًں‘‘' : 'ًں‘¤')}</span>
              <span class="truncate max-w-[100px] sm:max-w-[140px]">${user.name}</span>
              <i class="fa-solid fa-chevron-down text-[10px] opacity-70"></i>
            </button>

            <!-- ط§ظ„ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظ†ط³ط¯ظ„ط© ط§ظ„ط«ط§ط¨طھط© ط¹ظ„ظ‰ ط§ظ„ط¶ط؛ط· -->
            <div id="${dropdownId}" onclick="event.stopPropagation()" class="samt-dropdown-menu absolute left-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border border-white/20 py-2 z-[99999] text-right bg-[#0B132B] text-white" style="display: none;">
              
              <!-- User Info Card -->
              <div class="px-4 py-2.5 border-b border-white/10">
                <div class="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>${user.name}</span>
                  <span class="text-[11px] text-emerald-400 flex items-center gap-1" title="ط­ط³ط§ط¨ ظ…ظˆط«ظ‚"><i class="fa-solid fa-circle-check"></i></span>
                </div>
                <div class="text-[10px] text-slate-400 truncate mt-0.5" dir="ltr">${user.email}</div>
                <div class="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isAdm ? 'bg-samt-gold/20 text-samt-gold border border-samt-gold/40' : 'bg-samt-cyan/20 text-samt-cyan border border-samt-cyan/40'}">
                  ${isAdm ? 'ًں‘‘ ظ…ط´ط±ظپ ط§ظ„ظ…ظ†ط¸ظˆظ…ط© (Admin)' : 'ًں‘¤ ط­ط³ط§ط¨ ظ…ط³طھط®ط¯ظ… ظ…ظˆط«ظ‚'}
                </div>
              </div>

              <!-- ط²ط± ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨ (طھط¹ط¯ظٹظ„ ط§ظ„ط§ط³ظ… ظˆط§ظ„ط¨ط±ظٹط¯ ظˆط§ظ„ط¨ط§ط³ظˆظˆط±ط¯) -->
              <button type="button" onclick="window.SamtAuth.openUserSettingsModal()" class="w-full text-right px-4 py-2.5 text-xs text-samt-cyan hover:bg-white/5 font-bold transition-colors flex items-center gap-2 border-b border-white/10">
                <i class="fa-solid fa-gear text-xs"></i>
                <span>ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨ ظˆط§ظ„ط¨ط±ظٹط¯</span>
              </button>

              
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${notifOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}">
                  ${notifOn ? 'ظ…ظپط¹ظ„ط© âœ…' : 'ظ…ط¹ط·ظ„ط© ًں”•'}
                </span>
              </div>

              ${isAdm ? `
                <a href="./admin.html" class="block px-4 py-2 text-xs text-samt-gold hover:bg-white/5 font-bold transition-colors">
                  <i class="fa-solid fa-chart-line ml-2"></i> ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ط§ظ„ط´ط§ظ…ظ„ط©
                </a>
                <button type="button" onclick="window.SamtAuth.openNewCourseInline()" class="w-full text-right px-4 py-2 text-xs text-samt-cyan hover:bg-white/5 font-bold transition-colors">
                  <i class="fa-solid fa-plus-circle ml-2"></i> ط¥ط¶ط§ظپط© ظƒظˆط±ط³ ط¬ط¯ظٹط¯
                </button>
                <button type="button" onclick="window.SamtAuth.exportDataFile()" class="w-full text-right px-4 py-2 text-xs text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                  <i class="fa-solid fa-download ml-2"></i> طھطµط¯ظٹط± ط§ظ„ط¨ظٹط§ظ†ط§طھ (Export)
                </button>
              ` : ''}

              <a href="./courses.html" class="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                <i class="fa-solid fa-graduation-cap ml-2"></i> ظ…ظƒطھط¨ط© ط§ظ„ظƒظˆط±ط³ط§طھ
              </a>

              <div class="border-t border-white/10 my-1"></div>
              
              <!-- ط²ط± ط­ط°ظپ ط§ظ„ط­ط³ط§ط¨ -->
              <button type="button" onclick="window.SamtAuth.deleteCurrentAccount()" class="w-full text-right px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-bold transition-colors flex items-center gap-1.5">
                <i class="fa-solid fa-trash-can ml-1 text-xs"></i>
                <span>ط­ط°ظپ ط§ظ„ط­ط³ط§ط¨ ظ†ظ‡ط§ط¦ظٹط§ظ‹</span>
              </button>

              <!-- ط²ط± طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬ -->
              <button type="button" onclick="window.SamtAuth.logout()" class="w-full text-right px-4 py-2 text-xs text-slate-400 hover:bg-white/5 font-bold transition-colors flex items-center gap-1.5">
                <i class="fa-solid fa-right-from-bracket ml-1 text-xs"></i>
                <span>طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬</span>
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

  // ط¥ط؛ظ„ط§ظ‚ ط§ظ„ظ‚ظˆط§ط¦ظ… ط¹ظ†ط¯ ط§ظ„ظ†ظ‚ط± ظپظٹ ط£ظٹ ظ…ظƒط§ظ† ط®ط§ط±ط¬ظ‡ط§
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.samt-dropdown-menu') && !e.target.closest('button[onclick*="toggleDropdown"]')) {
      document.querySelectorAll('.samt-dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });

  // ط­ظ‚ظ† ط´ط±ظٹط· ط§ظ„ط£ط¯ظ…ظ† ط§ظ„طھظپط§ط¹ظ„ظٹ ط§ظ„ط³ط±ظٹط¹ ط£ط¹ظ„ظ‰ ط§ظ„طµظپط­ط©
  function injectAdminTopBar() {
    if (document.getElementById('samtAdminLiveBar')) return;

    const bar = document.createElement('div');
    bar.id = 'samtAdminLiveBar';
    bar.className = 'fixed top-20 left-0 right-0 z-40 bg-[#0B132B]/95 border-b border-yellow-500/30 px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md shadow-lg';
    bar.innerHTML = `
      <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div class="flex items-center gap-2 text-yellow-400 font-bold">
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>ظˆط¶ط¹ ط§ظ„ظ…ط´ط±ظپ ظ†ط´ط· (Admin Mode)</span>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" onclick="window.SamtAuth.openNewCourseInline()" class="btn-samt-glow px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-plus"></i>
            <span>ط¥ط¶ط§ظپط© ظƒظˆط±ط³</span>
          </button>
          <a href="./admin.html" class="px-3 py-1 rounded-lg glass-card text-yellow-400 hover:border-yellow-400 text-[11px] font-bold">
            <i class="fa-solid fa-sliders ml-1"></i> ظ„ظˆط­ط© ط§ظ„ط¥ط¯ط§ط±ط©
          </a>
          <button type="button" onclick="window.SamtAuth.exportDataFile()" class="px-3 py-1 rounded-lg glass-card text-slate-300 hover:text-white text-[11px] font-bold">
            <i class="fa-solid fa-file-code ml-1"></i> طھطµط¯ظٹط± ط§ظ„ط¨ظٹط§ظ†ط§طھ
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

  // ط§ظ„ظˆط§ط¬ظ‡ط© ط§ظ„ط¨ط±ظ…ط¬ظٹط© ط§ظ„ط¹ط§ظ…ط© window.SamtAuth
  window.SamtAuth = {
    ...SamtAuth,

    // ظپطھط­ ظ†ط§ظپط°ط© ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط­ط³ط§ط¨
        openUserSettingsModal: function () {
      const user = this.getCurrentUser();
      if (!user) return;

      document.getElementById('settingsUserName').value = user.name || '';
      document.getElementById('settingsUserEmail').value = user.email || '';
      document.getElementById('settingsCurrentPass').value = '';
      document.getElementById('settingsNewPass').value = '';
      document.getElementById('settingsConfirmNewPass').value = '';

      // Set notification checkbox state
      const checkbox = document.getElementById('settingsNotificationsCheckbox');
      if (checkbox) {
        checkbox.checked = user.notificationsEnabled !== false;
      }

      // Default active tab to profile
      this.switchSettingsTab('profile');

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

    // ظ…ط¹ط§ظ„ط¬ط© طھط­ط¯ظٹط« ط§ظ„ط§ط³ظ… ظˆط§ظ„ط¨ط±ظٹط¯
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

    // ظ…ط¹ط§ظ„ط¬ط© طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±
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

        switchSettingsTab: function (tabName) {
      // Hide all panels
      document.getElementById('settingsPanelProfile').classList.add('hidden');
      document.getElementById('settingsPanelSecurity').classList.add('hidden');
      document.getElementById('settingsPanelPreferences').classList.add('hidden');

      // Reset all tab button styles
      const tabs = ['settingsTabProfile', 'settingsTabSecurity', 'settingsTabPreferences'];
      tabs.forEach(t => {
        const btn = document.getElementById(t);
        if (btn) {
          btn.className = "w-full text-right px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 flex items-center gap-2.5 transition-all";
        }
      });

      // Show active panel & style active tab
      if (tabName === 'profile') {
        document.getElementById('settingsPanelProfile').classList.remove('hidden');
        document.getElementById('settingsTabProfile').className = "w-full text-right px-4 py-3 rounded-xl text-xs font-bold bg-samt-cyan/15 text-samt-cyan flex items-center gap-2.5 transition-all";
      } else if (tabName === 'security') {
        document.getElementById('settingsPanelSecurity').classList.remove('hidden');
        document.getElementById('settingsTabSecurity').className = "w-full text-right px-4 py-3 rounded-xl text-xs font-bold bg-samt-cyan/15 text-samt-cyan flex items-center gap-2.5 transition-all";
      } else if (tabName === 'preferences') {
        document.getElementById('settingsPanelPreferences').classList.remove('hidden');
        document.getElementById('settingsTabPreferences').className = "w-full text-right px-4 py-3 rounded-xl text-xs font-bold bg-samt-cyan/15 text-samt-cyan flex items-center gap-2.5 transition-all";
      }
    },

    toggleNotificationsCheckbox: function (checkbox) {
      const user = this.getCurrentUser();
      if (!user) return;

      const newStatus = checkbox.checked;
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

    checkRegPasswordStrength: function (val) {
      const wrapper = document.getElementById('authRegPasswordStrength');
      const txt = document.getElementById('strengthText');
      const bar = document.getElementById('strengthBar');
      if (!val) {
        if (wrapper) wrapper.classList.add('hidden');
        return;
      }
      if (wrapper) wrapper.classList.remove('hidden');

      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (val.length < 6) {
        if (txt) {
          txt.textContent = 'ضعيف جداً ❌';
          txt.className = 'text-rose-400';
        }
        if (bar) bar.className = 'h-full w-1/4 bg-rose-500 transition-all duration-300';
      } else if (score <= 2) {
        if (txt) {
          txt.textContent = 'ضعيف ⚠️';
          txt.className = 'text-rose-400';
        }
        if (bar) bar.className = 'h-full w-1/3 bg-rose-500 transition-all duration-300';
      } else if (score <= 4) {
        if (txt) {
          txt.textContent = 'متوسط ⚠️';
          txt.className = 'text-amber-400';
        }
        if (bar) bar.className = 'h-full w-2/3 bg-amber-500 transition-all duration-300';
      } else {
        if (txt) {
          txt.textContent = 'قوي جداً ✅';
          txt.className = 'text-emerald-400';
        }
        if (bar) bar.className = 'h-full w-full bg-emerald-500 transition-all duration-300';
      }
    },

    toggleAdminRegistrationField: function (checked) {
      const section = document.getElementById('regAdminCodeSection');
      if (section) {
        if (checked) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
          const codeInput = document.getElementById('authRegAdminCode');
          if (codeInput) codeInput.value = '';
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
        SamtAuth.toast(`ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ظٹط§ ${res.user.name} (${res.user.role === 'admin' ? 'ظ…ط´ط±ظپ' : 'ظ…ط³طھط®ط¯ظ…'})`, 'success');
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

        SamtAuth.toast(`طھظ… ط¥ط±ط³ط§ظ„ ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ ط¥ظ„ظ‰ ط¨ط±ظٹط¯ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ًں“©`, 'info');
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
        SamtAuth.toast(`طھظ…طھ ط¥ط¹ط§ط¯ط© ط¥ط±ط³ط§ظ„ ط±ظ…ط² ط§ظ„طھط­ظ‚ظ‚ ط¥ظ„ظ‰ ط¨ط±ظٹط¯ظƒ ًں“©`, 'info');
      }
    },

    openNewCourseInline: function () {
      injectCourseModal();
      document.getElementById('inlineCourseId').value = '';
      document.getElementById('inlineModalTitle').textContent = 'ط¥ط¶ط§ظپط© ظƒظˆط±ط³ ط¬ط¯ظٹط¯';
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
      document.getElementById('inlineModalTitle').textContent = `طھط¹ط¯ظٹظ„: ${course.title}`;
      document.getElementById('inlineFormTitle').value = course.title;
      document.getElementById('inlineFormCategory').value = course.category || 'basics';
      document.getElementById('inlineFormLevel').value = course.level || 'ظ…ط¨طھط¯ط¦';
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
        basics: 'ط¯ظ„ظٹظ„ ط§ظ„ظ…ط¨طھط¯ط¦ظٹظ†',
        productivity: 'ط§ظ„ط¥ظ†طھط§ط¬ظٹط© ظˆط§ظ„طھظ†ط¸ظٹظ…',
        analytics: 'ط§ظ„طھط­ظ„ظٹظ„ط§طھ ظˆظ…ط¤ط´ط±ط§طھ ط§ظ„ط£ط¯ط§ط،',
        database: 'ظ‚ظˆط§ط¹ط¯ ط§ظ„ط¨ظٹط§ظ†ط§طھ ظˆط§ظ„ط³ظٹط±ظپط±ط§طھ'
      };

      let courses = getCoursesList();

      if (id) {
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
          courses[index] = {
            ...courses[index],
            title,
            category,
            categoryName: categoryNames[category] || 'ط´ط±ظˆط­ط§طھ ط¹ط§ظ…ط©',
            level,
            duration,
            videoUrl,
            description
          };
          SamtAuth.toast('طھظ… طھط­ط¯ظٹط« ط¨ظٹط§ظ†ط§طھ ط§ظ„ظƒظˆط±ط³ ط¨ظ†ط¬ط§ط­!', 'success');
        }
      } else {
        const newCourse = {
          id: 'course-' + Date.now().toString().slice(-4),
          title,
          category,
          categoryName: categoryNames[category] || 'ط´ط±ظˆط­ط§طھ ط¹ط§ظ…ط©',
          level,
          duration,
          videoUrl,
          description,
          attachments: [
            { name: 'ًں“„ ط¯ظ„ظٹظ„ ط§ظ„ط´ط±ط­ ظˆط§ظ„ظ…ظ„ظپط§طھ ط§ظ„ظ…ط±ظپظ‚ط©', url: 'downloads.html' }
          ]
        };
        courses.unshift(newCourse);
        SamtAuth.toast('طھظ…طھ ط¥ط¶ط§ظپط© ط§ظ„ظƒظˆط±ط³ ط§ظ„ط¬ط¯ظٹط¯ ط¨ظ†ط¬ط§ط­!', 'success');
      }

      saveCoursesList(courses);
      this.closeInlineCourseModal();
      setTimeout(() => window.location.reload(), 400);
    },

    deleteCourseInline: function (id) {
      if (!confirm('ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط­ط°ظپ ظ‡ط°ط§ ط§ظ„ظƒظˆط±ط³ ظ†ظ‡ط§ط¦ظٹط§ظ‹طں')) return;
      let courses = getCoursesList();
      courses = courses.filter(c => c.id !== id);
      saveCoursesList(courses);
      SamtAuth.toast('طھظ… ط­ط°ظپ ط§ظ„ظƒظˆط±ط³ ط¨ظ†ط¬ط§ط­.', 'info');
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

      const codeContent = `/**\n * ط³ظ…طھ SAMT - ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط±ظƒط²ظٹط© ط§ظ„ظ…ط­ط¯ط«ط©\n * طھظ… ط§ظ„طھطµط¯ظٹط± ط¨ظˆط§ط³ط·ط© ظ„ظˆط­ط© طھط­ظƒظ… ط§ظ„ظ…ط´ط±ظپ\n */\n\nconst AgentProData = ${JSON.stringify(fullData, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.AgentProData = AgentProData;\n}\n`;

      const blob = new Blob([codeContent], { type: 'application/javascript;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'courses-data.js';
      link.click();
      SamtAuth.toast('طھظ… طھط­ظ…ظٹظ„ ظ…ظ„ظپ courses-data.js ط§ظ„ظ…ط­ط¯ط«!', 'success');
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
