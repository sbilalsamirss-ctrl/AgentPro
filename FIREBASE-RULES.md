# قواعد Firestore المطلوبة

انسخ الكود ده كله والصقه في:
**console.firebase.google.com → المشروع → Firestore Database → Rules → Publish**

> ملاحظة: ده بيستبدل القواعد الحالية بالكامل. القواعد دي بتحافظ على نفس السلوك
> الحالي للكورسات والبرامج (الكل يقرأ، المشرف بس هو اللي يكتب) وبتضيف جداول
> الإحصائيات الجديدة.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
          && request.auth.token.email == 'sbilalsamirss@gmail.com';
    }

    // ---- المحتوى العام: الكل يقرأ، المشرف بس يكتب ----
    match /courses/{doc}       { allow read: if true; allow write: if isAdmin(); }
    match /programs/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /programAssets/{doc} { allow read: if true; allow write: if isAdmin(); }

    // ---- الإحصائيات المجهولة ----
    // الزائر يقدر يضيف صفّه هو بس، ومش بيقدر يقرأ أي حاجة تانية ولا يمسح.
    // القوائم دي بتمنع تخزين أي حقل غير المسموح بيه (يعني مستحيل يتخزّن IP).

    match /analytics_visits/{doc} {
      allow read: if isAdmin();
      allow create, update: if request.resource.data.keys().hasOnly(['day','country','page','ts'])
                            && request.resource.data.country is string
                            && request.resource.data.country.size() <= 2;
      allow delete: if isAdmin();
    }

    match /analytics_events/{doc} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasOnly(['type','refId','refName','vid','country','day','ts'])
                    && request.resource.data.type in ['download','course_complete'];
      allow update, delete: if isAdmin();
    }

    match /analytics_progress/{doc} {
      allow read: if isAdmin();
      allow create, update: if request.resource.data.keys().hasOnly(['courseId','courseTitle','vid','percent','completed','country','day','updatedAt'])
                            && request.resource.data.percent is int
                            && request.resource.data.percent >= 0
                            && request.resource.data.percent <= 100;
      allow delete: if isAdmin();
    }
  }
}
```

# تفعيل تسجيل الدخول بجوجل

1. console.firebase.google.com → **Authentication → Sign-in method**
2. اضغط **Google** → **Enable** → اختر إيميل الدعم → **Save**
3. في نفس الصفحة تحت → **Authorized domains** → **Add domain**
   وضيف: `sbilalsamirss-ctrl.github.io`

من غير الخطوة التالتة دي، زر جوجل هيقول «نطاق الموقع غير مسموح به».
