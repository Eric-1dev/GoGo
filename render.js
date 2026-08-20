import { state, FOLDER_NAME, favicon, host, previewKey } from './state.js';
import { findFolder, childrenOf, doMove, dropIntoFolder, openFolder, navigateToCrumb, setRenderCallback } from './bookmarks.js';

const content = document.getElementById('content');
const search = document.getElementById('search');

setRenderCallback(render);

export async function init() {
  let folder;
  try {
    folder = await findFolder();
  } catch {
    renderEmpty();
    return;
  }

  if (!folder) {
    renderEmpty();
    return;
  }

  let tree;
  try {
    [tree] = await chrome.bookmarks.getSubTree(folder.id);
  } catch {
    renderEmpty();
    return;
  }
  if (!tree) {
    renderEmpty();
    return;
  }

  state.currentChildren = tree.children || [];
  state.currentFolderId = tree.id;
  state.breadcrumb = [{ id: tree.id, title: tree.title || FOLDER_NAME }];
  render();
}

export function render() {
  content.innerHTML = "";
  renderBreadcrumbs();

  const grid = document.createElement('div');
  grid.className = 'grid';

  if (state.breadcrumb.length > 1) {
    grid.appendChild(backTile());
  }

  state.currentChildren.forEach(child => {
    grid.appendChild(child.url ? tile(child, state.currentFolderId) : folderTile(child));
  });

  content.appendChild(grid);

  if (!state.currentChildren.length) renderEmptyHint();
}

function backTile() {
  const el = document.createElement('div');
  el.className = 'tile back';
  el.title = 'Назад';
  el.textContent = '←';
  el.addEventListener('click', () => navigateToCrumb(state.breadcrumb.length - 2));
  return el;
}

function renderBreadcrumbs() {
  if (state.breadcrumb.length < 2) return;
  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  state.breadcrumb.forEach((crumb, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'crumb-sep';
      sep.textContent = '›';
      nav.appendChild(sep);
    }
    const last = i === state.breadcrumb.length - 1;
    const el = document.createElement(last ? 'span' : 'button');
    el.type = 'button';
    el.className = 'crumb' + (last ? ' current' : '');
    el.textContent = crumb.title || FOLDER_NAME;
    if (!last) el.addEventListener('click', () => navigateToCrumb(i));
    nav.appendChild(el);
  });
  content.appendChild(nav);
}

function renderEmptyHint() {
  const div = document.createElement('div');
  div.className = 'empty compact';
  div.innerHTML = `
    <div class="icon">📂</div>
    <h2>Папка пуста</h2>
    <p>ПКМ на свободном месте — добавить закладку или создать папку.</p>`;
  content.appendChild(div);
}

function dragData(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return null; }
}

function setupDraggable(el, node) {
  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: node.id }));
    e.dataTransfer.effectAllowed = 'move';
    el.classList.add('dragging');
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(t => t.classList.remove('drag-over'));
  });
}

function setupDropReorder(el, node, parentId) {
  el.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));

  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const data = dragData(e);
    if (!data || !data.id || data.id === node.id) return;
    const targetIdx = childrenOf(parentId).findIndex(n => n.id === node.id);
    if (targetIdx < 0) return;
    doMove(data.id, parentId, targetIdx);
  });
}

function folderTile(node) {
  const el = document.createElement('div');
  el.className = 'tile folder';
  el.draggable = true;
  el.dataset.id = node.id;
  el.dataset.parent = state.currentFolderId;
  el.dataset.title = node.title || '';

  setupDraggable(el, node);

  el.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    el.classList.add('drag-over');
  });

  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));

  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const data = dragData(e);
    if (!data || !data.id || data.id === node.id) return;
    dropIntoFolder(data.id, node.id);
  });

  el.addEventListener('click', () => openFolder(node));

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.textContent = '📁';

  const count = countItems(node);
  const caption = document.createElement('div');
  caption.className = 'caption';
  caption.textContent = (node.title || 'Без названия') + (count ? ' (' + count + ')' : '');

  el.appendChild(preview);
  el.appendChild(caption);
  return el;
}

function countItems(node) {
  return (node.children || []).reduce((sum, c) => sum + (c.url ? 1 : countItems(c)), 0);
}

function tile(bookmark, parentId) {
  const a = document.createElement('a');
  a.className = 'tile';
  a.href = bookmark.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.draggable = true;
  a.dataset.url = bookmark.url;
  a.dataset.id = bookmark.id;
  a.dataset.title = bookmark.title || '';
  a.dataset.parent = parentId;

  setupDraggable(a, bookmark);
  setupDropReorder(a, bookmark, parentId);

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.appendChild(previewImage(bookmark));

  const caption = document.createElement('div');
  caption.className = 'caption';
  caption.textContent = bookmark.title || host(bookmark.url);

  a.appendChild(preview);
  a.appendChild(caption);
  return a;
}

function previewImage(bookmark) {
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.onerror = () => {
    img.remove();
    img.parentElement.appendChild(fallback(bookmark.title));
  };

  const key = previewKey(bookmark.url);
  chrome.storage.local.get(key, result => {
    const cached = result[key];
    if (cached) {
      img.className = 'thumb';
      img.src = cached;
    } else {
      img.src = favicon(bookmark.url);
      img.title = 'Нет превью. ПКМ → Снять превью';
    }
  });
  return img;
}

function fallback(title) {
  const span = document.createElement('span');
  span.className = 'fallback';
  span.textContent = (title || '?').trim().charAt(0).toUpperCase();
  return span;
}

function filterTiles() {
  const q = search.value.trim().toLowerCase();
  document.querySelectorAll('.tile').forEach(t => {
    const title = (t.textContent || '').toLowerCase();
    const url = (t.dataset.url || '').toLowerCase();
    t.classList.toggle('hidden', !(title.includes(q) || url.includes(q)));
  });
}

function renderEmpty() {
  content.innerHTML = `
    <div class="empty">
      <div class="icon">📂</div>
      <h2>Папка «GoGo» не найдена</h2>
      <p>Создайте в закладках браузера папку с названием <code>GoGo</code><br>
      и добавьте в неё ссылки — они появятся здесь плитками.</p>
    </div>`;
}

search.addEventListener('input', filterTiles);