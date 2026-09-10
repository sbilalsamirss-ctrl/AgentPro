# سمت SAMT

موقع عربي لتحميل البرامج والتطبيقات ومتابعة الكورسات التدريبية.

**الموقع:** https://sbilalsamirss-ctrl.github.io/AgentPro/

## كيف يشتغل

موقع ساكن (HTML + JavaScript + Tailwind عبر CDN) مستضاف على GitHub Pages،
وقاعدة بيانات Firestore بتخزّن الكورسات والبرامج عشان تظهر لكل الزوار من أي جهاز.

- مفيش حسابات للزوار — كل المحتوى مفتوح للجميع.
- مفيش تتبّع ولا إحصائيات — تقدّم الكورسات بيتخزّن في متصفح الزائر نفسه.
- الإدارة من `admin.html` بتسجيل دخول Firebase (حساب المشرف فقط).

## الملفات

```text
index.html              الصفحة الرئيسية
courses.html            قائمة الكورسات
course-view.html        مشغّل الكورس والدروس
downloads.html          مركز تحميل البرامج
admin.html              لوحة الإدارة (دخول Firebase)
course-builder.html     إضافة/تعديل كورس
program-builder.html    إضافة/تعديل برنامج
privacy.html            الشروط وسياسة الخصوصية
404.html                صفحة الخطأ
tutorials.html          تحويل إلى courses.html

assets/js/
  firebase-init.js      الاتصال بـ Firestore ومزامنة الكورسات والبرامج
  auth.js               هوية المشرف + إشعارات واجهة صغيرة
  night-sky.js          خلفية السماء (وضع مخفّف تلقائي على الموبايل)
  samt-notify.js        شارة "جديد" وإشعارات المتصفح الاختيارية
```

## إعداد Firebase

الخطوات المطلوبة (قواعد Firestore وتفعيل الدخول بجوجل) في **[FIREBASE-RULES.md](FIREBASE-RULES.md)**.

## التعديل

الكورسات والبرامج بتتضاف من لوحة الإدارة على الموقع مباشرة وبتتحفظ في Firestore —
مش محتاج ترفع أي ملف على GitHub عشان تضيف كورس أو برنامج.
