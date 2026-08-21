// Варианты фонов
const BG_THEMES = {
  gradient: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 75%, #1a1a2e 100%)',
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
    orbs: [
      { width: 300, height: 300, bg: '#1e3a5f', top: '-100px', left: '-50px' },
      { width: 250, height: 250, bg: '#2d4a6f', bottom: '-80px', right: '-40px', animationDelay: '-6s' }
    ]
  },
  nature: {
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)',
    pattern: 'dots',
    tiles: 'glass',
    orbAnim: 'drift',
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
    tiles: 'glass',
    orbAnim: 'pulse',
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
    tiles: 'glass',
    orbAnim: 'drift',
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
    orbs: [
      { width: 380, height: 380, bg: '#f48fb1', top: '-120px', left: '-90px', animationDelay: '-2s' },
      { width: 320, height: 320, bg: '#b39ddb', bottom: '-90px', right: '-70px', animationDelay: '-6s' },
      { width: 260, height: 260, bg: '#80deea', top: '35%', right: '15%', animationDelay: '-9s' }
    ]
  },
  coffee: {
    bg: 'linear-gradient(135deg, #2c1a12 0%, #4b2e1e 50%, #2c1a12 100%)',
    pattern: 'diag',
    tiles: 'flat',
    orbAnim: 'still',
    orbs: [
      { width: 380, height: 380, bg: '#a9746e', top: '-110px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#d7a86e', bottom: '-80px', right: '-60px', animationDelay: '-7s' },
      { width: 240, height: 240, bg: '#6f4e37', top: '40%', left: '35%', animationDelay: '-11s' }
    ]
  },
  aurora: {
    bg: 'linear-gradient(180deg, #031b34 0%, #07294d 55%, #031b34 100%)',
    pattern: 'none',
    tiles: 'glass',
    orbAnim: 'drift',
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
    orbs: [
      { width: 360, height: 360, bg: '#a1c4fd', top: '-110px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#c2ffd8', bottom: '-90px', right: '-60px', animationDelay: '-7s' }
    ]
  }
};

let currentBg = 'gradient';

const bg = document.getElementById('bg');
const themeSelect = document.getElementById('themeSelect');

export { currentBg };

// Загружаем сохранённую тему из chrome.storage
export function loadSavedTheme() {
  chrome.storage.local.get('goGoBg', result => {
    const saved = result.goGoBg;
    if (saved && BG_THEMES[saved]) {
      currentBg = saved;
      applyTheme(currentBg);
    } else {
      themeSelect.value = currentBg;
    }
  });
}

// Сохраняем тему в chrome.storage
export function saveTheme(themeName) {
  chrome.storage.local.set({ goGoBg: themeName });
}

export function applyTheme(themeName) {
  currentBg = themeName;
  const theme = BG_THEMES[themeName];
  bg.style.background = theme.bg;
  bg.dataset.pattern = theme.pattern || 'grid';
  bg.dataset.orbAnim = theme.orbAnim || 'float';
  document.body.dataset.tiles = theme.tiles || 'glass';

  // Обновляем орбы
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

  // Обновляем выбранную тему
  themeSelect.value = themeName;

  // Меняем цвет текста и UI для светлых тем
  document.body.classList.toggle('light-ui', !!theme.color);
  document.body.style.color = theme.color ? '#333' : '#fff';
}

themeSelect.addEventListener('change', () => {
  const theme = themeSelect.value;
  if (BG_THEMES[theme]) {
    applyTheme(theme);
    saveTheme(theme);
  }
});