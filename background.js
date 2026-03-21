// Background service worker for Oasis Search
// Handles messages from the popup and coordinates extension logic.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Oasis Search installed.");
});

const BACKEND_URL = "https://oasis-backend-production-5111.up.railway.app";

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

  // Return true to keep the message channel open for async responses.
  return true;
});
