# Auto Browser Cleaner

**Auto Browser Cleaner** is a lightweight Chrome extension that automatically clears your browsing data every four days and also provides a one-click manual “Clean Now” button.

---

## Features

- **Automatic Cleaning**
  Clears history, cache, cookies & download history automatically every four days.

- **Manual Cleaning**  
  Click the toolbar icon → **Clean Now** to clear data on demand.  

- **Zero Configuration**  
  Works out of the box—no settings required.  

- **Customizable**
  Easily tweak which data types to clear and adjust the cleanup interval in `background.js` and `constants.js`.
- **Security First**
  Built with a strict Content Security Policy to block remote code execution.
- **Friendly Status**
  Popup displays last and next cleanup using human-friendly relative time.

---

## Getting Started

### Prerequisites

- Google Chrome (v57+)

### Installation

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

---

## Usage

- **Automatic:**
  The extension runs in the background every four days and clears your data.

- **Manual:**  
  Click the extension icon → click **Clean Now** in the popup.

---

## Configuration

To adjust what gets cleared or change the time window:

1. Open `constants.js` to modify the cleaning interval. The same value is used
   by both `background.js` and `popup.js`.
2. Open `background.js` to change the data types being removed.

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

## Contributing

Contributions, issues & feature requests are welcome!  
Please open a GitHub issue or submit a pull request.

---

## License

This project is MIT-licensed. See the [LICENSE](./LICENSE) file for details.
