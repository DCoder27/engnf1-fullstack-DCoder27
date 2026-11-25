# TriageSync

## 1. Overview

TriageSync is a full-stack support-ticket triage and resource-slot booking application. It combines deterministic ticket classification, agent review with an immutable audit trail, resource discovery, race-safe 30-minute bookings, role-based administration, and operational analytics.

The repository is a monorepo with a React/Vite frontend and a Node.js/Express/MongoDB backend. All displayed application data is loaded through the REST API from MongoDB Atlas.

## 2. Live links

- Frontend: not deployed yet
- Backend health endpoint: not deployed yet
- GitHub: <https://github.com/DCoder27/engnf1-fullstack-DCoder27>

Deployment is the remaining submission task. The local application is fully runnable using the instructions below.

## 3. Seeded credentials

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| ADMIN | Admin Lead | `admin@triagesync.test` | `Admin@123` |
| USER | Agent Demo | `user@triagesync.test` | `User@123` |

Public registration always creates a `USER`. The seed script is the only application path that creates an `ADMIN`.

## 4. Technology stack

- Frontend: React 19, React Router, Vite, feature-based CSS
- Backend: Node.js, Express 5, Mongoose, Zod
- Database: MongoDB Atlas
- Authentication: short-lived JWT access token plus rotated HTTP-only refresh-token cookie
- Security: bcryptjs password hashing, RBAC middleware, escaped regex search, schema validation, XSS-safe React rendering
- Testing: Node.js built-in test runner, ESLint, Vite production build

## 5. Folder structure

```text
engnf1-fullstack-DCoder27/
|-- backend/
|   |-- src/
|   |   |-- config/       # MongoDB connection
|   |   |-- controllers/  # HTTP request/response boundary
|   |   |-- middleware/   # auth, RBAC, validation, errors
|   |   |-- models/       # Mongoose schemas and indexes
|   |   |-- routes/       # REST endpoint definitions
|   |   |-- scripts/      # idempotent seed command
|   |   |-- services/     # business rules and transactions
|   |   `-- utils/        # JWT, hashing, triage, booking rules
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- app/          # router and providers
|   |   |-- features/     # admin, auth, bookings, resources, tickets
|   |   `-- shared/       # API client, shell, shared pages
|   `-- package.json
|-- .env.example
|-- README.md
|-- SOLUTION.md
`-- AI_USAGE.md
```

## 6. Local setup and idempotent seed

### Requirements

- Node.js 24 or a current Node.js LTS release
- npm
- A MongoDB Atlas database and an Atlas IP access-list entry for the machine running the backend

### Configure environment files

From the repository root in PowerShell:

```powershell
Copy-Item .env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` and replace the MongoDB credentials and both JWT secrets. Keep all `.env` files uncommitted.

### Install, seed, and run the backend

```powershell
cd backend
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Confirm it with `GET /api/health`.

The seed is idempotent: users are skipped when their email already exists, resources use case-insensitive upserts by name, and tickets use upserts by `externalId`. Running `npm run seed` twice does not create duplicates. It inserts two users, six resources (two of each type, one inactive), and 15 tickets including reviewed and XSS-payload examples.

### Install and run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Verification commands

```powershell
cd backend
npm test

cd ..\frontend
npm run lint
npm run build
```

## 7. Database schema

- `users`: name, unique lowercase email, hidden password hash, role, created timestamp, booking-version counter
- `tickets`: unique external ID, subject/body, predicted and current category, priority, status, assignee, review and human-override flags, timestamps
- `ticket_events`: ticket reference, changed field, old/new value, actor, created timestamp
- `resources`: unique case-insensitive name, type, capacity, description, active flag, created timestamp
- `bookings`: resource/user references, optional ticket reference, UTC start/end, purpose, lifecycle status, optional decision note, created timestamp
- `booking_slots`: one document per occupied 30-minute interval with a unique `(resourceId, slotStart)` index for atomic overlap protection

Important indexes include unique ticket `externalId`, compound ticket filtering, case-insensitive resource names, ticket-event history, booking query indexes, and the unique booking-slot lock.

## 8. API summary

Base URL: `/api`. Protected routes require `Authorization: Bearer <access-token>`.

| # | Method and path | Access | Purpose |
| --- | --- | --- | --- |
| 1 | `POST /auth/register` | Public | Register a USER account |
| 2 | `POST /auth/login` | Public | Issue access token and refresh cookie |
| 3 | `GET /auth/me` | Logged in | Read current user |
| 4 | `POST /tickets/import` | Logged in | Idempotently import and classify a feed |
| 5 | `GET /tickets` | Logged in | Filter/search paginated tickets |
| 6 | `GET /tickets/:id` | Logged in | Read ticket and audit events |
| 7 | `PATCH /tickets/:id` | Logged in | Review ticket with event logging |
| 8 | `GET /stats` | Logged in | Ticket and agreement statistics |
| 9 | `GET /resources` | Logged in | Search/filter paginated resources |
| 10 | `GET /resources/:id` | Logged in | Read one resource |
| 11 | `POST /resources` | ADMIN | Create a resource |
| 12 | `PATCH /resources/:id` | ADMIN | Update/toggle a resource |
| 13 | `GET /resources/:id/availability` | Logged in | Read overlapping booking windows |
| 14 | `POST /bookings` | Logged in | Create a PENDING booking |
| 15 | `GET /bookings/mine` | Logged in | List the current user's bookings |
| 16 | `GET /bookings/:id` | Owner/ADMIN | Read one booking |
| 17 | `GET /bookings` | ADMIN | Filter all bookings |
| 18 | `PATCH /bookings/:id/cancel` | Owner | Cancel a future active booking |
| 19 | `PATCH /bookings/:id/approve` | ADMIN | Approve a pending booking |
| 20 | `PATCH /bookings/:id/reject` | ADMIN | Reject with a decision note |
| 21 | `GET /admin/stats` | ADMIN | Read resource, booking, and ticket analytics |

Supporting session endpoints are `POST /auth/refresh` and `POST /auth/logout`; `GET /api/health` supports uptime checks.

## 9. Completed features checklist

- [x] Registration, login, refresh cookie, logout, protected routes, and ADMIN RBAC
- [x] Deterministic idempotent ticket import preserving human overrides
- [x] Injection-safe combined ticket filters and escaped XSS payload rendering
- [x] Ticket review, optimistic UI, visible rollback, and audit history
- [x] Ticket statistics and model-agreement rate
- [x] File-based re-import control using the real import API
- [x] Resource search, type/capacity filters, pagination, create/edit/toggle
- [x] Availability lookup with local display times and UTC API values
- [x] Optional ticket-linked booking form with 30-minute grid validation
- [x] Race-safe booking creation, three-future-booking limit, and conflict responses
- [x] My Bookings filters, pagination, decision notes, and cancellation
- [x] Admin booking approval/rejection and analytics dashboard
- [x] Loading, error, and empty states with responsive layouts
- [x] Idempotent seed data and backend unit tests

## 10. Known limitations

- Live frontend/backend deployment URLs are not configured yet.
- The access token is refreshed when the application starts, but the shared API client does not yet retry a request automatically after a mid-session 401.
- Resource-name option lists used by booking/admin helpers currently load the first resource page; IDs remain visible as a fallback when a resource is outside that page or inactive.
- Ticket re-import expects the user to select a local JSON array or an object shaped as `{ "tickets": [...] }`; it does not store uploaded feed files.
- Automated coverage focuses on backend business rules; frontend component and browser tests are not yet included.
