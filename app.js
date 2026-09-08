const $ = (s) => document.querySelector(s);
const grid = $("#vehicle-grid");
const statusPill = $("#mobile-status");
let vehicles = [];

const MOBILE_API = "https://as-automobile-mobile-api.onrender.com/api/vehicles";

$("#year").textContent = new Date().getFullYear();

const menu = $(".menu-toggle");
const nav = $("#mainnav");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});

function euro(value) {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return value + " €";
  }
}

function formatMileage(value) {
  const n = Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat("de-DE").format(n) : value;
}

function formatRegistration(value) {
  const s = String(value || "").replace(/\D/g, "");
  if (s.length === 6) return `${s.slice(4, 6)}/${s.slice(0, 4)}`;
  return value || "";
}

function labelFuel(value) {
  const labels = {
    PETROL: "Benzin",
    DIESEL: "Diesel",
    ELECTRICITY: "Elektro",
    HYBRID: "Hybrid",
    LPG: "Autogas (LPG)",
    CNG: "Erdgas (CNG)",
    ETHANOL: "Ethanol",
    OTHER: "Sonstige"
  };
  return labels[value] || String(value || "").replaceAll("_", " ");
}

function labelGearbox(value) {
  const labels = {
    AUTOMATIC_GEAR: "Automatik",
    MANUAL_GEAR: "Schaltgetriebe",
    SEMIAUTOMATIC_GEAR: "Halbautomatik"
  };
  return labels[value] || String(value || "").replaceAll("_", " ");
}

function getImage(v) {
  const first = Array.isArray(v.images) ? v.images[0] : null;
  if (!first) return "";
  return first.xxl || first.xl || first.l || first.m || first.s ||
         first.uri || first.url || "";
}

function normalizeVehicle(v) {
  const make = v.make || "";
  const model = v.model || "";
  const description = v.modelDescription || "";
  const title = [make, model].filter(Boolean).join(" ") || "Fahrzeug";

  return {
    id: v.mobileAdId || v.id || v.adKey || "",
    title,
    description,
    make,
    model,
    price: Number(v.price?.consumerPriceGross ?? v.price?.gross ?? v.price ?? 0),
    mileage: v.mileage ?? v.mileageKm ?? "",
    firstRegistration: formatRegistration(v.firstRegistration ?? v.firstRegistrationDate ?? ""),
    fuel: labelFuel(v.fuel || v.fuelType || ""),
    power: v.power || v.powerKw || "",
    transmission: labelGearbox(v.gearbox || v.transmission || ""),
    image: v.image || getImage(v),
    url: v.detailPageUrl || v.url ||
      (v.mobileAdId ? `https://suchen.mobile.de/fahrzeuge/details.html?id=${encodeURIComponent(v.mobileAdId)}` : "#")
  };
}

function clearDynamicOptions(select) {
  while (select.options.length > 1) select.remove(1);
}

function populateFilters(items) {
  const makeSelect = $("#filter-make");
  const modelSelect = $("#filter-model");
  const fuelSelect = $("#filter-fuel");

  [makeSelect, modelSelect, fuelSelect].forEach(clearDynamicOptions);

  const makes = [...new Set(items.map(v => v.make).filter(Boolean))].sort();
  const models = [...new Set(items.map(v => v.model).filter(Boolean))].sort();
  const fuels = [...new Set(items.map(v => v.fuel).filter(Boolean))].sort();

  for (const [select, values] of [
    [makeSelect, makes], [modelSelect, models], [fuelSelect, fuels]
  ]) {
    values.forEach(val => {
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val;
      select.appendChild(option);
    });
  }
}

function escapeHtml(x) {
  return String(x).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function safeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : "#";
  } catch {
    return "#";
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
      ${v.image
        ? `<img src="${safeUrl(v.image)}" alt="${escapeHtml(v.title)}" loading="lazy">`
        : `<div class="vehicle-no-image">🚗</div>`}
      <div class="vehicle-card-body">
        <h3>${escapeHtml(v.title)}</h3>
        ${v.description ? `<p class="vehicle-description">${escapeHtml(v.description)}</p>` : ""}
        <div class="vehicle-meta">${[
          v.mileage !== "" ? `${escapeHtml(formatMileage(v.mileage))} km` : "",
          v.firstRegistration ? `EZ ${escapeHtml(v.firstRegistration)}` : "",
          v.fuel ? escapeHtml(v.fuel) : "",
          v.transmission ? escapeHtml(v.transmission) : ""
        ].filter(Boolean).join(" · ")}</div>
        <div class="vehicle-price">${v.price ? euro(v.price) : "Preis auf Anfrage"}</div>
        <a class="btn btn-outline" href="${safeUrl(v.url)}" target="_blank" rel="noopener">
          Fahrzeug ansehen
        </a>
      </div>
    </article>`).join("");
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

["#filter-make", "#filter-model", "#filter-price", "#filter-fuel"].forEach(id =>
  $(id)?.addEventListener("change", applyFilters)
);

$("#reset-filters")?.addEventListener("click", () => {
  ["#filter-make", "#filter-model", "#filter-price", "#filter-fuel"].forEach(id => {
    $(id).value = "";
  });
  applyFilters();
});

async function loadVehicles() {
  statusPill.innerHTML = "<span></span> mobile.de wird geladen";
  grid.innerHTML = `<article class="vehicle-placeholder vehicle-loading">
    <div class="placeholder-icon">🚗</div>
    <h3>Fahrzeugbestand wird geladen …</h3>
    <p>Beim kostenlosen Server kann der erste Aufruf nach längerer Pause etwas dauern.</p>
  </article>`;

  try {
    const response = await fetch(MOBILE_API, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data.ads || data.vehicles || []);
    vehicles = raw.map(normalizeVehicle);

    if (!vehicles.length) throw new Error("Keine Fahrzeuge");

    statusPill.classList.add("is-live");
    statusPill.innerHTML = `<span></span> ${vehicles.length} Fahrzeuge · mobile.de live`;

    populateFilters(vehicles);
    render(vehicles);
  } catch (error) {
    console.error("Fahrzeugbestand konnte nicht geladen werden:", error);
    statusPill.classList.remove("is-live");
    statusPill.innerHTML = "<span></span> mobile.de momentan nicht erreichbar";
    grid.innerHTML = `<article class="vehicle-placeholder">
      <div class="placeholder-icon">🚗</div>
      <h3>Fahrzeuge momentan nicht ladbar</h3>
      <p>Bitte versuchen Sie es gleich noch einmal oder öffnen Sie unseren aktuellen Bestand direkt bei mobile.de.</p>
      <a class="btn btn-outline" href="https://home.mobile.de/ASAUTOMOBILEGROUP" target="_blank" rel="noopener">
        Fahrzeuge auf mobile.de ansehen
      </a>
    </article>`;
  }
}

loadVehicles();
