export const FOLDER_NAME = "GoGo";
export const FAVICON = "https://www.google.com/s2/favicons?domain={host}&sz=128";
export const PREVIEW_DELAY = 5000;
export const PLACEHOLDER = chrome.runtime.getURL('icons/placeholder.svg');
export const SCREENSHOT_DELAY_KEY = 'screenshotDelay';

export const state = {
  gridCols: 6,
  currentChildren: [],
  currentFolderId: null,
  breadcrumb: []
};

export function previewKey(url) {
  return 'preview:' + url;
}

export function faviconKey(url) {
  return 'favicon:' + url;
}

export function favicon(url) {
  try {
    return FAVICON.replace('{host}', new URL(url).hostname);
  } catch {
    return '';
  }
}

export function host(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function fetchFavicon(url) {
  const src = favicon(url);
  if (!src) return null;
  try {
    const resp = await fetch(src);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    if (!blob.type.startsWith('image/')) return null;
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}