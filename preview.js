import { PREVIEW_DELAY, previewKey, faviconKey, host, PLACEHOLDER, SCREENSHOT_DELAY_KEY } from './state.js';
import { toast } from './toast.js';

let imageModal, imageUrlInput, imageFileBtn, imageFileInput;
let imageScreenshotBtn, screenshotDelayInput, spinUpBtn, spinDownBtn;
let imagePreview, imagePreviewImg, imageApply, imageCancel;

let imageTile = null;
let pendingDataUrl = null;

function closeImageModal() {
  imageModal.hidden = true;
  imageTile = null;
  pendingDataUrl = null;
}

function closeImageModalOnKey(e) {
  if (e.key === 'Escape' && !imageModal.hidden) closeImageModal();
}

function handleImageUrlInput() {
  let url = imageUrlInput.value.trim();
  if (!url) {
    imagePreview.hidden = true;
    pendingDataUrl = null;
    imageApply.disabled = true;
    return;
  }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  pendingDataUrl = null;
  imageApply.disabled = true;
  imagePreview.hidden = true;

  fetch(url).then(r => {
    if (!r.ok) throw new Error('fail');
    return r.blob();
  }).then(blob => {
    if (!blob.type.startsWith('image/')) throw new Error('not image');
    const reader = new FileReader();
    reader.onloadend = () => {
      pendingDataUrl = reader.result;
      imagePreviewImg.src = pendingDataUrl;
      imagePreview.hidden = false;
      imageApply.disabled = false;
    };
    reader.readAsDataURL(blob);
  }).catch(() => {
    imagePreview.hidden = true;
    pendingDataUrl = null;
    imageApply.disabled = true;
  });
}

function handleScreenshotClick() {
  if (!imageTile) return;
  const tile = imageTile;
  const delay = parseInt(screenshotDelayInput.value, 10) || 5;
  chrome.storage.local.set({ [SCREENSHOT_DELAY_KEY]: delay });
  closeImageModal();
  makePreview(tile, delay);
}

function handleSpinUp() {
  screenshotDelayInput.value = Math.min(30, (parseInt(screenshotDelayInput.value, 10) || 5) + 1);
}

function handleSpinDown() {
  screenshotDelayInput.value = Math.max(1, (parseInt(screenshotDelayInput.value, 10) || 5) - 1);
}

function handleFileInput() {
  const file = imageFileInput.files[0];
  imageFileInput.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingDataUrl = reader.result;
    imagePreviewImg.src = pendingDataUrl;
    imagePreview.hidden = false;
    imageApply.disabled = false;
    imageUrlInput.value = '';
  };
  reader.readAsDataURL(file);
}

function handleImageApply() {
  if (!pendingDataUrl || !imageTile) return;
  const dataUrl = pendingDataUrl;
  const tile = imageTile;
  const url = tile.dataset.url;
  closeImageModal();
  downscalePreview(dataUrl).then(small => {
    chrome.storage.local.set({ [previewKey(url)]: small }, () => {
      document.querySelectorAll('.tile').forEach(t => {
        if (t.dataset.url === url) updateTilePreview(t, small);
      });
      toast('Изображение установлено');
    });
  }).catch(() => {
    toast('Не удалось обработать изображение', true);
  });
}

export function initPreview() {
  imageModal = document.getElementById('imageModal');
  imageUrlInput = document.getElementById('imageUrl');
  imageFileBtn = document.getElementById('imageFileBtn');
  imageFileInput = document.getElementById('imageFileInput');
  imageScreenshotBtn = document.getElementById('imageScreenshotBtn');
  screenshotDelayInput = document.getElementById('screenshotDelay');
  spinUpBtn = document.getElementById('spinUp');
  spinDownBtn = document.getElementById('spinDown');
  imagePreview = document.getElementById('imagePreview');
  imagePreviewImg = document.getElementById('imagePreviewImg');
  imageApply = document.getElementById('imageApply');
  imageCancel = document.getElementById('imageCancel');

  imageCancel.addEventListener('click', closeImageModal);
  imageModal.addEventListener('mousedown', e => { if (e.target === imageModal) closeImageModal(); });
  document.addEventListener('keydown', closeImageModalOnKey);
  imageUrlInput.addEventListener('input', handleImageUrlInput);
  imageFileBtn.addEventListener('click', () => imageFileInput.click());
  imageScreenshotBtn.addEventListener('click', handleScreenshotClick);
  spinUpBtn.addEventListener('click', handleSpinUp);
  spinDownBtn.addEventListener('click', handleSpinDown);
  imageFileInput.addEventListener('change', handleFileInput);
  imageApply.addEventListener('click', handleImageApply);
}

export function makePreview(tile, delay) {
  const url = tile.dataset.url;
  const site = host(url);
  const wait = (typeof delay === 'number' ? delay : PREVIEW_DELAY / 1000) * 1000;
  toast('Открываю «' + site + '» — снимаю превью...');

  chrome.tabs.create({ url, active: true }, tab => {
    const tabId = tab.id;
    const winId = tab.windowId;

    setTimeout(() => {
      chrome.tabs.captureVisibleTab(winId, { format: 'png' }, dataUrl => {
        if (chrome.runtime.lastError) {
          toast('Не удалось снять превью: ' + chrome.runtime.lastError.message, true);
          chrome.tabs.remove(tabId, () => {});
          return;
        }

        downscalePreview(dataUrl).then(small => {
          chrome.storage.local.set({ [previewKey(url)]: small }, () => {
            chrome.tabs.remove(tabId, () => {});
            document.querySelectorAll('.tile').forEach(t => {
              if (t.dataset.url === url) updateTilePreview(t, small);
            });
            toast('Превью «' + site + '» сохранено');
          });
        }).catch(() => {
          toast('Не удалось обработать превью', true);
          chrome.tabs.remove(tabId, () => {});
        });
      });
    }, wait);
  });
}

export function downscalePreview(dataUrl) {
  return new Promise((resolve, reject) => {
    const W = 320, H = 240;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(W / img.width, H / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, dx, dy, dw, dh);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = dataUrl;
  });
}

export function updateTilePreview(tile, dataUrl) {
  const img = tile.querySelector('.preview img');
  if (!img) return;
  img.className = 'thumb';
  img.src = dataUrl;
  img.removeAttribute('title');
}

export function deletePreview(tile) {
  const url = tile.dataset.url;
  const key = previewKey(url);
  chrome.storage.local.remove(key, () => {
    const img = tile.querySelector('.preview img');
    if (img) {
      const fKey = faviconKey(url);
      chrome.storage.local.get(fKey, result => {
        img.className = 'favicon';
        img.src = result[fKey] || PLACEHOLDER;
        img.title = result[fKey] ? '' : 'Нет превью. ПКМ → Снять превью';
      });
    }
    toast('Превью удалено');
  });
}

export function openImageModal(tile) {
  imageTile = tile;
  pendingDataUrl = null;
  imageUrlInput.value = '';
  imagePreview.hidden = true;
  imagePreviewImg.src = '';
  imageApply.disabled = true;
  imageModal.hidden = false;
  imageUrlInput.focus();
  chrome.storage.local.get(SCREENSHOT_DELAY_KEY, r => {
    screenshotDelayInput.value = r[SCREENSHOT_DELAY_KEY] || 5;
  });
}
