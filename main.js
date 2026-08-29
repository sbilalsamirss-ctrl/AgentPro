/**
 * AgentPro - Main JavaScript Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scroll Effect
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // 2. Mobile Menu Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
      navToggle.innerHTML = isExpanded ? '✕' : '☰';
    });

    // Close mobile menu when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.innerHTML = '☰';
      });
    });
  }

  // 3. Video Modal Controller
  const videoModal = document.getElementById('videoModal');
  const modalIframe = document.getElementById('modalIframe');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');

  window.openVideoModal = (videoUrl, title = "AgentPro Video Tutorial") => {
    if (!videoModal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalIframe) {
      // If it's a youtube embed or generic video URL
      modalIframe.src = videoUrl;
    }
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    if (modalIframe) modalIframe.src = '';
    document.body.style.overflow = 'auto';
  };

  if (modalClose) {
    modalClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  // 4. Interactive Live Demo Modal
  const demoModal = document.getElementById('demoModal');
  const demoClose = document.getElementById('demoClose');

  window.openDemoModal = () => {
    if (!demoModal) return;
    demoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDemoModal = () => {
    if (!demoModal) return;
    demoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  if (demoClose) {
    demoClose.addEventListener('click', closeDemoModal);
  }

  if (demoModal) {
    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        closeDemoModal();
      }
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeDemoModal();
    }
  });

  // 5. FAQ Accordion Functionality
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other accordion items
        faqItems.forEach(otherItem => otherItem.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 6. Dynamic Tutorials Renderer & Filter (if on tutorials page)
  const tutorialsContainer = document.getElementById('tutorialsGrid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('tutorialSearch');

  if (tutorialsContainer && window.AgentProData?.tutorials) {
    const renderTutorials = (items) => {
      if (items.length === 0) {
        tutorialsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
            <p style="font-size: 1.2rem; margin-bottom: 8px;">🔍 No tutorials found</p>
            <p style="font-size: 0.9rem;">Try searching for another keyword or selecting a different category.</p>
          </div>
        `;
        return;
      }

      tutorialsContainer.innerHTML = items.map(tut => `
        <div class="video-card" onclick="openVideoModal('${tut.videoUrl}', '${tut.title.replace(/'/g, "\\'")}')">
          <div class="video-thumbnail">
            <img src="${tut.thumbnail}" alt="${tut.title}" loading="lazy">
            <div class="play-badge">▶</div>
            <span class="video-duration">${tut.duration}</span>
          </div>
          <div class="video-content">
            <span class="video-category">${tut.categoryName}</span>
            <h3 class="video-title">${tut.title}</h3>
            <p class="video-desc">${tut.description}</p>
          </div>
        </div>
      `).join('');
    };

    // Initial render
    let currentCategory = 'all';
    let currentSearchTerm = '';

    const filterAndRender = () => {
      let filtered = window.AgentProData.tutorials;
      if (currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentCategory);
      }
      if (currentSearchTerm.trim() !== '') {
        const query = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query)
        );
      }
      renderTutorials(filtered);
    };

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        filterAndRender();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        filterAndRender();
      });
    }

    // Render initially
    filterAndRender();
  }

  // 7. Dynamic Downloads Renderer (if on downloads page)
  const downloadsContainer = document.getElementById('downloadsGrid');
  if (downloadsContainer && window.AgentProData?.releases) {
    downloadsContainer.innerHTML = window.AgentProData.releases.map(release => `
      <div class="download-card ${release.id === 'win-latest' ? 'highlight' : ''}">
        <div class="os-icon">${release.icon}</div>
        <h3>${release.os}</h3>
        <span class="version-tag">${release.version} (${release.fileSize})</span>
        <p style="color: var(--text-muted); font-size: 0.875rem;">Released on ${release.releaseDate}</p>
        
        <ul class="download-specs-list">
          ${release.requirements.map(req => `
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              ${req}
            </li>
          `).join('')}
        </ul>

        <a href="${release.downloadUrl}" class="btn btn-primary btn-glow" style="width: 100%;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download ${release.fileName}
        </a>
      </div>
    `).join('');
  }

  // 8. Auto Update Current Year in Footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
