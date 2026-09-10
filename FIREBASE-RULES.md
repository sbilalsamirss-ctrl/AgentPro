# قواعد Firestore

انسخ الكود ده والصقه في:
**console.firebase.google.com → المشروع → Firestore Database → Rules → Publish**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
          && request.auth.token.email == 'sbilalsamirss@gmail.com';
    }

    // المحتوى العام: الكل يقرأ، المشرف بس يكتب.
    match /courses/{doc}       { allow read: if true; allow write: if isAdmin(); }
    match /programs/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /programAssets/{doc} { allow read: if true; allow write: if isAdmin(); }

    // أي حاجة تانية ممنوعة تماماً.
    match /{document=**} { allow read, write: if false; }
  }
}
```

الموقع مش بيجمع أي إحصائيات، فمفيش جداول تانية محتاجة صلاحيات.

# تفعيل تسجيل الدخول بجوجل

لازم يتفعّل عشان تقدر تدخل لوحة الإدارة من `admin.html`:

1. console.firebase.google.com → **Authentication → Sign-in method**
2. اضغط **Google** → **Enable** → اختر إيميل الدعم → **Save**
3. تحت في نفس الصفحة → **Authorized domains** → **Add domain**
   وضيف: `sbilalsamirss-ctrl.github.io`

من غير الخطوة التالتة، زر جوجل هيقول «نطاق الموقع غير مسموح به».
