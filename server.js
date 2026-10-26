const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const dataFile = path.join(dataDir, 'installations.json');
const usersFile = path.join(dataDir, 'users.json');
const sessions = new Map();

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

function hashPassword(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

const seedUsers = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'admin@sav.local',
    passwordHash: hashPassword('securevault'),
    role: 'Operations Lead',
    permissions: ['dashboard:view', 'installation:read', 'installation:write', 'alert:view', 'document:upload']
  },
  {
    id: 2,
    name: 'Sam Patel',
    email: 'installer@sav.local',
    passwordHash: hashPassword('installer123'),
    role: 'Installer',
    permissions: ['dashboard:view', 'installation:read', 'installation:write', 'alert:view', 'document:upload']
  },
  {
    id: 3,
    name: 'Renee Nguyen',
    email: 'auditor@sav.local',
    passwordHash: hashPassword('auditor123'),
    role: 'Auditor',
    permissions: ['dashboard:view', 'installation:read', 'alert:view']
  }
];

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2));
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify(seedUsers, null, 2));
  }
}

function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie;

  if (!header) {
    return cookies;
  }

  header.split(';').forEach((pair) => {
    const [key, ...valueParts] = pair.split('=');
    if (!key) {
      return;
    }

    const value = valueParts.join('=');
    cookies[key.trim()] = value ? decodeURIComponent(value.trim()) : '';
  });

  return cookies;
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

function serializeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function getSessionUser(req) {
  const token = req.cookies.sessionToken;
  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = user;
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

app.use((req, res, next) => {
  req.cookies = parseCookies(req);
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(rootDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'SAV API', timestamp: new Date().toISOString() });
});

app.get('/api/session', (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({ user });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '').trim();
  const users = readUsers();
  const matchedUser = users.find((user) => {
    return user.email.toLowerCase() === email && user.passwordHash === hashPassword(password);
  });

  if (!matchedUser) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const sessionUser = serializeUser(matchedUser);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, sessionUser);

  res.cookie('sessionToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  });

  res.json({ user: sessionUser });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.cookies.sessionToken;
  sessions.delete(token);
  res.clearCookie('sessionToken');
  res.json({ ok: true });
});

app.get('/api/installations', requireAuth, (req, res) => {
  res.json(readInstallations());
});

app.post('/api/installations', requireAuth, requirePermission('installation:write'), (req, res) => {
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
    lastModifiedBy: payload.lastModifiedBy || req.user.name,
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
    documents: Array.isArray(payload.documents) ? payload.documents : [],
    audit: Array.isArray(payload.audit)
      ? payload.audit
      : [`${new Date().toISOString().slice(0, 10)} — New installation record created by ${req.user.name}`]
  };

  data.unshift(newItem);
  writeInstallations(data);
  res.status(201).json(newItem);
});

app.put('/api/installations/:id', requireAuth, requirePermission('installation:write'), (req, res) => {
  const id = Number(req.params.id);
  const data = readInstallations();
  const index = data.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Installation not found' });
  }

  const updated = { ...data[index], ...req.body, id };
  data[index] = updated;
  writeInstallations(data);
  res.json(updated);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SAV server running at http://localhost:${PORT}`);
});

module.exports = { app, hashPassword };









































































































































































































a