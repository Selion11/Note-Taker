# Notes Management Application - Full Stack Challenge

This project is a Single Page Application (SPA) designed to create, archive, and categorize notes. It is built with a decoupled architecture, using **NestJS** for the backend and **React (Vite)** for the frontend.

## 1. Prerequisites & Stack

Versions used during development:

### Runtimes & Tools
- **Node.js**: v20.19.5 (LTS)
- **npm**: v10.8.2
- **NestJS CLI**: v11.0.16
- **TypeScript**: v5.9.3
- **OS**: Linux / macOS (the provided script is bash-based)

### Infrastructure
- **Docker**: v28.3.2
- **Docker Compose**: v2.39.1
- **PostgreSQL**: v16 (running via Docker)

---

## 2. Architecture & Patterns

The backend is structured using the **Service Layer** pattern:

- **Controllers**: HTTP routing + validation (DTOs).
- **Services**: business logic (e.g., archiving, category mapping).
- **Persistence**: **TypeORM** with a relational DB (PostgreSQL).
- **Frontend**: isolated React SPA located in `/frontend`.

---

## 3. Getting Started (One-Command Setup)

The project includes a root-level bash script that automates the setup (DB + dependencies + servers):

```bash
chmod +x run.sh
./run.sh
```

### Environment variables (optional)
- Backend:
  - `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
  - `PORT` (default: `3000`)
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` (defaults match `docker-compose.yml`)
- Frontend:
  - `VITE_API_URL` (default: `http://localhost:3000/api`)

### Manual Execution (optional)

```bash
# Start database
docker compose up -d

# Backend
cd backend
npm install
npm run start:dev

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev
```

---

## 4. API Features (Phase 1 & 2)

- Notes CRUD: Create, Read, Update, Delete notes.
- Archiving: Toggle notes between active and archived states.
- Categories: Many-to-Many relationship between Notes and Categories.
- Filtering: Filter notes by active/archived status and by category name.

## 5. Testing

```bash
# Unit tests
cd backend
npm run test

# E2E tests
npm run test:e2e
```
