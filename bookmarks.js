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

function searchIn(node) {
  if (!node.children) return null;
  for (const child of node.children) {
    if (child.title === FOLDER_NAME && !child.url) return child;
    const found = searchIn(child);
    if (found) return found;
  }
  return null;
}

async function loadTree(folderId) {
  const [tree] = await chrome.bookmarks.getSubTree(folderId);
  return tree;
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

  let tree = null;
  const targetId = state.currentFolderId || root.id;
  try { tree = await loadTree(targetId); } catch { tree = null; }

  if (!tree || tree.url) {
    state.breadcrumb = [{ id: root.id, title: root.title || FOLDER_NAME }];
    try { tree = await loadTree(root.id); } catch { return; }
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
  try { tree = await loadTree(folderId); } catch { return; }
  if (!tree || tree.url) return;
  state.currentFolderId = tree.id;
  state.currentChildren = tree.children || [];
  if (renderCallback) renderCallback();
}

/* ---------- Перемещение закладок ---------- */
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

export function doMove(id, parentId, index) {
  const arr = childrenOf(parentId);
  const oldIdx = arr.findIndex(n => n.id === id);
  if (oldIdx >= 0 && oldIdx < index) index += 1;
  chrome.bookmarks.move(id, { parentId, index }, () => {
    if (chrome.runtime.lastError) {
      toast(chrome.runtime.lastError.message, true);
      return;
    }
    refreshBookmarks();
  });
}

function subtreeHas(ancestorId, id) {
  if (ancestorId === id) return true;
  const walk = nodes => nodes.some(n => n.id === id || (n.children && walk(n.children)));
  return walk(childrenOf(ancestorId));
}

export function dropIntoFolder(nodeId, folderId) {
  if (!nodeId || !folderId || nodeId === folderId) return;
  if (subtreeHas(nodeId, folderId)) {
    toast('Нельзя переместить папку внутрь самой себя', true);
    return;
  }
  doMove(nodeId, folderId, childrenOf(folderId).length);
}

export function moveBookmark(el, offset) {
  const arr = childrenOf(el.dataset.parent);
  const idx = arr.findIndex(n => n.id === el.dataset.id);
  if (idx < 0) return;
  const dst = idx + offset;
  if (dst < 0 || dst >= arr.length) {
    toast(offset < 0 ? 'Это уже первая закладка' : 'Это уже последняя закладка', true);
    return;
  }
  doMove(el.dataset.id, el.dataset.parent, dst);
}

export function deleteBookmark(tile) {
  const id = tile.dataset.id;
  if (!id) return;
  if (!confirm('Удалить закладку «' + tile.textContent.trim() + '»?')) return;
  chrome.bookmarks.remove(id, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
    tile.remove();
  });
}

/* ---------- Папки ---------- */

function countDeep(id) {
  return childrenOf(id).reduce((sum, n) => sum + (n.url ? 1 : countDeep(n.id)), 0);
}

export function disbandFolder(tileEl) {
  const id = tileEl.dataset.id;
  const parentId = tileEl.dataset.parent;
  if (!id || !parentId) return;
  const name = tileEl.dataset.title || 'папку';
  if (!confirm('Распустить папку «' + name + '»? Содержимое переедет на уровень выше.')) return;
  const kids = childrenOf(id);
  const after = () => {
    if (chrome.runtime.lastError) {
      toast(chrome.runtime.lastError.message, true);
      return;
    }
    refreshBookmarks();
  };
  let pending = kids.length;
  if (!pending) {
    chrome.bookmarks.remove(id, after);
    return;
  }
  kids.forEach(n => chrome.bookmarks.move(n.id, { parentId }, () => {
    pending -= 1;
    if (chrome.runtime.lastError || pending === 0) chrome.bookmarks.remove(id, after);
  }));
}

export function deleteFolder(tileEl, full) {
  const id = tileEl.dataset.id;
  if (!id) return;
  const name = tileEl.dataset.title || 'папка';
  const done = () => {
    if (chrome.runtime.lastError) {
      toast(chrome.runtime.lastError.message, true);
      return;
    }
    refreshBookmarks();
  };
  if (full) {
    const count = countDeep(id);
    if (!confirm('Удалить папку «' + name + '» и всё её содержимое (' + count + ' шт.)?')) return;
    chrome.bookmarks.removeTree(id, done);
  } else {
    if (!confirm('Удалить папку «' + name + '»?')) return;
    chrome.bookmarks.remove(id, done);
  }
}