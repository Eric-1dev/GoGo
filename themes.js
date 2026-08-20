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
    orbs: [
      { width: 300, height: 300, bg: '#1e3a5f', top: '-100px', left: '-50px' },
      { width: 250, height: 250, bg: '#2d4a6f', bottom: '-80px', right: '-40px', animationDelay: '-6s' }
    ]
  },
  nature: {
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #134e5e 100%)',
    orbs: [
      { width: 350, height: 350, bg: '#52b788', top: '-100px', left: '-80px', animationDelay: '-3s' },
      { width: 300, height: 300, bg: '#f4a261', bottom: '-80px', right: '-60px', animationDelay: '-7s' },
      { width: 250, height: 250, bg: '#e76f51', top: '30%', right: '10%', animationDelay: '-9s' }
    ]
  },
  neon: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
    orbs: [
      { width: 400, height: 400, bg: '#ff00ff', top: '-150px', left: '-100px', animationDelay: '-2s' },
      { width: 350, height: 350, bg: '#00ffff', bottom: '-120px', right: '-80px', animationDelay: '-5s' },
      { width: 300, height: 300, bg: '#ffff00', top: '20%', right: '15%', animationDelay: '-8s' },
      { width: 250, height: 250, bg: '#00ff00', bottom: '10%', left: '20%', animationDelay: '-10s' }
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

  // Обновляем орбы
  theme.orbs.forEach((orb, i) => {
    const orbEl = bg.querySelector(`.orb${i + 1}`);
    if (orbEl) {
      orbEl.style.width = orb.width + 'px';
      orbEl.style.height = orb.height + 'px';
      orbEl.style.background = orb.bg;
      if (orb.animationDelay) orbEl.style.animationDelay = orb.animationDelay;
      if (theme.color) orbEl.style.opacity = '0.4';
    }
  });

  // Обновляем выбранную тему
  themeSelect.value = themeName;

  // Меняем цвет текста для светлой темы
  if (themeName === 'light') {
    document.body.style.color = '#333';
  } else {
    document.body.style.color = '#fff';
  }
}

themeSelect.addEventListener('change', () => {
  const theme = themeSelect.value;
  if (BG_THEMES[theme]) {
    applyTheme(theme);
    saveTheme(theme);
  }
});