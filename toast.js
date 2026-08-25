let toastEl = null;
let toastTimer = null;

const TOAST_DURATION = 3500;

export function initToast() {
  toastEl = document.getElementById('toast');
}

export function toast(msg, isError) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.toggle('error', !!isError);
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), TOAST_DURATION);
}
