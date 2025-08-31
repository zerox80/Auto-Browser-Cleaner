# Auto Browser Cleaner

Ein schlankes Browser-Add-on für Chrome/Chromium und Firefox, das Browserdaten automatisch in frei wählbaren Intervallen löscht (Standard: alle 4 Tage) und zusätzlich einen Button für die manuelle Sofort-Löschung bietet.

—

## Funktionen

- Automatische Bereinigung: Entfernt Verlauf, Cache, Cookies, Download-Verlauf u. a. in einem konfigurierbaren Intervall.
- Manuelle Bereinigung: Im Popup auf „Jetzt löschen“ klicken, um sofort alles zu bereinigen.
- Sofort einsatzbereit: Funktioniert ohne Konfiguration. Optional kann das Intervall in den Einstellungen angepasst werden.
- Anpassbar: Intervall über die Options-Seite, Datenarten technisch in `background.js`/`constants.js`.
- Sicherheit: Strenge Content Security Policy; keine Remote-Skripte, keine externen Anfragen.
- Statusanzeige: Popup zeigt letzte, nächste Bereinigung und Zähler an.

—

## Installation

Voraussetzungen

- Chrome/Chromium ab v88
- Firefox ab v115

Chrome/Chromium (Entwicklermodus)

1. Repository klonen oder herunterladen:
   
   ```bash
   git clone https://github.com/zerox80/Auto-Browser-Cleaner.git
   ```
2. `chrome://extensions` öffnen
3. Entwicklermodus aktivieren (oben rechts)
4. „Entpackte Erweiterung laden“ wählen und den Projektordner auswählen

Firefox (temporär laden)

1. `about:debugging#/runtime/this-firefox` öffnen
2. „Temporäres Add-on laden“ wählen und `manifest.json` auswählen
3. Für eine dauerhafte Installation bitte mit `web-ext` bauen/signieren

Optional: Entwicklungs-Workflow mit `web-ext`

```bash
npm i -g web-ext
web-ext run --verbose --source-dir .
```

—

## Verwendung

- Automatisch: Die Bereinigung läuft im Hintergrund in dem eingestellten Intervall (Standard: 4 Tage).
- Manuell: Erweiterungs-Icon anklicken → im Popup auf „Jetzt löschen“ klicken.

—

## Einstellungen & Anpassungen

Intervall ändern

1. Options-Seite öffnen (Rechtsklick auf das Icon → „Optionen“ oder `options.html`).
2. Intervall in Minuten/Stunden/Tagen wählen und speichern. Änderungen greifen sofort; Alarme werden automatisch neu geplant.

Welche Daten werden gelöscht?

- Per Standard werden u. a. Cache, Cookies, Verlauf, Formulardaten, Downloads, IndexedDB, LocalStorage, Service Worker gelöscht. Die genaue Zusammenstellung ist in `background.js` hinterlegt (Fallback je Kategorie für bessere Cross-Browser-Kompatibilität).

Technische Hinweise

- Manifest V3 mit Service Worker (`background.js`).
- Firefox-spezifische Einstellungen unter `browser_specific_settings.gecko` in `manifest.json` (ID erforderlich).
- Gemeinsame Konstanten in `constants.js` (z. B. `DEFAULT_INTERVAL_MINUTES`, Grenzen `MIN_…`/`MAX_…`).

—

## Berechtigungen (Erklärung)

- `browsingData`: Zum Löschen von Cache, Cookies, Verlauf usw.
- `storage`: Zum lokalen Speichern von Einstellungen und Status (Intervall, letzter Lauf, Zähler).
- `alarms`: Zum Planen der automatischen Bereinigung.

Hinweis: Es werden keine Host-Berechtigungen (Website-Zugriffe) angefordert.

—

## Datenschutz

Diese Erweiterung verarbeitet Ihre Daten ausschließlich lokal im Browser. Es werden keine personenbezogenen Daten an Server übertragen oder mit Dritten geteilt. Details siehe [Datenschutz](./Datenschutz.md).

Gespeicherte lokale Daten

- `intervalMinutes`: Ihr gewähltes Intervall in Minuten
- `lastCleanTime`: Zeitstempel der letzten Bereinigung
- `cleanCount`: Anzahl der durchgeführten Bereinigungen

—

## Kompatibilität & Grenzen

- Chrome/Chromium und Firefox werden unterstützt. Je nach Browser-Version können einzelne Löschkategorien unterschiedlich verfügbar sein; es existiert ein Fallback je Kategorie.
- Bei sehr kurzen Intervallen (unter 15 Minuten) wird das Minimum technisch auf 15 Minuten geklammert.

—

## Fehlerbehebung

- „Nichts passiert im Popup“: Prüfen, ob im Browser unter Einstellungen → „Datenschutz & Sicherheit“ Berechtigungen für Erweiterungen eingeschränkt sind.
- „Letzter/Nächster Lauf = unbekannt“: Wird nach der ersten erfolgreichen Bereinigung gesetzt.
- „In Firefox beim Neustart weg“: Temporäre Add-ons werden beim Browserneustart entfernt; bitte mit `web-ext` signieren/installieren.

—

## Entwicklung

1. Als entpackte Erweiterung laden (siehe Installation oben)
2. Quellcode ändern
3. Auf `chrome://extensions` neu laden bzw. `web-ext` verwenden

Projektstruktur

```
Auto-Browser-Cleaner/
├── icon16.png
├── icon48.png
├── icon128.png
├── icon.svg
├── manifest.json
├── background.js
├── constants.js
├── popup.html
├── popup.js
├── options.html
├── options.js
└── LICENSE
```

—

## Lizenz & Kontakt

- Lizenz: MIT (siehe `LICENSE`)
- Autor: zerox80
- Kontakt: rujbin@proton.me

—

## Änderungsverlauf

### 1.2
- Clamp interval to safe bounds (min 15 minutes, max 365 days).
- Align alarm scheduling to the intended cadence using `when` + `periodInMinutes` to avoid drift.
- Popup prefers the actual alarm’s scheduled time for “Nächste Löschung”, with a computed fallback.
- Options page clamps values and shows feedback when the value was adjusted.
- Minor logging improvements.

---

## Contributing

Contributions, issues & feature requests are welcome!  
Please open a GitHub issue or submit a pull request.

---

## License

This project is MIT-licensed. See the [LICENSE](./LICENSE) file for details.
