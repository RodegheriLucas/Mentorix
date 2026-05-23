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

**Styling:** CSS variables in `src/styles/variables.css`, light theme. UI components use **Radix UI Themes** (`@radix-ui/themes` v3) wrapped in `<Theme accentColor="violet" radius="large">` in `main.tsx`. Use Radix primitives (TextField, Button, Card, etc.) for interactive elements; use the project's CSS variables for colors and layout.

**Shell architecture:**
- `MobileShell` — Aluno, Mentor, Professor routes; renders the iOS phone frame (402×874) centered on a dark background. Navigation via `MobileTabBar` (bottom tab bar, role-aware).
- `AppShell` — Gestor only; sidebar + main content area (desktop layout).
- `PhoneFrame` — the iOS device frame component with dynamic island, status bar (9:41), home indicator.

**Path alias:** `@/` maps to `frontend/src/`.

---

## Design System — MANDATORY for all contributors

> **Every new screen, component or UI change must follow this system exactly. Deviations require explicit approval.**

### Color tokens (CSS variables in `src/styles/variables.css`)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#5D46B8` | Violeta Acadêmico — primary actions, links, active states |
| `--primary-light` | `#ECE9F9` | Tinted backgrounds, chips |
| `--primary-dark` | `#3A2885` | Hover states, sidebar background, login gradient |
| `--secondary` | `#2E7D32` | Verde Logístico — success, check-in, VagaLivre |
| `--secondary-light` | `#E8F5E9` | Success tinted backgrounds |
| `--secondary-dark` | `#1B5E20` | Success text |
| `--accent` | `#E64A19` | Vermelho-Alaranjado — CTAs, alerts, urgency |
| `--accent-light` | `#FBE9E7` | Alert backgrounds |
| `--accent-dark` | `#BF360C` | Alert text |
| `--bg` | `#F2EFE9` | App background |
| `--surface` | `#F8F9FA` | Card/input backgrounds |
| `--border` | `#E0E0E0` | Dividers, input borders |
| `--text` | `#121212` | Primary text |
| `--text-2` | `#666666` | Secondary text |
| `--text-3` | `#9E9E9E` | Muted text, placeholders |

**Color rule: 60–30–10** — 60% neutral (white/`--bg`/`--surface`), 30% violet, 10% green + accent.

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Headings (H1–H3) | Plus Jakarta Sans (`var(--f-head)`) | 24/20/16px | 700/700/500 |
| Body | Inter (`var(--f-body)`) | 14px | 400 |
| Caption/label | Inter | 12px | 400 |
| Monospace | JetBrains Mono | 10–12px | 500–600 |

- Never use system fonts for headings. Always apply `font-family: var(--f-head)` for titles.
- Use `letterSpacing: -0.3` to `-1.2` on large headings (compensates for Plus Jakarta Sans's spacing at display sizes).

### Gradients (mandatory for avatars and hero sections)

Mentor/user avatars **must** use gradient backgrounds — never flat solid colors.

Standard avatar gradient palette (use `mentorGradient(name)` hash picker from `MeusCards.tsx`):
```
linear-gradient(135deg, #6f5ad0, #4632a0)   — violet deep
linear-gradient(135deg, #4a78d6, #2854b4)   — blue
linear-gradient(135deg, #8a6fe0, #5c3fc0)   — lavender
linear-gradient(135deg, #e64a19, #bf360c)   — accent
linear-gradient(135deg, #506fc7, #2e4ea0)   — indigo
linear-gradient(135deg, #7a5fd0, #4a35a0)   — mid-violet
```

Primary button gradient: `linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)` with shadow `0 6px 20px rgba(93,70,184,0.35)`.

Accent button gradient: `linear-gradient(135deg, var(--accent), var(--accent-dark))`.

### Card anatomy

Cards use `.mx-card` class (defined in `src/styles/index.css`). Status cards have a 4px left stripe whose color maps from `stripeColor(status)`. Live sessions (`EM_ANDAMENTO`) get `border: 1.5px solid var(--secondary)`.

### Status → color mapping

| Status | Stripe | Pill background | Usage |
|---|---|---|---|
| `EM_ANDAMENTO` | `--secondary` | `--secondary-light` | Live session |
| `AGENDADO` | `--accent` | `--accent-light` | Upcoming |
| `PENDENTE_GESTOR` | `#E0A800` | `#FFF7E0` | Waiting room approval |
| `CONCLUIDO` | `--secondary` (50% opacity) | `--secondary-light` | Done |
| `CANCELADO` | `--accent-dark` | `#FFEBEE` | Cancelled |
| `ABERTO` | `--primary` | `--primary-light` | Matchmaking open |

### Mobile screen structure (Aluno / Mentor)

All mobile screens follow this header pattern exactly (see `AlunoHeader` in `MeusCards.tsx`):
```
<div style={{ padding: '12px 0 14px' }}>
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
    [MxLogo size=20]  mentorix wordmark  [Role badge]     [User Avatar size=32]
  </div>
  <h1 mx-h1 fontSize=24>Olá, {firstName}.</h1>
  <p mx-caption>{email}</p>
</div>
```
The role badge uses `background: var(--primary-light)`, `color: var(--primary-dark)`, `fontSize: 9px`, `fontWeight: 700`, `letterSpacing: 0.6`, `textTransform: uppercase`, `padding: '2px 6px'`, `borderRadius: 6`.

### Shared design components

All shared UI lives in `src/components/ui/DesignSystem.tsx`:
- `MxLogo({ size, color })` — the M-dot logo SVG
- `StatusPill({ status, pulse, size })` — rounded status badge
- `Avatar({ initials, color, size })` — gradient circle avatar
- `TopicBadge({ children, tone })` — `#topic` tag chip
- `WhatsAppButton({ phone, name })` — green WhatsApp CTA with icon
- `CheckInOutCard({ c })` — check-in/checkout progress card with timeline dots

### Design reference files

- **`project/Mentorix.html`** — the living design prototype. Open in a browser to see all screens.
- **`project/shared.jsx`** — shared component source of truth (StatusPill, Avatar, PhoneScreen, TabBar etc.)
- **`project/screen-aluno-list.jsx`**, `screen-aluno-nova.jsx` — Aluno screen implementations
- **`project/screen-mentor-*.jsx`** — Mentor screen implementations
- **`docs/telas.md`** — full design spec with all component source code

When implementing or modifying any screen, open the corresponding `project/*.jsx` file first and match the structure, spacing, colors, and component hierarchy exactly.

## Key Conventions

- API base URL in frontend is `/api` (proxied by Vite in dev). Never hardcode `localhost:3000`.
- Schedules (availability) use `DiaSemana` enum (`SEG`–`SAB`) + `HH:mm:ss` strings, not Date objects.
- `tags_competencia` is stored as `JSON` column (array of strings). Feed matching filters cards by these tags.
- All audit-worthy mutations call `auditService.log()` directly in the service with explicit `antes`/`depois` objects.
- No test suite is set up. There are no `*.spec.ts` files.
