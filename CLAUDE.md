# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mentorix is an academic mentoring platform with two integrated products:
- **UniMatch** — connects students (ALUNO) with peer mentors (ALUNO_MENTOR) for general subjects
- **VagaLivre** — professor-mentors (PROFESSOR_MENTOR) help students with TCC (thesis) topics

The system has four roles: `ALUNO`, `ALUNO_MENTOR`, `PROFESSOR_MENTOR`, `GESTOR`. Each role has its own frontend route namespace (`/aluno`, `/mentor`, `/professor`, `/gestor`).

## Development Commands

### Backend (root directory)
```bash
npm run start:dev      # Watch mode, auto-reloads
npm run build          # Compile TypeScript to dist/
npm run seed           # Populate DB with 4 seed users + 8 ambientes
npm run migration:run  # Run TypeORM migrations
npm run migration:revert
```

### Frontend (`frontend/` directory)
```bash
npm run dev     # Vite dev server at http://localhost:5173
npm run build   # tsc + vite build
```

### Database
```bash
docker compose up -d   # Start MySQL 8.0 on port 3306
```

Copy `.env.example` to `.env` before first run. The backend runs on port 3000; Vite proxies `/api` and `/uploads` to it.

### Seed credentials (password: `123456`)
| Email | Role |
|---|---|
| aluno@email.com | ALUNO |
| mentor@email.com | ALUNO_MENTOR |
| professor@email.com | PROFESSOR_MENTOR |
| gestor@email.com | GESTOR |

## Architecture

### Backend — NestJS + TypeORM + MySQL

All modules follow the standard NestJS pattern: `entity → service → controller → module`.

**Module map:**
- `auth` — JWT login/refresh (15m access token, 7d refresh token), bcrypt password hashing
- `users` — profile, avatar upload (local disk at `uploads/`)
- `cards` — mentoring requests created by students; filtered by `CardCategoria` (GERAL vs TCC) in the feed
- `matchmaking` — mentors browse the feed and `POST /api/feed/:cardId/aceitar` with their availability slot; creates an `Agendamento`
- `agendamentos` — scheduling lifecycle (PENDENTE_GESTOR → AGENDADO → EM_ANDAMENTO → CONCLUIDO/CANCELADO/DISPUTA)
- `ambientes` — rooms/spaces managed by GESTOR; `AmbienteReserva` blocks recurring institutional time slots
- `checkin` — GESTOR marks sessions as started/ended via `HistoricoEncontro`
- `avaliacoes` — students rate completed sessions (1–5 stars)
- `disputes` — mentors open `Contestacao` if a session wasn't properly recorded; resolved by GESTOR
- `penalties` — suspension system; `PenaltyCheckerCron` runs via `@nestjs/schedule`
- `audit` — `AuditLog` entity; services call `AuditService.log()` directly (not the interceptor) to capture before/after state

**Guards applied in order:** `JwtAuthGuard` → `RolesGuard` → `PenaltyGuard`. GESTOR routes skip `PenaltyGuard`.

**Entities use Portuguese table/column names** (e.g., `usuarios`, `senha_hash`, `papel`, `suspenso_ate`). All IDs are unsigned auto-increment integers.

The `ClassSerializerInterceptor` is global — fields decorated with `@Exclude()` (like `senha_hash`) are stripped from all responses automatically.

### Frontend — React 18 + TypeScript + Vite

**Auth flow:** `AuthContext` stores user in state; JWT tokens persist in `localStorage`. The axios instance (`src/config/api.ts`) automatically attaches `Bearer` tokens and retries once on 401 using the refresh token.

**Route protection:** `ProtectedRoute` checks both role and suspension status. Suspended users are redirected to `PenaltyBlockScreen`. Pass `checkPenalty={false}` to skip suspension check (used for GESTOR routes).

**Page structure by role:**
- `pages/aluno/` — dashboard, create card, my cards, rate session
- `pages/mentor/` — dashboard, mentoring feed, my hours, open dispute
- `pages/gestor/` — dashboard, portaria (check-in panel), manage rooms, resolve disputes
- `pages/AgendamentosPage.tsx` — shared across roles (lazy-loaded)

**Styling:** CSS variables in `src/styles/variables.css`, dark theme by default. No CSS framework — all custom CSS.

**Path alias:** `@/` maps to `frontend/src/`.

## Key Conventions

- API base URL in frontend is `/api` (proxied by Vite in dev). Never hardcode `localhost:3000`.
- Schedules (availability) use `DiaSemana` enum (`SEG`–`SAB`) + `HH:mm:ss` strings, not Date objects.
- `tags_competencia` is stored as `JSON` column (array of strings). Feed matching filters cards by these tags.
- All audit-worthy mutations call `auditService.log()` directly in the service with explicit `antes`/`depois` objects.
- No test suite is set up. There are no `*.spec.ts` files.
