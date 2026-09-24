# Voice AI Patient Registration — Phase 1

Backend foundation for the take-home assessment.

## Stack
Node.js + Express + SQLite + better-sqlite3 + Zod

## Run
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npm run dev`
5. Open `http://localhost:3001/health`

## Endpoints
GET /health
GET /patients
GET /patients/:id
POST /patients
PUT /patients/:id
DELETE /patients/:id

GET filters: `?last_name=`, `?date_of_birth=`, `?phone_number=`

Do not use real patient/PHI data for this assessment.
