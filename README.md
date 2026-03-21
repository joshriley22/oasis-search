# Oasis Search

**Make eco-friendly decisions with the help of AI.**

Oasis Search is a Chrome extension that helps users make environmentally conscious choices by providing AI-powered search capabilities directly in the browser.

---

## Project Structure

```
oasis-search/
├── manifest.json      # Chrome Extension Manifest V3 configuration
├── popup.html         # Extension popup UI
├── popup.js           # Popup interaction logic
├── background.js      # Background service worker
├── content.js         # Content script (runs in page context)
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
- **Permissions**: `activeTab`, `storage`
- **Background**: Service worker (`background.js`)
- **Popup**: `popup.html` + `popup.js`
- **Content script**: `content.js` (injected on all URLs)

Replace the placeholder icon files in `icons/` with production-quality artwork before publishing to the Chrome Web Store.
