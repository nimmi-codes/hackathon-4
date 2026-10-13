# Lost & Found Portal (Sri Lanka)

MERN app: `/backend` (Express + Mongoose) and `/frontend` (React + Vite).

## Run locally

**1. Backend**
```bash
cd backend
cp .env.example .env     # then fill MONGO_URI, PORT (5000), ADMIN_PASSWORD
npm install
npm run dev              # http://localhost:5000
```

**2. Frontend** (new terminal)
```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

Sign up normally for a customer account. To create a staff/admin account, type the value of `ADMIN_PASSWORD` into the **Staff code** field on sign up.

## Deploy

**Backend → Render** (Web Service)
- Root directory: `backend`, build: `npm install`, start: `npm start`
- Environment: `MONGO_URI`, `ADMIN_PASSWORD` (Render sets `PORT`)
- In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Render can connect.

**Frontend → Netlify**
- Base directory: `frontend`, build: `npm run build`, publish: `frontend/dist`
- Environment: `VITE_API_URL=https://<your-render-service>.onrender.com/api`
- `public/_redirects` handles SPA routing.

CORS is hardcoded in `backend/server.js` (localhost and `*.netlify.app`). If you use a custom domain, add it there.
