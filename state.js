export const FOLDER_NAME = "GoGo";
export const FAVICON = "https://www.google.com/s2/favicons?domain={host}&sz=128";
export const PREVIEW_DELAY = 5000;

export const state = {
  gridCols: 6,
  currentChildren: [],
  currentFolderId: null,
  breadcrumb: []
};

export function previewKey(url) {
  return 'preview:' + url;
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