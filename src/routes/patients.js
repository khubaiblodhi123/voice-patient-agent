// const express=require("express"),crypto=require("crypto"),db=require("../database/db"),{create,update,future}=require("../validation/patient");const r=express.Router();const now=()=>new Date().toISOString();const err=(res,e)=>res.status(422).json({data:null,error:{code:"VALIDATION_ERROR",message:"Request validation failed",details:e.issues}});r.get("/",(q,s)=>{let sql="SELECT * FROM patients WHERE deleted_at IS NULL",p={};if(q.query.last_name){sql+=" AND LOWER(last_name)=LOWER(@last_name)";p.last_name=String(q.query.last_name).trim()}if(q.query.date_of_birth){sql+=" AND date_of_birth=@date_of_birth";p.date_of_birth=String(q.query.date_of_birth).trim()}if(q.query.phone_number){sql+=" AND phone_number=@phone_number";p.phone_number=String(q.query.phone_number).replace(/\D/g,"")}sql+=" ORDER BY created_at DESC";s.json({data:db.prepare(sql).all(p),error:null})});r.get("/:id",(q,s)=>{const x=db.prepare("SELECT * FROM patients WHERE patient_id=? AND deleted_at IS NULL").get(q.params.id);if(!x)return s.status(404).json({data:null,error:{code:"PATIENT_NOT_FOUND",message:"Patient not found"}});s.json({data:x,error:null})});r.post("/",(q,s)=>{const v=create.safeParse(q.body);if(!v.success)return err(s,v.error);const d=v.data;const keys=Object.keys(d);const dup=db.prepare("SELECT * FROM patients WHERE phone_number=? AND deleted_at IS NULL LIMIT 1").get(d.phone_number);if(dup)return s.status(409).json({data:dup,error:{code:"DUPLICATE_PHONE",message:"A patient with this phone number already exists"}});const x={patient_id:crypto.randomUUID(),...d,created_at:now(),updated_at:now(),deleted_at:null};db.prepare(`INSERT INTO patients(patient_id,first_name,last_name,date_of_birth,sex,phone_number,email,address_line_1,address_line_2,city,state,zip_code,insurance_provider,insurance_member_id,preferred_language,emergency_contact_name,emergency_contact_phone,created_at,updated_at,deleted_at) VALUES(@patient_id,@first_name,@last_name,@date_of_birth,@sex,@phone_number,@email,@address_line_1,@address_line_2,@city,@state,@zip_code,@insurance_provider,@insurance_member_id,@preferred_language,@emergency_contact_name,@emergency_contact_phone,@created_at,@updated_at,@deleted_at)`).run(x);console.log("[PATIENT_CREATED]",JSON.stringify(x));s.status(201).json({data:x,error:null})});r.put("/:id",(q,s)=>{const v=update.safeParse(q.body);if(!v.success)return err(s,v.error);const old=db.prepare("SELECT * FROM patients WHERE patient_id=? AND deleted_at IS NULL").get(q.params.id);if(!old)return s.status(404).json({data:null,error:{code:"PATIENT_NOT_FOUND",message:"Patient not found"}});const d=v.data;if(d.date_of_birth&&future(d.date_of_birth))return s.status(422).json({data:null,error:{code:"VALIDATION_ERROR",message:"date_of_birth must not be in the future"}});if(d.phone_number){const dup=db.prepare("SELECT patient_id FROM patients WHERE phone_number=? AND patient_id!=? AND deleted_at IS NULL").get(d.phone_number,q.params.id);if(dup)return s.status(409).json({data:null,error:{code:"DUPLICATE_PHONE",message:"Another patient already uses this phone number"}})}const keys=Object.keys(d);if(!keys.length)return s.json({data:old,error:null});const set=keys.map(k=>`${k}=@${k}`).join(",");db.prepare(`UPDATE patients SET ${set},updated_at=@updated_at WHERE patient_id=@patient_id`).run({...d,patient_id:q.params.id,updated_at:now()});const x=db.prepare("SELECT * FROM patients WHERE patient_id=?").get(q.params.id);console.log("[PATIENT_UPDATED]",JSON.stringify(x));s.json({data:x,error:null})});r.delete("/:id",(q,s)=>{const x=db.prepare("SELECT * FROM patients WHERE patient_id=? AND deleted_at IS NULL").get(q.params.id);if(!x)return s.status(404).json({data:null,error:{code:"PATIENT_NOT_FOUND",message:"Patient not found"}});const t=now();db.prepare("UPDATE patients SET deleted_at=?,updated_at=? WHERE patient_id=?").run(t,t,q.params.id);s.json({data:{patient_id:q.params.id,deleted_at:t},error:null})});module.exports=r;

const express = require("express");
const crypto = require("crypto");
const db = require("../database/db");
const {
  create,
  update,
  future
} = require("../validation/patient");

const r = express.Router();

const now = () => new Date().toISOString();

const err = (res, e) =>
  res.status(422).json({
    data: null,
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      details: e.issues
    }
  });

/**
 * GET /patients
 * Optional filters:
 * ?last_name=
 * ?date_of_birth=
 * ?phone_number=
 */
r.get("/", (q, s) => {
  let sql = `
    SELECT *
    FROM patients
    WHERE deleted_at IS NULL
  `;

  const p = {};

  if (q.query.last_name) {
    sql += ` AND LOWER(last_name) = LOWER(@last_name)`;
    p.last_name = String(q.query.last_name).trim();
  }

  if (q.query.date_of_birth) {
    sql += ` AND date_of_birth = @date_of_birth`;
    p.date_of_birth = String(q.query.date_of_birth).trim();
  }

  if (q.query.phone_number) {
    sql += ` AND phone_number = @phone_number`;
    p.phone_number = String(q.query.phone_number).replace(/\D/g, "");
  }

  sql += ` ORDER BY created_at DESC`;

  s.json({
    data: db.prepare(sql).all(p),
    error: null
  });
});


/**
 * GET /patients/:id
 */
r.get("/:id", (q, s) => {
  const x = db
    .prepare(`
      SELECT *
      FROM patients
      WHERE patient_id = ?
        AND deleted_at IS NULL
    `)
    .get(q.params.id);

  if (!x) {
    return s.status(404).json({
      data: null,
      error: {
        code: "PATIENT_NOT_FOUND",
        message: "Patient not found"
      }
    });
  }

  s.json({
    data: x,
    error: null
  });
});


/**
 * POST /patients
 */
r.post("/", (q, s) => {
  const v = create.safeParse(q.body);

  if (!v.success) {
    return err(s, v.error);
  }

  const d = v.data;

  // Duplicate phone check
  const dup = db
    .prepare(`
      SELECT *
      FROM patients
      WHERE phone_number = ?
        AND deleted_at IS NULL
      LIMIT 1
    `)
    .get(d.phone_number);

  if (dup) {
    return s.status(409).json({
      data: dup,
      error: {
        code: "DUPLICATE_PHONE",
        message: "A patient with this phone number already exists"
      }
    });
  }

  const timestamp = now();

  const x = {
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

    insurance_provider: d.insurance_provider ?? null,
    insurance_member_id: d.insurance_member_id ?? null,

    preferred_language: d.preferred_language ?? "English",

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
  `).run(x);

  console.log(
    "[PATIENT_CREATED]",
    JSON.stringify(x)
  );

  s.status(201).json({
    data: x,
    error: null
  });
});


/**
 * PUT /patients/:id
 *
 * Supports PARTIAL updates.
 */
r.put("/:id", (q, s) => {

  // Validate incoming fields
  const v = update.safeParse(q.body);

  if (!v.success) {
    return err(s, v.error);
  }

  // Find existing patient
  const old = db
    .prepare(`
      SELECT *
      FROM patients
      WHERE patient_id = ?
        AND deleted_at IS NULL
    `)
    .get(q.params.id);

  if (!old) {
    return s.status(404).json({
      data: null,
      error: {
        code: "PATIENT_NOT_FOUND",
        message: "Patient not found"
      }
    });
  }

  const d = v.data;

  // Future DOB validation
  if (
    d.date_of_birth &&
    future(d.date_of_birth)
  ) {
    return s.status(422).json({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "date_of_birth must not be in the future"
      }
    });
  }

  // Duplicate phone validation
  if (d.phone_number) {
    const dup = db
      .prepare(`
        SELECT patient_id
        FROM patients
        WHERE phone_number = ?
          AND patient_id != ?
          AND deleted_at IS NULL
      `)
      .get(
        d.phone_number,
        q.params.id
      );

    if (dup) {
      return s.status(409).json({
        data: null,
        error: {
          code: "DUPLICATE_PHONE",
          message:
            "Another patient already uses this phone number"
        }
      });
    }
  }

  const keys = Object.keys(d);

  // Empty update
  if (!keys.length) {
    return s.json({
      data: old,
      error: null
    });
  }

  /*
   * IMPORTANT:
   *
   * Build the parameters explicitly.
   * Optional fields that are included in the update
   * are converted to null when appropriate.
   */
  const params = {
    patient_id: q.params.id,
    updated_at: now()
  };

  const allowedFields = [
    "first_name",
    "last_name",
    "date_of_birth",
    "sex",
    "phone_number",
    "email",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "zip_code",
    "insurance_provider",
    "insurance_member_id",
    "preferred_language",
    "emergency_contact_name",
    "emergency_contact_phone"
  ];

  const updateFields = [];

  for (const key of keys) {

    if (!allowedFields.includes(key)) {
      continue;
    }

    updateFields.push(
      `${key} = @${key}`
    );

    params[key] =
      d[key] === undefined
        ? null
        : d[key];
  }

  if (!updateFields.length) {
    return s.json({
      data: old,
      error: null
    });
  }

  const sql = `
    UPDATE patients
    SET
      ${updateFields.join(", ")},
      updated_at = @updated_at
    WHERE patient_id = @patient_id
  `;

  db.prepare(sql).run(params);

  const x = db
    .prepare(`
      SELECT *
      FROM patients
      WHERE patient_id = ?
    `)
    .get(q.params.id);

  console.log(
    "[PATIENT_UPDATED]",
    JSON.stringify(x)
  );

  s.json({
    data: x,
    error: null
  });
});


/**
 * DELETE /patients/:id
 *
 * Soft delete only.
 */
r.delete("/:id", (q, s) => {

  const x = db
    .prepare(`
      SELECT *
      FROM patients
      WHERE patient_id = ?
        AND deleted_at IS NULL
    `)
    .get(q.params.id);

  if (!x) {
    return s.status(404).json({
      data: null,
      error: {
        code: "PATIENT_NOT_FOUND",
        message: "Patient not found"
      }
    });
  }

  const t = now();

  db.prepare(`
    UPDATE patients
    SET
      deleted_at = ?,
      updated_at = ?
    WHERE patient_id = ?
  `).run(
    t,
    t,
    q.params.id
  );

  s.json({
    data: {
      patient_id: q.params.id,
      deleted_at: t
    },
    error: null
  });
});


module.exports = r;
