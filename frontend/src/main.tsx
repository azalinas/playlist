import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type Item = {
  id: string;
  url: string;
  notes?: string;
  type: string;
};

type Playlist = {
  id: string;
  items: Item[];
};

function App() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const playlistId = pathParts[1];

  useEffect(() => {
    if (!playlistId) {
      fetch('/api/playlists', { method: 'POST' })
        .then(r => r.json())
        .then(p => { window.location.pathname = '/p/' + p.id; });
    } else {
      fetch('/api/playlists/' + playlistId)
        .then(r => r.json())
        .then(setPlaylist);
    }
  }, [playlistId]);

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const item = {
      url: formData.get('url') as string,
      notes: formData.get('notes') as string,
      type: 'link'
    };
    fetch('/api/playlists/' + playlistId + '/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
      .then(r => r.json())
      .then(it => setPlaylist(prev => prev && { ...prev, items: [...prev.items, it] }));
    form.reset();
  }

  function toggleChecked(id: string) {
    const key = 'checked_' + playlistId + '_' + id;
    if (localStorage.getItem(key)) localStorage.removeItem(key);
    else localStorage.setItem(key, '1');
    setPlaylist(p => p && { ...p });
  }

  function move(id: string, dir: 'up' | 'down') {
    if (!playlist) return;
    const items = [...playlist.items];
    const idx = items.findIndex(i => i.id === id);
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
    setPlaylist({ ...playlist, items });
    fetch('/api/playlists/' + playlistId + '/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: items.map(i => i.id) })
    });
  }

  if (!playlist) return <>Loading...</>;

  return (
    <div>
      <h1>Playlist {playlist.id}</h1>
      {playlist.items.map(item => (
        <div key={item.id} className="item">
          <input
            type="checkbox"
            checked={!!localStorage.getItem('checked_' + playlistId + '_' + item.id)}
            onChange={() => toggleChecked(item.id)}
          />{' '}
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.url}
          </a>
          <button onClick={() => move(item.id, 'up')}>↑</button>
          <button onClick={() => move(item.id, 'down')}>↓</button>
          <div className="notes">{item.notes || ''}</div>
        </div>
      ))}
      <form onSubmit={addItem}>
        <input name="url" placeholder="Link or file URL" required />
        <input name="notes" placeholder="Notes" />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
