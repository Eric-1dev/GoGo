import { state } from './state.js';
import { doMove, dropIntoFolder, moveToFolder, navigateToCrumb } from './bookmarks.js';

let content;
let dragCtx = null;

function dragData(e) {
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return null; }
}

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
  moveToFolder(nodeId, crumb.id, state.breadcrumb[crumbIndex + 1].id, crumb.title || 'GoGo');
}

function setupDraggable(el) {
  let downX = 0;
  let downY = 0;
  el.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    downX = e.clientX;
    downY = e.clientY;
  });
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
    el, grid, slots: tiles, oldIdx,
    originX, originY, left, top,
    width: tiles.map(t => t.offsetWidth),
    height: tiles.map(t => t.offsetHeight),
    startCX: originX + left[oldIdx] + tiles[oldIdx].offsetWidth / 2,
    startCY: originY + top[oldIdx] + tiles[oldIdx].offsetHeight / 2,
    startPX: e.clientX, startPY: e.clientY,
    insertIdx: null, folderEl: null, upEl: null
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

export function initDragDrop(contentEl) {
  content = contentEl;

  document.addEventListener('dragenter', e => e.preventDefault());
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    if (dragCtx) endDragPreview();
  });
}

export { setupDraggable, setupGridDnd, setupUpTarget, endDragPreview };
