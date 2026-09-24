# 🎙️ Voice Patient Registration Agent

A production-ready **voice-based patient registration system** that allows callers to register as patients through a conversational AI voice agent.

The AI agent collects patient information naturally, handles corrections and out-of-order information, validates required data, presents a final summary for confirmation, and then securely submits the confirmed patient information to a **Node.js + Express REST API**. The backend performs server-side validation, duplicate-phone protection, and stores the patient record in **SQLite**.

The application is deployed to **Render** with HTTPS and persistent SQLite storage.

---

## 📌 Project Overview

The **Voice Patient Registration Agent** is designed to automate the initial patient registration process through a conversational voice interface.

Instead of requiring a patient to fill out a traditional form, the caller can provide information naturally during a phone conversation.

The system is responsible for:

* Collecting patient information conversationally
* Understanding information provided in different orders
* Handling corrections
* Validating information
* Handling optional fields
* Preventing invalid patient records
* Confirming the complete registration before saving
* Preventing duplicate patient registrations by phone number
* Persisting patient information in SQLite
* Exposing REST API endpoints for patient management
* Connecting the AI voice agent to the backend through a function tool
* Running the backend in a production HTTPS environment

---

# 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │   Patient / Caller    │
                    └───────────┬───────────┘
                                │
                         Voice Conversation
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Vapi Voice AI    │
                    │         Agent         │
                    └───────────┬───────────┘
                                │
                         create_patient
                                │
                                ▼
              ┌────────────────────────────────┐
              │        Render Web Service      │
              │                                │
              │        Node.js + Express       │
              │                                │
              │  REST API + Vapi Tool Webhook  │
              └───────────────┬────────────────┘
                              │
                       Server Validation
                              │
                       Duplicate Check
                              │
                              ▼
              ┌────────────────────────────────┐
              │             SQLite             │
              │                                │
              │          patients.db           │
              └────────────────────────────────┘
```

### Production Request Flow

```text
Caller
  ↓
Vapi Voice Agent
  ↓
create_patient function
  ↓
HTTPS POST /vapi/tools
  ↓
Render
  ↓
Express
  ↓
Zod Validation
  ↓
Duplicate Phone Check
  ↓
SQLite
  ↓
Success / Error Result
  ↓
Vapi Agent
  ↓
Caller
```

---

# 🧰 Technology Stack

| **Technology**     | **Purpose**                              |
| ------------------ | ---------------------------------------- |
| **Node.js**        | Backend runtime                          |
| **Express.js**     | REST API framework                       |
| **SQLite**         | Patient database                         |
| **better-sqlite3** | SQLite database driver                   |
| **Zod**            | Server-side request validation           |
| **Vapi**           | Voice AI agent and telephony             |
| **Render**         | Production deployment                    |
| **GitHub**         | Source control and repository hosting    |
| **ngrok**          | Local webhook testing during development |

---

# ✨ Main Features

### 🎙️ Voice Registration

* Voice-based patient registration
* Natural conversational interaction
* Conversational collection of patient information
* Supports information provided in different orders
* Handles interruptions and corrections

### ✅ Data Validation

The system validates:

* First name
* Last name
* Date of birth
* Sex
* Phone number
* Email
* Address
* City
* State
* ZIP code
* Emergency contact information

### 🛡️ Registration Safety

* Required field validation
* Optional field handling
* Future DOB rejection
* Invalid DOB rejection
* Phone number validation
* ZIP code validation
* U.S. state validation
* Email validation
* Duplicate phone-number protection
* Server-side validation
* Final confirmation before database insertion

### 🔄 Conversational Handling

The agent can handle:

* Information provided out of order
* Corrections
* Repeated information
* Spelling of names
* Phone numbers spoken naturally
* Missing required information
* Optional information refusal
* Final confirmation
* Rejection of final confirmation
* Starting over
* Registration cancellation

### 🚀 Backend

* RESTful patient API
* Vapi function webhook
* SQLite persistence
* Structured JSON responses
* Centralized error handling
* Production HTTPS deployment

---

# 👤 Patient Data Model

The patient database contains the following fields:

| **Field**                 | **Description**                     |
| ------------------------- | ----------------------------------- |
| `patient_id`              | Unique patient identifier           |
| `first_name`              | Patient first name                  |
| `last_name`               | Patient last name                   |
| `date_of_birth`           | Patient date of birth               |
| `sex`                     | Patient sex                         |
| `phone_number`            | Patient phone number                |
| `email`                   | Optional email address              |
| `address_line_1`          | Primary street address              |
| `address_line_2`          | Optional apartment/unit information |
| `city`                    | City                                |
| `state`                   | U.S. state abbreviation             |
| `zip_code`                | ZIP or ZIP+4                        |
| `insurance_provider`      | Optional insurance provider         |
| `insurance_member_id`     | Optional insurance member ID        |
| `preferred_language`      | Preferred language                  |
| `emergency_contact_name`  | Optional emergency contact          |
| `emergency_contact_phone` | Optional emergency contact phone    |
| `created_at`              | Record creation timestamp           |
| `updated_at`              | Last update timestamp               |
| `deleted_at`              | Soft-delete timestamp               |

---

# 🔌 REST API

## Base URL

### Production

```text
https://voice-patient-agent.onrender.com
```

---

## API Endpoints

| **Method** | **Endpoint**    | **Purpose**                 |
| ---------- | --------------- | --------------------------- |
| `GET`      | `/health`       | Check API health            |
| `GET`      | `/patients`     | List patients               |
| `GET`      | `/patients/:id` | Retrieve a patient          |
| `POST`     | `/patients`     | Create a patient            |
| `PUT`      | `/patients/:id` | Update a patient            |
| `DELETE`   | `/patients/:id` | Delete a patient            |
| `POST`     | `/vapi/tools`   | Receive Vapi function calls |

---

## Health Check

### Request

```http
GET /health
```

### Example Response

```json
{
  "data": {
    "status": "ok",
    "service": "voice-patient-agent-api",
    "timestamp": "2026-09-24T10:00:39.824Z"
  },
  "error": null
}
```

---

## Get Patients

```http
GET /patients
```

Returns registered patients from the database.

---

## Get Patient

```http
GET /patients/:id
```

Returns a specific patient using the patient's unique ID.

---

## Create Patient

```http
POST /patients
```

Example request:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "01/15/1995",
  "sex": "Male",
  "phone_number": "2125559015",
  "email": "john.smith@example.com",
  "address_line_1": "100 Test Street",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001"
}
```

The backend validates the request before inserting the record.

---

## Update Patient

```http
PUT /patients/:id
```

Supports partial updates while applying the defined validation rules.

---

## Delete Patient

```http
DELETE /patients/:id
```

Deletes/deactivates the patient according to the application's deletion logic.

---

# 🤖 Vapi AI Agent

The voice agent is implemented using **Vapi**.

The AI agent is responsible for conversational interaction and collecting the required patient information.

The main backend function exposed to the agent is:

```text
create_patient
```

---

## create_patient Responsibility

The function is called only after:

1. Patient information has been collected.
2. Required information is available.
3. Conversational validation has been performed.
4. The complete patient information has been presented to the caller.
5. The caller explicitly confirms the information.

The flow is:

```text
AI Agent
   ↓
Collect patient information
   ↓
Conversational validation
   ↓
Identify missing information
   ↓
Handle corrections
   ↓
Final summary
   ↓
Caller confirmation
   ↓
create_patient
   ↓
REST API
   ↓
Server-side validation
   ↓
Duplicate phone check
   ↓
SQLite
```

### Important Architecture Principle

> **The AI agent does not directly write to the database.**

The AI agent calls the `create_patient` backend function.

The backend then:

* Validates the request
* Checks for duplicate phone numbers
* Generates the patient ID
* Creates timestamps
* Inserts the patient into SQLite
* Returns a success or error result

This provides an additional server-side validation layer rather than trusting the AI agent alone.

---

# 🔐 Confirmation Safety

Patient data must not be persisted until the caller explicitly confirms the final registration.

Example:

```text
Agent:
"Your information is:

First name: John
Last name: Smith
Date of birth: January 15, 1995
Phone: 212-555-9015
Address: 100 Test Street
New York, NY 10001

Is all of this information correct?"
```

Caller:

```text
"Yes."
```

Then:

```text
create_patient
      ↓
Backend validation
      ↓
Duplicate check
      ↓
Database INSERT
```

If the caller says:

```text
"No."
```

then:

```text
NO DATABASE INSERT
      ↓
Ask what needs to be corrected
      ↓
Update information
      ↓
Present summary again
      ↓
Request confirmation
```

This prevents unconfirmed patient information from being persisted.

---

# 🛡️ Validation & Error Handling

Validation is performed at the backend using **Zod**.

The backend does not rely exclusively on the AI agent to validate patient information.

### Validation includes:

* Required fields
* String formats
* Name validation
* Date format
* Valid date
* Future DOB rejection
* Sex enumeration
* U.S. phone number format
* Email format
* U.S. state abbreviation
* ZIP / ZIP+4 format

### Duplicate Protection

Before creating a patient, the backend checks whether an active patient already exists with the same phone number.

```text
Incoming patient
       ↓
Validate
       ↓
Check phone number
       ↓
Existing patient?
   ↙           ↘
 YES           NO
 ↓              ↓
Reject        Create
```

The system therefore avoids creating duplicate active patients using the same phone number.

---

# 📞 Voice Conversation Examples

## Normal Registration

```text
Caller:
"I want to register as a patient."

Agent:
"Sure. May I have your first name?"

Caller:
"John."

Agent:
"And your last name?"

Caller:
"Smith."

...

Agent:
"Is all of this information correct?"

Caller:
"Yes."

Agent:
"Your registration has been completed successfully."
```

---

## Correction

```text
Caller:
"My ZIP code is 10001."

Later:

Caller:
"Actually, sorry, it's 10002."

Agent:
"Thanks for correcting that. I'll use 10002."
```

The corrected value should be used in the final request.

---

## Final Confirmation Rejected

```text
Agent:
"Is all of this information correct?"

Caller:
"No."

Agent:
"No problem. What would you like to change?"
```

The backend should not receive a `create_patient` request until confirmation is obtained.

---

# 🧪 Testing

The system has been tested across normal, invalid, correction, error, and production scenarios.

## Core Tests

* [x] Normal patient registration
* [x] Out-of-order information
* [x] Information correction
* [x] Name spelling
* [x] Phone number correction
* [x] Date-of-birth validation
* [x] Future DOB rejection
* [x] Invalid phone number
* [x] Invalid ZIP code
* [x] Invalid state
* [x] Invalid email
* [x] Missing required fields
* [x] Optional fields
* [x] Optional email refusal
* [x] Insurance information
* [x] Emergency contact
* [x] Preferred language
* [x] Duplicate phone protection
* [x] Final confirmation
* [x] Final confirmation rejection
* [x] Corrections after final summary
* [x] Start-over behavior
* [x] Registration cancellation
* [x] Interruptions
* [x] Ambiguous responses
* [x] No data invention
* [x] Backend validation
* [x] Vapi function integration
* [x] SQLite insertion
* [x] Production API
* [x] Production deployment

---

# 🔄 End-to-End Test Flow

The complete production flow is:

```text
1. Caller starts registration
             ↓
2. AI collects patient information
             ↓
3. AI handles corrections
             ↓
4. AI identifies missing fields
             ↓
5. AI validates information conversationally
             ↓
6. AI presents final summary
             ↓
7. Caller confirms
             ↓
8. Vapi calls create_patient
             ↓
9. Render receives POST /vapi/tools
             ↓
10. Backend validates request
             ↓
11. Backend checks duplicate phone
             ↓
12. SQLite INSERT
             ↓
13. Backend returns success
             ↓
14. Vapi confirms registration
```

---

# 📁 Project Structure

```text
voice-patient-agent/
│
├── src/
│   ├── database/
│   │   └── db.js
│   │
│   ├── routes/
│   │   ├── patients.js
│   │   └── vapi.js
│   │
│   ├── validation/
│   │   └── patient.js
│   │
│   └── server.js
│
├── data/
│   └── patients.db
│
├── voice-agent/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

> **Note:** `.env`, database files, and other sensitive/local files should not be committed to GitHub.

---

# ⚙️ Environment Variables

The application uses environment variables for runtime configuration.

Example `.env`:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/patients.db
VAPI_WEBHOOK_SECRET=
```

### Environment Variable Description

| **Variable**          | **Purpose**                            |
| --------------------- | -------------------------------------- |
| `PORT`                | HTTP server port                       |
| `NODE_ENV`            | Runtime environment                    |
| `DATABASE_PATH`       | SQLite database location               |
| `VAPI_WEBHOOK_SECRET` | Optional webhook authentication secret |

---

# 💻 Local Installation

## Requirements

* Node.js
* npm
* Git

---

## Clone Repository

```bash
git clone https://github.com/khubaiblodhi123/voice-patient-agent.git
```

Navigate to the project:

```bash
cd voice-patient-agent
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Running Locally

## Production-style Start

```bash
npm start
```

## Development Mode

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/health
```

---

# 🌐 Production Deployment

The application is deployed using **Render**.

Production architecture:

```text
GitHub
   ↓
Render Web Service
   ↓
Node.js + Express
   ↓
Persistent SQLite Database
```

### Production API

```text
https://voice-patient-agent.onrender.com
```

### Health Check

```text
https://voice-patient-agent.onrender.com/health
```

### Vapi Webhook

```text
https://voice-patient-agent.onrender.com/vapi/tools
```

The Vapi `create_patient` function communicates with the production backend through this HTTPS endpoint.

---

# 💾 Database Persistence

The application uses SQLite for patient data storage.

The production deployment uses persistent storage so that the SQLite database can survive service restarts and deployments.

The database contains:

```text
patients.db
```

The database is created automatically when the application starts if it does not already exist.

---

# 🔒 Security Considerations

The following security practices are implemented or supported:

* Environment variables for configuration
* `.env` excluded from Git
* Database files excluded from Git
* Server-side validation
* Duplicate patient protection
* Structured error responses
* HTTPS production deployment
* AI agent does not directly access the database

### Sensitive Information

The following must never be committed to the repository:

```text
.env
API keys
Vapi credentials
Webhook secrets
Production database files
Private credentials
```

---

# 📡 Local Webhook Testing

During local development, an HTTPS tunnel such as **ngrok** can be used to expose the local Express server to Vapi.

Example:

```text
Local Node.js
     ↓
http://localhost:3001
     ↓
ngrok HTTPS URL
     ↓
Vapi
```

For production, the Render HTTPS endpoint is used directly and ngrok is not required.

---

# 📊 API Response Format

The API uses a consistent response structure.

Successful responses follow the general pattern:

```json
{
  "data": {},
  "error": null
}
```

Error responses follow:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error"
  }
}
```

This provides predictable responses for API consumers.

---

# 🧠 Design Decisions

## Why SQLite?

SQLite was selected because it provides:

* Simple setup
* No separate database server
* Lightweight storage
* Easy local development
* Straightforward deployment with persistent storage
* Suitable database functionality for the assessment

---

## Why Server-Side Validation?

AI-generated/tool-generated input should not be trusted as the final source of truth.

Therefore:

```text
AI Validation
      +
Server Validation
```

The backend independently validates patient information before database insertion.

---

## Why Require Final Confirmation?

Patient registration is a sensitive operation.

The agent therefore follows:

```text
Collect
   ↓
Review
   ↓
Confirm
   ↓
Save
```

rather than:

```text
Collect
   ↓
Immediately Save
```

This reduces the chance of storing incorrect information.

---

# ⚠️ Known Limitations

* The current implementation is designed for the technical assessment and initial patient registration workflow.
* SQLite is appropriate for this deployment but may not be the preferred database for a large multi-instance production healthcare application.
* The application is not intended to replace a complete medical EHR system.
* Additional healthcare compliance, auditing, access-control, encryption, and operational requirements would be required for a real healthcare production environment.
* Telephony availability depends on the capabilities and geographic restrictions of the selected provider/number.

---

# 🚀 Future Improvements

Potential future improvements include:

* PostgreSQL or another production database
* Authentication and role-based access control
* Comprehensive audit logging
* Stronger webhook authentication
* Rate limiting
* Request logging and monitoring
* Automated API tests
* Automated end-to-end voice tests
* Patient search improvements
* Admin dashboard
* Appointment scheduling
* EHR integration
* HIPAA-oriented security/compliance controls
* Encrypted sensitive data
* Improved observability and alerting
* Horizontal scaling

---

# 📋 Assessment Requirements Demonstrated

This project demonstrates practical experience with:

* **Node.js**
* **Express.js**
* **REST APIs**
* **SQLite**
* **Database CRUD operations**
* **Zod validation**
* **AI function/tool calling**
* **Voice AI**
* **Telephony integration**
* **Webhook handling**
* **Error handling**
* **Conversational state management**
* **Duplicate prevention**
* **Production deployment**
* **HTTPS**
* **Git/GitHub**
* **Persistent storage**

---

# 🏁 Project Status

| **Component**                | **Status** |
| ---------------------------- | ---------- |
| Node.js backend              | ✅ Complete |
| Express REST API             | ✅ Complete |
| SQLite database              | ✅ Complete |
| Zod validation               | ✅ Complete |
| CRUD endpoints               | ✅ Complete |
| Vapi agent                   | ✅ Complete |
| `create_patient` tool        | ✅ Complete |
| Vapi → Backend integration   | ✅ Complete |
| Voice testing                | ✅ Complete |
| GitHub repository            | ✅ Complete |
| Render deployment            | ✅ Complete |
| Production HTTPS             | ✅ Complete |
| Production API testing       | ✅ Complete |
| Phase 6 deployment           | ✅ Complete |
| README / Documentation       | 🔵 Phase 7 |
| Final assessment test script | ⏳ Phase 8  |

---

# 👨‍💻 Author

**Khubaib Lodhi**

GitHub:

```text
https://github.com/khubaiblodhi123/voice-patient-agent
```

---

# 📄 License

This project was developed as a technical assessment project.

---

## Final Architecture Summary

```text
                         VOICE PATIENT REGISTRATION
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Vapi Voice AI │
                         └────────┬────────┘
                                  │
                         create_patient
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │    Render HTTPS API     │
                    │                         │
                    │  Node.js + Express.js   │
                    └────────────┬────────────┘
                                 │
                         Zod Validation
                                 │
                         Duplicate Check
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │         SQLite          │
                    │      patients.db        │
                    └─────────────────────────┘
```

**The system follows a confirmation-first architecture where the AI collects and reviews patient information, while the backend remains responsible for validation, duplicate protection, and database persistence.**
