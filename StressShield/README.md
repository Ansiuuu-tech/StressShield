<div align="center">
  <h1>🧠 StressShield</h1>
  <p><strong>A full-stack wellness platform for educators — with AI-driven mood tracking, journaling, guided meditation, and counselor booking.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express 4" />
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma 6" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  </p>
</div>

---

## 📋 Overview

StressShield is a privacy-first wellbeing companion designed specifically for **teachers and school staff**. It combines a rich React frontend with an intelligent Node.js backend to provide:

- **Private mood check-ins** — with AI-powered sentiment analysis, trend detection, and burnout risk assessment
- **Reflective journaling** — analyzed through evidence-based frameworks (PERMA + Maslach Burnout Inventory)
- **AI-guided support chat** — a compassionate wellbeing assistant with adaptive conversation modes and crisis detection
- **Meditation & unwind tools** — guided breathing exercises, calming audio, and video resources
- **Counselor booking** — schedule appointments with school counselors
- **Admin analytics** — aggregated, privacy-preserving wellbeing trends for school leadership

> ⚠️ **Important:** StressShield is a wellbeing **support tool**, not a replacement for emergency or clinical care. Crisis detection features direct users to appropriate services (e.g., 988 Suicide & Crisis Lifeline).

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Secure login/register with httpOnly refresh tokens, role-based access (Teacher / Counselor / Admin) |
| 🎯 **Mood Check-ins** | Log daily moods with notes; get AI/ML insights including sentiment analysis, trend prediction, and personalized recommendations |
| 📓 **Smart Journal** | Write reflective entries analyzed through PERMA pillars and emotional exhaustion levels with actionable suggestions |
| 🤖 **AI Chat** | Conversation modes (vent, prioritize, deescalate, recovery, strategy, emotional) with adaptive tone and crisis detection |
| 🧘 **Meditation** | Guided breathing exercises, calming videos, and audio relaxation tools |
| 📅 **Appointments** | Browse counselors and book sessions with appointment management |
| 📊 **Dashboard** | Wellbeing overview with mood trends, journal summaries, and upcoming appointments |
| 👑 **Admin Panel** | Aggregated analytics — teacher count, high-risk indicators, average wellness scores |
| 🛡️ **Privacy-First** | Local deterministic ML engine — all AI features work **without any API key** |

---

## 🏗️ Architecture

```mermaid
graph TD
    Client["React 19 + Vite 6<br/>Port 5173"]
    Server["Express 4 + Prisma 6<br/>Port 5000"]
    DB[("PostgreSQL 16<br/>Port 5432")]
    ML["Local ML Engine<br/>Sentiment · Trend · Burnout"]
    AI["Optional Gemini API<br/>@google/generative-ai"]

    Client -->|Axios HTTP| Server
    Server -->|Prisma ORM| DB
    Server -->|Deterministic| ML
    Server -.->|If GEMINI_API_KEY set| AI
    ML -.->|Fallback on failure| AI

    subgraph "Monorepo (npm workspaces)"
        Client
        Server
    end
```

```
StressShield/
├── package.json              # Root workspace (client + server)
├── docker-compose.yml        # PostgreSQL 16 container
├── prisma/
│   ├── schema.prisma         # Database schema (8 models, 3 enums)
│   ├── seed.js               # Demo data seeder
│   └── migrations/           # Database migrations
├── client/                   # React 19 frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # AuthContext, ThemeContext
│   │   ├── pages/            # 12 pages (Landing → Admin)
│   │   ├── services/         # Axios API client with token refresh
│   │   ├── App.jsx           # Route definitions
│   │   └── index.css         # Tailwind CSS
│   └── vite.config.js        # Port 5173, @ alias
└── server/                   # Express 4 backend (ESM)
    └── src/
        ├── app.js            # Express app setup (helmet, CORS, rate-limit)
        ├── server.js         # Entry point (port 5000)
        ├── middlewares/       # JWT auth, role guard
        ├── routes/           # auth, wellness, appointments, ai, admin, support
        └── utils/            # Prisma client, ML engine, assistant, analysis
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI framework |
| [Vite 6](https://vitejs.dev/) | Build tool & dev server |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Recharts](https://recharts.org/) | Data visualization |
| [React Hook Form](https://react-hook-form.com/) | Form validation |
| [Lucide React](https://lucide.dev/) | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| [Express 4](https://expressjs.com/) | HTTP server framework |
| [Prisma 6](https://www.prisma.io/) | ORM & migrations |
| [PostgreSQL 16](https://www.postgresql.org/) | Relational database |
| [JWT](https://jwt.io/) | Access + refresh token auth |
| [Zod](https://zod.dev/) | Schema validation |
| [Helmet](https://helmetjs.github.io/) | Security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate limiting |
| [Morgan](https://github.com/expressjs/morgan) | HTTP request logging |

### AI/ML (No API Key Required)
| Component | Description |
|-----------|-------------|
| **Local ML Engine** (`ml.js`) | Keyword-based sentiment analysis, weighted moving average trend prediction, pattern detection, multi-signal burnout risk assessment |
| **Local Assistant** (`assistant.js`) | Topic & emotion detection with lexicons, 7 conversation modes with coaching strategies |
| **Mood Analysis** (`moodAnalysis.js`) | Trigger classification, recommendation engine, nuanced mood synthesis |
| **Journal Analysis** (`journalAnalysis.js`) | PERMA pillar detection, emotional exhaustion level assessment, stress score calculation |
| **Gemini Integration** | Optional `@google/generative-ai` enhancement — falls back silently to local engine if unavailable |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (with npm)
- **Docker Desktop** (for PostgreSQL) — or a managed PostgreSQL instance

### 1. Clone & Install

```bash
git clone https://github.com/your-org/stressshield.git
cd stressshield

# Install all dependencies (root + client + server)
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Configure Environment

**Server** — create `server/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stressshield?schema=public"
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
CLIENT_URL=http://localhost:5173

# Optional — Gemini AI enhancements
GEMINI_API_KEY=
```

**Client** — create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Database

```bash
docker compose up -d
# Starts PostgreSQL 16 on port 5432
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 5. Start Development

```bash
npm run dev
# Client:  http://localhost:5173
# Server:  http://localhost:5000
```

### 🧪 Demo Accounts

All use the password: **`Welcome123!`**

| Email | Role | Name |
|-------|------|------|
| `teacher@stressshield.app` | Teacher | Ava Williams |
| `counselor@stressshield.app` | Counselor | Dr. Maya Patel |
| `admin@stressshield.app` | Admin | Jordan Lee |

---

## 📡 API Reference

All API routes are prefixed with `/api`. Authenticated routes require `Authorization: Bearer <accessToken>`.

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Refresh tokens |
| `POST` | `/api/auth/logout` | Logout |

### Authenticated (Teacher / Counselor / Admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/me` | Current user profile |
| `PATCH` | `/api/auth/me` | Update profile |
| `GET` | `/api/wellness/overview` | Dashboard data (metrics, moods, journals, appointments) |
| `GET` | `/api/wellness/moods` | Mood history (90 days) |
| `POST` | `/api/wellness/moods` | Create mood entry with AI/ML analysis |
| `GET` | `/api/wellness/moods/ml-insights` | Full ML analysis (sentiment, trend, patterns, burnout) |
| `GET` | `/api/wellness/journals` | Journal entries |
| `POST` | `/api/wellness/journals` | Create journal entry with analysis |
| `GET` | `/api/appointments/counselors` | List available counselors |
| `GET` | `/api/appointments` | User's appointments |
| `POST` | `/api/appointments` | Book an appointment |
| `GET` | `/api/ai/history` | Chat history (last 100 messages) |
| `POST` | `/api/ai/chat` | Send message to AI assistant |
| `GET` | `/api/ai/insights` | 14-day aggregated insights |
| `POST` | `/api/ai/feedback` | Rate AI response helpfulness |

### Admin Only

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/analytics` | Aggregated wellbeing analytics |
| `PATCH` | `/api/appointments/:id` | Update appointment status |

### Public Support

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/support/contact` | Submit support request |

---

## 🔐 Authentication Flow

1. **Login/Register** → Server returns `accessToken` + `refreshToken` in JSON body and sets `refreshToken` as an httpOnly cookie (30-day expiry)
2. **Storage** → Client stores tokens in `localStorage`
3. **Requests** → Axios interceptor attaches `Authorization: Bearer <accessToken>` header
4. **Refresh** → On 401 response, a second interceptor calls `/api/auth/refresh` (with retry guard) to obtain new tokens
5. **Roles** → `requireAuth` middleware verifies JWT; `requireRole('ADMIN')` restricts admin endpoints

---

## 🧠 AI/ML System

StressShield's AI/ML system is designed to work **completely offline** using deterministic algorithms — no API key required.

### Local ML Engine (`server/src/utils/ml.js`)
- **Sentiment Analysis** — Keyword-matching with positive/negative lexicons, intensifiers, and negators
- **Mood Prediction** — Weighted moving average + linear regression for trend forecasting
- **Pattern Detection** — Day-of-week averages, streak tracking, consistency scoring
- **Burnout Risk** — Multi-signal analysis combining mood frequency, trend direction, journal exhaustion, and stress levels

### Local AI Assistant (`server/src/utils/assistant.js`)
- **Emotion Detection** — 18 emotions via lexicon matching (overwhelmed, anxious, exhausted, etc.)
- **Topic Detection** — 6 categories (workload, classroom, fatigue, relationships, emotional, recovery)
- **7 Conversation Modes** — Each with tailored coaching strategy and tone
- **Crisis Detection** — Keyword-based immediate crisis response with lifeline resources

### Optional Gemini Integration
When `GEMINI_API_KEY` is configured, routes use `gemini-1.5-flash` for enhanced analysis. All Gemini calls have automatic fallback to the local engine on any error.

---

## 📖 Frontend Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Wellbeing Dashboard | Authenticated |
| `/mood` | Mood Check-in | Authenticated |
| `/journal` | Journal | Authenticated |
| `/chat` | AI Chat | Authenticated |
| `/meditation` | Meditation & Relaxation | Authenticated |
| `/appointments` | Counselor Booking | Authenticated |
| `/admin` | Admin Analytics | Admin only |
| `/settings` | User Settings | Authenticated |
| `*` | 404 Not Found | Public |

---

## 🐳 Docker

A `docker-compose.yml` is provided for local PostgreSQL:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: stressshield
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Set VITE_API_URL to your deployed API URL
# Deploy the `dist/` folder
```

### Backend → Railway

- Root directory: `server`
- Build command: `npm run db:generate`
- Start command: `npm start`
- Environment: All variables from `server/.env.example`
- Add a Railway PostgreSQL service and run migrations during release

**Production Checklist:**
- [ ] Replace JWT secrets with strong random values
- [ ] Restrict `CLIENT_URL` to your deployed domain
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set strong password hashing rounds (12+)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing conventions and that the production build succeeds (`npm run build`).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🛡️ Safety & Disclaimer

StressShield is designed as a **wellbeing support tool** for educators. It is **not** a substitute for professional medical advice, diagnosis, or treatment.

- **Crisis detection** identifies concerning language and provides immediate resources (988 Suicide & Crisis Lifeline, Crisis Text Line)
- **Data is private** — mood and journal entries are personal to each user
- **Admin analytics** are aggregated only — no individual data is exposed

If you or someone you know is in immediate danger, please contact emergency services or call **988** (US Suicide & Crisis Lifeline).

---

<div align="center">
  <p>Made with ❤️ for educators everywhere</p>
  <p>
    <a href="#-stressshield">Back to Top ↑</a>
  </p>
</div>

