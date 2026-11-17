# Skywards Layover Companion

A web app that helps Emirates passengers turn long Dubai layovers into personalised, bookable experiences while earning Skywards points.

> **Student prototype.** Uses mock data and Stripe test mode. Not affiliated with Emirates or Skywards. No real payments or points are processed.

## Live links
- Frontend: https://skywards-layover-companion.vercel.app
- Backend API: https://skywards-layover-companion-production-956954fb.up.railway.app (health check: `/health`)

## Tech stack
- Frontend: React + Vite + Tailwind CSS (`frontend/`), deployed on Vercel
- Backend: Node.js + Express (`server/`), deployed on Railway
- Database: PostgreSQL (`db/`), hosted on Railway
- Integrations: Stripe (test mode), Google Maps Embed API

## Repo structure
- `frontend/` React app
- `server/` Express REST API
- `db/schema.sql` tables; `db/seed.sql` mock data (safe to re-run, it wipes and reseeds)

## Run the database locally
```bash
docker run --name skywards-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=skywards -p 5432:5432 -d postgres:16
docker exec -i skywards-db psql -U postgres -d skywards < db/schema.sql
docker exec -i skywards-db psql -U postgres -d skywards < db/seed.sql
```

## Run the backend locally
```bash
cd server
npm install
```
Create `server/.env` (never committed):
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/skywards
OTP_SECRET=any-long-random-string
DEMO_MODE=true
PORT=4000
```
Then run `npm start`.

## Run the frontend locally
```bash
cd frontend
npm install
npm run dev
```
The frontend calls `http://localhost:4000` unless `VITE_API_URL` is set.

## Deployment
- Frontend: Vercel, root directory `frontend`, redeploys on every merge to `main`. Env var `VITE_API_URL` points to the backend.
- Backend: Railway, root directory `server`. Env vars: `DATABASE_URL`, `CORS_ORIGIN`, `OTP_SECRET`, `DEMO_MODE`.
- Database: Railway Postgres, loaded from `db/schema.sql` and `db/seed.sql`.

## Demo logins (mock data only)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skywards.test | Admin@12345 |
| Passenger | passenger.a@skywards.test | Passenger@123 |
| Passenger | passenger.b@skywards.test | Passenger@123 |
| Passenger | passenger.c@skywards.test | Passenger@123 |

Unlinked Skywards numbers for testing registration: EK 0000 0004 to EK 0000 0010.

## Branch rules
- Never push directly to `main`.
- Create a branch named `feature/<short-name>` (e.g. `feature/auth`).
- Open a pull request into `main` and merge it once reviewed.

## Team
Alma Mashhood, Anushay Sohail, Fatima Rizwan Lakhani, Nabiha Hasan, Samiah Saud
