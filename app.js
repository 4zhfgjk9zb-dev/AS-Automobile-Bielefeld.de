
const $ = (s) => document.querySelector(s);
const grid = $("#vehicle-grid");
const statusPill = $("#mobile-status");
let vehicles = [];

$("#year").textContent = new Date().getFullYear();

const menu = $(".menu-toggle");
const nav = $("#mainnav");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});

function euro(value) {
  try { return new Intl.NumberFormat("de-DE", {style:"currency", currency:"EUR", maximumFractionDigits:0}).format(value); }
  catch { return value + " €"; }
}

function normalizeVehicle(v) {
  return {
    id: v.id || v.adKey || v.mobileAdId || "",
    title: v.title || [v.make, v.model].filter(Boolean).join(" ") || "Fahrzeug",
    make: v.make || "",
    model: v.model || "",
    price: Number(v.price?.consumerPriceGross ?? v.price?.gross ?? v.price ?? 0),
    mileage: v.mileage ?? v.mileageKm ?? "",
    firstRegistration: v.firstRegistration ?? v.firstRegistrationDate ?? "",
    fuel: v.fuel || v.fuelType || "",
    power: v.power || v.powerKw || "",
    transmission: v.transmission || "",
    image: v.image || v.images?.[0]?.uri || v.images?.[0]?.url || "",
    url: v.url || (v.id ? `https://suchen.mobile.de/fahrzeuge/details.html?id=${encodeURIComponent(v.id)}` : "#")
  };
}

function populateFilters(items) {
  const makes = [...new Set(items.map(v => v.make).filter(Boolean))].sort();
  const models = [...new Set(items.map(v => v.model).filter(Boolean))].sort();
  const fuels = [...new Set(items.map(v => v.fuel).filter(Boolean))].sort();
  for (const [select, values] of [
    [$("#filter-make"), makes], [$("#filter-model"), models], [$("#filter-fuel"), fuels]
  ]) {
    values.forEach(val => {
      const o = document.createElement("option");
      o.value = val; o.textContent = val; select.appendChild(o);
    });
  }
}

function render(items) {
  if (!items.length) {
    grid.innerHTML = `<article class="vehicle-placeholder">
      <div class="placeholder-icon">🚗</div>
      <h3>Keine Fahrzeuge für diesen Filter</h3>
      <p>Bitte Filter anpassen oder alle Filter zurücksetzen.</p>
    </article>`;
    return;
  }
  grid.innerHTML = items.map(v => `
    <article class="vehicle-card">
      ${v.image ? `<img src="${v.image}" alt="${escapeHtml(v.title)}" loading="lazy">` : `<div class="avatar">🚗</div>`}
      <div class="vehicle-card-body">
        <h3>${escapeHtml(v.title)}</h3>
        <div class="vehicle-meta">${[
          v.mileage ? `${escapeHtml(String(v.mileage))} km` : "",
          v.firstRegistration ? `EZ ${escapeHtml(String(v.firstRegistration))}` : "",
          v.fuel ? escapeHtml(v.fuel) : "",
          v.transmission ? escapeHtml(v.transmission) : ""
        ].filter(Boolean).join(" · ")}</div>
        <div class="vehicle-price">${v.price ? euro(v.price) : "Preis auf Anfrage"}</div>
        <a class="btn btn-outline" href="${v.url}" target="_blank" rel="noopener">Zum Angebot</a>
      </div>
    </article>`).join("");
}

function escapeHtml(x) {
  return String(x).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function applyFilters() {
  const make = $("#filter-make").value;
  const model = $("#filter-model").value;
  const price = Number($("#filter-price").value || 0);
  const fuel = $("#filter-fuel").value;
  render(vehicles.filter(v =>
    (!make || v.make === make) &&
    (!model || v.model === model) &&
    (!price || !v.price || v.price <= price) &&
    (!fuel || v.fuel === fuel)
  ));
}

["#filter-make","#filter-model","#filter-price","#filter-fuel"].forEach(id => $(id)?.addEventListener("change", applyFilters));
$("#reset-filters")?.addEventListener("click", () => {
  ["#filter-make","#filter-model","#filter-price","#filter-fuel"].forEach(id => $(id).value = "");
  applyFilters();
});

async function loadVehicles() {
  try {
    // Production: This endpoint should be provided by the Cloudflare Worker in worker/mobile-worker.js
    const r = await fetch("/api/vehicles", {headers: {"Accept":"application/json"}});
    if (!r.ok) throw new Error("API not active");
    const data = await r.json();
    const raw = Array.isArray(data) ? data : (data.vehicles || data.ads || []);
    vehicles = raw.map(normalizeVehicle);
    if (!vehicles.length) throw new Error("No vehicles");
    statusPill.classList.add("is-live");
    statusPill.innerHTML = "<span></span> mobile.de live verbunden";
    populateFilters(vehicles);
    render(vehicles);
  } catch (err) {
    // Keep the transparent fallback visible until mobile.de credentials are configured.
  }
}
loadVehicles();
