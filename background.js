chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('goGoBg', result => {
    if (!result.goGoBg) {
      chrome.storage.local.set({ goGoBg: 'gradient' });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getBg') {
    chrome.storage.local.get('goGoBg').then(result => {
      sendResponse({ bg: result.goGoBg });
    });
    return true;
  }
  if (message.action === 'setBg') {
    chrome.storage.local.set({ goGoBg: message.bg }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
