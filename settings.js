import { state } from './state.js';
import { toast } from './toast.js';

let gridColsInput, tileSizeSelect;
let renderCallback = null;

export function setRenderCallback(fn) {
  renderCallback = fn;
}

export function loadGridSettings() {
  chrome.storage.local.get('goGoGrid', result => {
    const saved = result.goGoGrid;
    const cols = saved && saved.cols > 0 ? saved.cols : state.gridCols;
    const size = saved && saved.size ? saved.size : 'medium';
    gridColsInput.value = cols;
    tileSizeSelect.value = size;
    applyGrid(cols, size);
  });
}

function clampGrid(v) {
  return Math.min(12, Math.max(1, parseInt(v, 10) || 6));
}

function saveGridSettings() {
  const cols = clampGrid(gridColsInput.value);
  const size = tileSizeSelect.value;
  gridColsInput.value = cols;
  chrome.storage.local.set({ goGoGrid: { cols, size } });
  applyGrid(cols, size);
}

export function applyGrid(cols, size) {
  state.gridCols = cols;
  document.documentElement.style.setProperty('--grid-cols', cols);
  document.body.classList.remove('tile-size-large', 'tile-size-medium', 'tile-size-small');
  document.body.classList.add('tile-size-' + size);
  if (renderCallback) renderCallback();
}

export function initSettings() {
  gridColsInput = document.getElementById('gridCols');
  tileSizeSelect = document.getElementById('tileSize');

  gridColsInput.addEventListener('change', saveGridSettings);
  tileSizeSelect.addEventListener('change', saveGridSettings);

  document.querySelector('.grid-spin-up').addEventListener('click', () => {
    gridColsInput.value = Math.min(12, (parseInt(gridColsInput.value, 10) || 6) + 1);
    saveGridSettings();
  });

  document.querySelector('.grid-spin-down').addEventListener('click', () => {
    gridColsInput.value = Math.max(1, (parseInt(gridColsInput.value, 10) || 6) - 1);
    saveGridSettings();
  });
}
