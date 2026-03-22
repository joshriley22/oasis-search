// Content script for Oasis Search
// Runs in the context of web pages and can interact with page content.

(function () {
  "use strict";

  // Selectors for product names across common e-commerce sites and generic shops.
  // Specific main-product selectors are listed first so the primary item on a
  // product page is always detected before generic/related-product selectors fill
  // the MAX_PRODUCTS_TO_SCORE quota and push the main product into the unscored bucket.
  const PRODUCT_SELECTORS = [
    // Amazon – main product page title (must come first)
    "#productTitle",
    // Walmart – main product page title and listing-page cards (must come first)
    '[data-automation-id="product-title"]',
    // Amazon – search/listing page results; fallback covers future markup changes
    '[data-component-type="s-search-result"] h2 a span',
    '[data-component-type="s-search-result"] h2 span',
    // Generic product page h1 headings
    'h1[itemprop="name"]',
    'h1[class*="product"]',
    'h1[class*="title"]',
    // eBay
    '[class*="item-title"]',
    // Etsy, Shopify, and other platforms
    '[data-testid*="product-title"]',
    '[data-testid*="product-name"]',
    // Schema.org structured data (intentionally after specific selectors so
    // related/sponsored products don't displace the main product)
    '[itemtype*="Product"] [itemprop="name"]',
    '[itemtype*="product"] [itemprop="name"]',
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
  // 500 chars to accommodate long Amazon product titles that routinely exceed 200 chars.
  const MAX_PRODUCT_NAME_LENGTH = 500;

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

  // Extract the product name from the page <title> tag on Amazon and Walmart, where
  // the title reliably contains the product name separated from the site name.
  // Amazon format: "Product Name : Amazon.com" or "Product Name - Amazon.com"
  //                or "Amazon.com : Product Name"
  // Walmart format: "Product Name - Walmart.com" or "Product Name | Walmart.com"
  function getProductFromPageTitle() {
    const hostname = window.location.hostname;
    let title = document.title.trim();
    if (!title) return null;

    if (/amazon\./i.test(hostname)) {
      // Strip " : Amazon..." or " - Amazon..." suffix, or "Amazon... : " prefix
      title = title
        .replace(/\s*[:-]\s*amazon[\w.]*\s*$/i, "")
        .replace(/^amazon[\w.]*\s*:\s*/i, "")
        .trim();
    } else if (/walmart\./i.test(hostname)) {
      // Strip " - Walmart..." or " | Walmart..." suffix
      title = title.replace(/\s*[-|]\s*walmart[\w.]*\s*$/i, "").trim();
    } else {
      return null;
    }

    // Return null if stripping the site name left nothing (e.g. title was only "Amazon.com").
    return title || null;
  }

  // Scan the current page and return an array of unique product names.
  function scanProducts() {
    const seen = new Set();
    const products = [];

    // On Amazon and Walmart the page <title> reliably encodes the product name;
    // check it first so the main product always leads the results.
    const titleProduct = getProductFromPageTitle();
    if (
      titleProduct &&
      titleProduct.length >= MIN_PRODUCT_NAME_LENGTH &&
      titleProduct.length <= MAX_PRODUCT_NAME_LENGTH &&
      !isPromotion(titleProduct)
    ) {
      seen.add(titleProduct);
      products.push(titleProduct);
    }

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
