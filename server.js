// Minimal plate-lookup server, wired for carregistrationapi.ae (RegCheck API).
//
// Runs with MOCK data out of the box so you can see the flow immediately.
// Set USE_MOCK=false and add your RegCheck username to call the real API.
//
// Requires Node 18+ (uses built-in fetch).

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ----- CONFIG -------------------------------------------------------------
// Settings are read from the plain-text file "settings.txt" in this folder.
// You edit that file in TextEdit — no need to touch this code.
function loadSettings() {
  const out = {};
  try {
    const txt = fs.readFileSync(path.join(__dirname, "settings.txt"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith("#")) continue;
      const i = s.indexOf("=");
      if (i === -1) continue;
      out[s.slice(0, i).trim().toUpperCase()] = s.slice(i + 1).trim();
    }
  } catch (e) { /* no settings file: fall back to defaults / env vars */ }
  return out;
}
const SETTINGS = loadSettings();

// On a hosting service, settings come from the server's Environment Variables
// (which stay private). On your own Mac, they come from settings.txt.
// Environment variables win if both are present.

// MODE is "mock" (sample data) or "live" (real API). Default: mock.
const MODE = (process.env.MODE || SETTINGS.MODE || "mock").toLowerCase();
const USE_MOCK = MODE !== "live";

// Your carregistrationapi.ae account USERNAME (the API credential, not a password).
const REGCHECK_USERNAME = process.env.REGCHECK_USERNAME || SETTINGS.USERNAME || "";

// Public Dubai endpoint (Make & Model, testable free with plate F33333).
const REGCHECK_ENDPOINT = "https://www.regcheck.org.uk/api/reg.asmx";
const REGCHECK_SOAP_ACTION = "http://regcheck.org.uk/CheckUAE";
const REGCHECK_NAMESPACE = "http://regcheck.org.uk/";
// For other emirates + richer data (VIN etc.) you need the PRIVATE endpoint,
// which also requires the owner's Emirates ID. Contact carregistrationapi.ae:
//   https://www.carregistrationapi.ae/api/private/uae.asmx  (op=CheckUAE)
// --------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, "public")));

// Mock dataset. F33333 mirrors the real API's free test plate so the
// switch from mock to live is seamless.
const MOCK = {
  "DXB:F:33333":  { make: "Hyundai", model: "Santa Fe", year: null, color: null, regStatus: null, regExpiry: null },
  "DXB:A:12345":  { make: "Toyota", model: "Land Cruiser", year: 2022, color: "White", regStatus: "Active", regExpiry: "2026-09-14" },
  "AUH:11:55678": { make: "Nissan", model: "Patrol", year: 2021, color: "Black", regStatus: "Active", regExpiry: "2026-03-02" },
};

// --- small helpers for the SOAP/XML round-trip ----------------------------
function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function unescapeXml(s) {
  return String(s)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : null;
}
// RegCheck wraps values as { CurrentTextValue: "..." }; pull the plain value.
function pick(node) {
  if (node && typeof node === "object") return node.CurrentTextValue ?? null;
  return node ?? null;
}

// Turn the provider's response into the single shape your form expects.
function normalize(raw) {
  return {
    make: pick(raw.CarMake) ?? pick(raw.MakeDescription) ?? null,
    model: pick(raw.CarModel) ?? pick(raw.ModelDescription) ?? null,
    year: raw.RegistrationYear ?? null,
    color: raw.Colour ?? raw.Color ?? null,
    regStatus: raw.regStatus ?? raw.registration_status ?? null,
    regExpiry: raw.regExpiry ?? raw.Expiry ?? null,
  };
}

// THE real call. SOAP request to RegCheck's CheckUAE method.
async function callRealProvider({ registrationNumber }) {
  if (!REGCHECK_USERNAME) {
    throw new Error("REGCHECK_USERNAME is not set.");
  }
  const envelope =
`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CheckUAE xmlns="${REGCHECK_NAMESPACE}">
      <RegistrationNumber>${escapeXml(registrationNumber)}</RegistrationNumber>
      <username>${escapeXml(REGCHECK_USERNAME)}</username>
    </CheckUAE>
  </soap:Body>
</soap:Envelope>`;

  const resp = await fetch(REGCHECK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": REGCHECK_SOAP_ACTION,
    },
    body: envelope,
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`Provider HTTP ${resp.status}: ${text.slice(0, 300)}`);

  // The vehicle details come back as JSON inside a <vehicleJson> element.
  const jsonStr = extractTag(text, "vehicleJson");
  if (!jsonStr) return null; // no match / empty result
  const raw = JSON.parse(unescapeXml(jsonStr.trim()));
  return normalize(raw);
}

app.get("/lookup", async (req, res) => {
  const { emirate = "", plateCode = "", plateNumber = "" } = req.query;

  if (!emirate || !plateNumber) {
    return res.status(400).json({ error: "Enter at least an emirate and plate number." });
  }

  // RegCheck UAE expects a single registration string, e.g. code+number => "F33333".
  const registrationNumber = `${plateCode}${plateNumber}`.replace(/\s+/g, "").toUpperCase();

  try {
    if (USE_MOCK) {
      const key = `${emirate.toUpperCase()}:${plateCode.toUpperCase()}:${plateNumber}`;
      const hit = MOCK[key];
      if (!hit) {
        return res.json({
          found: false,
          message: "No match in sample data. Try DXB / F / 33333 (the real API's free test plate).",
        });
      }
      return res.json({ found: true, source: "mock", vehicle: normalize({
        CarMake: { CurrentTextValue: hit.make }, CarModel: { CurrentTextValue: hit.model },
        RegistrationYear: hit.year, Colour: hit.color, regStatus: hit.regStatus, regExpiry: hit.regExpiry,
      }) });
    }

    const vehicle = await callRealProvider({ registrationNumber });
    if (!vehicle) {
      return res.json({ found: false, message: "No vehicle found for that plate." });
    }
    return res.json({ found: true, source: "provider", vehicle });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Lookup failed. Check your username and plate format." });
  }
});

app.listen(PORT, () => {
  console.log("");
  console.log("  Plate lookup is running.");
  console.log(`  Mode: ${USE_MOCK ? "MOCK (sample data)" : "LIVE (real API)"}`);
  console.log("  Now open your web browser and go to:  http://localhost:3000");
  console.log("  (Keep this window open. To stop, press Control + C.)");
  console.log("");
});
