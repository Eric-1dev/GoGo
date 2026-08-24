import { state, FOLDER_NAME, host, previewKey, faviconKey, fetchFavicon, PLACEHOLDER } from './state.js';
import { findFolder, doMove, dropIntoFolder, openFolder, navigateToCrumb, moveToFolder, setRenderCallback } from './bookmarks.js';

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
  /* Переиспользуем существующие плитки: без этого каждое обновление
     пересоздаёт DOM и перезагружает все превью — экран «мигает» */
  const reuse = new Map();
  content.querySelectorAll('.grid > .tile[data-id]').forEach(el => {
    el.style.transform = '';
    el.classList.remove('dragging', 'drag-over', 'hidden');
    reuse.set(el.dataset.id, el);
  });

  content.innerHTML = "";
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

/* Плитку можно переиспользовать, только если её данные не менялись */
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
  div.innerHTML = `
    <div class="icon">📂</div>
    <h2>Папка пуста</h2>
    <p>ПКМ на свободном месте — добавить закладку или создать папку.</p>`;
  content.appendChild(div);
}

function dragData(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return null; }
}

/* ---------- Сброс «на уровень выше» (плитка «назад» и крошки) ---------- */

function setupUpTarget(el, crumbIndex) {
  el.addEventListener('dragover', e => {
    if (!dragCtx) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragCtx.upEl !== el) {
      clearUpHover();
      dragCtx.upEl = el;
      dragCtx.insertIdx = null;
      clearShifts();
      el.classList.add('drag-over');
    }
  });

  el.addEventListener('dragleave', e => {
    if (!dragCtx || dragCtx.upEl !== el || el.contains(e.relatedTarget)) return;
    clearUpHover();
  });

  el.addEventListener('drop', e => {
    if (!dragCtx || dragCtx.upEl !== el) return;
    e.preventDefault();
    e.stopPropagation();
    const data = dragData(e);
    const srcId = dragCtx.el.dataset.id;
    endDragPreview();
    if (!data || !data.id || data.id !== srcId) return;
    moveToAncestor(data.id, crumbIndex);
  });
}

function clearUpHover() {
  if (!dragCtx || !dragCtx.upEl) return;
  dragCtx.upEl.classList.remove('drag-over');
  dragCtx.upEl = null;
}

function moveToAncestor(nodeId, crumbIndex) {
  const crumb = state.breadcrumb[crumbIndex];
  moveToFolder(nodeId, crumb.id, state.breadcrumb[crumbIndex + 1].id, crumb.title || FOLDER_NAME);
}

/* ---------- Drag & Drop с плавным предпросмотром вставки ---------- */

let dragCtx = null;

function setupDraggable(el) {
  let downX = 0;
  let downY = 0;
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    downX = e.clientX;
    downY = e.clientY;
  });
  /* Отпускание почти без движения Chrome считает кликом, а не drag'ом —
     гасим такой клик, чтобы ссылка не открылась в текущей вкладке */
  el.addEventListener('click', e => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) e.preventDefault();
  });

  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: el.dataset.id }));
    e.dataTransfer.effectAllowed = 'move';
    el.classList.add('dragging');
    beginDragPreview(el, e);
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    endDragPreview();
  });
}

function beginDragPreview(el, e) {
  const grid = content.querySelector('.grid');
  if (!grid) return;
  const tiles = Array.from(grid.children).filter(
    t => t.dataset.id && !t.classList.contains('back')
  );
  const rect = grid.getBoundingClientRect();
  const originX = rect.left - grid.offsetLeft;
  const originY = rect.top - grid.offsetTop;
  const oldIdx = tiles.indexOf(el);
  const left = tiles.map(t => t.offsetLeft);
  const top = tiles.map(t => t.offsetTop);

  dragCtx = {
    el,
    grid,
    slots: tiles,
    oldIdx,
    originX,
    originY,
    left,
    top,
    width: tiles.map(t => t.offsetWidth),
    height: tiles.map(t => t.offsetHeight),
    /* якорь — центр взятой плитки; пороги обмена симметричны относительно него */
    startCX: originX + left[oldIdx] + tiles[oldIdx].offsetWidth / 2,
    startCY: originY + top[oldIdx] + tiles[oldIdx].offsetHeight / 2,
    startPX: e.clientX,
    startPY: e.clientY,
    insertIdx: null,
    folderEl: null,
    upEl: null
  };
  grid.classList.add('drag-preview');
  content.classList.add('dnd-active');
}

function endDragPreview() {
  if (!dragCtx) return;
  const { grid, slots, el, folderEl } = dragCtx;
  slots.forEach(t => { t.style.transform = ''; });
  el.style.transform = '';
  if (folderEl) folderEl.classList.remove('drag-over');
  clearUpHover();
  grid.classList.remove('drag-preview');
  content.classList.remove('dnd-active');
  dragCtx = null;
}

function clearShifts() {
  dragCtx.slots.forEach(t => { if (t.style.transform) t.style.transform = ''; });
}

function applyShifts() {
  const { el, slots, left, top, oldIdx, insertIdx } = dragCtx;

  slots.forEach((t, f) => {
    if (t === el) return;
    let g = f;
    if (insertIdx > oldIdx && f > oldIdx && f <= insertIdx) g = f - 1;
    else if (insertIdx < oldIdx && f >= insertIdx && f < oldIdx) g = f + 1;
    const dx = left[g] - left[f];
    const dy = top[g] - top[f];
    t.style.transform = (dx || dy) ? 'translate(' + dx + 'px,' + dy + 'px)' : '';
  });

  let dx = 0;
  let dy = 0;
  if (insertIdx >= slots.length) {
    const v = virtualSlot();
    dx = v.left - left[oldIdx];
    dy = v.top - top[oldIdx];
  } else {
    dx = left[insertIdx] - left[oldIdx];
    dy = top[insertIdx] - top[oldIdx];
  }
  el.style.transform = (dx || dy) ? 'translate(' + dx + 'px,' + dy + 'px)' : '';
}

function virtualSlot() {
  const { slots, left, top, width, height, grid, originX } = dragCtx;
  const n = slots.length;
  const cs = getComputedStyle(grid);
  const colGap = parseFloat(cs.columnGap) || 0;
  const rowGap = parseFloat(cs.rowGap) || 0;
  const lastRight = originX + left[n - 1] + width[n - 1];
  const gridRight = originX + grid.clientWidth;
  if (lastRight + colGap + width[n - 1] <= gridRight) {
    return { left: left[n - 1] + width[n - 1] + colGap, top: top[n - 1] };
  }
  return { left: left[0], top: top[n - 1] + height[n - 1] + rowGap };
}

function calcInsertIndex(x, y) {
  const { left, top, width, height, originX, originY } = dragCtx;
  const n = left.length;
  let best = Math.max(0, n - 1);
  let bestDist = Infinity;
  for (let i = 0; i < n; i++) {
    const dx = x - (originX + left[i] + width[i] / 2);
    const dy = y - (originY + top[i] + height[i] / 2);
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function setupGridDnd(grid) {
  grid.addEventListener('dragover', e => {
    if (!dragCtx) return;
    if (e.target.closest('.up-target')) return;
    if (dragCtx.upEl) clearUpHover();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const hit = e.target.closest('.tile.folder');
    const folderEl = hit && hit !== dragCtx.el ? hit : null;

    if (folderEl !== dragCtx.folderEl) {
      if (dragCtx.folderEl) dragCtx.folderEl.classList.remove('drag-over');
      dragCtx.folderEl = folderEl;
      if (folderEl) {
        dragCtx.insertIdx = null;
        clearShifts();
        folderEl.classList.add('drag-over');
      }
    }

    if (!folderEl) {
      const idx = calcInsertIndex(
        dragCtx.startCX + (e.clientX - dragCtx.startPX),
        dragCtx.startCY + (e.clientY - dragCtx.startPY)
      );
      if (idx !== dragCtx.insertIdx) {
        dragCtx.insertIdx = idx;
        applyShifts();
      }
    }
  });

  grid.addEventListener('dragleave', e => {
    if (!dragCtx || grid.contains(e.relatedTarget)) return;
    if (dragCtx.folderEl) {
      dragCtx.folderEl.classList.remove('drag-over');
      dragCtx.folderEl = null;
    }
    clearUpHover();
    dragCtx.insertIdx = null;
    clearShifts();
  });

  grid.addEventListener('drop', e => {
    if (!dragCtx) return;
    e.preventDefault();
    const ctx = dragCtx;
    const data = dragData(e);
    endDragPreview();
    if (!data || !data.id || data.id !== ctx.el.dataset.id) return;
    if (ctx.folderEl) {
      dropIntoFolder(data.id, ctx.folderEl.dataset.id);
    } else if (ctx.insertIdx != null) {
      doMove(data.id, state.currentFolderId, ctx.insertIdx);
    }
  });
}

function folderTile(node) {
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

/* Полный запрет нативного drop-поведения: страница стартовая,
   любой сброс ссылки/текста сюда иначе ведёт к переходу по URL */
document.addEventListener('dragenter', e => e.preventDefault());
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  if (dragCtx) endDragPreview();
});