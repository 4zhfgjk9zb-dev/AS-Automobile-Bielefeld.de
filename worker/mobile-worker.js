
/**
 * Cloudflare Worker template for mobile.de Search API integration.
 *
 * Required Worker secrets / variables:
 *   MOBILE_USER              mobile.de Search API username
 *   MOBILE_PASSWORD          mobile.de Search API password
 *   MOBILE_CUSTOMER_NUMBER   AS Automobile mobile.de customerNumber
 *
 * IMPORTANT:
 * - Never place MOBILE_USER or MOBILE_PASSWORD in the website JavaScript.
 * - Ask mobile.de to activate "Search API / Inserats-Einbindung".
 * - Endpoint docs: https://services.mobile.de/docs/search-api.html
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/vehicles") {
      return new Response("Not found", { status: 404 });
    }

    if (!env.MOBILE_USER || !env.MOBILE_PASSWORD || !env.MOBILE_CUSTOMER_NUMBER) {
      return Response.json(
        { error: "mobile.de API not configured", vehicles: [] },
        { status: 503, headers: cors() }
      );
    }

    const api = new URL("https://services.mobile.de/search-api/search");
    api.searchParams.set("customerNumber", env.MOBILE_CUSTOMER_NUMBER);
    api.searchParams.set("page.size", "100");
    api.searchParams.set("sort.field", "modificationTime");
    api.searchParams.set("sort.order", "DESCENDING");

    const auth = btoa(`${env.MOBILE_USER}:${env.MOBILE_PASSWORD}`);

    const response = await fetch(api, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/vnd.de.mobile.api+json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: "mobile.de request failed", status: response.status, detail: text.slice(0, 500) },
        { status: 502, headers: cors() }
      );
    }

    const result = await response.json();

    // Keep the front-end contract simple. The front-end also tolerates raw mobile.de fields.
    return Response.json(
      { vehicles: result.ads || [], total: result.total || 0 },
      {
        headers: {
          ...cors(),
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8"
  };
}
