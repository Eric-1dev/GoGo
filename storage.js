import { previewKey } from './state.js';
import { findFolder, refreshBookmarks } from './bookmarks.js';
import { toast } from './toast.js';

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

exportBtn.addEventListener('click', exportSettings);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', () => {
  const file = importFile.files[0];
  if (file) importSettings(file);
  importFile.value = '';
});

async function collectItems(node, items) {
  if (node.url) {
    const item = { url: node.url, title: node.title || '' };
    const preview = await getPreview(node.url);
    if (preview) item.preview = stripDataUrlPrefix(preview);
    items.push(item);
  } else if (node.children) {
    for (const child of node.children) {
      await collectItems(child, items);
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
  const folder = await findFolder();
  if (!folder) {
    toast('Папка «GoGo» не найдена', true);
    return;
  }
  const [tree] = await chrome.bookmarks.getSubTree(folder.id);
  const items = [];
  for (const child of (tree && tree.children) || []) {
    await collectItems(child, items);
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
  toast('Настройки экспортированы: ' + items.length + ' закладок');
}

function removeNode(id) {
  return new Promise(resolve => chrome.bookmarks.remove(id, resolve));
}

function createBookmark(parentId, title, url) {
  return new Promise(resolve => chrome.bookmarks.create({ parentId, title, url }, resolve));
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

  const items = data.filter(it => it && typeof it.url === 'string');
  if (!items.length) {
    toast('В файле нет закладок', true);
    return;
  }
  const folder = await findFolder();
  if (!folder) {
    toast('Папка «GoGo» не найдена', true);
    return;
  }

  if (!confirm('Импорт заменит текущее содержимое папки «GoGo» на ' + items.length + ' закладок из файла. Продолжить?')) return;

  const existing = await chrome.bookmarks.getChildren(folder.id);
  for (const node of existing) {
    await removeNode(node.id);
  }

  const previews = {};
  for (const it of items) {
    const title = typeof it.title === 'string' ? it.title : '';
    await createBookmark(folder.id, title, it.url);
    if (typeof it.preview === 'string' && it.preview) {
      previews[previewKey(it.url)] = toDataUrl(it.preview);
    }
  }
  await chrome.storage.local.set(previews);

  toast('Импорт завершён: ' + items.length + ' закладок');
  refreshBookmarks();
}