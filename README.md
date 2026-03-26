# Personal CRM

A beautiful, dark-mode personal CRM for managing your professional contacts.

## Features

- 📇 Contact cards with avatars, photos, tags
- 🔍 Search and filter contacts
- ✏️ Add, edit, delete contacts
- 📷 Photo/business card upload
- 🏷️ Tag-based filtering
- 📱 Mobile-responsive grid layout
- 🌑 Dark mode UI (Linear/Notion quality)

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (Node built-in `node:sqlite`)
- **File uploads:** Multer (stored locally)

## Development

```bash
# Install root deps
npm install

# Install client deps
cd client && npm install && cd ..

# Start backend (port 3001)
npm run dev

# Start frontend (port 5173)
cd client && npm run dev
```

## Production / Deploy

```bash
# Build frontend
npm run build

# Start server (serves frontend + API)
npm start
```

The server serves the React app from `client/dist/` and the API at `/api/contacts`.

## Live URL

Deployed on Railway: (pending deployment)
