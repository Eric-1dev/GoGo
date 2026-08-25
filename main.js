import { initToast } from './toast.js';
import { initThemes, loadSavedTheme, applyTheme, currentBg } from './themes.js';
import { initRender, init, render } from './render.js';
import { initDragDrop } from './dragdrop.js';
import { initSearch } from './search.js';
import { initSettings, loadGridSettings, setRenderCallback } from './settings.js';
import { initModal } from './modal.js';
import { initPreview } from './preview.js';
import { initContextMenu } from './contextmenu.js';
import { initStorage } from './storage.js';

const content = document.getElementById('content');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

// 1. DOM-зависимые модули (порядок не важен)
initToast();
initThemes();
initRender(content);
initDragDrop(content);
initSearch();
initModal();
initPreview();
initContextMenu();
initStorage();

// 2. settings зависит от render — передаём колбэк
setRenderCallback(render);
initSettings();

// 3. UI-логика шапки
document.querySelector('.logo').addEventListener('click', () => location.reload());

settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  settingsPanel.hidden = !settingsPanel.hidden;
});

document.addEventListener('mousedown', e => {
  if (!e.target.closest('.settings-wrap')) settingsPanel.hidden = true;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') settingsPanel.hidden = true; });

// 4. Загрузка сохранённых данных и начальный рендер
loadSavedTheme();
if (currentBg === 'gradient') {
  applyTheme('gradient');
}
loadGridSettings();
init();
