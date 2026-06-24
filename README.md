# Thadam AI

**Turn AI-generated roadmaps into living checklists you can finish.**

Thadam AI is a full-stack application that uses Google Gemini to generate structured learning roadmaps. It has completed a comprehensive 12-Phase Stabilization Audit and features a highly isolated Feature-Sliced Design (FSD) React frontend communicating with a Modular Monolith Spring Boot backend.

---

## Tech Stack

**Frontend** | **Backend** | **Infrastructure**
---|---|---
Next.js 16.2.6 | Java 21 + Spring Boot 3.5.14 | Neon Serverless PostgreSQL
React 19.2.6 | Spring Security + JWT (jjwt 0.12.7) | Redis (Managed)
TypeScript 5 | Spring OAuth2 Client (Google) | Flyway migrations
Tailwind CSS 4 | Spring Data JPA | Maven Wrapper
Framer Motion 12.40 | MapStruct 1.6.3 | Zoho AppSail (Hosting)

---

## Features

- **AI Roadmap Generation** — Describe a learning goal, pick a duration and difficulty, and our asynchronous background worker uses Gemini to generate a structured roadmap without blocking your session
- **Interactive Checklists** — Expand roadmaps to see milestones, drill into tasks, update statuses (TODO → IN_PROGRESS → DONE)
- **Gamified Progress** — Earn coins for completing tasks via a highly consistent transactional ledger system
- **JWT Authentication** — Secure access and True Refresh Token Rotation (RTR) to prevent session hijacking
- **Google OAuth2** — Sign in with Google for a frictionless onboarding
- **Role-Based Access** — USER, MODERATOR, ADMIN roles with admin panel, role-gated sidebar navigation
- **Community Discovery** — Browse all public roadmaps with search, upvote/downvote, and fork them to your dashboard
- **People Directory** — Browse community members, see their roadmap counts and roles
- **Roadmap Forking** — Clone any roadmap with all milestones and tasks — credit back to the original
- **Voting System** — Upvote/downvote community roadmaps, scores update in real-time
- **Dual Theme** — Dark/light mode with warm Stone palette and Amber accent, persisted in localStorage
- **Page Transitions** — Smooth animated route transitions via Framer Motion

---

## Architecture

```
client/                     # Next.js 16 frontend (port 3000)
  src/
    app/                    # Next.js App Router pages (Route Groups)
    core/                   # Centralized API logic (axios, interceptors)
    features/               # Isolated Domain Modules (FSD)
      auth/                 # Login, Registration, JWT Context
      roadmap/              # Queries, mutations, UI for roadmap logic
      community/            # Feed logic
    shared/                 # Shared UI (Avatar, Button, Card, Toast)
    types/                  # Global TypeScript Interfaces

server/                     # Spring Boot backend (port 5000)
  src/main/java/com/thadam/ai/modules/
    auth/                   # Auth module (Clean Architecture)
      presentation/         # Controllers
      core/application/     # Services, DTOs
      core/domain/          # Entities
      infrastructure/       # Security, repositories
    roadmap/                # Roadmap module
    ledger/                 # Coin ledger module
    admin/                  # Admin module
    user/                   # User module
  src/main/resources/
    db/migration/           # Flyway migrations (V1–V5)
    prompts/                # Gemini prompt templates
```

The backend follows a Modular Monolith (Clean Architecture) package layout with clear separation. Each module has its own presentation, core application, core domain, and infrastructure layers. The frontend uses a scalable Feature-Sliced structure.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Java 21 (JDK)
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
- Neon Serverless PostgreSQL Database

### 1. Clone & Install

```bash
git clone <repo-url>
cd thadam-ai

# Frontend
cd client
npm install

# Backend
cd ../server
.\mvnw dependency:go-offline 
```

### 2. Environment

```bash
# Backend — copy and fill in secrets
cp server/.env.example server/.env
```

Required variables in `server/.env`:

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL (default: `jdbc:postgresql://localhost:5432/thadam`) |
| `DB_USERNAME` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | JWT signing key (min 32 chars) |
| `GEMINI_API_KEY` | Google Gemini API key |

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Google OAuth.

### 3. Start Server Manually

To run the app locally for development:

```bash
# Terminal 1: Start Spring Boot Backend
cd server
.\mvnw spring-boot:run # starts on port 5000

# Terminal 2: Start Next.js Frontend
cd client
npm run dev # starts on port 3000
```

Open **http://localhost:3000** and you're ready.

---

---

## API Overview

All endpoints return responses wrapped in `ApiResponse<T>`:

```json
{ "success": true, "message": "...", "data": { ... } }
```

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/auth/register` | Public | Register a new user |
| `POST /api/auth/login` | Public | Login, returns JWT + refresh token |
| `POST /api/auth/refresh` | Public | Rotate refresh token |
| `POST /api/auth/logout` | Auth | Revoke all refresh tokens |
| `GET /api/auth/me` | Auth | Get current user profile |
| `POST /api/roadmaps` | Auth | Create a roadmap |
| `GET /api/roadmaps` | Auth | List my roadmaps (paginated) |
| `POST /api/roadmaps/generate` | Auth | AI-generate a roadmap |
| `GET /api/roadmaps/public` | Auth | Browse community roadmaps (with votes, fork info) |
| `POST /api/roadmaps/{id}/fork` | Auth | Fork a roadmap (copies milestones + tasks) |
| `POST /api/roadmaps/{id}/votes` | Auth | Upvote/downvote a roadmap |
| `GET /api/roadmaps/{id}/votes` | Auth | Get your vote on a roadmap |
| `POST /api/roadmaps/{id}/milestones` | Auth | Create milestone |
| `GET /api/roadmaps/{id}/milestones` | Auth | List milestones |
| `POST /api/roadmaps/{id}/tasks` | Auth | Create task |
| `GET /api/roadmaps/{id}/tasks` | Auth | List tasks (paginated) |
| `PATCH /api/roadmaps/tasks/{id}` | Auth | Update task status |
| `GET /api/ledger/balance` | Auth | Get my coin balance |
| `GET /api/ledger/transactions` | Auth | List my transactions |
| `GET /api/user/public` | Auth | List all community members |
| `GET /api/admin/users` | ADMIN | List all users |
| `PATCH /api/admin/users/{id}/role` | ADMIN | Change user role |
| `DELETE /api/admin/users/{id}` | ADMIN | Delete user |

See `server/API.md` for the complete reference with request/response examples.

---

## Project Structure

```
thadam-ai/
├── client/                 # Next.js frontend (Feature-Sliced Architecture)
│   ├── src/                
│   │   ├── app/            # App Router
│   │   └── features/       # Feature modules
├── server/                 # Spring Boot backend (Clean Architecture)
│   ├── src/main/java/com/thadam/ai/modules/
│   │   ├── auth/           
│   │   ├── roadmap/        
│   │   └── ...             
├── README.md
```

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` (frontend) and `mvnw test` (backend)
4. Open a pull request

---

## License

MIT
