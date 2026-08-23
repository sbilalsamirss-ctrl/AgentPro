# 🎧 منصة AgentPro - بوابة النظام وأكاديمية الكورسات والبرامج

أهلاً بك في المستودع الرسمي لموقع **AgentPro**، المنظومة المتطورة لإدارة الكول سنتر وأكاديمية الشروحات والكورسات العملية.

الموقع مبني بهيكلية برمجية مستقلة (Standalone Vector SVGs & CSS) تضمن عمل الموقع بنسبة 100% على **GitHub Pages** دون أي مشاكل في الصور أو الروابط المفقودة.

---

## 🌐 الروابط الرسمية
- **مستودع GitHub**: [https://github.com/sbilalsamirss-ctrl/AgentPro](https://github.com/sbilalsamirss-ctrl/AgentPro)
- **رابط الموقع على GitHub Pages**: `https://sbilalsamirss-ctrl.github.io/AgentPro/`

---

## 📂 هيكل ملفات المشروع

```text
AgentPro/
├── index.html                   # البوابة الرئيسية (Hero, إحصائيات حية, أبرز الكورسات, المميزات, تحميل البرنامج)
├── courses.html                 # أكاديمية الكورسات الكاملة (بحث فوري, فلاتر التصنيفات, مشغل الفيديوهات, المرفقات)
├── downloads.html               # مركز تحميل البرامج والملفات المرفقة وجدول متطلبات التشغيل
├── tutorials.html               # صفحة إعادة توجيه تلقائية لأكاديمية الكورسات
├── README.md                    # دليل التوثيق وإضافة المحتوى
└── assets/
    └── js/
        └── courses-data.js      # ⭐️ ملف البيانات المركزي لإضافة أي كورس أو فيديو جديد بسهولة
```

---

## 🎓 كيف تضيف كورس أو فيديو جديد مستقبلاً؟

لن تحتاج إلى فتح أو تعديل ملفات الـ HTML!
كل ما عليك فعله هو فتح ملف [`assets/js/courses-data.js`](./assets/js/courses-data.js) وإضافة الكورس الجديد داخل مصفوفة `courses`:

```javascript
{
  id: "course-07",
  title: "عنوان الكورس أو الفيديو الجديد",
  category: "analytics", // "basics" | "analytics" | "ticketing" | "recordings" | "database"
  categoryName: "التحليلات والـ KPIs",
  level: "متوسط",
  duration: "10:15",
  videoUrl: "https://www.youtube-nocookie.com/embed/YOUR_VIDEO_ID",
  description: "وصف مختصر لما يقدمه هذا الفيديو التعليمي...",
  attachments: [
    { name: "ملف الشرح PDF", url: "downloads.html" }
  ]
}
```

---

## 🚀 كيفية رفع التحديثات إلى GitHub Pages

1. افتح صفحة المستودع: **[https://github.com/sbilalsamirss-ctrl/AgentPro](https://github.com/sbilalsamirss-ctrl/AgentPro)**
2. اضغط على **Add file** ⬅️ **Upload files**.
3. اسحب الملفات التالية وضعها في المتصفح:
   - `index.html`
   - `courses.html`
   - `downloads.html`
   - `tutorials.html`
   - `assets/js/courses-data.js`
4. في الأسفل، اضغط على الزر الأخضر **Commit changes**.
5. سيعمل الموقع فوراً بكافة التحديثات!
