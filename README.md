1. Project Overview

Explain the project in a few lines:

A voice-based patient registration system that allows a caller to provide patient information conversationally. The AI agent collects and validates the information, confirms the complete registration with the caller, and then uses a function tool to securely submit the patient data to a Node.js REST API backed by SQLite.

2. Architecture

Your README should show:

                    ┌───────────────────┐
                    │    Patient /      │
                    │      Caller       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Vapi Voice AI   │
                    │      Agent        │
                    └─────────┬─────────┘
                              │
                       create_patient
                              │
                              ▼
              ┌────────────────────────────┐
              │      Render Web Service    │
              │      Node.js + Express     │
              └─────────────┬──────────────┘
                            │
                     Validation / Logic
                            │
                            ▼
              ┌────────────────────────────┐
              │          SQLite            │
              │       patients.db          │
              └────────────────────────────┘
3. Technology Stack
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API
SQLite	Patient database
better-sqlite3	SQLite driver
Zod	Server-side validation
Vapi	Voice AI agent + telephony
Render	Production deployment
GitHub	Source control
4. Main Features

Document these:

Voice-based patient registration
Natural conversational data collection
Required/optional fields
Server-side validation
Date-of-birth validation
Future DOB rejection
Phone validation
ZIP validation
State validation
Email validation
User corrections
Out-of-order information
Final confirmation before database insertion
Duplicate phone protection
Error handling
REST API
Production HTTPS deployment
Persistent SQLite storage
5. Patient Data

Document the main fields:

patient_id
first_name
last_name
date_of_birth
sex
phone_number
email
address_line_1
address_line_2
city
state
zip_code
insurance_provider
insurance_member_id
preferred_language
emergency_contact_name
emergency_contact_phone
created_at
updated_at
deleted_at
6. REST API

Your README should document:

Method	Endpoint	Purpose
GET	/health	Health check
GET	/patients	List patients
GET	/patients/:id	Get patient
POST	/patients	Create patient
PUT	/patients/:id	Update patient
DELETE	/patients/:id	Delete patient
POST	/vapi/tools	Vapi function webhook

Production base URL:

https://voice-patient-agent.onrender.com
7. AI Tool

Document the main Vapi function:

create_patient

Its responsibility:

AI Agent
   ↓
Collect patient information
   ↓
Validate conversationally
   ↓
Final confirmation
   ↓
create_patient
   ↓
REST API
   ↓
Server validation
   ↓
Duplicate check
   ↓
SQLite

A very important point to mention:

The AI agent does not directly write to the database. Patient creation is performed by the backend after server-side validation.

That is a strong architectural point for your assessment.

8. Confirmation Safety

Document this clearly:

Patient data is not persisted until the caller explicitly confirms the final registration summary.

For example:

Agent: "Is all of this information correct?"

Caller: "Yes."

        ↓

create_patient

        ↓

Database INSERT

If the caller says:

"No"

then:

NO DATABASE INSERT
9. Local Setup

Document:

git clone https://github.com/khubaiblodhi123/voice-patient-agent.git
cd voice-patient-agent
npm install

Create .env:

PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/patients.db
VAPI_WEBHOOK_SECRET=

Run:

npm start

Development:

npm run dev

Then:

http://localhost:3001/health
10. Production

Document:

GitHub
   ↓
Render
   ↓
Node.js / Express
   ↓
Persistent SQLite

Production API:

https://voice-patient-agent.onrender.com

Do not put:

Vapi API keys
webhook secrets
.env
database files

inside GitHub.
