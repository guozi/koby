// Background service worker
// Handles context menu for quick-save to Koby

// Context menu must be created on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-koby',
    title: 'Save to Koby',
    contexts: ['page', 'link'],
  });
});

// Event listener must be registered at top level (Manifest V3 requirement)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'save-to-koby') return;

  const url = info.linkUrl || info.pageUrl;
  const title = tab.title || url;
  const favicon = tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;

  // Store pending bookmark so the popup can pick it up
  await chrome.storage.local.set({
    pendingBookmark: { url, title, favicon },
  });

  // Open popup as a standalone window for user to edit and confirm
  const popupURL = chrome.runtime.getURL('popup/popup.html');
  chrome.windows.create({
    url: popupURL,
    type: 'popup',
    width: 400,
    height: 520,
  });
});
