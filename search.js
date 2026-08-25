let searchInput;
let searchTimer = null;

const DEBOUNCE_DELAY = 200;

function filterTiles() {
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.tile').forEach(t => {
    const title = (t.textContent || '').toLowerCase();
    const url = (t.dataset.url || '').toLowerCase();
    t.classList.toggle('hidden', !(title.includes(q) || url.includes(q)));
  });
}

export function initSearch() {
  searchInput = document.getElementById('search');
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(filterTiles, DEBOUNCE_DELAY);
  });
}
