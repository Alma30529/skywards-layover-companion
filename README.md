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

## Demo booking references (PNRs)
On the "Plan your layover" screen the passenger types a PNR (6 letters or numbers) instead of picking flights. Each PNR gives the inbound flight, outbound flight and cabin class.

| PNR | Flights | Cabin | Result |
|-----|---------|-------|--------|
| K7P2QX | EK203 to EK150 | Economy | 3h 5m usable, full access |
| M3R8TW | EK607 to EK412 | Business | 4h usable, premium options first |
| B9D4LN | EK311 to EK570 | First | 11h usable, long layover |
| Z5H6JC | EK501 to EK232 | Economy | exactly 2h usable (boundary) |
| H2N7VD | EK311 to EK088 | Economy | 1h 20m usable, airport-only |
| T4C9WA | EK607 to EK070 | Economy | 30m usable, stay near your gate |

**Existing database (Railway or a local DB made before this change):** run `db/pnr.sql` once. It adds the `pnr_bookings` table and the rows above without wiping anything. Fresh databases get them from `schema.sql` and `seed.sql`.

## Branch rules
- Never push directly to `main`.
- Create a branch named `feature/<short-name>` (e.g. `feature/auth`).
- Open a pull request into `main` and merge it once reviewed.

## Team
Alma Mashhood, Anushay Sohail, Fatima Rizwan Lakhani, Nabiha Hasan, Samiah Saud
