# University Event Management System

Initial implementation is started with:
- Backend: Node.js + Express + MySQL
- Frontend: React + Vite

## Completed in this iteration

### Story 1: Registration (implemented)
- Email and password registration endpoint
- Email format validation
- Password minimum length (8)
- Duplicate email prevention
- Password hashing with bcrypt
- Auto-login token returned on successful registration

### Story 2: Login (implemented)
- Email/password login endpoint
- Invalid credentials handling
- JWT token issued after successful login
- Frontend redirects authenticated user to dashboard

### Story 3: Create Event (backend started)
- Endpoint for lecturer/admin to create event
- Event starts with `PENDING` approval status

### Story 5: View Event List (backend started)
- Public endpoint returns approved events

### Story 11: Approve Event (backend started)
- List pending events endpoint
- Approve/reject endpoint for lecturer/admin
- Approval record stored in approvals table

## Project structure

- backend: REST API, authentication, event workflow APIs
- frontend: Authentication UI (register/login/dashboard)

## Setup

### Option A: Run MySQL via Docker Compose (recommended)

1. Start database services:

```bash
docker compose up -d
```

2. Open phpMyAdmin:
   - URL: `http://localhost:8080`
   - Server: `mysql`
   - Username: `root`
   - Password: `11111111`

3. Backend `.env` values for this setup:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=11111111
DB_NAME=university_events_db
PORT=5001
```

The schema is auto-imported on first run from `backend/database/schema.sql`.

### Option B: Use local MySQL service

1. Copy backend environment file:
   - from `backend/.env.example`
   - to `backend/.env`

2. Create database schema in MySQL:
   - execute `backend/database/schema.sql`

3. Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

4. Run backend:

```bash
cd backend
npm run dev
```

5. Run frontend:

```bash
cd frontend
npm run dev
```

Default API base URL in frontend: `http://localhost:5001/api`

## Implemented API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/registrations/me`
- `POST /api/events/:eventId/register` (STUDENT only)
- `PATCH /api/events/:eventId/cancel-registration` (STUDENT only)
- `GET /api/approvals/pending`
- `PATCH /api/approvals/:eventId`

## Automated Testing (D3)

Run from project root:

```bash
npm --prefix backend run test:unit
npm --prefix backend run test:integration
npm --prefix backend run test:coverage
```

Coverage artifacts are generated in `coverage/`.

## Next implementation targets

- Story 4 Edit event
- Story 6 Join event
- Story 7 Participant limit lock with transactional control
- Story 8 Check-in attendance
- Story 9 Participation history
- Story 10 Dashboard metrics and reports
- Story 12 Feedback (one submission per attended event)
- Story 13 Search and filter events
"# UniversityEvents" 
