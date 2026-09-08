const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const MOBILE_USERNAME = process.env.MOBILE_USERNAME;
const MOBILE_PASSWORD = process.env.MOBILE_PASSWORD;
const MOBILE_CUSTOMER_NUMBER =
  process.env.MOBILE_CUSTOMER_NUMBER || "814801";

const allowedOrigins = new Set(
  (
    process.env.ALLOWED_ORIGINS ||
    "https://as-automobile-bielefeld.de,https://www.as-automobile-bielefeld.de"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.disable("x-powered-by");

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", (_req, res) => {
  res.json({
    service: "AS Automobile mobile.de API",
    status: "ok"
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/vehicles", async (req, res) => {
  if (!MOBILE_USERNAME || !MOBILE_PASSWORD) {
    return res.status(500).json({
      error: "mobile.de Zugangsdaten sind auf dem Server noch nicht eingerichtet."
    });
  }

  const requestedPage = Number.parseInt(req.query.page || "1", 10);
  const requestedSize = Number.parseInt(req.query.size || "100", 10);

  const page = Number.isFinite(requestedPage)
    ? Math.max(1, requestedPage)
    : 1;
  const size = Number.isFinite(requestedSize)
    ? Math.min(100, Math.max(1, requestedSize))
    : 100;

  const params = new URLSearchParams({
    customerNumber: MOBILE_CUSTOMER_NUMBER,
    "page.number": String(page),
    "page.size": String(size),
    "sort.field": "modificationTime",
    "sort.order": "DESCENDING"
  });

  const url = `https://services.mobile.de/search-api/search?${params.toString()}`;
  const auth = Buffer.from(
    `${MOBILE_USERNAME}:${MOBILE_PASSWORD}`,
    "utf8"
  ).toString("base64");

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/vnd.de.mobile.api+json",
        "User-Agent": "AS-Automobile-Bielefeld/1.0"
      }
    });

    const body = await upstream.text();

    if (!upstream.ok) {
      console.error(
        `mobile.de API Fehler: HTTP ${upstream.status}`
      );

      return res.status(upstream.status).json({
        error: "Die Fahrzeugdaten konnten aktuell nicht von mobile.de geladen werden.",
        status: upstream.status
      });
    }

    res.type("application/json").send(body);
  } catch (error) {
    console.error("mobile.de API nicht erreichbar:", error.message);

    res.status(502).json({
      error: "mobile.de ist aktuell nicht erreichbar."
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Nicht gefunden" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AS Automobile mobile.de API läuft auf Port ${PORT}`);
});
