// Side panel script for Oasis Search
// Scans the active tab for products and displays their eco-friendly scores.

const statusEl = document.getElementById("status");
const productListEl = document.getElementById("product-list");
const rescanBtn = document.getElementById("rescan-btn");

// Determine the CSS class for a score value.
function scoreClass(score) {
  if (score === null || score === undefined) return "score-unknown";
  if (score >= 67) return "score-high";
  if (score >= 34) return "score-mid";
  return "score-low";
}

// Render the product cards into the list element.
function renderProducts(products) {
  productListEl.innerHTML = "";

  if (!products || products.length === 0) {
    productListEl.innerHTML =
      '<p class="empty-msg">No products found on this page.</p>';
    statusEl.textContent = "No products detected.";
    return;
  }

  const ratedProducts = products.filter(
    ({ score }) => score !== null && score !== undefined
  );

  if (ratedProducts.length === 0) {
    productListEl.innerHTML =
      '<p class="empty-msg">No rated products found on this page.</p>';
    statusEl.textContent = "No rated products detected.";
    return;
  }

  statusEl.textContent = `Found ${ratedProducts.length} rated product${ratedProducts.length === 1 ? "" : "s"}.`;

  ratedProducts.forEach(({ name, score, analysis, link }) => {
    const cls = scoreClass(score);

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <p class="product-name">${escapeHtml(name)}</p>
      <div class="score-row ${cls}">
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width:${score}%"></div>
        </div>
        <span class="score-label">${score}/100</span>
      </div>${analysis ? `<p class="analysis">${escapeHtml(analysis)}</p>` : ""}${safeEcoLink(link)}`;
    productListEl.appendChild(card);
  });
}

// Escape HTML special characters to prevent XSS when inserting product names.
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Return an anchor element string for an eco-friendly alternative link,
// or an empty string if the URL is missing or not a safe http(s) URL.
function safeEcoLink(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
  } catch {
    return "";
  }
  const safeUrl = escapeHtml(url);
  return `<p class="eco-link">Eco-friendly alternative:<br><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></p>`;
}

// Scan the active tab for products and fetch their scores from the backend.
function scanProducts() {
  statusEl.textContent = "Scanning page for products…";
  productListEl.innerHTML = "";
  rescanBtn.disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) {
      statusEl.textContent =
        "Could not find the active tab. Please ensure a tab is open and try again.";
      rescanBtn.disabled = false;
      return;
    }

    chrome.runtime.sendMessage(
      { type: "SCAN_PRODUCTS", tabId: tab.id },
      (response) => {
        rescanBtn.disabled = false;

        if (chrome.runtime.lastError) {
          statusEl.textContent =
            "Error: " + chrome.runtime.lastError.message;
          return;
        }

        if (response && response.error) {
          statusEl.textContent = "Error: " + response.error;
          return;
        }

        renderProducts(response ? response.products : []);
      }
    );
  });
}

rescanBtn.addEventListener("click", scanProducts);

// Open eco-friendly alternative links in a new tab via the Chrome API,
// since plain anchor navigation does not work inside extension side panels.
productListEl.addEventListener("click", (e) => {
  const anchor = e.target.closest(".eco-link a");
  if (anchor) {
    e.preventDefault();
    chrome.tabs.create({ url: anchor.href });
  }
});

// Auto-scan when the side panel is opened.
scanProducts();
