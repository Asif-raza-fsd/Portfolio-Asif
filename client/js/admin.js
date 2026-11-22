/**
 * Admin Dashboard Logic for Asif Raza Portfolio
 * Handles JWT Authentication, Projects CRUD, Color Grade CRUD, Settings, & Inquiries.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tokenKey = 'asif_portfolio_admin_jwt';

  // State
  const state = {
    token: localStorage.getItem(tokenKey) || null,
    projects: [],
    colorGrades: [],
    inquiries: [],
    settings: {},
  };

  // Elements
  const loginScreen = document.getElementById('loginScreen');
  const adminApp = document.getElementById('adminApp');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Overview Elements
  const ovTotalProjects = document.getElementById('ovTotalProjects');
  const ovTotalGrades = document.getElementById('ovTotalGrades');
  const ovTotalInquiries = document.getElementById('ovTotalInquiries');
  const ovUnreadInquiries = document.getElementById('ovUnreadInquiries');
  const inquiryBadge = document.getElementById('inquiryBadge');

  // Tables
  const projectsTableBody = document.getElementById('projectsTableBody');
  const colorGradesTableBody = document.getElementById('colorGradesTableBody');
  const inquiriesContainer = document.getElementById('inquiriesContainer');

  // Modals & Forms
  const projectModal = document.getElementById('projectModal');
  const projectForm = document.getElementById('projectForm');
  const colorGradeModal = document.getElementById('colorGradeModal');
  const colorGradeForm = document.getElementById('colorGradeForm');
  const settingsForm = document.getElementById('settingsForm');

  /* ==========================================================================
     1. TOAST ALERTS
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
    }, 4000);
  }

  /* ==========================================================================
     2. AUTHENTICATION & SESSION
     ========================================================================== */
  function checkAuth() {
    if (state.token) {
      loginScreen.style.display = 'none';
      adminApp.style.display = 'flex';
      loadAllAdminData();
    } else {
      loginScreen.style.display = 'flex';
      adminApp.style.display = 'none';
    }
  }

  // Handle Login Form
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (data.success && data.token) {
          state.token = data.token;
          localStorage.setItem(tokenKey, data.token);
          showToast('Welcome back, Asif Raza! Logged in successfully.');
          checkAuth();
        } else {
          showToast(data.message || 'Invalid email or password.', 'error');
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast('Connection error: Failed to reach backend server.', 'error');
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.token = null;
      localStorage.removeItem(tokenKey);
      showToast('Logged out successfully.');
      checkAuth();
    });
  }

  // Authorized Fetch Helper
  async function authFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      showToast('Session expired. Please log in again.', 'error');
      state.token = null;
      localStorage.removeItem(tokenKey);
      checkAuth();
      throw new Error('Unauthorized');
    }
    return response;
  }

  /* ==========================================================================
     3. TAB SWITCHING
     ========================================================================== */
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminPanes = document.querySelectorAll('.admin-tab-pane');

  window.switchTab = function (targetPaneId) {
    adminTabs.forEach((tab) => {
      if (tab.dataset.tab === targetPaneId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    adminPanes.forEach((pane) => {
      if (pane.id === targetPaneId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  };

  adminTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      window.switchTab(tab.dataset.tab);
    });
  });

  /* ==========================================================================
     4. LOAD ALL DASHBOARD DATA
     ========================================================================== */
  async function loadAllAdminData() {
    await Promise.all([
      loadProjects(),
      loadColorGrades(),
      loadSettings(),
      loadInquiries(),
    ]);
    updateOverviewStats();
  }

  function updateOverviewStats() {
    if (ovTotalProjects) ovTotalProjects.textContent = state.projects.length;
    if (ovTotalGrades) ovTotalGrades.textContent = state.colorGrades.length;
    if (ovTotalInquiries) ovTotalInquiries.textContent = state.inquiries.length;

    const unread = state.inquiries.filter((i) => i.status === 'new').length;
    if (ovUnreadInquiries) ovUnreadInquiries.textContent = unread;
    if (inquiryBadge) inquiryBadge.textContent = unread;
  }

  /* ==========================================================================
     5. PROJECTS MANAGEMENT (CRUD)
     ========================================================================== */
  async function loadProjects() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/projects`);
      const data = await res.json();
      if (data.success) {
        state.projects = data.data;
        renderProjectsTable();
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }

  function renderProjectsTable() {
    if (!projectsTableBody) return;
    if (state.projects.length === 0) {
      projectsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No projects added yet. Click "+ Add New Project" to get started.</td></tr>`;
      return;
    }

    projectsTableBody.innerHTML = state.projects
      .map(
        (p) => `
      <tr>
        <td>
          <img src="${escapeHtml(p.thumbnailUrl)}" alt="${escapeHtml(p.title)}" class="table-thumb">
        </td>
        <td>
          <strong>${escapeHtml(p.title)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(p.videoUrl.substring(0, 36))}...</div>
        </td>
        <td><span class="category-pill">${p.category}</span></td>
        <td>${escapeHtml(p.clientMetric || '—')}</td>
        <td>${p.featured ? '⭐ Yes' : 'No'}</td>
        <td>
          <button class="btn-action btn-action-edit" onclick="window.editProject('${p._id}')">Edit</button>
          <button class="btn-action btn-action-delete" onclick="window.deleteProject('${p._id}')">Delete</button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  window.openProjectModal = function () {
    document.getElementById('projectModalTitle').textContent = 'Add New Video Project';
    projectForm.reset();
    document.getElementById('projId').value = '';
    projectModal.classList.add('active');
  };

  window.editProject = function (id) {
    const proj = state.projects.find((p) => String(p._id) === String(id));
    if (!proj) return;

    document.getElementById('projectModalTitle').textContent = 'Edit Video Project';
    document.getElementById('projId').value = proj._id;
    document.getElementById('projTitle').value = proj.title;
    document.getElementById('projCategory').value = proj.category;
    document.getElementById('projMetric').value = proj.clientMetric || '';
    document.getElementById('projVideoUrl').value = proj.videoUrl;
    document.getElementById('projThumbUrl').value = proj.thumbnailUrl;
    document.getElementById('projTags').value = proj.tags ? proj.tags.join(', ') : '';
    document.getElementById('projDesc').value = proj.description || '';
    document.getElementById('projFeatured').checked = Boolean(proj.featured);

    projectModal.classList.add('active');
  };

  window.deleteProject = async function (id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Project deleted successfully.');
        await loadProjects();
        updateOverviewStats();
      } else {
        showToast(data.message || 'Failed to delete project', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('projId').value;
      const title = document.getElementById('projTitle').value.trim();
      const category = document.getElementById('projCategory').value;
      const clientMetric = document.getElementById('projMetric').value.trim();
      const videoUrl = document.getElementById('projVideoUrl').value.trim();
      const thumbnailUrl = document.getElementById('projThumbUrl').value.trim();
      const tags = document.getElementById('projTags').value.split(',').map((t) => t.trim()).filter(Boolean);
      const description = document.getElementById('projDesc').value.trim();
      const featured = document.getElementById('projFeatured').checked;

      const payload = { title, category, clientMetric, videoUrl, thumbnailUrl, tags, description, featured };

      try {
        const url = id ? `${CONFIG.API_BASE_URL}/api/projects/${id}` : `${CONFIG.API_BASE_URL}/api/projects`;
        const method = id ? 'PUT' : 'POST';

        const res = await authFetch(url, {
          method,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          showToast(id ? 'Project updated!' : 'Project created!');
          window.closeModals();
          await loadProjects();
          updateOverviewStats();
        } else {
          showToast(data.message || 'Failed to save project', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  /* ==========================================================================
     6. COLOR GRADES COMPARISONS CRUD
     ========================================================================== */
  async function loadColorGrades() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/color-grades`);
      const data = await res.json();
      if (data.success) {
        state.colorGrades = data.data;
        renderColorGradesTable();
      }
    } catch (err) {
      console.error('Error fetching color grades:', err);
    }
  }

  function renderColorGradesTable() {
    if (!colorGradesTableBody) return;
    if (state.colorGrades.length === 0) {
      colorGradesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No color grade comparisons yet.</td></tr>`;
      return;
    }

    colorGradesTableBody.innerHTML = state.colorGrades
      .map(
        (c) => `
      <tr>
        <td><strong>${escapeHtml(c.title)}</strong></td>
        <td>${escapeHtml(c.camera || '—')}</td>
        <td>${escapeHtml(c.colorSpace || '—')}</td>
        <td><img src="${escapeHtml(c.beforeImageUrl)}" class="table-thumb" alt="RAW"></td>
        <td><img src="${escapeHtml(c.afterImageUrl)}" class="table-thumb" alt="Graded"></td>
        <td>
          <button class="btn-action btn-action-edit" onclick="window.editColorGrade('${c._id}')">Edit</button>
          <button class="btn-action btn-action-delete" onclick="window.deleteColorGrade('${c._id}')">Delete</button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  window.openColorGradeModal = function () {
    document.getElementById('colorModalTitle').textContent = 'Add Color Grade Comparison';
    colorGradeForm.reset();
    document.getElementById('colorId').value = '';
    colorGradeModal.classList.add('active');
  };

  window.editColorGrade = function (id) {
    const item = state.colorGrades.find((c) => String(c._id) === String(id));
    if (!item) return;

    document.getElementById('colorModalTitle').textContent = 'Edit Color Grade Comparison';
    document.getElementById('colorId').value = item._id;
    document.getElementById('colorTitle').value = item.title;
    document.getElementById('colorBeforeUrl').value = item.beforeImageUrl;
    document.getElementById('colorAfterUrl').value = item.afterImageUrl;
    document.getElementById('colorCamera').value = item.camera || '';
    document.getElementById('colorSpace').value = item.colorSpace || '';
    document.getElementById('colorNotes').value = item.notes || '';

    colorGradeModal.classList.add('active');
  };

  window.deleteColorGrade = async function (id) {
    if (!confirm('Delete this color grade comparison?')) return;

    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/color-grades/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Comparison deleted.');
        await loadColorGrades();
        updateOverviewStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (colorGradeForm) {
    colorGradeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('colorId').value;
      const title = document.getElementById('colorTitle').value.trim();
      const beforeImageUrl = document.getElementById('colorBeforeUrl').value.trim();
      const afterImageUrl = document.getElementById('colorAfterUrl').value.trim();
      const camera = document.getElementById('colorCamera').value.trim();
      const colorSpace = document.getElementById('colorSpace').value.trim();
      const notes = document.getElementById('colorNotes').value.trim();

      const payload = { title, beforeImageUrl, afterImageUrl, camera, colorSpace, notes };

      try {
        const url = id ? `${CONFIG.API_BASE_URL}/api/color-grades/${id}` : `${CONFIG.API_BASE_URL}/api/color-grades`;
        const method = id ? 'PUT' : 'POST';

        const res = await authFetch(url, {
          method,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          showToast(id ? 'Comparison updated!' : 'Comparison created!');
          window.closeModals();
          await loadColorGrades();
          updateOverviewStats();
        } else {
          showToast(data.message || 'Failed to save comparison', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  /* ==========================================================================
     7. HERO STATS & SITE SETTINGS
     ========================================================================== */
  async function loadSettings() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        state.settings = data.data;
        populateSettingsForm(data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

  function populateSettingsForm(s) {
    if (document.getElementById('settingHeroIntro')) document.getElementById('settingHeroIntro').value = s.heroIntro || 'Hi I am';
    if (document.getElementById('settingHeroName')) document.getElementById('settingHeroName').value = s.heroName || 'Asif Raza';
    if (document.getElementById('settingHeroTitle')) document.getElementById('settingHeroTitle').value = s.heroTitle || 'Video Editor & Colorist';
    if (document.getElementById('settingExp')) document.getElementById('settingExp').value = s.experienceYears || '2+';
    if (document.getElementById('settingProjectsDone')) document.getElementById('settingProjectsDone').value = s.projectsDone || '50+';
    if (document.getElementById('settingHappyClients')) document.getElementById('settingHappyClients').value = s.happyClients || '20+';
    if (document.getElementById('settingPortraitUrl')) document.getElementById('settingPortraitUrl').value = s.heroPortraitUrl || '';
    if (document.getElementById('settingCvUrl')) document.getElementById('settingCvUrl').value = s.cvUrl || '';
    if (document.getElementById('settingBio')) document.getElementById('settingBio').value = s.heroBio || '';
    if (document.getElementById('settingContactEmail')) document.getElementById('settingContactEmail').value = s.contactEmail || '';
    if (document.getElementById('settingContactPhone')) document.getElementById('settingContactPhone').value = s.contactPhone || '';

    if (s.socialLinks) {
      if (document.getElementById('settingInstagram')) document.getElementById('settingInstagram').value = s.socialLinks.instagram || '';
      if (document.getElementById('settingYoutube')) document.getElementById('settingYoutube').value = s.socialLinks.youtube || '';
      if (document.getElementById('settingLinkedin')) document.getElementById('settingLinkedin').value = s.socialLinks.linkedin || '';
      if (document.getElementById('settingBehance')) document.getElementById('settingBehance').value = s.socialLinks.behance || '';
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        heroIntro: document.getElementById('settingHeroIntro').value.trim(),
        heroName: document.getElementById('settingHeroName').value.trim(),
        heroTitle: document.getElementById('settingHeroTitle').value.trim(),
        experienceYears: document.getElementById('settingExp').value.trim(),
        projectsDone: document.getElementById('settingProjectsDone').value.trim(),
        happyClients: document.getElementById('settingHappyClients').value.trim(),
        heroPortraitUrl: document.getElementById('settingPortraitUrl').value.trim(),
        cvUrl: document.getElementById('settingCvUrl').value.trim(),
        heroBio: document.getElementById('settingBio').value.trim(),
        contactEmail: document.getElementById('settingContactEmail').value.trim(),
        contactPhone: document.getElementById('settingContactPhone').value.trim(),
        socialLinks: {
          instagram: document.getElementById('settingInstagram').value.trim(),
          youtube: document.getElementById('settingYoutube').value.trim(),
          linkedin: document.getElementById('settingLinkedin').value.trim(),
          behance: document.getElementById('settingBehance').value.trim(),
        },
      };

      try {
        const res = await authFetch(`${CONFIG.API_BASE_URL}/api/settings`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Site settings and Hero stats successfully updated!');
        } else {
          showToast('Failed to update settings', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  /* ==========================================================================
     8. CLIENT INQUIRIES MANAGEMENT
     ========================================================================== */
  window.loadInquiries = async function () {
    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/inquiries`);
      const data = await res.json();
      if (data.success) {
        state.inquiries = data.data;
        renderInquiries();
        updateOverviewStats();
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  function renderInquiries() {
    if (!inquiriesContainer) return;
    if (state.inquiries.length === 0) {
      inquiriesContainer.innerHTML = `<div style="text-align:center; padding:50px; background:#181818; border-radius:12px; color:var(--text-secondary);">No client inquiries received yet.</div>`;
      return;
    }

    inquiriesContainer.innerHTML = state.inquiries
      .map(
        (inq) => `
      <div class="inquiry-card ${inq.status === 'new' ? 'is-new' : ''}">
        <div class="inquiry-header-row">
          <div>
            <span class="inquiry-author">${escapeHtml(inq.name)}</span>
            <span style="color:var(--accent-orange); margin-left:8px; font-size:0.85rem;">&bull; ${escapeHtml(inq.projectType)}</span>
          </div>
          <div class="inquiry-meta">
            <span>Budget: <strong>${escapeHtml(inq.budget || 'Flexible')}</strong></span>
            <span>Date: ${new Date(inq.createdAt).toLocaleDateString()}</span>
            <span class="inquiry-status-badge ${inq.status === 'new' ? 'status-new' : 'status-replied'}">
              ${inq.status}
            </span>
          </div>
        </div>

        <div class="inquiry-body-text">${escapeHtml(inq.message)}</div>

        <div class="inquiry-actions-row">
          <a href="mailto:${escapeHtml(inq.email)}?subject=Re: Video Editing / Color Grading Inquiry" class="btn btn-primary" style="padding:6px 16px; font-size:0.82rem;">
            Reply via Email (${escapeHtml(inq.email)})
          </a>
          <div style="display:flex; gap:8px;">
            ${
              inq.status !== 'replied'
                ? `<button class="btn btn-outline" style="padding:6px 12px; font-size:0.82rem;" onclick="window.updateInquiryStatus('${inq._id}', 'replied')">Mark Replied</button>`
                : ''
            }
            <button class="btn-action btn-action-delete" onclick="window.deleteInquiry('${inq._id}')">Delete</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  window.updateInquiryStatus = async function (id, status) {
    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Inquiry marked as ${status}`);
        await window.loadInquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  window.deleteInquiry = async function (id) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/inquiries/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Inquiry deleted.');
        await window.loadInquiries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ==========================================================================
     9. MODAL UTILITIES
     ========================================================================== */
  window.closeModals = function () {
    if (projectModal) projectModal.classList.remove('active');
    if (colorGradeModal) colorGradeModal.classList.remove('active');
  };

  // Close modals on clicking backdrop
  [projectModal, colorGradeModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) window.closeModals();
      });
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Check auth state on launch
  checkAuth();
});
