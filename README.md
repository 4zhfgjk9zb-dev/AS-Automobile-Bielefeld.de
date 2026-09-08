# AS Automobile Bielefeld – Website v1

Domain: `as-automobile-bielefeld.de`

## Bereits umgesetzt
- Responsive Startseite im dunklen AS/Opel-Look
- Originales, vom Nutzer bereitgestelltes AS-Automobile/Opel-Logo als Web-Asset
- Drei echte Autohaus-Fotos
- Team-Bereich ohne erfundene Portraitfotos
- Neu-/Gebrauchtwagen, Finanzierung, Inzahlungnahme, Service
- Standort und direkte Telefon-/E-Mail-Kontakte
- Fahrzeugbereich für eine automatische mobile.de-Anbindung vorbereitet
- Cloudflare-Worker-Vorlage für `/api/vehicles`
- Impressum/Datenschutz als klar markierte Platzhalter

## Vor dem Livegang noch bestätigen
1. Team-Durchwahlen:
   - Tayfun Aslan: aus `0521-9679860203` wurde `0521 9679860-203` interpretiert.
   - Aylin Aslan / Christian Aßmann: aus `0521-9679860205` wurde `0521 9679860-205` interpretiert.
2. WhatsApp-Nummer, falls eine WhatsApp-Schaltfläche gewünscht ist.
3. Rechtlich vollständiges Impressum.
4. Finale Datenschutzerklärung.
5. mobile.de Search API / Inserats-Einbindung:
   - API-Benutzername
   - API-Passwort
   - Händler-`customerNumber`

## mobile.de Integration
Die offizielle Search API ist dokumentiert unter:
`https://services.mobile.de/docs/search-api.html`

Die Website ruft nur `/api/vehicles` auf. Die geheimen mobile.de-Zugangsdaten gehören ausschließlich serverseitig in den Cloudflare Worker.

Worker-Datei:
`worker/mobile-worker.js`

Benötigte Secrets/Variablen:
- `MOBILE_USER`
- `MOBILE_PASSWORD`
- `MOBILE_CUSTOMER_NUMBER`

Der Worker ruft:
`https://services.mobile.de/search-api/search?customerNumber=...&page.size=100`
mit HTTP Basic Authentication und `Accept: application/vnd.de.mobile.api+json` auf.

## Kostenlos testen
Einfach `index.html` lokal öffnen. Der Fahrzeugbereich zeigt bis zur API-Freischaltung bewusst keine erfundenen Fahrzeuge, sondern einen Hinweis und einen Link zum aktuellen mobile.de-Händlerprofil.

## Hosting
Empfohlen:
- Quellcode: GitHub
- Website: Cloudflare Pages
- API: Cloudflare Worker
- Domain/DNS: die bereits registrierte `as-automobile-bielefeld.de`

Die genauen DNS-Schritte sollten erst durchgeführt werden, wenn die Cloudflare-Pages-Adresse feststeht.
