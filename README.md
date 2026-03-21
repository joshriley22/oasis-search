# Oasis Search

**Make eco-friendly decisions with the help of AI.**

Oasis Search is a Chrome extension that helps users make environmentally conscious choices by providing AI-powered search capabilities and product eco-friendliness scoring directly in the browser.

---

## Features

- **Eco-friendly search** – Search for eco-friendly alternatives via the popup.
- **Product scanner** – Click **🌿 Scan This Page** in the popup to open the side panel and automatically detect products on the current shop page. Each product is sent to the backend, which returns an eco-friendliness score out of 100 displayed with a colour-coded progress bar.

---

## Project Structure

```
oasis-search/
├── manifest.json      # Chrome Extension Manifest V3 configuration
├── popup.html         # Extension popup UI
├── popup.js           # Popup interaction logic
├── sidepanel.html     # Side panel UI (product scanner)
├── sidepanel.js       # Side panel logic
├── background.js      # Background service worker
├── content.js         # Content script (runs in page context, scans for products)
└── icons/
    ├── icon16.png     # 16×16 toolbar icon
    ├── icon48.png     # 48×48 extension management icon
    └── icon128.png    # 128×128 Chrome Web Store icon
```

---

## Loading the Extension (Development)

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select this repository folder.
4. The **Oasis Search** icon will appear in the Chrome toolbar.

---

## Development Notes

- **Manifest version**: 3 (required for new Chrome extensions)
- **Permissions**: `activeTab`, `storage`, `sidePanel`
- **Background**: Service worker (`background.js`)
- **Popup**: `popup.html` + `popup.js`
- **Side panel**: `sidepanel.html` + `sidepanel.js` (Chrome 114+)
- **Content script**: `content.js` (injected on all URLs; scans for product names)

Replace the placeholder icon files in `icons/` with production-quality artwork before publishing to the Chrome Web Store.
