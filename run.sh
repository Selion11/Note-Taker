#!/usr/bin/env bash
set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Notes Management Application...${NC}"

COMPOSE_CMD="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}==> Starting PostgreSQL (Docker)...${NC}"
$COMPOSE_CMD up -d

echo -e "${GREEN}==> Waiting for PostgreSQL to be ready...${NC}"
# Uses pg_isready inside the container (fast + reliable)
for i in {1..30}; do
  if $COMPOSE_CMD exec -T db pg_isready -U user -d notes_db >/dev/null 2>&1; then
    echo -e "${GREEN}PostgreSQL is ready.${NC}"
    break
  fi
  sleep 1
  if [[ $i -eq 30 ]]; then
    echo -e "${RED}PostgreSQL did not become ready in time.${NC}"
    exit 1
  fi
done

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "${BACKEND_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo -e "${GREEN}==> Installing backend dependencies...${NC}"
cd backend
if [[ -f package-lock.json ]]; then npm ci; else npm install; fi

echo -e "${GREEN}==> Starting backend (NestJS)...${NC}"
npm run start:dev >/dev/null 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}==> Installing frontend dependencies...${NC}"
cd ../frontend
if [[ -f package-lock.json ]]; then npm ci; else npm install; fi

echo -e "${GREEN}==> Starting frontend (Vite)...${NC}"
npm run dev
