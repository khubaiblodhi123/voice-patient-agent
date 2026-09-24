# 🧪 Voice Patient Registration Agent — Testing Guide

This document contains the complete testing plan for the **Voice Patient Registration Agent**.

The purpose of this test suite is to verify:

* Voice conversation quality
* Patient information collection
* Conversational state management
* Input validation
* Corrections
* Optional fields
* Final confirmation
* Error handling
* Duplicate protection
* Vapi function calling
* Backend integration
* Database persistence
* Production deployment

---

# 📋 Test Summary

| **Category**                  | **Test Cases** |
| ----------------------------- | -------------: |
| Basic Registration            |            1–5 |
| Data Validation               |           6–17 |
| Optional Information          |          18–23 |
| Missing / Refused Information |          24–27 |
| Confirmation & Corrections    |          28–33 |
| Duplicate & Data Integrity    |          34–36 |
| Conversation Handling         |          37–46 |
| Confirmation Handling         |          47–50 |
| Backend / Error Handling      |          51–54 |
| Production Testing            |          55–59 |
| Final End-to-End Test         |             60 |

---

# 🟢 Category 1 — Basic Registration

## TC-001 — Normal Patient Registration

**Objective:** Verify a complete normal registration.

**Caller:**

> Hi, I want to register as a new patient.

Provide:

```text
First Name: John
Last Name: Smith
DOB: January 15, 1995
Sex: Male
Phone: 2125559015
Address: 100 Test Street
City: New York
State: NY
ZIP: 10001
```

**Expected Result:**

* Agent collects all required information.
* Agent asks for optional information.
* Agent presents a final summary.
* Agent asks for confirmation.
* Patient is not saved before confirmation.
* Caller confirms.
* `create_patient` is called.
* Backend validates the request.
* Patient is inserted into SQLite.
* Agent confirms successful registration.

**Status:** ☐ PASS ☐ FAIL

---

## TC-002 — Information Provided Out of Order

**Caller:**

> My phone number is 2125559016.

Then:

> My name is Sarah Johnson.

Then:

> I live at 200 Main Street, Brooklyn, New York 11201.

Then:

> I was born March 10th 1990.

Then:

> I'm female.

**Expected Result:**

* Agent remembers previously provided information.
* Agent does not restart unnecessarily.
* Agent identifies missing information.
* Final patient information is complete and correct.

**Status:** ☐ PASS ☐ FAIL

---

## TC-003 — Correct First Name

**Caller:**

> My first name is Michael.

Later:

> Actually, my first name is Daniel.

**Expected Result:**

Final first name:

```text
Daniel
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-004 — Correct Address

**Caller:**

> My address is 100 Main Street.

Later:

> Sorry, it's 150 Main Street.

**Expected Result:**

Final address:

```text
150 Main Street
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-005 — Spell a Name

**Caller:**

> My last name is Khubaib. K-H-U-B-A-I-B.

**Expected Result:**

Agent correctly understands and stores the intended name.

**Status:** ☐ PASS ☐ FAIL

---

# 🟡 Category 2 — Data Validation

## TC-006 — Normal Date of Birth

**Caller:**

> January 15th, 1995.

**Expected Result:**

Backend receives:

```text
01/15/1995
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-007 — Alternative DOB Format

Test:

```text
1/15/1995
```

Then test:

```text
January fifteenth, nineteen ninety-five
```

**Expected Result:**

Agent understands the date and produces the required format.

**Status:** ☐ PASS ☐ FAIL

---

## TC-008 — Invalid Date

**Caller:**

> My birthday is February 30th, 1995.

**Expected Result:**

* Agent does not accept the date.
* Agent requests a valid DOB.
* `create_patient` is not called.

**Status:** ☐ PASS ☐ FAIL

---

## TC-009 — Future DOB

**Caller:**

> My date of birth is January 15th, 2030.

**Expected Result:**

* DOB rejected.
* Agent asks for a valid DOB.
* No patient is created.

**Status:** ☐ PASS ☐ FAIL

---

## TC-010 — Invalid Phone Number

**Caller:**

> My phone number is 12345.

**Expected Result:**

* Invalid phone is rejected.
* Agent asks for a valid phone number.
* No patient is created.

**Status:** ☐ PASS ☐ FAIL

---

## TC-011 — Correct Phone Number

**Caller:**

> My phone is 2125559017.

Then:

> Sorry, it's 2125559018.

**Expected Result:**

Final phone:

```text
2125559018
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-012 — Invalid ZIP

**Caller:**

> My ZIP code is 123.

**Expected Result:**

* ZIP rejected.
* Agent asks for a valid ZIP.
* No tool call occurs.

**Status:** ☐ PASS ☐ FAIL

---

## TC-013 — ZIP+4

**Caller:**

> My ZIP is 10001-1234.

**Expected Result:**

ZIP+4 is accepted if supported by the validation schema.

**Status:** ☐ PASS ☐ FAIL

---

## TC-014 — Invalid State

**Caller:**

> I live in XX.

**Expected Result:**

* State rejected.
* Agent asks for a valid U.S. state.
* No patient is created.

**Status:** ☐ PASS ☐ FAIL

---

## TC-015 — State Name Instead of Abbreviation

**Caller:**

> I live in New York.

**Expected Result:**

The agent understands the state and sends:

```text
NY
```

to the backend.

**Status:** ☐ PASS ☐ FAIL

---

## TC-016 — Invalid Email

**Caller:**

> My email is john@.

**Expected Result:**

* Invalid email rejected.
* Agent asks for a valid email.
* Invalid email is not stored.

**Status:** ☐ PASS ☐ FAIL

---

## TC-017 — Multiple Invalid Fields

Provide:

```text
Invalid DOB
Invalid phone
Invalid ZIP
Invalid state
```

**Expected Result:**

* Agent handles each invalid field.
* Agent does not invent replacement values.
* Patient is not saved until all required information is valid.

**Status:** ☐ PASS ☐ FAIL

---

# 🔵 Category 3 — Optional Information

## TC-018 — Email Provided

**Caller:**

> My email is [john.smith@example.com](mailto:john.smith@example.com).

**Expected Result:**

Email is stored correctly.

**Status:** ☐ PASS ☐ FAIL

---

## TC-019 — Email Refused

**Agent:**

> Would you like to provide an email address?

**Caller:**

> No.

**Expected Result:**

* Agent accepts the refusal.
* Does not repeatedly ask.
* Continues registration.
* Email remains empty/null.

**Status:** ☐ PASS ☐ FAIL

---

## TC-020 — Insurance Information

Provide:

```text
Insurance Provider: Blue Cross Blue Shield
Member ID: ABC12345
```

**Expected Result:**

Both fields are stored correctly.

**Status:** ☐ PASS ☐ FAIL

---

## TC-021 — No Insurance

**Caller:**

> I don't have insurance.

**Expected Result:**

* Agent accepts the response.
* Does not force insurance information.
* Registration continues.

**Status:** ☐ PASS ☐ FAIL

---

## TC-022 — Emergency Contact

Provide:

```text
Name: Sarah Smith
Phone: 2125559020
```

**Expected Result:**

Both emergency contact fields are stored correctly.

**Status:** ☐ PASS ☐ FAIL

---

## TC-023 — Preferred Language

**Caller:**

> My preferred language is Spanish.

**Expected Result:**

Preferred language is recorded as:

```text
Spanish
```

**Status:** ☐ PASS ☐ FAIL

---

# 🟠 Category 4 — Missing / Refused Information

## TC-024 — Missing Required Address

Do not provide an address.

**Expected Result:**

Agent identifies the missing address and requests it.

`create_patient` must not be called.

**Status:** ☐ PASS ☐ FAIL

---

## TC-025 — Multiple Missing Required Fields

Provide only:

> My name is John Smith.

**Expected Result:**

Agent:

* Remembers John Smith.
* Identifies remaining required fields.
* Collects them without losing the existing information.

**Status:** ☐ PASS ☐ FAIL

---

## TC-026 — Refuse Required DOB

**Agent:**

> What is your date of birth?

**Caller:**

> I don't want to provide that.

**Expected Result:**

* Agent explains DOB is required.
* Agent does not invent a DOB.
* Patient is not created.

**Status:** ☐ PASS ☐ FAIL

---

## TC-027 — Cancel Registration

**Caller:**

> Never mind, I don't want to register.

**Expected Result:**

* Registration stops.
* No database insertion occurs.

**Status:** ☐ PASS ☐ FAIL

---

# 🔴 Category 5 — Confirmation & Corrections

## TC-028 — Confirm Registration

**Agent:**

> Is all of this information correct?

**Caller:**

> Yes.

**Expected Result:**

```text
Confirmation
     ↓
create_patient
     ↓
Backend validation
     ↓
SQLite INSERT
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-029 — Reject Confirmation

**Agent:**

> Is everything correct?

**Caller:**

> No.

**Expected Result:**

* No database insertion.
* Agent asks what needs to be corrected.
* Agent provides another summary after correction.

**Status:** ☐ PASS ☐ FAIL

---

## TC-030 — Correct Information After Summary

Agent summarizes:

> Your ZIP code is 10001.

Caller:

> No, it's 10002.

**Expected Result:**

Final ZIP:

```text
10002
```

Agent asks for confirmation again.

**Status:** ☐ PASS ☐ FAIL

---

## TC-031 — Start Over

**Caller:**

> Actually, let's start over.

**Expected Result:**

* Unsaved information is cleared.
* New registration starts.
* Previous unconfirmed data is not submitted.

**Status:** ☐ PASS ☐ FAIL

---

## TC-032 — Ask What Information Has Been Collected

During registration:

> What information have I given you so far?

**Expected Result:**

Agent summarizes information already collected without inventing missing information.

**Status:** ☐ PASS ☐ FAIL

---

## TC-033 — Correct Multiple Fields

Change:

```text
Address
ZIP
Phone
DOB
```

during the same conversation.

**Expected Result:**

Only the final corrected values are submitted.

**Status:** ☐ PASS ☐ FAIL

---

# 🟣 Category 6 — Duplicate & Data Integrity

## TC-034 — Duplicate Phone Number

Register a patient using an already-existing phone number.

**Expected Result:**

Backend detects:

```text
Duplicate phone number
```

No second active patient is created.

**Status:** ☐ PASS ☐ FAIL

---

## TC-035 — Same Name, Different Phone

Register:

```text
John Smith
2125559021
```

Then:

```text
John Smith
2125559022
```

**Expected Result:**

Both registrations are allowed because the phone numbers differ.

**Status:** ☐ PASS ☐ FAIL

---

## TC-036 — No Data Invention

**Caller:**

> I don't remember my ZIP code.

**Expected Result:**

Agent asks for the ZIP.

It must not invent a value such as:

```text
10001
```

**Status:** ☐ PASS ☐ FAIL

---

# 🟤 Category 7 — Conversation Handling

## TC-037 — Caller Interrupts Agent

While the agent is speaking:

> Wait, my last name is actually Johnson.

**Expected Result:**

* Agent handles interruption.
* Updates last name.
* Continues naturally.

**Status:** ☐ PASS ☐ FAIL

---

## TC-038 — Topic Change

During registration:

> By the way, what information do you need?

**Expected Result:**

* Agent answers appropriately.
* Returns to registration.
* Previously collected information remains available.

**Status:** ☐ PASS ☐ FAIL

---

## TC-039 — Silence

Remain silent after the agent asks a question.

**Expected Result:**

* Agent waits.
* Agent eventually prompts again.
* Agent does not invent information.

**Status:** ☐ PASS ☐ FAIL

---

## TC-040 — Unclear Speech

Say:

> My ZIP is... uh... one zero... maybe zero one?

**Expected Result:**

Agent requests clarification rather than guessing.

**Status:** ☐ PASS ☐ FAIL

---

## TC-041 — Ambiguous Name

**Caller:**

> My name is Chris.

**Expected Result:**

Agent accepts Chris as the first name and asks for the last name.

**Status:** ☐ PASS ☐ FAIL

---

## TC-042 — Phone Number Spoken Naturally

**Caller:**

> Two one two, five five five, nine zero two three.

**Expected Result:**

Backend receives:

```text
2125559023
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-043 — Address Spoken Naturally

**Caller:**

> I live at one hundred Main Street, apartment five.

**Expected Result:**

Agent correctly interprets the street address and apartment/unit information.

**Status:** ☐ PASS ☐ FAIL

---

## TC-044 — Multiple Fields in One Sentence

**Caller:**

> I'm John Smith, born January 15 1995, I'm male, and my phone number is 2125559024.

**Expected Result:**

Agent extracts the available fields instead of asking for them unnecessarily again.

**Status:** ☐ PASS ☐ FAIL

---

## TC-045 — All Information in One Response

Provide all required information in one long response.

**Expected Result:**

* Agent extracts available information.
* Identifies any missing fields.
* Does not unnecessarily repeat questions.
* Still requires final confirmation.

**Status:** ☐ PASS ☐ FAIL

---

## TC-046 — "I Already Told You"

When asked for information that was already provided:

> I already told you that.

**Expected Result:**

Agent checks its collected information and does not unnecessarily force the caller to repeat it.

**Status:** ☐ PASS ☐ FAIL

---

# 🟧 Category 8 — Confirmation Handling

## TC-047 — Clear Confirmation

**Caller:**

> Yes, that's right. Go ahead.

**Expected Result:**

Agent treats this as confirmation and calls `create_patient`.

**Status:** ☐ PASS ☐ FAIL

---

## TC-048 — Ambiguous Confirmation

**Caller:**

> I guess.

**Expected Result:**

Agent asks for clear confirmation rather than assuming consent.

**Status:** ☐ PASS ☐ FAIL

---

## TC-049 — Uncertain Confirmation

**Caller:**

> I'm not sure.

**Expected Result:**

* No tool call.
* Agent clarifies the information or asks what needs to be changed.

**Status:** ☐ PASS ☐ FAIL

---

## TC-050 — Final Confirmation After Correction

Workflow:

```text
Summary
   ↓
Caller says NO
   ↓
Correction
   ↓
New summary
   ↓
Caller says YES
   ↓
create_patient
```

**Expected Result:**

Patient is saved only after the final confirmation.

**Status:** ☐ PASS ☐ FAIL

---

# 🔴 Category 9 — Backend / Error Handling

## TC-051 — Database Failure

Temporarily make the database unavailable or simulate a database error.

**Expected Result:**

Agent must not say:

> Your registration was successful.

Instead, the failure should be communicated appropriately.

**Status:** ☐ PASS ☐ FAIL

---

## TC-052 — Backend Validation Failure

Send invalid patient information directly to:

```http
POST /vapi/tools
```

**Expected Result:**

* Backend rejects invalid data.
* No patient is inserted.
* Error result is returned to Vapi.

**Status:** ☐ PASS ☐ FAIL

---

## TC-053 — Unknown Tool

Send a tool call with an unknown tool name.

Example:

```text
unknown_tool
```

**Expected Result:**

Backend returns an appropriate unknown-tool error and does not modify the database.

**Status:** ☐ PASS ☐ FAIL

---

## TC-054 — Malformed Vapi Request

Send an invalid or malformed request body to:

```http
POST /vapi/tools
```

**Expected Result:**

* Server does not crash.
* Safe response is returned.
* Existing patient data is unaffected.

**Status:** ☐ PASS ☐ FAIL

---

# 🌐 Category 10 — Production Testing

## TC-055 — Production Health Check

Open:

```text
https://voice-patient-agent.onrender.com/health
```

**Expected Result:**

HTTP `200`

Response should indicate:

```json
{
  "data": {
    "status": "ok"
  },
  "error": null
}
```

**Status:** ☐ PASS ☐ FAIL

---

## TC-056 — Production Patient API

Open:

```text
https://voice-patient-agent.onrender.com/patients
```

**Expected Result:**

API responds successfully and returns patient data.

**Status:** ☐ PASS ☐ FAIL

---

## TC-057 — Production Vapi Webhook

The Vapi tool should point to:

```text
https://voice-patient-agent.onrender.com/vapi/tools
```

**Expected Result:**

Vapi can successfully send the `create_patient` tool call to Render.

**Status:** ☐ PASS ☐ FAIL

---

## TC-058 — Production Voice Registration

Call the Vapi U.S. phone number from a supported calling route.

Complete a full patient registration.

**Expected Result:**

```text
Caller
 ↓
Vapi
 ↓
Render
 ↓
/vapi/tools
 ↓
SQLite
```

Patient should appear in the production database.

**Status:** ☐ PASS ☐ FAIL

---

## TC-059 — Persistence After Restart / Redeploy

1. Create a test patient.
2. Verify it appears in `/patients`.
3. Restart or redeploy the Render service.
4. Check `/patients` again.

**Expected Result:**

The patient record remains available.

This verifies that the SQLite database is using persistent storage rather than temporary service storage.

**Status:** ☐ PASS ☐ FAIL

---

# ⭐ Category 11 — Final End-to-End Assessment Test

# TC-060 — Complete Evaluator Simulation

This is the most important test.

The objective is to simulate how a real evaluator may interact with the agent.

---

## Step 1 — Start Registration

**Caller:**

> I'd like to register as a new patient.

**Expected:**

Agent starts registration.

---

## Step 2 — Provide Information

Provide:

```text
First Name: John
Last Name: Smith
DOB: January 15, 1995
Sex: Male
Phone: 2125559030
Address: 100 Main Street
City: New York
State: NY
ZIP: 10001
```

---

## Step 3 — Correct Information

Say:

> Sorry, my ZIP code is actually 10002.

**Expected:**

Final ZIP should be:

```text
10002
```

---

## Step 4 — Interrupt Agent

While the agent speaks:

> Wait, my last name is Johnson.

**Expected:**

Final last name:

```text
Johnson
```

---

## Step 5 — Optional Information

When asked for email:

> I don't want to provide an email.

**Expected:**

Agent accepts the refusal and continues.

---

## Step 6 — Ask About Current Information

Say:

> What information do you have from me so far?

**Expected:**

Agent summarizes the collected information.

---

## Step 7 — Ask for Final Summary

Allow the agent to summarize the registration.

---

## Step 8 — Reject Confirmation

**Caller:**

> No, something is wrong.

**Expected:**

* No database insertion.
* Agent asks what needs correction.

---

## Step 9 — Correct Another Field

Say:

> My phone number should be 2125559031.

**Expected:**

Final phone:

```text
2125559031
```

---

## Step 10 — Confirm Again

Agent provides a new summary.

**Caller:**

> Yes, everything is correct.

**Expected:**

```text
create_patient
       ↓
Backend validation
       ↓
Duplicate check
       ↓
SQLite INSERT
```

---

## Step 11 — Verify Backend

Check Render logs.

Expected log:

```text
[VAPI_TOOL_CALL]
```

followed by:

```text
[VAPI_PATIENT_CREATED]
```

---

## Step 12 — Verify Database

Open:

```text
https://voice-patient-agent.onrender.com/patients
```

Verify:

```text
John
Johnson
01/15/1995
2125559031
100 Main Street
New York
NY
10002
```

---

## Step 13 — Verify Persistence

Restart/redeploy the Render service and check the patient again.

**Expected:**

Patient remains in the database.

**Status:** ☐ PASS ☐ FAIL

---

# 📊 Final Test Report

After completing the test suite, record the results.

| **Category**             | **Result** |
| ------------------------ | ---------- |
| Basic registration       | ☐ PASS     |
| Data validation          | ☐ PASS     |
| Optional information     | ☐ PASS     |
| Missing information      | ☐ PASS     |
| Corrections              | ☐ PASS     |
| Final confirmation       | ☐ PASS     |
| Duplicate protection     | ☐ PASS     |
| Conversation handling    | ☐ PASS     |
| Error handling           | ☐ PASS     |
| Production API           | ☐ PASS     |
| Vapi integration         | ☐ PASS     |
| Database persistence     | ☐ PASS     |
| Complete end-to-end test | ☐ PASS     |

---

# 🎯 Critical Assessment Checks

Before submitting the project, make sure these specific behaviors work:

### 1. No premature database insertion

```text
Information collected
       ↓
NO confirmation
       ↓
NO INSERT
```

### 2. Confirmation required

```text
Information collected
       ↓
Final summary
       ↓
YES
       ↓
INSERT
```

### 3. Corrections work

```text
Old value
   ↓
Correction
   ↓
New value
   ↓
Database
```

### 4. Invalid information is rejected

```text
Invalid input
     ↓
Validation
     ↓
Correction requested
     ↓
No INSERT
```

### 5. Duplicate protection works

```text
Existing phone
     ↓
Duplicate check
     ↓
Registration rejected
```

### 6. Backend does not trust the AI blindly

```text
Vapi
 ↓
Backend
 ↓
Zod validation
 ↓
Duplicate check
 ↓
Database
```

### 7. Database failure is handled safely

The agent must **never claim successful registration if the backend/database failed**.

### 8. No information is invented

If the caller does not provide a value, the agent should ask rather than guessing.

---

# ✅ Completion Criteria

The Voice Patient Registration Agent can be considered fully tested when:

* [ ] All required patient fields can be collected.
* [ ] Optional fields can be skipped.
* [ ] Information can be provided out of order.
* [ ] Corrections work correctly.
* [ ] Invalid information is rejected.
* [ ] Future DOB is rejected.
* [ ] Duplicate phone numbers are protected.
* [ ] Final confirmation is required.
* [ ] Rejected confirmation does not create a patient.
* [ ] Interruptions are handled.
* [ ] The agent does not invent information.
* [ ] Backend validation works independently.
* [ ] Vapi function calling works.
* [ ] Production Render API works.
* [ ] SQLite insertion works.
* [ ] Database persistence survives restart/redeploy.
* [ ] The complete end-to-end assessment test passes.

---

# 🏁 Final Result

The goal of this test suite is not only to verify that the happy path works.

The agent should demonstrate that it can safely handle:

```text
Normal Input
     +
Corrections
     +
Missing Information
     +
Invalid Information
     +
Interruptions
     +
Confirmation
     +
Duplicate Patients
     +
Backend Errors
     +
Production Deployment
```

The expected final architecture is:

```text
                  ┌─────────────────┐
                  │     Caller      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Vapi Voice    │
                  │      Agent      │
                  └────────┬────────┘
                           │
                    create_patient
                           │
                           ▼
                  ┌─────────────────┐
                  │ Render / Express│
                  └────────┬────────┘
                           │
                    Validation
                           │
                    Duplicate Check
                           │
                           ▼
                  ┌─────────────────┐
                  │      SQLite     │
                  └─────────────────┘
```

**End of Testing Guide**
