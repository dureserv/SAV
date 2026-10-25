const installations = [
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
    type: 'Efraction',
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
    type: 'Efraction',
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
const installationForm = document.getElementById('installationForm');
const fileList = document.getElementById('fileList');

let selectedInstallationId = installations[0].id;

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

function getFilteredInstallations() {
  const search = searchInput.value.trim().toLowerCase();
  const typeValue = typeFilter.value;
  const dateValue = dateFilter.value;

  return installations.filter((item) => {
    const matchesSearch =
      !search ||
      item.clientName.toLowerCase().includes(search) ||
      item.address.toLowerCase().includes(search);

    const matchesType = typeValue === 'all' || item.type === typeValue;
    const matchesDate = !dateValue || item.maintenanceDate === dateValue;

    return matchesSearch && matchesType && matchesDate;
  });
}

function renderSummary() {
  const total = installations.length;
  const fireCount = installations.filter((item) => item.type === 'Fire').length;
  const intrusionCount = installations.filter((item) => item.type === 'Efraction').length;
  const dueSoonCount = installations.filter((item) => isDueSoon(item.maintenanceDate)).length;

  totalSitesStat.textContent = total;
  fireSitesStat.textContent = fireCount;
  intrusionSitesStat.textContent = intrusionCount;
  dueSoonStat.textContent = dueSoonCount;
}

function renderTable() {
  const filtered = getFilteredInstallations();

  tableBody.innerHTML = filtered
    .map((item) => {
      const selectedClass = item.id === selectedInstallationId ? 'selected-row' : '';
      return `
        <tr class="table-clickable ${selectedClass}" data-installation-id="${item.id}">
          <td>
            <strong>${item.clientName}</strong>
          </td>
          <td>${item.address}</td>
          <td><span class="badge ${item.type === 'Fire' ? 'fire' : 'efraction'}">${item.type}</span></td>
          <td>${formatDate(item.maintenanceDate)} ${isDueSoon(item.maintenanceDate) ? '<span class="badge alert">Due soon</span>' : ''}</td>
          <td>${formatDate(item.lastModified)}</td>
        </tr>
      `;
    })
    .join('');

  resultsMeta.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;

  tableBody.querySelectorAll('tr[data-installation-id]').forEach((row) => {
    row.addEventListener('click', () => {
      selectedInstallationId = Number(row.dataset.installationId);
      renderTable();
      populateForm();
    });
  });
}

function populateForm() {
  const item = installations.find((installation) => installation.id === selectedInstallationId);
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
    if (field) {
      field.value = value ?? '';
    }
  });

  document.getElementById('systemTypeTitle').textContent = `${item.type} System Details`;

  const fileNames = item.documents.length ? item.documents : ['No files uploaded'];
  fileList.innerHTML = fileNames
    .map((file) => `<span class="file-chip">${file}</span>`)
    .join('');

  const auditList = document.getElementById('auditList');
  auditList.innerHTML = item.audit.map((entry) => `<li>${entry}</li>`).join('');
}

function showAlert(message) {
  alertBanner.textContent = message;
  alertBanner.classList.remove('hidden');
}

function addInstallation() {
  const nextId = installations.length + 1;
  const newInstallation = {
    id: nextId,
    clientName: `New Site ${nextId}`,
    contactName: 'Pending assignment',
    email: 'contact@pending.example',
    phone: '+1 (555) 010-0000',
    address: 'Add site address',
    maintenanceDate: '2026-11-30',
    type: 'Fire',
    lastModified: '2026-10-25',
    lastModifiedBy: 'A. Morgan',
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
    audit: ['25 Oct 2026 — New installation record created by A. Morgan']
  };

  installations.unshift(newInstallation);
  selectedInstallationId = newInstallation.id;
  renderSummary();
  renderTable();
  populateForm();
  showAlert('New installation created and ready for configuration.');
}

function saveChanges() {
  const item = installations.find((installation) => installation.id === selectedInstallationId);
  if (!item) return;

  const changedValues = {
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
    lastModified: new Date().toISOString().slice(0, 10)
  };

  Object.assign(item, changedValues);
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
  const files = Array.from(event.target.files || []);
  const currentItem = installations.find((installation) => installation.id === selectedInstallationId);
  if (!currentItem) return;

  currentItem.documents = files.length ? files.map((file) => file.name) : currentItem.documents;
  populateForm();
  showAlert(`${files.length} file${files.length === 1 ? '' : 's'} uploaded to document vault.`);
}

function showUpcomingAlerts() {
  const upcoming = installations.filter((item) => isDueSoon(item.maintenanceDate));
  if (!upcoming.length) {
    showAlert('No maintenance alerts due in the next 30 days.');
    return;
  }

  const summary = upcoming
    .map((item) => `${item.clientName} — ${formatDate(item.maintenanceDate)}`)
    .join(' | ');

  showAlert(`Upcoming maintenance alerts: ${summary}`);
}

function handleLogin(event) {
  event.preventDefault();
  const emailValue = document.getElementById('emailInput').value.trim();
  const passwordValue = document.getElementById('passwordInput').value.trim();

  if (!emailValue || !passwordValue) {
    return;
  }

  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

searchInput.addEventListener('input', renderTable);
typeFilter.addEventListener('change', renderTable);
dateFilter.addEventListener('change', renderTable);
document.getElementById('addInstallationButton').addEventListener('click', addInstallation);
document.getElementById('saveChangesButton').addEventListener('click', saveChanges);
document.getElementById('alertButton').addEventListener('click', showUpcomingAlerts);
document.getElementById('documentUpload').addEventListener('change', handleDocumentUpload);
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.querySelectorAll('.toggle-mask').forEach((button) => {
  button.addEventListener('click', toggleMask);
});

renderSummary();
renderTable();
populateForm();
showAlert('All installations are synchronized and ready for review.');
