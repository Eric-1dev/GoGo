import { openAddModal, openEditModal, openAddFolderModal, openEditFolderModal } from './modal.js';
import { makePreview, deletePreview } from './preview.js';
import { deleteBookmark, moveBookmark, disbandFolder, deleteFolder, childrenOf, refreshBookmarks } from './bookmarks.js';
import { toast } from './toast.js';

const ctxMenu = document.getElementById('ctxMenu');
let ctxTarget = null;

document.addEventListener('contextmenu', e => {
  e.preventDefault();
  ctxTarget = null;

  const tile = e.target.closest('.tile');
  if (tile && tile.classList.contains('folder')) {
    ctxTarget = tile;
    const items = [
      { act: 'rename', label: '✏️ Переименовать папку' }
    ];
    if (childrenOf(tile.dataset.id).length) {
      items.push(
        { act: 'disband', label: '📂 Распустить папку' },
        { act: 'deleteFull', label: '✖ Удалить с содержимым', danger: true }
      );
    } else {
      items.push({ act: 'deleteEmpty', label: '✖ Удалить папку', danger: true });
    }
    showCtxMenu(e.clientX, e.clientY, items);
    return;
  }
  if (tile) {
    ctxTarget = tile;
    const items = [
      { act: 'edit', label: '✏️ Изменить закладку' },
      { act: 'refresh', label: '🔄 Обновить превью' }
    ];
    if (tile.querySelector('.preview img.thumb')) {
      items.push({ act: 'delpreview', label: '🗑 Удалить превью' });
    }
    items.push(
      { act: 'open', label: '↗ Открыть в новой вкладке' },
      { act: 'delete', label: '✖ Удалить закладку', danger: true }
    );
    showCtxMenu(e.clientX, e.clientY, items);
  } else {
    showCtxMenu(e.clientX, e.clientY, [
      { act: 'add', label: '➕ Добавить закладку' },
      { act: 'addFolder', label: '📁 Создать папку' },
      { act: 'reloadView', label: '🔄 Обновить' }
    ]);
  }
});

function showCtxMenu(x, y, items) {
  ctxMenu.innerHTML = '';
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'ctx-item' + (it.danger ? ' danger' : '');
    div.dataset.act = it.act;
    div.textContent = it.label;
    ctxMenu.appendChild(div);
  });
  ctxMenu.hidden = false;
  const rect = ctxMenu.getBoundingClientRect();
  ctxMenu.style.left = Math.min(x, window.innerWidth - rect.width - 8) + 'px';
  ctxMenu.style.top = Math.min(y, window.innerHeight - rect.height - 8) + 'px';
}

ctxMenu.addEventListener('click', e => {
  const item = e.target.closest('.ctx-item');
  if (!item) return;
  const act = item.dataset.act;
  const tile = ctxTarget;
  closeCtxMenu();
  if (act === 'add') { openAddModal(); return; }
  if (act === 'addFolder') { openAddFolderModal(); return; }
  if (act === 'reloadView') { refreshBookmarks(); toast('Обновлено'); return; }
  if (act === 'rename') { if (tile) openEditFolderModal(tile); return; }
  if (act === 'moveUp') { if (tile) moveBookmark(tile, -1); return; }
  if (act === 'moveDown') { if (tile) moveBookmark(tile, 1); return; }
  if (act === 'disband') { if (tile) disbandFolder(tile); return; }
  if (act === 'deleteFull') { if (tile) deleteFolder(tile, true); return; }
  if (act === 'deleteEmpty') { if (tile) deleteFolder(tile, false); return; }
  if (!tile) return;
  if (act === 'edit') openEditModal(tile);
  if (act === 'refresh') makePreview(tile);
  if (act === 'delpreview') deletePreview(tile);
  if (act === 'open') window.open(tile.href, '_blank', 'noopener');
  if (act === 'delete') deleteBookmark(tile);
});

function closeCtxMenu() {
  ctxMenu.hidden = true;
  ctxTarget = null;
}

document.addEventListener('click', closeCtxMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCtxMenu(); });
window.addEventListener('resize', closeCtxMenu);
window.addEventListener('scroll', closeCtxMenu, true);