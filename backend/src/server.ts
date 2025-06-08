import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../db.json');

interface PlaylistItem {
  id: string;
  url: string;
  notes?: string;
  type: string;
}

interface Playlist {
  id: string;
  items: PlaylistItem[];
}

interface Database {
  playlists: Record<string, Playlist>;
}

function loadDb(): Database {
  if (!fs.existsSync(DB_FILE)) return { playlists: {} };
  try {
    const text = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(text || '{"playlists":{}}');
  } catch {
    return { playlists: {} };
  }
}

function saveDb(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function randomId() {
  return Math.random().toString(36).substring(2, 8);
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/playlists', (req: Request, res: Response) => {
  const db = loadDb();
  const id = randomId();
  db.playlists[id] = { id, items: [] };
  saveDb(db);
  res.json({ id });
});

app.get('/api/playlists/:id', (req: Request, res: Response) => {
  const db = loadDb();
  const pl = db.playlists[req.params.id];
  if (!pl) return res.status(404).json({ error: 'Not found' });
  res.json(pl);
});

app.post('/api/playlists/:id/items', (req: Request, res: Response) => {
  const db = loadDb();
  const pl = db.playlists[req.params.id];
  if (!pl) return res.status(404).json({ error: 'Not found' });
  const item: PlaylistItem = { id: randomId(), ...req.body };
  pl.items.push(item);
  saveDb(db);
  res.json(item);
});

app.put('/api/playlists/:id/items/:itemId', (req: Request, res: Response) => {
  const db = loadDb();
  const pl = db.playlists[req.params.id];
  if (!pl) return res.status(404).json({ error: 'Not found' });
  const idx = pl.items.findIndex(it => it.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ error: 'item not found' });
  pl.items[idx] = { ...pl.items[idx], ...req.body };
  saveDb(db);
  res.json(pl.items[idx]);
});

app.post('/api/playlists/:id/reorder', (req: Request, res: Response) => {
  const db = loadDb();
  const pl = db.playlists[req.params.id];
  if (!pl) return res.status(404).json({ error: 'Not found' });
  const orderedIds: string[] = req.body.orderedIds || [];
  const newItems = orderedIds
    .map(id => pl.items.find(it => it.id === id))
    .filter(Boolean) as PlaylistItem[];
  pl.items = newItems;
  saveDb(db);
  res.json(pl);
});

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
