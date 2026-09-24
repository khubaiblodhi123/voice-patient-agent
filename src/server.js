// require("dotenv").config();const express=require("express"),cors=require("cors");require("./database/db");const patients=require("./routes/patients");const vapi=require("./routes/vapi");const app=express(),PORT=Number(process.env.PORT||3001);app.use(cors());app.use(express.json({limit:"100kb"}));app.get("/health",(q,s)=>s.json({data:{status:"ok",service:"voice-patient-agent-api",timestamp:new Date().toISOString()},error:null}));app.use("/patients",patients);app.use("/vapi", vapi);app.use((q,s)=>s.status(404).json({data:null,error:{code:"NOT_FOUND",message:`Route ${q.method} ${q.originalUrl} not found`}}));app.use((e,q,s,n)=>{console.error(e);s.status(500).json({data:null,error:{code:"INTERNAL_SERVER_ERROR",message:"An unexpected server error occurred"}})});app.listen(PORT,()=>console.log(`API running on http://localhost:${PORT}`));

require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./database/db");

const patients = require("./routes/patients");
const vapi = require("./routes/vapi");

const app = express();

const PORT = Number(process.env.PORT || 3001);

// -------------------------
// Middleware
// -------------------------

app.use(cors());

app.use(
  express.json({
    limit: "100kb"
  })
);

// -------------------------
// Health Check
// -------------------------

app.get("/health", (req, res) => {
  res.json({
    data: {
      status: "ok",
      service: "voice-patient-agent-api",
      timestamp: new Date().toISOString()
    },
    error: null
  });
});

// -------------------------
// Patient API
// -------------------------

app.use("/patients", patients);

// -------------------------
// Vapi Webhook / Tool API
// -------------------------

app.use("/vapi", vapi);

// -------------------------
// 404 Handler
// -------------------------

app.use((req, res) => {
  res.status(404).json({
    data: null,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// -------------------------
// Global Error Handler
// -------------------------

app.use((err, req, res, next) => {
  console.error("[SERVER_ERROR]", err);

  res.status(500).json({
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred"
    }
  });
});

// -------------------------
// Start Server
// -------------------------

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});