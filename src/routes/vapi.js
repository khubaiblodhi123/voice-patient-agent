const express = require("express");
const crypto = require("crypto");
const db = require("../database/db");
const { create } = require("../validation/patient");

const r = express.Router();

const now = () => new Date().toISOString();

/**
 * Vapi Function Tool Webhook
 *
 * POST /vapi/tools
 *
 * Receives tool-calls from Vapi.
 */
r.post("/tools", (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || message.type !== "tool-calls") {
      return res.status(200).json({
        results: []
      });
    }

    const toolCalls = Array.isArray(message.toolCallList)
      ? message.toolCallList
      : [];

    const results = [];

    for (const toolCall of toolCalls) {
        console.log(
            "[VAPI_RAW_TOOL_CALL]",
            JSON.stringify(toolCall, null, 2)
        );
        const toolCallId = toolCall.id;

        const toolName =
        toolCall.name ||
        toolCall.function?.name;

        const args =
        toolCall.arguments ||
        toolCall.function?.arguments ||
        toolCall.function?.parameters ||
        {};;

      console.log("[VAPI_TOOL_CALL]", {
        toolCallId,
        toolName,
        args
      });

      if (toolName !== "create_patient") {
        results.push({
          toolCallId,
          error: `Unknown tool: ${toolName}`
        });

        continue;
      }

      /*
       * Server-side validation.
       *
       * Never trust AI-generated data directly.
       */
      const validation = create.safeParse(args);

      if (!validation.success) {
        console.error(
          "[VAPI_VALIDATION_ERROR]",
          validation.error.issues
        );

        results.push({
          toolCallId,
          error:
            "Patient information failed server validation. " +
            "Please ask the caller to correct the invalid information."
        });

        continue;
      }

      const d = validation.data;

      /*
       * Duplicate phone check.
       */
      const duplicate = db
        .prepare(`
          SELECT *
          FROM patients
          WHERE phone_number = ?
            AND deleted_at IS NULL
          LIMIT 1
        `)
        .get(d.phone_number);

      if (duplicate) {
        console.warn(
          "[VAPI_DUPLICATE_PHONE]",
          d.phone_number
        );

        results.push({
          toolCallId,
          error:
            "A patient with this phone number already exists."
        });

        continue;
      }

      /*
       * Create patient.
       */
      const timestamp = now();

      const patient = {
        patient_id: crypto.randomUUID(),

        first_name: d.first_name,
        last_name: d.last_name,
        date_of_birth: d.date_of_birth,
        sex: d.sex,
        phone_number: d.phone_number,

        email: d.email ?? null,

        address_line_1: d.address_line_1,
        address_line_2: d.address_line_2 ?? null,
        city: d.city,
        state: d.state,
        zip_code: d.zip_code,

        insurance_provider:
          d.insurance_provider ?? null,

        insurance_member_id:
          d.insurance_member_id ?? null,

        preferred_language:
          d.preferred_language ?? "English",

        emergency_contact_name:
          d.emergency_contact_name ?? null,

        emergency_contact_phone:
          d.emergency_contact_phone ?? null,

        created_at: timestamp,
        updated_at: timestamp,
        deleted_at: null
      };

      db.prepare(`
        INSERT INTO patients (
          patient_id,
          first_name,
          last_name,
          date_of_birth,
          sex,
          phone_number,
          email,
          address_line_1,
          address_line_2,
          city,
          state,
          zip_code,
          insurance_provider,
          insurance_member_id,
          preferred_language,
          emergency_contact_name,
          emergency_contact_phone,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES (
          @patient_id,
          @first_name,
          @last_name,
          @date_of_birth,
          @sex,
          @phone_number,
          @email,
          @address_line_1,
          @address_line_2,
          @city,
          @state,
          @zip_code,
          @insurance_provider,
          @insurance_member_id,
          @preferred_language,
          @emergency_contact_name,
          @emergency_contact_phone,
          @created_at,
          @updated_at,
          @deleted_at
        )
      `).run(patient);

      console.log(
        "[VAPI_PATIENT_CREATED]",
        JSON.stringify(patient)
      );

      /*
       * Vapi expects a result associated with
       * the exact toolCallId.
       *
       * Keep result as a string.
       */
      results.push({
        toolCallId,
        result:
          `Patient registration completed successfully. ` +
          `Patient ID: ${patient.patient_id}.`
      });
    }

    /*
     * IMPORTANT:
     *
     * Vapi expects HTTP 200 even when an individual
     * tool call has an error.
     */
    return res.status(200).json({
      results
    });

  } catch (error) {
    console.error(
      "[VAPI_TOOL_ERROR]",
      error
    );

    /*
     * If we know the tool call ID, return an
     * individual tool error.
     */
    const toolCallId =
      req.body?.message?.toolCallList?.[0]?.id;

    if (toolCallId) {
      return res.status(200).json({
        results: [
          {
            toolCallId,
            error:
              "The patient registration could not be completed because of a server error."
          }
        ]
      });
    }

    return res.status(200).json({
      results: []
    });
  }
});

module.exports = r;