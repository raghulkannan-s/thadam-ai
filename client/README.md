# Thadam AI - Frontend

This is the frontend client for Thadam AI, a platform that turns AI-generated roadmaps into interactive, living checklists. 

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **Library:** React 19.2.6
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12.40
- **Architecture:** Feature-Sliced Design (FSD)

## Project Structure
The `src/` directory follows Feature-Sliced Design (FSD) principles to maintain isolation:
- `app/`: Next.js App Router definitions and route groups.
- `core/`: Global configurations, axios instances, and interceptors.
- `features/`: Isolated domain modules (e.g., `auth`, `roadmap`, `community`). Each feature encapsulates its own UI, API, and state logic.
- `shared/`: Highly reusable UI components (Buttons, Cards, Toasts).
- `types/`: Global TypeScript definitions.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the `.env.example` file to `.env.local` and configure your API URL.
3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.
