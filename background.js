// Background service worker for Oasis Search
// Handles messages from the popup and coordinates extension logic.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Oasis Search installed.");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SEARCH") {
    const query = message.query;
    console.log("Received search query:", query);

    // TODO: Integrate AI/eco-friendly search API here.
    // For now, acknowledge the query.
    sendResponse({ message: `Searching for "${query}"…` });
  }

  // Return true to keep the message channel open for async responses.
  return true;
});
