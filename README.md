# Playlist Tool

This project provides a simple playlist web app written entirely in TypeScript.
The backend is an Express server and the frontend is a React application
bundled with `esbuild`.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Create configuration**
   Copy `.env.example` to `.env` and fill in your Cloudflare R2 credentials if
   you plan to upload files. (Uploads are not implemented yet.)

3. **Build the frontend**
   ```bash
   npm run build --prefix frontend
   ```

4. **Start the server**
   ```bash
   npm run build --prefix backend
   node backend/dist/server.js
   ```
   The server serves the compiled frontend from `frontend/dist` on port `3000`.

5. **Open the app**
   Navigate to `http://localhost:3000`. A new playlist will be created
   automatically and you will be redirected to a URL like `/p/abc123`.
   Share that URL to allow others to view and edit the playlist.

## Features

- Add any content via a link or uploaded file placeholder
- Reorder items using arrow buttons
- Check off items you've viewed (stored in `localStorage`)
- Add optional notes for each item
- Playlists are saved in `backend/db.json` for simplicity

## Development Notes

The frontend is written with React and TypeScript and bundled using
`esbuild`. The backend is a small Express server that stores playlists in a
JSON file. Feel free to enhance the code with authentication, proper file
uploads, or a real database.
