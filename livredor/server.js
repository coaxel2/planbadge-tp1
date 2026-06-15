// Livre d'or — petite application full-stack (Node.js pur, sans dépendance)
// API REST + persistance fichier. Déployée par Claude pour la "Mission ultime" du TP1.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = '/data';
const DATA_FILE = path.join(DATA_DIR, 'messages.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveMessages(msgs) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
  fs.writeFileSync(DATA_FILE, JSON.stringify(msgs, null, 2));
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // --- API : lister les messages ---
  if (req.method === 'GET' && url === '/api/messages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loadMessages()));
    return;
  }

  // --- API : ajouter un message ---
  if (req.method === 'POST' && url === '/api/messages') {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 5000) req.destroy();
    });
    req.on('end', () => {
      let data;
      try { data = JSON.parse(body); } catch (e) { data = {}; }
      const name = String(data.name || 'Anonyme').trim().slice(0, 40) || 'Anonyme';
      const message = String(data.message || '').trim().slice(0, 280);
      if (!message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message vide' }));
        return;
      }
      const msgs = loadMessages();
      msgs.unshift({ name, message, date: new Date().toISOString() });
      saveMessages(msgs.slice(0, 200));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // --- Fichier statique : la page ---
  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
      if (err) { res.writeHead(500); res.end('Erreur serveur'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Page introuvable');
});

server.listen(PORT, () => console.log("Livre d'or en écoute sur le port " + PORT));
