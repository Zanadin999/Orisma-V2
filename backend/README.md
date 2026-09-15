# Orisma Backend — deploy-ready

Backend for Showroom Orisma dashboard. Persists to `data.json` via `lowdb` (swap to Postgres by changing `db.js`).

## Quick start locally
```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET, CORS_ORIGIN, PORT
npm run dev            # http://localhost:4000
```

## Env
```
PORT=4000
JWT_SECRET=change_me
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
DB_FILE=./data.json
```

## Deploy

### Option A — Single server (frontend + backend together)
```bash
# from project root
npm run build          # builds frontend to dist/
cp -r dist backend/dist
# deploy backend folder to Railway/Render/Fly.io with: npm start
```

### Option B — Separate (Vercel frontend + Railway backend)
- Frontend: set `VITE_API_URL=https://your-backend.onrender.com` in Vercel env, then `npm run build`
- Backend: deploy `backend/` to Railway/Render with env vars above

### Frontend integration
Set `VITE_API_URL` in `.env`:
```
VITE_API_URL=http://localhost:4000
```
If unset, frontend falls back to `localStorage` (offline mode).

## API
- `POST /api/auth/login` {email,password} → {token,user}
- `POST /api/auth/register` {name,email,password,role}
- `GET /api/units` (auth), `POST /api/units`, `PUT /api/units/:id`, `DELETE /api/units/:id`, `POST /api/units/import/bulk`
- `GET /api/transactions`, `POST /api/transactions`, `PATCH /api/transactions/:id`
- `GET /api/accounts`, `POST /api/accounts` (admin), `PUT /api/accounts/:id`, `DELETE /api/accounts/:id`
- `GET /api/settings`, `PUT /api/settings`
- `GET /api/health`

Default seed accounts: `admin@orisma.local / admin` (admin), `staff@orisma.local / staff` (staff)

## Swap to Postgres/Supabase
Replace `db.js` lowdb adapter with `pg` or `supabase-js`, keep same route contracts.
