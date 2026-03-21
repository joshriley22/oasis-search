// Content script for Oasis Search
// Runs in the context of web pages and can interact with page content.

(function () {
  "use strict";

  // Listen for messages from the background service worker or popup.
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_INFO") {
      sendResponse({
        title: document.title,
        url: window.location.href,
      });
    }
    return true;
  });
})();
