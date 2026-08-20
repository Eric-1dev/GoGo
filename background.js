chrome.runtime.onInstalled.addListener(() => {
  // Инициализация хранилища
  chrome.storage.local.set({ goGoBg: 'gradient' });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getBg') {
    chrome.storage.local.get('goGoBg', result => {
      sendResponse({ bg: result.goGoBg });
    });
    return true;
  }
  if (message.action === 'setBg') {
    chrome.storage.local.set({ goGoBg: message.bg }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});