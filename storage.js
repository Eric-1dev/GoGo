import { previewKey } from './state.js';
import { findOrCreateFolder, refreshBookmarks } from './bookmarks.js';
import { toast } from './toast.js';

let exportBtn, importBtn, importFile;
let previews = {};

export function initStorage() {
  exportBtn = document.getElementById('exportBtn');
  importBtn = document.getElementById('importBtn');
  importFile = document.getElementById('importFile');

  exportBtn.addEventListener('click', exportSettings);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (file) importSettings(file);
    importFile.value = '';
  });
}

async function collectTree(node) {
  if (node.url) {
    const item = { url: node.url, title: node.title || '' };
    const preview = await getPreview(node.url);
    if (preview) item.preview = stripDataUrlPrefix(preview);
    return item;
  }
  if (node.children) {
    const children = [];
    for (const child of node.children) {
      children.push(await collectTree(child));
    }
    return { title: node.title || '', children };
  }
  return null;
}

function countBookmarks(node) {
  if (node.url) return 1;
  if (node.children) return node.children.reduce((s, c) => s + countBookmarks(c), 0);
  return 0;
}

async function importNode(node, parentId) {
  if (node.url) {
    const title = typeof node.title === 'string' ? node.title : '';
    await chrome.bookmarks.create({ parentId, title, url: node.url });
    if (typeof node.preview === 'string' && node.preview) {
      previews[previewKey(node.url)] = toDataUrl(node.preview);
    }
  } else if (node.children) {
    const folder = await chrome.bookmarks.create({ parentId, title: node.title || '' });
    for (const child of node.children) {
      await importNode(child, folder.id);
    }
  }
}

function getPreview(url) {
  const key = previewKey(url);
  return new Promise(resolve => chrome.storage.local.get(key, r => resolve(r[key] || '')));
}

function stripDataUrlPrefix(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (dataUrl.startsWith('data:') && comma !== -1) return dataUrl.slice(comma + 1);
  return dataUrl;
}

export async function exportSettings() {
  const folder = await findOrCreateFolder();
  const [tree] = await chrome.bookmarks.getSubTree(folder.id);
  const items = [];
  for (const child of (tree && tree.children) || []) {
    items.push(await collectTree(child));
  }

  const json = JSON.stringify(items, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gogo-settings.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const total = items.reduce((s, c) => s + countBookmarks(c), 0);
  toast('Настройки экспортированы: ' + total + ' закладок');
}

function toDataUrl(base64) {
  if (/^data:/i.test(base64)) return base64;
  const mime = /^\/9j\//.test(base64) ? 'image/jpeg' : 'image/png';
  return 'data:' + mime + ';base64,' + base64;
}

export async function importSettings(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    toast('Некорректный файл — это не JSON', true);
    return;
  }
  if (!Array.isArray(data)) {
    toast('Неверный формат файла: ожидается список закладок', true);
    return;
  }
  if (!data.length) {
    toast('В файле нет закладок', true);
    return;
  }

  const treeFormat = data.some(it => Array.isArray(it.children));
  const total = treeFormat ? data.reduce((s, c) => s + countBookmarks(c), 0) : data.filter(it => it && typeof it.url === 'string').length;
  if (!total) {
    toast('В файле нет закладок', true);
    return;
  }

  const folder = await findOrCreateFolder();

  if (!confirm('Импорт заменит текущее содержимое папки «GoGo» на ' + total + ' закладок из файла. Продолжить?')) return;

  const existing = await chrome.bookmarks.getChildren(folder.id);
  for (const node of existing) {
    await chrome.bookmarks.removeTree(node.id);
  }

  previews = {};
  if (treeFormat) {
    for (const node of data) {
      await importNode(node, folder.id);
    }
  } else {
    for (const it of data) {
      if (it && typeof it.url === 'string') {
        const title = typeof it.title === 'string' ? it.title : '';
        await chrome.bookmarks.create({ parentId: folder.id, title, url: it.url });
        if (typeof it.preview === 'string' && it.preview) {
          previews[previewKey(it.url)] = toDataUrl(it.preview);
        }
      }
    }
  }
  if (Object.keys(previews).length) await chrome.storage.local.set(previews);

  toast('Импорт завершён: ' + total + ' закладок');
  refreshBookmarks();
}
