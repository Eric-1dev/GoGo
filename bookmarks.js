import { state, FOLDER_NAME } from './state.js';
import { toast } from './toast.js';

let renderCallback = null;

export function setRenderCallback(fn) {
  renderCallback = fn;
}

export async function findFolder() {
  const [root] = await chrome.bookmarks.getTree();
  return searchIn(root);
}

export async function findOrCreateFolder() {
  const folder = await findFolder();
  if (folder) return folder;
  const [root] = await chrome.bookmarks.getTree();
  const parentId = (root.children && root.children[0] && root.children[0].id) || root.id;
  return chrome.bookmarks.create({ parentId, title: FOLDER_NAME });
}

function searchIn(node) {
  if (!node.children) return null;
  for (const child of node.children) {
    if (child.title === FOLDER_NAME && !child.url) return child;
    const found = searchIn(child);
    if (found) return found;
  }
  return null;
}

export async function refreshBookmarks() {
  let root;
  try {
    root = await findFolder();
  } catch { return; }
  if (!root) return;

  if (!state.breadcrumb.length) {
    state.breadcrumb = [{ id: root.id, title: root.title || FOLDER_NAME }];
  }

  const targetId = state.currentFolderId || root.id;
  let tree = null;
  try {
    tree = await chrome.bookmarks.getSubTree(targetId);
    tree = tree[0];
  } catch {
    tree = null;
  }

  if (!tree || tree.url) {
    state.breadcrumb = [{ id: root.id, title: root.title || FOLDER_NAME }];
    try {
      const rootTree = await chrome.bookmarks.getSubTree(root.id);
      tree = rootTree[0];
    } catch { return; }
    if (!tree) return;
  }

  state.currentFolderId = tree.id;
  state.currentChildren = tree.children || [];
  if (renderCallback) renderCallback();
}

export function openFolder(node) {
  state.breadcrumb.push({ id: node.id, title: node.title });
  navigateTo(node.id);
}

export function navigateToCrumb(index) {
  state.breadcrumb = state.breadcrumb.slice(0, index + 1);
  navigateTo(state.breadcrumb[index].id);
}

async function navigateTo(folderId) {
  let tree;
  try {
    const result = await chrome.bookmarks.getSubTree(folderId);
    tree = result[0];
  } catch { return; }
  if (!tree || tree.url) return;
  state.currentFolderId = tree.id;
  state.currentChildren = tree.children || [];
  if (renderCallback) renderCallback();
}

export function childrenOf(parentId) {
  if (parentId === state.currentFolderId) return state.currentChildren;
  const walk = nodes => {
    for (const n of nodes) {
      if (n.id === parentId) return n.children || [];
      if (n.children) {
        const found = walk(n.children);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(state.currentChildren) || [];
}

export async function doMove(id, parentId, index) {
  const arr = childrenOf(parentId);
  const oldIdx = arr.findIndex(n => n.id === id);
  if (oldIdx >= 0 && oldIdx < index) index += 1;
  try {
    await chrome.bookmarks.move(id, { parentId, index });
  } catch (err) {
    toast(err.message, true);
    return;
  }
  refreshBookmarks();
}

function subtreeHas(ancestorId, id) {
  if (ancestorId === id) return true;
  const walk = nodes => nodes.some(n => n.id === id || (n.children && walk(n.children)));
  return walk(childrenOf(ancestorId));
}

export async function moveToFolder(nodeId, parentId, afterId, label) {
  let kids;
  try {
    kids = await chrome.bookmarks.getChildren(parentId);
  } catch (err) {
    toast(err.message, true);
    return;
  }
  let idx = kids.findIndex(n => n.id === afterId);
  idx = idx < 0 ? kids.length : idx + 1;
  await doMove(nodeId, parentId, idx);
  if (label) toast('Перемещено в «' + label + '»');
}

export async function dropIntoFolder(nodeId, folderId) {
  if (!nodeId || !folderId || nodeId === folderId) return;
  if (subtreeHas(nodeId, folderId)) {
    toast('Нельзя переместить папку внутрь самой себя', true);
    return;
  }
  await doMove(nodeId, folderId, childrenOf(folderId).length);
}

export async function deleteBookmark(tile) {
  const id = tile.dataset.id;
  if (!id) return;
  if (!confirm('Удалить закладку «' + tile.textContent.trim() + '»?')) return;
  try {
    await chrome.bookmarks.remove(id);
    tile.remove();
  } catch (err) {
    console.error(err.message);
  }
}

function countDeep(id) {
  return childrenOf(id).reduce((sum, n) => sum + (n.url ? 1 : countDeep(n.id)), 0);
}

export async function disbandFolder(tileEl) {
  const id = tileEl.dataset.id;
  const parentId = tileEl.dataset.parent;
  if (!id || !parentId) return;
  const name = tileEl.dataset.title || 'папку';
  if (!confirm('Распустить папку «' + name + '»? Содержимое переедет на уровень выше.')) return;
  const kids = childrenOf(id);
  if (!kids.length) {
    try { await chrome.bookmarks.remove(id); } catch (err) { toast(err.message, true); return; }
    refreshBookmarks();
    return;
  }
  try {
    await Promise.all(kids.map(n => chrome.bookmarks.move(n.id, { parentId })));
    await chrome.bookmarks.remove(id);
  } catch (err) {
    toast(err.message, true);
    return;
  }
  refreshBookmarks();
}

export async function deleteFolder(tileEl, full) {
  const id = tileEl.dataset.id;
  if (!id) return;
  const name = tileEl.dataset.title || 'папка';
  if (full) {
    const count = countDeep(id);
    if (!confirm('Удалить папку «' + name + '» и всё её содержимое (' + count + ' шт.)?')) return;
    try { await chrome.bookmarks.removeTree(id); } catch (err) { toast(err.message, true); return; }
  } else {
    if (!confirm('Удалить папку «' + name + '»?')) return;
    try { await chrome.bookmarks.remove(id); } catch (err) { toast(err.message, true); return; }
  }
  refreshBookmarks();
}
