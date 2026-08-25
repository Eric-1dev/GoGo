const BG_THEMES = {
  gradient: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 75%, #1a1a2e 100%)',
    accent: '#ff5e62',
    accent2: '#7909a4',
    orbs: [
      { width: 420, height: 420, bg: '#ff5e62', top: '-120px', left: '-100px' },
      { width: 360, height: 360, bg: '#7909a4', bottom: '-100px', right: '-80px', animationDelay: '-4s' },
      { width: 300, height: 300, bg: '#0fb8ad', top: '40%', right: '20%', animationDelay: '-8s' },
      { width: 240, height: 240, bg: '#f9c74f', bottom: '15%', left: '25%', animationDelay: '-11s' }
    ]
  },
  dark: {
    bg: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
    pattern: 'none',
    tiles: 'flat',
    orbAnim: 'still',
    accent: '#4cc9f0',
    accent2: '#4361ee',
    orbs: [
      { width: 300, height: 300, bg: '#1e3a5f', top: '-100px', left: '-50px' },
      { width: 250, height: 250, bg: '#2d4a6f', bottom: '-80px', right: '-40px', animationDelay: '-6s' }
    ]
  },
  nature: {
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)',
    pattern: 'dots',
    tiles: 'leaf',
    orbAnim: 'drift',
    accent: '#52b788',
    accent2: '#f4a261',
    orbs: [
      { width: 350, height: 350, bg: '#52b788', top: '-100px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#f4a261', bottom: '-80px', right: '-60px', animationDelay: '-7s' },
      { width: 250, height: 250, bg: '#e76f51', top: '30%', right: '10%', animationDelay: '-9s' }
    ]
  },
  neon: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
    pattern: 'grid',
    tiles: 'outline',
    orbAnim: 'pulse',
    accent: '#ff00ff',
    accent2: '#00ffff',
    orbs: [
      { width: 400, height: 400, bg: '#ff00ff', top: '-150px', left: '-100px', animationDelay: '-2s' },
      { width: 350, height: 350, bg: '#00ffff', bottom: '-120px', right: '-80px', animationDelay: '-5s' },
      { width: 300, height: 300, bg: '#ffff00', top: '20%', right: '15%', animationDelay: '-8s' },
      { width: 250, height: 250, bg: '#00ff00', bottom: '10%', left: '20%', animationDelay: '-10s' }
    ]
  },
  sunset: {
    bg: 'linear-gradient(135deg, #2b1055 0%, #7597de 50%, #2b1055 100%)',
    pattern: 'bands',
    tiles: 'ember',
    orbAnim: 'pulse',
    accent: '#ff8c42',
    accent2: '#ff3c68',
    orbs: [
      { width: 420, height: 420, bg: '#ff8c42', top: '-120px', left: '-80px', animationDelay: '-2s' },
      { width: 360, height: 360, bg: '#ff3c68', bottom: '-110px', right: '-70px', animationDelay: '-5s' },
      { width: 300, height: 300, bg: '#ffd166', top: '35%', right: '18%', animationDelay: '-9s' },
      { width: 220, height: 220, bg: '#c04cfd', bottom: '12%', left: '22%', animationDelay: '-12s' }
    ]
  },
  ocean: {
    bg: 'linear-gradient(160deg, #0f2027 0%, #203a43 40%, #2c5364 70%, #0f2027 100%)',
    pattern: 'waves',
    tiles: 'bubble',
    orbAnim: 'drift',
    accent: '#48cae4',
    accent2: '#0077b6',
    orbs: [
      { width: 400, height: 400, bg: '#00b4d8', top: '-130px', right: '-90px', animationDelay: '-3s' },
      { width: 340, height: 340, bg: '#0077b6', bottom: '-100px', left: '-60px', animationDelay: '-7s' },
      { width: 260, height: 260, bg: '#90e0ef', top: '30%', left: '30%', animationDelay: '-10s' }
    ]
  },
  candy: {
    bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 45%, #e1bee7 100%)',
    color: true,
    pattern: 'dots',
    tiles: 'sticker',
    orbAnim: 'drift',
    accent: '#ec6ea5',
    accent2: '#b388eb',
    orbs: [
      { width: 380, height: 380, bg: '#f48fb1', top: '-120px', left: '-90px', animationDelay: '-2s' },
      { width: 320, height: 320, bg: '#b39ddb', bottom: '-90px', right: '-70px', animationDelay: '-6s' },
      { width: 260, height: 260, bg: '#80deea', top: '35%', right: '15%', animationDelay: '-9s' }
    ]
  },
  coffee: {
    bg: 'linear-gradient(135deg, #2c1a12 0%, #4b2e1e 50%, #2c1a12 100%)',
    pattern: 'diag',
    tiles: 'mocha',
    orbAnim: 'still',
    accent: '#d7a86e',
    accent2: '#a9746e',
    orbs: [
      { width: 380, height: 380, bg: '#a9746e', top: '-110px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#d7a86e', bottom: '-80px', right: '-60px', animationDelay: '-7s' },
      { width: 240, height: 240, bg: '#6f4e37', top: '40%', left: '35%', animationDelay: '-11s' }
    ]
  },
  aurora: {
    bg: 'linear-gradient(180deg, #031b34 0%, #07294d 55%, #031b34 100%)',
    pattern: 'none',
    tiles: 'glow',
    orbAnim: 'drift',
    accent: '#00ffa3',
    accent2: '#03e1ff',
    orbs: [
      { width: 450, height: 450, bg: '#00ffa3', top: '-140px', left: '10%', animationDelay: '-2s' },
      { width: 400, height: 400, bg: '#03e1ff', top: '20%', right: '-100px', animationDelay: '-6s' },
      { width: 350, height: 350, bg: '#dc1fff', bottom: '-120px', left: '-80px', animationDelay: '-9s' }
    ]
  },
  light: {
    bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    color: true,
    pattern: 'dots',
    tiles: 'soft',
    orbAnim: 'still',
    accent: '#5a8dee',
    accent2: '#9b5de5',
    orbs: [
      { width: 360, height: 360, bg: '#a1c4fd', top: '-110px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#c2ffd8', bottom: '-90px', right: '-60px', animationDelay: '-7s' }
    ]
  }
};

const THEME_LABELS = {
  gradient: 'Градиент',
  dark: 'Тёмный',
  light: 'Светлый',
  nature: 'Природа',
  neon: 'Неон',
  sunset: 'Закат',
  ocean: 'Океан',
  candy: 'Карамель',
  coffee: 'Кофе',
  aurora: 'Аврора'
};

let bg, themePicker, themeBtn, themeBtnSwatch, themeBtnLabel, themeMenu;
let currentBg = 'gradient';
let committedBg = 'gradient';

export { currentBg };

function syncButton() {
  const theme = BG_THEMES[currentBg];
  themeBtnLabel.textContent = THEME_LABELS[currentBg] || currentBg;
  themeBtnSwatch.style.background = theme ? theme.bg : '';
}

function syncMenuActive() {
  themeMenu.querySelectorAll('.theme-item').forEach(item => {
    item.classList.toggle('active', item.dataset.theme === committedBg);
  });
}

function buildMenu() {
  themeMenu.innerHTML = '';
  Object.keys(BG_THEMES).forEach(key => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'theme-item';
    item.dataset.theme = key;
    item.setAttribute('role', 'option');

    const swatch = document.createElement('span');
    swatch.className = 'theme-swatch';
    swatch.style.background = BG_THEMES[key].bg;

    const name = document.createElement('span');
    name.className = 'theme-name';
    name.textContent = THEME_LABELS[key] || key;

    const check = document.createElement('span');
    check.className = 'theme-check';
    check.textContent = '✓';

    item.append(swatch, name, check);

    item.addEventListener('mouseenter', () => {
      if (key !== currentBg) renderTheme(key);
    });

    item.addEventListener('click', () => {
      committedBg = key;
      applyTheme(key);
      saveTheme(key);
      closeMenu();
    });

    themeMenu.appendChild(item);
  });
}

function openMenu() {
  buildMenu();
  syncMenuActive();
  themeMenu.hidden = false;
  themePicker.classList.add('open');
}

function closeMenu() {
  if (themeMenu.hidden) return;
  if (currentBg !== committedBg) renderTheme(committedBg);
  themeMenu.hidden = true;
  themePicker.classList.remove('open');
}

function renderTheme(themeName) {
  currentBg = themeName;
  const theme = BG_THEMES[themeName];
  bg.style.background = theme.bg;
  bg.dataset.pattern = theme.pattern || 'grid';
  bg.dataset.orbAnim = theme.orbAnim || 'float';
  document.body.dataset.tiles = theme.tiles || 'glass';

  theme.orbs.forEach((orb, i) => {
    const orbEl = bg.querySelector(`.orb${i + 1}`);
    if (orbEl) {
      orbEl.style.width = orb.width + 'px';
      orbEl.style.height = orb.height + 'px';
      orbEl.style.background = orb.bg;
      if (orb.animationDelay) orbEl.style.animationDelay = orb.animationDelay;
      orbEl.style.opacity = theme.color ? '0.4' : '';
    }
  });

  syncButton();

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--accent', theme.accent || '#ff5e62');
  rootStyle.setProperty('--accent2', theme.accent2 || '#7909a4');

  document.body.classList.toggle('light-ui', !!theme.color);
  document.body.style.color = theme.color ? '#333' : '#fff';
}

function saveTheme(themeName) {
  chrome.storage.local.set({ goGoBg: themeName });
}

export function loadSavedTheme() {
  chrome.storage.local.get('goGoBg', result => {
    const saved = result.goGoBg;
    if (saved && BG_THEMES[saved]) {
      currentBg = saved;
      applyTheme(currentBg);
    }
  });
}

export function applyTheme(themeName) {
  currentBg = themeName;
  committedBg = themeName;
  renderTheme(themeName);
  syncMenuActive();
}

export function initThemes() {
  bg = document.getElementById('bg');
  themePicker = document.getElementById('themePicker');
  themeBtn = document.getElementById('themeBtn');
  themeBtnSwatch = document.getElementById('themeBtnSwatch');
  themeBtnLabel = document.getElementById('themeBtnLabel');
  themeMenu = document.getElementById('themeMenu');

  themeBtn.addEventListener('click', e => {
    e.stopPropagation();
    themeMenu.hidden ? openMenu() : closeMenu();
  });

  themeMenu.addEventListener('mouseleave', () => {
    if (!themeMenu.hidden && currentBg !== committedBg) renderTheme(committedBg);
  });

  document.addEventListener('mousedown', e => {
    if (!e.target.closest('#themePicker')) closeMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}
