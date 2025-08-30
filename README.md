# Auto Browser Cleaner

**Auto Browser Cleaner** is a lightweight Chrome/Firefox extension that automatically clears your browsing data on a schedule (default: every four days) and also provides a one-click manual “Clean Now” button.

---

## Features

- **Automatic Cleaning**
  Clears history, cache, cookies & download history automatically on a configurable schedule (default: every four days).

- **Manual Cleaning**  
  Click the toolbar icon → **Clean Now** to clear data on demand.  

- **Zero Configuration**  
  Works out of the box—no settings required. You can optionally adjust the interval under Settings.  

- **Customizable**
  Adjust the cleanup interval via the built-in Options page, or tweak data types in `background.js` and shared constants in `constants.js`.
- **Security First**
  Built with a strict Content Security Policy to block remote code execution.
- **Friendly Status**
  Popup displays last and next cleanup using human-friendly relative time.

---

## Getting Started

### Prerequisites

- Google Chrome/Chromium (v88+ recommended)
- Mozilla Firefox (v115+)

### Installation (Chrome/Chromium)

1. Clone or download this repository:

   ```bash
   git clone https://github.com/zerox80/Auto-Browser-Cleaner.git
   ```

2. Open Chrome and navigate to:

   ```
   chrome://extensions
   ```

3. Enable **Developer mode** (toggle in the top right).

4. Click **Load unpacked**, then select the project’s root folder.

5. The Auto Browser Cleaner icon should now appear in your toolbar.

### Installation (Firefox on Linux/Windows/macOS)

1. Open Firefox and navigate to:

   ```
   about:debugging#/runtime/this-firefox
   ```

2. Click "Load Temporary Add-on" and select the project's `manifest.json`.
3. The extension will load temporarily (until you restart Firefox). For permanent install, package and sign the add-on using `web-ext`.

Optional dev workflow with `web-ext`:

```bash
npm i -g web-ext
web-ext run --verbose --source-dir .
```

---

## Usage

- **Automatic:**
  The extension runs in the background on the chosen interval (default: every four days) and clears your data.

- **Manual:**  
  Click the extension icon → click **Clean Now** in the popup.

---

## Configuration

To adjust what gets cleared or change the schedule:

1. Set the interval in the extension’s Options page (`options.html` or via the extension menu → Options). Intervals can be specified in minutes, hours or days. Changes apply immediately and alarms are rescheduled automatically.
2. Open `background.js` to change the data types being removed.

### Cross-Browser notes

- The extension uses Manifest V3 with a background service worker (`background.js`).
- A Firefox-specific section is included in `manifest.json` under `browser_specific_settings.gecko` (an ID is required to load temporary add-ons).
- Data removal uses a robust fallback strategy per category for better Chrome/Firefox compatibility.
 - Options page is registered via `manifest.json` → `options_page` and stores `intervalMinutes` in `chrome.storage.local`.

---

## File Structure

```
Auto-Browser-Cleaner/
├── icon16.png        # 16×16 toolbar icon
├── icon48.png        # 48×48 toolbar icon
├── icon128.png       # 128×128 Chrome Web Store icon
├── icon.svg          # Source vector icon
├── manifest.json     # Extension metadata & permissions
├── background.js     # Clears browsing data on startup
├── constants.js      # Shared constants (cleanup interval)
├── popup.html        # Manual clean UI
├── popup.js          # Popup logic (“Clean Now” handler)
└── LICENSE           # MIT License
```

---

## Development

1. Clone the repo and load as unpacked in Developer Mode (see above).
2. Make your changes to the source files.
3. Reload the extension on `chrome://extensions`.

---

## Changelog

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
