import './themes.js';
import './render.js';
import './settings.js';
import './modal.js';
import './contextmenu.js';
import './preview.js';
import './storage.js';
import { currentBg, applyTheme, loadSavedTheme } from './themes.js';
import { loadGridSettings } from './settings.js';
import { init } from './render.js';

const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

document.querySelector('.logo').addEventListener('click', () => location.reload());

settingsBtn.addEventListener('click', e => {
  e.stopPropagation();
  settingsPanel.hidden = !settingsPanel.hidden;
});

document.addEventListener('mousedown', e => {
  if (!e.target.closest('.settings-wrap')) settingsPanel.hidden = true;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') settingsPanel.hidden = true; });

// Загружаем сохранённую тему и применяем её
loadSavedTheme();

// Если тема не сохранена, применяем дефолтную
if (currentBg === 'gradient') {
  applyTheme('gradient');
}

loadGridSettings();
init();