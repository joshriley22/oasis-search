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

## Backend API

The extension communicates with `https://oasis-backend-production-5111.up.railway.app` via two endpoints:

### `GET /search?q=<query>`

Used by the popup when the user submits a search term.

| Direction | Data |
|-----------|------|
| **Sent** | `q` query parameter — the URL-encoded search string entered by the user |
| **Received** | JSON object `{ "message": string }` — a text response to display in the popup |

### `GET /score?product=<name>`

Used by the side panel for each detected product name.

| Direction | Data |
|-----------|------|
| **Sent** | `product` query parameter — the URL-encoded product name scraped from the page |
| **Received** | JSON object `{ "score": number }` — an eco-friendliness score from 1 to 100 |

The score is displayed alongside the product in the side panel as a colour-coded progress bar (green ≥ 67, amber 34–66, red < 34). If the backend call fails or returns a non-numeric score, the product is shown with no score ("N/A").

> **Debugging:** All backend requests and responses are logged to the browser console from the background service worker (`background.js`). Open `chrome://extensions`, click **service worker** under Oasis Search, and observe the DevTools console to see exactly what is sent and received.

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
