import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resources = [
  { id: 'LD1', name: 'Loading Dock 1', hasDockLeveler: false },
  { id: 'LD2', name: 'Loading Dock 2', hasDockLeveler: false },
  { id: 'LD3', name: 'Loading Dock 3', hasDockLeveler: true },
  { id: 'SE1', name: 'Service Elevator', hasDockLeveler: false }
];

const rules = {
  bufferMinutes: 15,
  dockOpen: '06:00',
  dockClose: '18:00',
  deliveryTypeServiceElevatorDefaults: {
    'Major Delivery / Move': true,
    'Event Setup': true,
    'Construction Delivery': true,
    'Minor Courier Delivery': false
  }
};

const db = {
  bookings: [{
    id: 'BKG-1001', tenantName: 'Alex Martin', company: 'Blue Peak Law', email: 'alex@bluepeak.com', phone: '555-0134',
    requestedDate: '2026-05-15', startTime: '09:00', endTime: '10:00', resource: 'Loading Dock 1 (LD1)',
    vendor: 'Metro Freight', deliveryType: 'Major Delivery / Move', notes: 'Palletized office supplies', attachments: 0,
    status: 'Pending', route: 'Dock Corridor A > Freight Vestibule', sizeCategory: 'Roll on / Roll off', heavyArticles: 'No',
    dockLevelerRequired: 'No', requiresServiceElevator: true, acknowledgedPolicy: true
  }],
  activity: ['System initialized.']
};

const contentType = (file) => ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' }[path.extname(file)] || 'text/plain');
const sendJson = (res, status, data) => { res.writeHead(status, { 'Content-Type':'application/json' }); res.end(JSON.stringify(data)); };
const parseBody = (req) => new Promise((resolve) => { let b=''; req.on('data',(c)=>b+=c); req.on('end',()=>resolve(b?JSON.parse(b):{})); });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/bootstrap' && req.method === 'GET') return sendJson(res, 200, { resources, rules, ...db });
  if (url.pathname === '/api/bookings' && req.method === 'POST') {
    const booking = await parseBody(req);
    db.bookings.unshift(booking);
    db.activity.unshift(`Booking ${booking.id} submitted by ${booking.tenantName}. Email notice sent.`);
    return sendJson(res, 201, booking);
  }
  if (url.pathname.startsWith('/api/bookings/') && req.method === 'PATCH') {
    const id = url.pathname.split('/').pop();
    const patch = await parseBody(req);
    const b = db.bookings.find((x) => x.id === id);
    Object.assign(b, patch);
    db.activity.unshift(`Booking ${id} updated.`);
    return sendJson(res, 200, b);
  }
  if (url.pathname === '/api/rules' && req.method === 'PATCH') {
    Object.assign(rules, await parseBody(req));
    return sendJson(res, 200, rules);
  }

  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const full = path.join(__dirname, file);
  if (!full.startsWith(__dirname) || !fs.existsSync(full)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': contentType(full) });
  fs.createReadStream(full).pipe(res);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
