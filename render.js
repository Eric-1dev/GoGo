import { state, FOLDER_NAME, host, previewKey, faviconKey, fetchFavicon, PLACEHOLDER } from './state.js';
import { findOrCreateFolder, navigateToCrumb, openFolder, setRenderCallback } from './bookmarks.js';
import { setupDraggable, setupGridDnd, setupUpTarget } from './dragdrop.js';

let content;

function sameData(old, fresh) {
  return !!old &&
    old.tagName === fresh.tagName &&
    old.dataset.url === (fresh.dataset.url || '') &&
    old.dataset.title === (fresh.dataset.title || '') &&
    old.dataset.count === (fresh.dataset.count || '');
}

function backTile() {
  const el = document.createElement('div');
  el.className = 'tile back up-target';
  el.title = 'Назад';
  el.addEventListener('click', () => navigateToCrumb(state.breadcrumb.length - 2));
  setupUpTarget(el, state.breadcrumb.length - 2);
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
    if (!last) {
      el.addEventListener('click', () => navigateToCrumb(i));
      el.classList.add('up-target');
      setupUpTarget(el, i);
    }
    nav.appendChild(el);
  });
  content.appendChild(nav);
}

function renderEmptyHint() {
  const div = document.createElement('div');
  div.className = 'empty compact';
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.textContent = '📂';
  const h2 = document.createElement('h2');
  h2.textContent = 'Папка пуста';
  const p = document.createElement('p');
  p.textContent = 'ПКМ на свободном месте — добавить закладку или создать папку.';
  div.append(icon, h2, p);
  content.appendChild(div);
}

export function countItems(node) {
  return (node.children || []).reduce((sum, c) => sum + (c.url ? 1 : countItems(c)), 0);
}

export function folderTile(node) {
  const el = document.createElement('div');
  el.className = 'tile folder';
  el.draggable = true;
  el.dataset.id = node.id;
  el.dataset.parent = state.currentFolderId;
  el.dataset.title = node.title || '';

  const count = countItems(node);
  el.dataset.count = count;

  setupDraggable(el);

  el.addEventListener('click', () => openFolder(node));

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.textContent = '📁';

  if (count) {
    const badge = document.createElement('span');
    badge.className = 'count-badge';
    badge.textContent = count > 99 ? '99+' : count;
    preview.appendChild(badge);
  }

  const caption = document.createElement('div');
  caption.className = 'caption';
  caption.textContent = node.title || 'Без названия';

  el.append(preview, caption);
  return el;
}

export function tile(bookmark, parentId) {
  const a = document.createElement('a');
  a.className = 'tile';
  a.href = bookmark.url;
  a.draggable = true;
  a.dataset.url = bookmark.url;
  a.dataset.id = bookmark.id;
  a.dataset.title = bookmark.title || '';
  a.dataset.parent = parentId;

  setupDraggable(a);

  const preview = document.createElement('div');
  preview.className = 'preview';
  preview.appendChild(previewImage(bookmark));

  const caption = document.createElement('div');
  caption.className = 'caption';
  caption.textContent = bookmark.title || host(bookmark.url);

  a.append(preview, caption);
  return a;
}

function previewImage(bookmark) {
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.onerror = () => {
    const parent = img.parentElement;
    img.remove();
    if (parent) parent.appendChild(fallback(bookmark.title));
  };

  const pKey = previewKey(bookmark.url);
  const fKey = faviconKey(bookmark.url);
  chrome.storage.local.get([pKey, fKey], result => {
    if (result[pKey]) {
      img.className = 'thumb';
      img.src = result[pKey];
    } else if (result[fKey]) {
      img.className = 'favicon';
      img.src = result[fKey];
    } else {
      img.className = 'favicon';
      img.src = PLACEHOLDER;
      img.title = 'Нет превью. ПКМ → Снять превью';
      fetchFavicon(bookmark.url).then(dataUrl => {
        if (dataUrl) {
          chrome.storage.local.set({ [fKey]: dataUrl }, () => {
            img.src = dataUrl;
            img.removeAttribute('title');
          });
        }
      });
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

function renderEmpty() {
  content.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'empty';
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.textContent = '📂';
  const h2 = document.createElement('h2');
  h2.textContent = 'Папка «GoGo» не найдена';
  const p = document.createElement('p');
  const text1 = document.createTextNode('Создайте в закладках браузера папку с названием ');
  const code = document.createElement('code');
  code.textContent = 'GoGo';
  const text2 = document.createTextNode(' и добавьте в неё ссылки — они появятся здесь плитками.');
  p.append(text1, code, text2);
  wrapper.append(icon, h2, p);
  content.appendChild(wrapper);
}

export function render() {
  const reuse = new Map();
  content.querySelectorAll('.grid > .tile[data-id]').forEach(el => {
    el.style.transform = '';
    el.classList.remove('dragging', 'drag-over', 'hidden');
    reuse.set(el.dataset.id, el);
  });

  content.innerHTML = '';
  renderBreadcrumbs();

  const grid = document.createElement('div');
  grid.className = 'grid';
  setupGridDnd(grid);

  if (state.breadcrumb.length > 1) {
    grid.appendChild(backTile());
  }

  state.currentChildren.forEach(child => {
    const fresh = child.url ? tile(child, state.currentFolderId) : folderTile(child);
    const old = reuse.get(child.id);
    grid.appendChild(sameData(old, fresh) ? old : fresh);
  });

  content.appendChild(grid);

  if (!state.currentChildren.length) renderEmptyHint();
}

export async function init() {
  let folder;
  try {
    folder = await findOrCreateFolder();
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

export function initRender(contentEl) {
  content = contentEl;
  setRenderCallback(render);
}
