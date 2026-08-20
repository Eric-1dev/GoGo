import { findFolder, refreshBookmarks } from './bookmarks.js';
import { state, host } from './state.js';
import { toast } from './toast.js';

const addModal = document.getElementById('addModal');
const addModalTitle = document.getElementById('addModalTitle');
const urlLabel = document.getElementById('urlLabel');
const newUrlInput = document.getElementById('newUrl');
const newTitleInput = document.getElementById('newTitle');
const addForm = document.getElementById('addForm');

let editingId = null;
let folderMode = false;

function setFolderMode(on) {
  folderMode = on;
  urlLabel.hidden = on;
}

export function openAddModal() {
  editingId = null;
  setFolderMode(false);
  addModalTitle.textContent = 'Новая закладка';
  newUrlInput.value = '';
  newTitleInput.value = '';
  addModal.hidden = false;
  newUrlInput.focus();
}

export function openAddFolderModal() {
  editingId = null;
  setFolderMode(true);
  addModalTitle.textContent = 'Новая папка';
  newUrlInput.value = '';
  newTitleInput.value = '';
  addModal.hidden = false;
  newTitleInput.focus();
}

export function openEditFolderModal(tile) {
  editingId = tile.dataset.id;
  setFolderMode(true);
  addModalTitle.textContent = 'Переименовать папку';
  newUrlInput.value = '';
  newTitleInput.value = tile.dataset.title || '';
  addModal.hidden = false;
  newTitleInput.focus();
  newTitleInput.select();
}

export function openEditModal(tile) {
  editingId = tile.dataset.id;
  setFolderMode(false);
  addModalTitle.textContent = 'Изменить закладку';
  newUrlInput.value = tile.dataset.url;
  newTitleInput.value = tile.dataset.title;
  addModal.hidden = false;
  newUrlInput.focus();
}

export function closeAddModal() {
  addModal.hidden = true;
  editingId = null;
  setFolderMode(false);
}

document.getElementById('addCancel').addEventListener('click', closeAddModal);

addForm.addEventListener('submit', e => {
  e.preventDefault();
  submitAdd();
});

addModal.addEventListener('mousedown', e => {
  if (e.target === addModal) closeAddModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !addModal.hidden) closeAddModal();
});

function submitAdd() {
  const title = newTitleInput.value.trim();
  if (folderMode) {
    submitFolder(title);
    return;
  }

  const urlRaw = newUrlInput.value.trim();
  if (!urlRaw) {
    toast('Укажите URL', true);
    newUrlInput.focus();
    return;
  }

  let url;
  try {
    url = new URL(urlRaw).href;
  } catch {
    toast('Некорректный URL', true);
    newUrlInput.focus();
    return;
  }

  const wasEdit = !!editingId;
  const done = () => {
    if (chrome.runtime.lastError) {
      toast(chrome.runtime.lastError.message, true);
      return;
    }
    closeAddModal();
    toast(wasEdit ? 'Закладка обновлена' : 'Закладка добавлена');
    refreshBookmarks();
  };

  if (editingId) {
    chrome.bookmarks.update(editingId, { title, url }, done);
    return;
  }

  resolveParent().then(parentId => {
    if (!parentId) return;
    chrome.bookmarks.create({ parentId, title: title || host(url), url }, done);
  });
}

function resolveParent() {
  if (state.currentFolderId) return Promise.resolve(state.currentFolderId);
  return findFolder().then(folder => {
    if (!folder) toast('Папка «GoGo» не найдена', true);
    return folder ? folder.id : null;
  }).catch(() => {
    toast('Папка «GoGo» не найдена', true);
    return null;
  });
}

function submitFolder(title) {
  if (!title) {
    toast('Укажите название папки', true);
    newTitleInput.focus();
    return;
  }
  if (editingId) {
    chrome.bookmarks.update(editingId, { title }, () => {
      if (chrome.runtime.lastError) {
        toast(chrome.runtime.lastError.message, true);
        return;
      }
      closeAddModal();
      toast('Папка переименована');
      refreshBookmarks();
    });
    return;
  }
  resolveParent().then(parentId => {
    if (!parentId) return;
    chrome.bookmarks.create({ parentId, title }, () => {
      if (chrome.runtime.lastError) {
        toast(chrome.runtime.lastError.message, true);
        return;
      }
      closeAddModal();
      toast('Папка создана');
      refreshBookmarks();
    });
  });
}