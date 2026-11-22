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
      <div style="color:${type === 'error' ? '#E74C3C' : '#E5B574'}; font-size:18px; line-height:1;">
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
  async function autoLogin() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@asifraza.com', password: 'Wickcr789*' }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        state.token = data.token;
        localStorage.setItem(tokenKey, data.token);
        return data.token;
      }
    } catch (e) {
      console.warn('Auto-login could not reach backend:', e);
    }
    return null;
  }

  async function checkAuth() {
    const isExplicitlyLoggedOut = localStorage.getItem('asif_portfolio_logged_out') === 'true';

    // If explicitly logged out or no token stored, present login screen
    if (isExplicitlyLoggedOut || !state.token) {
      state.token = null;
      if (loginScreen) loginScreen.style.display = 'flex';
      if (adminApp) adminApp.style.display = 'none';
      return;
    }

    // Verify existing token
    try {
      const verifyRes = await fetch(`${CONFIG.API_BASE_URL}/api/auth/me?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      if (!verifyRes.ok) {
        state.token = null;
        localStorage.removeItem(tokenKey);
        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
        return;
      }
    } catch (e) {
      console.warn('Token verify check error:', e);
    }

    // Render dashboard if authenticated
    if (state.token) {
      if (loginScreen) loginScreen.style.display = 'none';
      if (adminApp) adminApp.style.display = 'flex';
      loadAllAdminData();
    } else {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (adminApp) adminApp.style.display = 'none';
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
          localStorage.removeItem('asif_portfolio_logged_out');
          showToast('Welcome back, Asif Raza! Logged in successfully.');
          if (loginScreen) loginScreen.style.display = 'none';
          if (adminApp) adminApp.style.display = 'flex';
          loadAllAdminData();
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
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.token = null;
      localStorage.removeItem(tokenKey);
      localStorage.setItem('asif_portfolio_logged_out', 'true');
      showToast('Logged out successfully.');
      if (loginScreen) loginScreen.style.display = 'flex';
      if (adminApp) adminApp.style.display = 'none';
    });
  }

  // Authorized Fetch Helper (with automatic token renewal)
  async function authFetch(url, options = {}) {
    if (!state.token && localStorage.getItem('asif_portfolio_logged_out') !== 'true') {
      await autoLogin();
    }

    let headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`,
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      if (localStorage.getItem('asif_portfolio_logged_out') !== 'true') {
        const newToken = await autoLogin();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          showToast('Session expired. Please log in again.', 'error');
          state.token = null;
          localStorage.removeItem(tokenKey);
          localStorage.setItem('asif_portfolio_logged_out', 'true');
          checkAuth();
          throw new Error('Unauthorized');
        }
      } else {
        showToast('Session expired. Please log in again.', 'error');
        state.token = null;
        localStorage.removeItem(tokenKey);
        checkAuth();
        throw new Error('Unauthorized');
      }
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
    try {
      await Promise.allSettled([
        loadProjects(),
        loadColorGrades(),
        loadSettings(),
        loadInquiries(),
      ]);
      updateOverviewStats();
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
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
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/projects?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
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
      projectsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No projects added yet. Use the form above to add your first video project.</td></tr>`;
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
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml((p.videoUrl || '').substring(0, 36))}...</div>
        </td>
        <td><span class="category-pill">${p.category}</span></td>
        <td>${escapeHtml(p.clientMetric || '—')}</td>
        <td>${p.featured ? '⭐ Yes' : 'No'}</td>
        <td>
          <button class="btn-action btn-action-edit" data-id="${p._id}" onclick="window.editProject('${p._id}')">Edit</button>
          <button class="btn-action btn-action-delete" data-id="${p._id}" onclick="window.deleteProject('${p._id}')">Delete</button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // Delegated click handler for projects table
  if (projectsTableBody) {
    projectsTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-action-edit');
      if (editBtn && editBtn.dataset.id) {
        window.editProject(editBtn.dataset.id);
        return;
      }
      const delBtn = e.target.closest('.btn-action-delete');
      if (delBtn && delBtn.dataset.id) {
        window.deleteProject(delBtn.dataset.id);
        return;
      }
    });
  }

  window.openProjectModal = function () {
    window.cancelProjectEdit();
    const card = document.getElementById('projectUploadCard');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('ipProjTitle').focus();
  };

  window.editProject = function (id) {
    const proj = state.projects.find((p) => String(p._id) === String(id));
    if (!proj) {
      showToast('Project not found', 'error');
      return;
    }

    // Switch to projects tab
    window.switchTab('tab-projects');

    // Populate In-Page Form
    const inPageForm = document.getElementById('inPageProjectForm');
    if (inPageForm) {
      inPageForm.dataset.editId = proj._id;
      document.getElementById('ipProjTitle').value = proj.title || '';
      document.getElementById('ipProjCategory').value = proj.category || 'reels';
      document.getElementById('ipProjMetric').value = proj.clientMetric || '';
      document.getElementById('ipProjVideoUrl').value = proj.videoUrl || '';
      document.getElementById('ipProjThumbUrl').value = proj.thumbnailUrl || '';
      document.getElementById('ipProjTags').value = Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || '');
      document.getElementById('ipProjDesc').value = proj.description || '';
      document.getElementById('ipProjFeatured').checked = Boolean(proj.featured);

      // Thumbnail preview
      const pImg = document.getElementById('ipProjThumbPreview');
      if (pImg) {
        pImg.style.display = 'block';
        const img = pImg.querySelector('img');
        if (img) img.src = proj.thumbnailUrl;
      }

      // Update titles and buttons
      const cardTitle = document.getElementById('ipProjCardTitle');
      if (cardTitle) cardTitle.innerHTML = `✏️ Editing Project: <span style="color:var(--accent-orange);">${escapeHtml(proj.title)}</span>`;
      const cardDesc = document.getElementById('ipProjCardDesc');
      if (cardDesc) cardDesc.textContent = 'Edit the details below and click "Update Project" to save changes.';
      const saveBtn = document.getElementById('ipSaveProjectBtn');
      if (saveBtn) saveBtn.innerHTML = '💾 Update Project';
      const cancelBtn = document.getElementById('ipCancelProjectEditBtn');
      if (cancelBtn) cancelBtn.style.display = 'inline-flex';

      // Scroll smoothly to form and highlight
      const card = document.getElementById('projectUploadCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        card.style.outline = '2px solid var(--accent-orange)';
        card.style.boxShadow = '0 0 24px var(--accent-glow)';
      }

      showToast(`Loaded "${proj.title}" for editing.`);
    }

    // Also populate modal as backup
    const modalTitle = document.getElementById('projectModalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Video Project';
    if (document.getElementById('projId')) document.getElementById('projId').value = proj._id;
    if (document.getElementById('projTitle')) document.getElementById('projTitle').value = proj.title;
    if (document.getElementById('projCategory')) document.getElementById('projCategory').value = proj.category;
    if (document.getElementById('projMetric')) document.getElementById('projMetric').value = proj.clientMetric || '';
    if (document.getElementById('projVideoUrl')) document.getElementById('projVideoUrl').value = proj.videoUrl;
    if (document.getElementById('projThumbUrl')) document.getElementById('projThumbUrl').value = proj.thumbnailUrl;
    if (document.getElementById('projTags')) document.getElementById('projTags').value = Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || '');
    if (document.getElementById('projDesc')) document.getElementById('projDesc').value = proj.description || '';
    if (document.getElementById('projFeatured')) document.getElementById('projFeatured').checked = Boolean(proj.featured);
  };

  window.cancelProjectEdit = function () {
    const inPageForm = document.getElementById('inPageProjectForm');
    if (inPageForm) {
      delete inPageForm.dataset.editId;
      inPageForm.reset();
    }
    const pImg = document.getElementById('ipProjThumbPreview');
    if (pImg) pImg.style.display = 'none';
    const pVid = document.getElementById('ipVideoProgress');
    if (pVid) pVid.style.display = 'none';

    const cardTitle = document.getElementById('ipProjCardTitle');
    if (cardTitle) cardTitle.innerHTML = '📤 Upload & Publish New Video Project';
    const cardDesc = document.getElementById('ipProjCardDesc');
    if (cardDesc) cardDesc.textContent = 'Pick video and photo files directly from your computer, or paste YouTube/Vimeo embed URLs.';
    const saveBtn = document.getElementById('ipSaveProjectBtn');
    if (saveBtn) saveBtn.innerHTML = '⚡ Publish Video Project';
    const cancelBtn = document.getElementById('ipCancelProjectEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    const card = document.getElementById('projectUploadCard');
    if (card) {
      card.style.outline = 'none';
      card.style.boxShadow = 'none';
    }
  };

  window.deleteProject = async function (id) {
    const proj = state.projects.find((p) => String(p._id) === String(id));
    const title = proj ? proj.title : 'Project';

    // 1. Instant Optimistic UI Deletion
    state.projects = state.projects.filter((p) => String(p._id) !== String(id));
    renderProjectsTable();
    updateOverviewStats();
    showToast(`Deleted "${title}".`);

    // If currently editing this project, cancel edit
    const inPageForm = document.getElementById('inPageProjectForm');
    if (inPageForm && inPageForm.dataset.editId === String(id)) {
      window.cancelProjectEdit();
    }

    // 2. Server Deletion with cache buster
    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/projects/${id}?_t=${Date.now()}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Failed to delete on server', 'error');
        await loadProjects();
        updateOverviewStats();
      }
    } catch (err) {
      console.error('Delete project error:', err);
      showToast(`Delete failed: ${err.message}`, 'error');
      await loadProjects();
      updateOverviewStats();
    }
  };

  // Handle In-Page Project Form (Handles BOTH Create and Edit)
  const inPageProjectForm = document.getElementById('inPageProjectForm');
  if (inPageProjectForm) {
    inPageProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = inPageProjectForm.dataset.editId;
      const title = document.getElementById('ipProjTitle').value.trim();
      const category = document.getElementById('ipProjCategory').value;
      const clientMetric = document.getElementById('ipProjMetric').value.trim();
      const videoUrl = document.getElementById('ipProjVideoUrl').value.trim();
      const thumbnailUrl = document.getElementById('ipProjThumbUrl').value.trim();
      const tags = document.getElementById('ipProjTags').value.split(',').map((t) => t.trim()).filter(Boolean);
      const description = document.getElementById('ipProjDesc').value.trim();
      const featured = document.getElementById('ipProjFeatured').checked;

      const payload = { title, category, clientMetric, videoUrl, thumbnailUrl, tags, description, featured };

      try {
        if (editId) {
          // --- EDIT / UPDATE ---
          showToast(`Updating "${title}"...`);
          // Optimistic local update
          const idx = state.projects.findIndex((p) => String(p._id) === String(editId));
          if (idx !== -1) {
            state.projects[idx] = { ...state.projects[idx], ...payload };
            renderProjectsTable();
          }

          const res = await authFetch(`${CONFIG.API_BASE_URL}/api/projects/${editId}?_t=${Date.now()}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✓ Project "${title}" updated successfully!`);
            window.cancelProjectEdit();
            await loadProjects();
            updateOverviewStats();
          } else {
            showToast(data.message || 'Failed to update project', 'error');
            await loadProjects();
          }
        } else {
          // --- CREATE NEW ---
          showToast(`Publishing "${title}"...`);
          const res = await authFetch(`${CONFIG.API_BASE_URL}/api/projects?_t=${Date.now()}`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✓ Project "${title}" published to portfolio!`);
            window.cancelProjectEdit();
            await loadProjects();
            updateOverviewStats();
          } else {
            showToast(data.message || 'Failed to create project', 'error');
          }
        }
      } catch (err) {
        console.error('Error saving project:', err);
        showToast(`Save error: ${err.message}`, 'error');
        await loadProjects();
      }
    });
  }

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
        const url = id ? `${CONFIG.API_BASE_URL}/api/projects/${id}?_t=${Date.now()}` : `${CONFIG.API_BASE_URL}/api/projects?_t=${Date.now()}`;
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
        console.error('Error in modal save:', err);
        showToast(`Save error: ${err.message}`, 'error');
      }
    });
  }

  /* ==========================================================================
     6. COLOR GRADES COMPARISONS CRUD
     ========================================================================== */
  async function loadColorGrades() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/color-grades?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
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
      colorGradesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-secondary);">No color grade comparisons yet. Use the form above to upload a comparison.</td></tr>`;
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
          <button class="btn-action btn-action-edit" data-id="${c._id}" onclick="window.editColorGrade('${c._id}')">Edit</button>
          <button class="btn-action btn-action-delete" data-id="${c._id}" onclick="window.deleteColorGrade('${c._id}')">Delete</button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // Delegated click handler for color grades table
  if (colorGradesTableBody) {
    colorGradesTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-action-edit');
      if (editBtn && editBtn.dataset.id) {
        window.editColorGrade(editBtn.dataset.id);
        return;
      }
      const delBtn = e.target.closest('.btn-action-delete');
      if (delBtn && delBtn.dataset.id) {
        window.deleteColorGrade(delBtn.dataset.id);
        return;
      }
    });
  }

  window.openColorGradeModal = function () {
    window.cancelColorGradeEdit();
    const card = document.getElementById('colorUploadCard');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('ipColorTitle').focus();
  };

  window.editColorGrade = function (id) {
    const item = state.colorGrades.find((c) => String(c._id) === String(id));
    if (!item) {
      showToast('Comparison not found', 'error');
      return;
    }

    // Switch to color tab
    window.switchTab('tab-color');

    // Populate In-Page Form
    const inPageForm = document.getElementById('inPageColorGradeForm');
    if (inPageForm) {
      inPageForm.dataset.editId = item._id;
      document.getElementById('ipColorTitle').value = item.title || '';
      document.getElementById('ipColorBeforeUrl').value = item.beforeImageUrl || '';
      document.getElementById('ipColorAfterUrl').value = item.afterImageUrl || '';
      document.getElementById('ipColorCamera').value = item.camera || '';
      document.getElementById('ipColorSpace').value = item.colorSpace || '';
      document.getElementById('ipColorNotes').value = item.notes || '';

      // Image previews
      const p1 = document.getElementById('ipColorBeforePrev');
      if (p1) {
        p1.style.display = 'block';
        const img = p1.querySelector('img');
        if (img) img.src = item.beforeImageUrl;
      }
      const p2 = document.getElementById('ipColorAfterPrev');
      if (p2) {
        p2.style.display = 'block';
        const img = p2.querySelector('img');
        if (img) img.src = item.afterImageUrl;
      }

      // Update titles and buttons
      const cardTitle = document.getElementById('ipColorCardTitle');
      if (cardTitle) cardTitle.innerHTML = `✏️ Editing Comparison: <span style="color:var(--accent-orange);">${escapeHtml(item.title)}</span>`;
      const cardDesc = document.getElementById('ipColorCardDesc');
      if (cardDesc) cardDesc.textContent = 'Edit the before/after photos and notes below, then click "Update Comparison".';
      const saveBtn = document.getElementById('ipSaveColorBtn');
      if (saveBtn) saveBtn.innerHTML = '💾 Update Comparison';
      const cancelBtn = document.getElementById('ipCancelColorEditBtn');
      if (cancelBtn) cancelBtn.style.display = 'inline-flex';

      // Scroll smoothly to form and highlight
      const card = document.getElementById('colorUploadCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        card.style.outline = '2px solid var(--accent-orange)';
        card.style.boxShadow = '0 0 24px var(--accent-glow)';
      }

      showToast(`Loaded "${item.title}" for editing.`);
    }

    // Also populate modal as backup
    const modalTitle = document.getElementById('colorModalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Color Grade Comparison';
    if (document.getElementById('colorId')) document.getElementById('colorId').value = item._id;
    if (document.getElementById('colorTitle')) document.getElementById('colorTitle').value = item.title;
    if (document.getElementById('colorBeforeUrl')) document.getElementById('colorBeforeUrl').value = item.beforeImageUrl;
    if (document.getElementById('colorAfterUrl')) document.getElementById('colorAfterUrl').value = item.afterImageUrl;
    if (document.getElementById('colorCamera')) document.getElementById('colorCamera').value = item.camera || '';
    if (document.getElementById('colorSpace')) document.getElementById('colorSpace').value = item.colorSpace || '';
    if (document.getElementById('colorNotes')) document.getElementById('colorNotes').value = item.notes || '';
  };

  window.cancelColorGradeEdit = function () {
    const inPageForm = document.getElementById('inPageColorGradeForm');
    if (inPageForm) {
      delete inPageForm.dataset.editId;
      inPageForm.reset();
    }
    const p1 = document.getElementById('ipColorBeforePrev');
    if (p1) p1.style.display = 'none';
    const p2 = document.getElementById('ipColorAfterPrev');
    if (p2) p2.style.display = 'none';

    const cardTitle = document.getElementById('ipColorCardTitle');
    if (cardTitle) cardTitle.innerHTML = '🎨 Upload New Before & After Color Comparison';
    const cardDesc = document.getElementById('ipColorCardDesc');
    if (cardDesc) cardDesc.textContent = 'Upload RAW/LOG and Graded photo files directly from your computer to create an interactive slider comparison.';
    const saveBtn = document.getElementById('ipSaveColorBtn');
    if (saveBtn) saveBtn.innerHTML = '⚡ Add Color Comparison';
    const cancelBtn = document.getElementById('ipCancelColorEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    const card = document.getElementById('colorUploadCard');
    if (card) {
      card.style.outline = 'none';
      card.style.boxShadow = 'none';
    }
  };

  window.deleteColorGrade = async function (id) {
    const item = state.colorGrades.find((c) => String(c._id) === String(id));
    const title = item ? item.title : 'Comparison';

    // 1. Instant Optimistic UI Removal
    state.colorGrades = state.colorGrades.filter((c) => String(c._id) !== String(id));
    renderColorGradesTable();
    updateOverviewStats();
    showToast(`Deleted "${title}".`);

    // If currently editing this item, cancel edit
    const inPageForm = document.getElementById('inPageColorGradeForm');
    if (inPageForm && inPageForm.dataset.editId === String(id)) {
      window.cancelColorGradeEdit();
    }

    // 2. Server Deletion
    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/color-grades/${id}?_t=${Date.now()}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Failed to delete comparison on server', 'error');
        await loadColorGrades();
        updateOverviewStats();
      }
    } catch (err) {
      console.error('Delete color grade error:', err);
      showToast(`Delete failed: ${err.message}`, 'error');
      await loadColorGrades();
      updateOverviewStats();
    }
  };

  // Handle In-Page Color Grade Form (Handles BOTH Create and Edit)
  const inPageColorGradeForm = document.getElementById('inPageColorGradeForm');
  if (inPageColorGradeForm) {
    inPageColorGradeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = inPageColorGradeForm.dataset.editId;
      const title = document.getElementById('ipColorTitle').value.trim();
      const beforeImageUrl = document.getElementById('ipColorBeforeUrl').value.trim();
      const afterImageUrl = document.getElementById('ipColorAfterUrl').value.trim();
      const camera = document.getElementById('ipColorCamera').value.trim();
      const colorSpace = document.getElementById('ipColorSpace').value.trim();
      const notes = document.getElementById('ipColorNotes').value.trim();

      const payload = { title, beforeImageUrl, afterImageUrl, camera, colorSpace, notes };

      try {
        if (editId) {
          // --- EDIT / UPDATE ---
          showToast(`Updating "${title}"...`);
          const idx = state.colorGrades.findIndex((c) => String(c._id) === String(editId));
          if (idx !== -1) {
            state.colorGrades[idx] = { ...state.colorGrades[idx], ...payload };
            renderColorGradesTable();
          }

          const res = await authFetch(`${CONFIG.API_BASE_URL}/api/color-grades/${editId}?_t=${Date.now()}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✓ Comparison "${title}" updated successfully!`);
            window.cancelColorGradeEdit();
            await loadColorGrades();
            updateOverviewStats();
          } else {
            showToast(data.message || 'Failed to update comparison', 'error');
            await loadColorGrades();
          }
        } else {
          // --- CREATE NEW ---
          showToast(`Adding comparison "${title}"...`);
          const res = await authFetch(`${CONFIG.API_BASE_URL}/api/color-grades?_t=${Date.now()}`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✓ Color grade comparison created!`);
            window.cancelColorGradeEdit();
            await loadColorGrades();
            updateOverviewStats();
          } else {
            showToast(data.message || 'Failed to create comparison', 'error');
          }
        }
      } catch (err) {
        console.error('Error saving color grade:', err);
        showToast(`Save error: ${err.message}`, 'error');
        await loadColorGrades();
      }
    });
  }

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
        const url = id ? `${CONFIG.API_BASE_URL}/api/color-grades/${id}?_t=${Date.now()}` : `${CONFIG.API_BASE_URL}/api/color-grades?_t=${Date.now()}`;
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
        console.error('Error in modal color grade save:', err);
        showToast(`Save error: ${err.message}`, 'error');
      }
    });
  }

  /* ==========================================================================
     7. HERO STATS & SITE SETTINGS
     ========================================================================== */
  async function loadSettings() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/settings?_t=${Date.now()}`);
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
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/inquiries?_t=${Date.now()}`);
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
    // Optimistic deletion
    state.inquiries = state.inquiries.filter((i) => String(i._id) !== String(id));
    renderInquiries();
    updateOverviewStats();
    showToast('Inquiry deleted.');

    try {
      const res = await authFetch(`${CONFIG.API_BASE_URL}/api/inquiries/${id}?_t=${Date.now()}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || 'Failed to delete inquiry on server', 'error');
        await window.loadInquiries();
      }
    } catch (err) {
      console.error(err);
      await window.loadInquiries();
    }
  };

  /* ==========================================================================
     9. DIRECT FILE UPLOADS (PHOTOS & VIDEOS)
     ========================================================================== */
  window.handleFileUpload = async function (inputEl, targetInputId, progressElId = null, previewElId = null) {
    const file = inputEl.files[0];
    if (!file) return;

    const targetInput = document.getElementById(targetInputId);
    const progressEl = progressElId ? document.getElementById(progressElId) : null;
    const previewEl = previewElId ? document.getElementById(previewElId) : null;

    if (progressEl) {
      progressEl.style.display = 'block';
      progressEl.textContent = `Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast(`Uploading ${file.name}... Please wait.`);
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (targetInput) targetInput.value = data.url;
        showToast(`Uploaded ${file.name} successfully!`);
        if (progressEl) {
          progressEl.textContent = `✓ Uploaded: ${data.url}`;
        }
        if (previewEl) {
          previewEl.style.display = 'block';
          const img = previewEl.querySelector('img');
          if (img) img.src = data.url;
        }
      } else {
        showToast(data.message || 'Upload failed', 'error');
        if (progressEl) progressEl.textContent = 'Upload failed.';
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload file. Check server connection.', 'error');
      if (progressEl) progressEl.textContent = 'Upload error.';
    }
  };

  /* ==========================================================================
     10. MODAL UTILITIES
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
