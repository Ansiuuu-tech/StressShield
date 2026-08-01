# StressShield

StressShield is a full-stack wellness platform for educators. It gives teachers private mood check-ins, reflective journals, AI-guided support, meditation tools, and counselor booking. Administrators receive aggregated, privacy-preserving wellbeing trends.

## Quick start

1. Install dependencies from the project root: `npm install`, `npm install --prefix client`, and `npm install --prefix server`.
2. Copy the example environment files and set secure secrets plus a PostgreSQL connection string.
3. Start PostgreSQL with `docker compose up -d` (or use a managed database).
4. Generate the Prisma client and apply the schema: `npm run db:generate` then `npm run db:migrate`.
5. Add demo data with `npm run db:seed`, then run `npm run dev`.

The frontend is available at `http://localhost:5173`; the API runs at `http://localhost:5000`.

Demo accounts after seeding: `teacher@stressshield.app`, `counselor@stressshield.app`, and `admin@stressshield.app`; each uses `Welcome123!`.

## Architecture

- `client/` — React 19 / Vite experience with protected routes and responsive UI.
- `server/` — Express API with JWT role controls, validation, rate limiting, Helmet, CORS, Prisma, and optional Gemini integration.
- `prisma/` — PostgreSQL domain model and seed data.

## Deployment

Deploy `client` to Vercel with `npm run build` and `VITE_API_URL` configured to the Railway API URL. Deploy `server` to Railway with the root directory set to `server`, build command `npm run db:generate`, start command `npm start`, and all variables from `.env.example`. Add a Railway PostgreSQL service and run migrations during release. Restrict `CLIENT_URL` to the deployed Vercel domain and replace all development JWT secrets before production.

## Safety

StressShield is a wellbeing support tool, not emergency or clinical care. For immediate danger, users should contact local emergency services or a local crisis service.
