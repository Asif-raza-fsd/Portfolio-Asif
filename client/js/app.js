/**
 * Asif Raza — Video Editor & Colorist Portfolio
 * Main Frontend Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    settings: null,
    projects: [],
    activeCategory: 'all',
    colorGrades: [],
    activeComparisonIndex: 0,
  };

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Hero Elements
  const heroIntro = document.getElementById('heroIntro');
  const heroName = document.getElementById('heroName');
  const heroTitle = document.getElementById('heroTitle');
  const heroPortraitImg = document.getElementById('heroPortraitImg');
  const downloadCvBtn = document.getElementById('downloadCvBtn');
  const statExp = document.getElementById('statExp');
  const statProjects = document.getElementById('statProjects');
  const statClients = document.getElementById('statClients');

  // Social Links
  const socialInstagram = document.getElementById('socialInstagram');
  const socialYoutube = document.getElementById('socialYoutube');
  const socialLinkedin = document.getElementById('socialLinkedin');
  const socialBehance = document.getElementById('socialBehance');

  // About & Contact Elements
  const aboutBio = document.getElementById('aboutBio');
  const contactEmailLink = document.getElementById('contactEmailLink');
  const contactEmailText = document.getElementById('contactEmailText');
  const contactPhoneText = document.getElementById('contactPhoneText');
  const contactLocationText = document.getElementById('contactLocationText');

  // Portfolio & Filter Tabs
  const filterTabs = document.getElementById('filterTabs');
  const projectsGrid = document.getElementById('projectsGrid');

  // Color Grade Slider Elements
  const colorGradeSlider = document.getElementById('colorGradeSlider');
  const sliderBeforeWrap = document.getElementById('sliderBeforeWrap');
  const sliderBeforeImg = document.getElementById('sliderBeforeImg');
  const sliderAfterImg = document.getElementById('sliderAfterImg');
  const sliderHandle = document.getElementById('sliderHandle');
  const compCamera = document.getElementById('compCamera');
  const compColorSpace = document.getElementById('compColorSpace');
  const compNotes = document.getElementById('compNotes');
  const comparisonSelector = document.getElementById('comparisonSelector');

  // Video Modal Elements
  const videoModal = document.getElementById('videoModal');
  const videoContainer = document.getElementById('videoContainer');
  const closeVideoModal = document.getElementById('closeVideoModal');

  // Inquiry Form & Toast
  const inquiryForm = document.getElementById('inquiryForm');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');
  const toastContainer = document.getElementById('toastContainer');

  /* ==========================================================================
     1. TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <div style="color:${type === 'error' ? '#E74C3C' : '#FD6F00'}; font-size:18px; line-height:1;">
        ${type === 'error' ? '⚠️' : '✓'}
      </div>
      <div class="toast-message">${message}</div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  /* ==========================================================================
     2. NAVIGATION & SMOOTH SCROLLING
     ========================================================================== */
  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active Nav Link Spy on Scroll
  function updateActiveNavLink() {
    const sections = ['home', 'services', 'about', 'portfolio', 'contact'];
    const scrollPos = window.scrollY + 140;

    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollPos) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sections[i]}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        break;
      }
    }
  }

  /* ==========================================================================
     3. FETCH & RENDER SITE SETTINGS (HERO & STATS)
     ========================================================================== */
  async function loadSettings() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/settings?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.data) {
        state.settings = data.data;
        renderSettings(data.data);
      }
    } catch (err) {
      console.warn('Backend unavailable, using default settings:', err);
      // Use fallback defaults
      renderSettings(CONFIG.DEFAULT_STATS);
    }
  }

  function renderSettings(settings) {
    if (heroName) heroName.textContent = settings.heroName || 'Asif Raza';
    if (heroTitle) heroTitle.textContent = settings.heroTitle || 'Video Editor & Colorist';
    if (settings.heroBio && aboutBio) aboutBio.textContent = settings.heroBio;

    // Stats
    if (statExp) statExp.textContent = settings.experienceYears || '2+';
    if (statProjects) statProjects.textContent = settings.projectsDone || '50+';
    if (statClients) statClients.textContent = settings.happyClients || '20+';

    // Portrait Image
    if (settings.heroPortraitUrl && heroPortraitImg) {
      heroPortraitImg.src = settings.heroPortraitUrl;
    }

    // Socials - Instagram
    if (settings.socialLinks && settings.socialLinks.instagram && socialInstagram) {
      socialInstagram.href = settings.socialLinks.instagram;
    }

    // Contact info
    const email = settings.contactEmail || 'asif.r2108@gmail.com';
    if (contactEmailLink) contactEmailLink.href = `mailto:${email}`;
    if (contactEmailText) contactEmailText.textContent = email;

    const phone = settings.contactPhone || '+918707312326';
    if (contactPhoneText) {
      contactPhoneText.textContent = phone;
      const phoneParentLink = contactPhoneText.closest('a');
      if (phoneParentLink) phoneParentLink.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
  }

  /* ==========================================================================
     4. FETCH & RENDER PROJECTS (PORTFOLIO GRID & FILTERING)
     ========================================================================== */
  async function loadProjects() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/projects?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        state.projects = data.data;
        renderProjects();
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      projectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
          Unable to connect to the backend server. Please make sure the server is running on ${CONFIG.API_BASE_URL}.
        </div>
      `;
    }
  }

  function renderProjects() {
    if (!projectsGrid) return;

    let filtered = state.projects;
    if (state.activeCategory !== 'all') {
      filtered = state.projects.filter((p) => p.category === state.activeCategory);
    }

    if (filtered.length === 0) {
      projectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No projects found in this category.</p>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Check back soon or explore other categories.</span>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = filtered
      .map(
        (p) => `
        <article class="project-card" data-id="${p._id}">
          <div class="project-thumb-wrap" onclick="window.openProjectModal('${p._id}')" role="button" tabindex="0" aria-label="Play video for ${escapeHtml(p.title)}">
            <img src="${escapeHtml(p.thumbnailUrl)}" alt="${escapeHtml(p.title)}" class="project-thumb" loading="lazy">
            <div class="project-overlay">
              <div class="play-button-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            ${p.clientMetric ? `<span class="project-metric-badge">${escapeHtml(p.clientMetric)}</span>` : ''}
          </div>
          <div class="project-info">
            <span class="project-category-tag">${formatCategory(p.category)}</span>
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-desc">${escapeHtml(p.description || '')}</p>
            ${
              p.tags && p.tags.length > 0
                ? `<div class="project-tags">
                    ${p.tags.map((t) => `<span class="tag-item">${escapeHtml(t)}</span>`).join('')}
                  </div>`
                : ''
            }
          </div>
        </article>
      `
      )
      .join('');
  }

  function formatCategory(cat) {
    switch (cat) {
      case 'reels':
        return 'Reels & Shorts';
      case 'commercial':
        return 'Commercial / YouTube';
      case 'color-grading':
        return 'Color Grading';
      default:
        return 'Featured Work';
    }
  }

  // Filter Tabs Event Listeners
  if (filterTabs) {
    filterTabs.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.dataset.category;
        renderProjects();
      });
    });
  }

  /* ==========================================================================
     5. VIDEO LIGHTBOX MODAL
     ========================================================================== */
  window.openProjectModal = function (projectId) {
    const project = state.projects.find((p) => String(p._id) === String(projectId));
    if (!project) return;

    let embedHtml = '';
    const videoUrl = project.videoUrl.trim();

    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Extract YouTube ID
      let videoId = '';
      if (videoUrl.includes('embed/')) {
        videoId = videoUrl.split('embed/')[1].split('?')[0];
      } else if (videoUrl.includes('v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      }
      embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" title="${escapeHtml(
        project.title
      )}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (videoUrl.includes('vimeo.com')) {
      const vimeoId = videoUrl.split('/').pop().split('?')[0];
      embedHtml = `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=FD6F00" title="${escapeHtml(
        project.title
      )}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      // Direct MP4 video file
      embedHtml = `<video controls autoplay playsinline style="width:100%;height:100%;background:#000;">
        <source src="${escapeHtml(videoUrl)}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
    }

    videoContainer.innerHTML = embedHtml;
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    videoContainer.innerHTML = '';
    document.body.style.overflow = '';
  }

  if (closeVideoModal) closeVideoModal.addEventListener('click', closeModal);
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     6. BEFORE & AFTER COLOR GRADING SLIDER
     ========================================================================== */
  async function loadColorGrades() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/color-grades?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        state.colorGrades = data.data;
        renderColorGradeComparison(0);
        renderComparisonSelectors();
      }
    } catch (err) {
      console.warn('Could not fetch color grades:', err);
    }
  }

  function renderColorGradeComparison(index) {
    const item = state.colorGrades[index];
    if (!item) return;

    state.activeComparisonIndex = index;
    if (sliderBeforeImg) sliderBeforeImg.src = item.beforeImageUrl;
    if (sliderAfterImg) sliderAfterImg.src = item.afterImageUrl;
    if (compCamera) compCamera.textContent = item.camera || 'DaVinci Resolve Studio';
    if (compColorSpace) compColorSpace.textContent = item.colorSpace || 'ACEScc / Rec.709';
    if (compNotes) compNotes.textContent = item.notes || item.description || 'Cinematic look development.';

    // Reset slider to 50%
    setSliderPosition(50);
  }

  function renderComparisonSelectors() {
    if (!comparisonSelector || state.colorGrades.length <= 1) return;

    comparisonSelector.innerHTML = state.colorGrades
      .map(
        (item, idx) => `
        <button class="filter-tab ${idx === state.activeComparisonIndex ? 'active' : ''}" style="padding:6px 14px; font-size:0.8rem;" onclick="window.selectComparison(${idx})">
          Look ${idx + 1}
        </button>
      `
      )
      .join('');
  }

  window.selectComparison = function (idx) {
    renderColorGradeComparison(idx);
    renderComparisonSelectors();
  };

  // Interactive Dragging Logic
  let isDragging = false;

  function setSliderPosition(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    if (sliderBeforeWrap) sliderBeforeWrap.style.width = `${clamped}%`;
    if (sliderHandle) sliderHandle.style.left = `${clamped}%`;
    if (sliderBeforeImg && colorGradeSlider) {
      sliderBeforeImg.style.width = `${colorGradeSlider.offsetWidth}px`;
    }
  }

  function handleSliderMove(e) {
    if (!isDragging || !colorGradeSlider) return;
    const rect = colorGradeSlider.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }

  if (colorGradeSlider) {
    // Mouse events
    colorGradeSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleSliderMove(e);
    });

    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events for mobile
    colorGradeSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleSliderMove(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) handleSliderMove(e);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Resize event to maintain exact inner width of before image
    window.addEventListener('resize', () => {
      if (sliderBeforeImg && colorGradeSlider) {
        sliderBeforeImg.style.width = `${colorGradeSlider.offsetWidth}px`;
      }
    });

    // Initialize width
    setTimeout(() => {
      if (sliderBeforeImg && colorGradeSlider) {
        sliderBeforeImg.style.width = `${colorGradeSlider.offsetWidth}px`;
      }
    }, 200);
  }

  /* ==========================================================================
     7. CONTACT INQUIRY FORM SUBMISSION
     ========================================================================== */
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const projectType = document.getElementById('projectType').value;
      const budget = document.getElementById('budget').value;
      const message = document.getElementById('clientMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields marked with *', 'error');
        return;
      }

      // Email format regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Button loading state
      const originalBtnText = submitInquiryBtn.innerHTML;
      submitInquiryBtn.disabled = true;
      submitInquiryBtn.innerHTML = `
        <span class="btn-text">Sending Inquiry...</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      `;

      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, projectType, budget, message }),
        });

        const data = await res.json();
        if (data.success) {
          showToast('Inquiry sent successfully! Asif Raza will get back to you shortly.');
          inquiryForm.reset();
        } else {
          showToast(data.message || 'Failed to submit inquiry. Please try again.', 'error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        showToast('Network error: Could not reach the server. Please check backend connection.', 'error');
      } finally {
        submitInquiryBtn.disabled = false;
        submitInquiryBtn.innerHTML = originalBtnText;
      }
    });
  }

  /* ==========================================================================
     8. UTILITIES
     ========================================================================== */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial App Bootstrapping
  loadSettings();
  loadProjects();
  loadColorGrades();
});
