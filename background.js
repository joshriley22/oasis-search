// Background service worker for Oasis Search
// Handles messages from the popup and coordinates extension logic.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Oasis Search installed.");
});

const BACKEND_URL = "https://oasis-backend-production-5111.up.railway.app";

// Maximum number of products to score per scan to keep responses fast.
const MAX_PRODUCTS_TO_SCORE = 10;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SEARCH") {
    const query = typeof message.query === "string" ? message.query.trim() : "";
    if (!query) {
      sendResponse({ message: "Please enter a search term." });
      return true;
    }
    console.log("Received search query:", query);

    fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => sendResponse({ message: data.message ?? "Search completed." }))
      .catch((err) => {
        console.error("Backend request failed:", err);
        sendResponse({ message: "Error contacting backend: " + err.message });
      });
  }

  if (message.type === "SCAN_PRODUCTS") {
    const tabId = message.tabId;
    if (!tabId) {
      sendResponse({ error: "No tab ID provided." });
      return true;
    }

    chrome.tabs.sendMessage(tabId, { type: "GET_PRODUCTS" }, (products) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }

      if (!Array.isArray(products) || products.length === 0) {
        sendResponse({ products: [] });
        return;
      }

      // Score only the first MAX_PRODUCTS_TO_SCORE products to keep responses fast.
      // All detected products are returned so the side panel can display them.
      const toScore = products.slice(0, MAX_PRODUCTS_TO_SCORE);
      const unscored = products.slice(MAX_PRODUCTS_TO_SCORE).map((name) => ({ name, score: null }));

      Promise.all(
        toScore.map((name) =>
          fetch(`${BACKEND_URL}/score?product=${encodeURIComponent(name)}`)
            .then((res) => res.json())
            .then((data) => ({ name, score: typeof data.score === "number" ? data.score : null }))
            .catch((err) => {
              console.error("Score request failed for", name, err);
              return { name, score: null };
            })
        )
      ).then((scored) => sendResponse({ products: [...scored, ...unscored] }));
    });
  }

  // Return true to keep the message channel open for async responses.
  return true;
});
