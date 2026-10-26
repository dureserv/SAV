const seedInstallations = [
  {
    id: 1,
    clientName: 'Northside Apartments',
    contactName: 'Maya Lewis',
    email: 'maya@northside.example',
    phone: '+1 (415) 555-1024',
    address: '22 River Walk, San Jose, CA',
    maintenanceDate: '2026-11-14',
    type: 'Fire',
    lastModified: '2026-10-10',
    lastModifiedBy: 'A. Morgan',
    notes: 'Elevator lobby sprinkler inspection scheduled after renovation.',
    installerCode: '482611',
    masterCode: '1998',
    unitType: 'Notifier NFS-320',
    detectors: 28,
    battery: 'Lithium 24V backup',
    sirens: 4,
    keyboards: 2,
    panels: 3,
    communication: 'IP Network',
    controlRoom: 'Central Dispatch NF',
    documents: ['northside_plan.pdf'],
    audit: ['10 Oct 2026 — Fire panel battery set replaced by A. Morgan', '05 Sep 2026 — Door sensor calibration confirmed']
  },
  {
    id: 2,
    clientName: 'Willow Creek Retail',
    contactName: 'Jordan Bell',
    email: 'jordan@willowcreek.example',
    phone: '+1 (415) 555-7322',
    address: '98 Market Street, Oakland, CA',
    maintenanceDate: '2026-10-29',
    type: 'Intrusion',
    lastModified: '2026-10-11',
    lastModifiedBy: 'S. Patel',
    notes: 'Front desk keypad to be reprogrammed following tenant turnover.',
    installerCode: '120934',
    masterCode: '5412',
    unitType: 'Honeywell VISTA',
    detectors: 18,
    battery: '12V sealed lead acid',
    sirens: 3,
    keyboards: 4,
    panels: 1,
    communication: 'Cellular Backup',
    controlRoom: 'Oakland Monitoring',
    documents: ['retail-security-specs.pdf'],
    audit: ['11 Oct 2026 — Entry delay settings adjusted by S. Patel', '18 Aug 2026 — Dual-path signal verified']
  },
  {
    id: 3,
    clientName: 'Harbor Medical Center',
    contactName: 'Dana Walters',
    email: 'dana@harborcare.example',
    phone: '+1 (510) 555-5341',
    address: '540 Bayview Drive, Fremont, CA',
    maintenanceDate: '2026-12-08',
    type: 'Fire',
    lastModified: '2026-10-05',
    lastModifiedBy: 'R. Nguyen',
    notes: 'High-rise code compliance review and annual contractor signoff required.',
    installerCode: '004129',
    masterCode: '2260',
    unitType: 'Simplex 4100U',
    detectors: 46,
    battery: 'NFPA emergency battery array',
    sirens: 7,
    keyboards: 5,
    panels: 4,
    communication: 'Fiber Backbone',
    controlRoom: 'Hospital Safety Center',
    documents: ['hospital-site-plan.png'],
    audit: ['05 Oct 2026 — Annual fire drill log uploaded by R. Nguyen', '02 Jul 2026 — Pull station test completed']
  },
  {
    id: 4,
    clientName: 'Cedar School District',
    contactName: 'Olivia Shaw',
    email: 'olivia@cedarschool.example',
    phone: '+1 (408) 555-9967',
    address: '120 El Dorado Ave, Sunnyvale, CA',
    maintenanceDate: '2026-10-27',
    type: 'Intrusion',
    lastModified: '2026-10-12',
    lastModifiedBy: 'M. Ortiz',
    notes: 'Administration building access points flagged for new badge integration.',
    installerCode: '981720',
    masterCode: '8791',
    unitType: 'Bosch D9412',
    detectors: 22,
    battery: 'Long-life 24V battery',
    sirens: 5,
    keyboards: 3,
    panels: 2,
    communication: 'Hybrid Wi-Fi + Cellular',
    controlRoom: 'District Security Office',
    documents: ['district-floor-plan.pdf', 'district-specsheet.pdf'],
    audit: ['12 Oct 2026 — Access control matrix shared with district by M. Ortiz', '20 Sep 2026 — Motion sensor coverage adjusted']
  }
];

const state = {
  installations: [],
  selectedId: null,
  currentUser: null,
  auditEntries: [],
  filters: {
    search: '',
    type: 'all',
    date: ''
  }
};

const tableBody = document.getElementById('installationTableBody');
const totalSitesStat = document.getElementById('totalSitesStat');
const fireSitesStat = document.getElementById('fireSitesStat');
const intrusionSitesStat = document.getElementById('intrusionSitesStat');
const dueSoonStat = document.getElementById('dueSoonStat');
const resultsMeta = document.getElementById('resultsMeta');
const alertBanner = document.getElementById('alertBanner');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const dateFilter = document.getElementById('dateFilter');
const fileList = document.getElementById('fileList');
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const currentUserName = document.getElementById('currentUserName');
const currentUserRole = document.getElementById('currentUserRole');
const sessionStatus = document.getElementById('sessionStatus');
const addFireButton = document.getElementById('addFireButton');
const addIntrusionButton = document.getElementById('addIntrusionButton');
const saveChangesButton = document.getElementById('saveChangesButton');
const documentUploadInput = document.getElementById('documentUpload');
const logoutButton = document.getElementById('logoutButton');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const profileForm = document.getElementById('profileForm');
const passwordResetForm = document.getElementById('passwordResetForm');
const profileNameInput = document.getElementById('profileNameInput');
const profileCompanyInput = document.getElementById('profileCompanyInput');
const profileDepartmentInput = document.getElementById('profileDepartmentInput');
const profileTitleInput = document.getElementById('profileTitleInput');
const profilePhoneInput = document.getElementById('profilePhoneInput');
const auditEntries = document.getElementById('auditEntries');
const auditPanel = document.getElementById('auditPanel');

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function isDueSoon(dateString) {
  if (!dateString) return false;
  const today = new Date();
  const target = new Date(`${dateString}T00:00:00`);
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
}

function hasPermission(permission) {
  if (!state.currentUser) return false;
  const permissions = Array.isArray(state.currentUser.permissions) ? state.currentUser.permissions : [];
  return permissions.includes(permission);
}

function updateUserCard() {
  if (!state.currentUser) {
    currentUserName.textContent = 'Not signed in';
    currentUserRole.textContent = 'Please log in';
    sessionStatus.textContent = 'Not authenticated';
    return;
  }

  currentUserName.textContent = state.currentUser.name;
  currentUserRole.textContent = `${state.currentUser.role} • ${state.currentUser.department || 'Operations'}`;
  sessionStatus.textContent = `Authenticated via session/JWT • ${state.currentUser.role}`;
}

function setSessionStatus(message) {
  if (sessionStatus) sessionStatus.textContent = message;
}

function applyRoleAccess() {
  const canWrite = hasPermission('installation:write');
  const canUpload = hasPermission('document:upload');
  const canViewAudit = hasPermission('audit:view');

  saveChangesButton.disabled = !canWrite;
  addFireButton.disabled = !canWrite;
  addIntrusionButton.disabled = !canWrite;
  documentUploadInput.disabled = !canUpload;

  const auditPanels = document.querySelectorAll('.audit-only');
  auditPanels.forEach((element) => {
    if (canViewAudit) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });

  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((button) => {
    const view = button.dataset.view;
    const alwaysVisible = ['dashboard', 'installations', 'alerts', 'documents', 'profile'];
    if (view === 'audit' && !canViewAudit) {
      button.classList.add('hidden');
    } else if (alwaysVisible.includes(view)) {
      button.classList.remove('hidden');
    }
  });

  if (!canWrite) {
    saveChangesButton.title = 'You do not have permission to edit installations.';
    addFireButton.title = 'You do not have permission to add installations.';
    addIntrusionButton.title = 'You do not have permission to add installations.';
  } else {
    saveChangesButton.title = '';
    addFireButton.title = '';
    addIntrusionButton.title = '';
  }

  if (!canViewAudit && auditPanel) {
    auditPanel.classList.add('hidden');
  }
}

function showLogin() {
  loginPage.classList.remove('hidden');
  app.classList.add('hidden');
}

function showApp() {
  loginPage.classList.add('hidden');
  app.classList.remove('hidden');
}

function renderAuditEntries(entries) {
  if (!auditEntries) return;
  if (!Array.isArray(entries) || !entries.length) {
    auditEntries.innerHTML = '<div class="audit-empty">No security events available.</div>';
    return;
  }

  auditEntries.innerHTML = entries.slice(0, 8).map((entry) => `
    <div class="audit-entry">
      <div class="audit-title">${entry.action || 'auth_event'}</div>
      <div class="audit-meta">${entry.email || 'unknown'} • ${new Date(entry.timestamp || Date.now()).toLocaleString()}</div>
      <div class="audit-detail">${entry.details || 'No details provided.'}</div>
    </div>
  `).join('');
}

async function loadAuditLog() {
  if (!state.currentUser || !hasPermission('audit:view')) return;

  try {
    const response = await fetch('/api/auth/audit', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      renderAuditEntries([]);
      return;
    }

    const data = await response.json();
    state.auditEntries = Array.isArray(data.entries) ? data.entries : [];
    renderAuditEntries(state.auditEntries);
  } catch (_error) {
    renderAuditEntries([]);
  }
}

async function loadInstallations() {
  if (!state.currentUser) {
    showLogin();
    return;
  }

  try {
    const response = await fetch('/api/installations', { credentials: 'same-origin' });
    if (!response.ok) {
      if (response.status === 401) {
        showLogin();
        return;
      }
      throw new Error('Failed to load installations');
    }

    const data = await response.json();
    state.installations = Array.isArray(data) && data.length ? data : seedInstallations;
    localStorage.setItem('sav-installations', JSON.stringify(state.installations));
  } catch (_error) {
    const fallback = JSON.parse(localStorage.getItem('sav-installations') || 'null');
    state.installations = Array.isArray(fallback) && fallback.length ? fallback : seedInstallations;
  }

  state.selectedId = state.installations[0]?.id ?? null;
  renderSummary();
  renderTable();
  populateForm();
  showAlert('All installations are synchronized and ready for review.');
}

function saveLocalInstallations() {
  localStorage.setItem('sav-installations', JSON.stringify(state.installations));
}

function getFilteredInstallations() {
  return state.installations.filter((item) => {
    const search = state.filters.search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (item.clientName && item.clientName.toLowerCase().includes(search)) ||
      (item.address && item.address.toLowerCase().includes(search));

    const matchesType = state.filters.type === 'all' || item.type === state.filters.type;
    const matchesDate = !state.filters.date || item.maintenanceDate === state.filters.date;

    return matchesSearch && matchesType && matchesDate;
  });
}

function renderSummary() {
  const total = state.installations.length;
  const fireCount = state.installations.filter((item) => item.type === 'Fire').length;
  const intrusionCount = state.installations.filter((item) => item.type === 'Intrusion').length;
  const dueSoonCount = state.installations.filter((item) => isDueSoon(item.maintenanceDate)).length;

  totalSitesStat.textContent = total;
  fireSitesStat.textContent = fireCount;
  intrusionSitesStat.textContent = intrusionCount;
  dueSoonStat.textContent = dueSoonCount;
}

function renderTable() {
  const filtered = getFilteredInstallations();

  tableBody.innerHTML = filtered
    .map((item) => {
      const tbodyRow = item.id === state.selectedId ? 'selected-row' : '';
      return `
        <tr class="table-clickable ${tbodyRow}" data-installation-id="${item.id}">
          <td><strong>${item.clientName}</strong></td>
          <td>${item.address}</td>
          <td><span class="badge ${item.type === 'Fire' ? 'fire' : 'intrusion'}">${item.type}</span></td>
          <td>${formatDate(item.maintenanceDate)} ${isDueSoon(item.maintenanceDate) ? '<span class="badge alert">Due soon</span>' : ''}</td>
          <td>${formatDate(item.lastModified)}</td>
        </tr>
      `;
    })
    .join('');

  resultsMeta.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

  tableBody.querySelectorAll('tr[data-installation-id]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedId = Number(row.dataset.installationId);
      renderTable();
      populateForm();
    });
  });
}

function populateForm() {
  const item = state.installations.find((installation) => installation.id === state.selectedId);
  if (!item) return;

  const fields = [
    ['clientNameInput', item.clientName],
    ['contactNameInput', item.contactName],
    ['emailFieldInput', item.email],
    ['phoneInput', item.phone],
    ['addressInput', item.address],
    ['maintenanceDateInput', item.maintenanceDate],
    ['lastModifiedInput', item.lastModifiedBy],
    ['notesInput', item.notes],
    ['installerCodeInput', item.installerCode],
    ['masterCodeInput', item.masterCode],
    ['unitTypeInput', item.unitType],
    ['batteryInput', item.battery],
    ['detectorsInput', item.detectors],
    ['sirensInput', item.sirens],
    ['keyboardsInput', item.keyboards],
    ['panelsInput', item.panels],
    ['communicationInput', item.communication],
    ['controlRoomInput', item.controlRoom]
  ];

  fields.forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) field.value = value ?? '';
  });

  document.getElementById('systemTypeTitle').textContent = `${item.type} System Details`;

  const fileNames = item.documents?.length ? item.documents : ['No files uploaded'];
  fileList.innerHTML = fileNames.map((file) => `<span class="file-chip">${file}</span>`).join('');

  const auditList = document.getElementById('auditList');
  auditList.innerHTML = (item.audit || []).map((entry) => `<li>${entry}</li>`).join('');
}

function showAlert(message) {
  alertBanner.textContent = message;
  alertBanner.classList.remove('hidden');
}

async function addInstallation(type = 'Fire') {
  if (!hasPermission('installation:write')) {
    showAlert('This user role does not have permission to add installations.');
    return;
  }

  const nextId = Date.now();
  const newInstallation = {
    id: nextId,
    clientName: `New Site ${new Date().getSeconds()}`,
    contactName: 'Pending assignment',
    email: 'contact@pending.example',
    phone: '+1 (555) 010-0000',
    address: 'Add site address',
    maintenanceDate: '2026-11-30',
    type,
    lastModified: new Date().toISOString().slice(0, 10),
    lastModifiedBy: state.currentUser?.name || 'A. Morgan',
    notes: 'New installation added and awaiting full details.',
    installerCode: '000000',
    masterCode: '0000',
    unitType: 'Awaiting configuration',
    detectors: 0,
    battery: 'Awaiting details',
    sirens: 0,
    keyboards: 0,
    panels: 0,
    communication: 'Pending',
    controlRoom: 'Pending',
    documents: [],
    audit: [`${new Date().toISOString().slice(0, 10)} — New installation record created by ${state.currentUser?.name || 'A. Morgan'}`]
  };

  try {
    const response = await fetch('/api/installations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(newInstallation)
    });

    if (response.ok) {
      const saved = await response.json();
      state.installations.unshift(saved);
      state.selectedId = saved.id;
    } else {
      state.installations.unshift(newInstallation);
      state.selectedId = newInstallation.id;
    }
  } catch (_error) {
    state.installations.unshift(newInstallation);
    state.selectedId = newInstallation.id;
  }

  saveLocalInstallations();
  renderSummary();
  renderTable();
  populateForm();
  showAlert('New installation created and ready for configuration.');
}

async function saveChanges() {
  if (!hasPermission('installation:write')) {
    showAlert('This role cannot modify installation records.');
    return;
  }

  const item = state.installations.find((installation) => installation.id === state.selectedId);
  if (!item) return;

  const payload = {
    clientName: document.getElementById('clientNameInput').value,
    contactName: document.getElementById('contactNameInput').value,
    email: document.getElementById('emailFieldInput').value,
    phone: document.getElementById('phoneInput').value,
    address: document.getElementById('addressInput').value,
    maintenanceDate: document.getElementById('maintenanceDateInput').value,
    notes: document.getElementById('notesInput').value,
    lastModifiedBy: document.getElementById('lastModifiedInput').value || item.lastModifiedBy,
    installerCode: document.getElementById('installerCodeInput').value,
    masterCode: document.getElementById('masterCodeInput').value,
    unitType: document.getElementById('unitTypeInput').value,
    battery: document.getElementById('batteryInput').value,
    detectors: Number(document.getElementById('detectorsInput').value || 0),
    sirens: Number(document.getElementById('sirensInput').value || 0),
    keyboards: Number(document.getElementById('keyboardsInput').value || 0),
    panels: Number(document.getElementById('panelsInput').value || 0),
    communication: document.getElementById('communicationInput').value,
    controlRoom: document.getElementById('controlRoomInput').value,
    lastModified: new Date().toISOString().slice(0, 10),
    type: item.type
  };

  const updatedItem = { ...item, ...payload };

  try {
    const response = await fetch(`/api/installations/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const saved = await response.json();
      const index = state.installations.findIndex((installation) => installation.id === item.id);
      if (index >= 0) state.installations[index] = saved;
    } else {
      const index = state.installations.findIndex((installation) => installation.id === item.id);
      if (index >= 0) state.installations[index] = updatedItem;
    }
  } catch (_error) {
    const index = state.installations.findIndex((installation) => installation.id === item.id);
    if (index >= 0) state.installations[index] = updatedItem;
  }

  saveLocalInstallations();
  renderSummary();
  renderTable();
  populateForm();
  showAlert('Installation details have been saved successfully.');
}

function toggleMask(event) {
  const input = document.getElementById(event.currentTarget.dataset.target);
  if (!input) return;

  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  event.currentTarget.textContent = isHidden ? 'Hide' : 'Reveal';
}

function handleDocumentUpload(event) {
  if (!hasPermission('document:upload')) {
    showAlert('This role does not have permission to upload documents.');
    return;
  }

  const files = Array.from(event.target.files || []);
  const currentItem = state.installations.find((installation) => installation.id === state.selectedId);
  if (!currentItem) return;

  currentItem.documents = files.length ? files.map((file) => file.name) : currentItem.documents;
  saveLocalInstallations();
  populateForm();
  showAlert(`${files.length} file${files.length === 1 ? '' : 's'} uploaded to document vault.`);
}

function showUpcomingAlerts() {
  const upcoming = state.installations.filter((item) => isDueSoon(item.maintenanceDate));

  if (!upcoming.length) {
    showAlert('No maintenance alerts due in the next 30 days.');
    return;
  }

  const summary = upcoming
    .map((item) => `${item.clientName} — ${formatDate(item.maintenanceDate)}`)
    .join(' | ');

  showAlert(`Upcoming maintenance alerts: ${summary}`);
}

async function handleLogin(event) {
  event.preventDefault();
  const emailValue = document.getElementById('emailInput').value.trim();
  const passwordValue = document.getElementById('passwordInput').value.trim();

  if (!emailValue || !passwordValue) {
    loginError.textContent = 'Please enter both email and password.';
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue, password: passwordValue })
    });

    const data = await response.json();
    if (!response.ok) {
      loginError.textContent = data.message || 'Unable to sign in.';
      return;
    }

    state.currentUser = data.user;
    state.currentUser.permissions = Array.isArray(data.user.permissions) ? data.user.permissions : [];
    updateUserCard();
    applyRoleAccess();
    showApp();
    loginError.textContent = '';
    setSessionStatus(`Authenticated • ${data.user.role}`);
    await loadInstallations();
    await loadAuditLog();
  } catch (_error) {
    loginError.textContent = 'Unable to sign in right now. Please try again.';
  }
}

async function handleProfileUpdate(event) {
  event.preventDefault();
  if (!state.currentUser) return;

  const payload = {
    name: profileNameInput.value.trim(),
    company: profileCompanyInput.value.trim(),
    department: profileDepartmentInput.value.trim(),
    title: profileTitleInput.value.trim(),
    phone: profilePhoneInput.value.trim()
  };

  try {
    const response = await fetch('/api/users/me', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      showAlert(data.message || 'Profile update failed.');
      return;
    }

    state.currentUser = data.user;
    updateUserCard();
    applyRoleAccess();
    showAlert('Profile updated successfully.');
  } catch (_error) {
    showAlert('Unable to save profile right now.');
  }
}

async function handlePasswordChange(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('currentPasswordInput').value;
  const newPassword = document.getElementById('newPasswordInput').value;
  const confirmPassword = document.getElementById('confirmPasswordInput').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showAlert('Please complete all password fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert('New password confirmation does not match.');
    return;
  }

  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();
    if (!response.ok) {
      showAlert(data.message || 'Password change failed.');
      return;
    }

    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    showAlert('Password updated successfully.');
  } catch (_error) {
    showAlert('Unable to change password right now.');
  }
}

async function handleForgotPasswordRequest() {
  const email = window.prompt('Enter the email address for your SAV account:', 'name@sav.local');
  if (!email) return;

  try {
    const response = await fetch('/api/auth/password-reset-request', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    });

    const data = await response.json();
    if (response.ok) {
      const message = data.message || 'Password reset request received.';
      loginError.textContent = message;
      if (data.token) {
        const token = window.prompt('Copy the reset token and paste it here to continue:', data.token);
        if (token) {
          const newPassword = window.prompt('Enter a new password (8+ characters):', '');
          if (newPassword) {
            await resetPasswordWithToken(token.trim(), newPassword.trim());
          }
        }
      }
      return;
    }

    loginError.textContent = data.message || 'Unable to send password reset request.';
  } catch (_error) {
    loginError.textContent = 'Unable to send password reset request right now.';
  }
}

async function resetPasswordWithToken(token, newPassword) {
  if (!token || !newPassword || newPassword.length < 8) {
    loginError.textContent = 'Reset token and a password of at least 8 characters are required.';
    return;
  }

  try {
    const response = await fetch('/api/auth/password-reset', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword })
    });

    const data = await response.json();
    if (!response.ok) {
      loginError.textContent = data.message || 'Password reset failed.';
      return;
    }

    loginError.textContent = data.message || 'Password reset succeeded.';
  } catch (_error) {
    loginError.textContent = 'Unable to reset password right now.';
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });
  } catch (_error) {
    // Intentionally ignore logout failures so the user can still be signed out locally.
  }

  state.currentUser = null;
  state.auditEntries = [];
  updateUserCard();
  showLogin();
  if (auditEntries) auditEntries.innerHTML = '';
  setSessionStatus('Logged out');
}

async function checkSession() {
  try {
    const response = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!response.ok) {
      state.currentUser = null;
      updateUserCard();
      showLogin();
      setSessionStatus('Not authenticated');
      return;
    }

    const data = await response.json();
    state.currentUser = data.user;
    state.currentUser.permissions = Array.isArray(data.user.permissions) ? data.user.permissions : [];
    updateUserCard();
    applyRoleAccess();
    showApp();
    await loadInstallations();
    await loadAuditLog();
  } catch (_error) {
    state.currentUser = null;
    updateUserCard();
    showLogin();
    setSessionStatus('Session unavailable');
  }
}

async function fillProfile() {
  if (!state.currentUser) return;

  profileNameInput.value = state.currentUser.name || '';
  profileCompanyInput.value = state.currentUser.company || 'Secure Alarm Vault';
  profileDepartmentInput.value = state.currentUser.department || 'Operations';
  profileTitleInput.value = state.currentUser.title || '';
  profilePhoneInput.value = state.currentUser.phone || '';
}

searchInput.addEventListener('input', (event) => {
  state.filters.search = event.target.value;
  renderTable();
});

typeFilter.addEventListener('change', (event) => {
  state.filters.type = event.target.value;
  renderTable();
});

dateFilter.addEventListener('change', (event) => {
  state.filters.date = event.target.value;
  renderTable();
});

addFireButton.addEventListener('click', () => addInstallation('Fire'));
addIntrusionButton.addEventListener('click', () => addInstallation('Intrusion'));
saveChangesButton.addEventListener('click', saveChanges);
document.getElementById('alertButton').addEventListener('click', showUpcomingAlerts);
documentUploadInput.addEventListener('change', handleDocumentUpload);
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', logout);
forgotPasswordButton.addEventListener('click', handleForgotPasswordRequest);
profileForm.addEventListener('submit', handleProfileUpdate);
passwordResetForm.addEventListener('submit', handlePasswordChange);
document.querySelectorAll('.toggle-mask').forEach((button) => {
  button.addEventListener('click', toggleMask);
});

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    if (button.dataset.view === 'profile') {
      fillProfile();
    }
  });
});

updateUserCard();
checkSession();
