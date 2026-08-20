import { PREVIEW_DELAY, previewKey, host, favicon } from './state.js';
import { toast } from './toast.js';

export function makePreview(tile) {
  const url = tile.dataset.url;
  const site = host(url);
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
    }, PREVIEW_DELAY);
  });
}

export function downscalePreview(dataUrl) {
  return new Promise((resolve, reject) => {
    const W = 320, H = 240;
    const img = new Image();
    img.onload = () => {
      const scale = Math.max(W / img.width, H / img.height);
      const sw = W / scale, sh = H / scale;
      const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
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
      img.className = '';
      img.src = favicon(url);
      img.title = 'Нет превью. ПКМ → Снять превью';
    }
    toast('Превью удалено');
  });
}