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
          !seen.has(name)
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
