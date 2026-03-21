# Syncly deployment guide

Syncly is now configured to be deployed with:

- **Frontend:** Vercel (`Frontend/`)
- **Backend:** Render (`Backend/`)

## Architecture

- The React/Vite frontend reads its API and Socket.IO endpoints from `VITE_API_BASE_URL` and `VITE_SOCKET_URL`.
- The Express backend reads deploy-time settings from environment variables and now supports:
  - configurable CORS allowlists,
  - cross-site auth cookies for Vercel ↔ Render production deployments,
  - a public `/health` endpoint for Render health checks,
  - configurable invite links that point back to the deployed frontend.

## Deploying the backend to Render

### Option 1: `render.yaml`

This repository includes `render.yaml` at the repo root. Create a new **Blueprint** deployment in Render and point it at this repository.

### Option 2: Manual Render service

Use these settings:

- **Root directory:** `Backend`
- **Build command:** `npm ci`
- **Start command:** `npm start`
- **Health check path:** `/health`

### Backend environment variables

Set these in Render using `Backend/.env.example` as the template:

- `NODE_ENV=production`
- `PORT=5500`
- `DB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE=7d`
- `INVITE_SECRET`
- `CLIENT_URL=https://<your-vercel-domain>`
- `CORS_ORIGINS=https://<your-vercel-domain>`
- `COOKIE_SAME_SITE=none`
- `EMAIL_PASSWORD`
- optional: `ARCJET_KEY`, `ARCJET_ENV`

> If you later add a custom frontend domain, include both domains in `CORS_ORIGINS` as a comma-separated list.

## Deploying the frontend to Vercel

Create a Vercel project with **Root Directory** set to `Frontend`.

Recommended settings:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

### Frontend environment variables

Set these in Vercel using `Frontend/.env.example` as the template:

- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
- `VITE_SOCKET_URL=https://<your-render-service>.onrender.com`

`Frontend/vercel.json` already includes an SPA rewrite so React Router routes like `/projects/:projectId` work correctly after deployment.

## Local development

### Backend

1. Copy `Backend/.env.example` to `Backend/.env.development.local`.
2. Fill in local values.
3. Run:

```bash
cd Backend
npm install
npm run dev
```

### Frontend

1. Copy `Frontend/.env.example` to `Frontend/.env.local`.
2. Point `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to your local backend.
3. Run:

```bash
cd Frontend
npm install
npm run dev
```

## Production readiness changes included

- backend CORS and cookies are environment-aware,
- frontend API/socket URLs are environment-driven,
- Render health checks are supported,
- Vercel SPA route rewrites are included,
- environment variable templates are included for both apps.
