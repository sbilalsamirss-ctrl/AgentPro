/**
 * AgentPro - Data Configuration File
 * -------------------------------------------------------------
 * You can easily add, edit, or remove tutorial videos and software releases
 * in this file without modifying the HTML structure!
 */

const AgentProData = {
  // Software Releases & Downloads
  releases: [
    {
      id: "win-latest",
      os: "Windows",
      icon: "🪟",
      version: "v2.4.2",
      releaseDate: "2026-08-15",
      fileName: "AgentPro-Setup-2.4.2-x64.exe",
      fileSize: "68.4 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases/download/v2.4.2/AgentPro-Setup-2.4.2.exe",
      badge: "Most Popular",
      requirements: [
        "Windows 10 / 11 (64-bit)",
        "4 GB RAM minimum (8 GB recommended)",
        "DirectX 11 compatible graphics",
        "Fast SQLite / PostgreSQL support"
      ]
    },
    {
      id: "mac-latest",
      os: "macOS",
      icon: "🍎",
      version: "v2.4.2",
      releaseDate: "2026-08-15",
      fileName: "AgentPro-2.4.2-Universal.dmg",
      fileSize: "72.1 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases/download/v2.4.2/AgentPro-2.4.2.dmg",
      badge: "Universal Binary",
      requirements: [
        "macOS 12 Monterey or higher",
        "Apple Silicon (M1/M2/M3/M4) & Intel",
        "4 GB Unified Memory minimum",
        "CoreAudio Low-Latency driver"
      ]
    },
    {
      id: "db-tool",
      os: "Database Connector",
      icon: "🗄️",
      version: "v1.8.0",
      releaseDate: "2026-07-20",
      fileName: "AgentPro-DB-Sync-Tool.zip",
      fileSize: "14.2 MB",
      downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases/download/v1.8.0/AgentPro-DB-Sync.zip",
      badge: "Admin Utility",
      requirements: [
        "PostgreSQL 12+, MySQL 8+, MSSQL, SQLite",
        "Cross-platform Java 17+ or Standalone binary",
        "SSL TLS 1.3 encryption ready"
      ]
    }
  ],

  // Tutorial Videos Hub
  tutorials: [
    {
      id: "tut-01",
      category: "getting-started",
      categoryName: "Getting Started",
      title: "AgentPro Quick Setup & First Launch",
      description: "Learn how to install AgentPro, configure your agent profile, and connect your SIP/VoIP headset in under 3 minutes.",
      duration: "03:45",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", // Placeholder or direct video embed link
      thumbnail: "assets/images/dashboard-mockup.svg"
    },
    {
      id: "tut-02",
      category: "analytics",
      categoryName: "KPIs & Analytics",
      title: "Mastering Real-time Call Analytics & Queue Reports",
      description: "A deep dive into measuring Average Handle Time (AHT), First Call Resolution (FCR), and generating executive KPI export sheets.",
      duration: "07:20",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      thumbnail: "assets/images/dashboard-mockup.svg"
    },
    {
      id: "tut-03",
      category: "ticketing",
      categoryName: "Ticketing System",
      title: "Managing Customer Support Tickets & Escalations",
      description: "Automate call tagging, customer history recall, and automatic ticket assignment across multi-tier support teams.",
      duration: "05:10",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      thumbnail: "assets/images/dashboard-mockup.svg"
    },
    {
      id: "tut-04",
      category: "recordings",
      categoryName: "Call Recordings",
      title: "High-Fidelity Call Recording & Audio Waveform Player",
      description: "How to search, replay, bookmark, and export encrypted audio recordings with automated metadata tagging.",
      duration: "04:30",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      thumbnail: "assets/images/dashboard-mockup.svg"
    },
    {
      id: "tut-05",
      category: "database",
      categoryName: "Database & Security",
      title: "Configuring PostgreSQL & MySQL Enterprise Replication",
      description: "Step-by-step guide to connecting your AgentPro instance to a secure distributed database cluster with auto failover.",
      duration: "08:15",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      thumbnail: "assets/images/dashboard-mockup.svg"
    },
    {
      id: "tut-06",
      category: "getting-started",
      categoryName: "Getting Started",
      title: "Agent Multi-line Telephony & Hotkey Shortcuts",
      description: "Boost agent productivity with quick dial pad shortcuts, instant warm transfers, and supervisor whisper modes.",
      duration: "06:05",
      videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      thumbnail: "assets/images/dashboard-mockup.svg"
    }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.AgentProData = AgentProData;
}
