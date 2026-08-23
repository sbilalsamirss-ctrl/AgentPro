# 🎧 AgentPro - Modern Call Center Management Suite

Welcome to the official website repository for **AgentPro**, the next-generation Call Center Management & Telephony Suite.

This website is designed with a modern Corporate SaaS aesthetic (Deep Blues, Clean Whites, and Slate Greys), fully responsive across all devices, and configured with clean relative paths for immediate hosting on **GitHub Pages**.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [https://github.com/sbilalsamirss-ctrl/AgentPro](https://github.com/sbilalsamirss-ctrl/AgentPro)
- **GitHub Pages URL**: `https://sbilalsamirss-ctrl.github.io/AgentPro/`

---

## 📂 Project Structure

```text
AgentPro/
├── index.html                   # Main Landing Page (Hero, Features, Stats, Specs, FAQ)
├── tutorials.html               # Dedicated Video Tutorials Hub (with search, category filters & modal player)
├── downloads.html               # Dedicated Software Releases & System Specs Center
├── README.md                    # Project Documentation
└── assets/
    ├── css/
    │   ├── style.css            # Design tokens, colors, typography, global layout
    │   ├── components.css       # Buttons, cards, modals, tables, accordions, footer
    │   └── responsive.css       # Media queries for Mobile and Tablet viewports
    ├── js/
    │   ├── main.js              # Navbar scroll, mobile drawer, video modals, search filter
    │   └── data.js              # Central database for videos and download releases
    └── images/
        ├── logo.svg             # Vector Headset & Soundwave Logo
        └── dashboard-mockup.svg # Vector Modern Dashboard Preview Illustration
```

---

## 🎬 How to Add or Edit Video Tutorials

You do **not** need to touch complex HTML to add new tutorial videos! Simply open [`assets/js/data.js`](./assets/js/data.js) and add an item to the `tutorials` array:

```javascript
{
  id: "tut-07",
  category: "analytics", // "getting-started" | "analytics" | "ticketing" | "recordings" | "database"
  categoryName: "KPIs & Analytics",
  title: "Your Video Title Here",
  description: "Brief summary of what this video explains...",
  duration: "04:15",
  videoUrl: "https://www.youtube-nocookie.com/embed/YOUR_VIDEO_ID",
  thumbnail: "assets/images/dashboard-mockup.svg"
}
```

---

## 💾 How to Add New Software Releases

Open [`assets/js/data.js`](./assets/js/data.js) and add or update the `releases` array:

```javascript
{
  id: "win-v2-5",
  os: "Windows",
  icon: "🪟",
  version: "v2.5.0",
  releaseDate: "2026-09-01",
  fileName: "AgentPro-Setup-2.5.0.exe",
  fileSize: "70.2 MB",
  downloadUrl: "https://github.com/sbilalsamirss-ctrl/AgentPro/releases/download/v2.5.0/AgentPro-Setup.exe",
  requirements: [
    "Windows 10 / 11 (64-bit)",
    "4 GB RAM minimum"
  ]
}
```

---

## 🌐 How to Host on GitHub Pages

1. Push all files to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete AgentPro landing page, video hub and download center"
   git push origin main
   ```
2. Go to your GitHub repository settings:
   - **Settings** → **Pages**
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select the `main` branch and `/ (root)` folder.
   - Click **Save**.
3. Your website will be live in 1-2 minutes!

---

## 💡 Tech Stack
- **HTML5 & CSS3** (Custom Properties / Flexbox / CSS Grid)
- **Vanilla JavaScript** (Zero bloated dependencies, maximum speed)
- **Vector SVG Graphics** (Crisp on Retina & 4K displays)
- **No Build Step Required** (Open `index.html` directly in any web browser)
