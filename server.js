const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const dbFile = path.join(dataDir, 'sav-db.json');

const seedClients = [
  {
    id: 1,
    name: 'Northside Apartments',
    contactName: 'Maya Lewis',
    email: 'maya@northside.example',
    phone: '+1 (415) 555-1024',
    address: '22 River Walk, San Jose, CA',
    notes: 'Multi-tenant residential property with mixed life safety systems.'
  },
  {
    id: 2,
    name: 'Willow Creek Retail',
    contactName: 'Jordan Bell',
    email: 'jordan@willowcreek.example',
    phone: '+1 (415) 555-7322',
    address: '98 Market Street, Oakland, CA',
    notes: 'Retail center with storefront, office suite, and rear service corridor.'
  },
  {
    id: 3,
    name: 'Harbor Medical Center',
    contactName: 'Dana Walters',
    email: 'dana@harborcare.example',
    phone: '+1 (510) 555-5341',
    address: '540 Bayview Drive, Fremont, CA',
    notes: 'Healthcare campus with high-rise safety and emergency compliance review.'
  },
  {
    id: 4,
    name: 'Cedar School District',
    contactName: 'Olivia Shaw',
    email: 'olivia@cedarschool.example',
    phone: '+1 (408) 555-9967',
    address: '120 El Dorado Ave, Sunnyvale, CA',
    notes: 'District-wide security coverage for administration and classroom buildings.'
  }
];

const seedInstallations = [
  {
    id: 1,
    clientId: 1,
    type: 'Fire',
    clientName: 'Northside Apartments',
    contactName: 'Maya Lewis',
    email: 'maya@northside.example',
    phone: '+1 (415) 555-1024',
    address: '22 River Walk, San Jose, CA',
    maintenanceDate: '2026-11-14',
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
    clientId: 2,
    type: 'Intrusion',
    clientName: 'Willow Creek Retail',
    contactName: 'Jordan Bell',
    email: 'jordan@willowcreek.example',
    phone: '+1 (415) 555-7322',
    address: '98 Market Street, Oakland, CA',
    maintenanceDate: '2026-10-29',
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
    clientId: 3,
    type: 'Fire',
    clientName: 'Harbor Medical Center',
    contactName: 'Dana Walters',
    email: 'dana@harborcare.example',
    phone: '+1 (510) 555-5341',
    address: '540 Bayview Drive, Fremont, CA',
    maintenanceDate: '2026-12-08',
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
    clientId: 4,
    type: 'Intrusion',
    clientName: 'Cedar School District',
    contactName: 'Olivia Shaw',
    email: 'olivia@cedarschool.example',
    phone: '+1 (408) 555-9967',
    address: '120 El Dorado Ave, Sunnyvale, CA',
    maintenanceDate: '2026-10-27',
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

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ clients: seedClients, installations: seedInstallations }, null, 2));
  }
}

function readStore() {
  ensureDataStore();
  const raw = fs.readFileSync(dbFile, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    const clients = Array.isArray(parsed.clients) && parsed.clients.length ? parsed.clients : seedClients;
    const installations = Array.isArray(parsed.installations) && parsed.installations.length ? parsed.installations : seedInstallations;
    return { clients, installations };
  } catch (error) {
    return { clients: seedClients, installations: seedInstallations };
  }
}

function writeStore(store) {
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2));
}

function normalizeClientPayload(payload = {}) {
  return {
    name: payload.name || payload.clientName || 'New Client',
    contactName: payload.contactName || 'Pending assignment',
    email: payload.email || 'contact@pending.example',
    phone: payload.phone || '+1 (555) 010-0000',
    address: payload.address || 'Add client address',
    notes: payload.notes || 'Client profile created and pending review.'
  };
}

function normalizeInstallationPayload(payload = {}) {
  const clientId = Number(payload.clientId ?? 0);
  const clientName = payload.clientName || payload.name || 'Client';

  return {
    clientId,
    clientName,
    contactName: payload.contactName || 'Pending assignment',
    email: payload.email || 'contact@pending.example',
    phone: payload.phone || '+1 (555) 010-0000',
    address: payload.address || 'Add site address',
    maintenanceDate: payload.maintenanceDate || new Date().toISOString().slice(0, 10),
    type: payload.type || 'Fire',
    lastModified: payload.lastModified || new Date().toISOString().slice(0, 10),
    lastModifiedBy: payload.lastModifiedBy || 'A. Morgan',
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
      : [`${new Date().toISOString().slice(0, 10)} — New installation record created by ${payload.lastModifiedBy || 'A. Morgan'}`]
  };
}

app.use(express.json({ limit: '2mb' }));
app.use(express.static(rootDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'SAV API', timestamp: new Date().toISOString() });
});

app.get('/api/clients', (req, res) => {
  const { clients } = readStore();
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const store = readStore();
  const payload = normalizeClientPayload(req.body);

  const newClient = {
    id: Date.now(),
    ...payload
  };

  store.clients.unshift(newClient);
  writeStore(store);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const store = readStore();
  const id = Number(req.params.id);
  const index = store.clients.findIndex((client) => client.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Client not found' });
  }

  const updatedClient = { ...store.clients[index], ...normalizeClientPayload(req.body), id };
  store.clients[index] = updatedClient;

  store.installations = store.installations.map((installation) => {
    if (installation.clientId === id) {
      return {
        ...installation,
        clientName: updatedClient.name,
        contactName: updatedClient.contactName,
        email: updatedClient.email,
        phone: updatedClient.phone,
        address: updatedClient.address
      };
    }
    return installation;
  });

  writeStore(store);
  res.json(updatedClient);
});

app.get('/api/installations', (req, res) => {
  const { clients, installations } = readStore();

  const enriched = installations.map((installation) => {
    const client = clients.find((entry) => entry.id === installation.clientId);
    return {
      ...installation,
      clientName: client?.name || installation.clientName || 'Unknown Client',
      contactName: client?.contactName || installation.contactName || 'Pending assignment',
      email: client?.email || installation.email || 'contact@pending.example',
      phone: client?.phone || installation.phone || '+1 (555) 010-0000',
      address: client?.address || installation.address || 'Add site address'
    };
  });

  res.json(enriched);
});

app.post('/api/installations', (req, res) => {
  const store = readStore();
  const payload = normalizeInstallationPayload(req.body);
  const clientId = Number(payload.clientId || 0);

  if (!clientId || !store.clients.some((client) => client.id === clientId)) {
    return res.status(400).json({ message: 'A valid clientId is required to create an installation.' });
  }

  const client = store.clients.find((entry) => entry.id === clientId);
  const newItem = {
    id: Date.now(),
    ...payload,
    clientName: client?.name || payload.clientName || 'Client',
    contactName: client?.contactName || payload.contactName || 'Pending assignment',
    email: client?.email || payload.email || 'contact@pending.example',
    phone: client?.phone || payload.phone || '+1 (555) 010-0000',
    address: client?.address || payload.address || 'Add site address'
  };

  store.installations.unshift(newItem);
  writeStore(store);
  res.status(201).json(newItem);
});

app.put('/api/installations/:id', (req, res) => {
  const store = readStore();
  const id = Number(req.params.id);
  const index = store.installations.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Installation not found' });
  }

  const clientId = Number(req.body.clientId || store.installations[index].clientId || 0);
  const client = store.clients.find((entry) => entry.id === clientId);
  const payload = normalizeInstallationPayload({ ...store.installations[index], ...req.body, clientId });

  const updated = {
    ...store.installations[index],
    ...payload,
    id,
    clientName: client?.name || payload.clientName || store.installations[index].clientName,
    contactName: client?.contactName || payload.contactName || store.installations[index].contactName,
    email: client?.email || payload.email || store.installations[index].email,
    phone: client?.phone || payload.phone || store.installations[index].phone,
    address: client?.address || payload.address || store.installations[index].address
  };

  store.installations[index] = updated;
  writeStore(store);
  res.json(updated);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SAV server running at http://localhost:${PORT}`);
});
