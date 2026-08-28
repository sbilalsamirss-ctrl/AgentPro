/**
 * ==========================================================================
 * سمت SAMT - قاعدة البيانات المركزية للبرامج والكورسات والمشتركين
 * ==========================================================================
 */

const AgentProData = {
  // 💾 مركز البرامج والتطبيقات المتاحة للمنظومة
  releases: [
    {
      id: "samt-browser",
      name: "متصفح سمت Anti-Gravity Browser",
      category: "متصفحات وتطبيقات ويب",
      icon: "🌐",
      version: "v3.2.0 (Stable)",
      releaseDate: "2026-08-20",
      fileSize: "74.5 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases",
      badge: "الأكثر تحميلاً",
      desc: "متصفح فائق السرعة والخفة مع حجب إعلانات مدمج واستهلاك رامات لا يتجاوز 120MB.",
      platforms: ["Windows 10/11", "macOS Universal", "Linux"]
    },
    {
      id: "samt-hub",
      name: "برنامج سمت للإنتاجية وإدارة المهام (SAMT Hub)",
      category: "أدوات إنتاجية وإدارة",
      icon: "⚡",
      version: "v2.4.2",
      releaseDate: "2026-08-15",
      fileSize: "68.4 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases",
      badge: "إصدار رسمي",
      desc: "منصة موحدة لتنظيم المهام، إدارة الاتصالات، ومتابعة مؤشرات الأداء اللحظية.",
      platforms: ["Windows 10/11", "macOS"]
    },
    {
      id: "samt-db-tool",
      name: "أداة مزامنة ونقل قواعد البيانات (SAMT DB Sync)",
      category: "أدوات المطورين والسيرفرات",
      icon: "🗄️",
      version: "v1.8.0",
      releaseDate: "2026-07-20",
      fileSize: "14.2 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases",
      badge: "أداة تقنية",
      desc: "أداة سريعة لربط قواعد بيانات PostgreSQL, MySQL, SQLite, MSSQL مع تشفير كامل.",
      platforms: ["Cross-Platform CLI / GUI"]
    }
  ],

  // 🎓 أكاديمية الكورسات والدروس
  courses: [
    {
      id: "course-01",
      title: "دليل البداية الشامل: تثبيت واستخدام منظومة سمت وتطبيقاتها",
      category: "basics",
      categoryName: "دليل المبتدئين",
      level: "مبتدئ",
      duration: "08:30",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      description: "شرح شامل لتثبيت متصفح وتطبيقات سمت، ضبط الإعدادات المفضلة، واستخدام ميزات تسريع الأداء.",
      attachments: [
        { name: "📄 دليل البدء السريع PDF", url: "downloads.html" }
      ]
    },
    {
      id: "course-02",
      title: "أسرار الإنتاجية ومضاعفة سرعة العمل والتصفح اليومي",
      category: "productivity",
      categoryName: "الإنتاجية والتنظيم",
      level: "متوسط",
      duration: "12:15",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      description: "تعلم اختصارات لوحة المفاتيح المتقدمة، تنظيم التبويبات والمساحات، وحجب المشتتات.",
      attachments: [
        { name: "📑 خريطة اختصارات لوحة المفاتيح PDF", url: "downloads.html" }
      ]
    },
    {
      id: "course-03",
      title: "التحليلات ومؤشرات الأداء الذكية للبرامج والفرق",
      category: "analytics",
      categoryName: "التحليلات ومؤشرات الأداء",
      level: "متوسط",
      duration: "14:15",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      description: "شرح استخراج التقارير وتحليل البيانات ولوحات التحكم اللحظية وتصديرها بصيغ متعددة.",
      attachments: [
        { name: "📊 قالب التقارير Excel", url: "downloads.html" }
      ]
    },
    {
      id: "course-04",
      title: "ربط وتأمين قواعد البيانات والسيرفرات للمطورين",
      category: "database",
      categoryName: "قواعد البيانات والسيرفرات",
      level: "متقدم",
      duration: "18:00",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      description: "دليل تقني لربط التطبيقات بقواعد البيانات السحابية والمحلية وتأمينها بتشفير TLS 1.3.",
      attachments: [
        { name: "🗄️ سكربتات التهيئة SQL", url: "downloads.html" }
      ]
    }
  ],

  // ✉️ المشتركون في القائمة البريدية
  subscribers: [
    { name: "أحمد علي", email: "ahmed@example.com", date: "2026-08-24" },
    { name: "سارة محمد", email: "sara@example.com", date: "2026-08-24" }
  ]
};

if (typeof window !== 'undefined') {
  window.AgentProData = AgentProData;
}
