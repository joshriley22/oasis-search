// Content script for Oasis Search
// Runs in the context of web pages and can interact with page content.

(function () {
  "use strict";

  // Selectors for product names across common e-commerce sites and generic shops.
  const PRODUCT_SELECTORS = [
    // Schema.org structured data
    '[itemtype*="Product"] [itemprop="name"]',
    '[itemtype*="product"] [itemprop="name"]',
    // Amazon
    "#productTitle",
    // eBay
    '[class*="item-title"]',
    // Etsy, Shopify, and other platforms
    '[data-testid*="product-title"]',
    '[data-testid*="product-name"]',
    // Generic product page headings
    'h1[class*="product"]',
    'h1[class*="title"]',
    // Common CSS class conventions
    ".product-title",
    ".product-name",
    ".product__title",
    ".product__name",
    '[class*="product-title"]',
    '[class*="product-name"]',
    // Product cards in listing pages
    '.product-card h2',
    '.product-card h3',
    '[class*="product-card"] h2',
    '[class*="product-card"] h3',
  ];

  const MIN_PRODUCT_NAME_LENGTH = 3;
  const MAX_PRODUCT_NAME_LENGTH = 200;

  // Patterns that identify promotional text rather than product names.
  const PROMOTION_PATTERNS = [
    // Percentage discounts: "10% off", "Save 20%", "50% discount"
    /\d+\s*%\s*(off|discount|sale|savings?)/i,
    /save\s+\d+\s*%/i,
    // Dollar/currency amount discounts: "Save $10", "$5 off", "£3 off"
    /save\s+[\$£€¥]\s*\d/i,
    /[\$£€¥]\s*\d+(\.\d+)?\s+off/i,
    // Buy-X-get-Y promotions: "Buy 2 get 1 free", "BOGO"
    /buy\s+\d+\s*,?\s*get\s+\d+/i,
    /\bbogo\b/i,
    // Free shipping / free delivery
    /free\s+(shipping|delivery)/i,
    // Sale / clearance / deal labels
    /\b(on\s+)?sale\b/i,
    /\bclearance\b/i,
    /\b(hot|best|great|daily|flash|today.?s?)\s+deals?\b/i,
    /\bdeals?\s+of\s+the\b/i,
    /\bspecial\s+offer\b/i,
    /\blimited[\s-]time\b/i,
    /\btoday\s+only\b/i,
    /\bflash\s+sale\b/i,
    /\bpromo(tion)?\b/i,
    /\bcoupon\b/i,
  ];

  // Returns true if the given name looks like a promotional label rather than a product.
  function isPromotion(name) {
    return PROMOTION_PATTERNS.some((pattern) => pattern.test(name));
  }

  // Scan the current page and return an array of unique product names.
  function scanProducts() {
    const seen = new Set();
    const products = [];

    for (const selector of PRODUCT_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => {
        const name = el.textContent.trim();
        if (
          name.length >= MIN_PRODUCT_NAME_LENGTH &&
          name.length <= MAX_PRODUCT_NAME_LENGTH &&
          !seen.has(name) &&
          !isPromotion(name)
        ) {
          seen.add(name);
          products.push(name);
        }
      });
    }

    return products;
  }

  // Listen for messages from the background service worker or popup.
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_INFO") {
      sendResponse({
        title: document.title,
        url: window.location.href,
      });
    }

    if (message.type === "GET_PRODUCTS") {
      sendResponse(scanProducts());
    }

    return true;
  });
})();
