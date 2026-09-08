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


## Design v4
- Opel-Logo bleibt oben links im dunklen Header.
- Das originale AS-Automobile-Logo wurde NICHT verändert.
- Das AS-Logo im Hero ist kleiner und weiter links positioniert.
- Dadurch bleibt die echte Beschriftung „AS Automobile“ auf dem Hintergrundfoto besser sichtbar.
- Das Fahrzeugmotiv im AS-Logo wird nicht gequetscht; das Seitenverhältnis bleibt unverändert.

## Design v5
- „Opel Vertragspartner“ wurde in „Opel Servicepartner“ geändert.
- Hero-Claim: „Seit 1998 · Persönlich. Verlässlich. Für Sie da.“
- Unter dem unveränderten AS-Logo: „Ihr Opel Servicepartner in Bielefeld“.
- Die vom Nutzer bereitgestellte Auto Bild / Statista 2024 Grafik (Note 1,8) wurde unverändert als eigener Auszeichnungsbereich weiter unten auf der Seite eingebaut.


## Finale Hero-Anpassung
- Grundlage ist wieder die vorherige v5-Variante.
- Gelber Text „SEIT 1998 · PERSÖNLICH. VERLÄSSLICH. FÜR SIE DA.“ deutlich größer.
- Zusatztext „Persönliche Beratung, starke Fahrzeuge …“ entfernt.
- „Ihr Opel Servicepartner in Bielefeld“ und die Buttons beginnen bündig an derselben linken Kante.

## Team-Karikaturen in den bestehenden Kontaktkarten
Die finale Website-Struktur bleibt unverändert. Nur die bisherigen Initialen-Avatare wurden durch die freigegebenen Karikatur-Porträts ersetzt. Namen, Funktionen, Telefonnummern und E-Mail-Links bleiben echte anklickbare HTML-Elemente.

## Team-Porträts v2
- Porträts neu zugeschnitten, damit deutlich mehr Oberkörper sichtbar ist.
- Eingebrannte Überschriften/Schrift aus der ursprünglichen Teamgrafik sind nicht mehr im sichtbaren Bildbereich.
- Die bestehenden Kontaktkarten, Telefonnummern und E-Mail-Links bleiben unverändert anklickbar.

## Team-Klickversion
- Team-Bereich optisch wie die gewünschte Referenz mit sieben einzelnen Karten.
- Vollständige Namen statt nur Vornamen.
- Telefonnummer und E-Mail erscheinen erst nach Klick auf den Namen.
- Telefonnummern und E-Mail-Adressen bleiben direkt anklickbar.
