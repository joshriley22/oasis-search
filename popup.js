document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const scanBtn = document.getElementById("scan-btn");
  const result = document.getElementById("result");

  // Restore last query from storage
  chrome.storage.local.get("lastQuery", ({ lastQuery }) => {
    if (lastQuery) {
      searchInput.value = lastQuery;
    }
  });

  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      result.textContent = "Please enter a search term.";
      return;
    }

    // Persist the query
    chrome.storage.local.set({ lastQuery: query });

    // Send the query to the background service worker
    chrome.runtime.sendMessage({ type: "SEARCH", query }, (response) => {
      if (chrome.runtime.lastError) {
        result.textContent = "Error: " + chrome.runtime.lastError.message;
        return;
      }
      result.textContent = response?.message ?? "Search sent!";
    });
  }

  function handleScan() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab) return;
      chrome.sidePanel.open({ windowId: tab.windowId });
      window.close();
    });
  }

  searchBtn.addEventListener("click", handleSearch);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  scanBtn.addEventListener("click", handleScan);
});
