const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const uploadDir = path.join(dataDir, 'uploads');
const dataFile = path.join(dataDir, 'installations.json');
const usersFile = path.join(dataDir, 'users.json');

const seedData = [
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

function sanitizeDocumentList(documents) {
  if (!Array.isArray(documents)) return [];

  return documents.map((document) => {
    if (typeof document === 'string') {
      return {
        name: document,
        storedName: document,
        url: `/api/documents/${encodeURIComponent(document)}`
      };
    }

    return {
      name: document.name || document.displayName || 'Document',
      storedName: document.storedName || document.name || 'Document',
      url: document.url || (document.storedName ? `/api/documents/${encodeURIComponent(document.storedName)}` : '')
    };
  });
}

function createSeedUsers() {
  return [
    {
      id: 1,
      email: 'admin@sav.local',
      name: 'Alex Morgan',
      role: 'admin',
      passwordHash: bcrypt.hashSync('securevault', 12)
    },
    {
      id: 2,
      email: 'installer@sav.local',
      name: 'Sam Patel',
      role: 'installer',
      passwordHash: bcrypt.hashSync('installer123', 12)
    },
    {
      id: 3,
      email: 'auditor@sav.local',
      name: 'Renee Clark',
      role: 'auditor',
      passwordHash: bcrypt.hashSync('auditor123', 12)
    }
  ];
}

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2));
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify(createSeedUsers(), null, 2));
  }
}

function readInstallations() {
  ensureDataStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw);
}

function writeInstallations(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function readUsers() {
  ensureDataStore();
  const raw = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(raw);
}

function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const safeName = path.basename(file.originalname || 'document')
        .replace(/[^a-zA-Z0-9_.-]/g, '-')
        .toLowerCase();
      const fileExtension = path.extname(safeName) || '';
      const baseName = path.basename(safeName, fileExtension);
      callback(null, `${Date.now()}-${baseName}${fileExtension}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sav-local-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    }
  })
);
app.use(express.static(rootDir));

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }

    return next();
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'SAV API', timestamp: new Date().toISOString() });
});

app.get('/api/auth/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, user: req.session.user });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const users = readUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return res.json({ message: 'Authenticated', user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true, message: 'Logged out successfully.' });
  });
});

app.get('/api/installations', requireAuth, (req, res) => {
  const installations = readInstallations();
  res.json(installations);
});

app.post('/api/installations', requireAuth, requireRole('admin', 'installer'), (req, res) => {
  const data = readInstallations();
  const payload = { ...req.body };

  const newItem = {
    id: Date.now(),
    clientName: payload.clientName || 'New Site',
    contactName: payload.contactName || 'Pending assignment',
    email: payload.email || 'contact@pending.example',
    phone: payload.phone || '+1 (555) 010-0000',
    address: payload.address || 'Add site address',
    maintenanceDate: payload.maintenanceDate || new Date().toISOString().slice(0, 10),
    type: payload.type || 'Fire',
    lastModified: payload.lastModified || new Date().toISOString().slice(0, 10),
    lastModifiedBy: payload.lastModifiedBy || req.session.user.name,
    notes: payload.notes || 'New installation added and awaiting full details.',
    installerCode: payload.installerCode || '000000',
    masterCode: payload.masterCode || '0000',
    unitType: payload.unitType || 'Awaiting configuration',
    detectors: Number(payload.detectors ?? 0),
    battery: payload.battery || 'Awaiting details',
    sirens: Number(payload.sirens ?? 0),
    keyboards: Number(payload.keyboards ?? 0),
    panels: Number(payload.panels ?? 0),
    communication: payload.communication || 'Pending',
    controlRoom: payload.controlRoom || 'Pending',
    documents: sanitizeDocumentList(payload.documents).map((item) => item.name),
    audit: Array.isArray(payload.audit)
      ? payload.audit
      : [`${new Date().toISOString().slice(0, 10)} — New installation record created by ${req.session.user.name}`]
  };

  data.unshift(newItem);
  writeInstallations(data);
  return res.status(201).json(newItem);
});

app.put('/api/installations/:id', requireAuth, requireRole('admin', 'installer'), (req, res) => {
  const id = Number(req.params.id);
  const data = readInstallations();
  const index = data.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Installation not found.' });
  }

  const updated = {
    ...data[index],
    ...req.body,
    id,
    lastModified: req.body.lastModified || new Date().toISOString().slice(0, 10),
    lastModifiedBy: req.body.lastModifiedBy || data[index].lastModifiedBy || req.session.user.name,
    documents: Array.isArray(req.body.documents)
      ? req.body.documents.map((document) => (typeof document === 'string' ? document : document.name || document.storedName || 'Document'))
      : data[index].documents || []
  };

  data[index] = updated;
  writeInstallations(data);
  return res.json(updated);
});

app.get('/api/export/installations', requireAuth, requireRole('admin', 'installer', 'auditor'), (req, res) => {
  const format = String(req.query.format || 'json').toLowerCase();
  const data = readInstallations();

  if (format === 'csv') {
    const rows = [
      ['id', 'clientName', 'contactName', 'email', 'phone', 'address', 'maintenanceDate', 'type', 'lastModified', 'lastModifiedBy', 'notes']
    ];

    data.forEach((item) => {
      rows.push([
        item.id,
        item.clientName,
        item.contactName,
        item.email,
        item.phone,
        item.address,
        item.maintenanceDate,
        item.type,
        item.lastModified,
        item.lastModifiedBy,
        item.notes
      ]);
    });

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sav-installations.csv"');
    return res.send(csv);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="sav-installations.json"');
  return res.send(JSON.stringify(data, null, 2));
});

app.post('/api/import/installations', requireAuth, requireRole('admin', 'installer'), (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : req.body.installations;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({ message: 'Import payload must be an array or contain an installations array.' });
  }

  const sanitized = incoming.map((item, index) => ({
    id: Number(item.id || Date.now() + index),
    clientName: item.clientName || 'Imported Site',
    contactName: item.contactName || 'Pending assignment',
    email: item.email || 'contact@pending.example',
    phone: item.phone || '+1 (555) 010-0000',
    address: item.address || 'Add site address',
    maintenanceDate: item.maintenanceDate || new Date().toISOString().slice(0, 10),
    type: item.type || 'Fire',
    lastModified: item.lastModified || new Date().toISOString().slice(0, 10),
    lastModifiedBy: item.lastModifiedBy || req.session.user.name,
    notes: item.notes || 'Imported installation record.',
    installerCode: item.installerCode || '000000',
    masterCode: item.masterCode || '0000',
    unitType: item.unitType || 'Awaiting configuration',
    detectors: Number(item.detectors ?? 0),
    battery: item.battery || 'Awaiting details',
    sirens: Number(item.sirens ?? 0),
    keyboards: Number(item.keyboards ?? 0),
    panels: Number(item.panels ?? 0),
    communication: item.communication || 'Pending',
    controlRoom: item.controlRoom || 'Pending',
    documents: sanitizeDocumentList(item.documents).map((entry) => entry.name),
    audit: Array.isArray(item.audit) ? item.audit : []
  }));

  writeInstallations(sanitized);
  return res.json({ ok: true, imported: sanitized.length });
});

app.post('/api/documents/upload', requireAuth, requireRole('admin', 'installer'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const previewUrl = `/api/documents/${encodeURIComponent(req.file.filename)}`;
  return res.status(201).json({
    name: req.file.originalname,
    storedName: req.file.filename,
    url: previewUrl
  });
});

app.get('/api/documents/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const extension = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain'
  };

  res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
  return res.sendFile(filePath);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SAV server running at http://localhost:${PORT}`);
});
