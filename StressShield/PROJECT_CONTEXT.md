# StressShield — Complete Project Context

This document is a comprehensive reference for AI agents and developers to understand the **StressShield** project without needing to read every source file. It covers the architecture, tech stack, database schema, API surface, AI/ML systems, auth flow, and local development setup.

---

## 1. What is StressShield?

StressShield is a **full-stack wellness platform for educators (teachers and school staff)**. It gives teachers:

- **Private mood check-ins** — with AI/ML analysis (sentiment, trend, patterns, burnout risk)
- **Reflective journals** — analyzed with evidence-based frameworks (PERMA + Maslach Burnout Inventory)
- **AI-guided support chat** — a wellbeing companion with conversation modes, crisis detection, and adaptive tone
- **Meditation tools** — guided reset/breathing tools
- **Counselor booking** — appointments with counselors
- **Privacy-preserving wellbeing insights** — an admin dashboard with aggregated wellbeing trends

> ⚠️ **Safety note:** StressShield is a wellbeing support tool, NOT emergency or clinical care. It includes crisis detection that directs users to emergency/crisis services (e.g., 988 Suicide & Crisis Lifeline in the US).

---

## 2. Tech Stack

### Monorepo (npm workspaces)
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, React Router 7, Axios, Framer Motion, Lucide icons, React Hook Form, Recharts, Tailwind CSS |
| **Backend** | Node.js, Express 4, Prisma ORM (v6.19), Zod validation, JWT auth, Helmet, CORS, express-rate-limit, morgan |
| **Database** | PostgreSQL 16 |
| **AI/ML** | Optional Google Gemini API (`@google/generative-ai`) + **fully local fallback ML engine** (deterministic, no key required) |
| **Auth** | JWT access token (15 min) + refresh token (30 days, httpOnly cookie) + bcrypt password hashing |

### Root scripts (`package.json`)
- `npm run dev` — concurrently runs **client** (Vite on `:5173`) + **server** (Node watch on `:5000`)
- `npm run build` — builds client
- `npm run db:generate` / `npm run db:migrate` / `npm run db:seed` — Prisma workflow

---

## 3. Directory Structure

```
StressShield/
├── package.json            # Root workspace (client + server)
├── docker-compose.yml      # PostgreSQL 16 (db: stressshield, user/pass: postgres/postgres)
├── README.md               # Quick-start + deployment docs
├── prisma/
│   ├── schema.prisma       # Database schema (models + enums)
│   ├── seed.js             # Demo data (3 users + mood history)
│   └── migrations/         # 3 migrations (init, AI agent fields, ML insights + AI feedback)
├── client/
│   ├── package.json        # React 19 / Vite 6
│   ├── vite.config.js      # Port 5173, '@' alias → /src
│   ├── .env                # VITE_API_URL=http://localhost:5000/api
│   ├── index.html
│   └── src/
│       ├── App.jsx         # Route definitions
│       ├── main.jsx
│       ├── index.css       # Tailwind
│       ├── contexts/AuthContext.jsx   # Auth provider (user, login, logout, loading)
│       ├── services/api.js            # Axios instance + token refresh interceptor
│       ├── components/     # Brand, FeatureIcon, Metric, Portal, ProtectedRoute
│       └── pages/          # Landing, AuthPage, Dashboard, MoodPage, Journal, Chat,
│                           # Meditation, Appointments, Admin, Settings, NotFound
└── server/
    ├── package.json        # Express + Prisma server (ESM: "type":"module")
    ├── .env                # PORT, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, GEMINI_API_KEY
    └── src/
        ├── server.js       # Entry — listens on :5000
        ├── app.js          # Express app — middleware, rate limiters, routes, error handler
        ├── middlewares/auth.js      # createTokens, requireAuth, requireRole
        ├── routes/
        │   ├── auth.routes.js       # register, login, me, patch me, refresh, logout
        │   ├── wellness.routes.js   # overview, moods, ML insights, journals
        │   ├── appointment.routes.js# counselors list, CRUD appointments
        │   ├── ai.routes.js         # chat, history, insights, feedback
        │   └── admin.routes.js      # analytics (admin only)
        └── utils/
            ├── prisma.js            # PrismaClient singleton
            ├── ml.js                # Local ML engine (sentiment, trend, patterns, burnout)
            ├── assistant.js         # Local AI assistant fallback engine
            ├── moodAnalysis.js      # Local mood check-in analysis
            ├── journalAnalysis.js   # Local journal analysis (PERMA + MBI)
            └── wellness.js          # Teacher metrics recalculation
```

---

## 4. Database Schema (Prisma / PostgreSQL)

### Enums
- **Role**: `TEACHER | COUNSELOR | ADMIN`
- **Mood**: `TERRIBLE | LOW | NEUTRAL | GOOD | GREAT`
- **AppointmentStatus**: `PENDING | CONFIRMED | DECLINED | RESCHEDULED | COMPLETED | CANCELLED`

### Models (key fields)
- **User** — `id (cuid)`, `name`, `email (unique)`, `passwordHash?`, `role`, `avatarUrl?`, `googleId?`, `refreshToken?`, timestamps. Relations: `teacher?`, `counselor?`, `admin?`, `journals[]`, `moods[]`, `messages[]`, `notifications[]`
- **Teacher** — `userId (unique→User)`, `departmentId?`, `stressScore (int, default 0)`, `wellnessScore (int, default 70)`, `burnoutRisk (int, default 0)`, `appointments[]`
- **Counselor** — `userId (unique→User)`, `specialty`, `bio?`, `appointments[]`
- **Admin** — `userId (unique→User)`
- **Department** — `name (unique)`, `teachers[]`
- **MoodEntry** — `userId→User`, `mood (Mood)`, `score (int)`, `note?`, `aiInsight?`, `primaryTrigger?`, `recommendedAction?`, `aiDetectedMood?`, plus **ML fields**: `sentimentScore?`, `emotionalIntensity?`, `predictedNextMood?`, `trendDirection?`, `burnoutProbability?`. Indexed on `[userId, createdAt]`
- **Journal** — `userId→User`, `title`, `content`, `sentiment?`, `emotions (String[])`, `stressScore?`, `aiSuggestion?`, `permaPillar?`, `emotionalExhaustionLevel?`. Indexed on `[userId, createdAt]`
- **Appointment** — `teacherId→Teacher`, `counselorId→Counselor`, `scheduledAt`, `duration (default 45)`, `note?`, `status (AppointmentStatus)`. Indexed on `[teacherId, scheduledAt]` and `[counselorId, scheduledAt]`
- **ChatMessage** — `userId→User`, `role` (user/assistant), `content`, `detectedEmotion?`, `stressLevel?`, `suggestedAction?`, `feedbacks[]`. Indexed on `[userId, createdAt]`
- **AiFeedback** — `userId`, `messageId→ChatMessage`, `helpful (bool)`. Unique on `[userId, messageId]`
- **Notification** — `userId→User`, `title`, `body`, `read (default false)`
- **Report** — `name`, `period`, `data (Json)`

---

## 5. API Endpoints

Base URL: `http://localhost:5000/api` (all except auth require `Authorization: Bearer <accessToken>`)

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check → `{ status: "ok", timestamp }` |
| POST | `/auth/register` | Register (name, email, password) → creates teacher profile, returns `{ user, accessToken, refreshToken }` + sets refresh cookie |
| POST | `/auth/login` | Login (email, password) → same response shape |
| POST | `/auth/refresh` | Refresh tokens (cookie or body) |
| POST | `/auth/logout` | Logout (clears refresh token + cookie) |

### Authenticated (any role)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Current user (includes teacher/counselor) |
| PATCH | `/auth/me` | Update name/email |
| GET | `/wellness/overview` | Teacher metrics + latest 7 moods + 5 journals + upcoming 3 appointments |
| GET | `/wellness/moods` | Up to 90 mood entries (asc) |
| GET | `/wellness/moods/ml-insights` | Full ML analysis (needs ≥3 moods, else `{ available: false }`) |
| POST | `/wellness/moods` | Create mood entry with AI+ML analysis → returns entry + `mlInsights` |
| GET | `/wellness/journals` | All journal entries (desc) |
| POST | `/wellness/journals` | Create journal with AI+ML analysis (sentiment, PERMA, exhaustion) |
| GET | `/appointments/counselors` | List counselors |
| GET | `/appointments` | Teacher's appointments |
| POST | `/appointments` | Book appointment (counselorId, scheduledAt ISO datetime, note?) |
| GET | `/ai/history` | Last 100 chat messages (asc) |
| GET | `/ai/insights` | Aggregated 14-day insights (triggers, mood trend, journal stress trend, PERMA distribution, exhaustion levels, top emotions, recommended actions) |
| POST | `/ai/chat` | AI chat (message, mode?). Returns assistant ChatMessage with `detectedEmotion`, `stressLevel`, `suggestedAction` |
| POST | `/ai/feedback` | Rate AI response `{ messageId, helpful }` |

### Admin only (requires role ADMIN)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/analytics` | Teacher count, appointment count, high-risk count, average wellness, mood scores |
| PATCH | `/appointments/:id` | Update appointment status/scheduledAt (admin only) |

---

## 6. Authentication & Authorization Flow

1. **Login/Register** → server returns `accessToken` + `refreshToken` in JSON and sets `refreshToken` in an httpOnly cookie (`sameSite: lax`, secure in production, 30-day expiry).
2. **Client** stores both tokens in `localStorage`.
3. **API requests** → Axios request interceptor attaches `Authorization: Bearer <accessToken>`.
4. **Token refresh** → Axios response interceptor catches `401`, calls `/auth/refresh` (once, `_retry` guard), updates tokens, replays the original request. Excludes `/auth/refresh` and `/auth/login` from retry.
5. **Authorization** — `requireAuth` verifies JWT (`sub`, `role`, `name`) and attaches `req.auth`. `requireRole('ADMIN')` checks `req.auth.role`.
6. **ProtectedRoute** (client) — guards routes by presence of user; supports `roles` prop (e.g., ADMIN only).

---

## 7. AI / ML Systems (Important — works WITHOUT API key)

The system has **two tiers**: a local deterministic ML engine (always on) and optional **Gemini** enhancements (used when `GEMINI_API_KEY` is set).

### 7.1 Local ML engine (`server/src/utils/ml.js`)
All purely computational, no external calls:
- **`analyzeSentiment(text)`** — keyword-based NLP with positive/negative word lexicons, intensifiers, negators. Returns `{ sentimentScore (-1..1), emotionalValence, keywords, emotionalIntensity (0-100) }`.
- **`predictMoodTrend(history)`** — weighted moving average + linear regression. Returns `{ predictedScore, predictedMood, confidence, trendDirection (improving/declining/stable), volatilityScore, movingAverage }`. Needs ≥3 entries.
- **`detectPatterns(history)`** — day-of-week averages, best/worst day, current streak (positive/negative), consistency score. Needs ≥3 entries.
- **`predictBurnoutRisk({ moods, journals, teacher })`** — multi-signal weighted analysis (low mood frequency 25%, trend decline 20%, journal exhaustion 20%, journal stress 20%, negative streak 15%). Returns `{ burnoutProbability, confidenceInterval, riskLevel (low/moderate/high), riskFactors[], protectiveFactors[] }`.
- **`runFullMlAnalysis(ctx)`** — convenience wrapper combining all four.

### 7.2 Local AI assistant (`server/src/utils/assistant.js`)
- `localAssistant(message, mode, userContext)` → returns `{ reply, detectedEmotion, stressLevel, suggestedAction }`.
- **Topic detection** lexicons: workload, classroom, fatigue, relationships, emotional, recovery.
- **Emotion detection** lexicon: overwhelmed, anxious, exhausted, frustrated, sad, angry, stressed, hopeless, guilty, lonely, unappreciated, hopeful, calm, proud, grateful, conflicted.
- **Modes**: `deescalate`, `prioritize`, `vent`, `recovery`, `emotional`, `strategy`, `general` — each with its own coaching strategy and tone.
- **User context interpolation**: openers reference latest mood, trend direction, and burnout risk (personalized replies).
- **Stress level estimation** blends sentiment + intensity + user context (stressScore, burnoutRisk).

### 7.3 Local mood analysis (`server/src/utils/moodAnalysis.js`)
- `runLocalMoodAnalysis({ mood, score, note, sentiment, trend, patterns, burnout })` → `{ aiInsight, primaryTrigger, recommendedAction, aiDetectedMood }`.
- **Trigger classification**: Classroom Dynamics, Workload & Grading, Physical Fatigue, Emotional Recovery, General Wellbeing (default).
- **Recommendation engine**: high burnout → RESET; negative/high-intensity → JOURNAL; low mood → RESET; else UNWIND.
- **Nuanced mood synthesis**: combines selected mood + sentiment valence + intensity (e.g., "quietly deflated", "heavily drowning in the dark").

### 7.4 Local journal analysis (`server/src/utils/journalAnalysis.js`)
- `runLocalJournalAnalysis({ title, content })` → `{ sentiment, emotions[], stressScore, aiSuggestion, permaPillar, emotionalExhaustionLevel }`.
- **PERMA pillars**: Positive Emotion, Engagement, Relationships, Meaning, Accomplishment.
- **Exhaustion**: High/Moderate/Low via keyword + sentiment adjustment.
- **Stress score**: keyword density × 400 + sentiment offset, clamped 5-95.

### 7.5 Gemini integration (optional)
When `GEMINI_API_KEY` is set, the routes call Gemini (`gemini-1.5-flash`) with:
- **Chat**: system instruction with teacher-specific expertise (MBI, PERMA, CBT, compassion fatigue, polyvagal theory), live user profile snapshot (14-day mood/journal/emotion history + ML analysis), mode instructions, adaptive tone based on stress/burnout, and a strict JSON response schema. Long conversations (>20 msgs) are summarized first.
- **Mood check-ins**: prompt includes ML context, returns `{ aiInsight, primaryTrigger, recommendedAction, aiDetectedMood }`.
- **Journals**: returns `{ sentiment, emotions, stressScore, aiSuggestion, permaPillar, emotionalExhaustionLevel }`.

**Fallback behavior:** every Gemini call is wrapped in `try/catch`; on any error it silently falls back to the local deterministic engine.

### 7.6 Crisis detection
- `CRISIS_KEYWORDS` in both `ai.routes.js` and `assistant.js`: suicide, self-harm, hopeless, etc.
- On detection, the chat immediately returns a **crisis response** with 988 Lifeline / Crisis Text Line resources and `suggestedAction: 'BOOKING'`, `stressLevel: 95`, `detectedEmotion: 'crisis'`.

### 7.7 Chat response format
Assistant replies may include an inline action tag: `[ACTION:MEDITATION:reset]`, `[ACTION:JOURNAL]`, or `[ACTION:BOOKING]` which the frontend renders as actionable buttons.

---

## 8. Frontend Pages & Routing

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing | Public |
| `/login`, `/register` | AuthPage | Public |
| `/dashboard` | Dashboard (wellbeing overview + insights panel) | Authenticated |
| `/mood` | MoodPage (check-in + ML badges) | Authenticated |
| `/journal` | Journal (PERMA/exhaustion badges + prompt starters) | Authenticated |
| `/chat` | Chat (modes, emotion/stress chips, action buttons) | Authenticated |
| `/meditation` | Meditation (guided tools) | Authenticated |
| `/appointments` | Appointments (booking + list) | Authenticated |
| `/admin` | Admin (analytics) | ADMIN only |
| `/settings` | Settings | Authenticated |
| `*` | NotFound | Public |

**Data fetching pattern:** Axios instance from `services/api.js` with baseURL from `VITE_API_URL`. Protected routes use `ProtectedRoute` which checks auth context (optionally `roles`).

---

## 9. Environment Setup

### `server/.env`
```
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stressshield?schema=public"
JWT_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<optional>
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Local run steps
1. `npm install` (root), `npm install --prefix client`, `npm install --prefix server`
2. Start PostgreSQL (`docker compose up -d` or native)
3. `npm run db:generate` then `npm run db:migrate`
4. `npm run db:seed` (demo data)
5. `npm run dev` → client `:5173`, API `:5000`

### Demo accounts (password: `Welcome123!`)
- `teacher@stressshield.app` (Ava Williams — TEACHER)
- `counselor@stressshield.app` (Dr. Maya Patel — COUNSELOR)
- `admin@stressshield.app` (Jordan Lee — ADMIN)

The seed also creates a "Science" department and 7 days of mood history for the teacher.

---

## 10. Key Implementation Details / Gotchas

- **ESM**: `server/package.json` has `"type": "module"` — all server files use `import`/`export`.
- **Prisma output path**: generator output is `../node_modules/.prisma/client` (shared workspace location). The server imports `@prisma/client` normally.
- **Migrations**: 3 total — `20260729042157_init`, `20260801115700_add_ai_agent_fields`, `20260801130000_add_ml_insights_and_ai_feedback`. Ensure `prisma migrate status` shows "Database schema is up to date".
- **Rate limiting**: general 300 req/15min, auth login 15/15min, AI chat 60/15min.
- **CORS**: `CLIENT_URL` env (comma-separated allowed) or defaults to `http://localhost:5173`, with `credentials: true`.
- **Wellness metric recalculation** (`wellness.js`): after each mood/journal submission, teacher's `wellnessScore`, `stressScore`, `burnoutRisk` are recomputed using a blend of formula + ML predictor.
- **Temp files**: The repo previously contained `tmp-*.mjs`, `tmp-login.json` files used for E2E verification (they have since been cleaned up).

---

## 11. Deployment Notes (from README)

- **Client** → Vercel with `npm run build` and `VITE_API_URL` pointed at the Railway API URL.
- **Server** → Railway (root dir `server`, build `npm run db:generate`, start `npm start`, all env vars from `.env.example`). Add a Railway PostgreSQL and run migrations during release.
- Restrict `CLIENT_URL` to the deployed domain; replace dev JWT secrets before production.

